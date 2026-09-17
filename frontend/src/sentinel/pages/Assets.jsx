import React, { useState, useEffect } from 'react';
import { Globe, Shield, RefreshCw, CheckCircle2, AlertTriangle, ExternalLink, Activity, Server, Layers, Calendar, ChevronRight } from 'lucide-react';
import { apiClient } from '../api/client';

export const Assets = ({ onSelectAsset, onNewAssessment }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyingUrl, setVerifyingUrl] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projects, setProjects] = useState([]);
  const [verifying, setVerifying] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pData, aData] = await Promise.all([
        apiClient.getProjects(),
        apiClient.getAssets()
      ]);
      setProjects(pData);
      setAssets(aData);
      if (pData && pData.length > 0) {
        setSelectedProjectId(pData[0].id);
      }
    } catch (err) {
      console.error('Failed to load asset data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyNewAsset = async (e) => {
    e.preventDefault();
    if (!verifyingUrl.trim() || !selectedProjectId) return;
    setVerifying(true);
    setMsg('');
    try {
      const created = await apiClient.verifyAsset(selectedProjectId, verifyingUrl.trim());
      setAssets([created, ...assets.filter(a => a.id !== created.id)]);
      setVerifyingUrl('');
      setMsg(`✓ Target asset '${created.hostname}' verified successfully via HTTP Discovery.`);
    } catch (err) {
      setMsg(`Verification failed: ${err.message}`);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="title-gradient" style={{ fontSize: '26px', marginBottom: '4px' }}>
            Production Application Assets
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
            Authorized live web applications, API gateways, and external target infrastructure.
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={loadData}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Inventory</span>
        </button>
      </div>

      {/* Verify & Add Target Asset */}
      <div className="cyber-card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={18} color="#00f2fe" />
          <span>Register & Verify New Production Target Asset</span>
        </h3>

        {msg && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '6px',
            marginBottom: '16px',
            fontSize: '13px',
            background: msg.startsWith('✓') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: msg.startsWith('✓') ? '1px solid #10b981' : '1px solid #ef4444',
            color: msg.startsWith('✓') ? '#10b981' : '#ef4444'
          }}>
            {msg}
          </div>
        )}

        <form onSubmit={handleVerifyNewAsset} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '12px' }}>
          <select
            className="form-select"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <input
            type="text"
            className="form-input"
            placeholder="https://app.example.com"
            value={verifyingUrl}
            onChange={(e) => setVerifyingUrl(e.target.value)}
            required
          />

          <button type="submit" className="btn btn-primary" disabled={verifying}>
            {verifying ? 'Running Discovery...' : 'Verify Asset'}
          </button>
        </form>
      </div>

      {/* Asset Inventory List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          Loading asset inventory...
        </div>
      ) : assets.length === 0 ? (
        <div className="cyber-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Globe size={48} color="#334155" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', color: '#f8fafc', marginBottom: '8px' }}>No Production Assets Registered</h3>
          <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '480px', margin: '0 auto 20px' }}>
            Register target web application URLs above to authorize HTTP discovery and schedule DAST vulnerability assessments.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
          {assets.map((asset) => (
            <div key={asset.id} className="cyber-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Globe size={20} color="#00f2fe" />
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
                        {asset.hostname}
                      </h4>
                      <a
                        href={asset.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '12px', color: '#38bdf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}
                      >
                        <span>{asset.url}</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: asset.status === 'REACHABLE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: asset.status === 'REACHABLE' ? '#10b981' : '#ef4444',
                    border: asset.status === 'REACHABLE' ? '1px solid #10b981' : '1px solid #ef4444'
                  }}>
                    {asset.status}
                  </span>
                </div>

                {/* Tech Stack Badges */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase' }}>
                    Technology Stack
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(asset.tech_stack && asset.tech_stack.length > 0) ? (
                      asset.tech_stack.map((t, idx) => (
                        <span key={idx} style={{
                          fontSize: '11px',
                          background: '#090d16',
                          border: '1px solid #1e293b',
                          color: '#38bdf8',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}>
                          {t}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Generic Web Server</span>
                    )}
                  </div>
                </div>

                {/* Status Metadata */}
                <div style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  background: '#090d16',
                  borderRadius: '6px',
                  padding: '10px',
                  border: '1px solid #1e293b',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '10px' }}>PROTOCOL</span>
                    <strong style={{ color: '#f8fafc' }}>{asset.protocol.toUpperCase()} ({asset.port})</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '10px' }}>VERIFICATION</span>
                    <strong style={{ color: '#10b981' }}>✓ VERIFIED</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => onNewAssessment && onNewAssessment('dast', asset.url)}
                  style={{ flex: 1, padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Activity size={14} />
                  <span>Start DAST Scan</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
