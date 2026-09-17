import asyncio
import os
import shutil
import zipfile
import io
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, Optional
import httpx
from sqlalchemy.orm import Session

from app.config import settings
from app.core.database import SessionLocal
from app.core.logging import logger
from app.models import Assessment, ScanJob, Finding, CorrelatedRisk, Report, Project
from app.scanners.runner import ScannerOrchestrator
from app.pipeline import (
    normalize_findings_list,
    deduplicate_findings,
    correlate_findings,
    apply_risk_scoring
)
from app.ai import ai_engine
from app.reports import report_generator

def update_assessment_log(db: Session, assessment_id: str, stage: str, message: str, status: Optional[str] = None):
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if assessment:
        current_logs = list(assessment.logs or [])
        current_logs.append({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "stage": stage,
            "message": message
        })
        assessment.logs = current_logs
        if status:
            assessment.status = status
        db.commit()

async def download_github_repo(repo_url: str, branch: Optional[str], token: Optional[str], dest_dir: Path) -> bool:
    """Download or clone GitHub/Git repository archive with multi-tier fault tolerance."""
    dest_dir.mkdir(parents=True, exist_ok=True)
    clean_url = repo_url.strip().rstrip("/")
    if clean_url.endswith(".git"):
        clean_url = clean_url[:-4]

    # Tier 1: Fast Git Shallow Clone (Handles any default branch - main, master, harpoon2, dev, etc.)
    try:
        git_cmd = ["git", "clone", "--depth", "1"]
        if branch and branch.strip() and branch.strip() not in ["main", "master", "HEAD"]:
            git_cmd.extend(["--branch", branch.strip()])
        clone_target = repo_url if repo_url.endswith(".git") else f"{clean_url}.git"
        git_cmd.extend([clone_target, str(dest_dir)])

        proc = await asyncio.create_subprocess_exec(
            *git_cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=60)
        if proc.returncode == 0 and any(dest_dir.iterdir()):
            logger.info(f"Successfully cloned repository {repo_url} via git clone")
            return True
    except Exception as e:
        logger.warning(f"Git clone failed, falling back to HTTP archive downloads: {e}")

    # Tier 2: HTTP Zipball / Archive Fallbacks
    parts = clean_url.split("/")
    if len(parts) >= 2:
        owner = parts[-2]
        repo = parts[-1]
        
        target_branches = []
        if branch and branch.strip():
            target_branches.append(branch.strip())
        target_branches.extend(["main", "master", "HEAD"])
        target_branches = list(dict.fromkeys(target_branches))

        candidate_urls = [
            f"https://api.github.com/repos/{owner}/{repo}/zipball",
        ]
        for b in target_branches:
            candidate_urls.append(f"https://api.github.com/repos/{owner}/{repo}/zipball/{b}")
            candidate_urls.append(f"https://github.com/{owner}/{repo}/archive/refs/heads/{b}.zip")
            candidate_urls.append(f"https://codeload.github.com/{owner}/{repo}/zip/refs/heads/{b}")
        candidate_urls.append(f"https://github.com/{owner}/{repo}/archive/HEAD.zip")
        candidate_urls.append(f"https://codeload.github.com/{owner}/{repo}/zip/HEAD")

        headers = {
            "Accept": "application/vnd.github.v3+json, application/octet-stream, */*",
            "User-Agent": "Sentinel-Assessment-Engine/2.0"
        }
        if token:
            headers["Authorization"] = f"token {token}"

        try:
            async with httpx.AsyncClient(timeout=60.0, follow_redirects=True) as client:
                for url in candidate_urls:
                    try:
                        resp = await client.get(url, headers=headers)
                        if resp.status_code == 200 and len(resp.content) > 100:
                            with zipfile.ZipFile(io.BytesIO(resp.content)) as z:
                                z.extractall(dest_dir)
                            
                            # Flatten if all files were extracted into a single subdirectory
                            items = list(dest_dir.iterdir())
                            if len(items) == 1 and items[0].is_dir():
                                sub = items[0]
                                for sub_item in list(sub.iterdir()):
                                    shutil.move(str(sub_item), str(dest_dir / sub_item.name))
                                sub.rmdir()
                            
                            logger.info(f"Successfully downloaded repo archive from {url}")
                            return True
                    except Exception:
                        continue
        except Exception as e:
            logger.error(f"HTTP archive download error: {e}")

    return False

