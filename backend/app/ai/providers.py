import json
import httpx
from typing import Dict, Any, List, Optional
from app.ai.base import AIProvider, AIAnalysisResult
from app.ai.prompts import AI_SYSTEM_PROMPT, build_analysis_prompt
from app.config import settings

class ExpertRuleAIProvider(AIProvider):
    """Built-in deterministic cybersecurity reasoning engine for zero-dependency offline intelligence."""
    def __init__(self):
        super().__init__(name="sentinal-expert-engine")

    async def analyze(
        self,
        assessment_meta: Dict[str, Any],
        findings_summary: List[Dict[str, Any]],
        correlated_risks: List[Dict[str, Any]]
    ) -> AIAnalysisResult:
        crit_count = sum(1 for f in findings_summary if f.get("severity") == "CRITICAL")
        high_count = sum(1 for f in findings_summary if f.get("severity") == "HIGH")
        med_count = sum(1 for f in findings_summary if f.get("severity") == "MEDIUM")
        low_count = sum(1 for f in findings_summary if f.get("severity") == "LOW")
        total = len(findings_summary)

        target_name = assessment_meta.get("target") or assessment_meta.get("repository") or "Target Asset"

        # 1. Executive Summary
        if crit_count > 0 or len(correlated_risks) > 0:
            exec_posture = "CRITICAL POSTURE"
            exec_tone = f"The automated assessment of {target_name} identified immediate critical exposures requiring urgent remediation. A total of {total} findings were recorded, including {crit_count} Critical and {high_count} High severity vulnerabilities."
        elif high_count > 0:
            exec_posture = "ELEVATED RISK"
            exec_tone = f"The assessment revealed notable security weaknesses across {target_name}, comprising {high_count} High and {med_count} Medium issues."
        else:
            exec_posture = "MODERATE POSTURE"
            exec_tone = f"The assessment identified {total} security items, mostly of Medium, Low, or Informational severity with no critical remote exploit chains detected."

        exec_summary = f"""**Security Assessment Executive Summary**
**Overall Posture:** {exec_posture}
{exec_tone}

**Key Risk Highlights:**
- Total Discovered Findings: {total} (Critical: {crit_count}, High: {high_count}, Medium: {med_count}, Low: {low_count})
- Correlated Exploit Chains: {len(correlated_risks)}
- Primary Concern Areas: {', '.join(set([f.get('category', 'General') for f in findings_summary[:5]])) or 'None'}

Leadership is advised to authorize immediate sprint allocation for remediation of critical issues and enforce automated security gating in CI/CD pipelines."""

        # 2. Technical Summary
        tech_lines = [
            f"### Technical Risk Breakdown for {target_name}",
            f"The assessment executed multi-modal analysis across SAST, SCA, Secret Scanning, DAST, Web Exposure, and TLS configurations."
        ]
        if correlated_risks:
            tech_lines.append("\n**Correlated Multi-Vector Attack Chains:**")
            for cr in correlated_risks:
                tech_lines.append(f"- **{cr.get('title')}** ({cr.get('risk_level')}, Confidence: {cr.get('confidence')}): {cr.get('description')}")
        
        top_findings = sorted(findings_summary, key=lambda x: {"CRITICAL": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1}.get(x.get("severity"), 0), reverse=True)[:5]
        if top_findings:
            tech_lines.append("\n**Top Significant Technical Findings:**")
            for f in top_findings:
                loc = f" in `{f.get('file')}:{f.get('line')}`" if f.get('file') else (f" on `{f.get('endpoint')}`" if f.get('endpoint') else "")
                tech_lines.append(f"- **[{f.get('severity')}] {f.get('title')}**{loc}: {f.get('description')[:140]}...")

        tech_summary = "\n".join(tech_lines)

        # 3. Risk Prioritization
        risk_prioritization = f"""**Vulnerability Prioritization Matrix:**
1. **Tier 1 (Immediate / Blockers - Critical):** Address {crit_count} Critical vulnerabilities and {len(correlated_risks)} correlated chains immediately. These represent verified remote execution, full database extraction, or leaked root cloud credentials.
2. **Tier 2 (High Priority - Next Sprint):** Remediate {high_count} High-severity findings including unverified injection flaws, missing rate limiting, and vulnerable third-party dependencies.
3. **Tier 3 (Medium/Low Defense-in-Depth):** Address missing security headers (CSP, HSTS), weak cipher configurations, and deprecated cookie attributes during standard release cycles."""

        # 4. Remediation Playbook
        remediation_lines = ["**Step-by-Step Remediation Actions:**"]
        categories_seen = set()
        for f in top_findings:
            cat = f.get("category", "General")
            if cat not in categories_seen:
                categories_seen.add(cat)
                rem = f.get("remediation") or "Apply standard secure coding practices."
                remediation_lines.append(f"- **{cat}:** {rem}")
        if not categories_seen:
            remediation_lines.append("- Maintain regular dependency updates and automated vulnerability scanning.")

        remediation_playbook = "\n".join(remediation_lines)

        # 5. False Positive Analysis
        fp_analysis = """**False-Positive & Manual Verification Guidance:**
- Findings identified by heuristic pattern matching (e.g. potential path traversal or generic SQL queries) should be manually cross-checked against internal data sanitization middleware before marking as resolved.
- DAST alerts triggered by error messages should be confirmed in a staging environment to rule out custom application error handling false triggers."""

        return AIAnalysisResult(
            executive_summary=exec_summary,
            technical_summary=tech_summary,
            risk_prioritization=risk_prioritization,
            remediation_playbook=remediation_playbook,
            false_positive_analysis=fp_analysis,
            provider_used=self.name
        )

