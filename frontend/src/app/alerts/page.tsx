'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import { AlertTriangle, Filter, Search, X, TrendingUp, Globe } from 'lucide-react'
import { alertsService } from '@/services/alerts.service'
import { domainService } from '@/services/domain.service'

export default function AlertsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [alerts, setAlerts] = useState<any[]>(() => alertsService.getCachedOrInitial())
  const [searchQuery, setSearchQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [selectedAlert, setSelectedAlert] = useState<any>(null)
  
  const [domainScanResult, setDomainScanResult] = useState<any>(null)
  const [loadingDomainScan, setLoadingDomainScan] = useState(false)
  const [domainScanError, setDomainScanError] = useState<string | null>(null)

  useEffect(() => {
    setDomainScanResult(null)
    setDomainScanError(null)
  }, [searchQuery])

  const cleanQuery = searchQuery.trim().toLowerCase()
  const isDomainSearch = searchQuery.trim().includes('.') && /^(https?:\/\/)?(www\.)?[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/.test(cleanQuery)

  const triggerDomainScan = async () => {
    if (!searchQuery.trim()) return
    setLoadingDomainScan(true)
    setDomainScanError(null)
    setDomainScanResult(null)
    try {
      const data = await domainService.scanDomain(searchQuery.trim())
      setDomainScanResult(data)
    } catch (err: any) {
      console.warn('Domain reputation check error:', err.message)
      setDomainScanError(err.response?.data?.detail || 'Failed to scan domain reputation.')
    } finally {
      setLoadingDomainScan(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    alertsService.getAlerts().then((data) => {
      if (isMounted && Array.isArray(data) && data.length > 0) {
        setAlerts(data)
      }
    }).catch((err) => {
      console.warn('Background alerts refresh notice:', err)
    })
    return () => {
      isMounted = false
    }
  }, [])

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alert.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter
    return matchesSearch && matchesSeverity
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'severity-critical bg-severity-critical/10 border-severity-critical/20'
      case 'HIGH': return 'severity-high bg-severity-high/10 border-severity-high/20'
      case 'MEDIUM': return 'severity-medium bg-severity-medium/10 border-severity-medium/20'
      case 'LOW': return 'severity-low bg-severity-low/10 border-severity-low/20'
      default: return 'text-secondary bg-secondary/10 border-secondary/20'
    }
  }

  const formatAlertTime = (time: string) => {
    if (!time || time === 'Unknown') return 'Unknown'
    if (time.toLowerCase().includes('ago')) return time
    
    try {
      const date = new Date(time)
      if (!isNaN(date.getTime())) {
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      }
      
      const cleanedTime = time.replace(/[^\d\-:T]/g, '').slice(0, 25)
      const cleanedDate = new Date(cleanedTime)
      if (!isNaN(cleanedDate.getTime())) {
        return cleanedDate.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      }
      return time
    } catch (error) {
      return time
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
              <h1 className="text-xl sm:text-2xl font-hud font-black text-white uppercase tracking-wider">SECURITY THREAT ALERTS</h1>
              <p className="text-slate-400 text-xs font-medium mt-0.5">Real-time triaged threat alarms, vulnerability exploits, and network incidents</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div 
                onClick={() => setSeverityFilter('all')}
                className={`bg-command-900/80 backdrop-blur-md border rounded-xl p-3.5 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 ${severityFilter === 'all' ? 'border-cyan-400 shadow-[0_0_16px_rgba(0,242,254,0.3)]' : 'border-cyan-500/25 hover:border-cyan-400'}`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <AlertTriangle className="w-4 h-4 text-cyan-400" />
                  <span className="text-[10px] font-hud font-black uppercase tracking-wider text-slate-400">Total Alerts</span>
                </div>
                <div className="text-2xl font-black text-white font-mono">{alerts.length}</div>
              </div>
              <div 
                onClick={() => setSeverityFilter('CRITICAL')}
                className={`bg-command-900/80 backdrop-blur-md border rounded-xl p-3.5 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 ${severityFilter === 'CRITICAL' ? 'border-rose-400 shadow-[0_0_16px_rgba(244,63,94,0.3)]' : 'border-cyan-500/25 hover:border-rose-400'}`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
                  <span className="text-[10px] font-hud font-black uppercase tracking-wider text-slate-400">Critical Alarms</span>
                </div>
                <div className="text-2xl font-black text-rose-400 font-mono">
                  {alerts.filter(a => a.severity === 'CRITICAL').length}
                </div>
              </div>
              <div 
                onClick={() => setSeverityFilter('HIGH')}
                className={`bg-command-900/80 backdrop-blur-md border rounded-xl p-3.5 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 ${severityFilter === 'HIGH' ? 'border-cyan-400 shadow-[0_0_16px_rgba(0,242,254,0.3)]' : 'border-cyan-500/25 hover:border-cyan-400'}`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span className="text-[10px] font-hud font-black uppercase tracking-wider text-slate-400">High Priority</span>
                </div>
                <div className="text-2xl font-black text-cyan-400 font-mono">
                  {alerts.filter(a => a.severity === 'HIGH').length}
                </div>
              </div>
              <div 
                onClick={() => { setSeverityFilter('all'); setSearchQuery(''); }}
                className={`bg-command-900/80 backdrop-blur-md border rounded-xl p-3.5 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 ${((severityFilter !== 'all' ? 1 : 0) + (searchQuery ? 1 : 0)) > 0 ? 'border-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.3)]' : 'border-cyan-500/25 hover:border-emerald-400'}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] font-hud font-black uppercase tracking-wider text-slate-400">Active Filters</span>
                  </div>
                  {((severityFilter !== 'all' ? 1 : 0) + (searchQuery ? 1 : 0)) > 0 && (
                    <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold animate-pulse border border-emerald-500/30">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-xl font-bold text-emerald-400 font-mono flex items-baseline justify-between mt-1">
                  <span>
                    {severityFilter === 'all' ? 'All' :
                     severityFilter === 'CRITICAL' ? 'Critical' :
                     severityFilter === 'HIGH' ? 'High' :
                     severityFilter === 'MEDIUM' ? 'Medium' : 'Low'}
                  </span>
                  <span className="text-[9px] text-slate-400 font-normal hover:text-emerald-400 transition-colors">
                    Reset
                  </span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-command-900/80 backdrop-blur-md border border-cyan-500/25 rounded-xl p-4 hover:border-cyan-500/40 transition-all duration-300">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search alerts by title, description or IOC..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-command-950 border border-cyan-500/25 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-cyan-400" />
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="bg-command-950 border border-cyan-500/25 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-400 font-mono"
                  >
                    <option value="all">All Severities</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Domain Reputation Scanner (Alerts Page inline version) */}
            {isDomainSearch && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-command-900/80 backdrop-blur-md border border-cyan-500/35 rounded-xl p-5 shadow-[0_0_20px_rgba(0,242,254,0.15)] transition-all duration-300"
              >
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-cyan-400 animate-pulse" />
                    <h3 className="text-sm font-hud font-bold text-white uppercase tracking-wider">Domain Reputation Intelligence</h3>
                  </div>
                  {!domainScanResult && !loadingDomainScan && (
                    <button
                      onClick={triggerDomainScan}
                      className="bg-gradient-to-r from-cyan-500 to-sky-400 text-black text-[10px] font-hud font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all shadow-[0_0_12px_rgba(0,242,254,0.4)]"
                    >
                      Scan Domain Risk
                    </button>
                  )}
                </div>

                {loadingDomainScan && (
                  <div className="flex items-center gap-2.5 text-xs text-slate-400 py-3 font-mono">
                    <span className="w-4 h-4 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
                    Querying reputation data from AlienVault OTX...
                  </div>
                )}

                {domainScanError && (
                  <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/25 rounded-lg p-2.5 font-mono">
                    {domainScanError}
                  </div>
                )}

                {domainScanResult && (
                  <div className="bg-command-950/70 border border-cyan-500/20 rounded-lg p-4 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-900/30 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-white font-mono">{domainScanResult.domain}</h4>
                        <span className={`text-[9px] font-hud font-bold uppercase px-2 py-0.5 rounded-full inline-block mt-1 ${
                          domainScanResult.risk_level === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                          domainScanResult.risk_level === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          domainScanResult.risk_level === 'MEDIUM' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                          'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {domainScanResult.risk_level} Severity
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-hud">Risk Score</span>
                          <span className={`text-lg font-black font-mono ${
                            domainScanResult.risk_score > 75 ? 'text-rose-400' :
                            domainScanResult.risk_score > 40 ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {domainScanResult.risk_score}/100
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <h5 className="font-hud font-bold text-cyan-400 uppercase tracking-wider mb-1">Mitigation Advice</h5>
                        <p className="text-slate-300 leading-relaxed bg-command-900/80 p-2.5 rounded border border-cyan-900/40">{domainScanResult.recommendation}</p>
                      </div>
                      <div>
                        <h5 className="font-hud font-bold text-cyan-400 uppercase tracking-wider mb-1">WHOIS Metadata</h5>
                        <p className="text-slate-300 leading-relaxed font-mono whitespace-pre-line bg-command-900/80 p-2.5 rounded border border-cyan-900/40 max-h-[60px] overflow-y-auto text-[11px]">
                          {domainScanResult.whois}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Alerts List */}
            <div className="space-y-3">
              {filteredAlerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => setSelectedAlert(alert)}
                  className="bg-command-900/80 backdrop-blur-md border border-cyan-500/25 rounded-xl p-4 hover:border-cyan-400 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-command-950 border border-cyan-500/20">
                        <AlertTriangle className={`w-5 h-5 ${
                          alert.severity === 'CRITICAL' ? 'text-rose-400' :
                          alert.severity === 'HIGH' ? 'text-amber-400' : 'text-cyan-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-sm font-hud font-bold text-white">{alert.title}</h3>
                          <span className={`text-[10px] font-hud font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            alert.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                            alert.severity === 'HIGH' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                            'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                          }`}>
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mb-2 leading-relaxed">{alert.description}</p>
                        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
                          <span>{formatAlertTime(alert.time)}</span>
                          {alert.source && <span>Source: {alert.source}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredAlerts.length === 0 && (
              <div className="text-center py-12 bg-command-900/80 border border-cyan-500/25 rounded-xl">
                <AlertTriangle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-sm font-mono text-slate-400">No alerts found matching your criteria</p>
              </div>
            )}

            {/* Alert Detail Modal */}
            {selectedAlert && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setSelectedAlert(null)}
                  className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />
                
                {/* Modal Content */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="relative w-full max-w-lg bg-command-950 border border-cyan-500/30 rounded-2xl shadow-2xl p-6 overflow-hidden z-10"
                >
                  <button 
                    onClick={() => setSelectedAlert(null)}
                    className="absolute right-4 top-4 p-1 rounded-lg hover:bg-command-900 transition-colors text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-command-900 border border-cyan-500/30 text-cyan-400">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <span className={`text-[10px] font-hud font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        selectedAlert.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                        selectedAlert.severity === 'HIGH' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                        'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      }`}>
                        {selectedAlert.severity}
                      </span>
                      <p className="text-xs font-mono text-slate-400 mt-1">{selectedAlert.time}</p>
                    </div>
                  </div>

                  <h2 className="text-base font-hud font-bold text-white mb-2">{selectedAlert.title}</h2>
                  
                  {selectedAlert.adversary && selectedAlert.adversary !== 'Unknown' && (
                    <div className="text-xs text-cyan-400 font-mono font-semibold mb-2 bg-cyan-950/60 border border-cyan-500/30 px-2 py-1 rounded inline-block">
                      Threat Actor: <span className="underline">{selectedAlert.adversary}</span>
                    </div>
                  )}

                  {selectedAlert.tags && selectedAlert.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {selectedAlert.tags.map((tag: string, i: number) => (
                        <span key={i} className="text-[10px] bg-command-900 border border-cyan-900/40 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-slate-300 mb-4 leading-relaxed bg-command-900/60 border border-cyan-900/30 rounded-lg p-3 max-h-[120px] overflow-y-auto">
                    {selectedAlert.description}
                  </p>

                  <div className="mt-5 flex justify-end gap-3">
                    <button 
                      onClick={() => setSelectedAlert(null)}
                      className="bg-gradient-to-r from-cyan-500 to-sky-400 text-black text-xs font-hud font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-all shadow-[0_0_14px_rgba(0,242,254,0.3)]"
                    >
                      Close Details
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
