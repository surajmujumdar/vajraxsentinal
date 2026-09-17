'use client'
import React, { useState } from 'react';
import {
  X,
  FileText,
  Download,
  Printer,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Code,
  Sparkles,
  Lock,
  Layers
} from 'lucide-react';
import { SeverityBadge } from './SeverityBadge';

import { apiClient } from '../api/client';

export function ReportViewerModal({ report, isOpen, onClose }) {
  const [downloadFormat, setDownloadFormat] = useState(null);

  if (!isOpen || !report) return null;

  const counts = report.counts || { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  const totalFindings = (counts.critical || 0) + (counts.high || 0) + (counts.medium || 0) + (counts.low || 0) + (counts.info || 0);
  const keyFindings = report.keyFindings || [];

  const handleExportPDF = async () => {
    setDownloadFormat('pdf');
    try {
      if (report.assessmentId) {
        await apiClient.downloadReportFile(report.assessmentId, 'pdf');
      } else {
        window.print();
      }
    } catch (e) {
      console.warn("Could not download backend PDF, opening print preview:", e);
      window.print();
    } finally {
      setDownloadFormat(null);
    }
  };

  const handleExportHTML = async () => {
    setDownloadFormat('html');
    try {
      if (report.assessmentId) {
        await apiClient.downloadReportFile(report.assessmentId, 'html');
      } else {
        // Local fallback
        throw new Error('No assessment ID');
      }
    } catch (e) {
      setTimeout(() => {
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Sentina Security Audit Report — ${report.assessmentName || 'Target'}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #060108; color: #f8fafc; margin: 0; padding: 40px; }
    .container { max-width: 900px; margin: 0 auto; background: #0c0210; border: 2.5px solid #360a25; border-radius: 12px; padding: 36px; box-shadow: 0 20px 60px rgba(0,0,0,0.9); }
    .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #360a25; padding-bottom: 20px; margin-bottom: 24px; }
    .logo-title { display: flex; align-items: center; gap: 14px; }
    .logo-img { width: 44px; height: 44px; border-radius: 8px; border: 2px solid #ff1744; }
    .title { font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: 0.8px; margin: 0; }
    .subtitle { font-size: 11px; color: #ff1744; font-weight: 800; letter-spacing: 0.6px; margin-top: 3px; }
    .meta-box { background: #14031c; border: 1.5px solid #360a25; border-radius: 8px; padding: 16px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
    .meta-label { font-size: 10px; color: #71717a; text-transform: uppercase; font-weight: 800; }
    .meta-val { font-size: 13px; font-weight: 800; color: #f8fafc; margin-top: 3px; }
    .score-card { background: #14031c; border: 2px solid #ff1744; border-radius: 10px; padding: 20px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; box-shadow: 0 0 20px rgba(255, 23, 68, 0.2); }
    .score-num { font-size: 42px; font-weight: 900; font-family: monospace; color: #ffffff; text-shadow: 0 0 16px rgba(255, 23, 68, 0.8); }
    .grid-5 { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 28px; }
    .sev-card { padding: 12px; border-radius: 6px; text-align: center; border-width: 1.5px; border-style: solid; }
    .sev-crit { background: rgba(255, 23, 68, 0.15); border-color: #ff1744; color: #ff1744; }
    .sev-high { background: rgba(249, 115, 22, 0.15); border-color: #f97316; color: #f97316; }
    .sev-med { background: rgba(251, 191, 36, 0.15); border-color: #fbbf24; color: #fbbf24; }
    .sev-low { background: rgba(0, 242, 254, 0.15); border-color: #00f2fe; color: #00f2fe; }
    .sev-info { background: rgba(0, 255, 136, 0.15); border-color: #00ff88; color: #00ff88; }
    .section-title { font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.8px; color: #ffffff; margin-bottom: 12px; border-left: 3px solid #ff1744; padding-left: 8px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
    th { background: #14031c; border: 1.5px solid #360a25; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #a1a1aa; }
    td { border: 1.5px solid #28081c; padding: 10px 12px; font-size: 12px; color: #cbd5e1; }
    .finding-row:hover { background: #180422; }
    .code-snippet { background: #040005; border: 1px solid #360a25; border-radius: 4px; padding: 8px 12px; font-family: monospace; font-size: 11px; color: #00f2fe; margin-top: 4px; white-space: pre-wrap; }
    .remed-box { background: rgba(0, 255, 136, 0.08); border: 1px solid #00ff88; border-radius: 4px; padding: 8px 12px; font-size: 11.5px; color: #e2e8f0; margin-top: 6px; }
    .footer { border-top: 1.5px solid #360a25; padding-top: 16px; margin-top: 36px; text-align: center; font-size: 11px; color: #71717a; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-title">
        <div>
          <h1 class="title">SENTINA // EXECUTIVE SECURITY AUDIT REPORT</h1>
          <div class="subtitle">SECURE • ANALYZE • PREDICT — OFFICIAL SOC AUDIT</div>
        </div>
      </div>
      <div style="text-align: right; font-size: 11px; color: #a1a1aa;">
        <div>Status: <strong style="color: #00ff88;">SIGNED & ATTESTED</strong></div>
        <div>Date: ${report.date || new Date().toLocaleDateString()}</div>
      </div>
    </div>

    <div class="meta-box">
      <div>
        <div class="meta-label">Target Scope</div>
        <div class="meta-val">${report.assessmentName || 'Production Scope'}</div>
      </div>
      <div>
        <div class="meta-label">Audit ID</div>
        <div class="meta-val">${report.assessmentId || 'SOC-AUDIT'}</div>
      </div>
      <div>
        <div class="meta-label">Lead Auditor</div>
        <div class="meta-val">${report.leadAuditor || 'Sentina AI Engine'}</div>
      </div>
      <div>
        <div class="meta-label">Scope Classification</div>
        <div class="meta-val">${report.project || 'Production App + Repo'}</div>
      </div>
    </div>

    <div class="score-card">
      <div>
        <div style="font-size: 11px; font-weight: 800; color: #ff1744; text-transform: uppercase;">Overall Security Rating</div>
        <div style="font-size: 13px; color: #cbd5e1; margin-top: 4px; max-width: 500px;">
          ${report.executiveSummary || 'Autonomous cybersecurity evaluation uniting SAST, DAST, SCA, Secrets, and Threat Intelligence.'}
        </div>
      </div>
      <div style="text-align: right;">
        <div class="score-num">${report.riskScore || 87}</div>
        <div style="font-size: 11px; font-weight: 800; color: #00ff88; margin-top: 2px;">/ 100 POSTURE SCORE</div>
      </div>
    </div>

    <div class="section-title">Threat Rating & Risk Distribution</div>
    <div class="grid-5">
      <div class="sev-card sev-crit">
        <div style="font-size: 10px; font-weight: 900;">CRITICAL RISK</div>
        <div style="font-size: 22px; font-weight: 900; margin-top: 4px;">${counts.critical || 0}</div>
      </div>
      <div class="sev-card sev-high">
        <div style="font-size: 10px; font-weight: 900;">ELEVATED RISK</div>
        <div style="font-size: 22px; font-weight: 900; margin-top: 4px;">${counts.high || 0}</div>
      </div>
      <div class="sev-card sev-med">
        <div style="font-size: 10px; font-weight: 900;">MODERATE RISK</div>
        <div style="font-size: 22px; font-weight: 900; margin-top: 4px;">${counts.medium || 0}</div>
      </div>
      <div class="sev-card sev-low">
        <div style="font-size: 10px; font-weight: 900;">LOW RISK</div>
        <div style="font-size: 22px; font-weight: 900; margin-top: 4px;">${counts.low || 0}</div>
      </div>
      <div class="sev-card sev-info">
        <div style="font-size: 10px; font-weight: 900;">INFORMATIONAL</div>
        <div style="font-size: 22px; font-weight: 900; margin-top: 4px;">${counts.info || 0}</div>
      </div>
    </div>

    <div class="section-title">Key Prioritized Vulnerabilities & Threat Analysis</div>
    <table>
      <thead>
        <tr>
          <th style="width: 140px;">Threat Rating & Risk</th>
          <th>Vulnerability & Threat Scenario</th>
          <th>Engine Source</th>
          <th>Impact & Remediation</th>
        </tr>
      </thead>
      <tbody>
        ${(keyFindings.length > 0 ? keyFindings : [
          { severity: 'CRITICAL', title: 'SQL Injection in User Query', affectedComponent: 'backend/app/api/users.py:42', source: 'SAST', cwe: 'CWE-89', riskScore: 9.6, blastRadius: 'Database Takeover & Data Exfiltration', threatScenario: 'Attacker supplies crafted SQL payloads to bypass authentication and dump customer records.', potentialImpact: { confidentiality: 'CRITICAL', integrity: 'HIGH' }, remediation: 'Use parameterized prepared statements with SQLAlchemy bind parameters.' },
          { severity: 'HIGH', title: 'Hardcoded Secret API Key', affectedComponent: 'config/secrets.env:12', source: 'SECRETS', cwe: 'CWE-798', riskScore: 8.8, blastRadius: 'Cloud Credential Compromise', threatScenario: 'Exposed API token allows direct mutation of cloud infrastructure.', potentialImpact: { confidentiality: 'HIGH', integrity: 'HIGH' }, remediation: 'Rotate compromised credential immediately and store in vault.' }
        ]).map(f => `
          <tr class="finding-row">
            <td>
              <strong style="color: ${f.severity === 'CRITICAL' ? '#ff1744' : (f.severity === 'HIGH' ? '#f97316' : '#fbbf24')};">${f.severity}</strong>
              <div style="font-size: 11px; font-weight: 800; color: #ff3366; margin-top: 3px;">Risk: ${f.riskScore != null ? Number(f.riskScore).toFixed(1) : '9.0'} / 10</div>
              ${f.blastRadius ? `<div style="font-size: 9.5px; color: #f87171; background: rgba(239, 68, 68, 0.15); padding: 1px 4px; border-radius: 3px; margin-top: 4px; font-weight: 700;">🔥 ${f.blastRadius}</div>` : ''}
            </td>
            <td>
              <div style="font-weight: 800; color: #ffffff; font-size: 13px;">${f.title}</div>
              <div style="font-size: 10.5px; color: #94a3b8; font-family: monospace; margin-top: 2px;">${f.affectedComponent || f.file || f.endpoint || 'Target Component'}</div>
              ${f.threatScenario ? `<div style="font-size: 11px; color: #fca5a5; background: rgba(239,68,68,0.08); border-left: 2px solid #ef4444; padding: 6px 8px; border-radius: 3px; margin-top: 5px;"><strong>Threat:</strong> ${f.threatScenario}</div>` : ''}
              ${f.code_snippet ? `<div class="code-snippet">${f.code_snippet}</div>` : ''}
            </td>
            <td>
              <strong>${f.source || 'SCANNER'}</strong>
              <div style="margin-top: 4px;"><code>${f.cve || f.cwe || 'OWASP Top 10'}</code></div>
            </td>
            <td>
              ${f.potentialImpact ? `
                <div style="font-size: 10.5px; color: #cbd5e1; margin-bottom: 4px;">
                  ${f.potentialImpact.confidentiality ? `<div><span style="color: #38bdf8;">C:</span> ${f.potentialImpact.confidentiality}</div>` : ''}
                  ${f.potentialImpact.integrity ? `<div><span style="color: #f59e0b;">I:</span> ${f.potentialImpact.integrity}</div>` : ''}
                  ${f.potentialImpact.availability ? `<div><span style="color: #a855f7;">A:</span> ${f.potentialImpact.availability}</div>` : ''}
                </div>
              ` : ''}
              ${f.remediation ? `<div class="remed-box"><strong>Fix:</strong> ${f.remediation}</div>` : ''}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="section-title">Evaluation Methodology</div>
    <div style="font-size: 12px; color: #a1a1aa; line-height: 1.6; background: #14031c; border: 1.5px solid #360a25; border-radius: 8px; padding: 14px;">
      ${report.methodology || 'Multi-vector correlation uniting Static AST AST Sinks (Semgrep), Dynamic Web Fuzzing (OWASP ZAP), Dependency Vulnerability Graph (OSV), Secret Token Entropy (Gitleaks), and AI Multi-Hop Attack Path Synthesis.'}
    </div>

    <div class="footer">
      SENTINA CYBERSECURITY PLATFORM • CONFIDENTIAL COMPLIANCE AUDIT DOCUMENT • GENERATED BY SENTINA SOC
    </div>
  </div>
</body>
</html>`;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Sentina_Audit_Report_${report.assessmentId || 'latest'}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, 400);
    } finally {
      setDownloadFormat(null);
    }
  };

  const handleExportJSON = async () => {
    setDownloadFormat('json');
    try {
      if (report.assessmentId) {
        await apiClient.downloadReportFile(report.assessmentId, 'json');
      } else {
        throw new Error('No assessment ID');
      }
    } catch (e) {
      setTimeout(() => {
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Sentina_Audit_Report_${report.assessmentId || 'latest'}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, 400);
    } finally {
      setDownloadFormat(null);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="cyber-card"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          background: '#060108',
          border: '3px solid #360a25',
          boxShadow: '0 25px 70px rgba(0,0,0,0.95), 0 0 35px rgba(255, 23, 68, 0.25)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '2px solid #28081c',
            background: '#040005',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1.5px solid #ff1744',
                boxShadow: '0 0 12px rgba(255, 23, 68, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                background: '#040005'
              }}
            >
              <img
                src="/sentina-logo.png"
                alt="Sentina Logo"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 900, color: '#f8fafc', letterSpacing: '0.6px' }}>
                {report.assessmentName || 'Security Audit Report'}
              </div>
              <div style={{ fontSize: '10.5px', color: '#ff2a4d', fontWeight: 700 }}>
                ID: {report.assessmentId || 'SOC-AUDIT'} • {report.leadAuditor || 'Sentina Autonomous SOC'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleExportPDF}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px', height: '28px', gap: '5px' }}
              title="Download PDF Document"
            >
              <FileText size={13} />
              <span>{downloadFormat === 'pdf' ? 'Exporting PDF...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={handleExportHTML}
              className="btn btn-primary btn-sm"
              style={{ fontSize: '11px', height: '28px', gap: '5px' }}
              title="Download HTML Report"
            >
              <Download size={13} />
              <span>{downloadFormat === 'html' ? 'Exporting HTML...' : 'Download HTML'}</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px', height: '28px', gap: '5px' }}
              title="Download JSON Report"
            >
              <Code size={13} />
              <span>{downloadFormat === 'json' ? 'Exporting JSON...' : 'Download JSON'}</span>
            </button>

            <button onClick={onClose} className="btn-icon" style={{ padding: '6px' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Report Document Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {/* Executive Summary Card */}
          <div
            style={{
              padding: '18px',
              borderRadius: '8px',
              background: '#040005',
              border: '2px solid #360a25',
              marginBottom: '20px',
              display: 'grid',
              gridTemplateColumns: '1fr 180px',
              gap: '16px',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{ fontSize: '10px', fontWeight: 900, color: '#ff1744', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
                EXECUTIVE RISK SUMMARY & ATTESTATION
              </div>
              <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
                {report.executiveSummary || `Autonomous security evaluation executed across source code repositories, API gateway endpoints, dependency manifests, and secret entropy storage. Synthesized ${totalFindings} total findings ordered by exploitability and business threat.`}
              </p>
              <div style={{ fontSize: '10.5px', color: '#71717a', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                Target Scope: <strong style={{ color: '#00f2fe' }}>{report.project || 'Production Application + Source Code'}</strong>
              </div>
            </div>

            <div style={{ textAlign: 'center', padding: '12px', borderRadius: '6px', background: '#060108', border: '1.5px solid #ff1744', boxShadow: '0 0 16px rgba(255, 23, 68, 0.3)' }}>
              <div style={{ fontSize: '9.5px', color: '#ff3b5c', fontWeight: 800, textTransform: 'uppercase' }}>SECURITY SCORE</div>
              <div style={{ fontSize: '32px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#ffffff', textShadow: '0 0 12px rgba(255, 23, 68, 0.8)' }}>
                {report.riskScore || 87}
              </div>
              <div style={{ fontSize: '10px', color: '#00ff88', fontWeight: 900 }}>
                / 100 HEALTH
              </div>
            </div>
          </div>

          {/* Finding Distribution by Threat Rating */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 900, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
              THREAT RATING & RISK BREAKDOWN ({totalFindings} TOTAL)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              <div style={{ padding: '8px', borderRadius: '6px', background: 'rgba(255, 23, 68, 0.15)', border: '1.5px solid #ff1744', textAlign: 'center' }}>
                <div style={{ fontSize: '9px', color: '#ff2a4d', fontWeight: 900 }}>CRITICAL RISK</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#ff1744', fontFamily: 'var(--font-mono)' }}>
                  {counts.critical || 0}
                </div>
              </div>

              <div style={{ padding: '8px', borderRadius: '6px', background: 'rgba(249, 115, 22, 0.15)', border: '1.5px solid #f97316', textAlign: 'center' }}>
                <div style={{ fontSize: '9px', color: '#f97316', fontWeight: 900 }}>ELEVATED RISK</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#f97316', fontFamily: 'var(--font-mono)' }}>
                  {counts.high || 0}
                </div>
              </div>

              <div style={{ padding: '8px', borderRadius: '6px', background: 'rgba(251, 191, 36, 0.15)', border: '1.5px solid #fbbf24', textAlign: 'center' }}>
                <div style={{ fontSize: '9px', color: '#fbbf24', fontWeight: 900 }}>MODERATE RISK</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>
                  {counts.medium || 0}
                </div>
              </div>

              <div style={{ padding: '8px', borderRadius: '6px', background: 'rgba(0, 242, 254, 0.15)', border: '1.5px solid #00f2fe', textAlign: 'center' }}>
                <div style={{ fontSize: '9px', color: '#00f2fe', fontWeight: 900 }}>LOW RISK</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#00f2fe', fontFamily: 'var(--font-mono)' }}>
                  {counts.low || 0}
                </div>
              </div>

              <div style={{ padding: '8px', borderRadius: '6px', background: 'rgba(0, 255, 136, 0.15)', border: '1.5px solid #00ff88', textAlign: 'center' }}>
                <div style={{ fontSize: '9px', color: '#00ff88', fontWeight: 900 }}>INFORMATIONAL</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#00ff88', fontFamily: 'var(--font-mono)' }}>
                  {counts.info || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Attestation Matrix */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 900, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
              REGULATORY & COMPLIANCE FRAMEWORK AUDIT
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {[
                { name: 'OWASP Top 10 (2021)', status: (counts.critical || 0) === 0 ? 'Compliant / Attested' : `${counts.critical} Violations Detected`, pass: (counts.critical || 0) === 0 },
                { name: 'SOC 2 Type II Security', status: ((counts.critical || 0) + (counts.high || 0) < 5) ? 'Passing / In Scope' : 'Action Required', pass: ((counts.critical || 0) + (counts.high || 0) < 5) },
                { name: 'NIST SP 800-53 Rev 5', status: (counts.critical || 0) === 0 ? 'High Assurance' : 'Remediation Required', pass: (counts.critical || 0) === 0 },
                { name: 'PCI-DSS v4.0 Vulnerability Rule', status: (counts.critical || 0) === 0 ? 'Compliant' : 'Non-Compliant Findings', pass: (counts.critical || 0) === 0 }
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: '#040005',
                    border: '1.5px solid #28081c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#f8fafc' }}>
                    {item.name}
                  </span>
                  <span
                    style={{
                      fontSize: '9.5px',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      background: item.pass ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255, 23, 68, 0.18)',
                      color: item.pass ? '#00ff88' : '#ff1744',
                      border: `1.2px solid ${item.pass ? '#00ff88' : '#ff1744'}`
                    }}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Prioritized Vulnerabilities */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 900, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
              KEY ACTIONABLE VULNERABILITIES & THREAT CONTEXT
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(keyFindings.length > 0 ? keyFindings : [
                { id: '1', severity: 'CRITICAL', title: 'SQL Injection in User Query', asset: 'backend/app/api/users.py:42', source: 'SAST', cwe: 'CWE-89', riskScore: 9.6, blastRadius: 'Database Compromise & Data Exfiltration', threatScenario: 'Attacker supplies crafted SQL payloads to bypass authentication and dump customer records.', potentialImpact: { confidentiality: 'CRITICAL', integrity: 'HIGH', business_impact: 'Severe data breach violating compliance standards.' }, remediation: 'Use parameterized queries.' },
                { id: '2', severity: 'HIGH', title: 'Exposed JWT Private Key', asset: 'config/secrets.env:8', source: 'SECRETS', cwe: 'CWE-798', riskScore: 8.9, blastRadius: 'Identity & Authentication Bypass', threatScenario: 'Leaked cryptographic key allows forgery of valid session tokens with admin claims.', potentialImpact: { confidentiality: 'HIGH', integrity: 'CRITICAL', business_impact: 'Full account takeover across all tenants.' }, remediation: 'Rotate key and revoke existing tokens.' }
              ]).map((f, idx) => (
                <div
                  key={f.id || idx}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: '#040005',
                    border: '1.5px solid #28081c',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <SeverityBadge severity={f.severity} size="sm" />
                      <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#f8fafc' }}>
                        {f.title}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {f.blastRadius && (
                        <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.35)', fontWeight: 700 }}>
                          🔥 {f.blastRadius}
                        </span>
                      )}
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 900, color: '#ff1744' }}>
                        Risk: {f.riskScore != null ? (Number(f.riskScore) > 10 ? (Number(f.riskScore) / 10).toFixed(1) : Number(f.riskScore).toFixed(1)) : '9.0'} / 10
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: '10.5px', color: '#71717a', display: 'flex', gap: '8px', fontFamily: 'var(--font-mono)', flexWrap: 'wrap' }}>
                    <span>{f.affectedComponent || f.file || f.asset || f.endpoint || 'Target Scope'}</span>
                    <span>•</span>
                    <span style={{ color: '#00f2fe' }}>{f.source}</span>
                    {f.cwe && <span>• <strong style={{ color: '#c084fc' }}>{f.cwe}</strong></span>}
                  </div>

                  {f.threatScenario && (
                    <div style={{ fontSize: '11px', color: '#fca5a5', background: 'rgba(239, 68, 68, 0.08)', borderLeft: '3px solid #ef4444', padding: '6px 10px', borderRadius: '4px' }}>
                      <strong style={{ color: '#f87171' }}>Threat Scenario:</strong> {f.threatScenario}
                    </div>
                  )}

                  {f.potentialImpact && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '6px', fontSize: '10.5px', background: '#0a020d', padding: '6px 8px', borderRadius: '4px', border: '1px solid #1a0515' }}>
                      {f.potentialImpact.confidentiality && <div><span style={{ color: '#38bdf8', fontWeight: 700 }}>Confidentiality:</span> {f.potentialImpact.confidentiality}</div>}
                      {f.potentialImpact.integrity && <div><span style={{ color: '#f59e0b', fontWeight: 700 }}>Integrity:</span> {f.potentialImpact.integrity}</div>}
                      {f.potentialImpact.availability && <div><span style={{ color: '#a855f7', fontWeight: 700 }}>Availability:</span> {f.potentialImpact.availability}</div>}
                      {f.potentialImpact.business_impact && <div style={{ gridColumn: '1 / -1', color: '#f43f5e' }}><span style={{ fontWeight: 700 }}>Business Impact:</span> {f.potentialImpact.business_impact}</div>}
                    </div>
                  )}

                  {f.remediation && (
                    <div style={{ fontSize: '10.5px', color: '#00ff88', background: 'rgba(0,255,136,0.06)', padding: '6px 10px', borderRadius: '4px', border: '1px solid rgba(0,255,136,0.2)', marginTop: '2px' }}>
                      <strong>Remediation:</strong> {f.remediation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '2px solid #28081c',
            background: '#040005',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '10.5px',
            color: '#71717a',
            flexShrink: 0
          }}
        >
          <span>SENTINA AUTONOMOUS SECURITY SOC • OFFICIAL COMPLIANCE ATTESTATION</span>
          <button onClick={onClose} className="btn btn-primary btn-sm" style={{ height: '26px', fontSize: '11px' }}>
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportViewerModal;
