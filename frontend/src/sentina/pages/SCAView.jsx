'use client'
import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Package,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  GitPullRequest,
  CheckCircle2,
  FolderOpen,
  Search
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { SeverityBadge, getRatingMeta } from '../components/SeverityBadge';
import { FindingDrawer } from '../components/FindingDrawer';
import { calculateFindingsScore, filterModuleFindings, getScorePosture, getFindingCodeSnippet, getFindingRemediation } from '../utils/securityScore';

export function SCAView() {
  const [findings, setFindings] = useState(() => filterModuleFindings('sca', dashboardService.getInitialFindings({ module: 'sca' })));
  const [selectedRating, setSelectedRating] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFinding, setSelectedFinding] = useState(() => {
    const init = filterModuleFindings('sca', dashboardService.getInitialFindings({ module: 'sca' }));
    return init.length > 0 ? init[0] : null;
  });
  const [activeDrawerFinding, setActiveDrawerFinding] = useState(null);

  useEffect(() => {
    async function loadSCA() {
      const all = await dashboardService.getFindings({ all: true });
      const scaFindings = filterModuleFindings('sca', all || []);
      setFindings(scaFindings);
      if (scaFindings.length > 0) {
        setSelectedFinding(prev => {
          if (prev && scaFindings.some(f => String(f.id) === String(prev.id))) {
            return scaFindings.find(f => String(f.id) === String(prev.id)) || prev;
          }
          return scaFindings[0];
        });
      }
    }
    loadSCA();
    const unsubscribe = dashboardService.subscribe(loadSCA);
    return () => unsubscribe();
  }, []);

  const scaScore = calculateFindingsScore(findings);
  const scorePosture = getScorePosture(scaScore);
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
        (f.cve && f.cve.toLowerCase().includes(q));
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
              background: 'rgba(0, 255, 136, 0.15)',
              border: '2px solid #00ff88',
              boxShadow: '0 0 14px rgba(0, 255, 136, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Boxes size={20} color="#00ff88" />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#f8fafc', letterSpacing: '0.8px', margin: 0 }}>
              SCA: SOFTWARE COMPOSITION ANALYSIS
            </h1>
            <p style={{ fontSize: '11.5px', color: '#a1a1aa', marginTop: '2px' }}>
              Third-party dependency scanning, OSV/CVE database correlation, and automated fix version suggestions.
            </p>
          </div>
        </div>

        <span
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            padding: '3px 10px',
            borderRadius: '4px',
            background: 'rgba(0, 255, 136, 0.15)',
            color: '#00ff88',
            border: '1.5px solid #00ff88',
            fontWeight: 800
          }}
        >
          {findings.length} DEPENDENCY VULNERABILITIES DETECTED
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
            <span style={{ fontSize: '10px', fontWeight: 900, color: '#00ff88', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              SCA SECURITY SCORE
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
              {scaScore}
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
          <div style={{ fontSize: '10px', fontWeight: 900, color: '#00f2fe', textTransform: 'uppercase' }}>VULNERABLE PACKAGES</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#f8fafc', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            {findings.length} Packages
          </div>
        </div>

        <div className="cyber-card" style={{ padding: '14px 16px', background: '#060108', border: '2.5px solid #360a25' }}>
          <div style={{ fontSize: '10px', fontWeight: 900, color: '#00ff88', textTransform: 'uppercase' }}>LICENSE COMPLIANCE</div>
          <div style={{ fontSize: '13px', fontWeight: 900, color: '#00ff88', marginTop: '10px' }}>
            ● ZERO INFRINGEMENTS
          </div>
        </div>
      </div>

      {/* Two Column Layout: Finding List + Dependency Inspector */}
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
              background: 'rgba(0, 255, 136, 0.1)',
              border: '1.5px solid #00ff88',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              color: '#00ff88'
            }}
          >
            <FolderOpen size={24} />
          </div>
          <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#f8fafc', marginBottom: '4px' }}>
            No Vulnerable Dependencies Found
          </h3>
          <p style={{ fontSize: '12px', color: '#71717a', maxWidth: '420px', margin: '0 auto', lineHeight: 1.5 }}>
            All dependency manifests (package.json, requirements.txt, pom.xml, etc.) have zero known open CVEs.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '16px' }}>
          {/* Left: SCA Findings List */}
          <div className="cyber-card" style={{ padding: '14px', background: '#060108', border: '2.5px solid #360a25', maxHeight: '720px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: 900, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                VULNERABLE PACKAGES ({filteredFindings.length}/{findings.length})
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
                  placeholder="Filter SCA packages..."
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
                  No SCA packages match selected rating filter.
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
                        background: isSelected ? 'rgba(0, 255, 136, 0.18)' : '#040005',
                        border: isSelected ? '1.5px solid #00ff88' : '1.5px solid #28081c',
                        boxShadow: isSelected ? '0 0 12px rgba(0, 255, 136, 0.25)' : 'none',
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

                      <div style={{ fontSize: '10.5px', color: '#00ff88', marginTop: '3px', fontFamily: 'var(--font-mono)' }}>
                        {f.cve || f.affectedComponent}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Package Context & Upgrade Path */}
          {activeSelected && (
            <div className="cyber-card" style={{ padding: '20px', background: '#060108', border: '3px solid #360a25', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <SeverityBadge severity={activeSelected.severity || activeSelected.rating} size="sm" />
                    <span style={{ fontSize: '11px', color: '#c084fc', fontFamily: 'var(--font-mono)', padding: '1px 6px', background: 'rgba(192, 132, 252, 0.12)', borderRadius: '3px', border: '1px solid #c084fc' }}>
                      {activeSelected.cve || 'OSV Advisory'}
                    </span>
                    <span style={{ fontSize: '10.5px', color: '#00ff88', fontFamily: 'var(--font-mono)' }}>
                      DEPENDENCY AUDIT
                    </span>
                  </div>
                  <h2 style={{ fontSize: '16px', fontWeight: 900, color: '#f8fafc', margin: '4px 0' }}>
                    {activeSelected.title}
                  </h2>
                  <div style={{ fontSize: '11.5px', color: '#00ff88', fontFamily: 'var(--font-mono)' }}>
                    Package: {activeSelected.affectedComponent}
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

              {/* Manifest Snippet */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 900, color: '#00ff88', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>
                  PACKAGE MANIFEST CONTEXT
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
                <div style={{ padding: '8px 12px', borderRadius: '6px', background: 'rgba(0, 255, 136, 0.05)', border: '1px solid rgba(0, 255, 136, 0.2)', fontSize: '11px', color: '#cbd5e1', fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap' }}>
                  <strong style={{ color: '#00ff88' }}>OSV Advisory Match: </strong>
                  {activeSelected.evidence}
                </div>
              )}

              {/* Version Upgrade Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '6px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1.5px solid #10b981',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <GitPullRequest size={16} color="#10b981" />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#f8fafc' }}>
                      Remediation Upgrade Available
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                      Update to safe release to resolve vulnerability exposure.
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    color: '#10b981',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: 'rgba(16, 185, 129, 0.15)'
                  }}
                >
                  {activeSelected.remediation || getFindingRemediation(activeSelected)}
                </span>
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

export default SCAView;
