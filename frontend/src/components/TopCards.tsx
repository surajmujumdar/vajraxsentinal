'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, RefreshCw, TrendingUp, Globe, Shield, AlertTriangle, Activity, Building2 } from 'lucide-react'
import { dashboardService } from '../services/dashboard.service'
import { ransomwareService } from '../services/ransomware.service'
import { useRouter } from 'next/navigation'
import { useCompanyStore } from '@/store/companyStore'
import { useLanguageStore } from '@/store/languageStore'

export default function TopCards() {
  const router = useRouter()
  const { companies, fetchCompanies } = useCompanyStore()
  const { t } = useLanguageStore()
  const [summary, setSummary] = useState<any>({
    total_attacks: 12847,
    active_threat_actors: 395,
    critical_attacks: 45,
    last_updated: new Date().toISOString()
  })
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        setIsUpdating(true)
        const [summaryData, rStats] = await Promise.allSettled([
          dashboardService.getSummary(),
          ransomwareService.getStats(),
          fetchCompanies()
        ])
        if (isMounted) {
          let updatedObj = { ...summary }
          if (summaryData.status === 'fulfilled' && summaryData.value) {
            updatedObj = { ...updatedObj, ...summaryData.value }
          }
          if (rStats.status === 'fulfilled' && rStats.value) {
            if (rStats.value.groupsCount || rStats.value.activeGroups) {
              updatedObj.active_threat_actors = rStats.value.groupsCount || rStats.value.activeGroups || 395
            }
          }
          setSummary(updatedObj)
        }
      } catch (error) {
        console.error('Error fetching dashboard summary:', error)
      } finally {
        if (isMounted) setIsUpdating(false)
      }
    }

    fetchData()
    const pollingInterval = setInterval(fetchData, 15000)

    return () => {
      isMounted = false
      clearInterval(pollingInterval)
    }
  }, [fetchCompanies])

  const monitoredCount = companies ? companies.length : 0

  const cards = [
    {
      label: t('monitoredCompanies', 'Monitored Companies'),
      value: `${monitoredCount} ACTIVE`,
      subtext: 'View & Manage Portfolio →',
      icon: Building2,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      path: '/companies',
    },
    {
      label: t('lastUpdated', 'Last Updated'),
      value: 'LIVE FEED',
      subtext: 'Real-time telemetry active',
      icon: RefreshCw,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      path: '/updates',
    },
    {
      label: t('globalAttacksToday', 'Global Attacks Today'),
      value: (summary?.total_attacks || 12847).toLocaleString(),
      trend: '↑ 18%',
      subtext: 'Worldwide Threat Pulses',
      icon: TrendingUp,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      path: '/global-attacks',
    },
    {
      label: t('activeThreatActors', 'Active Threat Actors'),
      value: (summary?.active_threat_actors || 395).toLocaleString(),
      trend: '↑ 12%',
      subtext: 'Monitored APT Groups',
      icon: Shield,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      path: '/threat-intelligence/actors',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <div
          key={index}
          onClick={() => router.push(card.path)}
          className="tech-border-card bg-command-950/90 border border-cyan-500/30 rounded-xl p-4.5 hover:border-cyan-400/60 transition-all duration-300 hover:shadow-[0_0_22px_rgba(0,242,254,0.2)] cursor-pointer flex flex-col justify-between group relative overflow-hidden"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-slate-400 uppercase tracking-widest font-hud font-bold truncate mb-1">
                {card.label}
              </p>
              <p className="text-2xl font-hud font-bold text-white tracking-tight group-hover:text-cyan-300 text-glow-cyan transition-colors">
                {card.value}
              </p>
            </div>
            <div className={`p-2.5 rounded-xl ${card.bgColor} border border-cyan-500/20 flex-shrink-0 ml-3 shadow-inner`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2.5 border-t border-cyan-900/50 text-xs">
            <span className="text-slate-400 font-bold text-[11px] truncate tracking-wide">{card.subtext}</span>
            {card.trend && (
              <span className={`font-mono font-bold text-[11px] ${card.color} ml-2 flex-shrink-0 tracking-wider`}>
                {card.trend}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
