'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Shield, Flame } from 'lucide-react'

// ============================================================================
// 3D HOLOGRAPHIC DOTTED DIGITAL GLOBE & SOC RADAR CANVAS (VAJRA RADAR ENGINE)
// ============================================================================
function HolographicThreatRadarCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId
    const size = 300
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    const centerX = size / 2
    const centerY = size / 2
    const sphereRadius = 115

    const dots = []
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
      { name: 'API Gateway Node', origX: -60, origY: -45, origZ: 75, color: '#ff1744' },
      { name: 'Production Cluster', origX: 20, origY: -65, origZ: 75, color: '#00f2fe' },
      { name: 'GitHub Repositories', origX: 85, origY: -10, origZ: 60, color: '#c084fc' },
      { name: 'Cloud IAM Perimeter', origX: -40, origY: 55, origZ: 65, color: '#fbbf24' },
      { name: 'DAST Runtime Edge', origX: 75, origY: 30, origZ: 60, color: '#00ff88' }
    ]

    const orbitParticles = Array.from({ length: 8 }, (_, i) => ({
      orbitRadius: sphereRadius + 18 + (i % 3) * 10,
      angle: (i * Math.PI * 2) / 8,
      speed: 0.015 + (i % 3) * 0.008,
      tilt: 0.35 + (i % 2) * 0.25,
      size: 1.5 + (i % 2) * 1,
      color: i % 2 === 0 ? '#ff1744' : '#00f2fe'
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
        ctx.strokeStyle = `rgba(255, 23, 68, ${0.12 - idx * 0.03})`
        ctx.lineWidth = idx === 0 ? 1.5 : 0.8
        if (idx === 1) ctx.setLineDash([3, 6])
        ctx.stroke()
        ctx.setLineDash([])
      })

      // Crosshair Reticles
      ctx.strokeStyle = 'rgba(255, 23, 68, 0.22)'
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
        ctx.strokeStyle = `rgba(255, 23, 68, ${lat === 0 ? 0.22 : 0.12})`
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
            ? `rgba(255, 255, 255, ${0.45 + depth * 0.5})`
            : `rgba(255, 23, 68, ${0.25 + depth * 0.5})`
          ctx.beginPath()
          ctx.arc(screenX, screenY, radius, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.fillStyle = `rgba(136, 8, 21, ${0.12 + depth * 0.2})`
          ctx.beginPath()
          ctx.arc(screenX, screenY, radius * 0.7, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      // 3D Animated Threat Nodes & Ripple Waves
      const projectedThreats = []

      threatHotspots.forEach((h, idx) => {
        const x1 = h.origX * cosY + h.origZ * sinY
        const z1 = -h.origX * sinY + h.origZ * cosY
        const y2 = h.origY * cosX - z1 * sinX
        const z2 = h.origY * sinX + z1 * cosX

        if (z2 > -10) {
          const screenX = centerX + x1
          const screenY = centerY + y2
          projectedThreats.push({ screenX, screenY, z2, color: h.color, name: h.name })

          const ripplePhase = (time * 0.0015 + idx * 0.3) % 1
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

            ctx.strokeStyle = 'rgba(255, 23, 68, 0.45)'
            ctx.lineWidth = 1.2
            ctx.setLineDash([2, 3])
            ctx.beginPath()
            ctx.moveTo(p1.screenX, p1.screenY)
            ctx.quadraticCurveTo(midX, midY, p2.screenX, p2.screenY)
            ctx.stroke()
            ctx.setLineDash([])

            const packetT = (time * 0.001 + i * 0.5) % 1
            const beadX =
              Math.pow(1 - packetT, 2) * p1.screenX +
              2 * (1 - packetT) * packetT * midX +
              Math.pow(packetT, 2) * p2.screenX
            const beadY =
              Math.pow(1 - packetT, 2) * p1.screenY +
              2 * (1 - packetT) * packetT * midY +
              Math.pow(packetT, 2) * p2.screenY

            ctx.fillStyle = '#00f2fe'
            ctx.beginPath()
            ctx.arc(beadX, beadY, 2, 0, Math.PI * 2)
            ctx.shadowColor = '#00f2fe'
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
// MAIN ENERGY SECURITY SCORE COMPONENT (MATCHING VAJRA 3D RADAR HUD)
import { getScorePosture } from '../../utils/securityScore'

// ============================================================================
// MAIN ENERGY SECURITY SCORE COMPONENT (MATCHING VAJRA 3D RADAR HUD)
// ============================================================================
export function EnergySecurityScore({
  score = 87,
  maxScore = 100,
  posture = '',
  delta = '+6.4%',
  deltaPeriod = 'from live scan'
}) {
  const normalizedScore = (score !== undefined && score !== null && !isNaN(score)) ? Number(score) : 87
  const [displayScore, setDisplayScore] = useState(normalizedScore)

  useEffect(() => {
    let start = displayScore
    const end = normalizedScore
    if (start === end) {
      setDisplayScore(end)
      return
    }
    const duration = 500
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
  }, [normalizedScore])

  const postureInfo = getScorePosture(displayScore)
  const activePosture = posture || postureInfo.label

  return (
    <div
      style={{
        position: 'relative',
        width: '300px',
        height: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto',
        userSelect: 'none'
      }}
    >
      {/* 3D Holographic Threat Radar Canvas */}
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
            backgroundColor: 'rgba(5, 8, 20, 0.94)',
            border: `2px solid ${postureInfo.color}dd`,
            borderRadius: '16px',
            padding: '8px 16px',
            backdropFilter: 'blur(12px)',
            boxShadow: `0 0 25px ${postureInfo.color}66, inset 0 0 16px ${postureInfo.color}33`
          }}
          className="flex flex-col items-center"
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            <Shield size={12} color={postureInfo.color} className="animate-pulse" />
            <span style={{ color: postureInfo.color }} className="text-[9px] font-mono font-black uppercase tracking-widest">
              AI DEFENSE POSTURE
            </span>
          </div>

          <div
            style={{
              fontSize: '34px',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1,
              letterSpacing: '-0.5px',
              textShadow: `0 0 18px ${postureInfo.color}f0, 0 0 32px ${postureInfo.color}88`
            }}
            className="font-mono my-1"
          >
            {displayScore}
            <span style={{ fontSize: '16px', color: postureInfo.color, marginLeft: '2px' }}>%</span>
          </div>

          <div
            style={{
              padding: '3px 10px',
              borderRadius: '8px',
              background: `linear-gradient(90deg, ${postureInfo.color} 0%, rgba(10, 15, 30, 0.9) 100%)`,
              fontSize: '9px',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '1px',
              boxShadow: `0 0 12px ${postureInfo.color}88`
            }}
            className="uppercase tracking-widest"
          >
            {activePosture}
          </div>

          <div className="text-[8.5px] font-mono font-bold text-zinc-300 mt-1.5 uppercase tracking-wider flex items-center gap-1">
            <span>POSTURE DELTA:</span>
            <span style={{ color: postureInfo.color }} className="font-black">{delta}</span>
            <span className="text-zinc-500">{deltaPeriod}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnergySecurityScore
