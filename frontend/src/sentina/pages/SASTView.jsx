'use client'
import React, { useState, useEffect } from 'react';
import {
  Code2,
  FileCode,
  AlertTriangle,
  CheckCircle2,
  Search,
  ExternalLink,
  ShieldAlert,
  GitBranch,
  Terminal,
  Zap,
  FolderOpen
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { SeverityBadge, getRatingMeta } from '../components/SeverityBadge';
import { FindingDrawer } from '../components/FindingDrawer';
import {
  calculateFindingsScore,
  filterModuleFindings,
  getScorePosture,
  getFindingCodeSnippet,
  getFindingRemediation
} from '../utils/securityScore';

export function SASTView() {
  const [findings, setFindings] = useState(() => filterModuleFindings('sast', dashboardService.getInitialFindings({ module: 'sast' })));
  const [selectedRating, setSelectedRating] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFinding, setSelectedFinding] = useState(() => {
    const init = filterModuleFindings('sast', dashboardService.getInitialFindings({ module: 'sast' }));
    return init.length > 0 ? init[0] : null;
  });
  const [activeDrawerFinding, setActiveDrawerFinding] = useState(null);

  useEffect(() => {
    async function loadSAST() {
      const all = await dashboardService.getFindings({ all: true });
      const sastFindings = filterModuleFindings('sast', all || []);
      setFindings(sastFindings);
      if (sastFindings.length > 0) {
        setSelectedFinding(prev => {
          if (prev && sastFindings.some(f => String(f.id) === String(prev.id))) {
            return sastFindings.find(f => String(f.id) === String(prev.id)) || prev;
          }
          return sastFindings[0];
        });
      }
    }
    loadSAST();
    const unsubscribe = dashboardService.subscribe(loadSAST);
    return () => unsubscribe();
  }, []);

  const sastScore = calculateFindingsScore(findings);
  const scorePosture = getScorePosture(sastScore);
  const criticalCount = findings.filter(f => getRatingMeta(f.severity || f.rating).key === 'CRITICAL').length;
  const highCount = findings.filter(f => getRatingMeta(f.severity || f.rating).key === 'HIGH').length;

  const ratingOptions = [
    { key: 'ALL', label: 'ALL' },
    { key: 'CRITICAL', label: 'CRITICAL RISK' },
    { key: 'HIGH', label: 'ELEVATED RISK' },
    { key: 'MEDIUM', label: 'MODERATE RISK' },
    { key: 'LOW', label: 'LOW RISK' },
    { key: 'INFO', label: 'INFORMATIONAL' }
  ];

  const getRatingCount = (key) => {
    if (key === 'ALL') return findings.length;
    return findings.filter(f => getRatingMeta(f.severity || f.rating).key === key).length;
  };

  const filteredFindings = findings.filter(f => {
    if (selectedRating !== 'ALL') {
      const meta = getRatingMeta(f.severity || f.rating);
      if (meta.key !== selectedRating && meta.label !== selectedRating) {
        return false;
      }
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        f.title?.toLowerCase().includes(q) ||
        f.affectedComponent?.toLowerCase().includes(q) ||
        (f.cwe && f.cwe.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Ensure active selection is in sync with current filtered items
  useEffect(() => {
    if (filteredFindings.length > 0) {
      if (!selectedFinding || !filteredFindings.some(f => String(f.id) === String(selectedFinding.id))) {
        setSelectedFinding(filteredFindings[0]);
      }
    }
  }, [selectedRating, searchQuery, findings]);

  const activeSelected = (selectedFinding && filteredFindings.some(f => String(f.id) === String(selectedFinding.id)))
    ? selectedFinding
    : (filteredFindings[0] || null);

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
              background: 'rgba(0, 242, 254, 0.15)',
              border: '2px solid #00f2fe',
              boxShadow: '0 0 14px rgba(0, 242, 254, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Code2 size={20} color="#00f2fe" />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#f8fafc', letterSpacing: '0.8px', margin: 0 }}>
              SAST: STATIC APPLICATION SECURITY TESTING
            </h1>
            <p style={{ fontSize: '11.5px', color: '#a1a1aa', marginTop: '2px' }}>
              Deep AST rule evaluation, tainted variable flow tracking, and syntax-level vulnerability detection.
            </p>
          </div>
        </div>

        <span
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            padding: '3px 10px',
            borderRadius: '4px',
            background: 'rgba(0, 242, 254, 0.15)',
            color: '#00f2fe',
            border: '1.5px solid #00f2fe',
            fontWeight: 800
          }}
        >
          {findings.length} CODE FINDINGS DETECTED
        </span>
      </div>

      {/* KPI Stats */}
      <div className="grid-4" style={{ marginBottom: '20px' }}>
        <div
          className="cyber-card"
          style={{
            padding: '14px 16px',
            background: '#060108',
            border: '2.5px solid #360a25',
            boxShadow: `0 8px 24px rgba(0,0,0,0.8), inset 0 0 12px ${scorePosture.color}15`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '10px', fontWeight: 900, color: '#00f2fe', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              SAST SECURITY SCORE
            </span>
            <span
              style={{
                fontSize: '8.5px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 900,
                color: scorePosture.color,
                padding: '2px 6px',
                borderRadius: '4px',
                background: `${scorePosture.color}20`,
                border: `1.2px solid ${scorePosture.color}`
              }}
            >
              {scorePosture.label}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '6px' }}>
            <div
              style={{
                fontSize: '28px',
                fontWeight: 900,
                color: '#ffffff',
                fontFamily: 'var(--font-mono)',
                textShadow: `0 0 12px ${scorePosture.color}70`
              }}
            >
              {sastScore}
            </div>
            <div style={{ fontSize: '12px', color: '#71717a', fontFamily: 'var(--font-mono)' }}>/ 100</div>
          </div>
        </div>

        <div className="cyber-card" style={{ padding: '14px 16px', background: '#060108', border: '2.5px solid #360a25' }}>
          <div style={{ fontSize: '10px', fontWeight: 900, color: '#ff1744', textTransform: 'uppercase' }}>CRITICAL & ELEVATED RISKS</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#ff1744', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            {criticalCount + highCount}
          </div>
        </div>

        <div className="cyber-card" style={{ padding: '14px 16px', background: '#060108', border: '2.5px solid #360a25' }}>
          <div style={{ fontSize: '10px', fontWeight: 900, color: '#00f2fe', textTransform: 'uppercase' }}>ANALYZED SINKS</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#f8fafc', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            {findings.length} Sinks
          </div>
        </div>

        <div className="cyber-card" style={{ padding: '14px 16px', background: '#060108', border: '2.5px solid #360a25' }}>
          <div style={{ fontSize: '10px', fontWeight: 900, color: '#00ff88', textTransform: 'uppercase' }}>AST ENGINE STATUS</div>
          <div style={{ fontSize: '13px', fontWeight: 900, color: '#00ff88', marginTop: '10px' }}>
            ● ONLINE // ACTIVE
          </div>
        </div>
      </div>

      {/* Two Column Layout: Finding List + Code Viewer */}
      {findings.length === 0 ? (
        <div
          className="cyber-card"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            background: '#060108',
            border: '2.5px solid #360a25',
            borderRadius: '8px'
          }}
        >
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'rgba(0, 242, 254, 0.1)',
              border: '1.5px solid #00f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              color: '#00f2fe'
            }}
          >
            <FolderOpen size={24} />
          </div>
          <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#f8fafc', marginBottom: '4px' }}>
            No SAST Findings Detected
          </h3>
          <p style={{ fontSize: '12px', color: '#71717a', maxWidth: '420px', margin: '0 auto', lineHeight: 1.5 }}>
            No static code analysis flaws recorded. Codebase AST patterns are clean.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '16px' }}>
          {/* Left: SAST Findings List */}
          <div className="cyber-card" style={{ padding: '14px', background: '#060108', border: '2.5px solid #360a25', maxHeight: '720px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: 900, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                CODE FINDINGS ({filteredFindings.length}/{findings.length})
              </div>
            </div>

            {/* Threat Rating Filter Tabs */}
            <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', marginBottom: '10px', flexWrap: 'wrap' }}>
              {ratingOptions.map(opt => {
                const isActive = selectedRating === opt.key;
                const count = getRatingCount(opt.key);
                return (
                  <button
                    key={opt.key}
                    onClick={() => setSelectedRating(opt.key)}
                    className={`filter-pill ${isActive ? 'active' : ''}`}
                    style={{ fontSize: '9px', padding: '3px 7px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <span>{opt.label}</span>
                    <span style={{ fontSize: '8.5px', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Search */}
            <div style={{ marginBottom: '10px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: '#040005',
                  border: '1.5px solid #28081c'
                }}
              >
                <Search size={11} color="#71717a" />
                <input
                  type="text"
                  placeholder="Filter SAST findings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#f8fafc',
                    fontSize: '11px',
                    width: '100%',
                    fontFamily: 'var(--font-main)'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {filteredFindings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 12px', color: '#71717a', fontSize: '11.5px' }}>
                  No SAST findings match selected rating filter.
                </div>
              ) : (
                filteredFindings.map((f, idx) => {
                  const isSelected = String(activeSelected?.id) === String(f.id);

                  return (
                    <div
                      key={f.id || idx}
                      onClick={() => setSelectedFinding(f)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '6px',
                        background: isSelected ? 'rgba(0, 242, 254, 0.18)' : '#040005',
                        border: isSelected ? '1.5px solid #00f2fe' : '1.5px solid #28081c',
                        boxShadow: isSelected ? '0 0 12px rgba(0, 242, 254, 0.25)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <SeverityBadge severity={f.severity || f.rating} size="sm" />
                        <span style={{ fontSize: '10px', color: '#71717a', fontFamily: 'var(--font-mono)' }}>{f.id}</span>
                      </div>

                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#f8fafc', lineHeight: 1.3 }}>
                        {f.title}
                      </div>

                      <div style={{ fontSize: '10.5px', color: '#00f2fe', marginTop: '3px', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
                        {f.affectedComponent || (f.file ? (f.line ? `${f.file}:${f.line}` : f.file) : 'Source Code')}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Code Inspector */}
          {activeSelected && (
            <div className="cyber-card" style={{ padding: '20px', background: '#060108', border: '3px solid #360a25', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <SeverityBadge severity={activeSelected.severity || activeSelected.rating} size="sm" />
                    <span style={{ fontSize: '11px', color: '#c084fc', fontFamily: 'var(--font-mono)', padding: '1px 6px', background: 'rgba(192, 132, 252, 0.12)', borderRadius: '3px', border: '1px solid #c084fc' }}>
                      {activeSelected.cwe || activeSelected.category || 'CWE Flaw'}
                    </span>
                    {activeSelected.cve && (
                      <span style={{ fontSize: '11px', color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>
                        {activeSelected.cve}
                      </span>
                    )}
                    <span style={{ fontSize: '10.5px', color: '#00f2fe', fontFamily: 'var(--font-mono)' }}>
                      SEMGREP AST SINK
                    </span>
                  </div>
                  <h2 style={{ fontSize: '16px', fontWeight: 900, color: '#f8fafc', margin: '4px 0' }}>
                    {activeSelected.title}
                  </h2>
                  <div style={{ fontSize: '11.5px', color: '#00f2fe', fontFamily: 'var(--font-mono)' }}>
                    File: {activeSelected.affectedComponent || (activeSelected.file ? (activeSelected.line ? `${activeSelected.file}:${activeSelected.line}` : activeSelected.file) : 'src/app.js')}
                  </div>
                </div>

                <button
                  onClick={() => setActiveDrawerFinding(activeSelected)}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '11px', height: '28px', gap: '5px' }}
                >
                  <span>Full Triage View</span>
                  <ExternalLink size={12} />
                </button>
              </div>

              {/* Description */}
              <div style={{ padding: '10px 14px', borderRadius: '6px', background: '#040005', border: '1.5px solid #28081c', fontSize: '12px', color: '#cbd5e1', lineHeight: 1.5 }}>
                {activeSelected.description || 'Static code analysis engine identified a high-risk tainted variable flow reaching a critical execution sink.'}
              </div>

              {/* Code Snippet */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 900, color: '#00f2fe', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>
                  VULNERABLE AST SINK / CODE SNIPPET
                </div>
                <div
                  style={{
                    background: '#020003',
                    border: '1.5px solid #28081c',
                    borderRadius: '6px',
                    padding: '14px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11.5px',
                    lineHeight: 1.6,
                    color: '#38bdf8',
                    whiteSpace: 'pre-wrap',
                    overflowX: 'auto'
                  }}
                >
                  {activeSelected.code_snippet || activeSelected.codeSnippet || getFindingCodeSnippet(activeSelected)}
                </div>
              </div>

              {/* Detection Evidence Telemetry */}
              {activeSelected.evidence && (
                <div style={{ padding: '8px 12px', borderRadius: '6px', background: 'rgba(0, 242, 254, 0.05)', border: '1px solid rgba(0, 242, 254, 0.2)', fontSize: '11px', color: '#cbd5e1', fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap' }}>
                  <strong style={{ color: '#00f2fe' }}>Semgrep Detection Rule: </strong>
                  {activeSelected.evidence}
                </div>
              )}

              {/* Remediation */}
              <div style={{ padding: '10px 14px', borderRadius: '6px', background: 'rgba(0, 255, 136, 0.08)', border: '1.5px solid #00ff88', fontSize: '11.5px', color: '#f8fafc' }}>
                <strong style={{ color: '#00ff88' }}>Remediation Guidance: </strong>
                {activeSelected.remediation || getFindingRemediation(activeSelected)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Drawer */}
      <FindingDrawer
        finding={activeDrawerFinding}
        isOpen={Boolean(activeDrawerFinding)}
        onClose={() => setActiveDrawerFinding(null)}
      />
    </div>
  );
}

export default SASTView;
