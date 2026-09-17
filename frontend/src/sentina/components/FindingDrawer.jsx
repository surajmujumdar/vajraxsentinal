'use client'
import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  AlertTriangle,
  Code2,
  Radio,
  Boxes,
  KeyRound,
  Globe2,
  Cpu,
  Sparkles,
  ExternalLink,
  CheckCircle,
  Copy,
  Check,
  Terminal,
  FileCode,
  Shield,
  Layers,
  ArrowUpRight,
  Flame,
  Activity,
  Zap,
  Target,
  Info,
  Lock,
  Server,
  TrendingUp,
  Database,
  AlertOctagon
} from 'lucide-react';
import { SeverityBadge } from './SeverityBadge';
import { getFindingCodeSnippet, getFindingRemediation, getFindingThreatScenario } from '../utils/securityScore';

export function FindingDrawer({ finding, isOpen, onClose, onStatusChange }) {
  const [activeTab, setActiveTab] = useState('threat_impact');
  const [copied, setCopied] = useState(false);
  const [localStatus, setLocalStatus] = useState(finding?.status || 'Open');

  if (!isOpen || !finding) return null;

  const handleCopyEvidence = () => {
    const text = finding.evidence || getFindingCodeSnippet(finding);
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStatusSelect = (newStatus) => {
    setLocalStatus(newStatus);
    onStatusChange && onStatusChange(finding.id, newStatus);
  };

  const riskFactors = finding.riskFactors || {};
  const potentialImpact = finding.potentialImpact || {};

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div
        className="slide-in-right"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '820px',
          maxWidth: '94vw',
          backgroundColor: '#070b18',
          borderLeft: '1px solid #1e2c4d',
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 242, 254, 0.1)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #15213b',
            background: 'linear-gradient(180deg, #0b1226 0%, #070b18 100%)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <SeverityBadge severity={finding.severity || finding.rating || 'CRITICAL'} size="md" />
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: (finding.severity || 'CRITICAL').toUpperCase() === 'CRITICAL' ? 'rgba(255, 23, 68, 0.18)' : 'rgba(249, 115, 22, 0.18)',
                  color: (finding.severity || 'CRITICAL').toUpperCase() === 'CRITICAL' ? '#ff2a4d' : '#fb923c',
                  border: `1.5px solid ${(finding.severity || 'CRITICAL').toUpperCase() === 'CRITICAL' ? '#ff1744' : '#f97316'}`,
                  fontWeight: 900,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                THREAT RATING: {(finding.severity || finding.rating || 'CRITICAL').toUpperCase() === 'CRITICAL' ? 'CRITICAL RISK' : (finding.severity || finding.rating || 'HIGH').toUpperCase() === 'HIGH' ? 'ELEVATED RISK' : (finding.severity || finding.rating || 'MEDIUM').toUpperCase() === 'MEDIUM' ? 'MODERATE RISK' : (finding.severity || finding.rating || 'LOW').toUpperCase() === 'LOW' ? 'LOW RISK' : 'INFORMATIONAL'}
              </span>
              {finding.blastRadius && (
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Flame size={11} /> {finding.blastRadius}
                </span>
              )}
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  background: 'rgba(56, 189, 248, 0.12)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  fontWeight: 700
                }}
              >
                Source: {finding.source}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  background: '#121c33',
                  color: '#94a3b8',
                  border: '1px solid #1c2744'
                }}
              >
                {finding.id}
              </span>
            </div>

            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', lineHeight: 1.3 }}>
              {finding.title}
            </h2>

            <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
              <span>Asset: <strong style={{ color: '#cbd5e1' }}>{finding.asset}</strong></span>
              {finding.endpoint && <span>Endpoint: <strong style={{ color: '#38bdf8' }}>{finding.endpoint}</strong></span>}
              {finding.parameter && <span>Parameter: <strong style={{ color: '#ff3366' }}>{finding.parameter}</strong></span>}
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-icon"
            style={{ padding: '6px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick KPI Bar - Includes Explicit Severity Level */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '1px',
            background: '#141f38',
            borderBottom: '1px solid #15213b'
          }}
        >
          <div style={{ padding: '10px 14px', background: '#090e20' }}>
            <div style={{ fontSize: '10px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Severity Level</div>
            <div style={{ marginTop: '4px' }}>
              <SeverityBadge severity={finding.severity || 'CRITICAL'} size="sm" />
            </div>
          </div>
          <div style={{ padding: '10px 14px', background: '#090e20' }}>
            <div style={{ fontSize: '10px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Intermediate Risk</div>
            <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#ff3366', marginTop: '2px' }}>
              {finding.riskScore || '9.8'} <span style={{ fontSize: '10px', color: '#64748b' }}>/10</span>
            </div>
          </div>
          <div style={{ padding: '10px 14px', background: '#090e20' }}>
            <div style={{ fontSize: '10px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Confidence</div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#00f2fe', marginTop: '3px' }}>
              {finding.confidence || 'HIGH'}
            </div>
          </div>
          <div style={{ padding: '10px 14px', background: '#090e20' }}>
            <div style={{ fontSize: '10px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '3px' }}>
              {finding.category || 'Vulnerability'}
            </div>
          </div>
          <div style={{ padding: '10px 14px', background: '#090e20' }}>
            <div style={{ fontSize: '10px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</div>
            <select
              value={localStatus}
              onChange={(e) => handleStatusSelect(e.target.value)}
              style={{
                background: '#0e1730',
                border: '1px solid #1e2c4d',
                color: '#f8fafc',
                fontSize: '11px',
                fontWeight: 700,
                borderRadius: '4px',
                padding: '2px 6px',
                marginTop: '2px',
                outline: 'none',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              <option value="Open">Open</option>
              <option value="In Triage">In Triage</option>
              <option value="Resolved">Resolved</option>
              <option value="False Positive">False Positive</option>
            </select>
          </div>
        </div>

        {/* Drawer Tabs */}
        <div
          style={{
            display: 'flex',
            padding: '0 24px',
            borderBottom: '1px solid #15213b',
            background: '#070b18',
            gap: '8px',
            overflowX: 'auto'
          }}
        >
          {[
            { id: 'threat_impact', label: '🔥 Threat & Risk Impact' },
            { id: 'overview', label: 'Overview & Details' },
            { id: 'evidence', label: 'Evidence & Payloads' },
            { id: 'remediation', label: 'Remediation & Patch' },
            { id: 'ai_analysis', label: 'AI Correlation Analysis' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 14px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #00f2fe' : '2px solid transparent',
                color: activeTab === tab.id ? '#00f2fe' : '#94a3b8',
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Drawer Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {/* TAB 0: THREAT & RISK IMPACT */}
          {activeTab === 'threat_impact' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Threat Scenario Banner */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(168, 85, 247, 0.08) 100%)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '10px',
                  padding: '18px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', marginBottom: '8px' }}>
                  <Flame size={16} /> Realistic Threat Scenario
                </div>
                <div style={{ fontSize: '13.5px', color: '#f1f5f9', lineHeight: 1.6 }}>
                  {finding.threatScenario || getFindingThreatScenario(finding)}
                </div>
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', fontWeight: 700, border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                    Blast Radius: {finding.blastRadius || 'Application Scope'}
                  </span>
                  {potentialImpact.attack_vector && (
                    <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.15)', color: '#7dd3fc', fontWeight: 600, border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                      Vector: {potentialImpact.attack_vector}
                    </span>
                  )}
                </div>
              </div>

              {/* Technical & Business Impact Matrix (CIA Triad + Business) */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldAlert size={14} color="#f59e0b" /> Technical & Business Impact Matrix
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  {/* Confidentiality */}
                  <div style={{ padding: '14px', borderRadius: '8px', background: '#0a1024', border: '1px solid #162244' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Lock size={12} color="#38bdf8" /> Confidentiality Impact
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#e2e8f0', marginTop: '6px', lineHeight: 1.5 }}>
                      {potentialImpact.confidentiality || 'Unauthorized data extraction or information leakage.'}
                    </div>
                  </div>

                  {/* Integrity */}
                  <div style={{ padding: '14px', borderRadius: '8px', background: '#0a1024', border: '1px solid #162244' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Database size={12} color="#f59e0b" /> Integrity Impact
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#e2e8f0', marginTop: '6px', lineHeight: 1.5 }}>
                      {potentialImpact.integrity || 'Unauthorized data modification, state manipulation, or record alteration.'}
                    </div>
                  </div>

                  {/* Availability */}
                  <div style={{ padding: '14px', borderRadius: '8px', background: '#0a1024', border: '1px solid #162244' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Server size={12} color="#a855f7" /> Availability Impact
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#e2e8f0', marginTop: '6px', lineHeight: 1.5 }}>
                      {potentialImpact.availability || 'Resource exhaustion, denial of service, or process disruption.'}
                    </div>
                  </div>

                  {/* Business Impact */}
                  <div style={{ padding: '14px', borderRadius: '8px', background: '#0a1024', border: '1px solid #162244' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Activity size={12} color="#ef4444" /> Business & Compliance Impact
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#e2e8f0', marginTop: '6px', lineHeight: 1.5 }}>
                      {potentialImpact.business_impact || 'Risk of regulatory non-compliance, financial loss, or reputational damage.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Intermediate Risk Score Calibration */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <TrendingUp size={14} color="#00f2fe" /> Intermediate Risk Score Calculation Model
                </div>
                <div style={{ background: '#050914', border: '1px solid #162242', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ padding: '10px', borderRadius: '6px', background: '#0a1024', border: '1px solid #162244' }}>
                      <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Base Threat Rating Score</div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#ff3366', fontFamily: 'var(--font-mono)' }}>
                        {riskFactors.base_severity_score || (finding.severity === 'CRITICAL' ? 90.0 : finding.severity === 'HIGH' ? 70.0 : 45.0)} / 100
                      </div>
                    </div>

                    <div style={{ padding: '10px', borderRadius: '6px', background: '#0a1024', border: '1px solid #162244' }}>
                      <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Confidence Multiplier</div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#00f2fe', fontFamily: 'var(--font-mono)' }}>
                        {riskFactors.confidence_multiplier || (finding.confidence === 'VERY HIGH' ? 1.10 : 1.0)}x
                      </div>
                    </div>

                    <div style={{ padding: '10px', borderRadius: '6px', background: '#0a1024', border: '1px solid #162244' }}>
                      <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Attack Surface Exposure</div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                        {riskFactors.exposure_multiplier || (finding.endpoint ? 1.12 : 1.0)}x
                      </div>
                    </div>

                    <div style={{ padding: '10px', borderRadius: '6px', background: '#0a1024', border: '1px solid #162244' }}>
                      <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Exploitability Factor</div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>
                        {riskFactors.exploitability_factor || 1.15}x
                      </div>
                    </div>

                    <div style={{ padding: '10px', borderRadius: '6px', background: '#0a1024', border: '1px solid #162244' }}>
                      <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Blast Radius Factor</div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#c084fc', fontFamily: 'var(--font-mono)' }}>
                        {riskFactors.blast_radius_factor || 1.10}x
                      </div>
                    </div>

                    <div style={{ padding: '10px', borderRadius: '6px', background: '#0a1024', border: '1px solid #162244' }}>
                      <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Asset Criticality Multiplier</div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                        {riskFactors.asset_criticality_factor || 1.10}x
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '10px 14px', borderRadius: '6px', background: 'rgba(0, 242, 254, 0.06)', border: '1px solid rgba(0, 242, 254, 0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                      <strong>Formula:</strong> <code>(BaseSeverity × Confidence × Exposure × ((Exploit + Blast) / 2) × Criticality) + Bonus</code>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#00f2fe', fontFamily: 'var(--font-mono)' }}>
                      Intermediate: {finding.riskScore || '9.8'} / 10
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Description */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Description
                </div>
                <div
                  style={{
                    fontSize: '13.5px',
                    color: '#cbd5e1',
                    lineHeight: 1.6,
                    padding: '14px',
                    borderRadius: '8px',
                    background: '#0a0f22',
                    border: '1px solid #162242'
                  }}
                >
                  {finding.description}
                </div>
              </div>

              {/* Technical Details */}
              {finding.technicalDetails && (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Technical Execution Context
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#94a3b8',
                      lineHeight: 1.6,
                      padding: '14px',
                      borderRadius: '8px',
                      background: '#090e1e',
                      border: '1px solid #141f38',
                      fontFamily: 'var(--font-mono)'
                    }}
                  >
                    {finding.technicalDetails}
                  </div>
                </div>
              )}

              {/* Classification Matrix */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Security Classification & Standards
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div style={{ padding: '12px', borderRadius: '8px', background: '#0a1024', border: '1px solid #162244' }}>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Flaw Severity Rating</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <SeverityBadge severity={finding.severity || 'CRITICAL'} size="sm" />
                      <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
                        {(finding.severity || 'CRITICAL').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: '12px', borderRadius: '8px', background: '#0a1024', border: '1px solid #162244' }}>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>CWE Identification</div>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#38bdf8', marginTop: '2px' }}>
                      {finding.cwe || 'CWE-89: SQL Injection'}
                    </div>
                  </div>

                  <div style={{ padding: '12px', borderRadius: '8px', background: '#0a1024', border: '1px solid #162244' }}>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>CVE Advisory</div>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#c084fc', marginTop: '2px' }}>
                      {finding.cve || 'CVE-2024-21626'}
                    </div>
                  </div>

                  <div style={{ padding: '12px', borderRadius: '8px', background: '#0a1024', border: '1px solid #162244' }}>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>OWASP Top 10 Category</div>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#f59e0b', marginTop: '2px' }}>
                      {finding.owaspCategory || 'A03:2021 - Injection'}
                    </div>
                  </div>

                  <div style={{ padding: '12px', borderRadius: '8px', background: '#0a1024', border: '1px solid #162244', gridColumn: 'span 2' }}>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Affected Component / Scope</div>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#f8fafc', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                      {finding.affectedComponent || finding.endpoint || 'auth/login.py'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div style={{ display: 'flex', gap: '24px', fontSize: '11.5px', color: '#64748b', borderTop: '1px solid #141f38', paddingTop: '14px' }}>
                <span>First Detected: <strong style={{ color: '#94a3b8' }}>{finding.firstDetected || '2026-09-03 04:50 UTC'}</strong></span>
                <span>Last Detected: <strong style={{ color: '#94a3b8' }}>{finding.lastDetected || '2026-09-03 05:10 UTC'}</strong></span>
              </div>
            </div>
          )}

          {/* TAB 2: EVIDENCE */}
          {activeTab === 'evidence' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Raw Scanner Telemetry & Proof of Exploit
                </div>
                <button
                  onClick={handleCopyEvidence}
                  className="btn btn-secondary btn-xs"
                  style={{ gap: '4px' }}
                >
                  {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy Evidence'}</span>
                </button>
              </div>

              <div
                style={{
                  background: '#040711',
                  border: '1px solid #162242',
                  borderRadius: '8px',
                  padding: '16px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12.5px',
                  color: '#38bdf8',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                  overflowX: 'auto'
                }}
              >
                {finding.evidence || getFindingCodeSnippet(finding)}
              </div>

              {finding.parameter && (
                <div style={{ padding: '12px', borderRadius: '8px', background: '#0a1024', border: '1px solid #162244' }}>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Tainted Input Parameter: </span>
                  <strong style={{ color: '#ff3366', fontFamily: 'var(--font-mono)' }}>{finding.parameter}</strong>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REMEDIATION & PATCH */}
          {activeTab === 'remediation' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Remediation Steps
                </div>
                <div
                  style={{
                    fontSize: '13.5px',
                    color: '#e2e8f0',
                    lineHeight: 1.6,
                    padding: '14px',
                    borderRadius: '8px',
                    background: '#0a1024',
                    border: '1px solid #162244',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {finding.remediation || getFindingRemediation(finding)}
                </div>
              </div>

              {/* Code Patch Diff */}
              {(finding.patchDiff || getFindingCodeSnippet(finding)) && (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileCode size={14} /> Vulnerable AST Sink & Code Context
                  </div>
                  <div
                    style={{
                      background: '#040711',
                      border: '1px solid #162242',
                      borderRadius: '8px',
                      padding: '16px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.6,
                      color: '#f8fafc'
                    }}
                  >
                    {(finding.patchDiff || getFindingCodeSnippet(finding)).split('\n').map((line, idx) => {
                      const isAdd = line.startsWith('+');
                      const isDel = line.startsWith('-');
                      return (
                        <div
                          key={idx}
                          style={{
                            color: isAdd ? '#10b981' : isDel ? '#ff3366' : '#64748b',
                            background: isAdd ? 'rgba(16, 185, 129, 0.1)' : isDel ? 'rgba(255, 51, 102, 0.1)' : 'transparent',
                            padding: '1px 4px',
                            borderRadius: '2px'
                          }}
                        >
                          {line}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* External References */}
              {finding.references?.length > 0 && (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Official Security References & Advisories
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {finding.references.map((refUrl, idx) => (
                      <a
                        key={idx}
                        href={refUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          color: '#38bdf8',
                          fontSize: '12px',
                          textDecoration: 'none',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          background: '#090e20',
                          border: '1px solid #141f38'
                        }}
                      >
                        <ExternalLink size={13} />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{refUrl}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AI ANALYSIS */}
          {activeTab === 'ai_analysis' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(0, 242, 254, 0.05) 100%)',
                  border: '1px solid rgba(168, 85, 247, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <Sparkles size={24} color="#c084fc" />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>
                    Sentina AI Exploit Chain Synthesis
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                    Autonomous root cause identification and multi-vector correlation
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Root Cause Analysis
                </div>
                <div style={{ fontSize: '13px', color: '#e2e8f0', padding: '12px', borderRadius: '6px', background: '#0a1024', border: '1px solid #162244', lineHeight: 1.5 }}>
                  {finding.aiAnalysis?.rootCause || 'Unsafe input validation combined with non-parameterized query execution.'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#ff3366', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Exploit Chain Threat Potential
                </div>
                <div style={{ fontSize: '13px', color: '#cbd5e1', padding: '12px', borderRadius: '6px', background: '#0a1024', border: '1px solid #162244', lineHeight: 1.5 }}>
                  {finding.aiAnalysis?.exploitChainRisk || 'High probability of full database dump and horizontal privilege escalation.'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#00f2fe', textTransform: 'uppercase', marginBottom: '6px' }}>
                  AI Immediate Action Advice
                </div>
                <div style={{ fontSize: '13px', color: '#e2e8f0', padding: '12px', borderRadius: '6px', background: '#0a1024', border: '1px solid #162244', lineHeight: 1.5 }}>
                  {finding.aiAnalysis?.recommendation || 'Apply parameterized ORM statement immediately and invalidate active sessions.'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #15213b',
            background: '#070b18',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Current State: <strong style={{ color: '#f8fafc' }}>{localStatus}</strong>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => handleStatusSelect('Resolved')}
              className="btn btn-secondary btn-sm"
              style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' }}
            >
              <CheckCircle size={14} /> Mark Resolved
            </button>
            <button
              onClick={onClose}
              className="btn btn-primary btn-sm"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default FindingDrawer;
