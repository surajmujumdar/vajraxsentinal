'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import { TrendingUp, Globe, AlertTriangle, Target, MapPin } from 'lucide-react'

const INITIAL_GLOBAL_ATTACKS = [
  { id: 1, type: 'DDoS', target: 'Financial Services', country: 'USA', severity: 'Critical', time: '2 min ago', source: 'China' },
  { id: 2, type: 'Ransomware', target: 'Healthcare', country: 'UK', severity: 'Critical', time: '5 min ago', source: 'Russia' },
  { id: 3, type: 'Phishing', target: 'Government', country: 'Germany', severity: 'High', time: '8 min ago', source: 'North Korea' },
  { id: 4, type: 'Malware', target: 'Manufacturing', country: 'France', severity: 'High', time: '12 min ago', source: 'Iran' },
  { id: 5, type: 'SQL Injection', target: 'E-commerce', country: 'Canada', severity: 'Medium', time: '15 min ago', source: 'Brazil' },
  { id: 6, type: 'Zero-Day', target: 'Technology', country: 'India', severity: 'Critical', time: '18 min ago', source: 'Unknown' },
  { id: 7, type: 'Botnet', target: 'Energy', country: 'Australia', severity: 'High', time: '22 min ago', source: 'China' },
  { id: 8, type: 'APT', target: 'Defense', country: 'Japan', severity: 'Critical', time: '25 min ago', source: 'China' },
  { id: 9, type: 'Supply Chain', target: 'Software', country: 'South Korea', severity: 'High', time: '28 min ago', source: 'North Korea' },
  { id: 10, type: 'Insider Threat', target: 'Finance', country: 'Singapore', severity: 'Medium', time: '32 min ago', source: 'Internal' },
  { id: 11, type: 'Social Engineering', target: 'Healthcare', country: 'UAE', severity: 'High', time: '35 min ago', source: 'Unknown' },
  { id: 12, type: 'Ransomware', target: 'Education', country: 'South Africa', severity: 'Critical', time: '38 min ago', source: 'Russia' },
  { id: 13, type: 'Credential Stuffing', target: 'Retail', country: 'Mexico', severity: 'Medium', time: '42 min ago', source: 'Dark Web' },
  { id: 14, type: 'Man-in-the-Middle', target: 'Banking', country: 'Brazil', severity: 'High', time: '45 min ago', source: 'Brazil' },
  { id: 15, type: 'Cryptojacking', target: 'Cloud', country: 'Netherlands', severity: 'Medium', time: '48 min ago', source: 'Unknown' },
]

