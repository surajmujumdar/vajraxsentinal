'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ShieldAlert,
  Building2,
  TrendingUp,
  Shield,
  Radio,
  ChevronRight,
  Flame,
  Zap,
  Activity,
  Crosshair
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCompanyStore } from '@/store/companyStore'
import { dashboardService } from '@/services/dashboard.service'
import { ransomwareService } from '@/services/ransomware.service'

// ============================================================================
// 1. HIGH-TECH CYBER HEX ICON WITH GLOW EMBLEM
// ============================================================================
function CyberHexIcon({
  icon: Icon,
  color = '#ff1744',
  size = 36,
  iconSize = 16
}: {
  icon: any
  color?: string
  size?: number
  iconSize?: number
}) {
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
          points="22,3 39,12 39,32 22,41 5,32 5,12"
          fill={`${color}15`}
          stroke={color}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <circle
          cx="22"
          cy="22"
          r="13"
          fill="none"
          stroke={`${color}50`}
          strokeWidth="1.2"
          strokeDasharray="2 3"
        />
        <line x1="22" y1="3" x2="22" y2="7" stroke={color} strokeWidth="1.5" />
        <line x1="22" y1="41" x2="22" y2="37" stroke={color} strokeWidth="1.5" />
      </svg>
      <Icon
        size={iconSize}
        color={color}
        strokeWidth={2.4}
        style={{
          position: 'relative',
          zIndex: 2,
          filter: `drop-shadow(0 0 6px ${color})`
        }}
      />
    </div>
  )
}

