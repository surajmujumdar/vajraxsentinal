'use client'
import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  X,
  Copy,
  Check,
  RotateCw,
  Terminal,
  ExternalLink,
  Globe2,
  Server,
  Lock,
  Radio,
  FileCode,
  ArrowRight,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';

export function ScanFailureModal({
  isOpen,
  onClose,
  assessment,
  onRelaunch
}) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, diagnostics, logs

  if (!isOpen || !assessment) return null;

  const failure = assessment.failureReason || {};
  const errorMessage = assessment.errorMessage || failure.summary || 'Scan execution encountered an unhandled error.';
  const category = failure.category || 'SCAN_EXECUTION_FAILURE';
  const errorCode = failure.error_code || 'ERR_EXECUTION_FAILED';
  const title = failure.title || 'Security Scan Failed';
  const technicalDetails = failure.technical_details || errorMessage;
  const remediation = failure.remediation || 'Review target parameters and scan module options before re-launching.';
  const failedStage = failure.failed_stage || 'EXECUTION PIPELINE';
  const targetUrl = assessment.target || failure.target_url || 'Target Application Scope';
  const failedAt = failure.failed_at ? new Date(failure.failed_at).toLocaleString() : (assessment.completedAt || assessment.startedAt || new Date().toLocaleString());
  const rawError = failure.raw_error || assessment.errorMessage || 'No raw trace available';

  const diagnostics = assessment.connectivityDiagnostics || {};
  const checks = diagnostics.checks || {};
  const dnsCheck = checks['1_dns_resolution'] || {};
  const tcpCheck = checks['2_tcp_connectivity'] || {};
  const tlsCheck = checks['3_tls_handshake'] || {};
  const httpCheck = checks['4_http_status'] || {};
  const wafCheck = checks['9_waf_indicators'] || {};

  const handleCopyReport = () => {
    const reportData = {
      assessment_id: assessment.id,
      target: targetUrl,
      target_type: assessment.targetType,
      status: 'FAILED',
      failed_at: failedAt,
      failed_stage: failedStage,
      error_category: category,
      error_code: errorCode,
      title: title,
      summary: errorMessage,
      technical_details: technicalDetails,
      remediation: remediation,
      raw_error: rawError,
      diagnostics_summary: {
        reachability: diagnostics.reachability,
        access_level: diagnostics.access_level,
        dns: dnsCheck.status,
        tcp: tcpCheck.status,
        tls: tlsCheck.status,
        http_status: httpCheck.initial_status_code,
        waf: wafCheck.detected ? wafCheck.provider : 'None detected'
      },
      recent_logs: assessment.logs || []
    };

    navigator.clipboard.writeText(JSON.stringify(reportData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'WAF_ACCESS_DENIED': return '#f97316';
      case 'AUTHENTICATION_REQUIRED': return '#fbbf24';
      case 'TARGET_UNREACHABLE': return '#ff1744';
      case 'SSRF_PROTECTION_BLOCKED': return '#ef4444';
      case 'TARGET_NOT_VERIFIED': return '#c084fc';
      case 'INVALID_REPOSITORY': return '#38bdf8';
      case 'PREREQUISITES_MISSING': return '#f59e0b';
      default: return '#ff1744';
    }
  };

  const badgeColor = getCategoryColor(category);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 0, 6, 0.88)',
        backdropFilter: 'blur(10px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '850px',
          maxHeight: '90vh',
          background: '#060108',
          borderRadius: '14px',
          border: '3px solid #ff1744',
          boxShadow: '0 0 50px rgba(255, 23, 68, 0.45), 0 20px 60px rgba(0, 0, 0, 0.95)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Top Decorative Cyber Accent Lines */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #ff1744 0%, #f97316 50%, #ff1744 100%)' }} />

        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '2px solid #28081c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, rgba(255, 23, 68, 0.15) 0%, rgba(6, 1, 8, 0.6) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(255, 23, 68, 0.25)',
                border: '2px solid #ff1744',
                boxShadow: '0 0 16px rgba(255, 23, 68, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <ShieldAlert size={24} color="#ff1744" style={{ filter: 'drop-shadow(0 0 6px #ff1744)' }} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: 900,
                    color: '#ffffff',
                    letterSpacing: '0.9px',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  SCAN FAILURE DIAGNOSTICS
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 900,
                    fontFamily: 'var(--font-mono)',
                    color: badgeColor,
                    background: `${badgeColor}20`,
                    border: `1.2px solid ${badgeColor}`,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    boxShadow: `0 0 8px ${badgeColor}40`
                  }}
                >
                  {errorCode}
                </span>
              </div>
              <div style={{ fontSize: '11.5px', color: '#cbd5e1', marginTop: '3px' }}>
                Target: <strong style={{ color: '#ffffff' }}>{targetUrl}</strong> • Failed: <span style={{ color: '#94a3b8' }}>{failedAt}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#12020e',
              border: '1px solid #360a25',
              borderRadius: '8px',
              padding: '6px',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.borderColor = '#ff1744'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#360a25'; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '10px 24px',
            background: '#040005',
            borderBottom: '1.5px solid #28081c'
          }}
        >
          {[
            { id: 'overview', label: 'FAILURE ROOT CAUSE & FIX' },
            { id: 'diagnostics', label: 'PRE-SCAN CONNECTIVITY TELEMETRY' },
            { id: 'logs', label: 'RAW ERROR TRACE & LOGS' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                fontSize: '11px',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                padding: '6px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                background: activeTab === t.id ? 'rgba(255, 23, 68, 0.2)' : 'transparent',
                color: activeTab === t.id ? '#ffffff' : '#71717a',
                border: activeTab === t.id ? '1.5px solid #ff1744' : '1px solid transparent',
                boxShadow: activeTab === t.id ? '0 0 10px rgba(255, 23, 68, 0.35)' : 'none'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div
          style={{
            padding: '20px 24px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {activeTab === 'overview' && (
            <>
              {/* Primary Failure Reason Banner */}
              <div
                style={{
                  padding: '16px 18px',
                  borderRadius: '10px',
                  background: 'linear-gradient(180deg, rgba(255, 23, 68, 0.18) 0%, rgba(6, 1, 8, 0.9) 100%)',
                  border: '2px solid #ff1744',
                  boxShadow: '0 0 20px rgba(255, 23, 68, 0.25)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 900, color: '#ff1744', fontFamily: 'var(--font-mono)', letterSpacing: '0.8px' }}>
                    🚨 ROOT CAUSE: {category.replace(/_/g, ' ')}
                  </span>
                  <span
                    style={{
                      fontSize: '9.5px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      color: '#ffffff',
                      background: 'rgba(255, 23, 68, 0.4)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: '1px solid #ff1744'
                    }}
                  >
                    STAGE: {failedStage}
                  </span>
                </div>

                <div style={{ fontSize: '15px', fontWeight: 900, color: '#f8fafc', marginBottom: '6px' }}>
                  {title}
                </div>

                <div style={{ fontSize: '12.5px', color: '#e2e8f0', lineHeight: 1.5 }}>
                  {errorMessage}
                </div>
              </div>

              {/* Technical Details */}
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: '8px',
                  background: '#040005',
                  border: '1.5px solid #28081c'
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 900, color: '#00f2fe', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>
                  TECHNICAL DIAGNOSTIC DETAILS
                </div>
                <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {technicalDetails}
                </div>
              </div>

              {/* Actionable Remediation Playbook */}
              <div
                style={{
                  padding: '16px 18px',
                  borderRadius: '10px',
                  background: 'rgba(0, 255, 136, 0.08)',
                  border: '2px solid #00ff88',
                  boxShadow: '0 0 20px rgba(0, 255, 136, 0.15)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <ShieldCheck size={18} color="#00ff88" />
                  <span style={{ fontSize: '12px', fontWeight: 900, color: '#00ff88', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    RECOMMENDED REMEDIATION & NEXT STEPS
                  </span>
                </div>
                <div style={{ fontSize: '12.5px', color: '#f8fafc', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {remediation}
                </div>
              </div>
            </>
          )}

          {activeTab === 'diagnostics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: 900, color: '#00f2fe', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                12-POINT PRE-SCAN CONNECTIVITY TELEMETRY
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                <div style={{ padding: '10px 12px', borderRadius: '6px', background: '#040005', border: '1.5px solid #28081c' }}>
                  <div style={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase' }}>1. DNS Resolution</div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: dnsCheck.status === 'SUCCESS' ? '#00ff88' : '#ff1744', marginTop: '2px' }}>
                    {dnsCheck.status === 'SUCCESS' ? `Resolved (${dnsCheck.ip_count} IPs)` : `Failed: ${dnsCheck.error || 'NXDOMAIN'}`}
                  </div>
                </div>

                <div style={{ padding: '10px 12px', borderRadius: '6px', background: '#040005', border: '1.5px solid #28081c' }}>
                  <div style={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase' }}>2. TCP Connectivity</div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: tcpCheck.status === 'CONNECTED' ? '#00ff88' : '#ff1744', marginTop: '2px' }}>
                    {tcpCheck.status === 'CONNECTED' ? `Connected on port ${tcpCheck.port}` : `Failed: ${tcpCheck.error || 'Connection Refused'}`}
                  </div>
                </div>

                <div style={{ padding: '10px 12px', borderRadius: '6px', background: '#040005', border: '1.5px solid #28081c' }}>
                  <div style={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase' }}>3. TLS Handshake</div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
                    {tlsCheck.protocol || 'N/A'} {tlsCheck.cipher ? `(${tlsCheck.cipher})` : ''}
                  </div>
                </div>

                <div style={{ padding: '10px 12px', borderRadius: '6px', background: '#040005', border: '1.5px solid #28081c' }}>
                  <div style={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase' }}>4. HTTP Status Code</div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: httpCheck.initial_status_code === 200 ? '#00ff88' : (httpCheck.initial_status_code === 403 || httpCheck.initial_status_code === 401 ? '#ff1744' : '#fbbf24'), marginTop: '2px' }}>
                    HTTP {httpCheck.initial_status_code || 'N/A'}
                  </div>
                </div>

                <div style={{ padding: '10px 12px', borderRadius: '6px', background: '#040005', border: '1.5px solid #28081c' }}>
                  <div style={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase' }}>9. WAF Detection</div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: wafCheck.detected ? '#f97316' : '#00ff88', marginTop: '2px' }}>
                    {wafCheck.detected ? `${wafCheck.provider} (${wafCheck.confidence} confidence)` : 'No WAF Detected'}
                  </div>
                </div>

                <div style={{ padding: '10px 12px', borderRadius: '6px', background: '#040005', border: '1.5px solid #28081c' }}>
                  <div style={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase' }}>11. Authentication Barrier</div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: checks['11_authentication_requirement']?.detected ? '#fbbf24' : '#00ff88', marginTop: '2px' }}>
                    {checks['11_authentication_requirement']?.detected ? `Required (${checks['11_authentication_requirement']?.type || 'Session'})` : 'Public Ingress Accessible'}
                  </div>
                </div>
              </div>

              {diagnostics.diagnostic_recommendation && (
                <div style={{ padding: '12px 14px', borderRadius: '8px', background: 'rgba(0, 242, 254, 0.08)', borderLeft: '3px solid #00f2fe', fontSize: '12px', color: '#e0f2fe' }}>
                  <strong style={{ color: '#00f2fe' }}>Automated Diagnostic Recommendation: </strong>
                  {diagnostics.diagnostic_recommendation}
                </div>
              )}
            </div>
          )}

          {activeTab === 'logs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  SCANNER EXECUTION STACK & RECENT LOGS
                </span>
                <span style={{ fontSize: '10px', color: '#ff1744', fontFamily: 'var(--font-mono)' }}>
                  {assessment.logs?.length || 0} Telemetry Lines
                </span>
              </div>

              <div
                style={{
                  background: '#020003',
                  border: '1.5px solid #28081c',
                  borderRadius: '8px',
                  padding: '14px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11.5px',
                  lineHeight: 1.6,
                  maxHeight: '300px',
                  overflowY: 'auto',
                  color: '#cbd5e1'
                }}
              >
                <div style={{ color: '#ff1744', fontWeight: 900, marginBottom: '8px' }}>
                  [FATAL EXCEPTION]: {rawError}
                </div>

                <div style={{ borderTop: '1px dashed #360a25', paddingTop: '8px', marginTop: '8px' }}>
                  {(assessment.logs && assessment.logs.length > 0) ? (
                    assessment.logs.map((l, idx) => (
                      <div key={idx} style={{ marginBottom: '2px' }}>
                        <span style={{ color: '#ff2a4d' }}>[{l.timestamp ? new Date(l.timestamp).toLocaleTimeString() : (l.time || 'Live')}]</span>{' '}
                        <span style={{ color: '#00f2fe', fontWeight: 700 }}>[{l.stage || 'STAGE'}]</span>{' '}
                        <span style={{ color: l.stage === 'FAILED' ? '#ff1744' : (l.stage === 'COMPLETED' ? '#00ff88' : '#94a3b8') }}>
                          {l.message || l.text}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: '#71717a' }}>No sequential log events recorded prior to exception.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '2px solid #28081c',
            background: '#040005',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <button
            onClick={handleCopyReport}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '11px', gap: '6px' }}
          >
            {copied ? <Check size={13} color="#00ff88" /> : <Copy size={13} />}
            <span>{copied ? 'Copied Diagnostic Report!' : 'Copy Full Diagnostic JSON'}</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px' }}
            >
              Dismiss
            </button>

            {onRelaunch && (
              <button
                onClick={() => {
                  onClose();
                  onRelaunch(assessment);
                }}
                className="btn btn-primary btn-sm"
                style={{ fontSize: '11px', gap: '6px' }}
              >
                <RotateCw size={13} />
                <span>Relaunch with Corrected Settings</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScanFailureModal;
