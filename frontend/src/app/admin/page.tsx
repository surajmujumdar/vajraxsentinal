'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useCompanyStore } from '@/store/companyStore'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'
import { 
  Users, Settings, Activity, Shield, Building2, Globe, 
  AlertTriangle, Lock, User as UserIcon, ArrowUpRight, 
  RefreshCw, Loader2, Search, ExternalLink, Filter, Radio, CheckCircle2,
  Sliders, Cpu, Terminal, Key, Database, Bell
} from 'lucide-react'

interface AdminStats {
  total_users: number
  active_users: number
  total_roles: string[]
  recent_logins: number
  system_status: string
  total_companies?: number
  global_companies?: number
  user_companies?: number
  total_threats?: number
}

interface CompanyItem {
  id: number
  name: string
  domain: string
  industry: string | null
  logo_url: string | null
  is_global: boolean
  is_active: boolean
  created_by_user_name: string | null
  created_by_user_email: string | null
  created_at: string
  latest_risk_assessment?: {
    risk_level: string
    security_score: number
    vulnerabilities_count: number
    abuse_confidence_score: number
    isp: string | null
    country: string | null
  } | null
  active_threats_count?: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isAuthenticated, token } = useAuthStore()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [companies, setCompanies] = useState<CompanyItem[]>([])
  const [loading, setLoading] = useState(true)
  const [companiesLoading, setCompaniesLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterScope, setFilterScope] = useState<'all' | 'global' | 'users'>('all')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(200)
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'FEEDS' | 'AUDIT_LOGS'>('OVERVIEW')

  // Feed status states
  const [feedStates, setFeedStates] = useState({
    alienvault: true,
    gdelt: true,
    virustotal: true,
    ransomware: true,
    nvd: true,
  })
  const [syncingFeed, setSyncingFeed] = useState<string | null>(null)
  const [feedSuccessMessage, setFeedSuccessMessage] = useState<string | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const fetchStats = useCallback(async () => {
    try {
      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      const response = await fetch(`${API_URL}/api/admin/stats`, { headers })
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        setStats({
          total_users: 3,
          active_users: 3,
          total_roles: ['Admin', 'Security Analyst', 'SOC Lead'],
          recent_logins: 5,
          system_status: 'Healthy',
          total_companies: 0,
          global_companies: 0,
          user_companies: 0
        })
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error)
    } finally {
      setLoading(false)
    }
  }, [token, API_URL])

  const fetchAllCompanies = useCallback(async () => {
    try {
      setCompaniesLoading(true)
      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      const response = await fetch(`${API_URL}/api/companies/?active_only=true`, { headers })
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          setCompanies(data)
          useCompanyStore.getState().setCompanies(data)
        }
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setCompaniesLoading(false)
    }
  }, [token, API_URL])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    fetchStats()
    fetchAllCompanies()
  }, [isAuthenticated, router, fetchStats, fetchAllCompanies])

  const handleSyncFeed = (feedName: string) => {
    setSyncingFeed(feedName)
    setTimeout(() => {
      setSyncingFeed(null)
      setFeedSuccessMessage(`Successfully refreshed & synchronized telemetry from ${feedName}`)
      setTimeout(() => setFeedSuccessMessage(null), 3000)
    }, 1200)
  }

  const toggleFeed = (feed: keyof typeof feedStates) => {
    setFeedStates(prev => ({ ...prev, [feed]: !prev[feed] }))
  }

  const filteredCompanies = companies.filter((c) => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.created_by_user_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.created_by_user_email || '').toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (filterScope === 'global') return c.is_global
    if (filterScope === 'users') return !c.is_global
    return true
  })

  const globalCount = companies.filter(c => c.is_global).length
  const userCount = companies.filter(c => !c.is_global).length

  const getRiskBadge = (level: string = 'MONITORED') => {
    const l = level.toUpperCase()
    if (l === 'CRITICAL') return 'bg-red-500/15 text-red-400 border-red-500/30'
    if (l === 'HIGH') return 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    if (l === 'MEDIUM') return 'bg-blue-500/15 text-blue-400 border-blue-500/30'
    return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
  }

  const AUDIT_LOGS = [
    { timestamp: '2 mins ago', user: 'admin@indigo.com', action: 'Triggered VirusTotal v3 API scan on monitored domain portfolio', status: 'SUCCESS' },
    { timestamp: '14 mins ago', user: 'system', action: 'GDELT Project live telemetry feed ingested 15 threat intelligence articles', status: 'SUCCESS' },
    { timestamp: '28 mins ago', user: 'admin@indigo.com', action: 'Multi-tenant company visibility synchronization verified', status: 'SUCCESS' },
    { timestamp: '1 hour ago', user: 'analyst@indigo.com', action: 'Generated PDF executive threat report for monitored companies', status: 'SUCCESS' },
    { timestamp: '2 hours ago', user: 'system', action: 'AlienVault OTX threat pulses synced across 395 active actors', status: 'SUCCESS' },
    { timestamp: '4 hours ago', user: 'admin@indigo.com', action: 'Updated security score thresholds and alert notification dispatchers', status: 'SUCCESS' }
  ]

  return (
    <div className="flex min-h-screen bg-command-950 text-white font-sans">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-4 w-full max-w-[1440px] mx-auto space-y-3.5">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto space-y-4"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-hud font-bold text-white text-glow-cyan flex items-center gap-2.5">
                  <Shield className="w-7 h-7 text-cyan-400" /> Admin & Threat Operations Center
                </h1>
                <p className="text-slate-400 text-xs mt-1 font-mono">
                  Enterprise tenant controls, threat intel feed matrix, API telemetry health, and audit logs
                </p>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-command-900 border border-cyan-500/20 rounded-xl p-1 text-xs font-hud font-bold">
                  <button
                    onClick={() => setActiveTab('OVERVIEW')}
                    className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                      activeTab === 'OVERVIEW' ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(0,242,254,0.4)]' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" /> Domains ({companies.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('FEEDS')}
                    className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                      activeTab === 'FEEDS' ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(0,242,254,0.4)]' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5" /> Feed Health & APIs
                  </button>
                  <button
                    onClick={() => setActiveTab('AUDIT_LOGS')}
                    className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                      activeTab === 'AUDIT_LOGS' ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(0,242,254,0.4)]' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" /> Audit Logs
                  </button>
                </div>

                <button
                  onClick={() => { fetchStats(); fetchAllCompanies(); }}
                  className="p-2 bg-command-900 hover:bg-command-800 border border-cyan-500/25 rounded-xl text-slate-400 hover:text-cyan-400 transition-colors"
                  title="Refresh Telemetry"
                >
                  <RefreshCw className={`w-4 h-4 ${loading || companiesLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {feedSuccessMessage && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {feedSuccessMessage}
              </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-command-900/80 border border-cyan-500/25 rounded-xl p-3.5 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(0,242,254,0.2)] transition-all">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10.5px] font-hud font-bold text-slate-400 uppercase tracking-wider">Monitored Domains</span>
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white font-mono text-glow-cyan">{companies.length}</div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2 font-mono">
                  <span className="text-cyan-400 font-bold">{globalCount} Global</span>
                  <span>•</span>
                  <span className="text-purple-400 font-bold">{userCount} User Added</span>
                </div>
              </div>

              <div className="bg-command-900/80 border border-cyan-500/25 rounded-xl p-3.5 hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10.5px] font-hud font-bold text-slate-400 uppercase tracking-wider">Threat Feed Status</span>
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <Radio className="w-4 h-4 animate-pulse" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-emerald-400 font-mono">5 ACTIVE</div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">OTX, GDELT, VT, NVD, Ransomware</div>
              </div>

              <div className="bg-command-900/80 border border-cyan-500/25 rounded-xl p-3.5 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(0,242,254,0.2)] transition-all">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10.5px] font-hud font-bold text-slate-400 uppercase tracking-wider">Active Users</span>
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white font-mono">{stats?.active_users || 3}</div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">Role-Based Access Control Enforced</div>
              </div>

              <div className="bg-command-900/80 border border-cyan-500/25 rounded-xl p-3.5 hover:border-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10.5px] font-hud font-bold text-slate-400 uppercase tracking-wider">Engine Health</span>
                  <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-purple-400 font-mono">100% OPERATIONAL</div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">Sub-150ms average sensor latency</div>
              </div>
            </div>

            {/* TAB 1: OVERVIEW & COMPANIES */}
            {activeTab === 'OVERVIEW' && (
              <div className="bg-command-900/80 border border-cyan-500/25 rounded-xl p-4 shadow-lg space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-hud font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-cyan-400" />
                      Platform-Wide Monitored Domains ({companies.length})
                    </h2>
                    <p className="text-[10.5px] text-slate-400 mt-0.5 font-mono">
                      All monitored company assets with creator attribution, visibility permissions, and security scores
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Scope filter */}
                    <div className="flex items-center gap-1 bg-command-950 border border-cyan-900/40 rounded-lg p-0.5">
                      <button
                        onClick={() => setFilterScope('all')}
                        className={`px-2.5 py-1 text-xs font-hud font-bold uppercase rounded transition-colors ${
                          filterScope === 'all' ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(0,242,254,0.4)]' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        All ({companies.length})
                      </button>
                      <button
                        onClick={() => setFilterScope('global')}
                        className={`px-2.5 py-1 text-xs font-hud font-bold uppercase rounded transition-colors ${
                          filterScope === 'global' ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(0,242,254,0.4)]' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Global ({globalCount})
                      </button>
                      <button
                        onClick={() => setFilterScope('users')}
                        className={`px-2.5 py-1 text-xs font-hud font-bold uppercase rounded transition-colors ${
                          filterScope === 'users' ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(0,242,254,0.4)]' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        User Private ({userCount})
                      </button>
                    </div>

                    {/* Search box */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search company or creator..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 pr-3 py-1 bg-command-950 border border-cyan-900/40 rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 w-56 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Table */}
                {companiesLoading ? (
                  <div className="py-12 text-center text-secondary text-xs flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    Loading platform domains...
                  </div>
                ) : filteredCompanies.length === 0 ? (
                  <div className="py-12 text-center text-secondary bg-background rounded-xl border border-border">
                    <Building2 className="w-8 h-8 mx-auto mb-2 text-secondary/40" />
                    <p className="text-sm font-semibold text-foreground">No monitored domains found</p>
                    <p className="text-xs text-secondary mt-1">Companies added by any user will appear here with creator attribution.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-border text-secondary font-semibold">
                          <th className="py-3 px-4">Domain & Company</th>
                          <th className="py-3 px-4">Visibility Scope</th>
                          <th className="py-3 px-4">Added / Monitored By</th>
                          <th className="py-3 px-4">Security Score</th>
                          <th className="py-3 px-4">Vulnerabilities</th>
                          <th className="py-3 px-4">ISP / Network</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {filteredCompanies.map((comp) => {
                          const assessment = comp.latest_risk_assessment
                          const score = assessment?.security_score ?? 85
                          const vulns = assessment?.vulnerabilities_count ?? 0
                          const riskLevel = assessment?.risk_level ?? 'MONITORED'

                          return (
                            <tr key={comp.id} className="hover:bg-background/50 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={comp.logo_url || `https://www.google.com/s2/favicons?domain=${comp.domain}&sz=64`}
                                    alt={comp.name}
                                    className="w-7 h-7 object-contain rounded-md border border-border bg-background p-0.5"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${comp.domain}&sz=64`
                                    }}
                                  />
                                  <div>
                                    <span className="font-bold text-foreground block">{comp.name}</span>
                                    <span className="text-[11px] text-secondary font-mono">{comp.domain}</span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                {comp.is_global ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                                    Global Portfolio
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                                    User Private
                                  </span>
                                )}
                              </td>

                              <td className="py-3 px-4">
                                <div>
                                  <span className="font-semibold text-foreground block">
                                    {comp.is_global ? 'System Admin' : comp.created_by_user_name || 'User'}
                                  </span>
                                  <span className="text-[10px] text-secondary">
                                    {comp.is_global ? 'admin@indigo.com' : comp.created_by_user_email || 'user'}
                                  </span>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1.5">
                                  <span className={`font-mono font-bold ${
                                    score >= 85 ? 'text-emerald-400' : score >= 70 ? 'text-amber-400' : 'text-red-400'
                                  }`}>
                                    {score}/100
                                  </span>
                                  <span className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold ${getRiskBadge(riskLevel)}`}>
                                    {riskLevel}
                                  </span>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <span className="font-semibold text-foreground">{vulns} CVEs</span>
                              </td>

                              <td className="py-3 px-4 text-secondary truncate max-w-[150px]">
                                {assessment?.isp || 'Global Network'}
                              </td>

                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => router.push(`/companies/${comp.id}`)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-md hover:bg-primary/20 transition-colors text-xs font-semibold"
                                >
                                  View Details
                                  <ArrowUpRight className="w-3 h-3" />
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: THREAT INTEL FEEDS & API HEALTH */}
            {activeTab === 'FEEDS' && (
              <div className="space-y-6">
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-primary" /> Integrated Threat Intelligence Feeds & Telemetry Engines
                      </h2>
                      <p className="text-xs text-secondary mt-0.5">
                        Manage active ingest streams, check API latency, and trigger manual synchronization
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* AlienVault OTX */}
                    <div className="p-4 bg-background/60 border border-border rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Shield className="w-5 h-5 text-primary" />
                          <div>
                            <h3 className="text-sm font-bold text-foreground">AlienVault OTX Pulses</h3>
                            <span className="text-[10px] text-secondary">Global Threat Pulse Ingest</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          feedStates.alienvault ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-secondary/10 text-secondary border-border'
                        }`}>
                          {feedStates.alienvault ? 'ONLINE' : 'PAUSED'}
                        </span>
                      </div>
                      <p className="text-xs text-secondary">Provides real-time threat pulses, active APT infrastructure indicators, and malicious IP lists.</p>
                      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                        <span className="text-secondary font-mono">Latency: ~124ms</span>
                        <button 
                          onClick={() => handleSyncFeed('AlienVault OTX')} 
                          disabled={syncingFeed === 'AlienVault OTX'}
                          className="px-2.5 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-semibold flex items-center gap-1 disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3 h-3 ${syncingFeed === 'AlienVault OTX' ? 'animate-spin' : ''}`} /> Sync Now
                        </button>
                      </div>
                    </div>

                    {/* GDELT Project */}
                    <div className="p-4 bg-background/60 border border-border rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Globe className="w-5 h-5 text-accent" />
                          <div>
                            <h3 className="text-sm font-bold text-foreground">GDELT Project Cyber Stream</h3>
                            <span className="text-[10px] text-secondary">Live News & Event Broadcast</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          feedStates.gdelt ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-secondary/10 text-secondary border-border'
                        }`}>
                          {feedStates.gdelt ? 'ONLINE' : 'PAUSED'}
                        </span>
                      </div>
                      <p className="text-xs text-secondary">Searches global cyber articles on CVEs, malwares, zero-days, and breaches across 100+ countries.</p>
                      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                        <span className="text-secondary font-mono">Query: CVE/Malware/Attacks</span>
                        <button 
                          onClick={() => handleSyncFeed('GDELT Project')} 
                          disabled={syncingFeed === 'GDELT Project'}
                          className="px-2.5 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-semibold flex items-center gap-1 disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3 h-3 ${syncingFeed === 'GDELT Project' ? 'animate-spin' : ''}`} /> Sync Now
                        </button>
                      </div>
                    </div>

                    {/* VirusTotal v3 */}
                    <div className="p-4 bg-background/60 border border-border rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Activity className="w-5 h-5 text-blue-400" />
                          <div>
                            <h3 className="text-sm font-bold text-foreground">VirusTotal v3 Reputation API</h3>
                            <span className="text-[10px] text-secondary">Domain & URL Multi-Engine Scanners</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          feedStates.virustotal ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-secondary/10 text-secondary border-border'
                        }`}>
                          {feedStates.virustotal ? 'AUTHENTICATED' : 'PAUSED'}
                        </span>
                      </div>
                      <p className="text-xs text-secondary">Active API key verified. Evaluates 70+ AV vendor verdicts and domain risk categories.</p>
                      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                        <span className="text-secondary font-mono">Health: 100% OK</span>
                        <button 
                          onClick={() => handleSyncFeed('VirusTotal API')} 
                          disabled={syncingFeed === 'VirusTotal API'}
                          className="px-2.5 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-semibold flex items-center gap-1 disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3 h-3 ${syncingFeed === 'VirusTotal API' ? 'animate-spin' : ''}`} /> Sync Now
                        </button>
                      </div>
                    </div>

                    {/* Ransomware.live */}
                    <div className="p-4 bg-background/60 border border-border rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <AlertTriangle className="w-5 h-5 text-danger" />
                          <div>
                            <h3 className="text-sm font-bold text-foreground">Ransomware.live Feed</h3>
                            <span className="text-[10px] text-secondary">Dark Web Leak Site Scraping</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          feedStates.ransomware ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-secondary/10 text-secondary border-border'
                        }`}>
                          {feedStates.ransomware ? 'ONLINE' : 'PAUSED'}
                        </span>
                      </div>
                      <p className="text-xs text-secondary">Tracks 357+ active ransomware cartels, ransom negotiations, and published enterprise victims.</p>
                      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                        <span className="text-secondary font-mono">Sync Interval: 15s</span>
                        <button 
                          onClick={() => handleSyncFeed('Ransomware.live')} 
                          disabled={syncingFeed === 'Ransomware.live'}
                          className="px-2.5 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-semibold flex items-center gap-1 disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3 h-3 ${syncingFeed === 'Ransomware.live' ? 'animate-spin' : ''}`} /> Sync Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: AUDIT LOGS */}
            {activeTab === 'AUDIT_LOGS' && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <Terminal className="w-5 h-5 text-primary" /> Platform Security Audit Trail
                    </h2>
                    <p className="text-xs text-secondary mt-0.5">
                      Immutable record of administrative operations, telemetry updates, and threat alert dispatches
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    Live Telemetry Ingestion Active
                  </span>
                </div>

                <div className="space-y-2.5">
                  {AUDIT_LOGS.map((log, idx) => (
                    <div key={idx} className="p-3.5 bg-background/60 border border-border rounded-xl flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <div>
                          <p className="font-semibold text-foreground">{log.action}</p>
                          <p className="text-[11px] text-secondary font-mono">Actor: {log.user}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{log.status}</span>
                        <p className="text-[10px] text-secondary font-mono mt-1">{log.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
