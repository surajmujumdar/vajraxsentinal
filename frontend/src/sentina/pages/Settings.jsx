'use client'
import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Key,
  Bell,
  Users,
  Sliders,
  Check,
  Save,
  Trash2,
  Plus
} from 'lucide-react';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('scanners');
  const [saved, setSaved] = useState(false);

  const [scannerConfig, setScannerConfig] = useState({
    sastStrictness: 'High',
    dastFuzzingDepth: 'Aggressive',
    scaExcludeDev: true,
    secretsScanGitHistory: true,
    aiCorrelationAutoTriage: true,
    threatIntelAutoBlock: false
  });

  const [apiKeys, setApiKeys] = useState([
    { id: 'key-1', name: 'GitHub CI/CD Automation Token', key: 'snt_live_9981a8bc098192837192', created: '2026-08-15', status: 'Active' },
    { id: 'key-2', name: 'Kubernetes Ingress Telemetry Bridge', key: 'snt_live_1120aa78299101928371', created: '2026-08-20', status: 'Active' }
  ]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="page-container">
      {/* Top Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#f8fafc' }}>
            Platform Settings & Integrations
          </h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
            Scanner engine policies, CI/CD webhook pipelines, and API authorization tokens.
          </p>
        </div>

        <button onClick={handleSave} className="btn btn-primary" style={{ fontSize: '13px', gap: '6px' }}>
          {saved ? <Check size={14} /> : <Save size={14} />}
          <span>{saved ? 'Saved Successfully' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #141f38', paddingBottom: '8px' }}>
        {[
          { id: 'scanners', label: 'Scanner Policies', icon: Sliders },
          { id: 'apikeys', label: 'API & CI/CD Keys', icon: Key },
          { id: 'notifications', label: 'Webhook Alerts', icon: Bell },
          { id: 'team', label: 'Team & RBAC', icon: Users }
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`filter-pill ${isActive ? 'active' : ''}`}
            >
              <Icon size={14} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Scanners Config */}
      {activeTab === 'scanners' && (
        <div className="cyber-card" style={{ padding: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc', marginBottom: '16px' }}>
            Scanner Engine Policies & Heuristics
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">SAST AST Rule Strictness</label>
              <select
                className="form-select"
                value={scannerConfig.sastStrictness}
                onChange={e => setScannerConfig({ ...scannerConfig, sastStrictness: e.target.value })}
              >
                <option value="Standard">Standard (Low False Positives)</option>
                <option value="High">High (Recommended for Production)</option>
                <option value="Paranoid">Paranoid (All Potential Code Paths)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">DAST Web Fuzzing Depth</label>
              <select
                className="form-select"
                value={scannerConfig.dastFuzzingDepth}
                onChange={e => setScannerConfig({ ...scannerConfig, dastFuzzingDepth: e.target.value })}
              >
                <option value="Passive">Passive (Headers & Cookies Only)</option>
                <option value="Moderate">Moderate (Standard SQLi & XSS Payloads)</option>
                <option value="Aggressive">Aggressive (Deep Parameter Permutation)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#cbd5e1', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={scannerConfig.scaExcludeDev}
                onChange={e => setScannerConfig({ ...scannerConfig, scaExcludeDev: e.target.checked })}
                style={{ accentColor: '#00f2fe' }}
              />
              <span>Exclude devDependencies from SCA vulnerability score</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#cbd5e1', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={scannerConfig.secretsScanGitHistory}
                onChange={e => setScannerConfig({ ...scannerConfig, secretsScanGitHistory: e.target.checked })}
                style={{ accentColor: '#00f2fe' }}
              />
              <span>Audit complete git commit history during Secret Scanning</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#cbd5e1', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={scannerConfig.aiCorrelationAutoTriage}
                onChange={e => setScannerConfig({ ...scannerConfig, aiCorrelationAutoTriage: e.target.checked })}
                style={{ accentColor: '#00f2fe' }}
              />
              <span>Enable AI Autonomous Exploit Chain Synthesis across all scanner events</span>
            </label>
          </div>
        </div>
      )}

      {/* Tab 2: API Keys */}
      {activeTab === 'apikeys' && (
        <div className="cyber-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc' }}>
                API & CI/CD Integration Tokens
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Tokens used by GitHub Actions, GitLab CI, or Sentinel CLI scanners.
              </div>
            </div>
            <button
              onClick={() => {
                const newKey = {
                  id: `key-${Date.now()}`,
                  name: 'New Custom CI Token',
                  key: `snt_live_${Math.random().toString(36).substr(2, 18)}`,
                  created: new Date().toISOString().slice(0, 10),
                  status: 'Active'
                };
                setApiKeys([newKey, ...apiKeys]);
              }}
              className="btn btn-primary btn-sm"
              style={{ gap: '4px' }}
            >
              <Plus size={13} /> Generate Token
            </button>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Token Name</th>
                  <th>Secret Key Token</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map(k => (
                  <tr key={k.id}>
                    <td style={{ fontWeight: 600, color: '#f8fafc' }}>{k.name}</td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#38bdf8' }}>
                        {k.key}
                      </span>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '12px' }}>{k.created}</td>
                    <td>
                      <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>
                        {k.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setApiKeys(apiKeys.filter(x => x.id !== k.id))}
                        className="btn btn-danger btn-xs"
                      >
                        <Trash2 size={12} /> Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Notifications */}
      {activeTab === 'notifications' && (
        <div className="cyber-card" style={{ padding: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc', marginBottom: '16px' }}>
            Real-time Security Webhooks & Alerts
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
            <div className="form-group">
              <label className="form-label">Slack Incoming Webhook URL</label>
              <input type="text" className="form-input" defaultValue="https://hooks.slack.mock-internal/services/T00/B00/XXXX" />
            </div>

            <div className="form-group">
              <label className="form-label">PagerDuty Routing Key (Critical Alerts)</label>
              <input type="text" className="form-input" defaultValue="pd-key-998124018274" />
            </div>

            <div className="form-group">
              <label className="form-label">SecOps Emergency Contact Email</label>
              <input type="email" className="form-input" defaultValue="security-alerts@sentina.io" />
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Team */}
      {activeTab === 'team' && (
        <div className="cyber-card" style={{ padding: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc', marginBottom: '16px' }}>
            Access Control & Role Permissions (RBAC)
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Permissions</th>
                  <th>MFA Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>SecOps Lead Admin</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>secops@sentina.io</div>
                  </td>
                  <td style={{ color: '#00f2fe', fontWeight: 700 }}>Lead SecOps</td>
                  <td style={{ color: '#94a3b8', fontSize: '12px' }}>Full Root & Scanner Control</td>
                  <td><span style={{ color: '#10b981', fontWeight: 700 }}>FIDO2 Hardware Active</span></td>
                </tr>
                <tr>
                  <td>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>Security Analyst Tier-2</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>analyst@sentina.io</div>
                  </td>
                  <td style={{ color: '#a855f7', fontWeight: 700 }}>Triage Analyst</td>
                  <td style={{ color: '#94a3b8', fontSize: '12px' }}>Findings Review & Triage</td>
                  <td><span style={{ color: '#10b981', fontWeight: 700 }}>TOTP Active</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsPage;
