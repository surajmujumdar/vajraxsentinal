'use client'
import React from 'react'
import {
  Scan,
  Bug,
  HardDrive,
  FileText,
  Code2,
  Radio,
  Boxes,
  Lock,
  Crosshair,
  Cpu
} from 'lucide-react'
import { EnergySecurityScore } from './EnergySecurityScore'

// Custom SVG Hexagon Icon with thick stroke and neon glow
function CyberHexIcon({ icon: Icon, color = '#ff1744', size = 32, iconSize = 14 }) {
  return (
    <div
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 44 44"
        style={{
          position: 'absolute',
          inset: 0,
          filter: `drop-shadow(0 0 8px ${color})`
        }}
      >
        <polygon
          points="22,2 40,12 40,32 22,42 4,32 4,12"
          fill="rgba(4, 0, 5, 0.95)"
          stroke={color}
          strokeWidth="2.5"
        />
      </svg>
      <Icon
        size={iconSize}
        color={color}
        strokeWidth={2.5}
        style={{
          position: 'relative',
          zIndex: 2,
          filter: `drop-shadow(0 0 4px ${color})`
        }}
      />
    </div>
  )
}

function InlineSparkline({ data = [1, 2, 3, 2, 4], color = '#00f2fe', width = 60, height = 20 }) {
  if (!data || data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width
      const y = height - ((val - min) / range) * (height - 4) - 2
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg width={width} height={height} style={{ overflow: 'visible', flexShrink: 0 }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        style={{
          filter: `drop-shadow(0 0 3px ${color})`
        }}
      />
    </svg>
  )
}

export function HeroCockpit({ summary = {}, onNavigateTab, onNewAssessmentClick }) {
  const totalScans = summary?.totalScans?.value ?? 0
  const vulns = summary?.vulnerabilities?.value ?? 0
  const assets = summary?.assetsMonitored?.value ?? 0
  const reports = summary?.reports?.value ?? (summary?.totalScans?.value ? 1 : 0)

  const score = (summary?.securityScore?.score !== undefined && summary?.securityScore?.score !== null)
    ? summary.securityScore.score
    : 100
  const posture = summary?.securityScore?.posture || "INITIALIZED"
  const delta = summary?.securityScore?.delta || "0.0%"
  const deltaPeriod = summary?.securityScore?.deltaPeriod || "ready for first assessment"

  const metrics = [
    {
      id: 'scans',
      label: 'TOTAL SCANS',
      value: totalScans,
      delta: summary?.totalScans?.delta || "+0.0%",
      deltaPeriod: summary?.totalScans?.deltaPeriod || "all time",
      sparkline: summary?.totalScans?.sparkline || [0, 1, 2, 3, 2, totalScans],
      color: '#00f2fe',
      icon: Scan,
      targetTab: 'assessments'
    },
    {
      id: 'vulns',
      label: 'OPEN FINDINGS',
      value: vulns,
      delta: summary?.vulnerabilities?.delta || "+0.0%",
      deltaPeriod: summary?.vulnerabilities?.deltaPeriod || "active backlog",
      sparkline: summary?.vulnerabilities?.sparkline || [0, 0, 0, 0, vulns],
      color: '#ff1744',
      icon: Bug,
      targetTab: 'findings'
    },
    {
      id: 'assets',
      label: 'ASSETS MONITORED',
      value: assets,
      delta: summary?.assetsMonitored?.delta || "+0.0%",
      deltaPeriod: summary?.assetsMonitored?.deltaPeriod || "production scope",
      sparkline: summary?.assetsMonitored?.sparkline || [0, 0, 0, 0, assets],
      color: '#00ff88',
      icon: HardDrive,
      targetTab: 'assets'
    },
    {
      id: 'reports',
      label: 'AUDIT REPORTS',
      value: reports,
      delta: summary?.reports?.delta || "+0.0%",
      deltaPeriod: summary?.reports?.deltaPeriod || "generated audit files",
      sparkline: summary?.reports?.sparkline || [0, 0, 0, 0, reports],
      color: '#c084fc',
      icon: FileText,
      targetTab: 'reports'
    }
  ]

  const defaultModules = [
    {
      id: 'sast',
      name: '01 SAST',
      sub: 'Semgrep + Native AST Sinks',
      icon: Code2,
      color: '#00f2fe',
      status: summary?.analysisModules?.[0]?.status || 'COMPLETED',
      findings: summary?.analysisModules?.[0]?.findings ?? 0,
      targetTab: 'sast'
    },
    {
      id: 'dast',
      name: '02 DAST',
      sub: 'ZAP + Runtime Fuzzing',
      icon: Radio,
      color: '#f97316',
      status: summary?.analysisModules?.[1]?.status || 'COMPLETED',
      findings: summary?.analysisModules?.[1]?.findings ?? 0,
      targetTab: 'dast'
    },
    {
      id: 'sca',
      name: '03 SCA',
      sub: 'OSV + Dependency CVEs',
      icon: Boxes,
      color: '#00ff88',
      status: summary?.analysisModules?.[2]?.status || 'COMPLETED',
      findings: summary?.analysisModules?.[2]?.findings ?? 0,
      targetTab: 'sca'
    },
    {
      id: 'secrets',
      name: '04 SECRETS',
      sub: 'Gitleaks + Token Entropy',
      icon: Lock,
      color: '#ff1744',
      status: summary?.analysisModules?.[3]?.status || 'COMPLETED',
      findings: summary?.analysisModules?.[3]?.findings ?? 0,
      targetTab: 'secrets'
    },
    {
      id: 'threat_intel',
      name: '05 NUCLEI / SSL',
      sub: 'TLS Handshake + Web Probes',
      icon: Crosshair,
      color: '#fbbf24',
      status: summary?.analysisModules?.[4]?.status || 'COMPLETED',
      findings: summary?.analysisModules?.[4]?.findings ?? 0,
      targetTab: 'threat_intel'
    },
    {
      id: 'ai_correlation',
      name: '06 AI CORRELATION',
      sub: 'Cross-Engine Attack Chains',
      icon: Cpu,
      color: '#c084fc',
      status: summary?.analysisModules?.[5]?.status || 'COMPLETED',
      findings: summary?.analysisModules?.[5]?.findings ?? 0,
      targetTab: 'ai_correlation'
    }
  ]

  const iconMap = {
    Code2,
    Radio,
    Boxes,
    Lock,
    Crosshair,
    Cpu,
    KeyRound: Lock,
    Globe2: Crosshair,
    sast: Code2,
    dast: Radio,
    sca: Boxes,
    secrets: Lock,
    threat_intel: Crosshair,
    ai_correlation: Cpu,
    ssl: Crosshair
  }

  const resolveIcon = (iconProp, id) => {
    if (iconProp && (typeof iconProp === 'function' || typeof iconProp === 'object')) {
      return iconProp
    }
    if (typeof iconProp === 'string' && iconMap[iconProp]) {
      return iconMap[iconProp]
    }
    if (id && iconMap[id]) {
      return iconMap[id]
    }
    return Code2
  }

  const modules = (summary?.analysisModules && summary.analysisModules.length > 0)
    ? summary.analysisModules.map((m, idx) => {
        const def = defaultModules[idx] || defaultModules[0]
        const count = m.findingsCount ?? m.findings ?? def.findings ?? 0
        const sc = typeof m.score === 'number'
          ? m.score
          : (typeof m.engineScore === 'number' ? m.engineScore : (count === 0 ? 100 : Math.max(10, Math.min(100, Math.round(100 - (count * 10))))))
        return {
          ...def,
          ...m,
          icon: resolveIcon(m.icon || def.icon, m.id || def.id),
          findings: count,
          engineScore: sc,
          statusColor: (m.status === 'COMPLETED' || m.status === 'CLEAN') ? '#00ff88' : (m.status === 'IN PROGRESS' || m.status === 'RUNNING') ? '#ff1744' : '#71717a',
          statusBg: (m.status === 'COMPLETED' || m.status === 'CLEAN') ? 'rgba(0, 255, 136, 0.15)' : (m.status === 'IN PROGRESS' || m.status === 'RUNNING') ? 'rgba(255, 23, 68, 0.18)' : 'rgba(113, 113, 122, 0.1)',
          statusBorder: (m.status === 'COMPLETED' || m.status === 'CLEAN') ? '#00ff88' : (m.status === 'IN PROGRESS' || m.status === 'RUNNING') ? '#ff1744' : '#360a25'
        }
      })
    : defaultModules.map(m => ({ ...m, icon: resolveIcon(m.icon, m.id), engineScore: m.findings === 0 ? 100 : Math.max(10, 100 - m.findings * 10) }))

  return (
    <div
      style={{
        background: '#060108',
        borderRadius: '12px',
        border: '3px solid #360a25',
        boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.95), inset 0 0 20px rgba(255, 23, 68, 0.06)',
        padding: '16px 18px',
        marginBottom: '16px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative Blood Red Cyber Corner Accents */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '18px', height: '18px', borderTop: '3px solid #ff1744', borderLeft: '3px solid #ff1744', borderRadius: '12px 0 0 0', filter: 'drop-shadow(0 0 8px #ff1744)' }} />
      <div style={{ position: 'absolute', top: 0, right: 0, width: '18px', height: '18px', borderTop: '3px solid #00f2fe', borderRight: '3px solid #00f2fe', borderRadius: '0 12px 0 0', filter: 'drop-shadow(0 0 8px #00f2fe)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '18px', height: '18px', borderBottom: '3px solid #00ff88', borderLeft: '3px solid #00ff88', borderRadius: '0 0 0 12px', filter: 'drop-shadow(0 0 8px #00ff88)' }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: '18px', height: '18px', borderBottom: '3px solid #c084fc', borderRight: '3px solid #c084fc', borderRadius: '0 0 12px 0', filter: 'drop-shadow(0 0 8px #c084fc)' }} />

      {/* Cockpit 3-Column Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr 1.3fr',
          gap: '16px',
          alignItems: 'center'
        }}
      >
        {/* COLUMN 1: Left 4 High-Contrast Cyber Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {metrics.map((m) => (
            <div
              key={m.id}
              onClick={() => onNavigateTab && onNavigateTab(m.targetTab)}
              style={{
                background: '#060108',
                borderRadius: '8px',
                padding: '8px 10px',
                border: '2.5px solid #360a25',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6), inset 0 0 12px rgba(255, 23, 68, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '74px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = m.color
                e.currentTarget.style.boxShadow = `0 0 18px ${m.color}60, inset 0 0 14px ${m.color}20`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#360a25'
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.6), inset 0 0 12px rgba(255, 23, 68, 0.03)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 900,
                    letterSpacing: '0.8px',
                    color: m.color,
                    textTransform: 'uppercase'
                  }}
                >
                  {m.label}
                </span>
                <m.icon size={13} color={m.color} strokeWidth={2.5} style={{ filter: `drop-shadow(0 0 6px ${m.color})` }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '2px' }}>
                <div>
                  <span
                    style={{
                      fontSize: '20px',
                      fontWeight: 900,
                      fontFamily: 'var(--font-mono)',
                      color: '#ffffff',
                      lineHeight: 1,
                      textShadow: `0 0 12px ${m.color}60`
                    }}
                  >
                    {m.value}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <InlineSparkline data={m.sparkline} color={m.color} width={42} height={14} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* COLUMN 2: Center 3D Holographic Threat Radar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <EnergySecurityScore
            score={score}
            maxScore={100}
            posture={posture}
            delta={delta}
            deltaPeriod={deltaPeriod}
          />
        </div>

        {/* COLUMN 3: Right 6 Engine Status & Score Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px', padding: '0 2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff1744', boxShadow: '0 0 8px #ff1744' }} />
              <span style={{ fontSize: '10px', fontWeight: 900, color: '#f8fafc', letterSpacing: '0.7px', textTransform: 'uppercase' }}>
                SCANNER MATRIX & ENGINE SCORES
              </span>
            </div>
            <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#00ff88', background: 'rgba(0,255,136,0.12)', padding: '1px 6px', borderRadius: '4px', border: '1.8px solid #00ff88', boxShadow: '0 0 10px rgba(0,255,136,0.35)' }}>
              6/6 ACTIVE
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
            {modules.map((mod) => {
              const Icon = mod.icon
              const scoreColor = mod.engineScore >= 90 ? '#00ff88' : mod.engineScore >= 70 ? '#00f2fe' : mod.engineScore >= 50 ? '#fbbf24' : '#ff1744'
              return (
                <div
                  key={mod.id}
                  onClick={() => onNavigateTab && onNavigateTab(mod.targetTab || mod.id)}
                  style={{
                    padding: '6px 9px',
                    borderRadius: '6px',
                    background: '#060108',
                    border: '2.5px solid #360a25',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '3px'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = mod.color
                    e.currentTarget.style.boxShadow = `0 0 14px ${mod.color}50`
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#360a25'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Icon size={12} color={mod.color} strokeWidth={2.4} />
                      <span style={{ fontSize: '10.5px', fontWeight: 900, color: '#f8fafc' }}>
                        {mod.name}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '9px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 900,
                        color: scoreColor,
                        textShadow: `0 0 6px ${scoreColor}60`
                      }}
                    >
                      {mod.engineScore}/100
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '9px', color: '#a1a1aa' }}>
                    <span style={{ color: '#71717a' }}>Issues: <strong style={{ color: mod.findings > 0 ? mod.color : '#00ff88' }}>{mod.findings}</strong></span>
                    <span style={{ fontSize: '8px', color: '#ff1744', fontWeight: 800 }}>VIEW →</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroCockpit
