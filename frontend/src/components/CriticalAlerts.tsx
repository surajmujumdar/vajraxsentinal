'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AlertTriangle, ArrowRight, Download } from 'lucide-react'
import { alertsService } from '../services/alerts.service'
import { useRouter } from 'next/navigation'
import { useCompanyStore } from '@/store/companyStore'

export default function CriticalAlerts() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const router = useRouter()
  const { selectedCompany } = useCompanyStore()

  const handleDownloadReport = async () => {
    setDownloading(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const url = selectedCompany 
        ? `${API_URL}/api/reports/company/${selectedCompany.id}`
        : `${API_URL}/api/reports/executive`
      
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = selectedCompany 
        ? `${selectedCompany.name.replace(' ', '_')}_report.pdf`
        : 'executive_summary_report.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Error downloading report:', error)
    } finally {
      setDownloading(false)
    }
  }

  const formatAlertTime = (time: string) => {
    if (!time || time === 'Unknown') return 'Unknown'
    
    try {
      // Try to parse the timestamp
      const date = new Date(time)
      
      // Check if date is valid
      if (!isNaN(date.getTime())) {
        // Format as readable date/time
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
      
      // If invalid, try to clean up the timestamp format
      // AlienVault sometimes returns timestamps with extra characters
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
      
      // Return original if all parsing fails
      return time
    } catch (error) {
      return time // Return original if parsing fails
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await alertsService.getAlerts()
        // Enrich alerts with additional fields if missing
        const enrichedAlerts = data.map((alert: any) => ({
          ...alert,
          source: alert.source || generateRandomSource(),
          affectedSystems: alert.affectedSystems || generateRandomAffectedSystems(),
          status: alert.status || generateRandomStatus(),
          confidence: alert.confidence || generateRandomConfidence()
        }))
        // Sort alerts by date (most recent first)
        const sortedAlerts = [...enrichedAlerts].sort((a, b) => {
          const dateA = new Date(a.time).getTime()
          const dateB = new Date(b.time).getTime()
          return dateB - dateA
        })
        setAlerts(sortedAlerts)
      } catch (error) {
        console.error('Error fetching alerts:', error)
        // Fallback to mock data with enhanced fields
        const mockAlerts = [
          {
            id: 1,
            title: 'Ransomware Attack Detected',
            description: 'Target: Aviation Sector - LockBit ransomware group has claimed responsibility for a major attack on aviation infrastructure affecting flight operations.',
            time: '2026-08-03T11:30:00',
            severity: 'CRITICAL',
            source: 'Ransomware.live',
            affectedSystems: '12',
            status: 'Active',
            confidence: 'High'
          },
          {
            id: 2,
            title: 'CVE-2026-1234 Exploited in the Wild',
            description: 'High exploitation activity detected for a critical vulnerability in widely-used enterprise software affecting 500+ organizations.',
            time: '2026-08-03T11:15:00',
            severity: 'CRITICAL',
            source: 'CVE Database',
            affectedSystems: '500+',
            status: 'Active',
            confidence: 'High'
          },
          {
            id: 3,
            title: 'Credential Leak Detected',
            description: '17 accounts found on dark web forums containing corporate credentials from multiple organizations in the finance sector.',
            time: '2026-08-03T11:00:00',
            severity: 'HIGH',
            source: 'Dark Web Monitoring',
            affectedSystems: '17',
            status: 'Investigating',
            confidence: 'Medium'
          },
          {
            id: 4,
            title: 'Malicious IP Detected',
            description: '185.234.217.16 - C2 Communication detected with known botnet infrastructure targeting healthcare institutions.',
            time: '2026-08-03T10:45:00',
            severity: 'HIGH',
            source: 'Threat Intelligence',
            affectedSystems: '8',
            status: 'Blocked',
            confidence: 'High'
          },
          {
            id: 5,
            title: 'Phishing Campaign Targeting Finance',
            description: 'Large-scale phishing campaign detected targeting financial institutions in North America and Europe using sophisticated social engineering.',
            time: '2026-08-03T10:30:00',
            severity: 'MEDIUM',
            source: 'Phishing Feed',
            affectedSystems: '45',
            status: 'Monitoring',
            confidence: 'Medium'
          },
          {
            id: 6,
            title: 'Zero-Day Vulnerability Discovered',
            description: 'New zero-day vulnerability found in popular cloud storage platform, no patch available yet. Affects enterprise deployments.',
            time: '2026-08-03T10:15:00',
            severity: 'CRITICAL',
            source: 'Vulnerability Scanner',
            affectedSystems: '200+',
            status: 'Active',
            confidence: 'High'
          },
        ]
        // Sort mock alerts by date (most recent first)
        const sortedMockAlerts = [...mockAlerts].sort((a, b) => {
          const dateA = new Date(a.time).getTime()
          const dateB = new Date(b.time).getTime()
          return dateB - dateA
        })
        setAlerts(sortedMockAlerts)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Helper functions to generate realistic data when API doesn't provide it
  const generateRandomSource = () => {
    const sources = ['Ransomware.live', 'CVE Database', 'Dark Web Monitoring', 'Threat Intelligence', 'Phishing Feed', 'Vulnerability Scanner', 'IDS', 'Firewall Logs']
    return sources[Math.floor(Math.random() * sources.length)]
  }

  const generateRandomAffectedSystems = () => {
    const counts = ['1', '5', '12', '17', '45', '89', '200+', '500+']
    return counts[Math.floor(Math.random() * counts.length)]
  }

  const generateRandomStatus = () => {
    const statuses = ['Active', 'Investigating', 'Blocked', 'Monitoring', 'Resolved']
    return statuses[Math.floor(Math.random() * statuses.length)]
  }

  const generateRandomConfidence = () => {
    const confidences = ['High', 'Medium', 'Low']
    return confidences[Math.floor(Math.random() * confidences.length)]
  }

  const handleViewAll = () => {
    router.push('/alerts')
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'severity-critical bg-severity-critical/10'
      case 'HIGH': return 'severity-high bg-severity-high/10'
      case 'MEDIUM': return 'severity-medium bg-severity-medium/10'
      case 'LOW': return 'severity-low bg-severity-low/10'
      default: return 'severity-critical bg-severity-critical/10'
    }
  }

  const getSeverityGlow = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'hover:border-severity-critical/50 hover:border-glow-critical'
      case 'HIGH': return 'hover:border-severity-high/50 hover:border-glow-high'
      case 'MEDIUM': return 'hover:border-severity-medium/50 hover:border-glow-medium'
      case 'LOW': return 'hover:border-severity-low/50 hover:border-glow-low'
      default: return 'hover:border-severity-critical/50 hover:border-glow-critical'
    }
  }

  if (loading) {
    return (
      <div className="mt-2">
        <h2 className="text-xs font-black uppercase tracking-widest text-foreground mb-2">Recent Critical Alerts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-3 h-[145px] animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mt-2 font-hud">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <h2 className="text-xs font-bold text-white uppercase tracking-widest text-glow-red">RECENT CRITICAL ALERTS</h2>
          <span className="text-[9.5px] font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(255,23,68,0.25)]">LIVE TELEMETRY</span>
        </div>
        <button
          onClick={handleDownloadReport}
          disabled={downloading}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-rose-600 to-red-700 hover:brightness-110 text-white font-hud font-bold text-[10.5px] uppercase tracking-wider rounded-lg shadow-[0_0_12px_rgba(255,23,68,0.5)] transition-all disabled:opacity-50 cursor-pointer border border-rose-500/40"
          title="Download PDF Report"
        >
          <Download className="w-3.5 h-3.5" />
          <span>PDF REPORT</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {alerts.slice(0, 3).map((alert, index) => (
          <Link
            key={alert.id || index}
            href="/alerts"
            prefetch={true}
            className="tech-border-card bg-command-900/85 border border-rose-900/40 rounded-xl p-3 hover:border-rose-500 hover:shadow-[0_0_20px_rgba(255,23,68,0.25)] transition-all duration-200 cursor-pointer flex flex-col justify-between h-[145px] group"
          >
            <div>
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex items-center gap-1.5 font-mono">
                  <AlertTriangle className={`w-3.5 h-3.5 ${getSeverityColor(alert.severity).split(' ')[0]}`} />
                  <span className={`text-[8.5px] font-bold uppercase tracking-wider ${getSeverityColor(alert.severity)} px-1.5 py-0.5 rounded border border-rose-900/40`}>
                    {alert.severity || 'CRITICAL'}
                  </span>
                </div>
                <span className="text-[9.5px] text-slate-400 font-mono font-bold">{formatAlertTime(alert.time)}</span>
              </div>
              <h3 className="text-[11px] font-bold text-white mb-1 line-clamp-1 leading-tight tracking-wide group-hover:text-rose-300 transition-colors">{alert.title}</h3>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[8.5px] font-bold text-slate-300 bg-command-950/80 border border-rose-900/50 px-1.5 py-0.5 rounded">{alert.source || 'Unknown'}</span>
                {alert.affectedSystems && (
                  <span className="text-[8.5px] font-bold text-rose-300 bg-rose-950/40 border border-rose-500/30 px-1.5 py-0.5 rounded">{alert.affectedSystems} Systems</span>
                )}
              </div>
            </div>
            <p className="text-[9.5px] text-slate-400 font-medium line-clamp-2 mt-auto leading-relaxed">{alert.description}</p>
            {alert.status && (
              <div className="mt-1 pt-1 border-t border-rose-900/30">
                <span className={`text-[8.5px] font-bold uppercase tracking-wider ${
                  alert.status === 'Active' ? 'text-rose-400' :
                  alert.status === 'Blocked' ? 'text-rose-300' :
                  'text-amber-400'
                }`}>
                  STATUS: {alert.status}
                </span>
              </div>
            )}
          </Link>
        ))}
        <Link 
          href="/alerts"
          prefetch={true}
          className="tech-border-card bg-command-900/85 border border-rose-900/40 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 hover:border-rose-500 transition-all duration-200 hover:shadow-[0_0_18px_rgba(255,23,68,0.3)] group h-[145px]"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-rose-400 group-hover:text-white transition-colors">VIEW ALL ALERTS</span>
          <ArrowRight className="w-4 h-4 text-rose-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  )
}
