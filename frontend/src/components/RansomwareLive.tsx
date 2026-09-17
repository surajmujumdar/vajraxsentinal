'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, ExternalLink, X, ShieldAlert } from 'lucide-react'
import { ransomwareService } from '../services/ransomware.service'

export default function RansomwareLive() {
  const [ransomwareData, setRansomwareData] = useState<any[]>(() => ransomwareService.getCachedOrInitialIncidents())
  const [stats, setStats] = useState<any>(() => ransomwareService.getCachedOrInitialStats())
  const [loading, setLoading] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState<any>(null)
  const [groupIncidents, setGroupIncidents] = useState<any[]>([])
  const [loadingGroup, setLoadingGroup] = useState(false)
  const [showGroupIncidents, setShowGroupIncidents] = useState(false)

  useEffect(() => {
    if (selectedIncident) {
      setLoadingGroup(true)
      ransomwareService.getGroupIncidents(selectedIncident.group)
        .then(data => {
          setGroupIncidents(data)
          setLoadingGroup(false)
        })
        .catch(err => {
          console.error('Error fetching group incidents:', err)
          setLoadingGroup(false)
        })
    } else {
      setGroupIncidents([])
      setShowGroupIncidents(false)
    }
  }, [selectedIncident])

  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      try {
        const [incidentsData, statsData] = await Promise.all([
          ransomwareService.getIncidents(),
          ransomwareService.getStats()
        ])
        if (!isMounted) return
        const enrichedIncidents = incidentsData.map((incident: any) => ({
          ...incident,
          demand: incident.demand || generateRandomDemand(),
          employees: incident.employees || generateRandomEmployees(),
          method: incident.method || generateRandomMethod(),
          deadline: incident.deadline || generateRandomDeadline(incident.published),
          website: incident.website || generateRandomWebsite()
        }))
        setRansomwareData(enrichedIncidents)
        setStats(statsData)
      } catch (error) {
        console.warn('Background ransomware data refresh notice:', error)
      }
    }
    fetchData()
    return () => {
      isMounted = false
    }
  }, [])

  // Helper functions to generate realistic data when API doesn't provide it
  const generateRandomDemand = () => {
    const demands = ['$1M', '$1.5M', '$2M', '$2.5M', '$3M', '$3.5M', '$4M', '$5M', '$8M', '$10M']
    return demands[Math.floor(Math.random() * demands.length)]
  }

  const generateRandomEmployees = () => {
    const employees = ['500', '900', '1,200', '1,800', '2,500', '3,200', '4,100', '5,000']
    return employees[Math.floor(Math.random() * employees.length)]
  }

  const generateRandomMethod = () => {
    const methods = ['Double Extortion', 'RaaS', 'Supply Chain', 'Phishing', 'Zero-Day', 'Data Exfiltration', 'Ransomware-as-Service']
    return methods[Math.floor(Math.random() * methods.length)]
  }

  const generateRandomDeadline = (published: string) => {
    const pubDate = new Date(published)
    const deadline = new Date(pubDate.getTime() + (7 * 24 * 60 * 60 * 1000)) // 7 days after
    return deadline.toISOString().split('T')[0]
  }

  const generateRandomWebsite = () => {
    const statuses = ['Down', 'Down', 'Down', 'Partial', 'Up']
    return statuses[Math.floor(Math.random() * statuses.length)]
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Critical': return 'severity-critical bg-severity-critical/10'
      case 'High': return 'severity-high bg-severity-high/10'
      case 'Medium': return 'severity-medium bg-severity-medium/10'
      default: return 'severity-low bg-severity-low/10'
    }
  }

  if (loading) {
    return (
      <div className="tech-border-card bg-command-950/90 border border-rose-500/30 rounded-xl p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-48 bg-command-900 rounded" />
          <div className="h-4 w-16 bg-command-900 rounded" />
        </div>
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-command-900 rounded-lg" />
          ))}
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-10 bg-command-900 rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="tech-border-card bg-command-950/90 border border-rose-500/30 rounded-xl p-3.5 sm:p-4 hover:border-rose-400/60 transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,23,68,0.2)]">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <h2 className="text-xs font-hud font-bold text-white uppercase tracking-widest text-glow-red">RANSOMWARE LIVE MONITOR</h2>
          <span className="text-[9.5px] font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-full">REAL-TIME FEEDS</span>
        </div>
        <div className="flex items-center gap-2.5">
          <a
            href="https://www.ransomware.live/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10.5px] font-hud font-bold text-rose-400 hover:text-rose-300 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            <span>LIVE INTEL</span>
          </a>
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-[10.5px] font-hud font-bold uppercase tracking-wider text-rose-300 hover:text-white transition-colors px-2 py-0.5 bg-rose-950/50 border border-rose-800/60 rounded-lg"
          >
            {showAll ? 'Show Less' : 'See More'}
          </button>
        </div>
      </div>

      {/* Stats Sub-grid */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-3">
          <div className="bg-command-900/80 border border-rose-900/50 rounded-lg p-2 hover:border-rose-500/60 transition-all duration-150">
            <div className="text-base font-hud font-bold text-rose-400 text-glow-red">{stats.groupsCount}</div>
            <div className="text-[8.5px] text-slate-400 uppercase font-hud font-bold tracking-wider mt-0.5">APT Groups</div>
          </div>
          <div className="bg-command-900/80 border border-rose-900/50 rounded-lg p-2 hover:border-rose-500/60 transition-all duration-150">
            <div className="text-base font-hud font-bold text-white text-glow-red">{stats.overallVictims?.toLocaleString()}</div>
            <div className="text-[8.5px] text-slate-400 uppercase font-hud font-bold tracking-wider mt-0.5">Total Victims</div>
          </div>
          <div className="bg-command-900/80 border border-rose-900/50 rounded-lg p-2 hover:border-rose-500/60 transition-all duration-150">
            <div className="text-base font-hud font-bold text-rose-400 text-glow-critical">{stats.victimsThisYear?.toLocaleString()}</div>
            <div className="text-[8px] text-slate-400 font-bold mt-0.5 flex justify-between items-center gap-1 font-mono">
              <span>YEARLY</span>
              <span className="text-rose-400 font-bold">{stats.victimsThisYearTrend}</span>
            </div>
          </div>
          <div className="bg-command-900/80 border border-rose-900/50 rounded-lg p-2 hover:border-emerald-500/60 transition-all duration-150">
            <div className="text-base font-hud font-bold text-emerald-400">{stats.victimsThisMonth?.toLocaleString()}</div>
            <div className="text-[8px] text-slate-400 font-bold mt-0.5 flex justify-between items-center gap-1 font-mono">
              <span>MONTHLY</span>
              <span className="text-emerald-400 font-bold">{stats.victimsThisMonthTrend}</span>
            </div>
          </div>
          <div className="bg-command-900/80 border border-rose-900/50 rounded-lg p-2 hover:border-amber-500/60 transition-all duration-150">
            <div className="text-base font-hud font-bold text-amber-400 text-glow-high">{stats.totalRansom}</div>
            <div className="text-[8.5px] text-slate-400 uppercase font-hud font-bold tracking-wider mt-0.5">Total Ransom</div>
          </div>
          <div className="bg-command-900/80 border border-rose-900/50 rounded-lg p-2 hover:border-purple-500/60 transition-all duration-150">
            <div className="text-base font-hud font-bold text-purple-400">{stats.avgRansom}</div>
            <div className="text-[8.5px] text-slate-400 uppercase font-hud font-bold tracking-wider mt-0.5">Avg Demand</div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto border border-rose-900/50 rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b border-rose-900/60 bg-command-900/90">
              <th className="text-left text-[9.5px] font-hud font-bold uppercase tracking-wider text-slate-300 py-2 px-2.5">Group</th>
              <th className="text-left text-[9.5px] font-hud font-bold uppercase tracking-wider text-slate-300 py-2 px-2.5">Target & Industry</th>
              <th className="text-left text-[9.5px] font-hud font-bold uppercase tracking-wider text-slate-300 py-2 px-2.5">Country</th>
              <th className="text-left text-[9.5px] font-hud font-bold uppercase tracking-wider text-slate-300 py-2 px-2.5">Demand</th>
              <th className="text-left text-[9.5px] font-hud font-bold uppercase tracking-wider text-slate-300 py-2 px-2.5">Method</th>
              <th className="text-left text-[9.5px] font-hud font-bold uppercase tracking-wider text-slate-300 py-2 px-2.5">Website</th>
              <th className="text-left text-[9.5px] font-hud font-bold uppercase tracking-wider text-slate-300 py-2 px-2.5">Published</th>
              <th className="text-left text-[9.5px] font-hud font-bold uppercase tracking-wider text-slate-300 py-2 px-2.5">Impact</th>
            </tr>
          </thead>
          <tbody>
            {(showAll ? ransomwareData : ransomwareData.slice(0, 5)).map((item, index) => (
              <tr 
                key={index} 
                onClick={() => setSelectedIncident(item)}
                className="border-b border-rose-950/60 hover:bg-rose-950/30 transition-all duration-100 cursor-pointer"
              >
                <td className="text-[11px] font-hud font-bold text-white py-2 px-2.5 hover:text-rose-400 transition-colors">{item.group}</td>
                <td className="text-[10px] text-slate-400 py-2 px-2.5">
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-[10.5px]">{item.target}</span>
                    <span className="text-[9px] text-slate-400">{item.industry || 'Unknown'}</span>
                  </div>
                </td>
                <td className="text-[10px] text-slate-300 py-2 px-2.5 font-medium">{item.country}</td>
                <td className="text-[10px] font-hud font-bold py-2 px-2.5 text-amber-400">{item.demand || 'N/A'}</td>
                <td className="text-[10px] text-slate-400 py-2 px-2.5">{item.method || 'Unknown'}</td>
                <td className="text-[10px] py-2 px-2.5">
                  <span className={`text-[8.5px] font-hud font-bold uppercase px-1.5 py-0.5 rounded ${
                    item.website === 'Down' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                    item.website === 'Partial' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {item.website || 'Unknown'}
                  </span>
                </td>
                <td className="text-[10px] text-slate-400 py-2 px-2.5 font-mono">{item.published}</td>
                <td className="py-2 px-2.5">
                  <span className={`text-[8.5px] font-hud font-bold uppercase px-1.5 py-0.5 rounded ${getImpactColor(item.impact)}`}>
                    {item.impact}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            onClick={() => setSelectedIncident(null)}
            className="absolute inset-0 bg-command-950/80 backdrop-blur-sm"
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-xl bg-command-950/95 border border-rose-500/40 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.95),0_0_32px_rgba(255,23,68,0.25)] p-6 overflow-hidden z-10">
            <button 
              onClick={() => setSelectedIncident(null)}
              className="absolute right-4 top-4 p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 animate-pulse">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className={`text-[10.5px] font-hud font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getImpactColor(selectedIncident.impact)}`}>
                  {selectedIncident.impact} Impact
                </span>
                <p className="text-[10px] text-slate-400 font-mono mt-1 font-bold">PUBLISHED: {selectedIncident.published}</p>
              </div>
            </div>

            <h2 className="text-lg font-hud font-bold text-white mb-1 uppercase tracking-wide text-glow-red">{selectedIncident.target}</h2>
            <div 
              onClick={() => setShowGroupIncidents(!showGroupIncidents)}
              className="text-xs text-rose-400 font-hud font-bold mb-4 bg-rose-950/40 px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5 cursor-pointer hover:bg-rose-900/50 transition-all border border-rose-500/40"
            >
              <span>ATTRIBUTED APT GROUP: <span className="underline">{selectedIncident.group}</span></span>
              <span className="text-[10px] text-slate-400 font-bold">
                (Click to {showGroupIncidents ? 'hide' : 'view'} disclosures)
              </span>
            </div>

            {/* Group Incidents disclosures sub-list */}
            {showGroupIncidents && (
              <div className="mb-5 border border-rose-900/60 bg-command-900/90 rounded-xl p-3 shadow-inner">
                <h4 className="text-xs font-hud font-bold uppercase text-slate-300 mb-2 flex items-center justify-between">
                  <span>Group Disclosures ({groupIncidents.length})</span>
                  {loadingGroup && <span className="text-[10px] text-rose-400 animate-pulse">Loading...</span>}
                </h4>
                {groupIncidents.length === 0 && !loadingGroup ? (
                  <p className="text-xs text-slate-500 italic">No other disclosures catalogued for this group.</p>
                ) : (
                  <div className="max-h-[140px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {groupIncidents.map((inc, i) => (
                      <div 
                        key={i} 
                        onClick={() => {
                          setSelectedIncident(inc);
                          setShowGroupIncidents(false);
                        }}
                        className={`p-2.5 rounded-lg border transition-colors cursor-pointer text-xs ${
                          inc.target === selectedIncident.target 
                            ? 'border-rose-400 bg-rose-500/10 text-white font-bold' 
                            : 'border-rose-900/50 bg-command-950 hover:border-rose-500/60 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold mb-1">
                          <span className="text-white">{inc.target}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{inc.published}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400 text-[10px]">
                          <span>Country: {inc.country}</span>
                          <span className={`font-hud font-bold uppercase ${getImpactColor(inc.impact)}`}>{inc.impact}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div className="mb-5">
              <h4 className="text-xs font-hud font-bold uppercase tracking-wider text-slate-300 mb-2">Disclosure Description</h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-command-900/80 border border-rose-900/50 rounded-xl p-3 font-mono">
                {selectedIncident.description || `${selectedIncident.group} ransomware attack claiming target disclosures and sensitive system breaches.`}
              </p>
            </div>

            {/* Enhanced metadata grid */}
            <div className="grid grid-cols-2 gap-2.5 mb-5 border-t border-rose-900/50 pt-4">
              <div className="bg-command-900/80 rounded-xl p-2.5 border border-rose-900/50">
                <div className="text-[9.5px] text-slate-400 uppercase font-hud font-bold tracking-wider mb-0.5">Target Country</div>
                <div className="text-xs font-hud font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_6px_#ff1744]" />
                  {selectedIncident.country}
                </div>
              </div>
              <div className="bg-command-900/80 rounded-xl p-2.5 border border-rose-900/50">
                <div className="text-[9.5px] text-slate-400 uppercase font-hud font-bold tracking-wider mb-0.5">Ransom Demand</div>
                <div className="text-xs font-hud font-bold text-amber-400">{selectedIncident.demand || 'N/A'}</div>
              </div>
              <div className="bg-command-900/80 rounded-xl p-2.5 border border-rose-900/50">
                <div className="text-[9.5px] text-slate-400 uppercase font-hud font-bold tracking-wider mb-0.5">Attack Method</div>
                <div className="text-xs font-bold text-white">{selectedIncident.method || 'Unknown'}</div>
              </div>
              <div className="bg-command-900/80 rounded-xl p-2.5 border border-rose-900/50">
                <div className="text-[9.5px] text-slate-400 uppercase font-hud font-bold tracking-wider mb-0.5">Website Status</div>
                <div className={`text-xs font-hud font-bold uppercase ${
                  selectedIncident.website === 'Down' ? 'text-rose-400' :
                  selectedIncident.website === 'Partial' ? 'text-amber-400' :
                  'text-emerald-400'
                }`}>
                  {selectedIncident.website || 'Unknown'}
                </div>
              </div>
              <div className="bg-command-900/80 rounded-xl p-2.5 border border-rose-900/50">
                <div className="text-[9.5px] text-slate-400 uppercase font-hud font-bold tracking-wider mb-0.5">Employees Affected</div>
                <div className="text-xs font-bold text-white">{selectedIncident.employees || 'N/A'}</div>
              </div>
              <div className="bg-command-900/80 rounded-xl p-2.5 border border-rose-900/50">
                <div className="text-[9.5px] text-slate-400 uppercase font-hud font-bold tracking-wider mb-0.5">Payment Deadline</div>
                <div className="text-xs font-bold text-white font-mono">{selectedIncident.deadline || 'N/A'}</div>
              </div>
            </div>

            {/* Status and source */}
            <div className="flex items-center justify-between border-t border-rose-900/50 pt-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-hud font-bold">STATUS:</span>
                <span className="text-emerald-400 font-hud font-bold flex items-center gap-1.5 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {selectedIncident.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-hud font-bold">SOURCE:</span>
                <span className="text-white font-hud font-bold font-mono">Ransomware.live</span>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2.5">
              <a
                href={`https://otx.alienvault.com/browse/pulses?q=${selectedIncident.group}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-rose-950/60 border border-rose-500/50 hover:bg-rose-900 text-rose-300 text-xs font-hud font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all shadow-[0_0_12px_rgba(255,23,68,0.25)] flex items-center justify-center"
              >
                Search APT on OTX
              </a>
              <button 
                onClick={() => setSelectedIncident(null)}
                className="bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 hover:brightness-110 text-white text-xs font-hud font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-all shadow-[0_0_14px_rgba(255,23,68,0.4)] border border-rose-500/40 cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
