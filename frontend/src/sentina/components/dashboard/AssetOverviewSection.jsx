'use client'
import React, { useState } from 'react';
import {
  Server,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Globe,
  Code,
  Cloud,
  Database,
  Layers
} from 'lucide-react';
import { SeverityBadge } from '../SeverityBadge';
import { mockAssets } from '../../api/mockData';

export function AssetOverviewSection({ onNavigateToAssets, onSelectAsset }) {
  const [activeCategory, setActiveCategory] = useState('ALL');

  const categories = ['ALL', 'APIs', 'Web Applications', 'GitHub Repositories', 'Cloud Assets', 'Subdomains', 'Dependencies'];

  const filteredAssets = activeCategory === 'ALL'
    ? mockAssets
    : mockAssets.filter(a => a.category.toLowerCase() === activeCategory.toLowerCase());

  const getTypeIcon = (type) => {
    switch (type) {
      case 'API Gateway': return Layers;
      case 'GitHub Repository': return Code;
      case 'Web Application': return Globe;
      case 'Cloud Infrastructure':
      case 'Cloud Storage Bucket': return Cloud;
      case 'Database Cluster': return Database;
      default: return Server;
    }
  };

  return (
    <div className="cyber-card" style={{ marginBottom: '24px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              ASSET SECURITY POSTURE
            </span>
            <span
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'rgba(56, 189, 248, 0.12)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.3)'
              }}
            >
              {mockAssets.length} REGISTERED ASSETS
            </span>
          </div>
          <p style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>
            Continuous vulnerability and credential exposure tracking across attack surface.
          </p>
        </div>

        {onNavigateToAssets && (
          <button onClick={onNavigateToAssets} className="btn btn-secondary btn-xs" style={{ gap: '4px' }}>
            <span>Manage Inventory</span>
            <ArrowRight size={12} />
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '14px' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`filter-pill ${activeCategory === cat ? 'active' : ''}`}
            style={{ fontSize: '11px', padding: '4px 10px' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Asset Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Type</th>
              <th>Environment</th>
              <th>Risk Score</th>
              <th>Findings Breakdown</th>
              <th>Last Scan</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                  No assets registered yet. Add a repository or target URL in a new assessment to begin.
                </td>
              </tr>
            ) : (
              filteredAssets.map(asset => {
                const Icon = getTypeIcon(asset.type);

                return (
                  <tr
                    key={asset.id}
                    className="interactive-row"
                    onClick={() => onSelectAsset && onSelectAsset(asset.id)}
                  >
                    {/* Asset name */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            background: '#0e1730',
                            border: '1px solid #1e2c4d',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#38bdf8'
                          }}
                        >
                          <Icon size={14} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '13.5px' }}>
                            {asset.name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            Owner: {asset.owner}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td style={{ color: '#94a3b8', fontSize: '12.5px' }}>
                      {asset.type}
                    </td>

                    {/* Environment */}
                    <td>
                      <span
                        style={{
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: '#101930',
                          color: '#94a3b8',
                          border: '1px solid #1a2544'
                        }}
                      >
                        {asset.environment}
                      </span>
                    </td>

                    {/* Risk */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <SeverityBadge severity={asset.risk} size="sm" />
                        <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#e2e8f0', fontWeight: 700 }}>
                          {asset.riskScore}
                        </span>
                      </div>
                    </td>

                    {/* Findings breakdown chips */}
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {asset.findingsCount?.critical > 0 && (
                          <span
                            style={{
                              fontSize: '10.5px',
                              fontFamily: 'var(--font-mono)',
                              padding: '1px 5px',
                              borderRadius: '3px',
                              background: 'rgba(255, 51, 102, 0.15)',
                              color: '#ff3366',
                              fontWeight: 700
                            }}
                          >
                            {asset.findingsCount.critical}C
                          </span>
                        )}
                        {asset.findingsCount?.high > 0 && (
                          <span
                            style={{
                              fontSize: '10.5px',
                              fontFamily: 'var(--font-mono)',
                              padding: '1px 5px',
                              borderRadius: '3px',
                              background: 'rgba(245, 158, 11, 0.15)',
                              color: '#f59e0b',
                              fontWeight: 700
                            }}
                          >
                            {asset.findingsCount.high}H
                          </span>
                        )}
                        {asset.findingsCount?.medium > 0 && (
                          <span
                            style={{
                              fontSize: '10.5px',
                              fontFamily: 'var(--font-mono)',
                              padding: '1px 5px',
                              borderRadius: '3px',
                              background: 'rgba(234, 179, 8, 0.15)',
                              color: '#eab308',
                              fontWeight: 700
                            }}
                          >
                            {asset.findingsCount.medium}M
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Last Scan */}
                    <td style={{ fontSize: '12px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                      {asset.lastScan}
                    </td>

                    {/* Status */}
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: '4px',
                          background: asset.status === 'Healthy' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 51, 102, 0.12)',
                          color: asset.status === 'Healthy' ? '#10b981' : '#ff3366',
                          border: asset.status === 'Healthy' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 51, 102, 0.3)'
                        }}
                      >
                        {asset.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AssetOverviewSection;
