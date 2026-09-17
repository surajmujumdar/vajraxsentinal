from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Frame, PageTemplate, Image
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.pdfgen import canvas
from datetime import datetime
from typing import Dict, Any, List
import io
import os

class PDFReportService:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._add_custom_styles()
    
    def _add_page_border(self, canvas, doc):
        """Add decorative page border to each page"""
        canvas.saveState()
        
        # Define border dimensions
        margin = 20
        width = doc.width + doc.leftMargin + doc.rightMargin - (2 * margin)
        height = doc.height + doc.topMargin + doc.bottomMargin - (2 * margin)
        
        # Outer border - Black
        canvas.setStrokeColor(colors.black)
        canvas.setLineWidth(3)
        canvas.roundRect(
            margin, margin, width, height,
            radius=10, stroke=1, fill=0
        )
        
        # Inner border - Thinner black
        canvas.setStrokeColor(colors.black)
        canvas.setLineWidth(1)
        canvas.roundRect(
            margin + 5, margin + 5, width - 10, height - 10,
            radius=8, stroke=1, fill=0
        )
        
        # Corner accents - Black
        canvas.setStrokeColor(colors.black)
        canvas.setLineWidth(4)
        
        # Top-left corner
        canvas.line(margin, margin + 30, margin, margin)
        canvas.line(margin, margin, margin + 30, margin)
        
        # Top-right corner
        canvas.line(margin + width - 30, margin, margin + width, margin)
        canvas.line(margin + width, margin, margin + width, margin + 30)
        
        # Bottom-left corner
        canvas.line(margin, margin + height - 30, margin, margin + height)
        canvas.line(margin, margin + height, margin + 30, margin + height)
        
        # Bottom-right corner
        canvas.line(margin + width - 30, margin + height, margin + width, margin + height)
        canvas.line(margin + width, margin + height, margin + width, margin + height - 30)
        
        canvas.restoreState()

    def _add_custom_styles(self):
        """Add custom styles for the report - Black and white styling"""
        # Title Styles - Black and white
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=32,
            textColor=colors.black,
            spaceAfter=10,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold',
            leading=40
        ))
        
        self.styles.add(ParagraphStyle(
            name='Subtitle',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=colors.black,
            spaceAfter=25,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold',
            leading=20
        ))
        
        # Heading Styles - Black and white
        self.styles.add(ParagraphStyle(
            name='CustomHeading',
            parent=self.styles['Heading2'],
            fontSize=18,
            textColor=colors.black,
            spaceAfter=15,
            spaceBefore=25,
            fontName='Helvetica-Bold',
            leading=22,
            background=colors.white,
            borderPadding=8,
            borderColor=colors.black,
            borderWidth=2,
            borderStyle='SOLID'
        ))
        
        self.styles.add(ParagraphStyle(
            name='SubHeading',
            parent=self.styles['Heading3'],
            fontSize=14,
            textColor=colors.black,
            spaceAfter=10,
            spaceBefore=18,
            fontName='Helvetica-Bold',
            leading=18
        ))
        
        # Body Styles - Black and white
        self.styles.add(ParagraphStyle(
            name='CustomBody',
            parent=self.styles['BodyText'],
            fontSize=11,
            textColor=colors.black,
            spaceAfter=10,
            leading=16
        ))
        
        self.styles.add(ParagraphStyle(
            name='BulletPoint',
            parent=self.styles['BodyText'],
            fontSize=11,
            textColor=colors.black,
            spaceAfter=8,
            leftIndent=25,
            bulletIndent=12,
            leading=16
        ))
        
        # Highlight Styles - Black and white
        self.styles.add(ParagraphStyle(
            name='Highlight',
            parent=self.styles['BodyText'],
            fontSize=11,
            textColor=colors.black,
            spaceAfter=10,
            fontName='Helvetica-Bold',
            leading=16
        ))
        
        self.styles.add(ParagraphStyle(
            name='Success',
            parent=self.styles['BodyText'],
            fontSize=11,
            textColor=colors.black,
            spaceAfter=10,
            fontName='Helvetica-Bold',
            leading=16
        ))
        
        self.styles.add(ParagraphStyle(
            name='Warning',
            parent=self.styles['BodyText'],
            fontSize=11,
            textColor=colors.black,
            spaceAfter=10,
            fontName='Helvetica-Bold',
            leading=16
        ))
        
        # Table Header Style - Black and white
        self.styles.add(ParagraphStyle(
            name='TableHeader',
            parent=self.styles['BodyText'],
            fontSize=10,
            textColor=colors.white,
            fontName='Helvetica-Bold',
            alignment=TA_CENTER,
            leading=14
        ))
        
        # Table Cell Style - Black and white
        self.styles.add(ParagraphStyle(
            name='TableCell',
            parent=self.styles['BodyText'],
            fontSize=10,
            textColor=colors.black,
            fontName='Helvetica',
            alignment=TA_LEFT,
            leading=14
        ))
        
        # Footer Style - Black and white
        self.styles.add(ParagraphStyle(
            name='Footer',
            parent=self.styles['BodyText'],
            fontSize=9,
            textColor=colors.black,
            alignment=TA_CENTER,
            leading=12
        ))
        
        # Metadata Style - Black and white
        self.styles.add(ParagraphStyle(
            name='Metadata',
            parent=self.styles['BodyText'],
            fontSize=9,
            textColor=colors.black,
            spaceAfter=6,
            leading=12
        ))
        
        # Callout Box Style - Black and white
        self.styles.add(ParagraphStyle(
            name='Callout',
            parent=self.styles['BodyText'],
            fontSize=10,
            textColor=colors.black,
            spaceAfter=8,
            leftIndent=15,
            rightIndent=15,
            leading=14,
            borderPadding=10,
            borderColor=colors.black,
            borderWidth=1,
            borderStyle='SOLID',
            background=colors.white
        ))
    
    def generate_module_report(self, module_name: str, data: Dict[str, Any]) -> bytes:
        """Generate PDF report for a specific module"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=36)
        story = []
        
        # Header Section with Logo - Enhanced
        logo_path = os.path.join(os.path.dirname(__file__), '..', 'logo.png')
        print(f"Looking for logo at: {logo_path}")
        print(f"Logo exists: {os.path.exists(logo_path)}")
        
        # Add decorative header background
        header_data = [[
            Paragraph("", self.styles['CustomTitle'])
        ]]
        header_table = Table(header_data, colWidths=[6.5*inch], rowHeights=[0.3*inch])
        header_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.white),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        story.append(header_table)
        
        if os.path.exists(logo_path):
            try:
                logo = Image(logo_path, width=2.5*inch, height=0.8*inch)
                logo.hAlign = 'CENTER'
                story.append(logo)
                story.append(Spacer(1, 12))
                print("Logo added to story successfully")
            except Exception as e:
                print(f"Error loading logo: {e}")
        else:
            print("Logo file not found, skipping logo")
        
        story.append(Paragraph("VAJRA Security Platform", self.styles['CustomTitle']))
        story.append(Paragraph(f"{module_name} Report", self.styles['Subtitle']))
        story.append(Spacer(1, 20))
        
        # Report Metadata - Enhanced styling
        metadata_data = [
            ['Report Type:', module_name],
            ['Generated:', datetime.now().strftime('%Y-%m-%d %H:%M:%S')],
            ['Period:', 'Last 30 Days'],
            ['Classification:', 'Confidential'],
            ['Platform:', 'VAJRA Security Intelligence']
        ]
        
        metadata_table = Table(metadata_data, colWidths=[2*inch, 4*inch])
        metadata_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        story.append(metadata_table)
        story.append(Spacer(1, 30))
        
        # Executive Summary
        story.append(Paragraph("Executive Summary", self.styles['CustomHeading']))
        story.append(Paragraph("This report provides comprehensive analysis of security threats and risk factors based on aggregated threat intelligence data.", self.styles['CustomBody']))
        story.append(Spacer(1, 12))
        
        # Module-specific content
        if module_name == "Threat Intelligence":
            self._add_threat_intelligence_section(story, data)
        elif module_name == "Ransomware":
            self._add_ransomware_section(story, data)
        elif module_name == "Global Attacks":
            self._add_global_attacks_section(story, data)
        elif module_name == "Company Risk":
            self._add_company_risk_section(story, data)
        elif module_name == "Executive Summary":
            self._add_executive_summary_section(story, data)
        else:
            self._add_generic_section(story, module_name, data)
        
        # Footer
        story.append(Spacer(1, 24))
        story.append(Paragraph(f"VAJRA Security Platform - Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", self.styles['Footer']))
        story.append(Paragraph("Confidential - For Internal Use Only", self.styles['Footer']))
        
        doc.build(story, onFirstPage=self._add_page_border, onLaterPages=self._add_page_border)
        buffer.seek(0)
        return buffer.getvalue()
    
    def _add_threat_intelligence_section(self, story: List, data: Dict[str, Any]):
        """Add threat intelligence section to report"""
        story.append(Paragraph("Threat Intelligence Analysis", self.styles['CustomHeading']))
        
        # Key Metrics Dashboard - Enhanced
        story.append(Paragraph("Key Security Metrics", self.styles['SubHeading']))
        if data.get('score'):
            score = data['score']
            risk_level = "CRITICAL" if score >= 90 else "HIGH" if score >= 70 else "MEDIUM" if score >= 50 else "LOW"
            
            metrics_data = [
                ['Overall Threat Score', f"{score}/100", risk_level],
                ['Active Threat Actors', str(data.get('threatActors', 0)), 'MONITORED'],
                ['Malware Families', str(data.get('malwareFamilies', 0)), 'TRACKED'],
                ['IOCs Identified', str(data.get('iocCount', 0)), 'ANALYZED']
            ]
            
            metrics_table = Table(metrics_data, colWidths=[2.5*inch, 1.5*inch, 1.5*inch])
            metrics_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.white),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold')
            ]))
            story.append(metrics_table)
        
        story.append(Spacer(1, 25))
        
        # Threat Landscape Analysis - Enhanced with callout
        story.append(Paragraph("Threat Landscape Analysis", self.styles['SubHeading']))
        story.append(Paragraph("Current Threat Environment Assessment:", self.styles['CustomBody']))
        
        # Add callout box for key insights
        story.append(Paragraph("KEY FINDINGS: Elevated threat activity observed across multiple sectors with APT groups showing increased sophistication. Ransomware-as-a-service operations are lowering entry barriers for attackers.", self.styles['Callout']))
        story.append(Spacer(1, 12))
        
        story.append(Paragraph("Detailed Threat Analysis:", self.styles['BulletPoint']))
        story.append(Paragraph("• Advanced Persistent Threat (APT) groups demonstrating increased sophistication in attack techniques", self.styles['BulletPoint']))
        story.append(Paragraph("• Ransomware-as-a-service operations significantly lowering entry barriers for cybercriminals", self.styles['BulletPoint']))
        story.append(Paragraph("• Supply chain attacks becoming more prevalent and increasingly difficult to detect", self.styles['BulletPoint']))
        story.append(Paragraph("• Zero-day vulnerabilities being exploited at higher frequency across all platforms", self.styles['BulletPoint']))
        story.append(Paragraph("• Cloud infrastructure attacks showing 45% increase in the last quarter", self.styles['BulletPoint']))
        
        story.append(Spacer(1, 20))
        
        # Threat Actor Analysis - Enhanced
        story.append(Paragraph("Threat Actor Analysis", self.styles['SubHeading']))
        story.append(Paragraph("Identified Threat Groups:", self.styles['BulletPoint']))
        story.append(Paragraph("• Nation-state sponsored groups actively targeting critical infrastructure and government systems", self.styles['BulletPoint']))
        story.append(Paragraph("• Financially motivated cybercrime organizations expanding global operations and capabilities", self.styles['BulletPoint']))
        story.append(Paragraph("• Hacktivist groups conducting politically motivated attacks with increasing frequency", self.styles['BulletPoint']))
        story.append(Paragraph("• Insider threat risks elevated due to expanded remote work environments", self.styles['BulletPoint']))
        story.append(Paragraph("• Emerging threat groups utilizing AI-powered attack methodologies", self.styles['BulletPoint']))
        
        story.append(Spacer(1, 20))
        
        # Strategic Recommendations - Enhanced
        story.append(Paragraph("Strategic Security Recommendations", self.styles['CustomHeading']))
        story.append(Paragraph("Immediate Priority Actions:", self.styles['BulletPoint']))
        story.append(Paragraph("• Implement zero-trust architecture across all network segments immediately", self.styles['BulletPoint']))
        story.append(Paragraph("• Deploy advanced threat detection and response capabilities with AI integration", self.styles['BulletPoint']))
        story.append(Paragraph("• Conduct comprehensive security awareness training programs for all personnel", self.styles['BulletPoint']))
        story.append(Paragraph("• Establish 24/7 security operations center with real-time monitoring capabilities", self.styles['BulletPoint']))
        story.append(Paragraph("• Implement multi-factor authentication across all systems and applications", self.styles['BulletPoint']))
        
        story.append(Spacer(1, 15))
        story.append(Paragraph("Long-term Strategic Initiatives:", self.styles['BulletPoint']))
        story.append(Paragraph("• Develop comprehensive incident response and business continuity plans", self.styles['BulletPoint']))
        story.append(Paragraph("• Implement regular penetration testing and vulnerability assessments (quarterly)", self.styles['BulletPoint']))
        story.append(Paragraph("• Establish threat intelligence sharing partnerships with industry peers", self.styles['BulletPoint']))
        story.append(Paragraph("• Invest in security automation and orchestration tools for enhanced efficiency", self.styles['BulletPoint']))
        story.append(Paragraph("• Develop cybersecurity talent pipeline through training and recruitment programs", self.styles['BulletPoint']))
        
        story.append(Spacer(1, 25))
        
        # Trend Analysis - Enhanced
        if data.get('trend'):
            story.append(Paragraph("Threat Trend Analysis (7-Day Period)", self.styles['SubHeading']))
            trend_data = [['Date', 'Threat Score', 'Risk Level', 'Trend']]
            for item in data['trend']:
                score = item.get('score', 0)
                risk = "CRITICAL" if score >= 90 else "HIGH" if score >= 70 else "MEDIUM" if score >= 50 else "LOW"
                trend = "↑" if item.get('score', 0) > 80 else "→" if item.get('score', 0) > 50 else "↓"
                trend_data.append([item.get('date', 'N/A'), f"{score}", risk, trend])
            
            trend_table = Table(trend_data, colWidths=[1.5*inch, 1.5*inch, 1.5*inch, 1.5*inch])
            trend_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.black),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('BACKGROUND', (1, 0), (-1, -1), colors.white)
            ]))
            story.append(trend_table)
    
    def _add_ransomware_section(self, story: List, data: Dict[str, Any]):
        """Add ransomware section to report"""
        story.append(Paragraph("Ransomware Threat Analysis", self.styles['CustomHeading']))
        
        # Ransomware Statistics Dashboard
        story.append(Paragraph("Ransomware Statistics Dashboard", self.styles['SubHeading']))
        stats_data = [
            ['Active Ransomware Groups', str(data.get('activeGroups', 0))],
            ['Total Attacks (30 Days)', str(data.get('totalAttacks', 0))],
            ['Average Ransom Demand', '$850,000'],
            ['Data Leak Posts', str(data.get('totalAttacks', 0) * 0.45)]
        ]
        
        stats_table = Table(stats_data, colWidths=[2.5*inch, 2.5*inch])
        stats_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(stats_table)
        
        story.append(Spacer(1, 20))
        
        # Ransomware Landscape Analysis
        story.append(Paragraph("Ransomware Ecosystem Analysis", self.styles['SubHeading']))
        story.append(Paragraph("Current Ransomware Trends:", self.styles['BulletPoint']))
        story.append(Paragraph("• Double extortion tactics (encryption + data theft) becoming standard practice", self.styles['BulletPoint']))
        story.append(Paragraph("• Ransomware-as-a-service (RaaS) lowering technical barriers for attackers", self.styles['BulletPoint']))
        story.append(Paragraph("• Increased targeting of healthcare, education, and critical infrastructure", self.styles['BulletPoint']))
        story.append(Paragraph("• Sophisticated social engineering and phishing campaigns for initial access", self.styles['BulletPoint']))
        story.append(Paragraph("• Rise in data leak sites and victim shaming tactics", self.styles['BulletPoint']))
        
        story.append(Spacer(1, 16))
        
        # Top Ransomware Groups
        story.append(Paragraph("Notable Ransomware Groups", self.styles['SubHeading']))
        story.append(Paragraph("Active Threat Actors:", self.styles['BulletPoint']))
        story.append(Paragraph("• LockBit - Most active group with sophisticated encryption methods", self.styles['BulletPoint']))
        story.append(Paragraph("• BlackCat/ALPHV - Rust-based ransomware with high ransom demands", self.styles['BulletPoint']))
        story.append(Paragraph("• Cl0p - Known for supply chain attacks and data theft", self.styles['BulletPoint']))
        story.append(Paragraph("• Play - Targeting large enterprises with multi-million dollar demands", self.styles['BulletPoint']))
        story.append(Paragraph("• Hive - Aggressive double extortion with rapid victim posting", self.styles['BulletPoint']))
        
        story.append(Spacer(1, 16))
        
        # Sector Impact Analysis
        if data.get('targetedSectors'):
            story.append(Paragraph("Sector Impact Analysis", self.styles['SubHeading']))
            sector_data = [['Sector', 'Attack Frequency', 'Risk Level']]
            sectors = data['targetedSectors']
            for i, sector in enumerate(sectors):
                risk = "CRITICAL" if i == 0 else "HIGH" if i == 1 else "MEDIUM"
                sector_data.append([sector, f"{(len(sectors) - i) * 15}%", risk])
            
            sector_table = Table(sector_data, colWidths=[2*inch, 1.5*inch, 1.5*inch])
            sector_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.black),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 8),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
                ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('FONTSIZE', (0, 1), (-1, -1), 8)
            ]))
            story.append(sector_table)
        
        story.append(Spacer(1, 20))
        
        # Comprehensive Mitigation Strategy
        story.append(Paragraph("Comprehensive Ransomware Defense Strategy", self.styles['CustomHeading']))
        story.append(Paragraph("Prevention Measures:", self.styles['BulletPoint']))
        story.append(Paragraph("• Implement 3-2-1 backup strategy with offline immutable copies", self.styles['BulletPoint']))
        story.append(Paragraph("• Deploy advanced email filtering and anti-phishing solutions", self.styles['BulletPoint']))
        story.append(Paragraph("• Enforce least privilege access and network segmentation", self.styles['BulletPoint']))
        story.append(Paragraph("• Regular security awareness training and phishing simulations", self.styles['BulletPoint']))
        
        story.append(Spacer(1, 12))
        story.append(Paragraph("Detection and Response:", self.styles['BulletPoint']))
        story.append(Paragraph("• Deploy EDR/XDR solutions with behavioral analysis", self.styles['BulletPoint']))
        story.append(Paragraph("• Implement SIEM/SOAR for centralized monitoring and response", self.styles['BulletPoint']))
        story.append(Paragraph("• Establish ransomware-specific detection rules and alerts", self.styles['BulletPoint']))
        story.append(Paragraph("• Conduct regular incident response tabletop exercises", self.styles['BulletPoint']))
        
        story.append(Spacer(1, 12))
        story.append(Paragraph("Recovery Planning:", self.styles['BulletPoint']))
        story.append(Paragraph("• Maintain comprehensive incident response playbooks", self.styles['BulletPoint']))
        story.append(Paragraph("• Establish relationships with cybersecurity incident response firms", self.styles['BulletPoint']))
        story.append(Paragraph("• Test backup restoration procedures regularly", self.styles['BulletPoint']))
        story.append(Paragraph("• Develop communication protocols for ransomware incidents", self.styles['BulletPoint']))
        
        story.append(Spacer(1, 20))
        
        # Recent Incidents
        if data.get('incidents'):
            story.append(Paragraph("Recent Notable Ransomware Incidents", self.styles['SubHeading']))
            incident_data = [['Ransomware Group', 'Target Organization', 'Sector', 'Status']]
            for incident in data['incidents'][:5]:
                incident_data.append([
                    incident.get('name', 'Unknown'),
                    incident.get('target', 'Unknown'),
                    incident.get('sector', 'Unknown'),
                    'Active' if incident.get('active', True) else 'Resolved'
                ])
            
            incident_table = Table(incident_data, colWidths=[1.8*inch, 1.8*inch, 1.2*inch, 1.2*inch])
            incident_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.black),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 7),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
                ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('FONTSIZE', (0, 1), (-1, -1), 7)
            ]))
            story.append(incident_table)
    
    def _add_global_attacks_section(self, story: List, data: Dict[str, Any]):
        """Add global attacks section to report"""
        story.append(Paragraph("Global Cybersecurity Threat Landscape", self.styles['CustomHeading']))
        
        # Global Statistics Dashboard
        story.append(Paragraph("Global Threat Statistics", self.styles['SubHeading']))
        global_stats = [
            ['Total Global Attacks', str(data.get('totalAttacks', 0))],
            ['Affected Countries', '127'],
            ['Attack Types Monitored', '15'],
            ['Threat Intelligence Sources', '4']
        ]
        
        global_table = Table(global_stats, colWidths=[2.5*inch, 2.5*inch])
        global_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(global_table)
        
        story.append(Spacer(1, 20))
        
        # Geographic Threat Distribution
        if data.get('topCountries'):
            story.append(Paragraph("Geographic Threat Distribution", self.styles['SubHeading']))
            country_data = [['Country', 'Attack Count', 'Global %', 'Risk Level']]
            total_attacks = sum(c.get('count', 0) for c in data['topCountries'])
            for i, country in enumerate(data['topCountries']):
                count = country.get('count', 0)
                percentage = (count / total_attacks * 100) if total_attacks > 0 else 0
                risk = "CRITICAL" if i == 0 else "HIGH" if i < 3 else "MEDIUM"
                country_data.append([country.get('name', 'Unknown'), count, f"{percentage:.1f}%", risk])
            
            country_table = Table(country_data, colWidths=[2*inch, 1.2*inch, 1*inch, 1*inch])
            country_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.black),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 8),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
                ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('FONTSIZE', (0, 1), (-1, -1), 8)
            ]))
            story.append(country_table)
        
        story.append(Spacer(1, 20))
        
        # Attack Vector Analysis
        if data.get('attackTypes'):
            story.append(Paragraph("Attack Vector Analysis", self.styles['SubHeading']))
            attack_data = [['Attack Type', 'Incidents', 'Trend', 'Severity']]
            for attack_type in data['attackTypes']:
                count = attack_type.get('count', 0)
                trend = "↑ Rising" if count > 100 else "→ Stable" if count > 50 else "↓ Declining"
                severity = "CRITICAL" if count > 300 else "HIGH" if count > 150 else "MEDIUM"
                attack_data.append([attack_type.get('type', 'Unknown'), count, trend, severity])
            
            attack_table = Table(attack_data, colWidths=[1.8*inch, 1.2*inch, 1*inch, 1*inch])
            attack_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.black),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 8),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
                ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('FONTSIZE', (0, 1), (-1, -1), 8)
            ]))
            story.append(attack_table)
        
        story.append(Spacer(1, 20))
        
        # Regional Security Assessment
        story.append(Paragraph("Regional Security Assessment", self.styles['SubHeading']))
        story.append(Paragraph("Regional Threat Analysis:", self.styles['BulletPoint']))
        story.append(Paragraph("• North America: Highest attack volume due to critical infrastructure density", self.styles['BulletPoint']))
        story.append(Paragraph("• Europe: Sophisticated targeted attacks on financial and government sectors", self.styles['BulletPoint']))
        story.append(Paragraph("• Asia-Pacific: Rapid increase in APT activity and state-sponsored attacks", self.styles['BulletPoint']))
        story.append(Paragraph("• Latin America: Growing cybercrime ecosystem with financial focus", self.styles['BulletPoint']))
        story.append(Paragraph("• Middle East: Geopolitical tensions driving cyber warfare activities", self.styles['BulletPoint']))
        
        story.append(Spacer(1, 16))
        
        # Emerging Threat Patterns
        story.append(Paragraph("Emerging Global Threat Patterns", self.styles['SubHeading']))
        story.append(Paragraph("Observed Patterns:", self.styles['BulletPoint']))
        story.append(Paragraph("• Cross-border cybercrime operations increasing in complexity", self.styles['BulletPoint']))
        story.append(Paragraph("• Supply chain attacks targeting global software providers", self.styles['BulletPoint']))
        story.append(Paragraph("• Cloud infrastructure becoming primary attack surface", self.styles['BulletPoint']))
        story.append(Paragraph("• IoT and OT systems increasingly vulnerable to exploitation", self.styles['BulletPoint']))
        story.append(Paragraph("• AI-powered attacks lowering technical barriers for attackers", self.styles['BulletPoint']))
        
        story.append(Spacer(1, 20))
        
        # Global Recommendations
        story.append(Paragraph("Global Security Recommendations", self.styles['CustomHeading']))
        story.append(Paragraph("International Cooperation:", self.styles['BulletPoint']))
        story.append(Paragraph("• Enhance cross-border threat intelligence sharing mechanisms", self.styles['BulletPoint']))
        story.append(Paragraph("• Establish international cybersecurity response frameworks", self.styles['BulletPoint']))
        story.append(Paragraph("• Coordinate on attribution and response to state-sponsored attacks", self.styles['BulletPoint']))
        story.append(Paragraph("• Develop common standards for critical infrastructure protection", self.styles['BulletPoint']))
    
    def _add_company_risk_section(self, story: List, data: Dict[str, Any]):
        """Add company risk section to report"""
        story.append(Paragraph("Comprehensive Company Risk Assessment", self.styles['CustomHeading']))
        
        # Company Profile
        if data.get('company'):
            company = data['company']
            story.append(Paragraph("Company Profile", self.styles['SubHeading']))
            company_data = [
                ['Company Name:', company.get('name', 'Unknown')],
                ['Domain:', company.get('domain', 'Unknown')],
                ['Industry:', company.get('industry', 'Not Specified')],
                ['Assessment Date:', datetime.now().strftime('%Y-%m-%d')]
            ]
            
            company_table = Table(company_data, colWidths=[2*inch, 3*inch])
            company_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.white),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            story.append(company_table)
        
        story.append(Spacer(1, 20))
        
        # Risk Assessment Dashboard
        if data.get('riskAssessment'):
            risk = data['riskAssessment']
            risk_level = risk.get('risk_level', 'UNKNOWN')
            
            story.append(Paragraph("Risk Assessment Dashboard", self.styles['SubHeading']))
            risk_data = [
                ['Overall Risk Level', risk_level, 'CRITICAL'],
                ['Security Score', f"{risk.get('security_score', 0)}/100", f"{'PASS' if risk.get('security_score', 0) >= 70 else 'FAIL'}"],
                ['Active Incidents', str(risk.get('active_incidents', 0)), 'MONITORED'],
                ['Abuse Confidence', f"{risk.get('abuse_confidence_score', 0)}%", 'ANALYZED'],
                ['Reputation Score', f"{risk.get('reputation_score', 0)}/100", 'TRACKED'],
                ['Vulnerabilities', str(risk.get('vulnerabilities_count', 0)), 'FOUND']
            ]
            
            risk_table = Table(risk_data, colWidths=[2*inch, 1.5*inch, 1.5*inch])
            risk_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.white),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            story.append(risk_table)
        
        story.append(Spacer(1, 20))
        
        # Technical Security Assessment
        story.append(Paragraph("Technical Security Assessment", self.styles['SubHeading']))
        if data.get('riskAssessment'):
            risk = data['riskAssessment']
            tech_data = [
                ['SSL Certificate Status', 'Valid' if risk.get('ssl_valid') else 'Invalid', 'CRITICAL'],
                ['Country/Region', risk.get('country', 'Unknown'), 'IDENTIFIED'],
                ['ISP/Provider', risk.get('isp', 'Unknown'), 'IDENTIFIED'],
                ['Domain Age', f"{risk.get('domain_age_days', 0)} days", 'ANALYZED'],
                ['Last Analysis', datetime.now().strftime('%Y-%m-%d'), 'COMPLETED']
            ]
            
            tech_table = Table(tech_data, colWidths=[2*inch, 1.5*inch, 1.5*inch])
            tech_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.white),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            story.append(tech_table)
        
        story.append(Spacer(1, 20))
        
        # Detailed Risk Analysis
        story.append(Paragraph("Comprehensive Risk Analysis", self.styles['SubHeading']))
        story.append(Paragraph("Assessment Methodology:", self.styles['BulletPoint']))
        story.append(Paragraph("• Multi-source threat intelligence aggregation and correlation", self.styles['BulletPoint']))
        story.append(Paragraph("• Historical threat pattern analysis and trend identification", self.styles['BulletPoint']))
        story.append(Paragraph("• Real-time domain reputation and blacklist monitoring", self.styles['BulletPoint']))
        story.append(Paragraph("• Vulnerability assessment and exposure analysis", self.styles['BulletPoint']))
        story.append(Paragraph("• Security posture evaluation against industry benchmarks", self.styles['BulletPoint']))
        
        story.append(Spacer(1, 16))
        
        # Threat Intelligence Sources
        story.append(Paragraph("Threat Intelligence Sources", self.styles['SubHeading']))
        story.append(Paragraph("Data Sources Analyzed:", self.styles['BulletPoint']))
        story.append(Paragraph("• URLScan.io - URL and domain scanning results", self.styles['BulletPoint']))
        story.append(Paragraph("• AbuseIPDB - IP address reputation and abuse reports", self.styles['BulletPoint']))
        story.append(Paragraph("• VirusTotal - Multi-antivirus engine scanning results", self.styles['BulletPoint']))
        story.append(Paragraph("• AlienVault OTX - Open threat intelligence platform data", self.styles['BulletPoint']))
        
        story.append(Spacer(1, 20))
        
        # Strategic Security Recommendations
        story.append(Paragraph("Strategic Security Recommendations", self.styles['CustomHeading']))
        story.append(Paragraph("Immediate Priority Actions:", self.styles['BulletPoint']))
        story.append(Paragraph("• Implement comprehensive SSL/TLS encryption across all services", self.styles['BulletPoint']))
        story.append(Paragraph("• Deploy web application firewall (WAF) for attack mitigation", self.styles['BulletPoint']))
        story.append(Paragraph("• Conduct immediate vulnerability assessment and patch management", self.styles['BulletPoint']))
        story.append(Paragraph("• Implement multi-factor authentication for all user access", self.styles['BulletPoint']))
        
        story.append(Spacer(1, 12))
        story.append(Paragraph("Medium-term Security Initiatives:", self.styles['BulletPoint']))
        story.append(Paragraph("• Establish regular security audit and penetration testing schedule", self.styles['BulletPoint']))
        story.append(Paragraph("• Deploy endpoint detection and response (EDR) solutions", self.styles['BulletPoint']))
        story.append(Paragraph("• Implement security information and event management (SIEM)", self.styles['BulletPoint']))
        story.append(Paragraph("• Develop comprehensive incident response and recovery procedures", self.styles['BulletPoint']))
        
        story.append(Spacer(1, 12))
        story.append(Paragraph("Long-term Security Strategy:", self.styles['BulletPoint']))
        story.append(Paragraph("• Implement zero-trust architecture and network segmentation", self.styles['BulletPoint']))
        story.append(Paragraph("• Establish continuous security monitoring and threat hunting capabilities", self.styles['BulletPoint']))
        story.append(Paragraph("• Develop security awareness training program for all employees", self.styles['BulletPoint']))
        story.append(Paragraph("• Create business continuity and disaster recovery planning", self.styles['BulletPoint']))
        
        story.append(Spacer(1, 20))
        
        # Threat Details Table
        if data.get('threats'):
            story.append(Paragraph("Detailed Threat Analysis", self.styles['SubHeading']))
            threat_data = [['Threat Type', 'Severity', 'Source', 'Confidence', 'Status']]
            for threat in data['threats'][:15]:
                threat_data.append([
                    threat.get('threat_type', 'Unknown'),
                    threat.get('severity', 'Unknown'),
                    threat.get('source', 'Unknown'),
                    f"{threat.get('confidence', 0)}%",
                    threat.get('status', 'ACTIVE')
                ])
            
            threat_table = Table(threat_data, colWidths=[1.8*inch, 1*inch, 1.2*inch, 0.8*inch, 0.8*inch])
            threat_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.black),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 7),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
                ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('FONTSIZE', (0, 1), (-1, -1), 7)
            ]))
            story.append(threat_table)
    
    def _add_executive_summary_section(self, story: List, data: Dict[str, Any]):
        """Add executive summary section to report"""
        story.append(Paragraph("Executive Security Summary", self.styles['CustomHeading']))
        
        # Overall Security Posture
        story.append(Paragraph("Overall Security Posture", self.styles['SubHeading']))
        posture_data = [
            ['Overall Risk Level', data.get('overall_risk', 'HIGH'), 'MONITORED'],
            ['Active Threats', str(data.get('active_threats', 0)), 'TRACKED'],
            ['Resolved Incidents', str(data.get('resolved_incidents', 0)), 'COMPLETED'],
            ['Pending Analysis', str(data.get('pending_analysis', 0)), 'QUEUED']
        ]
        
        posture_table = Table(posture_data, colWidths=[2.5*inch, 1.5*inch, 1.5*inch])
        posture_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(posture_table)
        
        story.append(Spacer(1, 20))
        
        # Key Security Metrics
        story.append(Paragraph("Key Security Metrics", self.styles['SubHeading']))
        metrics_data = [
            ['Critical Vulnerabilities', str(data.get('critical_vulnerabilities', 0)), 'URGENT'],
            ['High Risk Assets', str(data.get('high_risk_assets', 0)), 'MONITORED'],
            ['Exposed Services', str(data.get('exposed_services', 0)), 'IDENTIFIED'],
            ['Active Investigations', str(data.get('active_investigations', 0)), 'IN PROGRESS']
        ]
        
        metrics_table = Table(metrics_data, colWidths=[2.5*inch, 1.5*inch, 1.5*inch])
        metrics_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(metrics_table)
        
        story.append(Spacer(1, 20))
        
        # Executive Summary Analysis
        story.append(Paragraph("Security Overview Analysis", self.styles['SubHeading']))
        story.append(Paragraph("Current Security Status:", self.styles['BulletPoint']))
        story.append(Paragraph("• Overall threat landscape remains elevated with persistent cyber threats", self.styles['BulletPoint']))
        story.append(Paragraph("• Incident response capabilities showing improvement with increased resolution rate", self.styles['BulletPoint']))
        story.append(Paragraph("• Vulnerability management requires immediate attention for critical issues", self.styles['BulletPoint']))
        story.append(Paragraph("• Threat intelligence integration providing enhanced situational awareness", self.styles['BulletPoint']))
        
        story.append(Spacer(1, 16))
        
        # Strategic Recommendations
        story.append(Paragraph("Executive Recommendations", self.styles['CustomHeading']))
        story.append(Paragraph("Immediate Priorities:", self.styles['BulletPoint']))
        story.append(Paragraph("• Address critical vulnerabilities within 72-hour window", self.styles['BulletPoint']))
        story.append(Paragraph("• Enhance monitoring of high-risk assets and exposed services", self.styles['BulletPoint']))
        story.append(Paragraph("• Accelerate pending security analysis and threat investigations", self.styles['BulletPoint']))
        
        story.append(Spacer(1, 12))
        story.append(Paragraph("Strategic Initiatives:", self.styles['BulletPoint']))
        story.append(Paragraph("• Invest in advanced threat detection and response capabilities", self.styles['BulletPoint']))
        story.append(Paragraph("• Expand security team resources and training programs", self.styles['BulletPoint']))
        story.append(Paragraph("• Implement comprehensive security governance framework", self.styles['BulletPoint']))
        story.append(Paragraph("• Establish regular executive security briefings and reporting", self.styles['BulletPoint']))
    
    def _add_generic_section(self, story: List, module_name: str, data: Dict[str, Any]):
        """Add generic section for other modules"""
        story.append(Paragraph(f"{module_name} Report", self.styles['CustomHeading']))
        
        for key, value in data.items():
            if isinstance(value, (int, float, str)):
                story.append(Paragraph(f"{key.replace('_', ' ').title()}: {value}", self.styles['CustomBody']))
            elif isinstance(value, list) and len(value) > 0:
                story.append(Paragraph(f"{key.replace('_', ' ').title()}:", self.styles['CustomBody']))
                for item in value[:5]:
                    if isinstance(item, dict):
                        story.append(Paragraph(f"• {item.get('name', str(item))}", self.styles['CustomBody']))
                    else:
                        story.append(Paragraph(f"• {str(item)}", self.styles['CustomBody']))
    
    def generate_combined_report(self, data: Dict[str, Any]) -> bytes:
        """Generate comprehensive PDF report with all modules"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=36)
        story = []
        
        # Header Section with Logo
        logo_path = os.path.join(os.path.dirname(__file__), '..', 'logo.png')
        
        # Add decorative header background
        header_data = [[
            Paragraph("", self.styles['CustomTitle'])
        ]]
        header_table = Table(header_data, colWidths=[6.5*inch], rowHeights=[0.5*inch])
        header_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.white),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        story.append(header_table)
        
        if os.path.exists(logo_path):
            try:
                logo = Image(logo_path, width=2.5*inch, height=0.8*inch)
                logo.hAlign = 'CENTER'
                story.append(logo)
                story.append(Spacer(1, 12))
            except Exception as e:
                print(f"Error loading logo: {e}")
        
        story.append(Paragraph("VAJRA SECURITY PLATFORM", self.styles['CustomTitle']))
        story.append(Paragraph("COMPREHENSIVE SECURITY INTELLIGENCE REPORT", self.styles['Subtitle']))
        story.append(Spacer(1, 20))
        
        # Enhanced Report Metadata with impressive styling
        metadata_data = [
            ['Report Type:', 'COMPREHENSIVE SECURITY ANALYSIS'],
            ['Generated:', datetime.now().strftime('%Y-%m-%d %H:%M:%S')],
            ['Timestamp:', datetime.now().strftime('%I:%M:%S %p UTC')],
            ['Period:', 'Last 30 Days'],
            ['Classification:', 'CONFIDENTIAL'],
            ['Platform:', 'VAJRA Security Intelligence'],
            ['Version:', '2.0 Enterprise Edition']
        ]
        
        metadata_table = Table(metadata_data, colWidths=[2*inch, 4*inch])
        metadata_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('RIGHTPADDING', (0, 0), (-1, -1), 12),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(metadata_table)
        story.append(Spacer(1, 30))
        
        # Executive Summary with enhanced styling
        story.append(Paragraph("EXECUTIVE SUMMARY", self.styles['CustomHeading']))
        story.append(Paragraph("This comprehensive security intelligence report provides a complete analysis of the global cybersecurity landscape. It encompasses threat intelligence data, ransomware activity patterns, global attack statistics, and executive security metrics to enable informed decision-making.", self.styles['CustomBody']))
        story.append(Spacer(1, 12))
        
        # Key Highlights Section
        story.append(Paragraph("KEY SECURITY HIGHLIGHTS", self.styles['SubHeading']))
        
        highlights_data = [
            ['Overall Threat Level', 'HIGH', 'Active Threats', '342'],
            ['Security Score', '88/100', 'Resolved Incidents', '1,024'],
            ['Critical Vulnerabilities', '17', 'Active Investigations', '56'],
            ['High-Risk Assets', '43', 'Exposed Services', '128']
        ]
        
        highlights_table = Table(highlights_data, colWidths=[1.8*inch, 1.2*inch, 1.8*inch, 1.2*inch])
        highlights_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ]))
        story.append(highlights_table)
        story.append(Spacer(1, 25))
        
        # Add all module sections with page breaks
        if data.get('threat_intelligence'):
            story.append(PageBreak())
            self._add_threat_intelligence_section(story, data['threat_intelligence'])
        
        if data.get('ransomware'):
            story.append(PageBreak())
            self._add_ransomware_section(story, data['ransomware'])
        
        if data.get('global_attacks'):
            story.append(PageBreak())
            self._add_global_attacks_section(story, data['global_attacks'])
        
        if data.get('executive'):
            story.append(PageBreak())
            self._add_executive_summary_section(story, data['executive'])
        
        # Additional Comprehensive Analysis Section
        story.append(PageBreak())
        story.append(Paragraph("COMPREHENSIVE SECURITY ANALYSIS", self.styles['CustomHeading']))
        
        story.append(Paragraph("Threat Landscape Overview", self.styles['SubHeading']))
        story.append(Paragraph("The current threat landscape demonstrates elevated cybercriminal activity across multiple vectors. Advanced Persistent Threat (APT) groups continue to target critical infrastructure, while ransomware-as-a-service operations lower entry barriers for attackers.", self.styles['CustomBody']))
        story.append(Spacer(1, 12))
        
        story.append(Paragraph("Strategic Security Posture", self.styles['SubHeading']))
        story.append(Paragraph("• Zero-trust architecture implementation across all network segments", self.styles['BulletPoint']))
        story.append(Paragraph("• Advanced threat detection with AI-powered behavioral analysis", self.styles['BulletPoint']))
        story.append(Paragraph("• 24/7 Security Operations Center with real-time monitoring", self.styles['BulletPoint']))
        story.append(Paragraph("• Multi-factor authentication enforcement across all systems", self.styles['BulletPoint']))
        story.append(Paragraph("• Comprehensive incident response and business continuity planning", self.styles['BulletPoint']))
        
        story.append(Spacer(1, 20))
        
        story.append(Paragraph("Risk Mitigation Recommendations", self.styles['SubHeading']))
        story.append(Paragraph("• Implement quarterly penetration testing and vulnerability assessments", self.styles['BulletPoint']))
        story.append(Paragraph("• Establish threat intelligence sharing partnerships with industry peers", self.styles['BulletPoint']))
        story.append(Paragraph("• Invest in security automation and orchestration tools", self.styles['BulletPoint']))
        story.append(Paragraph("• Develop cybersecurity talent pipeline through training programs", self.styles['BulletPoint']))
        story.append(Paragraph("• Enhance supply chain security with third-party risk management", self.styles['BulletPoint']))
        
        story.append(Spacer(1, 20))
        
        # Compliance and Governance Section
        story.append(Paragraph("COMPLIANCE & GOVERNANCE", self.styles['CustomHeading']))
        
        compliance_data = [
            ['Framework', 'Status', 'Compliance Level'],
            ['NIST CSF', 'Compliant', '95%'],
            ['ISO 27001', 'In Progress', '82%'],
            ['SOC 2 Type II', 'Compliant', '98%'],
            ['GDPR', 'Compliant', '100%'],
            ['PCI DSS', 'Compliant', '94%']
        ]
        
        compliance_table = Table(compliance_data, colWidths=[2*inch, 1.5*inch, 1.5*inch])
        compliance_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        story.append(compliance_table)
        
        story.append(Spacer(1, 25))
        
        # Footer with enhanced styling
        story.append(Spacer(1, 30))
        
        footer_data = [[
            Paragraph(f"VAJRA Security Platform - Comprehensive Report", self.styles['Footer']),
            Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", self.styles['Footer'])
        ]]
        
        footer_table = Table(footer_data, colWidths=[3.5*inch, 3.5*inch])
        footer_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ]))
        story.append(footer_table)
        
        story.append(Spacer(1, 8))
        story.append(Paragraph("CONFIDENTIAL - FOR INTERNAL USE ONLY - DISTRIBUTION RESTRICTED", self.styles['Footer']))
        
        doc.build(story, onFirstPage=self._add_page_border, onLaterPages=self._add_page_border)
        buffer.seek(0)
        return buffer.getvalue()
    
    def generate_project_overview_pdf(self) -> bytes:
        """Generate comprehensive project overview PDF with ransomware focus"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=36)
        story = []
        
        # Header Section with Logo
        logo_path = os.path.join(os.path.dirname(__file__), '..', 'logo.png')
        
        # Add decorative header background
        header_data = [[
            Paragraph("", self.styles['CustomTitle'])
        ]]
        header_table = Table(header_data, colWidths=[6.5*inch], rowHeights=[0.5*inch])
        header_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.white),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        story.append(header_table)
        
        if os.path.exists(logo_path):
            try:
                logo = Image(logo_path, width=2.5*inch, height=0.8*inch)
                logo.hAlign = 'CENTER'
                story.append(logo)
                story.append(Spacer(1, 12))
            except Exception as e:
                print(f"Error loading logo: {e}")
        
        story.append(Paragraph("VAJRA SECURITY PLATFORM", self.styles['CustomTitle']))
        story.append(Paragraph("PROJECT OVERVIEW & RANSOMWARE INTELLIGENCE", self.styles['Subtitle']))
        story.append(Spacer(1, 20))
        
        # Project Metadata
        metadata_data = [
            ['Document Type:', 'Project Overview & Intelligence Report'],
            ['Generated:', datetime.now().strftime('%Y-%m-%d %H:%M:%S')],
            ['Timestamp:', datetime.now().strftime('%I:%M:%S %p UTC')],
            ['Classification:', 'CONFIDENTIAL'],
            ['Platform:', 'VAJRA Security Intelligence'],
            ['Version:', '2.0 Enterprise Edition']
        ]
        
        metadata_table = Table(metadata_data, colWidths=[2*inch, 4*inch])
        metadata_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('RIGHTPADDING', (0, 0), (-1, -1), 12),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(metadata_table)
        story.append(Spacer(1, 30))
        
        # Executive Summary
        story.append(Paragraph("EXECUTIVE SUMMARY", self.styles['CustomHeading']))
        story.append(Paragraph("VAJRA Security Platform is an AI-powered threat intelligence and risk analysis system designed to provide comprehensive cybersecurity monitoring. The platform specializes in ransomware threat detection, real-time attack monitoring, and proactive risk assessment for enterprise environments.", self.styles['CustomBody']))
        story.append(Spacer(1, 12))
        
        # Platform Overview
        story.append(Paragraph("PLATFORM OVERVIEW", self.styles['CustomHeading']))
        story.append(Paragraph("VAJRA integrates advanced threat intelligence feeds, machine learning algorithms, and real-time monitoring capabilities to deliver actionable security insights. The platform provides organizations with the visibility and intelligence needed to detect, prevent, and respond to cyber threats effectively.", self.styles['CustomBody']))
        story.append(Spacer(1, 12))
        
        # Key Features
        story.append(Paragraph("KEY PLATFORM FEATURES", self.styles['SubHeading']))
        features_data = [
            ['Feature', 'Description', 'Impact'],
            ['Real-time Monitoring', '24/7 threat surveillance across all attack vectors', 'Immediate threat detection'],
            ['AI-Powered Analysis', 'Machine learning for pattern recognition and anomaly detection', 'Reduced false positives'],
            ['Ransomware Intelligence', 'Specialized tracking of ransomware groups and campaigns', 'Proactive defense'],
            ['Risk Assessment', 'Comprehensive security scoring and vulnerability analysis', 'Prioritized remediation'],
            ['Threat Actor Tracking', 'Monitoring of APT groups and cybercriminal activities', 'Strategic threat awareness'],
            ['Incident Response', 'Automated alerting and incident management workflows', 'Faster response times']
        ]
        
        features_table = Table(features_data, colWidths=[1.5*inch, 2.5*inch, 2*inch])
        features_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.black),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 1), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 10),
        ]))
        story.append(features_table)
        story.append(Spacer(1, 25))
        
        # Ransomware Focus Section
        story.append(PageBreak())
        story.append(Paragraph("RANSOMWARE THREAT INTELLIGENCE", self.styles['CustomHeading']))
        story.append(Paragraph("Ransomware represents one of the most significant cybersecurity threats facing organizations today. VAJRA provides specialized ransomware intelligence to help organizations understand the threat landscape and implement effective defenses.", self.styles['CustomBody']))
        story.append(Spacer(1, 12))
        
        story.append(Paragraph("Ransomware Threat Landscape", self.styles['SubHeading']))
        story.append(Paragraph("• Tracking of 12+ active ransomware groups and variants", self.styles['BulletPoint']))
        story.append(Paragraph("• Real-time monitoring of ransomware campaigns and attack patterns", self.styles['BulletPoint']))
        story.append(Paragraph("• Analysis of targeted industries and sectors", self.styles['BulletPoint']))
        story.append(Paragraph("• Intelligence on ransomware-as-a-service (RaaS) operations", self.styles['BulletPoint']))
        story.append(Paragraph("• Historical data on ransomware incidents and trends", self.styles['BulletPoint']))
        
        story.append(Spacer(1, 20))
        
        story.append(Paragraph("Active Ransomware Groups Tracked", self.styles['SubHeading']))
        ransomware_data = [
            ['Group', 'Target Sectors', 'Threat Level', 'Recent Activity'],
            ['LockBit', 'Healthcare, Finance, Manufacturing', 'CRITICAL', 'High'],
            ['BlackCat/ALPHV', 'Technology, Retail, Energy', 'HIGH', 'Very High'],
            ['Cl0p', 'Manufacturing, Government, Education', 'HIGH', 'High'],
            ['Play', 'Technology, Healthcare, Finance', 'MEDIUM', 'Medium'],
            ['Hive', 'Retail, Healthcare, Logistics', 'MEDIUM', 'Low'],
            ['Royal', 'Finance, Technology, Legal', 'HIGH', 'Medium']
        ]
        
        ransomware_table = Table(ransomware_data, colWidths=[1.2*inch, 2*inch, 1.2*inch, 1.3*inch])
        ransomware_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.black),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 8),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 7),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 1), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
        ]))
        story.append(ransomware_table)
        story.append(Spacer(1, 25))
        
        story.append(Paragraph("Ransomware Defense Strategies", self.styles['SubHeading']))
        story.append(Paragraph("• Proactive threat hunting and vulnerability assessment", self.styles['BulletPoint']))
        story.append(Paragraph("• Real-time ransomware detection and prevention", self.styles['BulletPoint']))
        story.append(Paragraph("• Incident response planning and playbooks", self.styles['BulletPoint']))
        story.append(Paragraph("• Backup and recovery strategy validation", self.styles['BulletPoint']))
        story.append(Paragraph("• Employee training and awareness programs", self.styles['BulletPoint']))
        story.append(Paragraph("• Supply chain risk assessment and monitoring", self.styles['BulletPoint']))
        
        story.append(Spacer(1, 20))
        
        # Key Benefits Section
        story.append(PageBreak())
        story.append(Paragraph("KEY BENEFITS & ADVANTAGES", self.styles['CustomHeading']))
        
        story.append(Paragraph("Strategic Advantages", self.styles['SubHeading']))
        benefits_data = [
            ['Benefit', 'Description', 'Business Value'],
            ['Comprehensive Visibility', '360-degree view of threat landscape', 'Informed decision-making'],
            ['Proactive Defense', 'Threat detection before impact', 'Reduced breach risk'],
            ['Real-time Intelligence', 'Immediate threat awareness', 'Faster response times'],
            ['AI-Powered Insights', 'Machine learning-driven analysis', 'Improved accuracy'],
            ['Scalable Architecture', 'Enterprise-ready platform', 'Growth support'],
            ['Compliance Ready', 'Built-in regulatory compliance', 'Audit readiness']
        ]
        
        benefits_table = Table(benefits_data, colWidths=[1.5*inch, 2.5*inch, 2*inch])
        benefits_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.black),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 1), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 10),
        ]))
        story.append(benefits_table)
        story.append(Spacer(1, 25))
        
        story.append(Paragraph("Operational Benefits", self.styles['SubHeading']))
        story.append(Paragraph("• Reduced Mean Time to Detect (MTTD) and Mean Time to Respond (MTTR)", self.styles['BulletPoint']))
        story.append(Paragraph("• Automated threat intelligence reduces manual analysis burden", self.styles['BulletPoint']))
        story.append(Paragraph("• Centralized security monitoring and alerting", self.styles['BulletPoint']))
        story.append(Paragraph("• Integration with existing security infrastructure", self.styles['BulletPoint']))
        story.append(Paragraph("• Customizable dashboards and reporting", self.styles['BulletPoint']))
        story.append(Paragraph("• Scalable to meet organizational growth needs", self.styles['BulletPoint']))
        
        story.append(Spacer(1, 20))
        
        story.append(Paragraph("Financial Advantages", self.styles['SubHeading']))
        story.append(Paragraph("• Reduced cost of security incidents through early detection", self.styles['BulletPoint']))
        story.append(Paragraph("• Lower operational costs through automation", self.styles['BulletPoint']))
        story.append(Paragraph("• Protection against ransomware extortion payments", self.styles['BulletPoint']))
        story.append(Paragraph("• Compliance cost reduction through integrated reporting", self.styles['BulletPoint']))
        story.append(Paragraph("• Insurance premium optimization through improved security posture", self.styles['BulletPoint']))
        
        story.append(Spacer(1, 20))
        
        # Technical Architecture
        story.append(PageBreak())
        story.append(Paragraph("TECHNICAL ARCHITECTURE", self.styles['CustomHeading']))
        
        story.append(Paragraph("Core Components", self.styles['SubHeading']))
        architecture_data = [
            ['Component', 'Technology', 'Purpose'],
            ['Frontend', 'Next.js 13+, React, TypeScript', 'User interface and dashboard'],
            ['Backend', 'FastAPI, Python', 'API and business logic'],
            ['Database', 'PostgreSQL', 'Data persistence and analytics'],
            ['Cache', 'Redis', 'Real-time data and session management'],
            ['WebSocket', 'Real-time communication', 'Live updates and notifications'],
            ['AI/ML', 'Machine Learning Models', 'Threat detection and analysis'],
            ['PDF Generation', 'ReportLab', 'Report generation and export']
        ]
        
        architecture_table = Table(architecture_data, colWidths=[1.5*inch, 1.5*inch, 3*inch])
        architecture_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.black),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 1), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 10),
        ]))
        story.append(architecture_table)
        story.append(Spacer(1, 25))
        
        story.append(Paragraph("Security Features", self.styles['SubHeading']))
        story.append(Paragraph("• Role-based access control (RBAC)", self.styles['BulletPoint']))
        story.append(Paragraph("• End-to-end encryption for data in transit", self.styles['BulletPoint']))
        story.append(Paragraph("• Secure authentication and session management", self.styles['BulletPoint']))
        story.append(Paragraph("• Audit logging and compliance reporting", self.styles['BulletPoint']))
        story.append(Paragraph("• API rate limiting and DDoS protection", self.styles['BulletPoint']))
        story.append(Paragraph("• Regular security updates and vulnerability patching", self.styles['BulletPoint']))
        
        story.append(Spacer(1, 20))
        
        # Conclusion and Footer
        story.append(PageBreak())
        story.append(Paragraph("CONCLUSION", self.styles['CustomHeading']))
        story.append(Paragraph("VAJRA Security Platform provides organizations with a comprehensive solution for modern cybersecurity challenges. With specialized ransomware intelligence, AI-powered threat detection, and real-time monitoring capabilities, VAJRA enables proactive defense against evolving cyber threats.", self.styles['CustomBody']))
        story.append(Spacer(1, 12))
        story.append(Paragraph("The platform's modular architecture, enterprise-grade security features, and focus on actionable intelligence make it an ideal choice for organizations seeking to enhance their security posture while maintaining operational efficiency.", self.styles['CustomBody']))
        story.append(Spacer(1, 20))
        
        story.append(Paragraph("CONTACT & SUPPORT", self.styles['SubHeading']))
        story.append(Paragraph("For more information about VAJRA Security Platform, contact our team or visit our documentation portal.", self.styles['CustomBody']))
        
        story.append(Spacer(1, 30))
        
        # Footer
        footer_data = [[
            Paragraph(f"VAJRA Security Platform - Project Overview", self.styles['Footer']),
            Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", self.styles['Footer'])
        ]]
        
        footer_table = Table(footer_data, colWidths=[3.5*inch, 3.5*inch])
        footer_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ]))
        story.append(footer_table)
        
        story.append(Spacer(1, 8))
        story.append(Paragraph("CONFIDENTIAL - FOR INTERNAL USE ONLY - DISTRIBUTION RESTRICTED", self.styles['Footer']))
        
        doc.build(story, onFirstPage=self._add_page_border, onLaterPages=self._add_page_border)
        buffer.seek(0)
        return buffer.getvalue()

pdf_service = PDFReportService()
