'use client'

import React, { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import VajraHeroCockpit from './VajraHeroCockpit'
import CriticalAlerts from './CriticalAlerts'
import ThreatIntelligenceSummary from './ThreatIntelligenceSummary'
import RansomwareLive from './RansomwareLive'
import AttackTrendGraph from './AttackTrendGraph'
import LiveCyberThreatNews from './LiveCyberThreatNews'
import { usePlatformStore } from '@/store/platformStore'
import SentinelApp from '@/sentinel/App'

export default function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { currentPlatform } = usePlatformStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-[#020617]">
        <div className="w-[224px] bg-[#040814] border-r border-cyan-900/40 h-screen animate-pulse" />
        <div className="flex-1 flex flex-col">
          <div className="h-[50px] bg-[#040814] border-b border-cyan-900/40 animate-pulse" />
          <main className="flex-1 p-6 space-y-6">
            <div className="h-64 bg-command-900/80 border border-cyan-900/40 rounded-xl animate-pulse" />
          </main>
        </div>
      </div>
    )
  }

  if (currentPlatform === 'SENTINEL' || currentPlatform === 'SENTINA') {
    return <SentinelApp />
  }

  return (
    <div className="flex min-h-screen bg-[#020617] text-white">
      {/* Sticky Left Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-3.5 sm:p-4 mx-auto w-full max-w-[1440px] space-y-3.5">
          {/* Top Hero Cockpit (Matching Threat Radar & Energy Gauge) */}
          <VajraHeroCockpit />

          {/* Recent Critical Alerts */}
          <CriticalAlerts />

          {/* Threat Intelligence Matrix & Trend Radar */}
          <ThreatIntelligenceSummary />

          {/* Ransomware Live Grid */}
          <RansomwareLive />

          {/* Attack Trend Telemetry */}
          <AttackTrendGraph />

          {/* Live Threat News Feed */}
          <LiveCyberThreatNews />
        </main>
      </div>
    </div>
  )
}