class OpenAIProvider(AIProvider):
    def __init__(self, api_key: str, model: str = "gpt-4o-mini", base_url: Optional[str] = None):
        super().__init__(name="openai")
        self.api_key = api_key
        self.model = model
        self.base_url = (base_url or "https://api.openai.com/v1").rstrip("/")

    async def analyze(
        self,
        assessment_meta: Dict[str, Any],
        findings_summary: List[Dict[str, Any]],
        correlated_risks: List[Dict[str, Any]]
    ) -> AIAnalysisResult:
        user_prompt = build_analysis_prompt(assessment_meta, findings_summary, correlated_risks)
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": AI_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.2
        }

        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                resp = await client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    content = data["choices"][0]["message"]["content"]
                    
                    # Parse sections or format into structured result
                    return AIAnalysisResult(
                        executive_summary=content[:800],
                        technical_summary=content,
                        risk_prioritization="AI Generated Risk Prioritization based on verified scan evidence.",
                        remediation_playbook="See technical summary for detailed remediation.",
                        false_positive_analysis="Manual verification recommended for unconfirmed heuristic findings.",
                        provider_used=f"openai/{self.model}"
                    )
        except Exception:
            pass

        # Fallback to expert engine if API call fails
        fallback = ExpertRuleAIProvider()
        return await fallback.analyze(assessment_meta, findings_summary, correlated_risks)

class GeminiProvider(AIProvider):
    def __init__(self, api_key: str, model: str = "gemini-1.5-flash"):
        super().__init__(name="gemini")
        self.api_key = api_key
        self.model = model

    async def analyze(
        self,
        assessment_meta: Dict[str, Any],
        findings_summary: List[Dict[str, Any]],
        correlated_risks: List[Dict[str, Any]]
    ) -> AIAnalysisResult:
        user_prompt = build_analysis_prompt(assessment_meta, findings_summary, correlated_risks)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        payload = {
            "contents": [{"parts": [{"text": f"{AI_SYSTEM_PROMPT}\n\n{user_prompt}"}]}]
        }

        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    text = data["candidates"][0]["content"]["parts"][0]["text"]
                    return AIAnalysisResult(
                        executive_summary=text[:800],
                        technical_summary=text,
                        risk_prioritization="Gemini Risk Analysis based on scan findings.",
                        remediation_playbook="Review full Gemini remediation guidance.",
                        false_positive_analysis="Verify findings before dispositioning.",
                        provider_used=f"gemini/{self.model}"
                    )
        except Exception:
            pass

        fallback = ExpertRuleAIProvider()
        return await fallback.analyze(assessment_meta, findings_summary, correlated_risks)
