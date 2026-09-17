'use client'
import React from 'react';
import { Activity, ShieldAlert, Globe, Server, CheckCircle2, XCircle, AlertTriangle, ExternalLink } from 'lucide-react';

export function DASTCoverageCard({ dastCoverage, onNavigateToAssessments }) {
  const coverage = dastCoverage || {
    coverage_percentage: 0,
    requests_attempted: 0,
    requests_successful: 0,
    requests_blocked: 0,
    rate_limited: 0,
    urls_discovered: 0,
    urls_scanned: 0,
    waf_status: 'NONE DETECTED'
  };

  const percentage = Math.round(coverage.coverage_percentage || 0);
  const statusColor = percentage >= 70 ? '#10b981' : (percentage >= 40 ? '#f59e0b' : '#ef4444');
  const coverageStatus = percentage >= 70 ? 'FULL COVERAGE' : (percentage >= 40 ? 'LIMITED COVERAGE' : (coverage.requests_attempted > 0 ? 'LIMITED COVERAGE' : 'IDLE'));

  return (
    <div
      style={{
        background: '#060108',
        borderRadius: '12px',
        border: '3px solid #360a25',
        boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.95), inset 0 0 20px rgba(0, 242, 254, 0.04)',
        padding: '16px 20px',
        marginBottom: '16px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative Corner Accents */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '18px', height: '18px', borderTop: '3px solid #00f2fe', borderLeft: '3px solid #00f2fe', borderRadius: '12px 0 0 0', filter: 'drop-shadow(0 0 8px #00f2fe)' }} />
      <div style={{ position: 'absolute', top: 0, right: 0, width: '18px', height: '18px', borderTop: '3px solid #ff1744', borderRight: '3px solid #ff1744', borderRadius: '0 12px 0 0', filter: 'drop-shadow(0 0 8px #ff1744)' }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(0, 242, 254, 0.12)',
              border: '1px solid #00f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(0, 242, 254, 0.35)'
            }}
          >
            <Activity size={17} color="#00f2fe" />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 900, color: '#f8fafc', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              DAST Target Connectivity & Coverage
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              Pre-scan diagnostics, runtime request telemetry & WAF blocking evaluation
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: '9999px',
              background: `${statusColor}18`,
              border: `1px solid ${statusColor}`,
              color: statusColor,
              letterSpacing: '0.6px',
              textTransform: 'uppercase'
            }}
          >
            ● {coverageStatus}
          </span>
          {onNavigateToAssessments && (
            <button
              onClick={onNavigateToAssessments}
              className="btn btn-ghost btn-xs"
              style={{ fontSize: '11px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px' }}
            >
              <span>View Scans</span>
              <ExternalLink size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Coverage Score Gauge + 6 Telemetry Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '16px', alignItems: 'center' }}>
        {/* Left Column: Huge Coverage Score */}
        <div
          style={{
            background: '#0a030f',
            border: '2px solid #360a25',
            borderRadius: '10px',
            padding: '14px 16px',
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%'
          }}
        >
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
            DAST COVERAGE
          </div>
          <div
            style={{
              fontSize: '38px',
              fontWeight: 900,
              fontFamily: 'var(--font-mono)',
              color: statusColor,
              lineHeight: 1,
              textShadow: `0 0 16px ${statusColor}70`
            }}
          >
            {percentage}%
          </div>
          <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '6px' }}>
            {coverage.active_targets_count || 0} Monitored Target{coverage.active_targets_count === 1 ? '' : 's'}
          </div>
        </div>

        {/* Right Column: 7 Telemetry Grid Items */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
          {/* 1. Requests Attempted */}
          <div style={{ background: '#0a030f', border: '1px solid #27071c', borderRadius: '8px', padding: '8px 12px' }}>
            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Requests</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#f8fafc', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              {(coverage.requests_attempted || 0).toLocaleString()}
            </div>
          </div>

          {/* 2. Successful */}
          <div style={{ background: '#0a030f', border: '1px solid #27071c', borderRadius: '8px', padding: '8px 12px' }}>
            <div style={{ fontSize: '10px', color: '#10b981', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={11} />
              <span>Successful</span>
            </div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#10b981', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              {(coverage.requests_successful || 0).toLocaleString()}
            </div>
          </div>

          {/* 3. Blocked */}
          <div style={{ background: '#0a030f', border: '1px solid #27071c', borderRadius: '8px', padding: '8px 12px' }}>
            <div style={{ fontSize: '10px', color: '#ff1744', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <XCircle size={11} />
              <span>Blocked (403/WAF)</span>
            </div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: coverage.requests_blocked > 0 ? '#ff1744' : '#f8fafc', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              {(coverage.requests_blocked || 0).toLocaleString()}
            </div>
          </div>

          {/* 4. Rate Limited */}
          <div style={{ background: '#0a030f', border: '1px solid #27071c', borderRadius: '8px', padding: '8px 12px' }}>
            <div style={{ fontSize: '10px', color: '#f59e0b', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertTriangle size={11} />
              <span>Rate Limited (429)</span>
            </div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: coverage.rate_limited > 0 ? '#f59e0b' : '#f8fafc', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              {(coverage.rate_limited || 0).toLocaleString()}
            </div>
          </div>

          {/* 5. URLs Discovered */}
          <div style={{ background: '#0a030f', border: '1px solid #27071c', borderRadius: '8px', padding: '8px 12px' }}>
            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>URLs Discovered</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#38bdf8', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              {(coverage.urls_discovered || 0).toLocaleString()}
            </div>
          </div>

          {/* 6. URLs Scanned */}
          <div style={{ background: '#0a030f', border: '1px solid #27071c', borderRadius: '8px', padding: '8px 12px' }}>
            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>URLs Scanned</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#c084fc', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              {(coverage.urls_scanned || 0).toLocaleString()}
            </div>
          </div>

          {/* 7. WAF Status */}
          <div style={{ background: '#0a030f', border: '1px solid #27071c', borderRadius: '8px', padding: '8px 12px', gridColumn: 'span 2' }}>
            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldAlert size={11} color="#f59e0b" />
              <span>WAF / Bot Protection</span>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: coverage.waf_status?.includes('None') ? '#10b981' : '#f59e0b', marginTop: '4px', textTransform: 'uppercase' }}>
              {coverage.waf_status || 'NONE DETECTED'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DASTCoverageCard;
