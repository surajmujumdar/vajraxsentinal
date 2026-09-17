'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Building2, 
  Search, 
  X, 
  Shield, 
  AlertTriangle, 
  Globe, 
  TrendingUp, 
  DollarSign, 
  Scale, 
  CheckCircle2, 
  Layers, 
  Bug, 
  Zap, 
  FileText, 
  Filter,
  Users,
  Compass,
  Briefcase
} from 'lucide-react'
import { industriesService, IndustryTarget, CaseStudy, DefenseControl } from '@/services/industries.service'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

type IndustryTab = 'OVERVIEW' | 'VECTORS' | 'CASES' | 'HARDENING' | 'REGULATORY'

export default function IndustriesPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [industries, setIndustries] = useState<IndustryTarget[]>(() => industriesService.getCachedOrInitial())
  const [searchQuery, setSearchQuery] = useState('')
  const [riskFilter, setRiskFilter] = useState<string>('ALL')
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryTarget | null>(null)
  const [activeTab, setActiveTab] = useState<IndustryTab>('OVERVIEW')

  useEffect(() => {
    let isMounted = true
    industriesService.getTargetedIndustries().then((data) => {
      if (isMounted && Array.isArray(data) && data.length > 0) {
        setIndustries(data)
      }
    }).catch((err) => {
      console.warn('Background industries refresh notice:', err)
    })
    return () => {
      isMounted = false
    }
  }, [])

  const getTrendColor = (trend: string = '') => {
    if (trend.includes('↑')) return 'text-[#ff1744] bg-red-950/50 border-red-500/50 shadow-[0_0_8px_rgba(255,23,68,0.3)]'
    if (trend.includes('↓')) return 'text-[#00ff88] bg-emerald-950/50 border-emerald-500/50'
    return 'text-zinc-400 bg-zinc-900 border-zinc-700'
  }

  const getRiskBadge = (level: string = 'HIGH') => {
    const l = level.toUpperCase()
    if (l === 'CRITICAL') return 'bg-red-950/70 text-[#ff1744] border-red-500/60 shadow-[0_0_12px_rgba(255,23,68,0.4)]'
    if (l === 'HIGH') return 'bg-orange-950/70 text-[#ff5722] border-orange-500/60 shadow-[0_0_10px_rgba(255,87,34,0.3)]'
    return 'bg-cyan-950/70 text-[#00f2fe] border-cyan-500/60'
  }

  const getPriorityColor = (priority: string = '') => {
    if (priority.includes('P0')) return 'bg-red-950/80 text-[#ff1744] border-red-500/60 shadow-[0_0_8px_rgba(255,23,68,0.4)]'
    if (priority.includes('P1')) return 'bg-orange-950/70 text-orange-400 border-orange-500/50'
    return 'bg-blue-950/60 text-blue-400 border-blue-500/40'
  }

  const filteredIndustries = useMemo(() => {
    return industries.filter((industry) => {
      const matchesSearch = 
        (industry.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (industry.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (industry.threat_landscape_analysis || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (industry.top_adversaries || []).some((a: string) => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (industry.primary_threat_vectors || []).some((v: string) => v.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (industry.common_cves || []).some((c: string) => c.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesRisk = riskFilter === 'ALL' || industry.risk_level.toUpperCase() === riskFilter.toUpperCase()

      return matchesSearch && matchesRisk
    })
  }, [industries, searchQuery, riskFilter])

  return (
    <div className="flex min-h-screen bg-[#020617] text-white">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-4 w-full max-w-[1440px] mx-auto space-y-4">
          
          {/* Header Banner */}
          <div className="bg-command-900/80 backdrop-blur-md border border-cyan-500/25 rounded-2xl p-4 sm:p-5 shadow-[0_0_25px_rgba(0,242,254,0.1)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-command-950 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_12px_rgba(0,242,254,0.25)]">
                  <Building2 className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-hud font-black text-white uppercase tracking-wider flex items-center gap-2">
                    MOST TARGETED INDUSTRY SECTORS
                  </h1>
                  <span className="text-[10px] font-mono text-slate-400">
                    Real-Time Sector Telemetry • Attack Vector Mechanics • Prioritized Hardening Checklists • Case Studies
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-command-950 border border-cyan-500/25 px-3.5 py-1.5 rounded-xl text-center">
                <span className="text-[9px] text-slate-400 uppercase font-hud font-black tracking-wider block">Monitored Sectors</span>
                <span className="text-base font-black text-white font-mono">{industries.length} Verticals</span>
              </div>
              <div className="bg-command-950 border border-rose-500/40 px-3.5 py-1.5 rounded-xl text-center shadow-[0_0_10px_rgba(244,63,94,0.2)]">
                <span className="text-[9px] text-rose-400 uppercase font-hud font-black tracking-wider block">Highest Targeted</span>
                <span className="text-base font-black text-rose-400 font-mono">Healthcare (28.5%)</span>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-command-900/80 backdrop-blur-md border border-cyan-500/25 p-3 rounded-xl">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sectors, attack vectors, top adversaries, or weaponized CVEs..."
                className="w-full pl-10 pr-4 py-2 bg-command-950 border border-cyan-500/25 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(0,242,254,0.3)] transition-all font-medium"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                <Filter className="w-3.5 h-3.5 text-cyan-400" /> Risk Level:
              </div>
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRiskFilter(r)}
                  className={`text-[10px] font-hud font-black uppercase px-2.5 py-1 rounded-lg border transition-all ${
                    riskFilter === r
                      ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_8px_rgba(0,242,254,0.4)]'
                      : 'bg-command-950 text-slate-400 border-cyan-900/40 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Targeted Industries Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredIndustries.map((industry, index) => {
              const attackPercentage = industry.attack_percentage || 18
              const adversaries = industry.top_adversaries || ['LockBit', 'APT29', 'Cl0p']
              const cves = industry.common_cves || []

              return (
                <motion.div
                  key={industry.id || index}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, delay: index * 0.02 }}
                  onClick={() => {
                    setSelectedIndustry(industry)
                    setActiveTab('OVERVIEW')
                  }}
                  className="bg-command-900/80 backdrop-blur-md border border-cyan-500/25 rounded-xl p-4 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(0,242,254,0.2)] transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-bl-full pointer-events-none" />

                  <div>
                    {/* Top Row: Icon + Name + Trend Badge */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-command-950 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(0,242,254,0.2)]">
                          <Building2 className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <h3 className="text-sm font-hud font-black text-white group-hover:text-cyan-400 transition-colors leading-tight">
                            {industry.name}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[8.5px] font-hud font-black uppercase px-2 py-0.5 rounded-full border font-mono ${getRiskBadge(industry.risk_level)}`}>
                              {industry.risk_level || 'HIGH'} RISK
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getTrendColor(industry.trend)}`}>
                        {industry.trend || '↑ 14%'}
                      </span>
                    </div>

                    {/* Summary snippet */}
                    <p className="text-xs text-slate-300 line-clamp-2 mb-3 leading-relaxed">
                      {industry.description || 'Targeted vertical experiencing elevated extortion and supply-chain compromise attempts.'}
                    </p>

                    {/* Metrics Matrix */}
                    <div className="space-y-1.5 pt-2.5 border-t border-cyan-900/30">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium text-[11px] flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-cyan-400" /> Attack Share
                        </span>
                        <span className="text-white font-mono font-black">{attackPercentage}% of global telemetry</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium text-[11px] flex items-center gap-1">
                          <Users className="w-3 h-3 text-cyan-400" /> Top Adversaries
                        </span>
                        <span className="text-cyan-400 font-mono text-[11px] truncate max-w-[170px]">
                          {adversaries.slice(0, 2).join(', ')}
                        </span>
                      </div>
                      {industry.downtime_cost_per_hour && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-medium text-[11px] flex items-center gap-1">
                            <DollarSign className="w-3 h-3 text-emerald-400" /> Downtime Impact
                          </span>
                          <span className="text-emerald-300 font-mono text-[10.5px] truncate max-w-[170px]">
                            {industry.downtime_cost_per_hour.split('(')[0].trim()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Weaponized CVEs preview */}
                    {cves.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-cyan-900/20 flex items-center gap-1.5 flex-wrap">
                        {cves.slice(0, 2).map((cve, cIdx) => (
                          <span key={cIdx} className="text-[8.5px] font-mono px-1.5 py-0.5 rounded bg-rose-950/40 text-rose-300 border border-rose-500/30">
                            {cve.split(' ')[0]}
                          </span>
                        ))}
                        {cves.length > 2 && (
                          <span className="text-[8.5px] font-mono text-slate-500">+{cves.length - 2} CVEs</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="mt-3 pt-2.5 border-t border-cyan-900/30 flex items-center justify-between text-[10.5px] text-slate-400">
                    <span className="truncate max-w-[180px]">Vector: <strong className="text-white font-mono">{industry.primary_vector || 'Double Extortion'}</strong></span>
                    <span className="text-cyan-400 font-hud font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Sector Matrix →
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </main>
      </div>

      {/* Comprehensive Sector Threat Matrix & Hardening Modal */}
      <AnimatePresence>
        {selectedIndustry && (
          <div 
            className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4" 
            onClick={() => setSelectedIndustry(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-command-950 border border-cyan-500/30 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-[0_10px_50px_rgba(0,0,0,0.95)] flex flex-col" 
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Sticky Header */}
              <div className="sticky top-0 bg-command-950/95 backdrop-blur-md border-b border-cyan-900/40 p-4 sm:p-5 flex items-start justify-between z-20">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-command-900 border border-cyan-500/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(0,242,254,0.3)]">
                    <Building2 className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-xl font-hud font-black text-white uppercase tracking-wider">{selectedIndustry.name}</h2>
                      <span className={`text-[9.5px] font-hud font-black uppercase px-2.5 py-0.5 rounded-full border font-mono ${getRiskBadge(selectedIndustry.risk_level)}`}>
                        {selectedIndustry.risk_level || 'CRITICAL'} RISK
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-xs font-mono text-slate-300">
                      <span>Global Telemetry: <strong className="text-cyan-400 font-black">{selectedIndustry.attack_percentage || 18}%</strong></span>
                      <span>•</span>
                      <span>Trend: <strong className="text-white">{selectedIndustry.trend || '↑ 14%'}</strong></span>
                      <span>•</span>
                      <span>Active Incidents: <strong className="text-cyan-300">{selectedIndustry.attack_count || 240}</strong></span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedIndustry(null)}
                  className="p-2 rounded-xl hover:bg-command-900 text-slate-400 hover:text-white border border-cyan-900/40 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sector Tabs Header */}
              <div className="flex items-center border-b border-cyan-900/40 bg-command-950 px-4 sm:px-6 overflow-x-auto gap-1">
                {[
                  { id: 'OVERVIEW', label: 'Landscape & Threat Dynamics', icon: Compass },
                  { id: 'VECTORS', label: 'Attack Vectors & CVEs', icon: Zap },
                  { id: 'CASES', label: 'Breach Case Studies', icon: FileText },
                  { id: 'HARDENING', label: 'Hardening Checklist', icon: Shield },
                  { id: 'REGULATORY', label: 'Compliance & Mandates', icon: Scale },
                ].map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as IndustryTab)}
                      className={`flex items-center gap-2 px-3.5 py-3 text-xs font-hud font-black uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
                        isActive
                          ? 'border-cyan-400 text-cyan-400 bg-cyan-950/30'
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              {/* Sector Modal Body */}
              <div className="p-5 sm:p-6 space-y-6 flex-1">
                
                {/* 1. OVERVIEW TAB */}
                {activeTab === 'OVERVIEW' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                    {/* Metrics Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-command-900/80 border border-cyan-500/25 rounded-xl p-3">
                        <span className="text-[10px] text-slate-400 font-hud font-black uppercase">Primary Ingress Vector</span>
                        <p className="text-xs font-bold text-white font-mono mt-0.5 truncate">
                          {selectedIndustry.primary_vector || 'Double Extortion'}
                        </p>
                      </div>
                      <div className="bg-command-900/80 border border-cyan-500/25 rounded-xl p-3">
                        <span className="text-[10px] text-slate-400 font-hud font-black uppercase">Active Campaigns</span>
                        <p className="text-sm font-bold text-cyan-400 font-mono mt-0.5">
                          {selectedIndustry.campaigns_count || 24} Major Operations
                        </p>
                      </div>
                      <div className="bg-command-900/80 border border-cyan-500/25 rounded-xl p-3">
                        <span className="text-[10px] text-slate-400 font-hud font-black uppercase">Telemetry Volume</span>
                        <p className="text-sm font-black text-white font-mono mt-0.5">
                          {selectedIndustry.attack_percentage || 18}% Global Share
                        </p>
                      </div>
                      <div className="bg-command-900/80 border border-cyan-500/25 rounded-xl p-3">
                        <span className="text-[10px] text-slate-400 font-hud font-black uppercase">Attack Growth Trend</span>
                        <p className="text-sm font-black text-rose-400 font-mono mt-0.5">
                          {selectedIndustry.trend || '↑ 14% YoY'}
                        </p>
                      </div>
                    </div>

                    {/* Sector Profile & Why Targeted */}
                    <div>
                      <h3 className="text-xs font-hud font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-cyan-400" /> Executive Sector Threat Profile
                      </h3>
                      <div className="bg-command-900/80 border border-cyan-500/25 rounded-xl p-4 text-xs text-slate-200 leading-relaxed">
                        {selectedIndustry.description}
                      </div>
                    </div>

                    {/* Deep Threat Landscape Analysis */}
                    {selectedIndustry.threat_landscape_analysis && (
                      <div>
                        <h3 className="text-xs font-hud font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                          <Compass className="w-4 h-4 text-cyan-400" /> In-Depth Threat Landscape & Attack Dynamics
                        </h3>
                        <div className="bg-command-900/80 border border-cyan-500/25 rounded-xl p-4 text-xs text-slate-300 leading-relaxed font-medium">
                          {selectedIndustry.threat_landscape_analysis}
                        </div>
                      </div>
                    )}

                    {/* Downtime Financial Impact */}
                    {selectedIndustry.downtime_cost_per_hour && (
                      <div>
                        <h3 className="text-xs font-hud font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-emerald-400" /> Financial Impact & Operational Downtime Cost
                        </h3>
                        <div className="bg-command-900/80 border border-emerald-500/30 rounded-xl p-4 text-xs text-emerald-200 font-mono">
                          {selectedIndustry.downtime_cost_per_hour}
                        </div>
                      </div>
                    )}

                    {/* Top Adversaries Active in Sector */}
                    <div>
                      <h3 className="text-xs font-hud font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-amber-400" /> Prominent Threat Actors Targeting This Vertical
                      </h3>
                      <div className="flex flex-wrap gap-2 bg-command-900/80 border border-cyan-500/25 p-3.5 rounded-xl">
                        {(selectedIndustry.top_adversaries || []).map((adv, i) => (
                          <span key={i} className="text-xs font-mono font-bold px-3 py-1 bg-rose-950/40 text-rose-300 border border-rose-500/40 rounded-lg">
                            {adv}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 2. ATTACK VECTORS & CVEs TAB */}
                {activeTab === 'VECTORS' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                    {/* Primary Vectors List */}
                    <div>
                      <h3 className="text-xs font-hud font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-cyan-400" /> Primary Sector Attack Vectors & Ingress Mechanics
                      </h3>
                      <p className="text-xs text-slate-400 mb-3">
                        Most common attack pathways observed by defensive sensors across this industry.
                      </p>
                      <div className="space-y-2.5">
                        {(selectedIndustry.primary_threat_vectors || [
                          'Double Extortion Ransomware',
                          'Spear-Phishing of Key Executives',
                          'Supply Chain Compromise'
                        ]).map((vec, i) => (
                          <div key={i} className="bg-command-900/80 border border-cyan-500/25 rounded-xl p-3.5 flex items-center gap-3 hover:border-cyan-400 transition-colors">
                            <span className="w-6 h-6 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-mono text-xs font-black flex-shrink-0">
                              0{i + 1}
                            </span>
                            <span className="text-xs text-slate-200 font-bold">{vec}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Common CVEs Weaponized in this Sector */}
                    <div>
                      <h3 className="text-xs font-hud font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                        <Bug className="w-4 h-4 text-cyan-400" /> Frequently Exploited Common Vulnerabilities (CVEs)
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {(selectedIndustry.common_cves || []).map((cve, i) => (
                          <div key={i} className="bg-command-900/80 border border-rose-500/30 rounded-xl p-3 flex items-center justify-between gap-2 shadow-[0_0_10px_rgba(244,63,94,0.15)]">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_6px_#f43f5e]" />
                              <span className="text-xs font-mono font-black text-rose-200">{cve}</span>
                            </div>
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-500/40">
                              HIGH EPSS
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Impact Summary */}
                    <div>
                      <h3 className="text-xs font-hud font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-400" /> Cumulative Breach Impact Assessment
                      </h3>
                      <div className="bg-command-900/80 border border-cyan-500/25 rounded-xl p-4 text-xs text-amber-200/90 leading-relaxed">
                        {selectedIndustry.impact_summary}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 3. CASE STUDIES TAB */}
                {activeTab === 'CASES' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div>
                      <h3 className="text-xs font-hud font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-cyan-400" /> Real-World Breach Case Studies & Root-Cause Failure Analyses
                      </h3>
                      <p className="text-xs text-slate-400 mb-3">
                        Historical incidents within this industry detailing attack chains, operational impact, and root-cause vulnerabilities.
                      </p>
                    </div>

                    {selectedIndustry.real_world_case_studies && selectedIndustry.real_world_case_studies.length > 0 ? (
                      <div className="space-y-3">
                        {selectedIndustry.real_world_case_studies.map((cs: CaseStudy, i: number) => (
                          <div key={i} className="bg-command-900/80 border border-cyan-500/25 rounded-xl p-4 hover:border-cyan-400 transition-colors space-y-2">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div>
                                <h4 className="text-xs font-hud font-black text-white">{cs.title}</h4>
                                <span className="text-[11px] font-mono text-cyan-400 font-bold">Victim: {cs.victim}</span>
                              </div>
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-950/70 text-rose-400 border border-rose-500/40">
                                YEAR: {cs.year}
                              </span>
                            </div>
                            <div className="text-xs text-slate-300">
                              <strong className="text-slate-400">Impact:</strong> {cs.impact}
                            </div>
                            <div className="text-xs text-slate-400 font-mono bg-command-950 p-2.5 rounded border border-cyan-900/30">
                              <strong className="text-amber-400 font-mono">Root Cause:</strong> {cs.root_cause}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-command-900/80 border border-cyan-500/25 rounded-xl p-4 text-xs text-slate-300">
                        Detailed case studies are aggregated continuously from threat intelligence feeds.
                      </div>
                    )}
                  </motion.div>
                )}

                {/* 4. HARDENING CHECKLIST TAB */}
                {activeTab === 'HARDENING' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div>
                      <h3 className="text-xs font-hud font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-emerald-400" /> Prioritized Defense Hardening Checklist
                      </h3>
                      <p className="text-xs text-slate-400 mb-3">
                        Actionable security engineering controls categorized by deployment priority and technical rationale.
                      </p>
                    </div>

                    {selectedIndustry.defense_hardening_checklist && selectedIndustry.defense_hardening_checklist.length > 0 ? (
                      <div className="space-y-3">
                        {selectedIndustry.defense_hardening_checklist.map((item: DefenseControl, i: number) => (
                          <div key={i} className="bg-command-900/80 border border-cyan-500/25 rounded-xl p-4 hover:border-emerald-500/40 transition-colors space-y-2">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className={`text-[9.5px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full border ${getPriorityColor(item.priority)}`}>
                                {item.priority}
                              </span>
                            </div>
                            <p className="text-xs text-white font-bold leading-relaxed">
                              {item.control}
                            </p>
                            <p className="text-xs text-slate-400 font-mono bg-command-950 p-2 rounded border border-cyan-900/30">
                              <strong className="text-emerald-400 font-mono">Rationale:</strong> {item.rationale}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {(selectedIndustry.recommended_defenses || []).map((def, i) => (
                          <div key={i} className="bg-command-900/80 border border-cyan-500/25 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-emerald-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>{def}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* 5. REGULATORY TAB */}
                {activeTab === 'REGULATORY' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                    <div>
                      <h3 className="text-xs font-hud font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                        <Scale className="w-4 h-4 text-cyan-400" /> Applicable Regulatory & Compliance Frameworks
                      </h3>
                      <p className="text-xs text-slate-400 mb-3">
                        Industry-specific regulatory mandates, security performance goals, and audit compliance requirements.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(selectedIndustry.regulatory_frameworks || ['ISO/IEC 27001', 'NIST CSF', 'NIS2 Directive', 'GDPR']).map((reg, i) => (
                        <div key={i} className="bg-command-900/80 border border-cyan-500/25 rounded-xl p-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-cyan-950/50 border border-cyan-500/40 flex items-center justify-center flex-shrink-0">
                            <Scale className="w-4 h-4 text-cyan-400" />
                          </div>
                          <div>
                            <span className="text-xs font-mono font-black text-white">{reg}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Mandatory Compliance Baseline</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-command-900/80 border border-cyan-500/25 rounded-xl p-4 text-xs text-slate-300 leading-relaxed">
                      <strong className="text-white block mb-1">Non-Compliance & Liability Exposure:</strong>
                      Organizations operating within this sector face immediate regulatory scrutiny, potential operating license suspensions, and multi-million dollar fines following any unmitigated breaches involving consumer or operational data.
                    </div>
                  </motion.div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
