import json
import os
from pathlib import Path
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
from typing import Dict, Any, List, Optional
from jinja2 import Template
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

from app.config import settings
from app.pipeline.normalizer import NormalizedFinding
from app.pipeline.correlator import CorrelatedRiskItem
from app.ai.base import AIAnalysisResult

HTML_REPORT_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sentinal Security Assessment Report - {{ project_name }}</title>
    <style>
        :root {
            --bg-primary: #0a0e17;
            --bg-card: #121826;
            --bg-elevated: #1a2234;
            --border-color: #243048;
            --text-primary: #f0f4f8;
            --text-secondary: #94a3b8;
            --accent-cyan: #00f2fe;
            --accent-blue: #4facfe;
            --crit-color: #ff3366;
            --high-color: #ff9900;
            --med-color: #ffcc00;
            --low-color: #00ccff;
            --info-color: #8899a6;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
            padding: 40px 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        header {
            border-bottom: 2px solid var(--border-color);
            padding-bottom: 24px;
            margin-bottom: 36px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .logo { font-size: 28px; font-weight: 800; letter-spacing: 2px; background: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .badge-tag { background: #1e293b; color: var(--accent-cyan); padding: 4px 12px; border-radius: 9999px; font-size: 13px; border: 1px solid rgba(0, 242, 254, 0.3); }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 36px; }
        .card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px; box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
        .card-title { font-size: 13px; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 8px; letter-spacing: 1px; }
        .card-value { font-size: 32px; font-weight: 700; }
        .score-val { color: var(--accent-cyan); }
        .crit-val { color: var(--crit-color); }
        .high-val { color: var(--high-color); }
        .med-val { color: var(--med-color); }
        .section-title { font-size: 22px; font-weight: 700; margin-bottom: 16px; border-left: 4px solid var(--accent-cyan); padding-left: 12px; }
        .prose { color: #cbd5e1; margin-bottom: 36px; font-size: 15px; }
        .prose p { margin-bottom: 12px; }
        .corr-card { background: #191428; border: 1px solid #7c3aed; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
        .corr-title { font-size: 18px; font-weight: 700; color: #c084fc; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; }
        .finding-table { width: 100%; border-collapse: collapse; margin-top: 16px; margin-bottom: 36px; background: var(--bg-card); border-radius: 12px; overflow: hidden; border: 1px solid var(--border-color); }
        .finding-table th { background: var(--bg-elevated); padding: 14px 16px; text-align: left; font-size: 13px; text-transform: uppercase; color: var(--text-secondary); border-bottom: 1px solid var(--border-color); }
        .finding-table td { padding: 14px 16px; font-size: 14px; border-bottom: 1px solid var(--border-color); vertical-align: top; }
        .sev-badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .sev-CRITICAL { background: rgba(255, 51, 102, 0.2); color: var(--crit-color); border: 1px solid var(--crit-color); }
        .sev-HIGH { background: rgba(255, 153, 0, 0.2); color: var(--high-color); border: 1px solid var(--high-color); }
        .sev-MEDIUM { background: rgba(255, 204, 0, 0.2); color: var(--med-color); border: 1px solid var(--med-color); }
        .sev-LOW { background: rgba(0, 204, 255, 0.2); color: var(--low-color); border: 1px solid var(--low-color); }
        .sev-INFO { background: rgba(136, 153, 166, 0.2); color: var(--info-color); border: 1px solid var(--info-color); }
        code { background: #0f172a; color: #38bdf8; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; }
        pre { background: #090d16; border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; overflow-x: auto; color: #a5f3fc; font-family: monospace; font-size: 13px; margin-top: 8px; }
        footer { border-top: 1px solid var(--border-color); padding-top: 24px; text-align: center; color: var(--text-secondary); font-size: 13px; margin-top: 60px; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div>
                <div class="logo">SENTINAL</div>
                <p style="color: var(--text-secondary); font-size: 14px; margin-top: 4px;">Unified SAST + SCA + DAST Security Assessment Report</p>
            </div>
            <div style="text-align: right;">
                <span class="badge-tag">{{ assessment.assessment_type | upper }} SCAN</span>
                <p style="color: var(--text-secondary); font-size: 12px; margin-top: 6px;">Generated: {{ generated_at }}</p>
            </div>
        </header>

        <!-- Executive Metrics -->
        <div class="grid">
            <div class="card">
                <div class="card-title">Overall Risk Score</div>
                <div class="card-value score-val">{{ assessment.overall_risk_score }}/100</div>
            </div>
            <div class="card">
                <div class="card-title">Critical Risks</div>
                <div class="card-value crit-val">{{ assessment.critical_count }}</div>
            </div>
            <div class="card">
                <div class="card-title">High Risks</div>
                <div class="card-value high-val">{{ assessment.high_count }}</div>
            </div>
            <div class="card">
                <div class="card-title">Medium Risks</div>
                <div class="card-value med-val">{{ assessment.medium_count }}</div>
            </div>
            <div class="card">
                <div class="card-title">Total Findings</div>
                <div class="card-value">{{ assessment.total_findings }}</div>
            </div>
        </div>

        <!-- Executive Summary -->
        <h2 class="section-title">1. Executive Summary</h2>
        <div class="card prose" style="margin-bottom: 36px;">
            <p>{{ ai_analysis.executive_summary | replace('\n', '<br>') }}</p>
        </div>

        <!-- Correlated Risks -->
        {% if correlated_risks %}
        <h2 class="section-title">2. Correlated Multi-Vector Risks (Cross-Engine Confirmed)</h2>
        {% for cr in correlated_risks %}
        <div class="corr-card">
            <div class="corr-title">
                <span>{{ cr.title }}</span>
                <span class="sev-badge sev-{{ cr.risk_level }}">{{ cr.risk_level }} ({{ cr.confidence }} CONFIDENCE)</span>
            </div>
            <p style="color: #cbd5e1; margin-bottom: 12px; font-size: 14px;">{{ cr.description }}</p>
            <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; font-size: 13px; margin-bottom: 12px;">
                <strong>Explanation:</strong><br>{{ cr.explanation | replace('\n', '<br>') }}
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; font-size: 13px; margin-bottom: 12px;">
                <strong>Attack Scenario:</strong><br>{{ cr.attack_scenario }}
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; font-size: 13px;">
                <strong>Recommended Fix:</strong><br>{{ cr.remediation | replace('\n', '<br>') }}
            </div>
        </div>
        {% endfor %}
        {% endif %}

        <!-- Findings Inventory -->
        <h2 class="section-title">3. Comprehensive Findings Inventory</h2>
        <table class="finding-table">
            <thead>
                <tr>
                    <th style="width: 110px;">Severity</th>
                    <th style="width: 90px;">Source</th>
                    <th>Vulnerability / Location</th>
                    <th>Evidence & Remediation</th>
                </tr>
            </thead>
            <tbody>
                {% for f in findings %}
                <tr>
                    <td>
                        <span class="sev-badge sev-{{ f.severity }}">{{ f.severity }}</span>
                        <div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">{{ f.confidence }} Conf.</div>
                    </td>
                    <td>
                        <span class="badge-tag" style="font-size: 11px; padding: 2px 6px;">{{ f.source }}</span>
                        <div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">{{ f.scanner }}</div>
                    </td>
                    <td>
                        <strong style="color: #f1f5f9; font-size: 15px;">{{ f.title }}</strong>
                        <p style="color: var(--text-secondary); font-size: 13px; margin-top: 4px;">{{ f.description }}</p>
                        {% if f.file %}
                        <div style="margin-top: 6px;"><code>{{ f.file }}:{{ f.line }}</code></div>
                        {% elif f.endpoint %}
                        <div style="margin-top: 6px;"><code>Endpoint: {{ f.endpoint }} {% if f.parameter %}(Param: {{ f.parameter }}){% endif %}</code></div>
                        {% endif %}
                        {% if f.cwe %}
                        <div style="margin-top: 6px; font-size: 12px; color: #38bdf8;">CWE: {{ f.cwe | join(', ') }}</div>
                        {% endif %}
                    </td>
                    <td>
                        {% if f.evidence %}
                        <div style="font-size: 13px; margin-bottom: 6px;"><strong>Evidence:</strong> {{ f.evidence }}</div>
                        {% endif %}
                        {% if f.code_snippet %}
                        <pre><code>{{ f.code_snippet }}</code></pre>
                        {% endif %}
                        {% if f.remediation %}
                        <div style="font-size: 13px; margin-top: 6px; color: #a7f3d0;"><strong>Fix:</strong> {{ f.remediation }}</div>
                        {% endif %}
                    </td>
                </tr>
                {% endfor %}
            </tbody>
        </table>

        <!-- Technical Remediation Playbook -->
        <h2 class="section-title">4. Strategic Remediation Playbook</h2>
        <div class="card prose">
            <p>{{ ai_analysis.remediation_playbook | replace('\n', '<br>') }}</p>
        </div>

        <footer>
            <p>Sentinal Security Assessment Platform • Confidential Audit Report • Generated {{ generated_at }}</p>
        </footer>
    </div>
</body>
</html>
"""

class ReportGenerator:
    def __init__(self, reports_dir: Path = settings.REPORTS_DIR):
        self.reports_dir = reports_dir
        self.reports_dir.mkdir(parents=True, exist_ok=True)

    def generate_json_report(
        self,
        assessment_meta: Dict[str, Any],
        findings: List[NormalizedFinding],
        correlated_risks: List[CorrelatedRiskItem],
        ai_analysis: AIAnalysisResult
    ) -> Path:
        """Generate machine-readable JSON security report."""
        report_id = assessment_meta.get("id", "report")
        file_path = self.reports_dir / f"sentinal_report_{report_id}.json"

        data = {
            "sentinal_version": "1.0.0",
            "report_id": str(report_id),
            "generated_at": datetime.now(ZoneInfo("Asia/Kolkata")).isoformat(),
            "assessment": assessment_meta,
            "overall_risk_score": assessment_meta.get("overall_risk_score", 0.0),
            "summary": {
                "critical": assessment_meta.get("critical_count", 0),
                "high": assessment_meta.get("high_count", 0),
                "medium": assessment_meta.get("medium_count", 0),
                "low": assessment_meta.get("low_count", 0),
                "info": assessment_meta.get("info_count", 0),
                "total_findings": len(findings),
                "correlated_risks_count": len(correlated_risks)
            },
            "ai_analysis": ai_analysis.model_dump(),
            "correlated_risks": [cr.model_dump() for cr in correlated_risks],
            "findings": [f.model_dump() for f in findings]
        }

        file_path.write_text(json.dumps(data, indent=2), encoding="utf-8")
        return file_path

    def generate_html_report(
        self,
        assessment_meta: Dict[str, Any],
        findings: List[NormalizedFinding],
        correlated_risks: List[CorrelatedRiskItem],
        ai_analysis: AIAnalysisResult
    ) -> Path:
        """Generate standalone HTML report."""
        report_id = assessment_meta.get("id", "report")
        file_path = self.reports_dir / f"sentinal_report_{report_id}.html"

        template = Template(HTML_REPORT_TEMPLATE)
        rendered_html = template.render(
            project_name=assessment_meta.get("project_name", "Security Target"),
            assessment=assessment_meta,
            findings=findings,
            correlated_risks=correlated_risks,
            ai_analysis=ai_analysis,
            generated_at=datetime.now(ZoneInfo("Asia/Kolkata")).strftime("%Y-%m-%d %H:%M:%S IST")
        )

        file_path.write_text(rendered_html, encoding="utf-8")
        return file_path

    def generate_pdf_report(
        self,
        assessment_meta: Dict[str, Any],
        findings: List[NormalizedFinding],
        correlated_risks: List[CorrelatedRiskItem],
        ai_analysis: AIAnalysisResult
    ) -> Path:
        """Generate professional PDF report using reportlab."""
        report_id = assessment_meta.get("id", "report")
        file_path = self.reports_dir / f"sentinal_report_{report_id}.pdf"

        doc = SimpleDocTemplate(
            str(file_path),
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle("TitleStyle", parent=styles["Heading1"], fontSize=22, leading=26, textColor=colors.HexColor("#0f172a"))
        h2_style = ParagraphStyle("H2Style", parent=styles["Heading2"], fontSize=14, leading=18, textColor=colors.HexColor("#1e293b"), spaceBefore=12, spaceAfter=6)
        body_style = ParagraphStyle("BodyStyle", parent=styles["Normal"], fontSize=9, leading=13, textColor=colors.HexColor("#334155"))
        bold_body = ParagraphStyle("BoldBody", parent=styles["Normal"], fontSize=9, leading=13, fontName="Helvetica-Bold", textColor=colors.HexColor("#0f172a"))

        story = []

        # Title / Header
        story.append(Paragraph("<b>SENTINAL SECURITY ASSESSMENT REPORT</b>", title_style))
        story.append(Paragraph(f"Project: {assessment_meta.get('project_name', 'Target Asset')} | Type: {assessment_meta.get('assessment_type', 'Combined').upper()} | Date: {datetime.now(ZoneInfo('Asia/Kolkata')).strftime('%Y-%m-%d %H:%M IST')}", body_style))
        story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0284c7"), spaceBefore=8, spaceAfter=14))

        # Metrics Summary Table
        metrics_data = [
            ["Overall Risk Score", "Critical", "High", "Medium", "Low", "Total Findings"],
            [
                f"{assessment_meta.get('overall_risk_score', 0)}/100",
                str(assessment_meta.get("critical_count", 0)),
                str(assessment_meta.get("high_count", 0)),
                str(assessment_meta.get("medium_count", 0)),
                str(assessment_meta.get("low_count", 0)),
                str(len(findings))
            ]
        ]
        t_metrics = Table(metrics_data, colWidths=[100, 70, 70, 70, 70, 90])
        t_metrics.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0f172a")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor("#f8fafc")),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1"))
        ]))
        story.append(t_metrics)
        story.append(Spacer(1, 14))

        # Executive Summary
        story.append(Paragraph("<b>1. Executive Summary</b>", h2_style))
        clean_exec = ai_analysis.executive_summary.replace("\n", "<br/>")
        story.append(Paragraph(clean_exec, body_style))
        story.append(Spacer(1, 14))

        # Correlated Risks
        if correlated_risks:
            story.append(Paragraph("<b>2. Correlated Multi-Vector Attack Chains</b>", h2_style))
            for cr in correlated_risks:
                story.append(Paragraph(f"<b>[{cr.risk_level}] {cr.title}</b> (Confidence: {cr.confidence})", bold_body))
                story.append(Paragraph(f"<i>Scenario:</i> {cr.attack_scenario}", body_style))
                story.append(Paragraph(f"<i>Remediation:</i> {cr.remediation}", body_style))
                story.append(Spacer(1, 8))

        # Findings Table
        story.append(Paragraph("<b>3. Findings Inventory</b>", h2_style))
        findings_rows = [["Sev", "Source", "Vulnerability", "Location / Remediation"]]
        for f in findings[:30]:  # Top 30 for PDF readability
            loc = f.file if f.file else (f.endpoint if f.endpoint else "-")
            findings_rows.append([
                f.severity,
                f.source,
                Paragraph(f"<b>{f.title}</b><br/>{f.description[:120]}", body_style),
                Paragraph(f"<code>{loc}</code><br/><i>Fix:</i> {f.remediation[:100] if f.remediation else '-'}", body_style)
            ])

        t_findings = Table(findings_rows, colWidths=[55, 55, 180, 240])
        t_findings.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1e293b")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")])
        ]))
        story.append(t_findings)

        doc.build(story)
        return file_path

report_generator = ReportGenerator()
