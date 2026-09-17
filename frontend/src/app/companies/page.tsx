'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import { useAuthStore } from '@/store/authStore'
import { useCompanyStore } from '@/store/companyStore'
import {
  Building2, Plus, Search, Globe, Shield, AlertTriangle, Activity,
  TrendingUp, Clock, ChevronRight, X, Loader2, RefreshCw, Trash2,
  CheckCircle, XCircle, Eye, BarChart3, Lock, Server, ExternalLink,
  User as UserIcon, Filter, Radio, Network, Copy, Check, Info, ArrowUpRight,
  Cpu, Terminal, Zap, Bug
} from 'lucide-react'

interface Company {
  id: number
  name: string
  domain: string
  industry: string | null
  description: string | null
  logo_url?: string | null
  monitoring_enabled: boolean
  is_active: boolean
  is_global: boolean
  created_by_user_id: number | null
  created_by_user_name: string | null
  created_by_user_email: string | null
  created_at: string
  updated_at: string | null
  last_analyzed: string | null
}

interface CompanyWithDetails extends Company {
  latest_risk_assessment: {
    risk_level: string
    security_score: number
    active_incidents: number
    abuse_confidence_score: number
    reputation_score: number
    vulnerabilities_count: number
    ssl_valid: boolean
    domain_age_days: number | null
    country: string | null
    isp: string | null
    assessment_details?: string
    created_at: string
  } | null
  active_threats_count: number
  total_threats_count: number
  primary_ip?: string | null
  resolved_ips?: string[] | null
}

const INDUSTRY_OPTIONS = [
  'Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Retail',
  'Energy', 'Telecommunications', 'Government', 'Education', 'Media',
  'Transportation', 'Real Estate', 'Legal', 'Consulting', 'Other'
]

