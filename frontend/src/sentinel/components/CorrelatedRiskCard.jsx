import React from 'react';
import { Network, ShieldAlert, Zap, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SeverityBadge } from './SeverityBadge';

export const CorrelatedRiskCard = ({ risk }) => {
  if (!risk) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #131126 0%, #1a1738 100%)',
      border: '1px solid #7c3aed',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 8px 30px rgba(124, 58, 237, 0.15)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Glow highlight */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, #c084fc, #7c3aed, #00f2fe)'
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(192, 132, 252, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#c084fc'
          }}>
            <Network size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f3e8ff' }}>
              {risk.title}
            </h3>
            <div style={{ fontSize: '12px', color: '#a855f7', fontWeight: '600' }}>
              Cross-Engine Correlated Risk • {risk.confidence} Confidence
            </div>
          </div>
        </div>
        <SeverityBadge severity={risk.risk_level} />
      </div>

      <p style={{ fontSize: '14px', color: '#cbd5e1', marginBottom: '16px', lineHeight: 1.5 }}>
        {risk.description}
      </p>

      {/* Explanation Box */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.35)',
        border: '1px solid rgba(124, 58, 237, 0.3)',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '12px',
        fontSize: '13px',
        color: '#e2e8f0',
        lineHeight: 1.6
      }}>
        <div style={{ fontWeight: '700', color: '#c084fc', marginBottom: '4px' }}>
          Correlated Evidence Breakdown:
        </div>
        <div style={{ whiteSpace: 'pre-line' }}>{risk.explanation}</div>
      </div>

      {/* Attack Scenario Box */}
      <div style={{
        background: 'rgba(255, 51, 102, 0.08)',
        border: '1px solid rgba(255, 51, 102, 0.25)',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '12px',
        fontSize: '13px',
        color: '#fecdd3',
        lineHeight: 1.5
      }}>
        <div style={{ fontWeight: '700', color: '#ff3366', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Zap size={14} />
          <span>Potential Attack Scenario:</span>
        </div>
        <p style={{ margin: 0 }}>{risk.attack_scenario}</p>
      </div>

      {/* Remediation */}
      <div style={{
        background: 'rgba(16, 185, 129, 0.08)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '13px',
        color: '#d1fae5',
        lineHeight: 1.5
      }}>
        <div style={{ fontWeight: '700', color: '#10b981', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 size={14} />
          <span>Prioritized Remediation:</span>
        </div>
        <div style={{ whiteSpace: 'pre-line' }}>{risk.remediation}</div>
      </div>
    </div>
  );
};
