import os
from typing import Dict, Any, List
from app.config import settings
from app.ai.base import AIProvider, AIAnalysisResult
from app.ai.providers import ExpertRuleAIProvider, OpenAIProvider, GeminiProvider
from app.pipeline.normalizer import NormalizedFinding
from app.pipeline.correlator import CorrelatedRiskItem

class AIEngine:
    def __init__(self):
        self.provider = self._init_provider()

    def _init_provider(self) -> AIProvider:
        provider_name = (settings.AI_PROVIDER or "expert").lower()

        if provider_name == "openai" and settings.AI_API_KEY:
            return OpenAIProvider(
                api_key=settings.AI_API_KEY,
                model=settings.AI_MODEL or "gpt-4o-mini",
                base_url=settings.AI_BASE_URL
            )
        elif provider_name == "gemini" and settings.AI_API_KEY:
            return GeminiProvider(
                api_key=settings.AI_API_KEY,
                model=settings.AI_MODEL or "gemini-1.5-flash"
            )
        else:
            return ExpertRuleAIProvider()

    async def analyze_assessment(
        self,
        assessment_id: str,
        assessment_meta: Dict[str, Any],
        findings: List[NormalizedFinding],
        correlated_risks: List[CorrelatedRiskItem]
    ) -> AIAnalysisResult:
        # Prepare sanitized summaries for prompt
        findings_summary = []
        for f in findings:
            findings_summary.append({
                "title": f.title,
                "severity": f.severity,
                "confidence": f.confidence,
                "category": f.category,
                "cwe": f.cwe,
                "cves": f.cves,
                "file": f.file,
                "line": f.line,
                "endpoint": f.endpoint,
                "parameter": f.parameter,
                "description": f.description[:300],
                "evidence": f.evidence[:200] if f.evidence else "",
                "remediation": f.remediation[:200] if f.remediation else ""
            })

        corr_summary = []
        for c in correlated_risks:
            corr_summary.append({
                "title": c.title,
                "risk_level": c.risk_level,
                "confidence": c.confidence,
                "description": c.description,
                "explanation": c.explanation,
                "attack_scenario": c.attack_scenario
            })

        # Run AI Provider
        analysis = await self.provider.analyze(
            assessment_meta=assessment_meta,
            findings_summary=findings_summary,
            correlated_risks=corr_summary
        )

        return analysis

ai_engine = AIEngine()
