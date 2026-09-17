'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import RansomwareLive from '@/components/RansomwareLive'
import { ransomwareService } from '@/services/ransomware.service'

export default function RansomwarePage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [stats, setStats] = useState<any>(() => ransomwareService.getCachedOrInitialStats())

  useEffect(() => {
    let isMounted = true
    ransomwareService.getStats().then((data) => {
      if (isMounted && data) {
        setStats(data)
      }
    }).catch((err) => {
      console.warn('Background ransomware stats refresh notice:', err)
    })
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="flex min-h-screen bg-[#020617] text-white">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-4 w-full max-w-[1440px] mx-auto space-y-3.5">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Header */}
            <div className="mb-4">
              <h1 className="text-xl sm:text-2xl font-hud font-black text-white uppercase tracking-wider">RANSOMWARE THREAT INTELLIGENCE</h1>
              <p className="text-slate-400 text-xs font-medium mt-0.5">Real-time ransomware adversary monitoring, victim tracking, and decryptor intelligence</p>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <div className="bg-command-900/80 backdrop-blur-md border border-cyan-500/25 rounded-xl p-3.5 hover:border-cyan-400 hover:shadow-[0_0_16px_rgba(0,242,254,0.25)] transition-all">
                  <div className="text-2xl font-black text-[#00f2fe] font-mono">{stats.groupsCount}</div>
                  <div className="text-[10px] font-hud font-black uppercase tracking-wider text-slate-400 mt-1">Active APT Groups</div>
                </div>
                <div className="bg-command-900/80 backdrop-blur-md border border-cyan-500/25 rounded-xl p-3.5 hover:border-cyan-300 hover:shadow-[0_0_16px_rgba(56,189,248,0.25)] transition-all">
                  <div className="text-2xl font-black text-white font-mono">{stats.overallVictims?.toLocaleString()}</div>
                  <div className="text-[10px] font-hud font-black uppercase tracking-wider text-slate-400 mt-1">Overall Global Victims</div>
                </div>
                <div className="bg-command-900/80 backdrop-blur-md border border-cyan-500/25 rounded-xl p-3.5 hover:border-rose-400 hover:shadow-[0_0_16px_rgba(244,63,94,0.3)] transition-all">
                  <div className="text-2xl font-black text-rose-400 font-mono">{stats.victimsThisYear?.toLocaleString()}</div>
                  <div className="flex items-center justify-between text-[10px] font-hud font-black uppercase tracking-wider text-slate-400 mt-1">
                    <span>Victims This Year</span>
                    <span className="text-rose-400 font-bold font-mono">{stats.victimsThisYearTrend}</span>
                  </div>
                </div>
                <div className="bg-command-900/80 backdrop-blur-md border border-cyan-500/25 rounded-xl p-3.5 hover:border-emerald-400 hover:shadow-[0_0_16px_rgba(16,185,129,0.25)] transition-all">
                  <div className="text-2xl font-black text-emerald-400 font-mono">{stats.victimsThisMonth?.toLocaleString()}</div>
                  <div className="flex items-center justify-between text-[10px] font-hud font-black uppercase tracking-wider text-slate-400 mt-1">
                    <span>Victims This Month</span>
                    <span className="text-emerald-400 font-bold font-mono">{stats.victimsThisMonthTrend}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Ransomware Live Feed */}
            <RansomwareLive />

            {/* Additional Info */}
            <div className="bg-command-900/80 backdrop-blur-md border border-cyan-500/25 rounded-xl p-4 hover:border-cyan-500/40 transition-all duration-300">
              <h2 className="text-sm font-hud font-black text-white uppercase tracking-wider mb-2">About Ransomware Threat Feed</h2>
              <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                Ransomware.live tracks and monitors ransomware groups&apos; victims and their activity. 
                This dashboard provides simulated threat intelligence data that mirrors the types of 
                information available from ransomware.live, including attack patterns, target industries, 
                and geographic distribution.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs font-hud font-bold text-cyan-400 uppercase tracking-wider mb-2">Key Features</h3>
                  <ul className="text-xs text-slate-400 space-y-1 font-medium">
                    <li>• Real-time attack monitoring</li>
                    <li>• Ransomware group tracking</li>
                    <li>• Target industry analysis</li>
                    <li>• Geographic threat distribution</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-hud font-bold text-cyan-400 uppercase tracking-wider mb-2">Data Sources</h3>
                  <ul className="text-xs text-slate-400 space-y-1 font-medium">
                    <li>• Dark web monitoring</li>
                    <li>• Victim leak sites</li>
                    <li>• Security research reports</li>
                    <li>• Threat intelligence feeds</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
