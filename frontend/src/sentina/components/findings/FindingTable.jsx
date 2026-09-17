'use client'
import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  ChevronDown,
  ShieldAlert,
  Code2,
  Radio,
  Boxes,
  KeyRound,
  Globe2,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { SeverityBadge, getRatingMeta } from '../SeverityBadge';

export function FindingTable({
  findings = [],
  onSelectFinding,
  selectedSeverity: propSelectedSeverity = 'ALL',
  onSelectSeverity,
  onViewAllFindings,
  limit = null
}) {
  const [internalSeverity, setInternalSeverity] = useState(propSelectedSeverity);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('risk_desc');

  // Keep internal rating synchronized with prop
  React.useEffect(() => {
    setInternalSeverity(propSelectedSeverity || 'ALL');
  }, [propSelectedSeverity]);

  const activeSeverity = onSelectSeverity ? propSelectedSeverity : internalSeverity;

  const handleRatingClick = (ratingKey) => {
    const nextRating = activeSeverity === ratingKey ? 'ALL' : ratingKey;
    setInternalSeverity(nextRating);
    if (onSelectSeverity) {
      onSelectSeverity(nextRating);
    }
  };

  const sources = ['ALL', 'SAST', 'DAST', 'SCA', 'Secrets', 'Threat Intelligence'];
  const ratingOptions = [
    { key: 'ALL', label: 'ALL RATINGS' },
    { key: 'CRITICAL', label: 'CRITICAL RISK', color: '#ff1744' },
    { key: 'HIGH', label: 'ELEVATED RISK', color: '#f97316' },
    { key: 'MEDIUM', label: 'MODERATE RISK', color: '#fbbf24' },
    { key: 'LOW', label: 'LOW RISK', color: '#00f2fe' },
    { key: 'INFO', label: 'INFORMATIONAL', color: '#00ff88' }
  ];

  const getRatingCount = (key) => {
    if (key === 'ALL') return findings.length;
    return findings.filter(f => {
      const meta = getRatingMeta(f.severity || f.rating);
      return meta.key === key;
    }).length;
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'SAST': return Code2;
      case 'DAST': return Radio;
      case 'SCA': return Boxes;
      case 'Secrets': return KeyRound;
      case 'Threat Intelligence': return Globe2;
      default: return Cpu;
    }
  };

  const getSourceColor = (source) => {
    switch (source) {
      case 'SAST': return '#00f2fe';
      case 'DAST': return '#f97316';
      case 'SCA': return '#00ff88';
      case 'Secrets': return '#ff1744';
      case 'Threat Intelligence': return '#fbbf24';
      default: return '#c084fc';
    }
  };

  // Filter and sort findings
  const filtered = findings.filter((f) => {
    if (activeSeverity !== 'ALL') {
      const meta = getRatingMeta(f.severity || f.rating);
      if (meta.key !== activeSeverity && meta.label !== activeSeverity && f.severity?.toUpperCase() !== activeSeverity.toUpperCase()) {
        return false;
      }
    }
    if (selectedSource !== 'ALL' && f.source?.toLowerCase() !== selectedSource.toLowerCase()) {
      return false;
    }
    if (selectedStatus !== 'ALL' && f.status?.toLowerCase() !== selectedStatus.toLowerCase()) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        f.title?.toLowerCase().includes(q) ||
        f.category?.toLowerCase().includes(q) ||
        f.asset?.toLowerCase().includes(q) ||
        (f.cve && f.cve.toLowerCase().includes(q)) ||
        (f.cwe && f.cwe.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  filtered.sort((a, b) => {
    if (sortBy === 'risk_desc') return (b.riskScore || 0) - (a.riskScore || 0);
    if (sortBy === 'risk_asc') return (a.riskScore || 0) - (b.riskScore || 0);
    if (sortBy === 'severity' || sortBy === 'rating') {
      const rank = { CRITICAL: 5, HIGH: 4, MEDIUM: 3, LOW: 2, INFO: 1 };
      const aMeta = getRatingMeta(a.severity || a.rating);
      const bMeta = getRatingMeta(b.severity || b.rating);
      return (rank[bMeta.key] || 0) - (rank[aMeta.key] || 0);
    }
    return 0;
  });

  const isLimited = Boolean(limit);
  const displayedFindings = isLimited ? filtered.slice(0, limit) : filtered;

  return (
    <div
      className="cyber-card"
      style={{
        padding: '16px 18px',
        marginBottom: '20px',
        background: '#060108',
        border: '3px solid #360a25',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.95), inset 0 0 20px rgba(255, 23, 68, 0.04)'
      }}
    >
      {/* Table Header & Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '14px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff1744', boxShadow: '0 0 8px #ff1744' }} />
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              {isLimited ? `TOP ${limit} SECURITY FINDINGS` : 'ALL SECURITY FINDINGS'}
            </span>
            <span
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                color: isLimited ? '#ff1744' : '#00f2fe',
                padding: '2px 7px',
                borderRadius: '4px',
                background: isLimited ? 'rgba(255, 23, 68, 0.15)' : 'rgba(0, 242, 254, 0.12)',
                border: isLimited ? '1.5px solid #ff1744' : '1.5px solid #00f2fe',
                boxShadow: isLimited ? '0 0 8px rgba(255, 23, 68, 0.3)' : '0 0 8px rgba(0, 242, 254, 0.3)'
              }}
            >
              {isLimited ? 'RANKED BY THREAT RISK' : `${filtered.length} OF ${findings.length} TOTAL`}
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#71717a', marginTop: '2px' }}>
            {isLimited
              ? `Showing top ${Math.min(limit, displayedFindings.length)} prioritized threats (Click row for full triage)`
              : `Complete unified findings database (${filtered.length} findings across all scanner engines)`}
          </div>
        </div>

        {/* Action Button & Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Quick Search */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '6px',
              background: '#060108',
              border: '2px solid #360a25',
              width: '200px',
              height: '28px'
            }}
          >
            <Search size={12} color="#71717a" />
            <input
              type="text"
              placeholder="Filter findings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#f8fafc',
                fontSize: '11.5px',
                width: '100%',
                fontFamily: 'var(--font-main)'
              }}
            />
          </div>

          {onViewAllFindings && (
            <button
              onClick={onViewAllFindings}
              className="btn btn-secondary btn-sm"
              style={{ height: '28px', padding: '0 10px', fontSize: '11px', gap: '4px' }}
            >
              <span>View All ({findings.length})</span>
              <ArrowRight size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Threat Rating Filter Tabs with Live Counts */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px', flexWrap: 'wrap' }}>
          {ratingOptions.map((opt) => {
            const isActive = activeSeverity === opt.key;
            const count = getRatingCount(opt.key);
            return (
              <button
                key={opt.key}
                onClick={() => handleRatingClick(opt.key)}
                className={`filter-pill ${isActive ? 'active' : ''}`}
                style={{ fontSize: '10px', padding: '4px 9px', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                {opt.key !== 'ALL' && <SeverityBadge severity={opt.key} size="sm" showIcon={true} />}
                {opt.key === 'ALL' && <span>{opt.label}</span>}
                <span
                  style={{
                    fontSize: '9.5px',
                    fontFamily: 'var(--font-mono)',
                    padding: '1px 5px',
                    borderRadius: '10px',
                    background: isActive ? '#ffffff' : 'rgba(255,255,255,0.1)',
                    color: isActive ? '#000000' : '#a1a1aa',
                    fontWeight: 900
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {activeSeverity !== 'ALL' && (
          <button
            onClick={() => handleRatingClick('ALL')}
            style={{
              fontSize: '10.5px',
              fontWeight: 800,
              color: '#ff1744',
              background: 'rgba(255, 23, 68, 0.1)',
              border: '1px solid rgba(255, 23, 68, 0.4)',
              padding: '3px 8px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ✕ Reset Rating Filter
          </button>
        )}
      </div>

      {/* Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '135px' }}>Threat Rating</th>
              <th>Finding Title</th>
              <th>Affected Asset / Path</th>
              <th>Engine Source</th>
              <th>Detected</th>
              <th>Status</th>
              <th style={{ textAlign: 'right', width: '75px' }}>Risk Score</th>
            </tr>
          </thead>
          <tbody>
            {displayedFindings.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#71717a' }}>
                  No findings matching current threat rating filter.
                </td>
              </tr>
            ) : (
              displayedFindings.map((finding, idx) => {
                const Icon = getSourceIcon(finding.source);
                const sourceColor = getSourceColor(finding.source);

                return (
                  <tr
                    key={finding.id || idx}
                    className="interactive-row"
                    onClick={() => onSelectFinding && onSelectFinding(finding.id)}
                  >
                    {/* Threat Rating Badge */}
                    <td>
                      <SeverityBadge severity={finding.severity || finding.rating} size="sm" />
                    </td>

                    {/* Title */}
                    <td>
                      <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '12.5px' }}>
                        {finding.title}
                      </div>
                      <div
                        style={{
                          fontSize: '10.5px',
                          color: '#71717a',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginTop: '2px',
                          fontFamily: 'var(--font-mono)',
                          flexWrap: 'wrap'
                        }}
                      >
                        {finding.blastRadius && (
                          <span style={{ color: '#f87171', fontWeight: 700, background: 'rgba(239, 68, 68, 0.12)', padding: '1px 5px', borderRadius: '3px', border: '1px solid rgba(239, 68, 68, 0.25)', fontSize: '9.5px' }}>
                            🔥 {finding.blastRadius}
                          </span>
                        )}
                        {finding.cve && <span style={{ color: '#c084fc', fontWeight: 700 }}>{finding.cve}</span>}
                        {finding.cwe && <span style={{ color: '#ff1744' }}>{finding.cwe}</span>}
                        {finding.endpoint && (
                          <span style={{ color: '#94a3b8' }}>{finding.endpoint}</span>
                        )}
                      </div>
                    </td>

                    {/* Asset */}
                    <td style={{ fontSize: '11.5px', color: '#cbd5e1', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                      {finding.asset || finding.filePath || 'Production Scope'}
                    </td>

                    {/* Source Engine */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Icon size={13} color={sourceColor} />
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            fontFamily: 'var(--font-mono)',
                            color: sourceColor
                          }}
                        >
                          {finding.source}
                        </span>
                      </div>
                    </td>

                    {/* Detected Timestamp */}
                    <td style={{ fontSize: '11px', color: '#71717a', fontFamily: 'var(--font-mono)' }}>
                      {finding.detected || 'Just now'}
                    </td>

                    {/* Status */}
                    <td>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background:
                            finding.status === 'Open'
                              ? 'rgba(255, 23, 68, 0.18)'
                              : finding.status === 'In Triage'
                              ? 'rgba(245, 158, 11, 0.18)'
                              : 'rgba(0, 255, 136, 0.18)',
                          color:
                            finding.status === 'Open'
                              ? '#ff2a4d'
                              : finding.status === 'In Triage'
                              ? '#f59e0b'
                              : '#00ff88',
                          border:
                            finding.status === 'Open'
                              ? '1.2px solid #ff1744'
                              : finding.status === 'In Triage'
                              ? '1.2px solid #f59e0b'
                              : '1.2px solid #00ff88'
                        }}
                      >
                        {finding.status || 'Open'}
                      </span>
                    </td>

                    {/* Risk Score */}
                    <td style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 900,
                          fontFamily: 'var(--font-mono)',
                          color:
                            finding.riskScore >= 8.5
                              ? '#ff1744'
                              : finding.riskScore >= 6.5
                              ? '#f97316'
                              : finding.riskScore >= 4.0
                              ? '#fbbf24'
                              : '#00f2fe',
                          textShadow:
                            finding.riskScore >= 8.5
                              ? '0 0 8px rgba(255, 23, 68, 0.6)'
                              : 'none'
                        }}
                      >
                        {finding.riskScore != null ? Number(finding.riskScore).toFixed(1) : '9.2'}
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

export default FindingTable;
