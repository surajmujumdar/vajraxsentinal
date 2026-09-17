'use client'
import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Eye,
  CheckCircle2,
  ExternalLink,
  Code,
  ShieldCheck,
  ShieldAlert,
  Plus,
  Sparkles
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { SeverityBadge } from '../components/SeverityBadge';
import { ReportViewerModal } from '../components/ReportViewerModal';
import { getScorePosture } from '../utils/securityScore';

import { apiClient } from '../api/client';

export function Reports() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const avgSecurityScore = reports.length > 0
    ? Math.round(reports.reduce((acc, r) => acc + (r.riskScore || r.securityScore || 85), 0) / reports.length)
    : 100;
  const avgPosture = getScorePosture(avgSecurityScore);

  const loadReports = async () => {
    try {
      const data = await dashboardService.getReports();
      setReports(data || []);
      if (data && data.length > 0 && !selectedReport) {
        setSelectedReport(data[0]);
      }
    } catch (e) {
      console.error("Failed to load reports:", e);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleGenerateNewReport = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      // 1. Generate or regenerate report on backend
      await dashboardService.generateReport();
      // 2. Reload reports list
      const updated = await dashboardService.getReports();
      setReports(updated || []);
      if (updated && updated.length > 0) {
        setSelectedReport(updated[0]);
      }
    } catch (e) {
      console.error('Error generating report:', e);
      setErrorMsg(e.message || 'Failed to generate report on backend.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async (report, format) => {
    try {
      if (report.assessmentId) {
        await apiClient.downloadReportFile(report.assessmentId, format);
      } else {
        const element = document.createElement('a');
        const file = new Blob([JSON.stringify(report, null, 2)], {
          type: format === 'json' ? 'application/json' : 'text/html'
        });
        element.href = URL.createObjectURL(file);
        element.download = `Sentina_Report_${report.id || 'export'}.${format}`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
    } catch (err) {
      console.error(`Export failed for ${format}:`, err);
      // Fallback
      window.open(apiClient.getExportUrl(report.assessmentId, format), '_blank');
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '1600px' }}>
      {/* Top Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: 'rgba(255, 23, 68, 0.15)',
              border: '2px solid #ff1744',
              boxShadow: '0 0 14px rgba(255, 23, 68, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FileText size={20} color="#ff1744" />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#f8fafc', letterSpacing: '0.8px' }}>
              EXECUTIVE & TECHNICAL SECURITY REPORTS
            </h1>
            <p style={{ fontSize: '11.5px', color: '#a1a1aa', marginTop: '2px' }}>
              Automated compliance audits, OWASP Top 10 attestations, and executive risk summaries.
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerateNewReport}
          disabled={isGenerating}
          className="btn btn-primary"
          style={{ fontSize: '12px', padding: '8px 16px', gap: '6px' }}
        >
          <Sparkles size={14} />
          <span>{isGenerating ? 'Generating Audit Report...' : 'Generate New Report'}</span>
        </button>
      </div>

      {/* KPI Stats Row */}
      <div className="grid-4" style={{ marginBottom: '20px' }}>
        <div className="cyber-card" style={{ padding: '14px 16px', background: '#060108', border: '2.5px solid #360a25' }}>
          <div style={{ fontSize: '10px', fontWeight: 900, color: '#00f2fe', textTransform: 'uppercase' }}>TOTAL AUDIT REPORTS</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#f8fafc', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            {reports.length}
          </div>
        </div>

        <div className="cyber-card" style={{ padding: '14px 16px', background: '#060108', border: '2.5px solid #360a25' }}>
          <div style={{ fontSize: '10px', fontWeight: 900, color: '#00ff88', textTransform: 'uppercase' }}>COMPLIANCE STATUS</div>
          <div style={{ fontSize: '14px', fontWeight: 900, color: '#00ff88', marginTop: '10px' }}>
            ● OWASP & SOC2 READY
          </div>
        </div>

        <div className="cyber-card" style={{ padding: '14px 16px', background: '#060108', border: '2.5px solid #360a25' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '10px', fontWeight: 900, color: '#fbbf24', textTransform: 'uppercase' }}>AVG SECURITY SCORE</span>
            <span style={{ fontSize: '8.5px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: avgPosture.color }}>
              {reports.length === 0 ? 'OPTIMAL' : avgPosture.label}
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: avgPosture.color, fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            {avgSecurityScore}/100
          </div>
        </div>

        <div className="cyber-card" style={{ padding: '14px 16px', background: '#060108', border: '2.5px solid #360a25' }}>
          <div style={{ fontSize: '10px', fontWeight: 900, color: '#c084fc', textTransform: 'uppercase' }}>LEAD ATTESTATION</div>
          <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#c084fc', marginTop: '10px' }}>
            Sentina AI Engine
          </div>
        </div>
      </div>

      {/* Reports Table Card */}
      <div
        className="cyber-card"
        style={{
          padding: '16px 18px',
          background: '#060108',
          border: '3px solid #360a25',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.95)'
        }}
      >
        <div style={{ fontSize: '12px', fontWeight: 900, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px' }}>
          GENERATED AUDIT ARCHIVE
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Assessment Name</th>
                <th>Project Scope</th>
                <th>Audit Date</th>
                <th>Security Score</th>
                <th>Vulnerabilities Breakdown</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#71717a' }}>
                    No security reports generated yet. Click &quot;Generate New Report&quot; above to produce an audit report.
                  </td>
                </tr>
              ) : (
                reports.map((rep) => (
                  <tr
                    key={rep.id}
                    className="interactive-row"
                    onClick={() => setSelectedReport(rep)}
                  >
                    {/* Name */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '6px',
                            background: 'rgba(255, 23, 68, 0.15)',
                            border: '1.2px solid #ff1744',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ff1744'
                          }}
                        >
                          <FileText size={15} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '12.5px' }}>
                            {rep.assessmentName}
                          </div>
                          <div style={{ fontSize: '10px', color: '#71717a', fontFamily: 'var(--font-mono)' }}>
                            ID: {rep.assessmentId} • {rep.leadAuditor}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Project */}
                    <td style={{ color: '#00f2fe', fontWeight: 700, fontSize: '12px' }}>
                      {rep.project}
                    </td>

                    {/* Date */}
                    <td style={{ color: '#71717a', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                      {rep.date}
                    </td>

                    {/* Score */}
                    <td>
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 900,
                          fontFamily: 'var(--font-mono)',
                          color: rep.riskScore >= 80 ? '#00ff88' : '#fbbf24'
                        }}
                      >
                        {rep.riskScore}/100
                      </span>
                    </td>

                    {/* Counts */}
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <span
                          style={{
                            fontSize: '9.5px',
                            fontFamily: 'var(--font-mono)',
                            padding: '2px 5px',
                            borderRadius: '3px',
                            background: 'rgba(255, 23, 68, 0.18)',
                            color: '#ff2a4d',
                            border: '1px solid #ff1744',
                            fontWeight: 800
                          }}
                        >
                          {rep.counts?.critical || 0} Crit
                        </span>
                        <span
                          style={{
                            fontSize: '9.5px',
                            fontFamily: 'var(--font-mono)',
                            padding: '2px 5px',
                            borderRadius: '3px',
                            background: 'rgba(249, 115, 22, 0.18)',
                            color: '#f97316',
                            border: '1px solid #f97316',
                            fontWeight: 800
                          }}
                        >
                          {rep.counts?.high || 0} High
                        </span>
                        <span
                          style={{
                            fontSize: '9.5px',
                            fontFamily: 'var(--font-mono)',
                            padding: '2px 5px',
                            borderRadius: '3px',
                            background: 'rgba(251, 191, 36, 0.18)',
                            color: '#fbbf24',
                            border: '1px solid #fbbf24',
                            fontWeight: 800
                          }}
                        >
                          {rep.counts?.medium || 0} Med
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: 'rgba(0, 255, 136, 0.15)',
                          color: '#00ff88',
                          border: '1.2px solid #00ff88'
                        }}
                      >
                        <CheckCircle2 size={10} /> {rep.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReport(rep);
                          }}
                          className="btn btn-primary btn-xs"
                          style={{ height: '24px', padding: '0 8px', fontSize: '10.5px' }}
                        >
                          <Eye size={11} /> View
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExport(rep, 'pdf');
                          }}
                          className="btn btn-secondary btn-xs"
                          style={{ height: '24px', padding: '0 8px', fontSize: '10.5px' }}
                          title="Download PDF Report"
                        >
                          <FileText size={11} /> PDF
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExport(rep, 'html');
                          }}
                          className="btn btn-secondary btn-xs"
                          style={{ height: '24px', padding: '0 8px', fontSize: '10.5px' }}
                          title="Download HTML Report"
                        >
                          <Download size={11} /> HTML
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExport(rep, 'json');
                          }}
                          className="btn btn-secondary btn-xs"
                          style={{ height: '24px', padding: '0 8px', fontSize: '10.5px' }}
                          title="Download JSON Report"
                        >
                          <Code size={11} /> JSON
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <ReportViewerModal
        report={selectedReport}
        isOpen={Boolean(selectedReport)}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
}

export default Reports;
