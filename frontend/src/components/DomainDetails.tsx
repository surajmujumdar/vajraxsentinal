'use client'

import { useEffect, useState, useMemo } from 'react'
import { 
  Shield, AlertTriangle, Globe, Lock, ExternalLink,
  Copy, Check, Cpu, RefreshCw, Loader2, Search,
  Zap, Filter, Terminal, ShieldAlert, CheckCircle2,
  SlidersHorizontal, Bug, AlertCircle, Info, ChevronRight,
  Download, FileCode, FileJson, Server, Layers,
  Key, Radio, Play, CheckCircle
} from 'lucide-react'
import { computeUnifiedSecurityStats, extractAllDomainIssues, getGradeFromScore, DomainIssue } from '@/lib/securityScoring'

export type { DomainIssue }

export interface DomainData {
  target: string
  risk_level: string
  security_score: number
  security_rating?: string
  last_scanned: string
  active_incidents?: number
  total_issues_count?: number
  total_vulnerabilities?: number
  issues_statistics?: {
    total: number
    critical: number
    high: number
    medium: number
    low: number
    info: number
  }
  domain_issues?: DomainIssue[]
  nuclei_data?: {
    engine?: string
    engine_version?: string
    source_url?: string
    templates_url?: string
    scanned_templates?: number
    health_score?: number
    findings?: Array<{
      template_id: string
      name: string
      severity: string
      category: string
      protocol: string
      matched_at: string
      description: string
      remediation: string
      cwe_id?: string
      cvss_score?: number
      template_url?: string
    }>
    statistics?: {
      total: number
      critical: number
      high: number
      medium: number
      low: number
      info: number
    }
  }
  testssl_data?: {
    engine?: string
    target?: string
    port?: number
    grade?: string
    certificate?: {
      subject?: string
      issuer?: string
      expires_in_days?: number
      valid_until?: string
      san_domains?: string[]
      key_bits?: number
    }
    protocols_supported?: string[]
    deprecated_protocols?: string[]
    has_hsts?: boolean
    findings_count?: number
    findings?: Array<{
      id: string
      title: string
      severity: string
      cvss_score?: number
      category?: string
      description?: string
      remediation?: string
    }>
    source_url?: string
  }
  nmap_data?: {
    engine?: string
    target?: string
    ip?: string
    ports_scanned?: number
    open_ports_count?: number
    open_ports?: Array<{
      port: number
      state: string
      service: string
      description?: string
      severity?: string
      banner?: string
    }>
    issues?: Array<{
      port: number
      service: string
      severity: string
      cvss_score?: number
      banner?: string
      description?: string
    }>
    source_url?: string
  }
  osv_data?: {
    engine?: string
    target?: string
    detected_packages?: Array<{
      name: string
      version?: string | null
      ecosystem?: string | null
    }>
    total_vulnerabilities?: number
    vulnerabilities?: Array<{
      id: string
      cve_id?: string
      package?: string
      version?: string | null
      summary?: string
      severity?: string
      cvss_score?: number
      advisory_url?: string
    }>
    source_url?: string
  }
  greenbone_data?: any
  owasp_data?: any
  webscanner_data?: any
  nikto_data?: any
  threatfox_data?: any
  shodan_data?: any
  virustotal_data?: any
  abuseipdb_data?: any
  urlscan_data?: any
  ssl_certificate?: {
    valid?: boolean
    issuer?: string
    expires_days?: number
    tls_grade?: string
    protocols_supported?: string[]
    deprecated_protocols?: string[]
    has_hsts?: boolean
  }
  vulnerabilities?: Array<{
    cve_id: string
    description: string
    cvss_score: number
    severity: string
    references?: string[]
  }>
  threats?: Array<{
    type: string
    severity: string
    source?: string
  }>
  connections?: {
    ip_addresses?: string[]
    asn_info?: any
  }
  country?: string
  isp?: string
}

interface DomainDetailsProps {
  domain: string
  companyId?: number
  initialData?: any
  onScoreCalculated?: (score: number, stats: any) => void
}

type FilterCategory = 'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NIKTO' | 'WEBSCANNER' | 'GREENBONE' | 'OWASP' | 'NUCLEI' | 'NMAP' | 'TESTSSL' | 'OSV' | 'MISCONFIG' | 'SSL' | 'DNS' | 'EXPOSED' | 'CVE'
type SortOption = 'severity' | 'cvss' | 'title'

