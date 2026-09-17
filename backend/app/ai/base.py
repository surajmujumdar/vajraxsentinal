from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

class AIAnalysisResult(BaseModel):
    executive_summary: str
    technical_summary: str
    risk_prioritization: str
    remediation_playbook: str
    false_positive_analysis: str
    provider_used: str

class AIProvider(ABC):
    def __init__(self, name: str):
        self.name = name

    @abstractmethod
    async def analyze(
        self,
        assessment_meta: Dict[str, Any],
        findings_summary: List[Dict[str, Any]],
        correlated_risks: List[Dict[str, Any]]
    ) -> AIAnalysisResult:
        """Generate structured security analysis from grounded scan evidence."""
        pass
