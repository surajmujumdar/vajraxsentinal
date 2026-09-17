'use client'
import React, { useState, useEffect } from 'react';
import {
  Server,
  Search,
  Filter,
  Globe,
  Code,
  Cloud,
  Database,
  Layers,
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
  Plus,
  Play,
  FileText,
  History,
  RotateCw,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  X,
  Loader2,
  Clock
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { SeverityBadge } from '../components/SeverityBadge';
import { NewAssessmentModal } from '../components/NewAssessmentModal';
import { ReportViewerModal } from '../components/ReportViewerModal';
import { FindingDrawer } from '../components/FindingDrawer';
import { calculateFindingsScore, getScorePosture } from '../utils/securityScore';

export function Assets({ onSelectFinding, onNavigateTab }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedTab, setSelectedTab] = useState('OVERVIEW'); // 'OVERVIEW' | 'FINDINGS' | 'HISTORY' | 'REGRESSION'
  
  // Asset History & Findings State
  const [assetAssessments, setAssetAssessments] = useState([]);
  const [assetFindings, setAssetFindings] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // Regression Comparison State
  const [compareAsm1, setCompareAsm1] = useState('');
  const [compareAsm2, setCompareAsm2] = useState('');
  const [comparisonResult, setComparisonResult] = useState(null);
  const [loadingComparison, setLoadingComparison] = useState(false);

  // Modals
  const [showNewScanModal, setShowNewScanModal] = useState(false);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [activeDrawerFinding, setActiveDrawerFinding] = useState(null);
  const [activeReport, setActiveReport] = useState(null);

  // New Asset Form State
  const [newAssetUrl, setNewAssetUrl] = useState('');
  const [newAssetName, setNewAssetName] = useState('');
  const [isCreatingAsset, setIsCreatingAsset] = useState(false);

  // Verification Form State
  const [verifyMethod, setVerifyMethod] = useState('ANALYST_AUTHORIZATION');
  const [verifyNotes, setVerifyNotes] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getAssets();
      setAssets(data || []);
      if (data && data.length > 0 && !selectedAsset) {
        setSelectedAsset(data[0]);
      }
    } catch (err) {
      console.error('Error loading assets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
    const unsubscribe = dashboardService.subscribe(loadAssets);
    return () => unsubscribe();
  }, []);

  // When selectedAsset changes, load its assessments and findings
  useEffect(() => {
    if (!selectedAsset?.id) return;

    async function loadAssetDetails() {
      setLoadingHistory(true);
      try {
        const [asmList, fnds] = await Promise.all([
          dashboardService.getAssetAssessments(selectedAsset.id),
          dashboardService.getFindings({ asset_id: selectedAsset.id })
        ]);
        setAssetAssessments(asmList || []);
        setAssetFindings(fnds || []);

        if (asmList && asmList.length >= 2) {
          setCompareAsm1(asmList[1].id);
          setCompareAsm2(asmList[0].id);
        } else if (asmList && asmList.length === 1) {
          setCompareAsm1(asmList[0].id);
          setCompareAsm2(asmList[0].id);
        }
      } catch (err) {
        console.error('Error loading asset details:', err);
      } finally {
        setLoadingHistory(false);
      }
    }

    loadAssetDetails();
  }, [selectedAsset?.id, selectedAsset?.updated_at]);

  // Run Comparison when compare IDs change
  useEffect(() => {
    if (!selectedAsset?.id || !compareAsm1 || !compareAsm2 || compareAsm1 === compareAsm2) {
      setComparisonResult(null);
      return;
    }

    async function runCompare() {
      setLoadingComparison(true);
      try {
        const res = await dashboardService.compareAssetAssessments(selectedAsset.id, compareAsm1, compareAsm2);
        setComparisonResult(res);
      } catch (err) {
        console.error('Comparison error:', err);
      } finally {
        setLoadingComparison(false);
      }
    }

    runCompare();
  }, [selectedAsset?.id, compareAsm1, compareAsm2]);

  const handleCreateAssetSubmit = async (e) => {
    e.preventDefault();
    if (!newAssetUrl.trim()) return;
    setIsCreatingAsset(true);
    try {
      const res = await dashboardService.createAsset({
        project_id: 'default-scope',
        url: newAssetUrl.trim(),
        name: newAssetName.trim() || undefined,
        asset_type: 'WEB_APPLICATION'
      });
      setShowAddAssetModal(false);
      setNewAssetUrl('');
      setNewAssetName('');
      await loadAssets();
      if (res) setSelectedAsset(res);
    } catch (err) {
      alert(err.message || 'Failed to create asset');
    } finally {
      setIsCreatingAsset(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!selectedAsset?.id) return;
    setIsVerifying(true);
    try {
      const updated = await dashboardService.verifyAsset(selectedAsset.id, verifyMethod, verifyNotes);
      setShowVerifyModal(false);
      setVerifyNotes('');
      await loadAssets();
      setSelectedAsset(prev => ({ ...prev, is_verified: true, verified: true, verification_method: verifyMethod }));
    } catch (err) {
      alert(err.message || 'Failed to verify asset');
    } finally {
      setIsVerifying(false);
    }
  };

  const filteredAssets = assets.filter(a => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (a.name || '').toLowerCase().includes(q) ||
      (a.url || '').toLowerCase().includes(q) ||
      (a.hostname || '').toLowerCase().includes(q) ||
      (a.techStack || a.technology || []).some(t => t.toLowerCase().includes(q))
    );
  });

  const critCount = assetFindings.filter(f => f.severity === 'CRITICAL').length;
  const highCount = assetFindings.filter(f => f.severity === 'HIGH').length;
  const medCount = assetFindings.filter(f => f.severity === 'MEDIUM').length;
  const lowCount = assetFindings.filter(f => f.severity === 'LOW').length;

  return (
    <div className="page-container" style={{ maxWidth: '1600px' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#f8fafc', letterSpacing: '0.8px' }}>
            PRODUCTION ASSETS & TARGET AUTHORIZATION
          </h1>
          <p style={{ fontSize: '11.5px', color: '#a1a1aa', marginTop: '2px' }}>
            Authorized production applications, attack surface discovery, asset verification, and security regression tracking.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '6px',
              background: '#040005',
              border: '1.5px solid #28081c',
              width: '240px'
            }}
          >
            <Search size={14} color="#71717a" />
            <input
              type="text"
              placeholder="Search targets, hosts..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#f8fafc',
                fontSize: '12px',
                width: '100%',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <button
            onClick={() => setShowAddAssetModal(true)}
            className="btn btn-primary"
            style={{ fontSize: '12px', padding: '7px 14px', gap: '6px' }}
          >
            <Plus size={14} />
            <span>Add Target Asset</span>
          </button>
        </div>
      </div>

      <div className="grid-1-2" style={{ gap: '18px', gridTemplateColumns: '1fr 2.2fr' }}>
        
        {/* Left Column: Monitored Assets List */}
        <div className="cyber-card" style={{ padding: '16px', background: '#060108', border: '2.5px solid #360a25', maxHeight: '82vh', overflowY: 'auto' }}>
          <div style={{ fontSize: '11px', fontWeight: 900, color: '#ff1744', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.6px' }}>
            MONITORED TARGET ASSETS ({filteredAssets.length})
          </div>

          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#71717a', fontSize: '12px' }}>
              <Loader2 size={20} className="animate-spin" style={{ margin: '0 auto 8px' }} />
              Loading production assets...
            </div>
          ) : filteredAssets.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#71717a', fontSize: '12px' }}>
              No target assets registered yet. Click &quot;Add Target Asset&quot; to register one.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredAssets.map(asset => {
                const isSelected = selectedAsset?.id === asset.id;
                const isVer = Boolean(asset.verified || asset.is_verified);

                return (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    style={{
                      padding: '12px',
                      borderRadius: '6px',
                      background: isSelected ? 'rgba(255, 23, 68, 0.12)' : '#040005',
                      border: isSelected ? '1.5px solid #ff1744' : '1.5px solid #1e293b',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ fontWeight: 800, fontSize: '13px', color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                        {asset.name || asset.hostname}
                      </div>
                      <span
                        style={{
                          fontSize: '8.5px',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: '3px',
                          background: isVer ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: isVer ? '#10b981' : '#f59e0b',
                          border: `1px solid ${isVer ? '#10b981' : '#f59e0b'}`
                        }}
                      >
                        {isVer ? 'VERIFIED' : 'UNVERIFIED'}
                      </span>
                    </div>

                    <div style={{ fontSize: '11px', color: '#38bdf8', fontFamily: 'monospace', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {asset.url}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10.5px', color: '#94a3b8' }}>
                      {(() => {
                        const rawRisk = Number(asset.risk_score || 0);
                        const score = asset.securityScore !== undefined ? asset.securityScore : (asset.risk_score !== undefined ? Math.max(10, Math.min(100, Math.round(100 - rawRisk))) : 100);
                        const posture = getScorePosture(score);
                        return <span>Score: <strong style={{ color: posture.color }}>{score}/100</strong></span>;
                      })()}
                      <span>Status: <strong style={{ color: asset.status === 'REACHABLE' ? '#10b981' : '#f59e0b' }}>{asset.status || 'ONLINE'}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Asset Detail View (Section 18, 19, 20) */}
        {selectedAsset ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* Header Cockpit Card */}
            <div className="cyber-card" style={{ padding: '18px', background: '#060108', border: '2.5px solid #360a25' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 900, color: '#ff2a4d', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                      PRODUCTION APPLICATION
                    </span>
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '3px',
                        background: (selectedAsset.verified || selectedAsset.is_verified) ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: (selectedAsset.verified || selectedAsset.is_verified) ? '#10b981' : '#f59e0b',
                        border: `1px solid ${(selectedAsset.verified || selectedAsset.is_verified) ? '#10b981' : '#f59e0b'}`
                      }}
                    >
                      {(selectedAsset.verified || selectedAsset.is_verified) ? 'AUTHORIZED TARGET' : 'UNVERIFIED'}
                    </span>
                  </div>

                  <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#f8fafc', marginTop: '4px', fontFamily: 'monospace' }}>
                    {selectedAsset.url}
                  </h2>

                  {/* Technology Tags */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                    <span style={{ fontSize: '10.5px', color: '#71717a', alignSelf: 'center', fontWeight: 700 }}>Tech Stack:</span>
                    {(selectedAsset.techStack || selectedAsset.technology || ['React', 'Node.js', 'Nginx']).map((t, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '10px',
                          fontFamily: 'monospace',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          background: '#090e1f',
                          border: '1px solid #162444',
                          color: '#38bdf8',
                          fontWeight: 700
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Score & Flaws Quick KPI */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  {(() => {
                    const assetScore = assetFindings.length > 0
                      ? calculateFindingsScore(assetFindings)
                      : (selectedAsset.securityScore !== undefined ? selectedAsset.securityScore : (selectedAsset.risk_score !== undefined ? Math.max(10, Math.min(100, Math.round(100 - Number(selectedAsset.risk_score)))) : 100));
                    const posture = getScorePosture(assetScore);
                    return (
                      <div style={{ padding: '8px 14px', borderRadius: '6px', background: '#040714', border: '1.5px solid #1e293b', textAlign: 'center' }}>
                        <div style={{ fontSize: '9.5px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>SECURITY SCORE</div>
                        <div style={{ fontSize: '20px', fontWeight: 900, fontFamily: 'monospace', color: posture.color }}>
                          {assetScore}
                        </div>
                      </div>
                    );
                  })()}

                  <div style={{ padding: '8px 14px', borderRadius: '6px', background: '#040714', border: '1.5px solid #1e293b', textAlign: 'center' }}>
                    <div style={{ fontSize: '9.5px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>TOTAL FINDINGS</div>
                    <div style={{ fontSize: '20px', fontWeight: 900, fontFamily: 'monospace', color: assetFindings.length > 0 ? '#ff1744' : '#00ff88' }}>
                      {assetFindings.length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Severity Breakdown Strip */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #1c0514' }}>
                <span style={{ fontSize: '11px', color: '#ff3366', fontWeight: 700 }}>Critical: {critCount}</span>
                <span style={{ color: '#475569' }}>•</span>
                <span style={{ fontSize: '11px', color: '#f97316', fontWeight: 700 }}>High: {highCount}</span>
                <span style={{ color: '#475569' }}>•</span>
                <span style={{ fontSize: '11px', color: '#eab308', fontWeight: 700 }}>Medium: {medCount}</span>
                <span style={{ color: '#475569' }}>•</span>
                <span style={{ fontSize: '11px', color: '#00f2fe', fontWeight: 700 }}>Low: {lowCount}</span>
                <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#64748b' }}>
                  Last Assessment: {selectedAsset.lastScan || (selectedAsset.last_assessment_at ? new Date(selectedAsset.last_assessment_at).toLocaleTimeString() : 'Never')}
                </span>
              </div>

              {/* Action Buttons Toolbar (Section 18) */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowNewScanModal(true)}
                  className="btn btn-primary"
                  style={{ fontSize: '11.5px', padding: '6px 14px', gap: '6px' }}
                >
                  <Play size={13} />
                  <span>START ASSESSMENT</span>
                </button>

                {!(selectedAsset.verified || selectedAsset.is_verified) && (
                  <button
                    onClick={() => setShowVerifyModal(true)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '5px',
                      background: 'rgba(245, 158, 11, 0.2)',
                      border: '1.5px solid #f59e0b',
                      color: '#fcd34d',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <ShieldCheck size={13} />
                    <span>AUTHORIZE & VERIFY TARGET</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedTab('FINDINGS')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '5px',
                    background: selectedTab === 'FINDINGS' ? '#334155' : 'transparent',
                    border: '1px solid #334155',
                    color: '#f8fafc',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  VIEW FINDINGS ({assetFindings.length})
                </button>

                <button
                  onClick={() => setSelectedTab('HISTORY')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '5px',
                    background: selectedTab === 'HISTORY' ? '#334155' : 'transparent',
                    border: '1px solid #334155',
                    color: '#f8fafc',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  VIEW ASSESSMENT HISTORY ({assetAssessments.length})
                </button>

                <button
                  onClick={() => setSelectedTab('REGRESSION')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '5px',
                    background: selectedTab === 'REGRESSION' ? '#334155' : 'transparent',
                    border: '1px solid #334155',
                    color: '#38bdf8',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  REGRESSION DETECTION
                </button>
              </div>
            </div>

            {/* Tab 1: Findings */}
            {selectedTab === 'FINDINGS' && (
              <div className="cyber-card" style={{ padding: '16px', background: '#060108', border: '2.5px solid #360a25' }}>
                <div style={{ fontSize: '11px', fontWeight: 900, color: '#f8fafc', textTransform: 'uppercase', marginBottom: '12px' }}>
                  ACTIVE FINDINGS ON {selectedAsset.url}
                </div>
                {assetFindings.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#71717a', fontSize: '12px' }}>
                    No security vulnerabilities recorded on this target. Run an assessment to detect flaws.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {assetFindings.map(f => (
                      <div
                        key={f.id}
                        onClick={() => setActiveDrawerFinding(f)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '5px',
                          background: '#040714',
                          border: '1px solid #1e293b',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <SeverityBadge severity={f.severity} size="sm" />
                          <div>
                            <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#f8fafc' }}>{f.title}</div>
                            <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '2px' }}>
                              Endpoint: <code>{f.endpoint || f.file || '/'}</code> • Scanner: <strong>{f.scanner}</strong>
                            </div>
                          </div>
                        </div>

                        <span style={{ fontSize: '10.5px', color: '#00f2fe', fontWeight: 700 }}>Inspect →</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Assessment History (Section 19) */}
            {selectedTab === 'HISTORY' && (
              <div className="cyber-card" style={{ padding: '16px', background: '#060108', border: '2.5px solid #360a25' }}>
                <div style={{ fontSize: '11px', fontWeight: 900, color: '#f8fafc', textTransform: 'uppercase', marginBottom: '12px' }}>
                  HISTORICAL ASSESSMENTS FOR {selectedAsset.hostname}
                </div>

                {assetAssessments.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#71717a', fontSize: '12px' }}>
                    No historical assessments available yet for this target.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {assetAssessments.map((asm, idx) => (
                      <div
                        key={asm.id}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '6px',
                          background: '#040714',
                          border: '1px solid #1e293b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '12px'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 900, color: '#f8fafc' }}>
                              Assessment #{assetAssessments.length - idx}
                            </span>
                            <span style={{ fontSize: '9.5px', fontFamily: 'monospace', padding: '1px 6px', borderRadius: '3px', background: '#1e293b', color: '#38bdf8' }}>
                              {asm.assessmentType?.toUpperCase()}
                            </span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#71717a', marginTop: '2px' }}>
                            {asm.completedAt || asm.startedAt}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '10px', color: '#71717a' }}>SCORE</div>
                            {(() => {
                              const s = asm.overallScore !== undefined ? asm.overallScore : (asm.risk_score !== undefined ? Math.round(100 - asm.risk_score) : 85);
                              const pos = getScorePosture(s);
                              return (
                                <div style={{ fontSize: '15px', fontWeight: 900, color: pos.color, fontFamily: 'monospace' }}>
                                  {s}
                                </div>
                              );
                            })()}
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '10px', color: '#71717a' }}>FINDINGS</div>
                            <div style={{ fontSize: '15px', fontWeight: 900, color: '#f8fafc', fontFamily: 'monospace' }}>
                              {asm.counts?.total || 0}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Security Regression Detection (Section 20) */}
            {selectedTab === 'REGRESSION' && (
              <div className="cyber-card" style={{ padding: '16px', background: '#060108', border: '2.5px solid #360a25' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 900, color: '#38bdf8', textTransform: 'uppercase' }}>
                      SECURITY REGRESSION & DELTA COMPARISON
                    </div>
                    <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                      Compare vulnerability telemetry between two historical target scans to detect newly introduced risks and resolved issues.
                    </p>
                  </div>

                  {assetAssessments.length >= 2 && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <select
                        value={compareAsm1}
                        onChange={e => setCompareAsm1(e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: '4px', background: '#0a0d18', border: '1px solid #1e293b', color: '#f8fafc', fontSize: '11px' }}
                      >
                        {assetAssessments.map((a, i) => (
                          <option key={a.id} value={a.id}>Base #{assetAssessments.length - i} ({a.completedAt || a.startedAt})</option>
                        ))}
                      </select>
                      <span style={{ fontSize: '11px', color: '#71717a' }}>vs</span>
                      <select
                        value={compareAsm2}
                        onChange={e => setCompareAsm2(e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: '4px', background: '#0a0d18', border: '1px solid #1e293b', color: '#f8fafc', fontSize: '11px' }}
                      >
                        {assetAssessments.map((a, i) => (
                          <option key={a.id} value={a.id}>Target #{assetAssessments.length - i} ({a.completedAt || a.startedAt})</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {loadingComparison ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#71717a', fontSize: '12px' }}>
                    <Loader2 size={20} className="animate-spin" style={{ margin: '0 auto 8px' }} />
                    Calculating regression telemetry...
                  </div>
                ) : comparisonResult ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Score delta */}
                    <div style={{ padding: '10px 14px', borderRadius: '5px', background: '#040714', border: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#f8fafc' }}>Score Delta</span>
                      <span style={{ fontSize: '14px', fontWeight: 900, fontFamily: 'monospace', color: comparisonResult.score_change > 0 ? '#ff3366' : '#10b981' }}>
                        {comparisonResult.score_change > 0 ? `+${comparisonResult.score_change} (Risk Increased)` : `${comparisonResult.score_change} (Risk Reduced)`}
                      </span>
                    </div>

                    {/* NEW Findings */}
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 900, color: '#ff3366', textTransform: 'uppercase', marginBottom: '6px' }}>
                        NEW VULNERABILITIES DETECTED ({comparisonResult.new_findings_count})
                      </div>
                      {comparisonResult.new_findings?.length === 0 ? (
                        <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>No new vulnerabilities introduced.</div>
                      ) : (
                        comparisonResult.new_findings?.map(f => (
                          <div key={f.id} style={{ padding: '8px 10px', borderRadius: '4px', background: 'rgba(255, 51, 102, 0.1)', border: '1px solid #ff3366', marginBottom: '6px' }}>
                            <div style={{ fontWeight: 800, color: '#ff3366', fontSize: '12px' }}>[NEW] {f.title} ({f.severity})</div>
                            <div style={{ fontSize: '10.5px', color: '#cbd5e1' }}>Location: {f.endpoint || f.file || '/'}</div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* RESOLVED Findings */}
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 900, color: '#10b981', textTransform: 'uppercase', marginBottom: '6px' }}>
                        RESOLVED VULNERABILITIES ({comparisonResult.resolved_findings_count})
                      </div>
                      {comparisonResult.resolved_findings?.length === 0 ? (
                        <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>No resolved vulnerabilities in this comparison.</div>
                      ) : (
                        comparisonResult.resolved_findings?.map(f => (
                          <div key={f.id} style={{ padding: '8px 10px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', marginBottom: '6px' }}>
                            <div style={{ fontWeight: 800, color: '#10b981', fontSize: '12px' }}>[RESOLVED] {f.title} ({f.severity})</div>
                            <div style={{ fontSize: '10.5px', color: '#cbd5e1' }}>Location: {f.endpoint || f.file || '/'}</div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* PERSISTENT Findings */}
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 900, color: '#eab308', textTransform: 'uppercase', marginBottom: '6px' }}>
                        PERSISTENT VULNERABILITIES ({comparisonResult.persistent_findings_count})
                      </div>
                      {comparisonResult.persistent_findings?.length === 0 ? (
                        <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>No persistent vulnerabilities.</div>
                      ) : (
                        comparisonResult.persistent_findings?.map(f => (
                          <div key={f.id} style={{ padding: '8px 10px', borderRadius: '4px', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid #eab308', marginBottom: '6px' }}>
                            <div style={{ fontWeight: 800, color: '#eab308', fontSize: '12px' }}>[PERSISTENT] {f.title} ({f.severity})</div>
                            <div style={{ fontSize: '10.5px', color: '#cbd5e1' }}>Location: {f.endpoint || f.file || '/'}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#71717a', fontSize: '12px' }}>
                    Select two distinct historical assessments above to compute the security regression report.
                  </div>
                )}
              </div>
            )}

          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: '#71717a' }}>
            Select an asset on the left to inspect details.
          </div>
        )}

      </div>

      {/* Add Asset Modal */}
      {showAddAssetModal && (
        <div className="modal-backdrop" onClick={() => setShowAddAssetModal(false)} style={{ zIndex: 1100 }}>
          <div className="cyber-card" onClick={e => e.stopPropagation()} style={{ width: '450px', background: '#060108', border: '2.5px solid #360a25', padding: '18px' }}>
            <div style={{ fontSize: '14px', fontWeight: 900, color: '#f8fafc', marginBottom: '12px' }}>
              REGISTER NEW TARGET ASSET
            </div>
            <form onSubmit={handleCreateAssetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Target URL</label>
                <input
                  type="text"
                  placeholder="https://app.example.com"
                  value={newAssetUrl}
                  onChange={e => setNewAssetUrl(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', background: '#0a0d18', border: '1px solid #1e293b', color: '#f8fafc', fontSize: '12px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Asset Display Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Production Application"
                  value={newAssetName}
                  onChange={e => setNewAssetName(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', background: '#0a0d18', border: '1px solid #1e293b', color: '#f8fafc', fontSize: '12px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddAssetModal(false)}
                  style={{ padding: '6px 12px', borderRadius: '4px', background: 'transparent', border: '1px solid #334155', color: '#94a3b8', fontSize: '11.5px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingAsset}
                  style={{ padding: '6px 16px', borderRadius: '4px', background: '#00f2fe', color: '#000', fontSize: '11.5px', fontWeight: 800, border: 'none' }}
                >
                  {isCreatingAsset ? 'Registering...' : 'Register Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verify Target Modal */}
      {showVerifyModal && selectedAsset && (
        <div className="modal-backdrop" onClick={() => setShowVerifyModal(false)} style={{ zIndex: 1100 }}>
          <div className="cyber-card" onClick={e => e.stopPropagation()} style={{ width: '480px', background: '#060108', border: '2.5px solid #360a25', padding: '18px' }}>
            <div style={{ fontSize: '14px', fontWeight: 900, color: '#f8fafc', marginBottom: '4px' }}>
              AUTHORIZE & VERIFY TARGET ASSET
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '14px' }}>
              Confirm ownership authorization for <code>{selectedAsset.url}</code> to permit active DAST fuzzing and Nuclei testing.
            </div>

            <form onSubmit={handleVerifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Verification Method</label>
                <select
                  value={verifyMethod}
                  onChange={e => setVerifyMethod(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', background: '#0a0d18', border: '1px solid #1e293b', color: '#f8fafc', fontSize: '12px' }}
                >
                  <option value="ANALYST_AUTHORIZATION">Analyst Authorization (Direct SOC Signoff)</option>
                  <option value="DNS_TXT">DNS TXT Record Challenge</option>
                  <option value="HTTP_META">HTTP Challenge File (/.well-known/sentina)</option>
                  <option value="MANUAL">Explicit Environment Whitelist</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Authorization Notes</label>
                <textarea
                  placeholder="e.g. Authorized by Security Operations for penetration test scope."
                  value={verifyNotes}
                  onChange={e => setVerifyNotes(e.target.value)}
                  style={{ width: '100%', height: '60px', padding: '7px 10px', borderRadius: '4px', background: '#0a0d18', border: '1px solid #1e293b', color: '#f8fafc', fontSize: '11.5px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  style={{ padding: '6px 12px', borderRadius: '4px', background: 'transparent', border: '1px solid #334155', color: '#94a3b8', fontSize: '11.5px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifying}
                  style={{ padding: '6px 16px', borderRadius: '4px', background: '#10b981', color: '#000', fontSize: '11.5px', fontWeight: 800, border: 'none' }}
                >
                  {isVerifying ? 'Verifying...' : 'Authorize Target'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Assessment Modal */}
      <NewAssessmentModal
        isOpen={showNewScanModal}
        onClose={() => setShowNewScanModal(false)}
        onStartAssessment={async (cfg) => {
          const newAsm = await dashboardService.triggerNewScan(cfg);
          if (newAsm) {
            await loadAssets();
          }
        }}
      />

      {/* Finding Drawer */}
      <FindingDrawer
        finding={activeDrawerFinding}
        onClose={() => setActiveDrawerFinding(null)}
      />
    </div>
  );
}

export default Assets;
