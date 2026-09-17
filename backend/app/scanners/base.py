from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import time
import shutil
import os
from pathlib import Path

class RawFinding(BaseModel):
    scanner: str
    source: str
    title: str
    description: str
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW, INFO
    confidence: str = "MEDIUM"  # HIGH, MEDIUM, LOW
    category: str = "General Security"
    cwe: List[str] = []
    cves: List[str] = []
    owasp: List[str] = []
    file: Optional[str] = None
    line: Optional[int] = None
    code_snippet: Optional[str] = None
    endpoint: Optional[str] = None
    parameter: Optional[str] = None
    evidence: Optional[str] = None
    remediation: Optional[str] = None
    references: List[str] = []
    raw_data: Dict[str, Any] = {}

class ScannerResult(BaseModel):
    scanner_name: str
    source: str
    status: str  # SUCCESS, FAILED, SKIPPED
    duration_ms: int = 0
    findings: List[RawFinding] = []
    error_message: Optional[str] = None
    metadata: Dict[str, Any] = {}

class ScannerAdapter(ABC):
    def __init__(self, name: str, source: str):
        self.name = name
        self.source = source
        self.temp_paths: List[Path] = []

    @abstractmethod
    def validate(self, target: Any) -> bool:
        """Verify scanner is applicable and prerequisites are satisfied."""
        pass

    @abstractmethod
    def prepare(self, target: Any) -> Dict[str, Any]:
        """Prepare scan workspace, policies, or target configs."""
        pass

    @abstractmethod
    async def execute(self, target: Any, context: Dict[str, Any]) -> Any:
        """Run the scanner synchronously or asynchronously."""
        pass

    @abstractmethod
    def parse(self, raw_output: Any) -> List[RawFinding]:
        """Parse raw scanner output into standardized RawFinding objects."""
        pass

    def cleanup(self):
        """Remove any temporary files or resources created by the scanner."""
        for path in self.temp_paths:
            try:
                if path.is_file():
                    path.unlink(missing_ok=True)
                elif path.is_dir():
                    shutil.rmtree(path, ignore_errors=True)
            except Exception:
                pass
        self.temp_paths.clear()

    async def run(self, target: Any) -> ScannerResult:
        """Full lifecycle runner with timing, error isolation, and cleanup."""
        start_time = time.time()
        try:
            if not self.validate(target):
                return ScannerResult(
                    scanner_name=self.name,
                    source=self.source,
                    status="SKIPPED",
                    duration_ms=0,
                    findings=[],
                    error_message=f"{self.name} validation failed or target not applicable."
                )

            context = self.prepare(target)
            raw_output = await self.execute(target, context)
            findings = self.parse(raw_output)
            duration_ms = int((time.time() - start_time) * 1000)

            return ScannerResult(
                scanner_name=self.name,
                source=self.source,
                status="SUCCESS",
                duration_ms=duration_ms,
                findings=findings,
                metadata={"findings_count": len(findings)}
            )
        except Exception as e:
            duration_ms = int((time.time() - start_time) * 1000)
            return ScannerResult(
                scanner_name=self.name,
                source=self.source,
                status="FAILED",
                duration_ms=duration_ms,
                findings=[],
                error_message=str(e)
            )
        finally:
            self.cleanup()
