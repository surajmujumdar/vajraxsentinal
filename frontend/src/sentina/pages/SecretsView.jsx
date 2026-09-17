'use client'
import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  Lock,
  GitCommit,
  FolderOpen,
  Search
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { SeverityBadge, getRatingMeta } from '../components/SeverityBadge';
import { FindingDrawer } from '../components/FindingDrawer';
import { calculateFindingsScore, filterModuleFindings, getScorePosture, getFindingCodeSnippet, getFindingRemediation } from '../utils/securityScore';

export function SecretsView() {
  const [findings, setFindings] = useState(() => filterModuleFindings('secrets', dashboardService.getInitialFindings({ module: 'secrets' })));
  const [selectedRating, setSelectedRating] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFinding, setSelectedFinding] = useState(() => {
    const init = filterModuleFindings('secrets', dashboardService.getInitialFindings({ module: 'secrets' }));
    return init.length > 0 ? init[0] : null;
  });
  const [activeDrawerFinding, setActiveDrawerFinding] = useState(null);

  useEffect(() => {
    async function loadSecrets() {
      const all = await dashboardService.getFindings({ all: true });
      const secretsFindings = filterModuleFindings('secrets', all || []);
      setFindings(secretsFindings);
      if (secretsFindings.length > 0) {
        setSelectedFinding(prev => {
          if (prev && secretsFindings.some(f => String(f.id) === String(prev.id))) {
            return secretsFindings.find(f => String(f.id) === String(prev.id)) || prev;
          }
          return secretsFindings[0];
        });
      }
    }
    loadSecrets();
    const unsubscribe = dashboardService.subscribe(loadSecrets);
    return () => unsubscribe();
  }, []);

  const secretsScore = calculateFindingsScore(findings);
  const scorePosture = getScorePosture(secretsScore);
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
        f.category?.toLowerCase().includes(q);
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
              background: 'rgba(255, 23, 68, 0.15)',
              border: '2px solid #ff1744',
              boxShadow: '0 0 14px rgba(255, 23, 68, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <KeyRound size={20} color="#ff1744" />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#f8fafc', letterSpacing: '0.8px', margin: 0 }}>
              SECRET SCANNING & CREDENTIAL AUDIT
            </h1>
            <p style={{ fontSize: '11.5px', color: '#a1a1aa', marginTop: '2px' }}>
              Entropy-based pattern matching, API token leak detection, and historical git commit log auditing.
            </p>
          </div>
        </div>

        <span
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            padding: '3px 10px',
            borderRadius: '4px',
            background: 'rgba(255, 23, 68, 0.15)',
            color: '#ff1744',
            border: '1.5px solid #ff1744',
            fontWeight: 800
          }}
        >
          {findings.length} EXPOSED CREDENTIALS DETECTED
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
            <span style={{ fontSize: '10px', fontWeight: 900, color: '#ff1744', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              SECRETS POSTURE SCORE
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
              {findings.length === 0 ? 'OPTIMAL DEFENSE' : scorePosture.label}
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
              {secretsScore}
            </div>
            <div style={{ fontSize: '12px', color: '#71717a', fontFamily: 'var(--font-mono)' }}>/ 100</div>
          </div>
        </div>

        <div className="cyber-card" style={{ padding: '14px 16px', background: '#060108', border: '2.5px solid #360a25' }}>
          <div style={{ fontSize: '10px', fontWeight: 900, color: '#ff1744', textTransform: 'uppercase' }}>CRITICAL & ELEVATED LEAKS</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#ff1744', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            {criticalCount + highCount}
          </div>
        </div>

        <div className="cyber-card" style={{ padding: '14px 16px', background: '#060108', border: '2.5px solid #360a25' }}>
          <div style={{ fontSize: '10px', fontWeight: 900, color: '#00f2fe', textTransform: 'uppercase' }}>EXPOSED CREDENTIALS</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#f8fafc', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            {findings.length} Secrets
          </div>
        </div>

        <div className="cyber-card" style={{ padding: '14px 16px', background: '#060108', border: '2.5px solid #360a25' }}>
          <div style={{ fontSize: '10px', fontWeight: 900, color: '#00ff88', textTransform: 'uppercase' }}>ENTROPY ENGINE STATUS</div>
          <div style={{ fontSize: '13px', fontWeight: 900, color: '#00ff88', marginTop: '10px' }}>
            ● GITLEAKS ACTIVE
          </div>
        </div>
      </div>

      {/* Two Column Layout: Finding List + Secret Inspector */}
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
              background: 'rgba(255, 23, 68, 0.1)',
              border: '1.5px solid #ff1744',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              color: '#ff1744'
            }}
          >
            <FolderOpen size={24} />
          </div>
          <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#f8fafc', marginBottom: '4px' }}>
            No Hardcoded Secrets or Leaked Tokens Found
          </h3>
          <p style={{ fontSize: '12px', color: '#71717a', maxWidth: '420px', margin: '0 auto', lineHeight: 1.5 }}>
            No plain-text API keys, private keys, database credentials, or auth tokens detected across repository history.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '16px' }}>
          {/* Left: Secrets Findings List */}
          <div className="cyber-card" style={{ padding: '14px', background: '#060108', border: '2.5px solid #360a25', maxHeight: '720px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: 900, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                EXPOSED CREDENTIALS ({filteredFindings.length}/{findings.length})
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
                  placeholder="Filter secret leaks..."
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
                  No secret leaks match selected rating filter.
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
                        background: isSelected ? 'rgba(255, 23, 68, 0.18)' : '#040005',
                        border: isSelected ? '1.5px solid #ff1744' : '1.5px solid #28081c',
                        boxShadow: isSelected ? '0 0 12px rgba(255, 23, 68, 0.25)' : 'none',
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

                      <div style={{ fontSize: '10.5px', color: '#ff1744', marginTop: '3px', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
                        {f.affectedComponent || 'Code Repository'}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Secret Inspector & Masked Evidence */}
          {activeSelected && (
            <div className="cyber-card" style={{ padding: '20px', background: '#060108', border: '3px solid #360a25', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <SeverityBadge severity={activeSelected.severity || activeSelected.rating} size="sm" />
                    <span style={{ fontSize: '11px', color: '#c084fc', fontFamily: 'var(--font-mono)', padding: '1px 6px', background: 'rgba(192, 132, 252, 0.12)', borderRadius: '3px', border: '1px solid #c084fc' }}>
                      {activeSelected.category || activeSelected.secret_type || 'EXPOSED CREDENTIAL'}
                    </span>
                    <span style={{ fontSize: '10.5px', color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>
                      HIGH ENTROPY MATCH
                    </span>
                  </div>
                  <h2 style={{ fontSize: '16px', fontWeight: 900, color: '#f8fafc', margin: '4px 0' }}>
                    {activeSelected.title}
                  </h2>
                  <div style={{ fontSize: '11.5px', color: '#ff1744', fontFamily: 'var(--font-mono)' }}>
                    File: {activeSelected.affectedComponent || activeSelected.file || 'Repository Source File'}
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
                {activeSelected.description}
              </div>

              {/* Masked Secret Evidence */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 900, color: '#ff1744', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>
                  REDACTED SECRET EVIDENCE
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
                    color: '#ff3366',
                    whiteSpace: 'pre-wrap',
                    overflowX: 'auto'
                  }}
                >
                  {activeSelected.code_snippet || activeSelected.codeSnippet || getFindingCodeSnippet(activeSelected)}
                </div>
              </div>

              {/* Detection Signature Evidence Telemetry */}
              {activeSelected.evidence && (
                <div style={{ padding: '8px 12px', borderRadius: '6px', background: 'rgba(255, 23, 68, 0.05)', border: '1px solid rgba(255, 23, 68, 0.2)', fontSize: '11px', color: '#cbd5e1', fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap' }}>
                  <strong style={{ color: '#ff1744' }}>Gitleaks Detection Match: </strong>
                  {activeSelected.evidence}
                </div>
              )}

              {/* Remediation */}
              <div style={{ padding: '10px 14px', borderRadius: '6px', background: 'rgba(0, 255, 136, 0.08)', border: '1.5px solid #00ff88', fontSize: '11.5px', color: '#f8fafc' }}>
                <strong style={{ color: '#00ff88' }}>Remediation Action: </strong>
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

export default SecretsView;