import { companiesService } from '@/services/companies.service'
import ScanProgressNotification, { ScanState } from '@/components/ScanProgressNotification'
import { computeUnifiedSecurityStats, getGradeFromScore } from '@/lib/securityScoring'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function CompaniesPage() {
  const router = useRouter()
  const { user, token } = useAuthStore()
  const isAdmin = Boolean(user?.role?.toLowerCase() === 'admin')
  const storeCompanies = useCompanyStore((state) => state.companies)

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(200)
  const [mounted, setMounted] = useState(false)
  const [companies, setCompanies] = useState<any[]>(() => storeCompanies || [])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'global' | 'my' | 'users'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [analyzingId, setAnalyzingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Live Scanning Progress & Countdown HUD State
  const [scanState, setScanState] = useState<ScanState>({
    active: false,
    companyId: null,
    companyName: '',
    domain: '',
    step: 1,
    totalSteps: 5,
    phaseTitle: '',
    phaseDetail: '',
    percent: 0,
    secondsRemaining: 9,
    status: 'scanning'
  })

  // Add company form state
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    industry: '',
    description: '',
    monitoring_enabled: true,
    is_global: true,
  })
  const [formError, setFormError] = useState('')
  const [formSubmitting, setFormSubmitting] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (storeCompanies !== undefined) {
      setCompanies(storeCompanies)
    }
  }, [storeCompanies])

  useEffect(() => {
    if (isAdmin) {
      setFormData(prev => ({ ...prev, is_global: true }))
    } else {
      setFormData(prev => ({ ...prev, is_global: false }))
    }
  }, [isAdmin])

  const fetchCompanies = useCallback(async () => {
    try {
      const currentToken = useAuthStore.getState().token || token
      const headers: Record<string, string> = {}
      if (currentToken) {
        headers['Authorization'] = `Bearer ${currentToken}`
      }
      
      const candidateUrls = [
        `${API_URL}/api/companies/?active_only=true`,
        'http://localhost:8000/api/companies/?active_only=true',
        'http://127.0.0.1:8000/api/companies/?active_only=true',
        '/api/companies/?active_only=true'
      ]

      let res: Response | null = null
      for (const url of candidateUrls) {
        try {
          res = await fetch(url, { headers })
          if (res && res.ok) break
        } catch {
          // try next candidate
        }
      }

      if (res && res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setCompanies(data)
          useCompanyStore.getState().setCompanies(data)
        }
      }
    } catch (err) {
      console.error('Failed to fetch companies:', err)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (mounted) {
      fetchCompanies()
      const timer = setTimeout(() => fetchCompanies(), 1500)
      return () => clearTimeout(timer)
    }
  }, [mounted, fetchCompanies])

  const handleAddCompany = async () => {
    if (!formData.domain.trim()) { 
      setFormError('Domain name is required (e.g. acme.com)'); 
      return 
    }

    setFormSubmitting(true)
    setFormError('')

    try {
      const rawDomain = formData.domain.trim().toLowerCase()
      const cleanDomain = rawDomain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].split('?')[0].split('#')[0]
      
      if (!cleanDomain || !cleanDomain.includes('.')) {
        throw new Error('Please enter a valid domain (e.g. company.com)')
      }

      const companyName = formData.name.trim() || cleanDomain.split('.')[0].toUpperCase()
      const currentToken = useAuthStore.getState().token || token
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (currentToken) headers['Authorization'] = `Bearer ${currentToken}`

      const payload = {
        name: companyName,
        domain: cleanDomain,
        industry: formData.industry || 'Technology',
        description: formData.description || 'Monitored company asset',
        monitoring_enabled: true,
        is_global: true,
      }

      const candidateUrls = [
        `${API_URL}/api/companies/`,
        'http://localhost:8000/api/companies/',
        'http://127.0.0.1:8000/api/companies/',
        '/api/companies/'
      ]

      let res: Response | null = null
      let lastError = 'Failed to connect to monitoring backend server'

      for (const url of candidateUrls) {
        try {
          res = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
          })
          if (res && res.ok) break
          if (res && !res.ok) {
            const errJson = await res.json().catch(() => null)
            if (errJson?.detail) lastError = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail)
          }
        } catch (e: any) {
          lastError = e?.message || lastError
        }
      }

      if (!res || !res.ok) {
        throw new Error(lastError || 'Failed to add domain to monitoring. Please verify the domain and backend status.')
      }

      const newCompany = await res.json()
      setShowAddModal(false)
      setFormData({
        name: '',
        domain: '',
        industry: '',
        description: '',
        monitoring_enabled: true,
        is_global: true
      })
      setCompanies(prev => [newCompany, ...prev.filter(c => c.id !== newCompany.id)])
      useCompanyStore.getState().addCompanyToStore(newCompany)
      fetchCompanies()
      setTimeout(() => fetchCompanies(), 1500)
      setTimeout(() => fetchCompanies(), 4000)
    } catch (err: any) {
      setFormError(err.message || 'Failed to add domain')
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleAnalyze = async (companyId: number) => {
    const target = companies.find(c => c.id === companyId)
    setAnalyzingId(companyId)

    setScanState({
      active: true,
      companyId,
      companyName: target?.name || 'Target Asset',
      domain: target?.domain || '',
      step: 1,
      totalSteps: 5,
      phaseTitle: 'Phase 1: DNS & WHOIS Resolution',
      phaseDetail: 'Resolving Google DoH (A, AAAA, MX, TXT, NS) and ICANN RDAP registry...',
      percent: 18,
      secondsRemaining: 9,
      status: 'scanning'
    })

    let currentSec = 9
    const scanInterval = setInterval(() => {
      currentSec -= 1
      if (currentSec <= 0) currentSec = 1

      setScanState(prev => {
        if (!prev.active || prev.status !== 'scanning' || prev.companyId !== companyId) return prev
        let step = 1
        let phaseTitle = 'Phase 1: DNS & WHOIS Resolution'
        let phaseDetail = 'Resolving Google DoH (A, AAAA, MX, TXT, NS) and ICANN RDAP registry...'
        let percent = 18

        if (currentSec <= 2) {
          step = 5
          phaseTitle = 'Phase 5: Executive Risk Synthesis'
          phaseDetail = 'Synthesizing security score, vulnerability penalties, and AI remediation matrix...'
          percent = 95
        } else if (currentSec <= 4) {
          step = 4
          phaseTitle = 'Phase 4: Open Ports & Software CVEs'
          phaseDetail = 'Inspecting open ports via Nmap/Shodan and matching CVEs across Nuclei & Google OSV...'
          percent = 78
        } else if (currentSec <= 6) {
          step = 3
          phaseTitle = 'Phase 3: Multi-Source Threat Feeds'
          phaseDetail = 'Correlating VirusTotal v3, AbuseIPDB, AlienVault OTX, and ThreatFox IOCs...'
          percent = 55
        } else if (currentSec <= 8) {
          step = 2
          phaseTitle = 'Phase 2: TLS/SSL Certificate Audit'
          phaseDetail = 'Validating certificate authority trust chain, crt.sh logs, and cipher suites...'
          percent = 36
        }

        return {
          ...prev,
          step,
          phaseTitle,
          phaseDetail,
          percent,
          secondsRemaining: currentSec
        }
      })
    }, 1000)

    try {
      const currentToken = useAuthStore.getState().token || token
      const headers: Record<string, string> = {}
      if (currentToken) headers['Authorization'] = `Bearer ${currentToken}`
      
      const candidateUrls = [
        `${API_URL}/api/companies/${companyId}/analyze`,
        `http://localhost:8000/api/companies/${companyId}/analyze`,
        `http://127.0.0.1:8000/api/companies/${companyId}/analyze`,
        `/api/companies/${companyId}/analyze`
      ]

      let res: Response | null = null
      for (const url of candidateUrls) {
        try {
          res = await fetch(url, { method: 'POST', headers })
          if (res && res.ok) break
        } catch {
          // try next candidate
        }
      }

      clearInterval(scanInterval)

      if (res && res.ok) {
        const analyzeData = await res.json().catch(() => null)
        const assessment = analyzeData?.risk_assessment
        const analysisDataPayload = analyzeData?.analysis_data || (assessment?.assessment_details ? (typeof assessment.assessment_details === 'string' ? JSON.parse(assessment.assessment_details) : assessment.assessment_details) : null)
        
        const liveStats = computeUnifiedSecurityStats(
          analysisDataPayload ? { latest_risk_assessment: assessment, analysis_data: analysisDataPayload } : { latest_risk_assessment: assessment },
          scanState.domain
        )

        if (assessment) {
          const updatedAssessment = {
            ...assessment,
            security_score: liveStats.score,
            security_rating: liveStats.grade,
            risk_level: liveStats.risk,
            vulnerabilities_count: liveStats.totalIssues,
            active_incidents: liveStats.highCrit
          }
          useCompanyStore.getState().updateCompanyAssessment(companyId, updatedAssessment)
          setCompanies(prev => prev.map(c => c.id === companyId ? {
            ...c,
            last_analyzed: new Date().toISOString(),
            latest_risk_assessment: updatedAssessment,
            active_threats_count: analyzeData.threats_found || c.active_threats_count
          } : c))
        }

        setScanState(prev => ({
          ...prev,
          step: 5,
          percent: 100,
          secondsRemaining: 0,
          status: 'completed',
          resultScore: liveStats.score,
          resultRisk: liveStats.risk,
          resultIssues: liveStats.totalIssues
        }))

        // Auto dismiss completed toast after 4.5s
        setTimeout(() => {
          setScanState(prev => prev.companyId === companyId && prev.status === 'completed' ? { ...prev, active: false } : prev)
        }, 4500)

        await fetchCompanies()
      } else {
        setScanState(prev => ({
          ...prev,
          status: 'error',
          errorMessage: 'Scan request timed out. Retaining existing telemetry.'
        }))
        setTimeout(() => {
          setScanState(prev => ({ ...prev, active: false }))
        }, 4000)
      }
    } catch (err: any) {
      clearInterval(scanInterval)
      console.error('Analysis failed:', err)
      setScanState(prev => ({
        ...prev,
        status: 'error',
        errorMessage: err?.message || 'Error executing threat analysis scan.'
      }))
      setTimeout(() => {
        setScanState(prev => ({ ...prev, active: false }))
      }, 4000)
    } finally {
      setAnalyzingId(null)
    }
  }

  const handleDelete = async (companyId: number) => {
    if (!confirm('Are you sure you want to remove this company from monitoring?')) return
    setDeletingId(companyId)
    try {
      const currentToken = useAuthStore.getState().token || token
      const headers: Record<string, string> = {}
      if (currentToken) headers['Authorization'] = `Bearer ${currentToken}`
      const res = await fetch(`${API_URL}/api/companies/${companyId}`, {
        method: 'DELETE',
        headers
      })
      if (res.ok) {
        setCompanies(prev => prev.filter(c => c.id !== companyId))
      } else {
        const err = await res.json().catch(() => null)
        alert(err?.detail || 'Failed to delete company')
      }
    } catch (err) {
      console.error('Delete failed:', err)
      alert('Error deleting company')
    } finally {
      setDeletingId(null)
    }
  }

  const handleViewDetails = (companyId: number) => {
    router.push(`/companies/${companyId}`)
  }

  const isCompanyGlobal = (c: Company) => {
    if (c.is_global === true) return true
    if (c.created_by_user_email && (c.created_by_user_email === 'admin@indigo.com' || c.created_by_user_email.toLowerCase().includes('admin'))) return true
    if (c.created_by_user_name && c.created_by_user_name.toLowerCase().includes('admin')) return true
    if (c.is_global === false) return false
    return true
  }

  const isCompanyUserAdded = (c: Company) => {
    return !isCompanyGlobal(c)
  }

  const isCompanyMine = (c: Company) => {
    if (!user) return false
    if (c.created_by_user_id && user.id && String(c.created_by_user_id) === String(user.id)) return true
    if (c.created_by_user_email && user.email && c.created_by_user_email.toLowerCase() === user.email.toLowerCase()) return true
    return false
  }

  // Count metrics for tabs
  const globalCount = companies.filter(c => isCompanyGlobal(c)).length
  const userAddedCount = companies.filter(c => isCompanyUserAdded(c)).length
  const myCount = companies.filter(c => isCompanyMine(c)).length

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.industry || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.created_by_user_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.created_by_user_email || '').toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (activeTab === 'global') {
      return isCompanyGlobal(c)
    } else if (activeTab === 'users') {
      return isCompanyUserAdded(c)
    } else if (activeTab === 'my') {
      return isCompanyMine(c)
    }
    return true
  })

  const getRiskBadge = (level: string) => {
    const l = level?.toLowerCase() || ''
    if (l === 'critical') return 'bg-red-500/15 text-red-400 border-red-500/30'
    if (l === 'high') return 'bg-orange-500/15 text-orange-400 border-orange-500/30'
    if (l === 'medium') return 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    if (l === 'low') return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    return 'bg-slate-500/15 text-slate-400 border-slate-500/30'
  }

  const getGradeFromScore = (score: number) => {
    if (score >= 95) {
      return { grade: 'A+', risk: 'LOW', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40', ring: 'border-emerald-500/40', text: 'text-emerald-400' }
    } else if (score >= 85) {
      return { grade: 'A', risk: 'LOW', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40', ring: 'border-emerald-500/40', text: 'text-emerald-400' }
    } else if (score >= 70) {
      return { grade: 'B', risk: 'MEDIUM', badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40', ring: 'border-cyan-500/40', text: 'text-cyan-400' }
    } else if (score >= 50) {
      return { grade: 'C', risk: 'HIGH', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/40', ring: 'border-amber-500/40', text: 'text-amber-400' }
    } else if (score >= 30) {
      return { grade: 'D', risk: 'HIGH', badge: 'bg-orange-500/15 text-orange-400 border-orange-500/40', ring: 'border-orange-500/40', text: 'text-orange-400' }
    } else {
      return { grade: 'F', risk: 'CRITICAL', badge: 'bg-rose-500/15 text-rose-400 border-rose-500/40', ring: 'border-rose-500/40', text: 'text-rose-400' }
    }
  }

  const getScoreColorObj = (score: number) => {
    if (score >= 90) {
      return {
        textColor: 'text-emerald-400',
        badgeBg: 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.35)] ring-1 ring-emerald-500/40 animate-pulse',
        dotColor: 'bg-emerald-400 animate-ping',
        glowRing: 'ring-emerald-500/50'
      }
    }
    if (score >= 80) {
      return {
        textColor: 'text-teal-400',
        badgeBg: 'bg-teal-500/15 border-teal-500/50 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.35)] ring-1 ring-teal-500/40 animate-pulse',
        dotColor: 'bg-teal-400 animate-ping',
        glowRing: 'ring-teal-500/50'
      }
    }
    if (score >= 70) {
      return {
        textColor: 'text-cyan-400',
        badgeBg: 'bg-cyan-500/15 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.35)] ring-1 ring-cyan-500/40 animate-pulse',
        dotColor: 'bg-cyan-400 animate-ping',
        glowRing: 'ring-cyan-500/50'
      }
    }
    if (score >= 50) {
      return {
        textColor: 'text-amber-400',
        badgeBg: 'bg-amber-500/15 border-amber-500/50 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.35)] ring-1 ring-amber-500/40 animate-pulse',
        dotColor: 'bg-amber-400 animate-ping',
        glowRing: 'ring-amber-500/50'
      }
    }
    return {
      textColor: 'text-red-400',
      badgeBg: 'bg-red-500/20 border-red-500/60 text-red-400 shadow-[0_0_18px_rgba(239,68,68,0.45)] ring-1 ring-red-500/50 animate-pulse',
      dotColor: 'bg-red-400 animate-ping',
      glowRing: 'ring-red-500/60'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400'
    if (score >= 70) return 'text-cyan-400'
    if (score >= 50) return 'text-amber-400'
    return 'text-red-400'
  }

  return (
    <div className="flex min-h-screen bg-command-950 text-white font-sans">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-4 w-full max-w-[1440px] mx-auto space-y-3.5">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-hud font-bold text-white uppercase tracking-wider text-glow-cyan flex items-center gap-2.5">
                <Building2 className="w-6 h-6 text-cyan-400" /> Enterprise Target Scope & EASM
              </h1>
              <p className="text-slate-400 text-xs font-medium mt-0.5 font-mono">
                External Attack Surface Management &bull; Continuous Asset Monitoring & Multi-Scanner Auditing
              </p>
            </div>
            <button
              onClick={() => {
                setFormError('')
                setShowAddModal(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-hud font-bold rounded-xl hover:brightness-110 transition-all shadow-[0_0_16px_rgba(0,242,254,0.4)] border border-cyan-400/40 text-xs uppercase tracking-wider"
            >
              <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
              Add Target Asset
            </button>
          </div>

          {/* Filter Tabs & Search Bar */}
          <div className="space-y-3 mb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-command-900 border border-cyan-500/20 rounded-xl flex-wrap">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-hud font-bold uppercase transition-all flex items-center gap-1.5 ${
                    activeTab === 'all'
                      ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(0,242,254,0.4)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  All Scope
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${activeTab === 'all' ? 'bg-slate-950/25 text-slate-950' : 'bg-command-950 text-cyan-400 border border-cyan-500/30'}`}>
                    {companies.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('global')}
                  className={`px-3 py-1 rounded-lg text-xs font-hud font-bold uppercase transition-all flex items-center gap-1.5 ${
                    activeTab === 'global'
                      ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(0,242,254,0.4)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  Global Core
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${activeTab === 'global' ? 'bg-slate-950/25 text-slate-950' : 'bg-command-950 text-cyan-400 border border-cyan-500/30'}`}>
                    {globalCount}
                  </span>
                </button>

                {/* User Monitored Tab - ONLY visible to Admin */}
                {isAdmin && (
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`px-3 py-1 rounded-lg text-xs font-hud font-bold uppercase transition-all flex items-center gap-1.5 ${
                      activeTab === 'users'
                        ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(0,242,254,0.4)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <UserIcon className="w-3.5 h-3.5 text-[#fbbf24]" />
                    User Monitored
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${activeTab === 'users' ? 'bg-slate-950/25 text-slate-950' : 'bg-command-950 text-amber-400 border border-amber-500/30'}`}>
                      {userAddedCount}
                    </span>
                  </button>
                )}

                {/* My Monitored Tab */}
                <button
                  onClick={() => setActiveTab('my')}
                  className={`px-3 py-1 rounded-lg text-xs font-hud font-bold uppercase transition-all flex items-center gap-1.5 ${
                    activeTab === 'my'
                      ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(0,242,254,0.4)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5 text-purple-400" />
                  My Assets
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${activeTab === 'my' ? 'bg-slate-950/25 text-slate-950' : 'bg-command-950 text-purple-400 border border-purple-500/30'}`}>
                    {myCount}
                  </span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search domain, name, industry..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-xs text-foreground placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>

          {/* Companies Cards Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-2xl p-8">
              <Building2 className="w-12 h-12 text-secondary/30 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-foreground">No companies found</h3>
              <p className="text-xs text-secondary mt-1 max-w-sm mx-auto">
                {searchQuery ? 'No results matched your search query.' : 'Add your first company to start monitoring threat intelligence.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredCompanies.map((company) => {
                  const assessment = (company as any).latest_risk_assessment
                  
                  let det: any = null
                  if (assessment?.assessment_details) {
                    try {
                      det = typeof assessment.assessment_details === 'string' 
                        ? JSON.parse(assessment.assessment_details) 
                        : assessment.assessment_details
                    } catch (e) {}
                  }

                  // Accurately compute dynamic security score, rating grade, and issue breakdown (100% matched with inner view)
                  const stats = computeUnifiedSecurityStats(company)
                  const score = stats.score
                  const gradeInfo = stats.gradeInfo
                  const riskLevel = stats.risk
                  const totalIssues = stats.totalIssues
                  const highCritIssues = stats.highCrit
                  const totalCves = stats.totalCves
                  const isCreatedByCurrentUser = user && company.created_by_user_id === Number(user.id)
                  const canDelete = isAdmin || isCreatedByCurrentUser

                  // Extract primary resolved IP
                  let companyIp = (company as any).primary_ip || (company as any).resolved_ips?.[0]
                  if (!companyIp && det) {
                    companyIp = det?.connections?.ip_addresses?.[0] || det?.virustotal_data?.resolved_ips?.[0] || det?.dns_records?.ips?.[0]
                  }

                  return (
                    <motion.div
                      key={company.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
                    >
                      <div>
                        {/* Company Header */}
                        <div 
                          onClick={() => handleViewDetails(company.id)}
                          className="flex items-start justify-between mb-3 cursor-pointer group/hdr"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <img
                              src={company.logo_url || `https://www.google.com/s2/favicons?domain=${company.domain}&sz=64`}
                              alt={company.name}
                              className="w-10 h-10 object-contain rounded-lg border border-border bg-background p-1 flex-shrink-0 group-hover/hdr:border-primary/50 transition-colors"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${company.domain}&sz=64`
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-semibold text-foreground truncate group-hover/hdr:text-primary transition-colors">
                                {company.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <div className="flex items-center gap-1.5 text-xs text-secondary font-mono">
                                  <Globe className="w-3.5 h-3.5 text-primary/80" />
                                  <span className="font-semibold text-foreground/90">{company.domain}</span>
                                </div>
                                {companyIp && (
                                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 font-mono font-bold flex items-center gap-1 shadow-sm">
                                    <Server className="w-3 h-3 text-cyan-400" />
                                    <span>{companyIp}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end ml-2 gap-1.5">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className={`w-2 h-2 rounded-full ${company.is_active ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-red-400'}`} />
                              <span className="text-[10px] text-secondary font-medium">{company.is_active ? 'Active' : 'Inactive'}</span>
                            </div>
                            
                            {/* Security Rating & Score Header matching inside view */}
                            <div className="flex items-center gap-2.5 bg-background/80 border border-border/80 rounded-2xl p-2 px-2.5 shadow-sm">
                              {/* Prominent Rating Badge */}
                              <div className={`w-11 h-11 rounded-xl border-2 flex flex-col items-center justify-center font-mono flex-shrink-0 ${gradeInfo.ring} ${gradeInfo.badge}`}>
                                <span className="text-base font-black leading-none">{gradeInfo.grade}</span>
                                <span className="text-[7px] uppercase font-bold tracking-wider mt-0.5 opacity-90">Rating</span>
                              </div>

                              {/* Score & Label Aligned with Rating Badge */}
                              <div className="flex flex-col justify-center">
                                <div className="flex items-baseline gap-1 font-mono">
                                  <span className={`font-black text-lg leading-none ${gradeInfo.text}`}>{score}</span>
                                  <span className="text-[11px] text-secondary/70 font-semibold">/100</span>
                                </div>
                                <span className="text-[9px] text-secondary font-medium tracking-tight mt-0.5 whitespace-nowrap">Security Score</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-3">
                          {company.is_global ? (
                            <span className="text-[10px] px-2 py-0.5 bg-blue-500/15 text-blue-400 border border-blue-500/30 rounded-full font-semibold flex items-center gap-1">
                              <Globe className="w-3 h-3" /> Global (Admin)
                            </span>
                          ) : isCreatedByCurrentUser ? (
                            <span className="text-[10px] px-2 py-0.5 bg-purple-500/15 text-purple-400 border border-purple-500/30 rounded-full font-semibold flex items-center gap-1">
                              <UserIcon className="w-3 h-3" /> My Monitored
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-full font-semibold flex items-center gap-1" title={company.created_by_user_email || ''}>
                              <UserIcon className="w-3 h-3" /> User Monitored ({company.created_by_user_name || company.created_by_user_email || 'User'})
                            </span>
                          )}

                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${getRiskBadge(riskLevel)}`}>
                            {riskLevel}
                          </span>

                          {company.industry && (
                            <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                              {company.industry}
                            </span>
                          )}
                        </div>

                        {/* Quick Stats Grid: Total Issues | High/Critical Issues | Total CVEs */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <div className="bg-background/60 rounded-xl p-2.5 text-center border border-border/60 shadow-inner">
                            <Shield className="w-4 h-4 text-primary mx-auto mb-1.5" />
                            <div className="text-[10px] text-secondary font-medium truncate">Total Issues</div>
                            <div className="text-xs font-bold text-foreground font-mono mt-0.5">
                              {totalIssues} Issues
                            </div>
                          </div>
                          <div className="bg-background/60 rounded-xl p-2.5 text-center border border-border/60 shadow-inner">
                            <AlertTriangle className={`w-4 h-4 mx-auto mb-1.5 ${highCritIssues > 0 ? 'text-red-400' : 'text-secondary/70'}`} />
                            <div className="text-[10px] text-secondary font-medium truncate">High / Critical</div>
                            <div className={`text-xs font-bold font-mono mt-0.5 ${highCritIssues > 0 ? 'text-red-400 font-black' : 'text-foreground'}`}>
                              {highCritIssues} High/Crit
                            </div>
                          </div>
                          <div className="bg-background/60 rounded-xl p-2.5 text-center border border-border/60 shadow-inner">
                            <Bug className={`w-4 h-4 mx-auto mb-1.5 ${totalCves > 0 ? 'text-amber-400' : 'text-secondary/70'}`} />
                            <div className="text-[10px] text-secondary font-medium truncate">Total CVEs</div>
                            <div className={`text-xs font-bold font-mono mt-0.5 ${totalCves > 0 ? 'text-amber-400 font-black' : 'text-foreground'}`}>
                              {totalCves} CVEs
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-3 border-t border-border mt-auto">
                        <button
                          onClick={() => handleViewDetails(company.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all text-xs font-semibold shadow-md shadow-primary/20"
                          title="Open Full Screen Master Feed & Company Telemetry"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Details
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/domain-analysis?domain=${encodeURIComponent(company.domain)}`)
                          }}
                          className="p-2 bg-background hover:bg-card-hover border border-border text-cyan-400 hover:text-cyan-300 rounded-xl transition-colors"
                          title="Inspect live DNS & WHOIS telemetry in Domain Pulse"
                        >
                          <Globe className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleAnalyze(company.id)}
                          disabled={analyzingId === company.id}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${
                            analyzingId === company.id
                              ? 'bg-[#00f2fe]/15 text-[#00f2fe] border border-[#00f2fe]/40 animate-pulse'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40'
                          }`}
                        >
                          {analyzingId === company.id ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00f2fe]" />
                              <span>Scanning (~{scanState.secondsRemaining}s)</span>
                            </>
                          ) : (
                            <>
                              <BarChart3 className="w-3.5 h-3.5" />
                              <span>Analyze</span>
                            </>
                          )}
                        </button>
                        {canDelete ? (
                          <button
                            onClick={() => handleDelete(company.id)}
                            disabled={deletingId === company.id}
                            className="p-2 text-secondary hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Remove company"
                          >
                            {deletingId === company.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        ) : (
                          <div
                            className="p-2 text-secondary/30 cursor-not-allowed"
                            title="Global admin company"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>

      {/* ──── ADD COMPANY MODAL ──── */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-background/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-foreground">Add Company</h2>
                    <p className="text-[11px] text-secondary">
                      {isAdmin ? 'Global or private telemetry monitoring' : 'Add domain to your private monitoring portfolio'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 hover:bg-background rounded-lg transition-colors text-secondary hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-3.5 overflow-y-auto flex-1">
                {formError && (
                  <div className="flex items-center gap-2 p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {formError}
                  </div>
                )}

                {/* Company Name & Domain side by side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Company Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Acme Corp"
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground placeholder:text-secondary/50 focus:outline-none focus:border-primary text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Domain <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary" />
                      <input
                        type="text"
                        value={formData.domain}
                        onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                        placeholder="e.g. acme.com"
                        className="w-full pl-8 pr-3 py-2 bg-background border border-border rounded-xl text-foreground placeholder:text-secondary/50 focus:outline-none focus:border-primary text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Industry & Visibility */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Industry Sector
                    </label>
                    <select
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-primary text-xs"
                    >
                      <option value="">Select industry...</option>
                      {INDUSTRY_OPTIONS.map((ind) => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Visibility Scope
                    </label>
                    {isAdmin ? (
                      <div className="flex items-center justify-between px-3 py-1.5 bg-background border border-border rounded-xl h-[36px]">
                        <span className="text-xs text-foreground font-medium truncate">
                          {formData.is_global ? 'Global' : 'Private'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, is_global: !formData.is_global })}
                          className={`relative w-8 h-4 rounded-full transition-colors ${formData.is_global ? 'bg-primary' : 'bg-secondary/30'}`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${formData.is_global ? 'translate-x-4' : 'translate-x-0'}`}
                          />
                        </button>
                      </div>
                    ) : (
                      <div className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-[11px] text-purple-300 flex items-center gap-1.5 h-[36px]">
                        <UserIcon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">Private Portfolio</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief note or description..."
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground placeholder:text-secondary/50 focus:outline-none focus:border-primary text-xs"
                  />
                </div>
              </div>

              {/* Modal Footer - Always Sticky & 100% Visible */}
              <div className="flex items-center gap-2.5 px-5 py-3.5 border-t border-border bg-background/60">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-card hover:bg-card-hover border border-border rounded-xl text-secondary hover:text-foreground transition-colors text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCompany}
                  disabled={formSubmitting}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors text-xs font-semibold disabled:opacity-50 shadow-md shadow-primary/20"
                >
                  {formSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  {formSubmitting ? 'Adding...' : 'Add Company'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Tactical Scan Progress & Countdown Notification HUD */}
      <ScanProgressNotification 
        scan={scanState} 
        onClose={() => setScanState(prev => ({ ...prev, active: false }))} 
      />
    </div>
  )
}
