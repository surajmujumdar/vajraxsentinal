import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  Layers, 
  Globe, 
  FileCode, 
  Network, 
  Clock,
  RefreshCw,
  Terminal,
  Trash2
} from 'lucide-react';
import { apiClient } from '../api/client';
import { RiskGauge } from '../components/RiskGauge';
import { SeverityBadge } from '../components/SeverityBadge';
import { FindingDrawer } from '../components/FindingDrawer';
import { CorrelatedRiskCard } from '../components/CorrelatedRiskCard';

export const AssessmentDetails = ({ assessmentId, onBack, onViewAllFindings }) => {
  const [assessment, setAssessment] = useState(null);
  const [correlatedRisks, setCorrelatedRisks] = useState([]);
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  useEffect(() => {
    loadAssessmentData();
    // Poll if assessment is currently running
    const interval = setInterval(() => {
      if (assessment && assessment.status !== 'COMPLETED' && assessment.status !== 'FAILED' && assessment.status !== 'CANCELLED') {
        loadAssessmentData(false);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [assessmentId, assessment?.status]);

  const loadAssessmentData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [assData, corrData, findingsData] = await Promise.all([
        apiClient.getAssessment(assessmentId),
        apiClient.getCorrelatedRisks(assessmentId),
        apiClient.getFindings({ assessment_id: assessmentId, limit: 100 })
      ]);
      setAssessment(assData);
      setCorrelatedRisks(corrData);
      setFindings(findingsData);
    } catch (err) {
      console.error('Failed to load assessment details:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleExport = (format) => {
    const url = apiClient.getExportUrl(assessmentId, format);
    window.open(url, '_blank');
  };

  const handleDeleteAssessment = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete Assessment #${assessmentId.slice(0, 8)}? All findings, telemetry logs, and report files will be deleted.`)) {
      return;
    }
    setDeleting(true);
    try {
      await apiClient.deleteAssessment(assessmentId);
      if (onBack) {
        onBack();
      }
    } catch (err) {
      alert(`Failed to delete assessment: ${err.message}`);
      setDeleting(false);
    }
  };

  if (loading && !assessment) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="scanning-pulse" style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#00f2fe', margin: '0 auto 16px' }} />
          <p style={{ color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>Loading Assessment Telemetry...</p>
        </div>
      </div>
    );
  }

  const getDetectedWaf = () => {
    let wafName = null;
    let isBlocked = false;

    if (assessment?.logs) {
      for (const log of assessment.logs) {
        const msg = (typeof log === 'string' ? log : (log.message || '')).toUpperCase();
        if (msg.includes('AKAMAI')) wafName = 'Akamai WAF';
        else if (msg.includes('CLOUDFLARE')) wafName = 'Cloudflare WAF';
        else if (msg.includes('AWS')) wafName = 'AWS WAF';
        else if (msg.includes('IMPERVA') || msg.includes('INCAPSULA')) wafName = 'Imperva WAF';
        else if (msg.includes('MODSECURITY')) wafName = 'ModSecurity WAF';

        if (msg.includes('WAF_BLOCK:') || msg.includes('STATUS 403') || msg.includes('WAF BLOCKED REQUEST')) {
          isBlocked = true;
        }
      }
    }

    if (findings && findings.length > 0) {
      const hasBlockedFinding = findings.some(f => 
        (f.title || '').startsWith('WAF Block') ||
        (f.title || '').includes('HTTP 403 Forbidden')
      );
      if (hasBlockedFinding) isBlocked = true;
    }

    if (wafName && isBlocked) {
      return { wafName, statusText: `${wafName} (BLOCKED)`, isBlocked: true, wafDetected: true };
    }
    if (isBlocked) {
      return { wafName: 'Firewall Blocked', statusText: 'FIREWALL BLOCKED (HTTP 403)', isBlocked: true, wafDetected: true };
    }
    return { wafName: wafName || 'None', statusText: wafName ? `${wafName} (CLEAR)` : 'NONE DETECTED (PASSED)', isBlocked: false, wafDetected: Boolean(wafName) };
  };

  const isRunning = assessment?.status !== 'COMPLETED' && assessment?.status !== 'FAILED' && assessment?.status !== 'CANCELLED';
  const filteredFindings = filterSeverity === 'ALL' ? findings : findings.filter(f => f.severity === filterSeverity);

  return (
    <div className="page-container">
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn btn-secondary btn-sm" onClick={onBack}>
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 className="title-gradient" style={{ fontSize: '24px' }}>
                Assessment Report #{assessment.id.slice(0, 8)}
              </h1>
              <span style={{
                fontSize: '11px',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '4px',
                background: isRunning ? 'rgba(0, 242, 254, 0.15)' : (assessment.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 51, 102, 0.15)'),
                color: isRunning ? '#00f2fe' : (assessment.status === 'COMPLETED' ? '#10b981' : '#ff3366')
              }}>
                {assessment.status}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
              Created: {new Date(assessment.created_at).toLocaleString()} • Type: {assessment.assessment_type?.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Action and Report Export Buttons */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => loadAssessmentData(true)}>
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
          {assessment.status === 'COMPLETED' && (
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => handleExport('json')}>
                <Download size={14} />
                <span>JSON</span>
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => handleExport('pdf')}>
                <Download size={14} />
                <span>PDF</span>
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => handleExport('html')}>
                <FileText size={14} />
                <span>Interactive HTML</span>
              </button>
            </>
          )}
          <button 
            className="btn btn-secondary btn-sm"
            onClick={handleDeleteAssessment}
            disabled={deleting}
            style={{
              background: 'rgba(255, 51, 102, 0.12)',
              border: '1px solid rgba(255, 51, 102, 0.4)',
              color: '#ff3366',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Trash2 size={14} />
            <span>{deleting ? 'Deleting...' : 'Delete'}</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px', marginBottom: '28px' }}>
        {/* Risk Gauge Card */}
        <div className="cyber-card cyber-card-glow" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
            Assessment Risk Index
          </div>
          <RiskGauge score={assessment.overall_risk_score} size={150} />
        </div>

        {/* Breakdown Stats */}
        <div className="cyber-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Critical</div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#ff3366', fontFamily: 'var(--font-mono)' }}>
                {assessment.critical_count ?? findings.filter(f => f.severity === 'CRITICAL').length}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>High</div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>
                {assessment.high_count ?? findings.filter(f => f.severity === 'HIGH').length}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Medium</div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#eab308', fontFamily: 'var(--font-mono)' }}>
                {assessment.medium_count ?? findings.filter(f => f.severity === 'MEDIUM').length}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Low / Info</div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                {(assessment.low_count !== undefined && assessment.info_count !== undefined) ? (assessment.low_count + assessment.info_count) : findings.filter(f => f.severity === 'LOW' || f.severity === 'INFO').length}
              </div>
            </div>
          </div>

          {/* Scope Target Info */}
          <div style={{
            background: '#090d16',
            border: '1px solid #1e293b',
            borderRadius: '8px',
            padding: '12px 16px',
            marginTop: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '13px'
          }}>
            <div>
              <span style={{ color: '#64748b' }}>Repository: </span>
              <span style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>{assessment.repository_info?.url || 'Source Code Upload'}</span>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Target URL: </span>
              <span style={{ color: '#00f2fe', fontFamily: 'var(--font-mono)' }}>{assessment.target_info?.url || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* TARGET PROFILE CARD */}
      <div className="w-full tech-border-card rounded-xl p-5 bg-command-950/90 border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.15)] font-sans text-white mb-6">
        <div className="pb-3 border-b border-cyan-900/40 mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 shadow-[0_0_8px_#38bdf8]"></span>
            <h3 className="font-hud font-bold text-sm tracking-widest text-cyan-200 uppercase drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]">
              TARGET PROFILE
            </h3>
            <span className="hud-slashes"></span>
          </div>
          <span className="px-2.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 font-mono text-[10px] font-bold text-cyan-300 shadow-[0_0_8px_rgba(0,242,254,0.2)]">
            SCOPE ANALYSIS
          </span>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {/* Field 1: Target Scope */}
          <div className="p-3 rounded-lg bg-command-900/90 border border-cyan-900/60 flex flex-col space-y-1 hover:border-cyan-500/40 transition-colors shadow-inner">
            <span className="text-[11px] text-slate-400 font-bold">Target Scope</span>
            <span className="text-sm font-bold text-white tracking-wide truncate">
              {assessment.repository_info?.url || assessment.target_info?.url || 'Target Scope'}
            </span>
          </div>

          {/* Field 2: Target Type */}
          <div className="p-3 rounded-lg bg-command-900/90 border border-cyan-900/60 flex flex-col space-y-1 hover:border-cyan-500/40 transition-colors shadow-inner">
            <span className="text-[11px] text-slate-400 font-bold">Target Type</span>
            <span className="text-sm font-bold text-cyan-300 drop-shadow-[0_0_6px_#38bdf8]">
              {assessment.assessment_type === 'dast' ? 'Web Application (DAST)' : (assessment.assessment_type === 'source' ? 'Source Code Archive' : 'Unified Security Assessment (DAST + SAST + SCA)')}
            </span>
          </div>

          {/* Field 3: Security Score */}
          <div className="p-3 rounded-lg bg-command-900/90 border border-cyan-900/60 flex flex-col space-y-1 hover:border-cyan-500/40 transition-colors shadow-inner">
            <span className="text-[11px] text-slate-400 font-bold">Security Score</span>
            <span className={`text-xl font-hud font-black ${assessment.overall_risk_score >= 70 ? 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]' : (assessment.overall_risk_score >= 40 ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]')}`}>
              {(assessment.overall_risk_score !== undefined && assessment.overall_risk_score !== null) ? assessment.overall_risk_score : 0.0} / 100
            </span>
          </div>

          {/* Field 4: DAST Coverage Status */}
          <div className="p-3 rounded-lg bg-command-900/90 border border-cyan-900/60 flex flex-col space-y-1 hover:border-cyan-500/40 transition-colors shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-bold">Analysis Coverage Status</span>
              <span className="text-xs font-bold text-cyan-300 font-hud">{assessment.status === 'COMPLETED' ? '100%' : '40%'}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold flex items-center space-x-1 ${
                assessment.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]' : 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.2)]'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${assessment.status === 'COMPLETED' ? 'bg-emerald-400' : 'bg-rose-500'} animate-pulse`}></span>
                <span>{assessment.status === 'COMPLETED' ? 'COMPLETED' : assessment.status}</span>
              </span>
              <div className="w-1/2 bg-slate-900 h-2 rounded-full overflow-hidden border border-cyan-950">
                <div className={`bg-gradient-to-r from-rose-500 via-amber-500 to-cyan-400 h-full ${assessment.status === 'COMPLETED' ? 'w-[100%]' : 'w-[40%]'} shadow-[0_0_8px_#38bdf8]`}></div>
              </div>
            </div>
          </div>

          {/* Field 5: Detected Flaws */}
          <div className="p-3 rounded-lg bg-command-900/90 border border-cyan-900/60 flex flex-col space-y-1 hover:border-cyan-500/40 transition-colors shadow-inner">
            <span className="text-[11px] text-slate-400 font-bold">Detected Flaws</span>
            <span className="text-base font-hud font-bold text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]">
              {findings.length} Findings
            </span>
          </div>

          {/* Field 6: WAF / BOT PROTECTION Post-Scan Telemetry */}
          {(() => {
            const wafInfo = getDetectedWaf();
            return (
              <div className={`p-3.5 rounded-lg bg-command-900/90 border ${
                wafInfo.isBlocked ? 'border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.25)]' : 'border-cyan-900/60'
              } flex flex-col space-y-1 transition-colors shadow-inner`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-amber-400">
                    <ShieldAlert size={15} className={wafInfo.isBlocked ? 'text-rose-400' : 'text-amber-400'} />
                    <span className="text-[11px] text-slate-300 font-bold uppercase tracking-wider">WAF / BOT PROTECTION</span>
                  </div>
                  {wafInfo.isBlocked ? (
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-[9px] font-mono">
                      BLOCKED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[9px] font-mono">
                      CLEAR
                    </span>
                  )}
                </div>
                <div className={`text-base font-hud font-bold mt-1 uppercase tracking-wide ${
                  wafInfo.isBlocked ? 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'text-emerald-400 drop-shadow-[0_0_6px_#10b981]'
                }`}>
                  {wafInfo.statusText}
                </div>
              </div>
            );
          })()}

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button 
              onClick={() => handleExport('pdf')}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/30 text-cyan-200 border border-cyan-400/60 font-hud font-bold text-sm tracking-wider uppercase hover:border-cyan-300 hover:shadow-[0_0_20px_rgba(0,242,254,0.35)] flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <FileText size={18} />
              <span>Generate Executive Report</span>
            </button>

            <div className="flex items-center justify-between gap-2 pt-1">
              <button 
                onClick={() => loadAssessmentData(true)}
                className="flex-1 py-2 px-3 rounded-lg bg-command-900/90 border border-cyan-900/80 hover:border-cyan-400 text-slate-300 hover:text-white font-mono text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw size={16} className="text-cyan-400" />
                <span>Re-scan</span>
              </button>

              <button 
                onClick={handleDeleteAssessment}
                disabled={deleting}
                className="py-2 px-3 rounded-lg bg-rose-500/10 border border-rose-500/40 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 font-mono text-xs flex items-center justify-center transition-colors cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Correlated Multi-Vector Risks Section */}
      {correlatedRisks.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Network size={20} color="#c084fc" />
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f3e8ff' }}>
              Correlated Multi-Vector Risks ({correlatedRisks.length} Confirmed Chains)
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {correlatedRisks.map((cr) => (
              <CorrelatedRiskCard key={cr.id} risk={cr} />
            ))}
          </div>
        </div>
      )}

      {/* Findings Explorer Section */}
      <div className="cyber-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc' }}>
              Assessment Findings ({findings.length})
            </h2>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Click any vulnerability to inspect code snippets, parameters, and remediation.
            </p>
          </div>

          {/* Severity Filter Tabs */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterSeverity(s)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '700',
                  border: filterSeverity === s ? '1px solid #38bdf8' : '1px solid #1e293b',
                  background: filterSeverity === s ? 'rgba(56, 189, 248, 0.15)' : '#090d16',
                  color: filterSeverity === s ? '#38bdf8' : '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

      {/* Security Regression Summary Card */}
      {assessment.regression_summary && (assessment.regression_summary.new !== undefined) && (
        <div className="cyber-card" style={{ marginBottom: '24px', background: 'rgba(9, 13, 22, 0.8)', border: '1px solid #1e293b' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px' }}>
            Security Regression Analysis (vs. Previous Assessment)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <div style={{ background: '#0d1322', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <span style={{ fontSize: '11px', color: '#ff3366', fontWeight: '700', textTransform: 'uppercase' }}>NEW FINDINGS</span>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#f8fafc', marginTop: '4px' }}>
                +{assessment.regression_summary.new || 0}
              </div>
            </div>

            <div style={{ background: '#0d1322', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '700', textTransform: 'uppercase' }}>RESOLVED FINDINGS</span>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#10b981', marginTop: '4px' }}>
                -{assessment.regression_summary.resolved || 0}
              </div>
            </div>

            <div style={{ background: '#0d1322', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '700', textTransform: 'uppercase' }}>PERSISTENT</span>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#38bdf8', marginTop: '4px' }}>
                {assessment.regression_summary.persistent || 0}
              </div>
            </div>

            <div style={{ background: '#0d1322', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <span style={{ fontSize: '11px', color: '#c084fc', fontWeight: '700', textTransform: 'uppercase' }}>SCORE DELTA</span>
              <div style={{ fontSize: '22px', fontWeight: '800', color: (assessment.regression_summary.score_delta || 0) <= 0 ? '#10b981' : '#ff3366', marginTop: '4px' }}>
                {(assessment.regression_summary.score_delta || 0) > 0 ? `+${assessment.regression_summary.score_delta}` : assessment.regression_summary.score_delta || 0}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Findings Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '120px' }}>Severity</th>
              <th style={{ width: '140px' }}>Source / Detected By</th>
              <th>Vulnerability Title</th>
              <th>Location / Endpoint</th>
              <th style={{ width: '100px', textAlign: 'right' }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {filteredFindings.map((finding) => (
              <tr
                key={finding.id}
                onClick={() => setSelectedFinding(finding)}
                style={{ cursor: 'pointer' }}
              >
                <td>
                  <SeverityBadge severity={finding.severity} size="small" />
                </td>
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {(finding.detected_by && finding.detected_by.length > 0) ? (
                      finding.detected_by.map((scannerTag, idx) => (
                        <span key={idx} style={{ fontSize: '10px', padding: '2px 5px', borderRadius: '4px', background: '#1e293b', color: '#38bdf8', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
                          {scannerTag}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '10px', padding: '2px 5px', borderRadius: '4px', background: '#1e293b', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                        {finding.source}
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: '600', color: '#f8fafc' }}>{finding.title}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{finding.category}</div>
                </td>
                <td>
                  <span style={{ fontSize: '13px', color: '#cbd5e1', fontFamily: 'var(--font-mono)' }}>
                    {finding.file ? `${finding.file}:${finding.line}` : (finding.endpoint || '-')}
                  </span>
                </td>
                <td style={{ textAlign: 'right', fontWeight: '700', color: '#00f2fe', fontFamily: 'var(--font-mono)' }}>
                  {finding.risk_score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

      {/* Selected Finding Detail Drawer */}
      <FindingDrawer
        finding={selectedFinding}
        onClose={() => setSelectedFinding(null)}
        onStatusUpdated={() => loadAssessmentData(false)}
      />
    </div>
  );
};
