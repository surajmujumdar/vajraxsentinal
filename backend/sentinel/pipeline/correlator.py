from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.pipeline.normalizer import NormalizedFinding

class CorrelatedRiskItem(BaseModel):
    title: str
    description: str
    risk_level: str  # CRITICAL, HIGH, MEDIUM
    confidence: str  # VERY HIGH, HIGH, MEDIUM
    sast_finding_ids: List[str] = []
    dast_finding_ids: List[str] = []
    sca_finding_ids: List[str] = []
    secret_finding_ids: List[str] = []
    explanation: str
    attack_scenario: str
    remediation: str

def correlate_findings(findings: List[NormalizedFinding]) -> List[CorrelatedRiskItem]:
    """Correlate findings across SAST, DAST, SCA, and Secrets to surface high-confidence blended attack paths."""
    correlated: List[CorrelatedRiskItem] = []

    sast_findings = [f for f in findings if f.source == "SAST"]
    dast_findings = [f for f in findings if f.source in ["DAST", "WEB"]]
    sca_findings = [f for f in findings if f.source == "SCA"]
    secret_findings = [f for f in findings if f.source == "SECRETS"]

    # 1. Correlate SQL Injection (SAST Code Flow + DAST Runtime Trigger + SCA Database Driver)
    sast_sqli = [f for f in sast_findings if any(c in ["CWE-89", "CWE-943"] for c in f.cwe) or "sql" in f.title.lower()]
    dast_sqli = [f for f in dast_findings if any(c in ["CWE-89", "CWE-943"] for c in f.cwe) or "sql" in f.title.lower()]
    sca_db_vulns = [f for f in sca_findings if any(k in f.title.lower() for k in ["sql", "mysql", "postgres", "sqlite", "orm", "django", "sequelize"])]

    if sast_sqli and dast_sqli:
        sast_evidence_list = [f"- SAST finding in `{f.file}:{f.line}`: {f.title}" for f in sast_sqli]
        dast_evidence_list = [f"- DAST active confirmation on `{f.endpoint}` (param: `{f.parameter}`)" for f in dast_sqli]
        sca_evidence_list = [f"- SCA vulnerable driver: {f.title}" for f in sca_db_vulns]

        all_evidence = "\n".join(sast_evidence_list + dast_evidence_list + sca_evidence_list)
        
        correlated.append(CorrelatedRiskItem(
            title="Confirmed End-to-End SQL Injection Vulnerability",
            description="Static analysis detected an unparameterized SQL query in source code, while active dynamic testing verified remote exploitability on the live HTTP endpoint.",
            risk_level="CRITICAL",
            confidence="VERY HIGH",
            sast_finding_ids=[f.fingerprint for f in sast_sqli],
            dast_finding_ids=[f.fingerprint for f in dast_sqli],
            sca_finding_ids=[f.fingerprint for f in sca_db_vulns],
            explanation=f"Vulnerability verified from source code logic through live application execution:\n{all_evidence}",
            attack_scenario="An unauthenticated attacker can supply crafted SQL injection payloads via exposed query parameters, bypassing authentication, reading proprietary database records, and modifying system tables.",
            remediation="1. Immediately convert all string-concatenated SQL queries in identified source files to parameterized statements.\n2. Apply input validation and Web Application Firewall (WAF) filtering on vulnerable endpoints."
        ))

    # 2. Correlate Cross-Site Scripting (SAST DOM/Template XSS + DAST Reflected XSS)
    sast_xss = [f for f in sast_findings if "CWE-79" in f.cwe or "xss" in f.title.lower()]
    dast_xss = [f for f in dast_findings if "CWE-79" in f.cwe or "xss" in f.title.lower()]

    if sast_xss and dast_xss:
        sast_ev = [f"- SAST XSS sink in `{f.file}:{f.line}`" for f in sast_xss]
        dast_ev = [f"- DAST reflected payload on endpoint `{f.endpoint}`" for f in dast_xss]

        correlated.append(CorrelatedRiskItem(
            title="Confirmed Cross-Site Scripting (XSS) Exploit Path",
            description="Unsafe DOM manipulation or unescaped template rendering in source code was confirmed to reflect injected script payloads in live runtime responses.",
            risk_level="HIGH",
            confidence="VERY HIGH",
            sast_finding_ids=[f.fingerprint for f in sast_xss],
            dast_finding_ids=[f.fingerprint for f in dast_xss],
            explanation="Both static code analysis and dynamic testing confirmed that user inputs are reflected without proper HTML context encoding:\n" + "\n".join(sast_ev + dast_ev),
            attack_scenario="An attacker can craft malicious links containing JavaScript payloads to hijack user sessions, steal session cookies, or perform actions on behalf of authenticated victims.",
            remediation="1. Context-encode all dynamic values before rendering in HTML templates.\n2. Enforce a robust Content Security Policy (CSP) to restrict unauthorized script execution."
        ))

    # 3. Correlate Exposed Credentials + Live Information Disclosure
    if secret_findings and any(f.source in ["WEB", "DAST"] and "git" in f.title.lower() or "env" in f.title.lower() for f in dast_findings):
        dast_exp = [f for f in dast_findings if "git" in f.title.lower() or "env" in f.title.lower()]
        correlated.append(CorrelatedRiskItem(
            title="High-Risk Credential Leakage via Web Exposure",
            description="Hardcoded secrets detected in source code match publicly exposed configuration files or git metadata accessible on the live web server.",
            risk_level="CRITICAL",
            confidence="VERY HIGH",
            secret_finding_ids=[f.fingerprint for f in secret_findings],
            dast_finding_ids=[f.fingerprint for f in dast_exp],
            explanation="Credentials discovered in source code repository coincide with public file exposures on the web root.",
            attack_scenario="Threat actors can harvest secrets directly from exposed web files or reconstruct repository history, gaining full administrative or cloud account control.",
            remediation="1. Block access to `.git` and `.env` files in web server configuration immediately.\n2. Revoke and rotate all discovered API keys, database credentials, and access tokens."
        ))

    # 4. Correlate Vulnerable Dependency with Exposed Code Path
    for sca in sca_findings:
        if sca.severity == "CRITICAL" and any(c in ["CWE-502", "CWE-78", "CWE-94"] for c in sca.cwe):
            matching_sast = [s for s in sast_findings if any(c in s.cwe for c in sca.cwe)]
            if matching_sast:
                correlated.append(CorrelatedRiskItem(
                    title=f"Critical Exploit Chain: Vulnerable Package ({sca.title}) Used in Unsafe Code Flow",
                    description=f"A critical third-party dependency vulnerability ({', '.join(sca.cves) or sca.title}) is paired with an unvalidated data sink in application source code.",
                    risk_level="CRITICAL",
                    confidence="HIGH",
                    sast_finding_ids=[s.fingerprint for s in matching_sast],
                    sca_finding_ids=[sca.fingerprint],
                    explanation=f"Dependency '{sca.title}' with known CVEs is directly utilized in source file '{matching_sast[0].file}'.",
                    attack_scenario="An attacker can trigger the third-party CVE through user-controllable application inputs, achieving Remote Code Execution.",
                    remediation=f"Upgrade '{sca.title}' immediately and sanitize input passed to downstream libraries."
                ))
                break

    return correlated
