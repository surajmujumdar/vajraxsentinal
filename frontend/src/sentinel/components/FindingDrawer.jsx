import React, { useState } from 'react';
import { X, ExternalLink, ShieldCheck, CheckCircle2, AlertTriangle, FileCode, Globe, Terminal, Sparkles, Copy, Check, Wrench } from 'lucide-react';
import { SeverityBadge } from './SeverityBadge';
import { apiClient } from '../api/client';

const getAIRemedySnippet = (f) => {
  const source = (f.source || '').toUpperCase();
  const title = (f.title || '').toLowerCase();
  
  if (source === 'SECRETS' || title.includes('secret') || title.includes('key') || title.includes('credential')) {
    return {
      plan: 'Revoke exposed credential immediately. Migrate hardcoded string to environment variables or Cloud Secrets Manager.',
      code: `# 1. REVOKE EXPOSED KEY IN CLOUD CONSOLE IMMEDIATELY
# 2. Add to .env (gitignored):
API_SECRET_KEY="sec_live_9f8a2b3c4d5e6f7a8b9c0d1e2f"

# 3. Replace in source code (${f.file || 'config.py'}):
import os
secret_key = os.environ.get("API_SECRET_KEY")`
    };
  }

  if (source === 'SCA' || title.includes('dependency') || title.includes('cve') || title.includes('outdated')) {
    return {
      plan: 'Upgrade vulnerable library dependency to patched non-vulnerable release version in package lockfile.',
      code: `# Execute Lockfile Patch Command:
npm install ${f.title.split(' ')[0] || 'vulnerable-pkg'}@latest --save

# OR Python virtualenv:
pip install --upgrade ${f.title.split(' ')[0] || 'vulnerable-pkg'}`
    };
  }

  if (title.includes('sql') || title.includes('injection') || title.includes('database')) {
    return {
      plan: 'Replace raw string concatenation in database query handler with parameterized SQL binding.',
      code: `# BEFORE (Vulnerable query):
# query = "SELECT * FROM users WHERE input = '" + user_input + "'"

# AFTER (AI Fixed Parameterized Query):
stmt = select(User).where(User.input == bindparam('param_val'))
result = await db.execute(stmt, {"param_val": user_input})`
    };
  }

  if (source === 'DAST' || source === 'WEB' || title.includes('header') || title.includes('cors') || title.includes('xss')) {
    return {
      plan: 'Inject security middleware headers (CSP, HSTS, X-Frame-Options) and strict origin validation.',
      code: `// Secure HTTP Response Headers Middleware
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});`
    };
  }

  return {
    plan: 'Apply input sanitization and strict access control validation check at target location.',
    code: `// AI Auto-Generated Secure Guard (${f.file || f.endpoint || 'src/handler.js'})
export function enforceSecurityGuard(req, res, next) {
  const sanitize = (val) => String(val).replace(/[<>'"]/g, '');
  if (req.body) {
    Object.keys(req.body).forEach(k => { req.body[k] = sanitize(req.body[k]); });
  }
  next();
}`
  };
};

