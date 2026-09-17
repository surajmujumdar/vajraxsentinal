'use client'
import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Sparkles,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Code2,
  Radio,
  Boxes,
  KeyRound,
  Globe2,
  CheckCircle2,
  Layers,
  Zap,
  Activity,
  FolderOpen
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { SeverityBadge } from '../components/SeverityBadge';
import { FindingDrawer } from '../components/FindingDrawer';
import { calculateCorrelationScore, getScorePosture } from '../utils/securityScore';

export function AICorrelationView() {
  const [correlatedRisks, setCorrelatedRisks] = useState([]);
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [activeDrawerFinding, setActiveDrawerFinding] = useState(null);

  useEffect(() => {
    async function loadCorrelation() {
      const risks = await dashboardService.getCorrelatedRisks();
      const all = risks || [];
      setCorrelatedRisks(all);
      if (all.length > 0) setSelectedRisk(all[0]);
      else setSelectedRisk(null);
    }
    loadCorrelation();
    const unsubscribe = dashboardService.subscribe(loadCorrelation);
    return () => unsubscribe();
  }, []);

  const correlationScore = calculateCorrelationScore(correlatedRisks);
  const scorePosture = getScorePosture(correlationScore);

  const getScannerIcon = (scanner) => {
    switch (scanner) {
      case 'SAST': return Code2;
      case 'DAST': return Radio;
      case 'SCA': return Boxes;
      case 'Secrets': return KeyRound;
      case 'Threat Intel': return Globe2;
      default: return Cpu;
    }
  };

  const getScannerColor = (scanner) => {
    switch (scanner) {
      case 'SAST': return '#38bdf8';
      case 'DAST': return '#a855f7';
      case 'SCA': return '#00f2fe';
      case 'Secrets': return '#f59e0b';
      case 'Threat Intel': return '#10b981';
      default: return '#c084fc';
    }
  };

  const handleOpenFinding = async (findingId) => {
    const f = await dashboardService.getFindingById(findingId);
    if (f) setActiveDrawerFinding(f);
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(0, 242, 254, 0.15) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Cpu size={22} color="#c084fc" />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#f8fafc' }}>
              AI Risk Correlation & Attack Path Synthesizer
            </h1>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>
              Autonomous multi-hop correlation linking isolated scanner findings into verified cyber attack chains.
            </p>
          </div>
        </div>

        <span
          style={{
            fontSize: '11.5px',
            fontFamily: 'var(--font-mono)',
            padding: '4px 10px',
            borderRadius: '6px',
            background: 'rgba(168, 85, 247, 0.12)',
            color: '#c084fc',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            fontWeight: 700
          }}
        >
          {correlatedRisks.length} Active Correlated Attack Paths
        </span>
      </div>

      {/* KPI Stats */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <div className="cyber-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Correlation Security Score</span>
            <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: scorePosture.color }}>
              {correlatedRisks.length === 0 ? '100% CLEAN' : scorePosture.label}
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: scorePosture.color, fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            {correlationScore}/100
          </div>
        </div>
        <div className="cyber-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#c084fc' }}>Active Exploit Paths</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#c084fc', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            {correlatedRisks.length} Chains
          </div>
        </div>
        <div className="cyber-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#ff3366' }}>Critical Chains</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#ff3366', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            {correlatedRisks.filter(r => r.finalRisk?.toUpperCase() === 'CRITICAL').length}
          </div>
        </div>
        <div className="cyber-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#00f2fe' }}>AI Confidence Avg</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#00f2fe', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            {correlatedRisks.length > 0 ? Math.round(correlatedRisks.reduce((acc, r) => acc + (r.aiConfidence || 90), 0) / correlatedRisks.length) : 98}%
          </div>
        </div>
      </div>

      {/* Main Content */}
      {correlatedRisks.length === 0 ? (
        <div
          className="cyber-card"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            background: '#040713',
            border: '1px dashed #14203a',
            borderRadius: '12px'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(168, 85, 247, 0.1)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: '#c084fc'
            }}
          >
            <FolderOpen size={28} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>
            No Correlated Exploit Paths Detected
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '420px', margin: '0 auto', lineHeight: 1.5 }}>
            No multi-scanner exploit chains synthesized yet. Run a combined assessment (SAST + DAST + SCA) to correlate findings across the kill chain.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: '20px' }}>
          {/* Left: Correlated Attack Paths List */}
          <div className="cyber-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
              Correlated Exploit Paths
            </div>

            {correlatedRisks.map(risk => {
              const isSelected = selectedRisk?.id === risk.id;

              return (
                <div
                  key={risk.id}
                  onClick={() => setSelectedRisk(risk)}
                  style={{
                    padding: '14px',
                    borderRadius: '8px',
                    background: isSelected ? 'rgba(168, 85, 247, 0.12)' : '#080d1c',
                    border: isSelected ? '1px solid #a855f7' : '1px solid #141f38',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 0 16px rgba(168, 85, 247, 0.25)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <SeverityBadge severity={risk.finalRisk} size="sm" />
                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#00f2fe', fontWeight: 700 }}>
                      AI Confidence: {risk.aiConfidence}%
                    </span>
                  </div>

                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#f8fafc', lineHeight: 1.3, marginBottom: '6px' }}>
                    {risk.title}
                  </div>

                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Target: {risk.affectedAsset} • {risk.killChainStage}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Attack Path Deep Dive */}
          {selectedRisk && (
            <div className="cyber-card cyber-card-glow-purple" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <SeverityBadge severity={selectedRisk.finalRisk} size="md" />
                    <span style={{ fontSize: '11px', color: '#a855f7', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {selectedRisk.killChainStage}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '19px', fontWeight: 900, color: '#f8fafc' }}>
                    {selectedRisk.title}
                  </h2>
                  <div style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: '4px' }}>
                    Target Asset: <strong style={{ color: '#00f2fe' }}>{selectedRisk.affectedAsset}</strong>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>AI Confidence</div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#00f2fe', fontFamily: 'var(--font-mono)' }}>
                    {selectedRisk.aiConfidence}%
                  </div>
                </div>
              </div>

              {/* Exploit Chain Cards */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#c084fc', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Correlated Multi-Scanner Evidence Nodes
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                  {selectedRisk.evidenceChain?.map((item, idx) => {
                    const Icon = getScannerIcon(item.scanner);
                    const color = getScannerColor(item.scanner);

                    return (
                      <div
                        key={idx}
                        onClick={() => item.findingId && handleOpenFinding(item.findingId)}
                        style={{
                          padding: '14px',
                          borderRadius: '8px',
                          background: '#080d1e',
                          border: `1px solid ${color}40`,
                          cursor: item.findingId ? 'pointer' : 'default',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => {
                          if (item.findingId) e.currentTarget.style.borderColor = color;
                        }}
                        onMouseLeave={e => {
                          if (item.findingId) e.currentTarget.style.borderColor = `${color}40`;
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Icon size={14} color={color} />
                            <span style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: color }}>
                              {item.scanner}
                            </span>
                          </div>
                          {item.findingId && <span style={{ fontSize: '10px', color: '#64748b' }}>Click to view</span>}
                        </div>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#f8fafc', lineHeight: 1.3 }}>
                          {item.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Attack Scenario Narrative */}
              <div style={{ padding: '16px', borderRadius: '8px', background: '#070b16', border: '1px solid #141f38' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#ff3366', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Threat Scenario Synthesis
                </div>
                <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6 }}>
                  {selectedRisk.narrative}
                </p>
              </div>

              {/* Unified Remediation */}
              <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(0, 242, 254, 0.05)', border: '1px solid rgba(0, 242, 254, 0.25)' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#00f2fe', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} /> AI Actionable Remediation Playbook
                </div>
                <p style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: 1.5 }}>
                  {selectedRisk.aiTriageNote}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Finding Drawer */}
      <FindingDrawer
        finding={activeDrawerFinding}
        isOpen={Boolean(activeDrawerFinding)}
        onClose={() => setActiveDrawerFinding(null)}
      />
    </div>
  );
}

export default AICorrelationView;
