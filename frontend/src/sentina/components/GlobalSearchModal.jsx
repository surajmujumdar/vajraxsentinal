'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ShieldAlert, Server, FileText, ArrowRight, CornerDownLeft } from 'lucide-react';
import { SeverityBadge } from './SeverityBadge';
import { mockFindings, mockAssets } from '../api/mockData';

export function GlobalSearchModal({ isOpen, onClose, onSelectFinding, onSelectAsset }) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQ = query.toLowerCase().trim();

  const filteredFindings = mockFindings.filter(f => 
    !cleanQ || 
    f.title.toLowerCase().includes(cleanQ) || 
    f.category.toLowerCase().includes(cleanQ) || 
    (f.cve && f.cve.toLowerCase().includes(cleanQ)) ||
    f.asset.toLowerCase().includes(cleanQ)
  );

  const filteredAssets = mockAssets.filter(a => 
    !cleanQ || 
    a.name.toLowerCase().includes(cleanQ) || 
    a.category.toLowerCase().includes(cleanQ) || 
    a.owner.toLowerCase().includes(cleanQ)
  );

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="cyber-card" 
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          background: '#090e1e',
          border: '1px solid #1e2c4d',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(0, 242, 254, 0.15)',
          overflow: 'hidden'
        }}
      >
        {/* Search Input Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          borderBottom: '1px solid #141f36',
          background: '#0a1024'
        }}>
          <Search size={20} color="#00f2fe" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search findings, CVEs, assets, or scanner logs..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f8fafc',
              fontSize: '15px',
              fontFamily: 'var(--font-main)'
            }}
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          )}
          <span style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            padding: '2px 6px',
            background: '#141d33',
            color: '#94a3b8',
            borderRadius: '4px',
            border: '1px solid #1e293b'
          }}>
            ESC
          </span>
        </div>

        {/* Filter Pills */}
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '10px 20px',
          borderBottom: '1px solid #141f36',
          background: '#070b18'
        }}>
          <button 
            className={`filter-pill ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Results ({filteredFindings.length + filteredAssets.length})
          </button>
          <button 
            className={`filter-pill ${activeTab === 'findings' ? 'active' : ''}`}
            onClick={() => setActiveTab('findings')}
          >
            <ShieldAlert size={13} /> Findings ({filteredFindings.length})
          </button>
          <button 
            className={`filter-pill ${activeTab === 'assets' ? 'active' : ''}`}
            onClick={() => setActiveTab('assets')}
          >
            <Server size={13} /> Assets ({filteredAssets.length})
          </button>
        </div>

        {/* Results List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', maxHeight: '440px' }}>
          {/* Findings */}
          {(activeTab === 'all' || activeTab === 'findings') && filteredFindings.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                padding: '4px 8px',
                marginBottom: '6px'
              }}>
                Security Findings ({filteredFindings.length})
              </div>
              {filteredFindings.slice(0, 4).map(f => (
                <div
                  key={f.id}
                  onClick={() => {
                    onSelectFinding(f.id);
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: '#0a1022',
                    border: '1px solid #141f38',
                    marginBottom: '6px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#00f2fe';
                    e.currentTarget.style.background = '#0e1730';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#141f38';
                    e.currentTarget.style.background = '#0a1022';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <SeverityBadge severity={f.severity} size="sm" />
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#f8fafc' }}>
                        {f.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', gap: '8px', marginTop: '2px' }}>
                        <span>{f.asset}</span>
                        <span>•</span>
                        <span style={{ color: '#38bdf8' }}>{f.source}</span>
                        {f.cve && (
                          <>
                            <span>•</span>
                            <span style={{ color: '#a855f7' }}>{f.cve}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                      Risk: {f.riskScore}
                    </span>
                    <ArrowRight size={14} color="#64748b" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Assets */}
          {(activeTab === 'all' || activeTab === 'assets') && filteredAssets.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                padding: '4px 8px',
                marginBottom: '6px'
              }}>
                Monitored Assets ({filteredAssets.length})
              </div>
              {filteredAssets.slice(0, 3).map(a => (
                <div
                  key={a.id}
                  onClick={() => {
                    onSelectAsset(a.id);
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: '#0a1022',
                    border: '1px solid #141f38',
                    marginBottom: '6px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#38bdf8';
                    e.currentTarget.style.background = '#0e1730';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#141f38';
                    e.currentTarget.style.background = '#0a1022';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      padding: '6px',
                      borderRadius: '6px',
                      background: 'rgba(56, 189, 248, 0.1)',
                      color: '#38bdf8'
                    }}>
                      <Server size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#f8fafc' }}>
                        {a.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        {a.type} • {a.owner}
                      </div>
                    </div>
                  </div>
                  <SeverityBadge severity={a.risk} size="sm" />
                </div>
              ))}
            </div>
          )}

          {filteredFindings.length === 0 && filteredAssets.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <Search size={36} color="#334155" style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '14px', color: '#94a3b8' }}>No results matching &quot;{query}&quot;</p>
              <p style={{ fontSize: '12px', marginTop: '4px' }}>Try searching for SQLi, CVE-2024, API endpoints, or repository names</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div style={{
          padding: '10px 20px',
          borderTop: '1px solid #141f36',
          background: '#070b18',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11.5px',
          color: '#64748b'
        }}>
          <div style={{ display: 'flex', gap: '14px' }}>
            <span><strong style={{ color: '#94a3b8' }}>↑↓</strong> Navigate</span>
            <span><strong style={{ color: '#94a3b8' }}>ENTER</strong> Select</span>
            <span><strong style={{ color: '#94a3b8' }}>ESC</strong> Close</span>
          </div>
          <span style={{ color: '#00f2fe', fontFamily: 'var(--font-mono)' }}>SENTINA SOC SEARCH</span>
        </div>
      </div>
    </div>
  );
}

export default GlobalSearchModal;