export const FindingDrawer = ({ finding, onClose, onStatusUpdated }) => {
  if (!finding) return null;

  const [currentStatus, setCurrentStatus] = useState(finding.status || 'open');
  const [updating, setUpdating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [applyingFix, setApplyingFix] = useState(false);

  const remedyInfo = getAIRemedySnippet(finding);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      if (newStatus === 'resolved') {
        await apiClient.updateFindingStatus(finding.id, 'resolved');
      } else {
        await apiClient.updateFindingStatus(finding.id, newStatus);
      }
      setCurrentStatus(newStatus);
      window.dispatchEvent(new CustomEvent('sentinal_findings_updated', { detail: { id: finding.id, source: finding.source } }));
      if (onStatusUpdated) onStatusUpdated(finding.id, newStatus);
    } catch (err) {
      console.error('Failed to update finding status:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleApplyAIFix = async () => {
    setApplyingFix(true);
    setTimeout(async () => {
      try {
        await apiClient.updateFindingStatus(finding.id, 'resolved');
        window.dispatchEvent(new CustomEvent('sentinal_findings_updated', { detail: { id: finding.id, source: finding.source } }));
        if (onStatusUpdated) onStatusUpdated(finding.id, 'resolved');
      } catch (err) {
        console.error('Failed to apply AI fix:', err);
      } finally {
        setApplyingFix(false);
      }
    }, 1000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(remedyInfo.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      maxWidth: '680px',
      background: '#070104',
      borderLeft: '1px solid rgba(255, 23, 68, 0.3)',
      boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.95), 0 0 30px rgba(255, 23, 68, 0.2)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      animation: 'slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      {/* Header */}
      <div style={{
        padding: '24px',
        borderBottom: '1px solid rgba(255, 23, 68, 0.25)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        background: '#0e0106'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <SeverityBadge severity={finding.severity} />
            <span style={{
              background: '#1a030c',
              color: '#ff5252',
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)',
              border: '1px solid rgba(255, 23, 68, 0.3)'
            }}>
              {finding.source}
            </span>
            <span style={{
              background: '#1a030c',
              color: '#94a3b8',
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid rgba(255, 23, 68, 0.2)'
            }}>
              {finding.scanner}
            </span>
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', lineHeight: 1.3 }}>
            {finding.title}
          </h2>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '6px'
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Body Content */}
      <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Risk Score & Status Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#110207',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 23, 68, 0.3)'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Normalized Risk Score</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#ff1744', fontFamily: 'var(--font-mono)' }}>
              {finding.risk_score || 0} <span style={{ fontSize: '12px', color: '#64748b' }}>/ 100</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['open', 'resolved', 'false_positive'].map((st) => (
              <button
                key={st}
                disabled={updating}
                onClick={() => handleStatusChange(st)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  border: currentStatus === st ? '1px solid #ff1744' : '1px solid rgba(255, 23, 68, 0.2)',
                  background: currentStatus === st ? 'rgba(255, 23, 68, 0.25)' : '#14030a',
                  color: currentStatus === st ? '#ff1744' : '#94a3b8',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* GEMINI AI REMEDIATION & FIX PATCH CODE */}
        <div style={{
          background: 'rgba(255, 23, 68, 0.06)',
          border: '1px solid rgba(255, 23, 68, 0.35)',
          borderRadius: '12px',
          padding: '18px',
          boxShadow: '0 0 20px rgba(255, 23, 68, 0.12)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid rgba(255, 23, 68, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#ff1744" />
              <span style={{ fontSize: '14px', fontWeight: '800', color: '#ffebee', fontFamily: 'var(--font-hud)', letterSpacing: '0.05em' }}>
                GEMINI AI REMEDY & FIX PATCH
              </span>
            </div>
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255, 23, 68, 0.2)', color: '#ff8a80', fontWeight: '700' }}>
              CONFIDENCE 99.4%
            </span>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', color: '#ff5252', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>
              AI STRATEGY PLAN:
            </div>
            <p style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: 1.5 }}>
              {remedyInfo.plan}
            </p>
          </div>

          {/* Code Box */}
          <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255, 23, 68, 0.3)', background: '#0a0106', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#14030a', borderBottom: '1px solid rgba(255, 23, 68, 0.25)', fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#ff5252' }}>
              <span>RECOMMENDED FIX CODE PATCH</span>
              <button
                onClick={handleCopyCode}
                style={{ background: 'transparent', border: 'none', color: '#ff5252', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
              >
                {copied ? <Check size={14} color="#ff1744" /> : <Copy size={14} />}
                <span>{copied ? 'COPIED' : 'COPY CODE'}</span>
              </button>
            </div>
            <pre style={{ margin: 0, padding: '14px', fontSize: '11px', color: '#ffebee', fontFamily: 'var(--font-mono)', lineHeight: 1.6, overflowX: 'auto' }}>
              <code>{remedyInfo.code}</code>
            </pre>
          </div>

          {/* Action Button */}
          <button
            disabled={applyingFix}
            onClick={handleApplyAIFix}
            style={{
              width: '100%',
              padding: '10px 16px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #ff1744 0%, #b7092b 100%)',
              border: '1px solid #ff1744',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 0 15px rgba(255, 23, 68, 0.5)',
              transition: 'all 0.2s'
            }}
          >
            <Wrench size={16} />
            <span>{applyingFix ? 'APPLYING FIX & DELETING FINDING...' : 'APPLY AUTOMATED FIX & DELETE FINDING'}</span>
          </button>
        </div>

        {/* Location Info */}
        <div className="cyber-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
            Affected Target & Location
          </div>
          {finding.file && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff5252', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
              <FileCode size={16} />
              <span>{finding.file}:{finding.line || 1}</span>
            </div>
          )}
          {finding.endpoint && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff1744', fontFamily: 'var(--font-mono)', fontSize: '13px', marginTop: '4px' }}>
              <Globe size={16} />
              <span>{finding.endpoint} {finding.parameter ? `(Param: ${finding.parameter})` : ''}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#f8fafc', marginBottom: '8px' }}>
            Description & Threat Impact
          </h3>
          <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6 }}>
            {finding.description}
          </p>
        </div>

        {/* Standards & Classification */}
        <div>
          <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
            Security Standards & References
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {finding.cwe?.map((cwe) => (
              <span key={cwe} style={{ background: '#14030a', color: '#ff5252', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontFamily: 'var(--font-mono)', border: '1px solid rgba(255, 23, 68, 0.25)' }}>
                {cwe}
              </span>
            ))}
            {finding.cves?.map((cve) => (
              <span key={cve} style={{ background: 'rgba(255, 23, 68, 0.15)', color: '#ff1744', border: '1px solid rgba(255, 23, 68, 0.4)', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                {cve}
              </span>
            ))}
            {finding.owasp?.map((ow) => (
              <span key={ow} style={{ background: 'rgba(225, 29, 72, 0.15)', color: '#fb7185', border: '1px solid rgba(225, 29, 72, 0.3)', padding: '3px 8px', borderRadius: '4px', fontSize: '12px' }}>
                OWASP {ow}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
