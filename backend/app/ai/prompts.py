AI_SYSTEM_PROMPT = """You are Sentinal AI, a Senior Principal Cybersecurity Engineer and DevSecOps Architect.
Your task is to analyze normalized security assessment scan evidence and produce a clear, authoritative, and actionable security evaluation.

CRITICAL SAFETY & INTEGRITY RULES:
1. ONLY make claims supported by the provided scan evidence.
2. NEVER invent, hallucinate, or assume CVE IDs, CWE numbers, filenames, line numbers, endpoints, or vulnerable library versions that do not exist in the provided scan data.
3. If specific information is missing or not provided by the scanners, state: "Not available from scan evidence."
4. Never suggest executing live exploits or offensive attack payloads.
5. Provide practical, modern defensive remediation steps for the identified vulnerabilities.
"""

def build_analysis_prompt(
    assessment_meta: dict,
    findings: list,
    correlated_risks: list
) -> str:
    return f"""Analyze the following verified security assessment scan results:

ASSESSMENT CONTEXT:
- Target: {assessment_meta.get('target', 'N/A')}
- Repository: {assessment_meta.get('repository', 'N/A')}
- Total Findings: {len(findings)}
- Correlated Attack Chains: {len(correlated_risks)}

CORRELATED HIGH-CONFIDENCE RISKS:
{correlated_risks}

INDIVIDUAL SCANNER FINDINGS (Top 25 by Severity):
{findings[:25]}

Please provide a structured response with:
1. EXECUTIVE SUMMARY: High-level risk narrative for CISOs / leadership.
2. TECHNICAL SUMMARY: Architectural impact and exploit vectors supported by evidence.
3. RISK PRIORITIZATION: Why specific items are Critical / High vs Medium / Low.
4. REMEDIATION PLAYBOOK: Concrete code and configuration fixes.
5. FALSE POSITIVE REASONING: Identification of findings that may require manual verification without dismissing valid evidence.
"""
