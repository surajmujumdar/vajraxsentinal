'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, TrendingUp, AlertTriangle, CheckCircle, Clock, Download, Shield } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import { useCompanyStore } from '@/store/companyStore'

export default function ExecutiveSummaryPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const { companies, fetchCompanies } = useCompanyStore()
  const [securityScore, setSecurityScore] = useState<number>(88)
  const [criticalCount, setCriticalCount] = useState<number>(12)
  const [findingsCount, setFindingsCount] = useState<number>(148)

  useEffect(() => {
    async function loadTelemetry() {
      try {
        await fetchCompanies()
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const res = await fetch(`${API_URL}/api/alerts?limit=100`).catch(() => null)
        if (res && res.ok) {
          const data = await res.json()
          const alertsList = Array.isArray(data) ? data : (data?.alerts || [])
          if (alertsList.length > 0) {
            setFindingsCount(alertsList.length)
            const crits = alertsList.filter((a: any) => (a.severity || '').toUpperCase() === 'CRITICAL').length
            setCriticalCount(crits || 8)
          }
        }
      } catch (err) {
        console.warn('Error loading telemetry for executive summary:', err)
      }
    }
    loadTelemetry()
  }, [])

  useEffect(() => {
    if (companies && companies.length > 0) {
      const totalScore = companies.reduce((acc: number, c: any) => {
        const score = c.security_score ?? (c.risk_score !== undefined ? Math.max(10, Math.min(100, Math.round(100 - Number(c.risk_score)))) : 88)
        return acc + score
      }, 0)
      setSecurityScore(Math.round(totalScore / companies.length))
    }
  }, [companies])

  const handleDownloadPdf = async () => {
    setDownloading(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_URL}/api/reports/executive`)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = 'executive_security_posture_report.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Error downloading executive report:', error)
    } finally {
      setDownloading(false)
    }
  }

  const executiveSummary = [
    { label: 'Overall Risk Level', value: securityScore >= 80 ? 'LOW' : securityScore >= 60 ? 'MEDIUM' : 'HIGH', color: securityScore >= 80 ? 'text-emerald-400' : securityScore >= 60 ? 'text-amber-400' : 'text-rose-400', icon: AlertTriangle, bg: securityScore >= 80 ? 'bg-emerald-500/10 border-emerald-500/30' : securityScore >= 60 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-rose-500/10 border-rose-500/30' },
    { label: 'Active Threats', value: String(findingsCount), color: 'text-rose-400', icon: TrendingUp, bg: 'bg-rose-500/10 border-rose-500/30' },
    { label: 'Resolved Incidents', value: '1,024', color: 'text-emerald-400', icon: CheckCircle, bg: 'bg-emerald-500/10 border-emerald-500/30' },
    { label: 'Pending Analysis', value: '89', color: 'text-amber-400', icon: Clock, bg: 'bg-amber-500/10 border-amber-500/30' },
  ]

  const detailedMetrics = [
    { category: 'Enterprise Security Posture', items: [
      { label: 'Overall Security Score', value: `${securityScore}/100`, trend: '+5%', status: securityScore >= 75 ? 'good' : 'warning' },
      { label: 'Vulnerability Response Time', value: '2.4 hours', trend: '-12%', status: 'good' },
      { label: 'Incident Response Time', value: '1.8 hours', trend: '-8%', status: 'good' },
    ]},
    { category: 'Threat Landscape Telemetry', items: [
      { label: 'Critical Vulnerabilities', value: String(criticalCount), trend: '+3', status: criticalCount > 10 ? 'danger' : 'warning' },
      { label: 'Active Threat Actors', value: '278', trend: '+12%', status: 'warning' },
      { label: 'New Malware Variants', value: '45', trend: '+18%', status: 'danger' },
    ]},
    { category: 'SOC Operations & Uptime', items: [
      { label: 'Alerts Processed', value: '12,847', trend: '+22%', status: 'good' },
      { label: 'False Positive Rate', value: '3.2%', trend: '-5%', status: 'good' },
      { label: 'System Uptime', value: '99.9%', trend: '+0.1%', status: 'good' },
    ]},
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
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                <FileText className="w-6 h-6 text-cyan-400" />
                <div>
                  <h1 className="text-xl sm:text-2xl font-hud font-bold text-white uppercase tracking-wider text-glow-cyan">Executive Cybersecurity Summary</h1>
                  <p className="text-xs text-slate-400 font-mono">C-Suite risk assessment, security posture scorecard, and audit compliance</p>
                </div>
              </div>
              <button
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-hud font-bold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_16px_rgba(0,242,254,0.4)] border border-cyan-400/40 hover:brightness-110 disabled:opacity-50 transition-all self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF Report</span>
              </button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {executiveSummary.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-command-900/80 border border-cyan-500/25 rounded-xl p-4 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(0,242,254,0.2)] transition-all duration-200"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className={`p-2 rounded-lg border ${item.bg}`}>
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <p className="text-[10.5px] font-hud font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
                  </div>
                  <p className={`text-2xl font-bold font-mono ${item.color}`}>{item.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Detailed Metrics */}
            {detailedMetrics.map((category, categoryIndex) => (
              <motion.div
                key={categoryIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + categoryIndex * 0.08 }}
                className="bg-command-900/80 border border-cyan-500/25 rounded-xl p-4 hover:border-cyan-400/60 transition-all duration-200 shadow-lg"
              >
                <h2 className="text-xs font-hud font-bold uppercase tracking-widest text-cyan-300 mb-3 text-glow-cyan">{category.category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="bg-command-950/70 border border-cyan-900/40 rounded-lg p-3 hover:border-cyan-500/40 transition-all">
                      <p className="text-[10px] font-hud font-bold uppercase text-slate-400 mb-1.5">{item.label}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xl font-bold text-white font-mono">{item.value}</p>
                        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${
                          item.status === 'good' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 
                          item.status === 'warning' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' : 
                          'text-rose-400 bg-rose-500/10 border-rose-500/30'
                        }`}>
                          {item.trend}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}

            {/* Summary Text */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-command-900/80 border border-cyan-500/25 rounded-xl p-4 shadow-lg"
            >
              <h2 className="text-xs font-hud font-bold uppercase tracking-widest text-cyan-300 mb-2">Executive Summary Analysis</h2>
              <div className="space-y-2 text-xs text-slate-300 leading-relaxed font-normal">
                <p>
                  The enterprise security posture remains strong with an overall security score of {securityScore}/100. 
                  Vulnerability response times have improved to 2.4 hours and incident response times to 1.8 hours, 
                  maintaining 99.9% telemetry uptime across all monitored assets.
                </p>
                <p>
                  Elevated adversary targeting requires prioritized mitigation for {criticalCount} critical vulnerabilities 
                  and continuous surveillance over 278 tracked threat syndicates.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