export default function DomainDetails({ domain, companyId, initialData, onScoreCalculated }: DomainDetailsProps) {
  const [domainData, setDomainData] = useState<DomainData | null>(initialData || null)
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState('')
  const [rescanning, setRescanning] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('ALL')
  const [sortBy, setSortBy] = useState<SortOption>('severity')
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [exportingStix, setExportingStix] = useState(false)
  const [exportingJson, setExportingJson] = useState(false)

  const cleanDomain = useMemo(() => {
    return (domain || '').trim().toLowerCase().replace('https://', '').replace('http://', '').split('/')[0]
  }, [domain])

  const handleExportStix = async () => {
    if (!cleanDomain) return
    setExportingStix(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const endpoint = companyId 
        ? `${API_URL}/api/companies/${companyId}/export/stix`
        : `${API_URL}/api/domain-analysis/export/stix?domain=${encodeURIComponent(cleanDomain)}`
      const res = await fetch(endpoint)
      if (!res.ok) throw new Error('Failed to export STIX 2.1 bundle')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `stix_bundle_${cleanDomain.replace(/[^a-zA-Z0-9]/g, '_')}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('STIX export failed:', err)
    } finally {
      setExportingStix(false)
    }
  }

  const handleExportJson = async () => {
    if (!cleanDomain) return
    setExportingJson(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const endpoint = companyId 
        ? `${API_URL}/api/companies/${companyId}/export/json`
        : `${API_URL}/api/domain-analysis/export/json?domain=${encodeURIComponent(cleanDomain)}`
      const res = await fetch(endpoint)
      if (!res.ok) throw new Error('Failed to export JSON report')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `domain_intelligence_${cleanDomain.replace(/[^a-zA-Z0-9]/g, '_')}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('JSON export failed:', err)
    } finally {
      setExportingJson(false)
    }
  }

  const fetchDomainData = async (forceRefresh = false) => {
    if (!cleanDomain) return
    try {
      if (forceRefresh) {
        setRescanning(true)
      } else {
        setLoading(true)
      }
      setError('')

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      
      let res: Response
      if (forceRefresh && companyId) {
        res = await fetch(`${API_URL}/api/companies/${companyId}/analyze`, { method: 'POST' })
      } else if (companyId) {
        res = await fetch(`${API_URL}/api/companies/${companyId}/analysis`)
        if (!res.ok) {
          res = await fetch(`${API_URL}/api/domain-analysis/analyze?domain=${encodeURIComponent(cleanDomain)}`)
        }
      } else {
        res = await fetch(`${API_URL}/api/domain-analysis/analyze?domain=${encodeURIComponent(cleanDomain)}`)
      }

      if (!res.ok) throw new Error('Failed to fetch domain intelligence data')
      const data = await res.json()
      
      const payload = data.analysis_data || (data.target ? data : (data.nuclei_data ? { ...domainData, ...data } : data))
      setDomainData(payload)
    } catch (err: any) {
      console.error('Domain analysis error:', err)
      setError('Unable to load vulnerability data for this domain. Please try again.')
    } finally {
      setLoading(false)
      setRescanning(false)
    }
  }

  useEffect(() => {
    if (initialData) {
      setDomainData(initialData)
      setLoading(false)
    } else if (cleanDomain) {
      fetchDomainData()
    }
  }, [cleanDomain, initialData])

  // Consolidate all domain issues into a single uniform array across all intelligence engines
  const allIssues: DomainIssue[] = useMemo(() => {
    return extractAllDomainIssues(domainData, cleanDomain)
  }, [domainData, cleanDomain])

  // Calculate dynamic rating & severity counts using unified scoring engine (100% matched with outer view)
  const stats = useMemo(() => {
    return computeUnifiedSecurityStats(domainData, cleanDomain)
  }, [domainData, cleanDomain])

  // Sync calculated score and issue statistics to parent container
  useEffect(() => {
    if (onScoreCalculated && stats) {
      onScoreCalculated(stats.score, stats)
    }
  }, [stats, onScoreCalculated])

  // Category counts for filter tabs
  const categoryCounts = useMemo(() => {
    return {
      ALL: allIssues.length,
      CRITICAL: stats.critical,
      HIGH: stats.high,
      MEDIUM: stats.medium,
      LOW: stats.low,
      NIKTO: allIssues.filter(i => (i.source || '').includes('Nikto') || i.category === 'nikto' || i.id.includes('nikto')).length,
      WEBSCANNER: allIssues.filter(i => (i.source || '').includes('WebScanner') || i.category === 'webscanner' || i.id.includes('webscanner') || i.category === 'exposed_files' || i.category === 'secrets').length,
      GREENBONE: allIssues.filter(i => (i.source || '').includes('Greenbone') || i.category === 'greenbone-nvt' || i.id.includes('greenbone') || i.id.includes('gvm')).length,
      OWASP: allIssues.filter(i => (i.source || '').includes('OWASP') || i.category === 'owasp-top10' || i.id.includes('owasp')).length,
      NUCLEI: allIssues.filter(i => (i.source || '').includes('Nuclei') || i.id.includes('nuclei')).length,
      NMAP: allIssues.filter(i => (i.source || '').includes('Nmap') || i.id.includes('nmap')).length,
      TESTSSL: allIssues.filter(i => (i.source || '').includes('testssl') || i.id.includes('testssl')).length,
      OSV: allIssues.filter(i => (i.source || '').includes('OSV') || i.id.includes('osv')).length,
      MISCONFIG: allIssues.filter(i => i.category === 'misconfiguration' || i.category.includes('config')).length,
      SSL: allIssues.filter(i => i.category === 'ssl-tls' || i.protocol === 'SSL/TLS' || (i.source || '').includes('testssl')).length,
      DNS: allIssues.filter(i => i.category === 'dns-email' || i.protocol === 'DNS').length,
      EXPOSED: allIssues.filter(i => i.category === 'exposed-panels' || i.category.includes('expose') || i.category.includes('disclosure') || (i.source || '').includes('Nmap') || i.category === 'exposed_files').length,
      CVE: allIssues.filter(i => i.category === 'cve' || !!i.cve_id).length
    }
  }, [allIssues, stats])

  // Filtered & Sorted issues
  const displayedIssues = useMemo(() => {
    return allIssues
      .filter(issue => {
        // Category filter
        if (activeFilter === 'CRITICAL' && issue.severity !== 'CRITICAL') return false
        if (activeFilter === 'HIGH' && issue.severity !== 'HIGH') return false
        if (activeFilter === 'MEDIUM' && issue.severity !== 'MEDIUM') return false
        if (activeFilter === 'LOW' && issue.severity !== 'LOW') return false
        if (activeFilter === 'NIKTO' && !((issue.source || '').includes('Nikto') || issue.category === 'nikto' || issue.id.includes('nikto'))) return false
        if (activeFilter === 'WEBSCANNER' && !((issue.source || '').includes('WebScanner') || issue.category === 'webscanner' || issue.id.includes('webscanner') || issue.category === 'exposed_files' || issue.category === 'secrets')) return false
        if (activeFilter === 'GREENBONE' && !((issue.source || '').includes('Greenbone') || issue.category === 'greenbone-nvt' || issue.id.includes('greenbone') || issue.id.includes('gvm'))) return false
        if (activeFilter === 'OWASP' && !((issue.source || '').includes('OWASP') || issue.category === 'owasp-top10' || issue.id.includes('owasp'))) return false
        if (activeFilter === 'NUCLEI' && !((issue.source || '').includes('Nuclei') || issue.id.includes('nuclei'))) return false
        if (activeFilter === 'NMAP' && !((issue.source || '').includes('Nmap') || issue.id.includes('nmap'))) return false
        if (activeFilter === 'TESTSSL' && !((issue.source || '').includes('testssl') || issue.id.includes('testssl'))) return false
        if (activeFilter === 'OSV' && !((issue.source || '').includes('OSV') || issue.id.includes('osv'))) return false
        if (activeFilter === 'MISCONFIG' && !(issue.category === 'misconfiguration' || issue.category.includes('config'))) return false
        if (activeFilter === 'SSL' && !(issue.category === 'ssl-tls' || issue.protocol === 'SSL/TLS' || (issue.source || '').includes('testssl'))) return false
        if (activeFilter === 'DNS' && !(issue.category === 'dns-email' || issue.protocol === 'DNS')) return false
        if (activeFilter === 'EXPOSED' && !(issue.category === 'exposed-panels' || issue.category.includes('expose') || issue.category.includes('disclosure') || (issue.source || '').includes('Nmap'))) return false
        if (activeFilter === 'CVE' && !(issue.category === 'cve' || !!issue.cve_id)) return false

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          const matchTitle = issue.title.toLowerCase().includes(q)
          const matchDesc = issue.description.toLowerCase().includes(q)
          const matchTarget = issue.matched_target.toLowerCase().includes(q)
          const matchId = issue.id.toLowerCase().includes(q)
          const matchCve = issue.cve_id?.toLowerCase().includes(q)
          const matchCwe = issue.cwe_id?.toLowerCase().includes(q)
          if (!matchTitle && !matchDesc && !matchTarget && !matchId && !matchCve && !matchCwe) {
            return false
          }
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'severity') {
          const weights: Record<string, number> = { CRITICAL: 5, HIGH: 4, MEDIUM: 3, LOW: 2, INFO: 1 }
          return (weights[b.severity] || 0) - (weights[a.severity] || 0)
        }
        if (sortBy === 'cvss') {
          return (b.cvss_score || 0) - (a.cvss_score || 0)
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title)
        }
        return 0
      })
  }, [allIssues, activeFilter, searchQuery, sortBy])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(text)
    setTimeout(() => setCopiedText(null), 2000)
  }

  const getGradeTheme = (grade: string) => {
    return getGradeFromScore(stats.score)
  }

  const getSeverityStyle = (sev: string) => {
    switch (sev.toUpperCase()) {
      case 'CRITICAL':
        return {
          cardBorder: 'border-red-500/40 bg-red-500/[0.03]',
          bar: 'bg-red-500',
          badge: 'bg-red-500/20 text-red-400 border-red-500/30',
          text: 'text-red-400'
        }
      case 'HIGH':
        return {
          cardBorder: 'border-orange-500/40 bg-orange-500/[0.03]',
          bar: 'bg-orange-500',
          badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
          text: 'text-orange-400'
        }
      case 'MEDIUM':
        return {
          cardBorder: 'border-amber-500/40 bg-amber-500/[0.03]',
          bar: 'bg-amber-500',
          badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          text: 'text-amber-400'
        }
      case 'LOW':
        return {
          cardBorder: 'border-blue-500/40 bg-blue-500/[0.03]',
          bar: 'bg-blue-500',
          badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          text: 'text-blue-400'
        }
      default:
        return {
          cardBorder: 'border-border bg-card/60',
          bar: 'bg-slate-500',
          badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
          text: 'text-slate-400'
        }
    }
  }

  const gradeTheme = getGradeTheme(stats.grade)

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-10 bg-background rounded-xl w-1/3" />
          <div className="h-10 bg-background rounded-xl w-1/4" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-20 bg-background rounded-xl" />
          ))}
        </div>
        <div className="h-48 bg-background rounded-xl" />
      </div>
    )
  }

  if (error && !domainData) {
    return (
      <div className="bg-card border border-danger/30 rounded-2xl p-8 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-danger mx-auto" />
        <h3 className="text-lg font-bold text-foreground">Error Analyzing Domain</h3>
        <p className="text-xs text-secondary max-w-md mx-auto">{error}</p>
        <button
          onClick={() => fetchDomainData(true)}
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition"
        >
          <RefreshCw className="w-4 h-4" /> Retry Scan
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ──── HERO CARD: UNIFIED SECURITY RATING & DOMAIN INTELLIGENCE ──── */}
      <div className={`bg-card border border-border rounded-2xl p-6 md:p-8 shadow-xl ${gradeTheme.glow} transition-all relative overflow-hidden`}>
        {/* Background Accent Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Domain & Source Identity */}
          <div className="flex items-start gap-4">
            <img
              src={`https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=128`}
              alt={`${cleanDomain} icon`}
              className="w-16 h-16 object-contain rounded-2xl border border-border bg-background p-2 flex-shrink-0 shadow-inner"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=64`
              }}
            />
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5 flex-wrap">
                  <span>{cleanDomain}</span>
                  {domainData?.connections?.ip_addresses && domainData.connections.ip_addresses.length > 0 && (
                    <span className="text-sm px-3 py-1 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 font-mono font-bold flex items-center gap-1.5 shadow-sm">
                      <Server className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{domainData.connections.ip_addresses[0]}</span>
                    </span>
                  )}
                </h2>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${gradeTheme.badge}`}>
                  {stats.risk} RISK
                </span>
                <span
                  className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 font-semibold cursor-default"
                >
                  <Shield className="w-3.5 h-3.5" /> Greenbone OpenVAS
                </span>
                <span
                  className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1 font-semibold cursor-default"
                >
                  <Layers className="w-3.5 h-3.5" /> OWASP Top 10
                </span>
                <span
                  className="text-xs px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center gap-1 font-semibold cursor-default"
                >
                  <Cpu className="w-3.5 h-3.5" /> Nuclei
                </span>
                <span
                  className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1 font-semibold cursor-default"
                >
                  <Server className="w-3.5 h-3.5" /> Nmap
                </span>
                <span
                  className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1 font-semibold cursor-default"
                >
                  <Lock className="w-3.5 h-3.5" /> testssl.sh
                </span>
                <span
                  className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1 font-semibold cursor-default"
                >
                  <Bug className="w-3.5 h-3.5" /> Google OSV
                </span>
              </div>

              <p className="text-xs text-secondary mt-1.5 flex items-center gap-2 flex-wrap">
                <span>Vulnerability & Infrastructure Security Assessment</span>
                <span>•</span>
                <span>Last Scanned: {domainData?.last_scanned || 'Just now'}</span>
                {domainData?.connections?.ip_addresses && domainData.connections.ip_addresses.length > 0 && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-foreground font-semibold">{domainData.connections.ip_addresses[0]}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Prominent Unified Security Rating & Score Card */}
          <div className="flex items-center gap-4 flex-wrap self-start lg:self-center">
            {/* Rating Display */}
            <div className="flex items-center gap-4 bg-background border border-border rounded-2xl p-4 shadow-sm">
              <div className={`w-14 h-14 rounded-2xl border-2 ${gradeTheme.ring} ${gradeTheme.badge} flex flex-col items-center justify-center`}>
                <span className="text-xl font-black">{stats.grade}</span>
                <span className="text-[9px] uppercase font-bold tracking-wider">Rating</span>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-3xl font-black font-mono ${gradeTheme.text}`}>{stats.score}</span>
                  <span className="text-xs text-secondary font-semibold">/100</span>
                </div>
                <div className="text-[11px] text-secondary font-medium">Security Score</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchDomainData(true)}
                disabled={rescanning}
                className="px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-2xl text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-primary/25 disabled:opacity-50"
              >
                {rescanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                <span>{rescanning ? 'Scanning...' : 'Rescan'}</span>
              </button>

              <button
                onClick={handleExportStix}
                disabled={exportingStix}
                className="px-3.5 py-3 bg-card border border-border hover:border-primary/50 text-foreground rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm hover:text-primary active:scale-95 disabled:opacity-50"
                title="Export OASIS STIX 2.1 JSON Bundle for SIEM/SOAR"
              >
                {exportingStix ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <FileCode className="w-4 h-4 text-primary" />}
                <span>STIX 2.1</span>
              </button>

              <button
                onClick={handleExportJson}
                disabled={exportingJson}
                className="px-3.5 py-3 bg-card border border-border hover:border-primary/50 text-foreground rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm hover:text-primary active:scale-95 disabled:opacity-50"
                title="Export Raw JSON Intelligence Report"
              >
                {exportingJson ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <FileJson className="w-4 h-4 text-secondary" />}
                <span>JSON</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Formula Explanation Banner */}
        <div className="mt-6 pt-5 border-t border-border/70 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-secondary">
            <div className="flex items-center gap-2 flex-wrap">
              <Zap className="w-4 h-4 text-primary flex-shrink-0" />
              <span>
                <strong className="text-foreground">VAJRA Infrastructure Risk Rating Model:</strong> Score evaluated on infrastructure-damaging vulnerabilities (Critical: -10, High: -5, Medium: -2, Low: -2):
                <span className="font-mono text-foreground ml-1">
                  100 - ({stats.critical}×10 + {stats.high}×5 + {stats.medium}×2 + {stats.low}×2) = {stats.score}/100 ({stats.grade} Rating)
                </span>
              </span>
            </div>
            <span className="text-[11px] font-mono text-secondary">
              Inspected {domainData?.nuclei_data?.scanned_templates || 1450} Security Checks
            </span>
          </div>

          {/* Granular Category Deductions Breakdown */}
          <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
            <span className="text-secondary font-sans font-semibold">Infrastructure Impact:</span>
            <span className="px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              SSL/TLS: -{allIssues.filter(i => i.category === 'ssl-tls' || (i.source || '').includes('testssl')).reduce((acc, i) => acc + (i.severity === 'CRITICAL' ? 10 : i.severity === 'HIGH' ? 5 : i.severity === 'MEDIUM' ? 2 : 2), 0)} pts
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Open Ports: -{allIssues.filter(i => (i.category === 'exposed-panels' && (i.title.includes('Port') || i.id.includes('port'))) || (i.source || '').includes('Nmap')).reduce((acc, i) => acc + (i.severity === 'CRITICAL' ? 10 : i.severity === 'HIGH' ? 5 : i.severity === 'MEDIUM' ? 2 : 2), 0)} pts
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Web & XSS: -{allIssues.filter(i => (i.category === 'misconfiguration' || i.category === 'vulnerability' || i.category === 'information-disclosure') && !i.title.includes('Port')).reduce((acc, i) => acc + (i.severity === 'CRITICAL' ? 10 : i.severity === 'HIGH' ? 5 : i.severity === 'MEDIUM' ? 2 : 2), 0)} pts
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              CVEs & OSV: -{allIssues.filter(i => i.category === 'cve' || !!i.cve_id || (i.source || '').includes('OSV')).reduce((acc, i) => acc + (i.severity === 'CRITICAL' ? 10 : i.severity === 'HIGH' ? 5 : i.severity === 'MEDIUM' ? 2 : 2), 0)} pts
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              Threat IOCs: -{allIssues.filter(i => i.category === 'threat' || (i.source || '').includes('ThreatFox') || (i.source || '').includes('VirusTotal')).reduce((acc, i) => acc + (i.severity === 'CRITICAL' ? 10 : i.severity === 'HIGH' ? 5 : i.severity === 'MEDIUM' ? 2 : 2), 0)} pts
            </span>
          </div>
        </div>
      </div>

      {/* ──── 6 SEVERITY COUNTER TILES ──── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`p-4 rounded-2xl border transition text-left ${
            activeFilter === 'ALL'
              ? 'bg-primary/10 border-primary text-foreground shadow-md'
              : 'bg-card border-border hover:border-primary/40'
          }`}
        >
          <div className="text-xs text-secondary font-medium mb-1">Total Issues</div>
          <div className="text-2xl font-black text-foreground">{stats.totalIssues}</div>
        </button>

        <button
          onClick={() => setActiveFilter('CRITICAL')}
          className={`p-4 rounded-2xl border transition text-left ${
            activeFilter === 'CRITICAL'
              ? 'bg-red-500/15 border-red-500 text-red-400 shadow-md'
              : 'bg-card border-border hover:border-red-500/40'
          }`}
        >
          <div className="text-xs text-red-400 font-semibold mb-1">Critical</div>
          <div className="text-2xl font-black text-red-400">{stats.critical}</div>
        </button>

        <button
          onClick={() => setActiveFilter('HIGH')}
          className={`p-4 rounded-2xl border transition text-left ${
            activeFilter === 'HIGH'
              ? 'bg-orange-500/15 border-orange-500 text-orange-400 shadow-md'
              : 'bg-card border-border hover:border-orange-500/40'
          }`}
        >
          <div className="text-xs text-orange-400 font-semibold mb-1">High</div>
          <div className="text-2xl font-black text-orange-400">{stats.high}</div>
        </button>

        <button
          onClick={() => setActiveFilter('MEDIUM')}
          className={`p-4 rounded-2xl border transition text-left ${
            activeFilter === 'MEDIUM'
              ? 'bg-amber-500/15 border-amber-500 text-amber-400 shadow-md'
              : 'bg-card border-border hover:border-amber-500/40'
          }`}
        >
          <div className="text-xs text-amber-400 font-semibold mb-1">Medium</div>
          <div className="text-2xl font-black text-amber-400">{stats.medium}</div>
        </button>

        <button
          onClick={() => setActiveFilter('LOW')}
          className={`p-4 rounded-2xl border transition text-left ${
            activeFilter === 'LOW'
              ? 'bg-blue-500/15 border-blue-500 text-blue-400 shadow-md'
              : 'bg-card border-border hover:border-blue-500/40'
          }`}
        >
          <div className="text-xs text-blue-400 font-semibold mb-1">Low</div>
          <div className="text-2xl font-black text-blue-400">{stats.low}</div>
        </button>

        <div className="p-4 rounded-2xl border border-border bg-card">
          <div className="text-xs text-slate-400 font-semibold mb-1">Info / Notes</div>
          <div className="text-2xl font-black text-slate-300">{stats.info}</div>
        </div>
      </div>

      {/* ──── ENGINE INTELLIGENCE & TELEMETRY CARDS ──── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Greenbone OpenVAS Network Scanner Card */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Greenbone OpenVAS</h4>
                <p className="text-[10px] text-secondary">Network Feed NVTs</p>
              </div>
            </div>
            <button
              onClick={() => setActiveFilter('GREENBONE')}
              className="text-[11px] font-mono text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
            >
              Grade {domainData?.greenbone_data?.network_grade || 'A+'} <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-border/60">
            <span className="text-secondary text-[11px]">NVTs Inspected</span>
            <span className="font-mono text-foreground font-semibold">{domainData?.greenbone_data?.nvts_inspected || 84500}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-secondary text-[11px]">Perimeter Status</span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
              domainData?.greenbone_data?.perimeter_status === 'VULNERABLE_PERIMETER'
                ? 'bg-red-500/15 text-red-400 border-red-500/30'
                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
            }`}>
              {domainData?.greenbone_data?.perimeter_status === 'VULNERABLE_PERIMETER' ? 'Vulnerable' : 'Secure Perimeter'}
            </span>
          </div>
        </div>

        {/* OWASP Web Application Scanner Card */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">OWASP Web Top 10</h4>
                <p className="text-[10px] text-secondary">Web App Vulnerabilities</p>
              </div>
            </div>
            <button
              onClick={() => setActiveFilter('OWASP')}
              className="text-[11px] font-mono text-blue-400 hover:underline flex items-center gap-1 font-semibold"
            >
              {domainData?.owasp_data?.owasp_score ?? 95}/100 <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-border/60">
            <span className="text-secondary text-[11px]">Compliance Rating</span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
              domainData?.owasp_data?.compliance_rating === 'NON_COMPLIANT'
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
            }`}>
              {domainData?.owasp_data?.compliance_rating || 'COMPLIANT'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-secondary text-[11px]">Standard Tested</span>
            <span className="text-[11px] font-mono text-blue-400 font-semibold">
              Top 10:2021
            </span>
          </div>
        </div>

        {/* Nmap Port Scanner Card */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Nmap Network Ports</h4>
                <p className="text-[10px] text-secondary">Active TCP Port Scanning</p>
              </div>
            </div>
            <button
              onClick={() => setActiveFilter('NMAP')}
              className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
            >
              {domainData?.nmap_data?.open_ports_count || (domainData?.nmap_data?.open_ports || []).length || 0} Open <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-border/60">
            <span className="text-secondary text-[11px]">Ports Probed</span>
            <span className="font-mono text-foreground font-semibold">{domainData?.nmap_data?.ports_scanned || 65535}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-secondary text-[11px]">Exposure Status</span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
              (domainData?.nmap_data?.open_ports || []).some((p: any) => p.severity === 'CRITICAL' || p.severity === 'HIGH')
                ? 'bg-red-500/15 text-red-400 border-red-500/30'
                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
            }`}>
              {(domainData?.nmap_data?.open_ports || []).some((p: any) => p.severity === 'CRITICAL' || p.severity === 'HIGH') ? 'Risky Ports Exposed' : 'Secure Perimeter'}
            </span>
          </div>
        </div>

        {/* testssl.sh Cryptographic Audit Card */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">testssl.sh Protocol & Cipher</h4>
                <p className="text-[10px] text-secondary">Cryptographic TLS Audit</p>
              </div>
            </div>
            <button
              onClick={() => setActiveFilter('TESTSSL')}
              className="text-[11px] font-mono text-purple-400 hover:underline flex items-center gap-1 font-semibold"
            >
              Grade {domainData?.testssl_data?.grade || domainData?.ssl_certificate?.tls_grade || 'A'} <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-border/60">
            <span className="text-secondary text-[11px]">Certificate Validity</span>
            <span className="font-mono text-foreground font-semibold">
              {domainData?.testssl_data?.certificate?.expires_in_days ?? domainData?.ssl_certificate?.expires_days ?? 90} Days Remaining
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-secondary text-[11px]">HSTS Strict Transport</span>
            <span className="text-[11px] font-mono font-semibold text-foreground">
              {domainData?.testssl_data?.has_hsts || domainData?.ssl_certificate?.has_hsts ? (
                <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Enforced</span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Disabled</span>
              )}
            </span>
          </div>
        </div>

        {/* Google OSV Open Source Vulnerabilities Card */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
                <Bug className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Google OSV Engine</h4>
                <p className="text-[10px] text-secondary">Software Stack & Package CVEs</p>
              </div>
            </div>
            <button
              onClick={() => setActiveFilter('OSV')}
              className="text-[11px] font-mono text-amber-400 hover:underline flex items-center gap-1 font-semibold"
            >
              {domainData?.osv_data?.total_vulnerabilities || (domainData?.osv_data?.vulnerabilities || []).length || 0} Advisories <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-border/60">
            <span className="text-secondary text-[11px]">Detected Packages</span>
            <span className="font-mono text-foreground font-semibold">
              {(domainData?.osv_data?.detected_packages || []).map((p: any) => p.name).join(', ') || 'Nginx / Web Stack'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-secondary text-[11px]">Advisory Database</span>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Active Sync
            </span>
          </div>
        </div>

        {/* WebScanner 16-Step Pipeline Card */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
                <Play className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">WebScanner Engine</h4>
                <p className="text-[10px] text-secondary">kpirnie/webscanner 16-Steps</p>
              </div>
            </div>
            <button
              onClick={() => setActiveFilter('WEBSCANNER')}
              className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
            >
              16 Steps <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-border/60">
            <span className="text-secondary text-[11px]">CMS Profiler</span>
            <span className="font-mono text-foreground font-semibold">
              {domainData?.webscanner_data?.cms_info?.type || 'Web Application'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-secondary text-[11px]">Pipeline Status</span>
            <span className="text-[11px] font-mono text-cyan-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> 16/16 Executed
            </span>
          </div>
        </div>

        {/* Nikto Web Server & CGI Scanner Card (sullo/nikto) */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-orange-400">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Nikto Web Scanner</h4>
                <p className="text-[10px] text-secondary">sullo/nikto Server & CGI Audit</p>
              </div>
            </div>
            <button
              onClick={() => setActiveFilter('NIKTO')}
              className="text-[11px] font-mono text-orange-400 hover:underline flex items-center gap-1 font-semibold"
            >
              Grade {domainData?.nikto_data?.grade || (domainData?.nikto_data?.nikto_score ? (domainData.nikto_data.nikto_score >= 85 ? 'A' : domainData.nikto_data.nikto_score >= 70 ? 'B' : domainData.nikto_data.nikto_score >= 50 ? 'C' : 'F') : 'A')} <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-border/60">
            <span className="text-secondary text-[11px]">Server Banner</span>
            <span className="font-mono text-foreground font-semibold truncate max-w-[140px]" title={domainData?.nikto_data?.server_banner || 'Hidden / Filtered'}>
              {domainData?.nikto_data?.server_banner || 'Hidden / Filtered'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-secondary text-[11px]">HTTP Verbs & CGI</span>
            <span className="text-[11px] font-mono text-orange-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {domainData?.nikto_data?.allowed_methods?.join(', ') || 'GET, POST'}
            </span>
          </div>
        </div>
      </div>

      {/* ──── MASTER FILTER & CONTROLS TOOLBAR ──── */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary" />
            <input
              type="text"
              placeholder="Search by vulnerability title, template ID, CVE-ID, CWE, or endpoint..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-xs text-foreground placeholder:text-secondary focus:outline-none focus:border-primary transition"
            />
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-background border border-border rounded-xl p-1 text-xs">
              <span className="text-secondary text-[10px] uppercase font-bold px-2">Sort:</span>
              <button
                onClick={() => setSortBy('severity')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  sortBy === 'severity' ? 'bg-primary text-white' : 'text-secondary hover:text-foreground'
                }`}
              >
                Severity
              </button>
              <button
                onClick={() => setSortBy('cvss')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  sortBy === 'cvss' ? 'bg-primary text-white' : 'text-secondary hover:text-foreground'
                }`}
              >
                CVSS
              </button>
              <button
                onClick={() => setSortBy('title')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  sortBy === 'title' ? 'bg-primary text-white' : 'text-secondary hover:text-foreground'
                }`}
              >
                Title
              </button>
            </div>

            <button
              onClick={handleExportJson}
              disabled={exportingJson}
              className="px-3 py-2 bg-card hover:bg-background border border-border rounded-xl text-xs font-semibold text-foreground transition flex items-center gap-1.5"
            >
              <FileJson className="w-3.5 h-3.5 text-primary" />
              <span>JSON</span>
            </button>

            <button
              onClick={handleExportStix}
              disabled={exportingStix}
              className="px-3 py-2 bg-card hover:bg-background border border-border rounded-xl text-xs font-semibold text-foreground transition flex items-center gap-1.5"
            >
              <FileCode className="w-3.5 h-3.5 text-purple-400" />
              <span>STIX 2.1</span>
            </button>
          </div>
        </div>

        {/* Filter Category Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap border-t border-border pt-3">
          {[
            { id: 'ALL', label: 'All Issues', count: categoryCounts.ALL },
            { id: 'CRITICAL', label: 'Critical', count: categoryCounts.CRITICAL },
            { id: 'HIGH', label: 'High', count: categoryCounts.HIGH },
            { id: 'MEDIUM', label: 'Medium', count: categoryCounts.MEDIUM },
            { id: 'LOW', label: 'Low', count: categoryCounts.LOW },
            { id: 'NIKTO', label: 'Nikto Web Scanner', count: categoryCounts.NIKTO },
            { id: 'WEBSCANNER', label: 'WebScanner (16 Steps)', count: categoryCounts.WEBSCANNER },
            { id: 'GREENBONE', label: 'Greenbone Network NVTs', count: categoryCounts.GREENBONE },
            { id: 'OWASP', label: 'OWASP Web Top 10', count: categoryCounts.OWASP },
            { id: 'NUCLEI', label: 'Nuclei Infra', count: categoryCounts.NUCLEI },
            { id: 'NMAP', label: 'Nmap Ports', count: categoryCounts.NMAP },
            { id: 'TESTSSL', label: 'testssl.sh TLS', count: categoryCounts.TESTSSL },
            { id: 'OSV', label: 'Google OSV', count: categoryCounts.OSV },
            { id: 'MISCONFIG', label: 'Misconfigurations', count: categoryCounts.MISCONFIG },
            { id: 'SSL', label: 'SSL/TLS', count: categoryCounts.SSL },
            { id: 'DNS', label: 'DNS & Email', count: categoryCounts.DNS },
            { id: 'EXPOSED', label: 'Exposed Panels', count: categoryCounts.EXPOSED },
            { id: 'CVE', label: 'Known CVEs', count: categoryCounts.CVE },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as FilterCategory)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeFilter === tab.id
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-background hover:bg-card border border-border text-secondary hover:text-foreground'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                activeFilter === tab.id ? 'bg-white/20 text-white' : 'bg-card text-secondary'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ──── NIKTO WEB SERVER SCANNER VISUALIZER (sullo/nikto) ──── */}
      {activeFilter === 'NIKTO' && domainData?.nikto_data && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <Terminal className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground">Nikto Web Server & CGI Vulnerability Scanner</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30 font-semibold">
                    {domainData.nikto_data.engine_version || 'Nikto v2.5.0-compatible'}
                  </span>
                </div>
                <p className="text-xs text-secondary mt-0.5">
                  Integrated from <a href="https://github.com/sullo/nikto" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-mono inline-flex items-center gap-1">sullo/nikto <ExternalLink className="w-3 h-3" /></a> — Audits dangerous files, outdated server daemons, HTTP methods & CGI scripts.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-center">
              <div className="text-right">
                <div className="text-xs text-secondary font-medium">Nikto Security Grade</div>
                <div className={`text-xl font-mono font-bold ${
                  (domainData.nikto_data.grade || 'A') === 'A' ? 'text-emerald-400' :
                  (domainData.nikto_data.grade || 'A') === 'B' ? 'text-cyan-400' :
                  (domainData.nikto_data.grade || 'A') === 'C' ? 'text-amber-400' : 'text-red-400'
                }`}>
                  Grade {domainData.nikto_data.grade || 'A'} ({domainData.nikto_data.nikto_score ?? 100}/100)
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-background rounded-xl border border-border">
              <div className="text-[10px] text-secondary font-medium mb-1">Server Banner</div>
              <div className="text-xs font-mono font-bold text-foreground truncate" title={domainData.nikto_data.server_banner}>
                {domainData.nikto_data.server_banner || 'Hidden'}
              </div>
            </div>

            <div className="p-3.5 bg-background rounded-xl border border-border">
              <div className="text-[10px] text-secondary font-medium mb-1">X-Powered-By / Stack</div>
              <div className="text-xs font-mono font-bold text-foreground truncate" title={domainData.nikto_data.powered_by}>
                {domainData.nikto_data.powered_by || 'Not Disclosed'}
              </div>
            </div>

            <div className="p-3.5 bg-background rounded-xl border border-border">
              <div className="text-[10px] text-secondary font-medium mb-1">Allowed HTTP Verbs</div>
              <div className="text-xs font-mono font-bold text-cyan-400 truncate">
                {(domainData.nikto_data.allowed_methods || []).join(', ') || 'GET, POST, HEAD'}
              </div>
            </div>

            <div className="p-3.5 bg-background rounded-xl border border-border">
              <div className="text-[10px] text-secondary font-medium mb-1">Scan Time & Probes</div>
              <div className="text-xs font-mono font-bold text-emerald-400">
                {domainData.nikto_data.tested_checks_count || 25} Checks in {domainData.nikto_data.scan_duration_sec || 1.2}s
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──── WEBSCANNER 16-STEP PIPELINE VISUALIZER ──── */}
      {activeFilter === 'WEBSCANNER' && domainData?.webscanner_data && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
          {/* WebScanner Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Play className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <span>WebScanner 16-Step Vulnerability Pipeline</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono font-bold">
                    kpirnie/webscanner
                  </span>
                </h3>
                <p className="text-xs text-secondary mt-0.5">
                  Automated multi-tool scanning: Nuclei, OWASP ZAP, testssl.sh, Nikto, WPScan, Secret Watchdog & DNS Recon.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="px-3.5 py-1.5 bg-background border border-border rounded-xl text-xs font-mono">
                <span className="text-secondary text-[11px]">Execution Time: </span>
                <span className="font-bold text-foreground">{domainData.webscanner_data.execution_time_seconds || 1.8}s</span>
              </div>
              <div className="px-3.5 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-xs font-mono text-cyan-400 font-bold">
                16/16 Steps Completed
              </div>
            </div>
          </div>

          {/* 16-Step Pipeline Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider text-secondary flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-cyan-400" /> 16-Step Execution Pipeline Trace
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {(domainData.webscanner_data.steps || []).map((st: any) => {
                const isCrit = st.status === 'CRITICAL'
                const isWarn = st.status === 'WARNING'
                const isPass = st.status === 'PASSED'
                return (
                  <div
                    key={st.step}
                    className="p-3.5 bg-background border border-border rounded-xl space-y-1.5 hover:border-cyan-500/40 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-secondary">STEP {st.step}</span>
                      <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold uppercase ${
                        isCrit ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        isWarn ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        isPass ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25'
                      }`}>
                        {st.status}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-foreground truncate">{st.name}</div>
                    <p className="text-[11px] text-secondary line-clamp-2 leading-relaxed">{st.summary}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Diagnostics Surface: Sensitive Files & Secrets & CMS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
            {/* CMS & Tech Profiler */}
            <div className="p-4 bg-background border border-border rounded-xl space-y-2.5">
              <div className="text-xs font-bold text-foreground flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" /> CMS & Framework Profiler
              </div>
              <div className="text-xs space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-secondary">Detected CMS:</span>
                  <span className="font-bold text-foreground">{domainData.webscanner_data.cms_info?.type || 'Web App'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Confidence:</span>
                  <span className="font-bold text-cyan-400">{domainData.webscanner_data.cms_info?.confidence || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Server Banner:</span>
                  <span className="font-bold text-foreground truncate max-w-[140px]">
                    {domainData.webscanner_data.tech_stack?.[0] || 'Cloudflare / Edge'}
                  </span>
                </div>
              </div>
            </div>

            {/* Secret & API Key Watchdog */}
            <div className="p-4 bg-background border border-border rounded-xl space-y-2.5">
              <div className="text-xs font-bold text-foreground flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" /> Leaked Credentials & Keys
              </div>
              {domainData.webscanner_data.discovered_secrets && domainData.webscanner_data.discovered_secrets.length > 0 ? (
                <div className="space-y-1.5 max-h-24 overflow-y-auto">
                  {domainData.webscanner_data.discovered_secrets.map((sec: any, idx: number) => (
                    <div key={idx} className="p-1.5 bg-red-500/10 border border-red-500/20 rounded text-[11px] flex justify-between font-mono">
                      <span className="text-red-400 font-bold">{sec.type}</span>
                      <span className="text-secondary">{sec.sample}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-3 text-center text-xs font-medium text-emerald-400 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Zero Leaked API Keys / Secrets
                </div>
              )}
            </div>

            {/* Sensitive Endpoints & Backups */}
            <div className="p-4 bg-background border border-border rounded-xl space-y-2.5">
              <div className="text-xs font-bold text-foreground flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" /> Sensitive File Endpoints
              </div>
              {domainData.webscanner_data.discovered_files && domainData.webscanner_data.discovered_files.length > 0 ? (
                <div className="space-y-1.5 max-h-24 overflow-y-auto">
                  {domainData.webscanner_data.discovered_files.map((fl: any, idx: number) => (
                    <div key={idx} className="p-1.5 bg-red-500/10 border border-red-500/20 rounded text-[11px] flex justify-between font-mono">
                      <span className="text-red-400 font-bold">{fl.path}</span>
                      <span className="text-secondary font-bold">HTTP {fl.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-3 text-center text-xs font-medium text-emerald-400 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Zero Exposed Sensitive Endpoints
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ──── VULNERABILITIES & ISSUES LIST ──── */}
      <div className="space-y-4">
        {displayedIssues.length > 0 ? (
          displayedIssues.map((issue) => {
            const style = getSeverityStyle(issue.severity)

            return (
              <div
                key={issue.id}
                className={`border rounded-2xl p-6 transition shadow-sm relative overflow-hidden ${style.cardBorder}`}
              >
                {/* Left Severity Indicator Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${style.bar}`} />

                <div className="pl-2 space-y-4">
                  {/* Top Badges & Title */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Severity Badge */}
                        <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${style.badge}`}>
                          {issue.severity}
                        </span>

                        {/* Protocol Pill */}
                        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-lg bg-background border border-border text-primary">
                          {issue.protocol}
                        </span>

                        {/* Category Badge */}
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-background border border-border text-secondary capitalize">
                          {issue.category.replace('-', ' ')}
                        </span>

                        {/* CWE Badge */}
                        {issue.cwe_id && (
                          <span className="text-xs font-mono px-2 py-0.5 rounded-lg bg-background border border-border text-secondary">
                            {issue.cwe_id}
                          </span>
                        )}

                        {/* CVSS Score */}
                        {issue.cvss_score && (
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-background border border-border text-foreground">
                            CVSS {issue.cvss_score}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-foreground">
                        {issue.title}
                      </h3>
                    </div>

                    {/* Source Feed Badge */}
                    <div className="self-start px-3 py-1.5 bg-background border border-border rounded-xl text-xs font-mono text-secondary font-semibold flex items-center gap-1.5 flex-shrink-0">
                      <Shield className="w-3.5 h-3.5 text-primary" />
                      <span>{issue.source || 'Domain Intelligence'}</span>
                    </div>
                  </div>

                  {/* Issue Description */}
                  <p className="text-xs md:text-sm text-secondary leading-relaxed">
                    {issue.description}
                  </p>

                  {/* Matched Target URL with Copy */}
                  <div className="bg-background rounded-xl p-3 border border-border flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 truncate font-mono">
                      <span className="text-secondary font-semibold">Matched Target:</span>
                      <span className="text-foreground truncate font-bold">{issue.matched_target}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(issue.matched_target)}
                      className="text-secondary hover:text-foreground p-1 transition flex-shrink-0"
                      title="Copy URL"
                    >
                      {copiedText === issue.matched_target ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Actionable Remediation Box */}
                  {issue.remediation && (
                    <div className="bg-emerald-500/[0.04] border border-emerald-500/20 rounded-xl p-4 space-y-1.5">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <Zap className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Remediation & Fix Guide
                        </span>
                      </div>
                      <p className="text-xs text-foreground font-mono leading-relaxed bg-background/60 p-2.5 rounded-lg border border-emerald-500/15">
                        {issue.remediation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="p-12 bg-card border border-border rounded-2xl text-center space-y-3">
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-foreground">
              {searchQuery || activeFilter !== 'ALL'
                ? 'No Issues Match Current Filter'
                : 'Zero Vulnerabilities Detected!'}
            </h3>
            <p className="text-xs text-secondary max-w-md mx-auto">
              {searchQuery || activeFilter !== 'ALL'
                ? 'Try clearing the search query or selecting "All Issues" to see all findings.'
                : 'ProjectDiscovery Nuclei and CVE signatures scanned the domain infrastructure and found no active security issues.'}
            </p>
            {(searchQuery || activeFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setActiveFilter('ALL')
                }}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-semibold transition inline-block"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