// ============================================================================
// 2. ANIMATED SVG LIVE SPARKLINE WITH PEAK PULSE
// ============================================================================
function AnimatedSparkline({
  data = [],
  color = '#00f2fe',
  width = 64,
  height = 20
}: {
  data?: number[]
  color?: string
  width?: number
  height?: number
}) {
  const safeData = !data || data.length < 2 ? [2, 5, 3, 8, 6, 10] : data
  const min = Math.min(...safeData)
  const max = Math.max(...safeData)
  const range = max - min || 1
  const step = width / (safeData.length - 1)

  const points = safeData.map((val, idx) => {
    const x = idx * step
    const y =
      max === 0 && min === 0
        ? height / 2
        : height - ((val - min) / range) * (height - 6) - 3
    return { x, y }
  })

  const pathD = points.reduce((acc, pt, idx, arr) => {
    if (idx === 0) return `M ${pt.x},${pt.y}`
    const prev = arr[idx - 1]
    const cp1x = prev.x + (pt.x - prev.x) / 2
    const cp1y = prev.y
    const cp2x = prev.x + (pt.x - prev.x) / 2
    const cp2y = pt.y
    return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${pt.x},${pt.y}`
  }, '')

  const lastPoint = points[points.length - 1]

  return (
    <svg width={width} height={height} style={{ overflow: 'visible', flexShrink: 0 }}>
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path
        d={`${pathD} L ${width},${height} L 0,${height} Z`}
        fill={`url(#grad-${color.replace('#', '')})`}
      />
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        style={{
          filter: `drop-shadow(0 0 6px ${color})`
        }}
      />
      {lastPoint && (
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r="2.5"
          fill="#ffffff"
          stroke={color}
          strokeWidth="1.5"
          style={{
            filter: `drop-shadow(0 0 6px #ffffff)`
          }}
        />
      )}
    </svg>
  )
}

// ============================================================================
// 3. LIVE SIGNAL WAVEFORM CANVAS COMPONENT
// ============================================================================
function LiveSignalWaveform({ width = 85, height = 16, color = '#ff1744' }: { width?: number; height?: number; color?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let phase = 0

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.beginPath()
      ctx.strokeStyle = color
      ctx.lineWidth = 1.6
      ctx.lineJoin = 'round'

      const midY = height / 2
      for (let x = 0; x < width; x++) {
        const y =
          midY +
          Math.sin((x * 0.18) + phase) * (height * 0.28) +
          Math.sin((x * 0.08) - phase * 1.5) * (height * 0.15)
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.shadowColor = color
      ctx.shadowBlur = 6
      ctx.stroke()
      ctx.shadowBlur = 0

      phase += 0.075
      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animId)
  }, [width, height, color])

  return <canvas ref={canvasRef} width={width} height={height} className="flex-shrink-0" />
}

// ============================================================================
// 4. HOLOGRAPHIC 3D DOTTED DIGITAL GLOBE & SOC RADAR CANVAS
// ============================================================================
function HolographicThreatRadarCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const size = 300
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    const centerX = size / 2
    const centerY = size / 2
    const sphereRadius = 115

    const dots: Array<{ origX: number; origY: number; origZ: number; alpha: number }> = []
    const dotCount = 220
    const goldenRatio = (1 + Math.sqrt(5)) / 2

    for (let i = 0; i < dotCount; i++) {
      const theta = (2 * Math.PI * i) / goldenRatio
      const phi = Math.acos(1 - (2 * (i + 0.5)) / dotCount)
      const x = sphereRadius * Math.sin(phi) * Math.cos(theta)
      const y = sphereRadius * Math.sin(phi) * Math.sin(theta)
      const z = sphereRadius * Math.cos(phi)
      dots.push({ origX: x, origY: y, origZ: z, alpha: 0.3 + (i % 5) * 0.14 })
    }

    const threatHotspots = [
      { name: 'North America DC', origX: -60, origY: -45, origZ: 75, color: '#ff1744' },
      { name: 'Europe Central Edge', origX: 20, origY: -65, origZ: 75, color: '#ff5252' },
      { name: 'Asia-Pacific Core', origX: 85, origY: -10, origZ: 60, color: '#ff5722' },
      { name: 'South America Relay', origX: -40, origY: 55, origZ: 65, color: '#c084fc' },
      { name: 'East Asia Gateway', origX: 75, origY: 30, origZ: 60, color: '#fbbf24' }
    ]

    const orbitParticles = Array.from({ length: 8 }, (_, i) => ({
      orbitRadius: sphereRadius + 18 + (i % 3) * 10,
      angle: (i * Math.PI * 2) / 8,
      speed: 0.015 + (i % 3) * 0.008,
      tilt: 0.35 + (i % 2) * 0.25,
      size: 1.5 + (i % 2) * 1,
      color: i % 2 === 0 ? '#ff1744' : '#e11d48'
    }))

    let rotY = 0
    let rotX = 0.2
    let radarSweep = 0
    let time = 0

    const render = () => {
      time += 1
      rotY += 0.006
      radarSweep = (radarSweep + 0.035) % (Math.PI * 2)

      ctx.clearRect(0, 0, size, size)

      const cosY = Math.cos(rotY)
      const sinY = Math.sin(rotY)
      const cosX = Math.cos(rotX)
      const sinX = Math.sin(rotX)

      // Outer Radar Target Rings
      ;[138, 126, 88].forEach((r, idx) => {
        ctx.beginPath()
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(255, 23, 68, ${0.2 - idx * 0.05})`
        ctx.lineWidth = idx === 0 ? 1.5 : 0.8
        if (idx === 1) ctx.setLineDash([3, 6])
        ctx.stroke()
        ctx.setLineDash([])
      })

      // Crosshair Reticles
      ctx.strokeStyle = 'rgba(255, 23, 68, 0.3)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(centerX - 145, centerY)
      ctx.lineTo(centerX - 100, centerY)
      ctx.moveTo(centerX + 100, centerY)
      ctx.lineTo(centerX + 145, centerY)
      ctx.moveTo(centerX, centerY - 145)
      ctx.lineTo(centerX, centerY - 100)
      ctx.moveTo(centerX, centerY + 100)
      ctx.lineTo(centerX, centerY + 145)
      ctx.stroke()

      // Latitude Rings
      ;[-0.6, -0.3, 0, 0.3, 0.6].forEach(lat => {
        const ringR = sphereRadius * Math.cos(lat * (Math.PI / 2))
        const ringY = sphereRadius * Math.sin(lat * (Math.PI / 2))

        ctx.beginPath()
        let first = true
        for (let a = 0; a <= Math.PI * 2; a += 0.15) {
          const px = Math.cos(a) * ringR
          const py = ringY
          const pz = Math.sin(a) * ringR

          const x1 = px * cosY + pz * sinY
          const z1 = -px * sinY + pz * cosY
          const y2 = py * cosX - z1 * sinX
          const z2 = py * sinX + z1 * cosX

          if (z2 > -sphereRadius * 0.4) {
            const screenX = centerX + x1
            const screenY = centerY + y2
            if (first) {
              ctx.moveTo(screenX, screenY)
              first = false
            } else {
              ctx.lineTo(screenX, screenY)
            }
          }
        }
        ctx.strokeStyle = `rgba(255, 23, 68, ${lat === 0 ? 0.3 : 0.15})`
        ctx.lineWidth = lat === 0 ? 1.2 : 0.8
        ctx.setLineDash([2, 4])
        ctx.stroke()
        ctx.setLineDash([])
      })

      // Project & Render 3D Dotted Surface Particles
      dots.forEach(d => {
        const x1 = d.origX * cosY + d.origZ * sinY
        const z1 = -d.origX * sinY + d.origZ * cosY
        const y2 = d.origY * cosX - z1 * sinX
        const z2 = d.origY * sinX + z1 * cosX

        const depth = (z2 + sphereRadius) / (sphereRadius * 2)
        const radius = Math.max(0.6, depth * 1.6)
        const screenX = centerX + x1
        const screenY = centerY + y2

        if (z2 > 0) {
          const isFront = z2 > sphereRadius * 0.4
          ctx.fillStyle = isFront
            ? `rgba(255, 255, 255, ${0.5 + depth * 0.5})`
            : `rgba(255, 23, 68, ${0.3 + depth * 0.5})`
          ctx.beginPath()
          ctx.arc(screenX, screenY, radius, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.fillStyle = `rgba(136, 8, 21, ${0.15 + depth * 0.2})`
          ctx.beginPath()
          ctx.arc(screenX, screenY, radius * 0.7, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      // 3D Animated Threat Nodes & Ripple Waves
      const projectedThreats: Array<{ screenX: number; screenY: number; z2: number; color: string; name: string }> = []

      threatHotspots.forEach((h, idx) => {
        const x1 = h.origX * cosY + h.origZ * sinY
        const z1 = -h.origX * sinY + h.origZ * cosY
        const y2 = h.origY * cosX - z1 * sinX
        const z2 = h.origY * sinX + z1 * cosX

        if (z2 > -10) {
          const screenX = centerX + x1
          const screenY = centerY + y2
          projectedThreats.push({ screenX, screenY, z2, color: h.color, name: h.name })

          const ripplePhase = ((time * 0.0015 + idx * 0.3) % 1)
          const rippleRadius = 4 + ripplePhase * 18
          const rippleAlpha = (1 - ripplePhase) * 0.85

          ctx.strokeStyle = `rgba(255, 23, 68, ${rippleAlpha})`
          ctx.lineWidth = 1.4
          ctx.beginPath()
          ctx.arc(screenX, screenY, rippleRadius, 0, Math.PI * 2)
          ctx.stroke()

          ctx.fillStyle = '#ffffff'
          ctx.beginPath()
          ctx.arc(screenX, screenY, 2.5, 0, Math.PI * 2)
          ctx.fill()

          ctx.fillStyle = h.color
          ctx.beginPath()
          ctx.arc(screenX, screenY, 4.5, 0, Math.PI * 2)
          ctx.shadowColor = h.color
          ctx.shadowBlur = 10
          ctx.fill()
          ctx.shadowBlur = 0
        }
      })

      // Geodesic Arc Lines
      if (projectedThreats.length >= 2) {
        for (let i = 0; i < projectedThreats.length - 1; i += 2) {
          const p1 = projectedThreats[i]
          const p2 = projectedThreats[i + 1]
          if (p1 && p2) {
            const midX = (p1.screenX + p2.screenX) / 2
            const midY = (p1.screenY + p2.screenY) / 2 - 14

            ctx.strokeStyle = 'rgba(255, 23, 68, 0.5)'
            ctx.lineWidth = 1.2
            ctx.setLineDash([2, 3])
            ctx.beginPath()
            ctx.moveTo(p1.screenX, p1.screenY)
            ctx.quadraticCurveTo(midX, midY, p2.screenX, p2.screenY)
            ctx.stroke()
            ctx.setLineDash([])

            const packetT = ((time * 0.001 + i * 0.5) % 1)
            const beadX = Math.pow(1 - packetT, 2) * p1.screenX + 2 * (1 - packetT) * packetT * midX + Math.pow(packetT, 2) * p2.screenX
            const beadY = Math.pow(1 - packetT, 2) * p1.screenY + 2 * (1 - packetT) * packetT * midY + Math.pow(packetT, 2) * p2.screenY

            ctx.fillStyle = '#ff1744'
            ctx.beginPath()
            ctx.arc(beadX, beadY, 2, 0, Math.PI * 2)
            ctx.shadowColor = '#ff1744'
            ctx.shadowBlur = 8
            ctx.fill()
            ctx.shadowBlur = 0
          }
        }
      }

      // Radar Sweep
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(radarSweep)

      const sweepGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 130)
      sweepGrad.addColorStop(0, 'rgba(255, 23, 68, 0.4)')
      sweepGrad.addColorStop(0.7, 'rgba(255, 23, 68, 0.15)')
      sweepGrad.addColorStop(1, 'rgba(255, 23, 68, 0.0)')

      ctx.fillStyle = sweepGrad
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, 130, -0.45, 0)
      ctx.closePath()
      ctx.fill()

      ctx.strokeStyle = '#ff1744'
      ctx.lineWidth = 1.6
      ctx.shadowColor = '#ff1744'
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(130, 0)
      ctx.stroke()
      ctx.shadowBlur = 0
      ctx.restore()

      // Orbiting Telemetry Particles
      orbitParticles.forEach(p => {
        p.angle += p.speed
        const ox = Math.cos(p.angle) * p.orbitRadius
        const oy = Math.sin(p.angle) * p.orbitRadius * Math.sin(p.tilt)
        const oz = Math.sin(p.angle) * p.orbitRadius * Math.cos(p.tilt)

        const px = ox * cosY + oz * sinY
        const pz = -ox * sinY + oz * cosY
        const py = oy * cosX - pz * sinX

        const screenX = centerX + px
        const screenY = centerY + py

        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(screenX, screenY, p.size, 0, Math.PI * 2)
        ctx.shadowColor = p.color
        ctx.shadowBlur = 6
        ctx.fill()
        ctx.shadowBlur = 0
      })

      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '300px',
        height: '300px',
        display: 'block',
        margin: '0 auto'
      }}
    />
  )
}

// ============================================================================
// 5. MAIN VAJRA HERO COCKPIT COMPONENT (CLEAN & SPACIOUS)
// ============================================================================
export default function VajraHeroCockpit() {
  const router = useRouter()
  const { companies, fetchCompanies } = useCompanyStore()
  const [threatScore, setThreatScore] = useState<number>(89)
  const [summary, setSummary] = useState<any>({
    total_attacks: 12847,
    active_threat_actors: 395,
    critical_attacks: 45,
    last_updated: new Date().toISOString()
  })
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(true)
  const [displayScore, setDisplayScore] = useState(89)

  // Animated Count-up for Score on Mount
  useEffect(() => {
    let start = displayScore || 0
    const end = threatScore || 89
    if (start === end) {
      setDisplayScore(end)
      return
    }
    const duration = 600
    const increment = (end - start) / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if ((increment >= 0 && start >= end) || (increment < 0 && start <= end)) {
        setDisplayScore(end)
        clearInterval(timer)
      } else {
        setDisplayScore(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [threatScore])

  // Data Fetching and Polling
  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      try {
        const [summaryData, rStats] = await Promise.allSettled([
          dashboardService.getSummary(),
          ransomwareService.getStats(),
          fetchCompanies()
        ])
        if (isMounted) {
          let updatedObj = { ...summary }
          if (summaryData.status === 'fulfilled' && summaryData.value) {
            updatedObj = { ...updatedObj, ...summaryData.value }
            setIsLiveConnected(true)
          }
          if (rStats.status === 'fulfilled' && rStats.value) {
            if (rStats.value.groupsCount || rStats.value.activeGroups) {
              updatedObj.active_threat_actors = rStats.value.groupsCount || rStats.value.activeGroups || 395
            }
          }
          setSummary(updatedObj)
        }
      } catch (error) {
        console.error('Error fetching hero cockpit summary:', error)
        setIsLiveConnected(false)
      }
    }

    fetchData()
    const pollingInterval = setInterval(fetchData, 15000)
    return () => {
      isMounted = false
      clearInterval(pollingInterval)
    }
  }, [fetchCompanies])

  // Dynamically calculate average threat/security score across monitored scope
  useEffect(() => {
    if (companies && companies.length > 0) {
      const totalScore = companies.reduce((acc: number, c: any) => {
        const score = c.security_score ?? (c.risk_score !== undefined ? Math.max(10, Math.min(100, Math.round(100 - Number(c.risk_score)))) : 88);
        return acc + score;
      }, 0);
      const avg = Math.round(totalScore / companies.length);
      setThreatScore(avg);
    } else {
      setThreatScore(89);
    }
  }, [companies])

  const monitoredCount = companies ? companies.length : 0

  // 8 Surrounding Threat Indicator Badges
  const threatPills = [
    { label: 'RANSOMWARE', pulseColor: '#ff1744' },
    { label: 'MALWARE', pulseColor: '#ff5722' },
    { label: 'DATA LEAKS', pulseColor: '#ff1744' },
    { label: 'APT ACTIVITY', pulseColor: '#c084fc' },
    { label: 'VULNERABILITIES', pulseColor: '#fbbf24' },
    { label: 'DARK WEB', pulseColor: '#e11d48' },
    { label: 'ZERO-DAY', pulseColor: '#ff1744' },
    { label: 'PHISHING', pulseColor: '#00f2fe' }
  ]

  // 4 Large Attack Radar Metrics
  const metrics = [
    {
      id: 'attacks',
      label: 'GLOBAL ATTACKS TODAY',
      value: (summary?.total_attacks || 12847).toLocaleString(),
      delta: '+18.2%',
      deltaPeriod: 'vs yesterday',
      sparkline: [8200, 9400, 11200, 10800, 12847],
      color: '#ff1744',
      icon: Flame,
      path: '/global-attacks',
      bgGlow: 'rgba(255, 23, 68, 0.08)'
    },
    {
      id: 'actors',
      label: 'ACTIVE THREAT ACTORS',
      value: (summary?.active_threat_actors || 395).toLocaleString(),
      delta: '+12 monitored actively',
      deltaPeriod: 'tracked APTs',
      sparkline: [320, 345, 360, 380, 395],
      color: '#fbbf24',
      icon: Shield,
      path: '/threat-intelligence/actors',
      bgGlow: 'rgba(251, 191, 36, 0.08)'
    },
    {
      id: 'companies',
      label: 'MONITORED TARGET SCOPE',
      value: `${monitoredCount} ASSETS`,
      delta: '100% HEALTH',
      deltaPeriod: 'continuous surveillance',
      sparkline: [0, 0, 0, 0, monitoredCount],
      color: '#00f2fe',
      icon: Building2,
      path: '/companies',
      bgGlow: 'rgba(0, 242, 254, 0.08)'
    },
    {
      id: 'critical',
      label: 'CRITICAL THREAT PULSES',
      value: (summary?.critical_attacks || 45).toLocaleString(),
      delta: 'HIGH SEVERITY',
      deltaPeriod: 'immediate mitigation',
      sparkline: [12, 19, 28, 35, 45],
      color: '#c084fc',
      icon: ShieldAlert,
      path: '/alerts',
      bgGlow: 'rgba(192, 132, 252, 0.08)'
    }
  ]

  return (
    <div
      style={{
        backgroundColor: '#040814',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        borderRadius: '14px',
        padding: '18px 20px',
        boxShadow: '0 0 35px rgba(6, 182, 212, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}
      className="tech-border-card hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(0,242,254,0.25)] transition-all duration-300 font-hud"
    >
      {/* Background Cybernetic Grid Texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 18% 50%, rgba(6, 182, 212, 0.08) 0%, transparent 60%), radial-gradient(circle at 85% 20%, rgba(37, 99, 235, 0.06) 0%, transparent 50%), linear-gradient(to right, rgba(56, 189, 248, 0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.02) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 100% 100%, 28px 28px, 28px 28px',
          pointerEvents: 'none'
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch relative z-10">
        {/* ================================================================= */}
        {/* LEFT COLUMN: 3D HOLOGRAPHIC THREAT RADAR & HUD POSTURE GAUGE      */}
        {/* ================================================================= */}
        <div className="lg:col-span-5 flex flex-col items-center justify-between p-3 border-b lg:border-b-0 lg:border-r border-cyan-900/40 relative bg-command-900/60 rounded-xl">
          {/* Top Title Bar of Radar */}
          <div className="w-full flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400 shadow-[0_0_8px_#00f2fe]"></span>
              </span>
              <span className="text-[12px] font-bold uppercase tracking-widest text-white font-mono flex items-center gap-1.5">
                <Crosshair size={14} className="text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
                AI THREAT RADAR
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[9.5px] font-mono font-bold ${displayScore >= 80 ? 'text-emerald-300 bg-emerald-950/60 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : displayScore >= 60 ? 'text-amber-300 bg-amber-950/60 border-amber-500/50 shadow-[0_0_8px_rgba(251,191,36,0.3)]' : 'text-rose-300 bg-rose-950/60 border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.3)]'} px-2.5 py-0.5 rounded-md border`}>
                POSTURE: {displayScore >= 80 ? 'OPTIMAL' : displayScore >= 60 ? 'ELEVATED' : 'CRITICAL'} ({displayScore}%)
              </span>
              <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/50 px-2 py-0.5 rounded-md shadow-[0_0_6px_#10b981]">
                LIVE
              </span>
            </div>
          </div>

          {/* 3D Holographic Globe Canvas + Center HUD Overlay */}
          <div className="relative flex items-center justify-center my-2 select-none w-full">
            <HolographicThreatRadarCanvas />

            {/* Central Overlay HUD Badge - Highly Prominent Posture HUD */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  backgroundColor: 'rgba(4, 8, 20, 0.94)',
                  border: '1px solid rgba(56, 189, 248, 0.7)',
                  borderRadius: '16px',
                  padding: '10px 18px',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 0 25px rgba(6, 182, 212, 0.4), inset 0 0 16px rgba(37, 99, 235, 0.2)'
                }}
                className="flex flex-col items-center"
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Flame size={13} color="#00f2fe" className="animate-pulse" />
                  <span className="text-[9.5px] font-mono font-bold text-cyan-300 uppercase tracking-widest">
                    AI DEFENSE POSTURE
                  </span>
                </div>

                <div
                  style={{
                    fontSize: '38px',
                    fontWeight: 900,
                    color: '#ffffff',
                    lineHeight: 1,
                    letterSpacing: '-0.5px',
                    textShadow: '0 0 18px rgba(0, 242, 254, 0.9), 0 0 32px rgba(56, 189, 248, 0.6)'
                  }}
                  className="font-mono my-1"
                >
                  {displayScore || 89}
                  <span style={{ fontSize: '18px', color: '#00f2fe', marginLeft: '2px' }}>%</span>
                </div>

                <div
                  style={{
                    padding: '3.5px 12px',
                    borderRadius: '8px',
                    background: displayScore >= 80 ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)' : displayScore >= 60 ? 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(90deg, #f43f5e 0%, #be123c 100%)',
                    fontSize: '9.5px',
                    fontWeight: 800,
                    color: '#ffffff',
                    letterSpacing: '1px',
                    boxShadow: `0 0 12px ${displayScore >= 80 ? 'rgba(16, 185, 129, 0.7)' : displayScore >= 60 ? 'rgba(245, 158, 11, 0.7)' : 'rgba(244, 63, 94, 0.7)'}`
                  }}
                  className="uppercase tracking-widest"
                >
                  {displayScore >= 80 ? 'OPTIMAL DEFENSE LEVEL' : displayScore >= 60 ? 'ELEVATED RISK LEVEL' : 'CRITICAL THREAT LEVEL'}
                </div>

                <div className="text-[9px] font-mono font-bold text-slate-300 mt-2 uppercase tracking-wider flex items-center gap-1">
                  <span>POSTURE DELTA:</span>
                  <span className="text-emerald-400 font-bold">+18.4%</span>
                  <span className="text-slate-500">vs 24h</span>
                </div>
              </div>
            </div>
          </div>

          {/* Surrounding Threat Indicators Chips */}
          <div className="w-full flex flex-wrap items-center justify-center gap-1.5 my-2">
            {threatPills.map((p, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'rgba(7, 15, 36, 0.9)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  borderRadius: '6px',
                  padding: '3px 7px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                className="hover:border-cyan-400 hover:shadow-[0_0_8px_rgba(0,242,254,0.3)] transition-all"
              >
                <span
                  style={{
                    width: '4.5px',
                    height: '4.5px',
                    borderRadius: '50%',
                    backgroundColor: p.pulseColor,
                    boxShadow: `0 0 6px ${p.pulseColor}`
                  }}
                  className="animate-pulse"
                />
                <span className="text-[8.5px] font-mono font-bold text-slate-300 tracking-wider">
                  {p.label}
                </span>
              </div>
            ))}
          </div>

          {/* Bottom Label with Animated Waveform */}
          <div className="w-full flex items-center justify-between mt-2 pt-2 border-t border-cyan-900/40">
            <div className="flex items-center gap-2">
              <Activity size={13} className="text-cyan-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300 font-mono">
                REAL-TIME SOC SURVEILLANCE
              </span>
            </div>
            <LiveSignalWaveform width={85} height={16} color="#00f2fe" />
          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT COLUMN: 4 CLEAN, SPACIOUS & HIGH-TECH METRIC CARDS          */}
        {/* ================================================================= */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-4 bg-command-900/60 p-4 rounded-xl border border-cyan-900/40">
          {/* Header Row */}
          <div className="flex items-center justify-between pb-3 border-b border-cyan-900/40">
            <div className="flex items-center gap-2.5">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-white">
                VAJRA TELEMETRY & ATTACK RADAR
              </h2>
            </div>
            <span className="text-[9.5px] font-mono font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-400/50 px-3 py-1 rounded-full shadow-[0_0_10px_rgba(0,242,254,0.3)]">
              AI COCKPIT ACTIVE
            </span>
          </div>

          {/* 4 Large, Spacious Cyber Metric Cards (2x2 Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-auto">
            {metrics.map((m) => (
              <Link
                key={m.id}
                href={m.path}
                prefetch={true}
                style={{
                  backgroundColor: 'rgba(7, 15, 36, 0.85)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '120px',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  textDecoration: 'none'
                }}
                className="hover:border-cyan-400 hover:shadow-[0_0_24px_rgba(6,182,212,0.25)] hover:-translate-y-0.5 group"
              >
                {/* Background Watermark Accent */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    width: '80px',
                    height: '80px',
                    background: `radial-gradient(circle, ${m.color}15 0%, transparent 70%)`,
                    pointerEvents: 'none'
                  }}
                />

                {/* Top Row: Icon + Label + Value */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <CyberHexIcon icon={m.icon} color={m.color} size={36} iconSize={16} />
                      <div>
                        <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
                          {m.label}
                        </div>
                        <div
                          style={{
                            fontSize: '22px',
                            fontWeight: 900,
                            lineHeight: 1.1,
                            letterSpacing: '-0.3px',
                            color: '#ffffff'
                          }}
                          className="font-mono group-hover:text-cyan-200 transition-colors mt-0.5"
                        >
                          {m.value}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Delta Trend + Animated Sparkline */}
                <div className="flex items-center justify-between pt-2.5 border-t border-cyan-900/30">
                  <div className="text-[10px] font-bold">
                    <span style={{ color: m.color, fontWeight: 800 }} className="mr-1.5 font-mono">
                      {m.delta}
                    </span>
                    <span className="text-slate-400 text-[9px] font-mono">{m.deltaPeriod}</span>
                  </div>
                  <AnimatedSparkline data={m.sparkline} color={m.color} width={64} height={20} />
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom Full-Width Threat Mitigation Action Bar */}
          <div
            style={{
              backgroundColor: '#040814',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '10px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 0 16px rgba(6, 182, 212, 0.15)',
              position: 'relative',
              overflow: 'hidden'
            }}
            className="hover:border-cyan-400 transition-all"
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '4px',
                background: 'linear-gradient(180deg, #00f2fe 0%, #2563eb 100%)',
                boxShadow: '0 0 8px #00f2fe'
              }}
            />

            <div className="flex items-center gap-3 pl-2">
              <Zap className="w-4 h-4 text-cyan-400 animate-pulse flex-shrink-0" />
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  THREAT MITIGATION: <span className="text-cyan-400">MAXIMUM LOCKDOWN</span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  Automated defenses active across all monitored assets
                </div>
              </div>
            </div>

            <Link
              href="/threat-intelligence"
              prefetch={true}
              style={{
                background: 'linear-gradient(90deg, rgba(6, 182, 212, 0.25) 0%, rgba(37, 99, 235, 0.2) 100%)',
                border: '1px solid rgba(56, 189, 248, 0.5)',
                color: '#ffffff',
                boxShadow: '0 0 12px rgba(6, 182, 212, 0.35)'
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:brightness-125 transition-all flex-shrink-0"
            >
              <span>EXPLORE INTEL GRID</span>
              <ChevronRight className="w-4 h-4 text-cyan-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
