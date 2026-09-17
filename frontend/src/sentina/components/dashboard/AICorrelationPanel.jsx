'use client'
import React from 'react';
import {
  Sparkles,
  Cpu,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Code2,
  Radio,
  Boxes,
  KeyRound,
  Globe2,
  CheckCircle2,
  Shield
} from 'lucide-react';
import { SeverityBadge } from '../SeverityBadge';

export function AICorrelationPanel({ correlatedRisks = [], onSelectFinding, onViewFullCorrelation }) {
  if (!correlatedRisks || correlatedRisks.length === 0) {
    return (
      <div
        className="cyber-card"
        style={{
          padding: '16px 20px',
          background: '#060108',
          border: '1px solid #22071a',
          marginBottom: '16px',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.95), 0 0 14px rgba(255, 23, 68, 0.05)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(255, 23, 68, 0.15)',
                border: '1px solid rgba(255, 23, 68, 0.4)',
                boxShadow: '0 0 10px rgba(255, 23, 68, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Cpu size={18} color="#ff1744" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 900, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  AI RISK CORRELATION ENGINE
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(100, 116, 139, 0.15)',
                    color: '#94a3b8',
                    border: '1px solid rgba(100, 116, 139, 0.3)'
                  }}
                >
                  IDLE / STANDBY
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>
                Cross-scanner evidence synthesis linking isolated SAST, DAST, SCA & Secret events
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '24px',
            borderRadius: '10px',
            background: '#060a18',
            border: '1px dashed #14203a',
            textAlign: 'center',
            color: '#64748b',
            fontSize: '12.5px'
          }}
        >
          <div style={{ marginBottom: '6px', color: '#94a3b8', fontWeight: 600 }}>
            No correlated exploit paths identified yet.
          </div>
          <div>
            Launch a combined assessment to scan source repositories and live URLs for multi-engine correlation.
          </div>
        </div>
      </div>
    );
  }

  const primaryRisk = correlatedRisks[0];

  const getScannerIcon = (scanner) => {
    switch (scanner) {
      case 'SAST': return Code2;
      case 'DAST': return Radio;
      case 'SCA': return Boxes;
      case 'Secrets': return KeyRound;
      case 'Threat Intel': return Globe2;
      default: return Cpu;
    }
  };

  const getScannerColor = (scanner) => {
    switch (scanner) {
      case 'SAST': return '#38bdf8';
      case 'DAST': return '#a855f7';
      case 'SCA': return '#00f2fe';
      case 'Secrets': return '#f59e0b';
      case 'Threat Intel': return '#10b981';
      default: return '#c084fc';
    }
  };

  return (
    <div
      className="cyber-card cyber-card-glow-purple"
      style={{
        padding: '22px 24px',
        background: '#040713',
        border: '1px solid #131d38',
        marginBottom: '22px'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(168, 85, 247, 0.2)',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Cpu size={18} color="#c084fc" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                AI RISK CORRELATION ENGINE
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: 'rgba(0, 242, 254, 0.12)',
                  color: '#00f2fe',
                  border: '1px solid rgba(0, 242, 254, 0.3)'
                }}
              >
                AUTONOMOUS SYNTHESIS
              </span>
            </div>
            <p style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '1px' }}>
              Synthesizing isolated scanner findings across SAST, DAST, SCA & Secrets into verified exploit paths.
            </p>
          </div>
        </div>

        {onViewFullCorrelation && (
          <button onClick={onViewFullCorrelation} className="btn btn-secondary btn-xs" style={{ gap: '4px' }}>
            <span>Explore Matrix</span>
            <ArrowRight size={12} />
          </button>
        )}
      </div>

      {/* Main Content */}
      <div
        style={{
          background: '#060a18',
          border: '1px solid #14203a',
          borderRadius: '10px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <SeverityBadge severity={primaryRisk.finalRisk || 'HIGH'} size="sm" />
              <span style={{ fontSize: '11px', color: '#c084fc', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                {primaryRisk.killChainStage}
              </span>
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc' }}>
              {primaryRisk.title}
            </h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
              Affected Asset: <strong style={{ color: '#cbd5e1' }}>{primaryRisk.affectedAsset}</strong>
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>AI Confidence</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#00f2fe', fontFamily: 'var(--font-mono)' }}>
              {primaryRisk.aiConfidence}%
            </div>
          </div>
        </div>

        {/* Multi-Scanner Evidence Chain */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
          {primaryRisk.evidenceChain?.map((item, idx) => {
            const Icon = getScannerIcon(item.scanner);
            const color = getScannerColor(item.scanner);

            return (
              <div
                key={idx}
                onClick={() => item.findingId && onSelectFinding && onSelectFinding(item.findingId)}
                style={{
                  padding: '10px',
                  borderRadius: '6px',
                  background: '#080d1e',
                  border: `1px solid ${color}35`,
                  cursor: item.findingId ? 'pointer' : 'default',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  if (item.findingId) e.currentTarget.style.borderColor = color;
                }}
                onMouseLeave={e => {
                  if (item.findingId) e.currentTarget.style.borderColor = `${color}35`;
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <Icon size={13} color={color} />
                  <span style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: color }}>
                    {item.scanner}
                  </span>
                </div>
                <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#f8fafc', lineHeight: 1.2 }}>
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Action Recommendation */}
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '6px',
            background: 'rgba(0, 242, 254, 0.06)',
            border: '1px solid rgba(0, 242, 254, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <Sparkles size={16} color="#00f2fe" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '11.5px', color: '#cbd5e1' }}>
            <strong style={{ color: '#00f2fe' }}>AI Triage Recommendation: </strong>
            {primaryRisk.aiTriageNote}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AICorrelationPanel;