async def run_assessment_job(assessment_id: str):
    """Main asynchronous assessment executor state machine."""
    db: Session = SessionLocal()
    orchestrator = ScannerOrchestrator()
    workspace_path: Optional[Path] = None

    try:
        assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
        if not assessment:
            logger.error(f"Assessment {assessment_id} not found in database.")
            return

        assessment.started_at = datetime.now(timezone.utc)
        assessment.status = "INITIALIZING"
        db.commit()
        update_assessment_log(db, assessment_id, "INITIALIZING", "Initializing Sentinel Assessment Worker...", "INITIALIZING")

        project = db.query(Project).filter(Project.id == assessment.project_id).first()
        project_name = project.name if project else "Target Project"

        repo_info = assessment.repository_info or {}
        target_info = assessment.target_info or {}
        modules = assessment.modules or {}

        # Auto-detect if target URL is a GitHub/Git repository
        raw_target_url = str(target_info.get("url") or "").strip()
        raw_repo_url = str(repo_info.get("url") or "").strip()

        if ("github.com" in raw_target_url or "gitlab.com" in raw_target_url or raw_target_url.endswith(".git")) and not raw_repo_url:
            raw_repo_url = raw_target_url
            repo_info["url"] = raw_target_url
            # Enable SAST, SCA, Secrets for Git repositories
            modules["sast"] = modules.get("sast", True)
            modules["sca"] = modules.get("sca", True)
            modules["secrets"] = modules.get("secrets", True)

        # 1. Setup Source Code Target if applicable
        repo_or_code_target = None
        if raw_repo_url or repo_info.get("zip_path") or repo_info.get("source_path"):
            workspace_path = settings.WORKSPACE_DIR / f"assessment_{assessment_id}"
            workspace_path.mkdir(parents=True, exist_ok=True)

            if raw_repo_url:
                update_assessment_log(db, assessment_id, "CLONING", f"Retrieving Git repository from {raw_repo_url}...", "CLONING")
                success = await download_github_repo(
                    repo_url=raw_repo_url,
                    branch=repo_info.get("branch"),
                    token=repo_info.get("token"),
                    dest_dir=workspace_path
                )
                if success:
                    update_assessment_log(db, assessment_id, "DISCOVERING", "Repository source tree retrieved and indexed successfully.", "DISCOVERING")
                    repo_or_code_target = workspace_path
                else:
                    update_assessment_log(db, assessment_id, "DISCOVERING", "Could not download remote repository archive. Continuing with remaining modules.")

            elif repo_info.get("zip_path"):
                zip_p = Path(repo_info["zip_path"])
                if zip_p.exists():
                    update_assessment_log(db, assessment_id, "DISCOVERING", "Extracting uploaded source code archive...", "DISCOVERING")
                    with zipfile.ZipFile(zip_p) as z:
                        z.extractall(workspace_path)
                    repo_or_code_target = workspace_path

            elif repo_info.get("source_path"):
                src_p = Path(repo_info["source_path"])
                if src_p.exists():
                    repo_or_code_target = src_p

        # 2. Setup Live URL Target if applicable (skip DAST web ping if it's purely a GitHub repo URL)
        live_target = None
        if raw_target_url and not ("github.com" in raw_target_url or "gitlab.com" in raw_target_url):
            live_target = target_info
            from app.scanners.web.diagnostics import TargetDiagnosticsEngine
            diag_engine = TargetDiagnosticsEngine()
            update_assessment_log(db, assessment_id, "DIAGNOSTICS", f"Running target connectivity & WAF blocking diagnostics on {raw_target_url}...", "DISCOVERING")
            diag_res = await diag_engine.analyze_target(raw_target_url, target_info.get("custom_headers"))
            
            ips_str = ", ".join(diag_res.get("ip_addresses", [])) or "None"
            waf_name = diag_res.get("waf_name", "None")
            status_desc = diag_res.get("blocking_reason", "")
            
            update_assessment_log(db, assessment_id, "DIAGNOSTICS", f"Target Diagnostic Result: {diag_res.get('blocking_status')} (IPs: {ips_str} | WAF: {waf_name} | Latency: {diag_res.get('response_time_ms')}ms). {status_desc}")
            if diag_res.get("recommendations"):
                for rec in diag_res["recommendations"]:
                    update_assessment_log(db, assessment_id, "DIAGNOSTICS", f"Diagnostic Guidance: {rec}")

        # 3. Define progress tracking callback
        async def progress_tracker(module_key: str, status_val: str, err: Optional[str] = None):
            status_map = {
                "sast": "SAST_RUNNING",
                "sca": "SCA_RUNNING",
                "secrets": "SECRET_SCAN_RUNNING",
                "dast": "DAST_RUNNING",
                "nuclei": "DAST_RUNNING",
                "ssl": "SSL_RUNNING",
                "headers": "DAST_RUNNING"
            }
            curr_state = status_map.get(module_key, "RUNNING")
            msg = f"Scanner module [{module_key}] status: {status_val}"
            if err:
                msg += f" (Note: {err})"
            update_assessment_log(db, assessment_id, curr_state, msg, curr_state if status_val == "RUNNING" else None)

        # 4. Execute Scanner Modules
        raw_results = await orchestrator.run_assessment_modules(
            modules_config=modules,
            repo_or_code_target=repo_or_code_target,
            live_target=live_target,
            progress_callback=progress_tracker
        )

        # Record scan jobs in DB
        all_raw_findings = []
        for r in raw_results:
            job = ScanJob(
                assessment_id=assessment_id,
                module_name=r.scanner_name,
                status=r.status,
                duration_ms=r.duration_ms,
                error_message=r.error_message,
                raw_results_count=len(r.findings),
                completed_at=datetime.now(timezone.utc)
            )
            db.add(job)
            all_raw_findings.extend(r.findings)
        db.commit()

        # 5. Normalization & Deduplication
        update_assessment_log(db, assessment_id, "NORMALIZING", f"Normalizing {len(all_raw_findings)} raw findings...", "NORMALIZING")
        normalized = normalize_findings_list(all_raw_findings)
        deduped = deduplicate_findings(normalized)
        update_assessment_log(db, assessment_id, "NORMALIZING", f"Deduplicated to {len(deduped)} unique findings.")

        # 6. Correlation Engine
        update_assessment_log(db, assessment_id, "CORRELATING", "Executing cross-engine finding correlation...", "CORRELATING")
        correlated = correlate_findings(deduped)
        if correlated:
            update_assessment_log(db, assessment_id, "CORRELATING", f"Identified {len(correlated)} correlated multi-vector attack chains!")

        # 7. Risk Engine Scoring
        overall_risk = apply_risk_scoring(deduped, correlated)

        # 7.5. Security Regression Engine
        update_assessment_log(db, assessment_id, "REGRESSION_ANALYSIS", "Performing security regression comparison...", "REGRESSION_ANALYSIS")
        from app.pipeline.regression import perform_regression_analysis
        deduped, regression_summary = perform_regression_analysis(
            db=db,
            project_id=assessment.project_id,
            current_assessment_id=assessment_id,
            current_findings=deduped,
            current_risk_score=overall_risk
        )
        assessment.regression_summary = regression_summary

        # 8. AI Analysis Layer
        update_assessment_log(db, assessment_id, "AI_ANALYSIS", "Running grounded AI risk analysis & remediation generation...", "AI_ANALYSIS")
        assessment_meta = {
            "id": assessment_id,
            "project_name": project_name,
            "assessment_type": assessment.assessment_type,
            "repository": repo_info.get("url") or (repo_info.get("zip_path") and "Source Code Archive") or "None",
            "target": target_info.get("url") or "None",
            "overall_risk_score": overall_risk,
            "critical_count": sum(1 for f in deduped if f.severity == "CRITICAL"),
            "high_count": sum(1 for f in deduped if f.severity == "HIGH"),
            "medium_count": sum(1 for f in deduped if f.severity == "MEDIUM"),
            "low_count": sum(1 for f in deduped if f.severity == "LOW"),
            "info_count": sum(1 for f in deduped if f.severity == "INFO")
        }
        ai_res = await ai_engine.analyze_assessment(
            assessment_id=assessment_id,
            assessment_meta=assessment_meta,
            findings=deduped,
            correlated_risks=correlated
        )

        # 9. Report Generation
        update_assessment_log(db, assessment_id, "GENERATING_REPORT", "Generating PDF, HTML, and JSON reports...", "GENERATING_REPORT")
        json_path = report_generator.generate_json_report(assessment_meta, deduped, correlated, ai_res)
        html_path = report_generator.generate_html_report(assessment_meta, deduped, correlated, ai_res)
        pdf_path = report_generator.generate_pdf_report(assessment_meta, deduped, correlated, ai_res)

        # 10. Persist Findings, Correlated Risks, and Reports to DB
        prev_f_map = {}
        if regression_summary.get("previous_assessment_id"):
            from app.models import Finding as FModel
            p_finds = db.query(FModel).filter(FModel.assessment_id == regression_summary["previous_assessment_id"]).all()
            prev_f_map = {pf.fingerprint: pf for pf in p_finds}

        for f in deduped:
            reg_status = "PERSISTENT" if f.fingerprint in prev_f_map else "NEW"
            finding_row = Finding(
                assessment_id=assessment_id,
                project_id=assessment.project_id,
                source=f.source,
                scanner=f.scanner,
                detected_by=f.detected_by or [f.scanner.upper()],
                regression_status=reg_status,
                title=f.title,
                description=f.description,
                severity=f.severity,
                confidence=f.confidence,
                category=f.category,
                cwe=f.cwe,
                cves=f.cves,
                owasp=f.owasp,
                file=f.file,
                line=f.line,
                code_snippet=f.code_snippet,
                endpoint=f.endpoint,
                parameter=f.parameter,
                evidence=f.evidence,
                remediation=f.remediation,
                references=f.references,
                fingerprint=f.fingerprint,
                risk_score=f.risk_score,
                raw_evidence=f.raw_evidence
            )
            db.add(finding_row)

        for cr in correlated:
            corr_row = CorrelatedRisk(
                assessment_id=assessment_id,
                title=cr.title,
                description=cr.description,
                risk_level=cr.risk_level,
                confidence=cr.confidence,
                sast_finding_ids=cr.sast_finding_ids,
                dast_finding_ids=cr.dast_finding_ids,
                sca_finding_ids=cr.sca_finding_ids,
                secret_finding_ids=cr.secret_finding_ids,
                explanation=cr.explanation,
                attack_scenario=cr.attack_scenario,
                remediation=cr.remediation
            )
            db.add(corr_row)

        if assessment.assessment_type == "repo" or (not live_target and repo_or_code_target):
            report_methodology = "Source Code Static Analysis (SAST), Software Composition Analysis (SCA), and Secret Detection"
        elif assessment.assessment_type == "source":
            report_methodology = "Static Application Security Testing (SAST), Dependency Analysis (SCA), and Hardcoded Secrets Audit"
        elif assessment.assessment_type == "dast" or (live_target and not repo_or_code_target):
            report_methodology = "Dynamic Application Security Testing (DAST), Active Web Probing, and SSL/TLS Configuration Audit"
        else:
            report_methodology = "Unified SAST + SCA + Secrets + DAST + Web + TLS multi-engine correlation"

        report_row = Report(
            assessment_id=assessment_id,
            project_id=assessment.project_id,
            executive_summary=ai_res.executive_summary,
            technical_summary=ai_res.technical_summary,
            ai_analysis=ai_res.model_dump(),
            methodology=report_methodology,
            distribution={"critical": assessment_meta["critical_count"], "high": assessment_meta["high_count"], "medium": assessment_meta["medium_count"], "low": assessment_meta["low_count"], "info": assessment_meta["info_count"]},
            file_path_html=str(html_path),
            file_path_pdf=str(pdf_path),
            file_path_json=str(json_path)
        )
        db.add(report_row)

        # Update Assessment Final Summary
        assessment.overall_risk_score = overall_risk
        assessment.critical_count = assessment_meta["critical_count"]
        assessment.high_count = assessment_meta["high_count"]
        assessment.medium_count = assessment_meta["medium_count"]
        assessment.low_count = assessment_meta["low_count"]
        assessment.info_count = assessment_meta["info_count"]
        assessment.total_findings = len(deduped)
        assessment.completed_at = datetime.now(timezone.utc)
        assessment.status = "COMPLETED"
        db.commit()

        update_assessment_log(db, assessment_id, "COMPLETED", f"Assessment completed successfully with Risk Score {overall_risk}/100.", "COMPLETED")
        logger.info(f"Assessment {assessment_id} completed successfully.")

    except Exception as e:
        logger.error(f"Assessment job {assessment_id} failed: {str(e)}", exc_info=True)
        if assessment:
            assessment.status = "FAILED"
            assessment.error_message = str(e)
            assessment.completed_at = datetime.now(timezone.utc)
            db.commit()
            update_assessment_log(db, assessment_id, "FAILED", f"Assessment failed: {str(e)}", "FAILED")
    finally:
        # Cleanup temporary workspace
        if workspace_path and workspace_path.exists():
            try:
                shutil.rmtree(workspace_path, ignore_errors=True)
            except Exception:
                pass
        db.close()