export default function GlobalAttacksPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [attacks, setAttacks] = useState<any[]>(INITIAL_GLOBAL_ATTACKS)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-danger bg-danger/10 border-danger/20'
      case 'High': return 'text-warning bg-warning/10 border-warning/20'
      case 'Medium': return 'text-primary bg-primary/10 border-primary/20'
      default: return 'text-secondary bg-secondary/10 border-secondary/20'
    }
  }

  return (
    <div className="flex min-h-screen bg-[#020617] text-white">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
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
              <h1 className="text-xl sm:text-2xl font-hud font-black text-white uppercase tracking-wider">GLOBAL ATTACKS TELEMETRY</h1>
              <p className="text-slate-400 text-xs font-medium mt-0.5">Live planetary distributed cyber attack monitoring, vectors, and geolocations</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-command-900/80 backdrop-blur-md border border-cyan-500/25 rounded-xl p-3.5 hover:border-rose-400 hover:shadow-[0_0_16px_rgba(244,63,94,0.25)] transition-all">
                <div className="flex items-center gap-2 mb-1.5">
                  <TrendingUp className="w-4 h-4 text-rose-400" />
                  <span className="text-[10px] font-hud font-black uppercase tracking-wider text-slate-400">Total Attacks</span>
                </div>
                <div className="text-2xl font-black text-rose-400 font-mono">1,247</div>
                <div className="text-[10px] font-bold text-rose-400 font-mono mt-0.5">↑ 18% vs yesterday</div>
              </div>
              <div className="bg-command-900/80 backdrop-blur-md border border-cyan-500/25 rounded-xl p-3.5 hover:border-cyan-400 hover:shadow-[0_0_16px_rgba(0,242,254,0.25)] transition-all">
                <div className="flex items-center gap-2 mb-1.5">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span className="text-[10px] font-hud font-black uppercase tracking-wider text-slate-400">Countries Impacted</span>
                </div>
                <div className="text-2xl font-black text-cyan-400 font-mono">87</div>
              </div>
              <div className="bg-command-900/80 backdrop-blur-md border border-cyan-500/25 rounded-xl p-3.5 hover:border-amber-400 hover:shadow-[0_0_16px_rgba(245,158,11,0.25)] transition-all">
                <div className="flex items-center gap-2 mb-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] font-hud font-black uppercase tracking-wider text-slate-400">Critical Vectors</span>
                </div>
                <div className="text-2xl font-black text-amber-400 font-mono">342</div>
              </div>
              <div className="bg-command-900/80 backdrop-blur-md border border-cyan-500/25 rounded-xl p-3.5 hover:border-emerald-400 hover:shadow-[0_0_16px_rgba(16,185,129,0.25)] transition-all">
                <div className="flex items-center gap-2 mb-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-hud font-black uppercase tracking-wider text-slate-400">Active Honeypots</span>
                </div>
                <div className="text-2xl font-black text-emerald-400 font-mono">2,890</div>
              </div>
            </div>

            {/* Live Attack Feed */}
            <div className="bg-command-900/80 backdrop-blur-md border border-cyan-500/25 rounded-xl p-4 sm:p-5 hover:border-cyan-500/40 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-hud font-black text-white uppercase tracking-wider">Live Attack Feed</h2>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                  <span className="text-xs font-hud font-bold text-cyan-400 tracking-wider">LIVE INTERCEPT</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {attacks.map((attack, index) => (
                  <motion.div
                    key={attack.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-center justify-between p-3 bg-command-950/70 rounded-lg border border-cyan-500/15 hover:border-cyan-400/50 transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-xs font-mono text-slate-300">{attack.country}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-hud font-bold text-white tracking-wide">{attack.type}</span>
                          <span className="text-xs text-slate-500">→</span>
                          <span className="text-xs text-slate-200 font-medium">{attack.target}</span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">Source: {attack.source}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-hud font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        attack.severity === 'Critical' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                        attack.severity === 'High' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                        'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      }`}>
                        {attack.severity}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">{attack.time}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Attack Types Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-command-900/80 backdrop-blur-md border border-cyan-500/25 rounded-xl p-4 sm:p-5 hover:border-cyan-500/40 transition-all duration-300">
                <h3 className="text-xs font-hud font-black text-white uppercase tracking-wider mb-4">Attack Types</h3>
                <div className="space-y-3">
                  {[
                    { type: 'DDoS', count: 342, percentage: 27 },
                    { type: 'Ransomware', count: 289, percentage: 23 },
                    { type: 'Phishing', count: 234, percentage: 19 },
                    { type: 'Malware', count: 178, percentage: 14 },
                    { type: 'Zero-Day', count: 89, percentage: 7 },
                    { type: 'Other', count: 115, percentage: 10 },
                  ].map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-300">{item.type}</span>
                        <span className="text-cyan-400 font-bold">{item.count} ({item.percentage}%)</span>
                      </div>
                      <div className="h-1.5 bg-command-950 rounded-full overflow-hidden border border-cyan-900/30">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 rounded-full shadow-[0_0_8px_rgba(0,242,254,0.4)]"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-command-900/80 backdrop-blur-md border border-cyan-500/25 rounded-xl p-4 sm:p-5 hover:border-cyan-500/40 transition-all duration-300">
                <h3 className="text-xs font-hud font-black text-white uppercase tracking-wider mb-4">Top Targeted Sectors</h3>
                <div className="space-y-2">
                  {[
                    { sector: 'Financial Services', count: 234 },
                    { sector: 'Healthcare', count: 189 },
                    { sector: 'Government', count: 167 },
                    { sector: 'Technology', count: 145 },
                    { sector: 'Manufacturing', count: 123 },
                    { sector: 'Education', count: 98 },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2.5 bg-command-950/70 border border-cyan-500/15 rounded-lg">
                      <span className="text-xs text-slate-300 font-medium">{item.sector}</span>
                      <span className="text-xs font-mono font-bold text-cyan-400">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
