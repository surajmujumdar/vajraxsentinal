'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import { 
  Database, Activity, Globe, Shield, TrendingUp, RefreshCw, 
  Search, ExternalLink, Zap, CheckCircle2, AlertCircle, 
  Clock, Server, Terminal, Filter, ArrowUpRight, Check, X
} from 'lucide-react'
import { dataSourcesService, DataSource, PingResult } from '@/services/dataSources.service'

const CATEGORIES = [
  'ALL',
  'Threat Intelligence',
  'Vulnerability DB',
  'Network & DNS',
  'Malware & Ransomware',
  'AI & News'
]

export default function DataSourcesPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(200)
  const [feeds, setFeeds] = useState<DataSource[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [selectedFeed, setSelectedFeed] = useState<DataSource | null>(null)
  const [pingingId, setPingingId] = useState<string | null>(null)
  const [pingResults, setPingResults] = useState<Record<string, PingResult>>({})

  const fetchFeeds = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setRefreshing(true)
    else setLoading(true)
    try {
      const data = await dataSourcesService.getDataSources()
      setFeeds(data)
    } catch (err) {
      console.error('Failed to load data sources:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchFeeds()
  }, [])

  const handlePing = async (sourceId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setPingingId(sourceId)
    try {
      const res = await dataSourcesService.pingDataSource(sourceId)
      setPingResults(prev => ({ ...prev, [sourceId]: res }))
      // Update local feed item latency
      setFeeds(prev => prev.map(f => f.id === sourceId ? { ...f, latency_ms: res.latency_ms, status: res.status } : f))
    } catch (err) {
      console.error('Ping failed:', err)
    } finally {
      setPingingId(null)
    }
  }

  const filteredFeeds = useMemo(() => {
    return feeds.filter(feed => {
      const matchesCategory = selectedCategory === 'ALL' || feed.category === selectedCategory
      const matchesSearch = 
        feed.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feed.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feed.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [feeds, selectedCategory, searchQuery])

  const totalDataPoints = useMemo(() => {
    return feeds.reduce((sum, f) => sum + (f.data_points || 0), 0)
  }, [feeds])

  const activeFeedsCount = useMemo(() => {
    return feeds.filter(f => f.status === 'Active').length
  }, [feeds])

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
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan-500/20 pb-5">
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-hud font-bold text-white text-glow-cyan tracking-tight">Threat Intelligence Feeds & Data Sources</h1>
                    <p className="text-sm text-slate-400 mt-0.5 font-mono">
                      Live integration registry monitoring real-time security telemetry, vulnerability feeds, and API collectors
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => fetchFeeds(true)}
                  disabled={refreshing || loading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-command-900 border border-cyan-500/30 hover:border-cyan-400 text-sm font-hud font-bold text-white transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
                  <span>{refreshing ? 'Refreshing...' : 'Refresh All'}</span>
                </button>
              </div>
            </div>

            {/* Metrics Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card border border-border/70 rounded-xl p-5 relative overflow-hidden group hover:border-primary/40 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Integrated Sources</span>
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Database className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-foreground">{feeds.length}</div>
                <p className="text-xs text-secondary mt-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>100% Operational Readiness</span>
                </p>
              </div>

              <div className="bg-card border border-border/70 rounded-xl p-5 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Active Live Feeds</span>
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-emerald-400">{activeFeedsCount} / {feeds.length}</div>
                <p className="text-xs text-secondary mt-1.5">
                  Continuous real-time polling
                </p>
              </div>

              <div className="bg-card border border-border/70 rounded-xl p-5 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Telemetry Volume</span>
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-cyan-400">{totalDataPoints.toLocaleString()}</div>
                <p className="text-xs text-secondary mt-1.5">
                  Indexed IOCs, CVEs & signatures
                </p>
              </div>

              <div className="bg-card border border-border/70 rounded-xl p-5 relative overflow-hidden group hover:border-violet-500/40 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Global Coverage</span>
                  <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                    <Globe className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-violet-400">180+</div>
                <p className="text-xs text-secondary mt-1.5">
                  Countries & autonomous systems
                </p>
              </div>
            </div>

            {/* Controls & Filter Bar */}
            <div className="bg-card border border-border/70 rounded-xl p-4 space-y-4">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, provider, or category..."
                    className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary text-foreground placeholder:text-secondary/60"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-foreground"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Showing Count */}
                <div className="text-xs text-secondary self-center">
                  Showing <span className="font-semibold text-foreground">{filteredFeeds.length}</span> of {feeds.length} sources
                </div>
              </div>

              {/* Category Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                <span className="text-xs font-semibold uppercase tracking-wider text-secondary mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" />
                  Filter:
                </span>
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all shrink-0 ${
                      selectedCategory === category
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-background border border-border text-secondary hover:text-foreground hover:border-primary/40'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Feeds Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-secondary">Checking live feed telemetry & connectivity...</p>
              </div>
            ) : filteredFeeds.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-12 text-center space-y-3">
                <Database className="w-10 h-10 text-secondary mx-auto opacity-50" />
                <h3 className="text-base font-semibold text-foreground">No data sources matched</h3>
                <p className="text-sm text-secondary">Try adjusting your category filter or search query</p>
                <button
                  onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); }}
                  className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-all"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFeeds.map((feed) => {
                  const pingInfo = pingResults[feed.id]
                  const isPinging = pingingId === feed.id

                  return (
                    <motion.div
                      key={feed.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.25 }}
                      onClick={() => setSelectedFeed(feed)}
                      className="bg-card border border-border/70 rounded-xl p-5 hover:border-primary/50 transition-all duration-200 hover:shadow-lg flex flex-col justify-between cursor-pointer group relative"
                    >
                      <div>
                        {/* Top Meta */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                              <Shield className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                                {feed.name}
                              </h3>
                              <span className="text-xs text-secondary">{feed.provider}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                                feed.status === 'Active'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${feed.status === 'Active' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                              {feed.status}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-secondary line-clamp-2 mb-4 leading-relaxed">
                          {feed.description}
                        </p>

                        {/* Stats Row */}
                        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-background border border-border/60 text-xs mb-4">
                          <div>
                            <span className="text-[10px] uppercase font-semibold text-secondary block">Data Points</span>
                            <span className="font-semibold text-foreground">{feed.data_points.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-semibold text-secondary block">Frequency</span>
                            <span className="font-medium text-foreground truncate block">{feed.update_frequency}</span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Actions */}
                      <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-secondary flex items-center gap-1">
                          <Clock className="w-3 h-3 text-secondary" />
                          {feed.latency_ms ? `${feed.latency_ms}ms response` : 'Live telemetry'}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handlePing(feed.id, e)}
                            disabled={isPinging}
                            className="px-2.5 py-1 text-xs rounded-md bg-primary/10 hover:bg-primary text-primary hover:text-white transition-all font-medium flex items-center gap-1 active:scale-95 disabled:opacity-50"
                            title="Ping real-time endpoint"
                          >
                            <Zap className={`w-3 h-3 ${isPinging ? 'animate-spin' : ''}`} />
                            <span>{isPinging ? 'Pinging...' : 'Ping'}</span>
                          </button>

                          </div>
                        </div>

                      {/* Ping Response Toast inside Card */}
                      {pingInfo && (
                        <div className={`mt-2.5 p-2 rounded-lg text-[11px] flex items-center justify-between ${
                          pingInfo.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          <span className="truncate">{pingInfo.message}</span>
                          <span className="font-semibold shrink-0 ml-2">{pingInfo.latency_ms}ms</span>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        </main>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedFeed && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{selectedFeed.name}</h2>
                    <span className="text-xs text-secondary">{selectedFeed.provider} • {selectedFeed.category}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFeed(null)}
                  className="p-1.5 rounded-lg text-secondary hover:text-foreground hover:bg-background transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-secondary leading-relaxed">
                {selectedFeed.description}
              </p>

              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-background border border-border text-xs">
                <div>
                  <span className="text-secondary block font-medium">Status</span>
                  <span className="font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {selectedFeed.status}
                  </span>
                </div>
                <div>
                  <span className="text-secondary block font-medium">Update Frequency</span>
                  <span className="font-semibold text-foreground mt-0.5 block">{selectedFeed.update_frequency}</span>
                </div>
                <div>
                  <span className="text-secondary block font-medium">Active Data Points</span>
                  <span className="font-semibold text-cyan-400 mt-0.5 block">{selectedFeed.data_points.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-secondary block font-medium">API Key Configured</span>
                  <span className="font-semibold text-foreground mt-0.5 block">
                    {selectedFeed.is_api_key_configured ? 'Verified & Active' : 'Public / Direct Connector'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => handlePing(selectedFeed.id)}
                  disabled={pingingId === selectedFeed.id}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <Zap className={`w-3.5 h-3.5 ${pingingId === selectedFeed.id ? 'animate-spin' : ''}`} />
                  <span>{pingingId === selectedFeed.id ? 'Testing Handshake...' : 'Run Connectivity Test'}</span>
                </button>

                <div className="px-4 py-2 rounded-lg bg-background border border-border text-xs font-mono text-secondary flex items-center gap-1.5">
                  <span>Feed Category: {selectedFeed.category || 'Security Telemetry'}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
