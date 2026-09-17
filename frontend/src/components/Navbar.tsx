'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Bell,
  Search,
  User,
  LogOut,
  Loader2,
  ChevronDown,
  Download,
  Shield,
  Radio,
  ExternalLink,
  CheckCheck
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { useCompanyStore } from '@/store/companyStore'
import { useLanguageStore } from '@/store/languageStore'
import { useNotificationStore } from '@/store/notificationStore'
import { SUPPORTED_LANGUAGES } from '@/i18n/translations'
import PlatformToggle from './PlatformToggle'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const { selectedCompany } = useCompanyStore()
  const { currentLanguage, t } = useLanguageStore()
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotificationStore()
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState('')
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [downloadingReport, setDownloadingReport] = useState(false)
  const [reportDropdownOpen, setReportDropdownOpen] = useState(false)
  const [notifFilter, setNotifFilter] = useState<'ALL' | 'CRITICAL' | 'RANSOMWARE' | 'GDELT'>('ALL')

  const notifRef = useRef<HTMLDivElement | null>(null)
  const reportRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false)
      }
      if (reportRef.current && !reportRef.current.contains(e.target as Node)) {
        setReportDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const handleDownloadReport = async (reportType: string) => {
    setDownloadingReport(true)
    setReportDropdownOpen(false)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const url = selectedCompany 
        ? `${API_URL}/api/reports/company/${selectedCompany.id}`
        : `${API_URL}/api/reports/${reportType}`
      
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = selectedCompany 
        ? `${selectedCompany.name.replace(' ', '_')}_report.pdf`
        : `${reportType}_report.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Error downloading report:', error)
      alert('Failed to download report. Please try again.')
    } finally {
      setDownloadingReport(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const sectionMap: { [key: string]: string } = {
        'threat': 'threat-intelligence',
        'intelligence': 'threat-intelligence',
        'ransomware': 'ransomware',
        'attack': 'global-attacks',
        'map': 'global-attacks',
        'company': 'companies',
        'companies': 'companies',
        'alert': 'alerts',
        'news': 'updates',
        'actor': 'threat-intelligence/actors',
        'industry': 'threat-intelligence/industries',
        'domain': 'domain-analysis',
        'pulse': 'domain-analysis',
        'setting': 'settings',
        'admin': 'admin',
        'repo': 'repositories',
        'github': 'repositories'
      }
      
      let matchedSection = null
      for (const [key, section] of Object.entries(sectionMap)) {
        if (query.includes(key)) {
          matchedSection = section
          break
        }
      }
      
      if (matchedSection) {
        router.push(`/${matchedSection}`)
      } else {
        router.push(`/companies`)
      }
      setSearchQuery('')
    }
  }

  const filteredNotifs = notifications.filter((n) => {
    if (notifFilter === 'CRITICAL') return n.severity === 'CRITICAL'
    if (notifFilter === 'RANSOMWARE') return n.type === 'RANSOMWARE'
    if (notifFilter === 'GDELT') return n.type === 'GDELT_NEWS'
    return true
  })

  return (
    <header
      style={{
        height: '50px',
        backgroundColor: 'rgba(4, 8, 20, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        gap: '12px'
      }}
      className="font-hud"
    >
      {/* Left: Brand Status Chip */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '8px',
            background: 'rgba(6, 182, 212, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            fontSize: '10.5px',
            fontWeight: 800,
            color: '#38bdf8',
            boxShadow: '0 0 12px rgba(6, 182, 212, 0.2)',
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'nowrap'
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#00f2fe',
              boxShadow: '0 0 8px #00f2fe',
              flexShrink: 0
            }}
            className="animate-pulse"
          />
          <span className="hidden xl:inline">VAJRA: GLOBAL THREAT RADAR</span>
          <span className="hidden sm:inline xl:hidden">THREAT RADAR</span>
          <span className="sm:hidden">VAJRA</span>
        </div>

        {/* DEFCON Level Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-[10px] font-mono font-bold text-rose-400">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
          <span>DEFCON: LEVEL 2</span>
        </div>
      </div>

      {/* Center: Non-overlapping Platform Switcher Toggle */}
      <div className="flex items-center justify-center flex-shrink-0">
        <PlatformToggle />
      </div>

      {/* Right Controls: Search + Report + Notif + User */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
        {/* Quick Search Bar */}
        <form onSubmit={handleSearch} className="relative hidden md:block">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '8px',
              background: 'rgba(7, 15, 36, 0.8)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              color: '#94a3b8',
              width: '145px',
              height: '30px',
              transition: 'all 0.15s'
            }}
            className="lg:w-[175px] focus-within:border-cyan-400 focus-within:shadow-[0_0_12px_rgba(0,242,254,0.35)]"
          >
            <Search size={12} color="#94a3b8" className="flex-shrink-0" />
            <input
              type="text"
              placeholder={t('searchPlaceholder', 'Quick Search...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 600,
                width: '100%'
              }}
            />
            <span
              style={{
                fontSize: '9px',
                fontFamily: 'var(--font-mono)',
                padding: '1px 5px',
                borderRadius: '3px',
                background: 'rgba(15, 29, 66, 0.8)',
                color: '#94a3b8',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                flexShrink: 0
              }}
            >
              /
            </span>
          </div>
        </form>

        {/* PDF Report Dropdown */}
        <div className="relative flex-shrink-0" ref={reportRef}>
          <button
            onClick={() => setReportDropdownOpen(!reportDropdownOpen)}
            disabled={downloadingReport}
            style={{
              height: '30px',
              padding: '0 10px',
              fontSize: '10.5px',
              fontWeight: 800,
              letterSpacing: '0.4px',
              borderRadius: '8px',
              background: 'linear-gradient(90deg, #00f2fe 0%, #0284c7 100%)',
              border: '1px solid #00f2fe',
              color: '#020617',
              boxShadow: '0 0 12px rgba(0, 242, 254, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer'
            }}
            className="hover:brightness-110 transition-all disabled:opacity-50"
          >
            {downloadingReport ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
            <span className="hidden sm:inline">REPORT</span>
            <ChevronDown size={11} />
          </button>

          {reportDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                marginTop: '6px',
                width: '210px',
                backgroundColor: '#040814',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '10px',
                boxShadow: '0 12px 36px rgba(0, 0, 0, 0.95), 0 0 20px rgba(6, 182, 212, 0.2)',
                zIndex: 50,
                overflow: 'hidden',
                padding: '4px'
              }}
            >
              <button
                onClick={() => handleDownloadReport('dashboard')}
                className="w-full text-left px-3 py-2 text-xs font-bold text-white hover:bg-cyan-500/15 rounded-md flex items-center justify-between transition-colors"
              >
                <span>Full Security Audit</span>
                <span className="text-[9.5px] text-cyan-400 font-mono font-bold">PDF</span>
              </button>
              <button
                onClick={() => handleDownloadReport('threat-intelligence')}
                className="w-full text-left px-3 py-2 text-xs font-bold text-white hover:bg-cyan-500/15 rounded-md flex items-center justify-between transition-colors"
              >
                <span>Threat Intel Brief</span>
                <span className="text-[9.5px] text-cyan-400 font-mono font-bold">PDF</span>
              </button>
              <button
                onClick={() => handleDownloadReport('ransomware')}
                className="w-full text-left px-3 py-2 text-xs font-bold text-white hover:bg-cyan-500/15 rounded-md flex items-center justify-between transition-colors"
              >
                <span>Ransomware Report</span>
                <span className="text-[9.5px] text-cyan-400 font-mono font-bold">PDF</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative flex-shrink-0" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            style={{
              position: 'relative',
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              background: 'rgba(7, 15, 36, 0.8)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              color: unreadCount > 0 ? '#00f2fe' : '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            className="hover:border-cyan-400 hover:shadow-[0_0_10px_rgba(0,242,254,0.3)]"
          >
            <Bell size={14} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  minWidth: '16px',
                  height: '16px',
                  padding: '0 4px',
                  borderRadius: '8px',
                  background: '#f43f5e',
                  color: '#ffffff',
                  fontSize: '9px',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 8px #f43f5e'
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                marginTop: '8px',
                width: '320px',
                backgroundColor: '#040814',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '12px',
                boxShadow: '0 16px 48px rgba(0, 0, 0, 0.95), 0 0 24px rgba(6, 182, 212, 0.2)',
                zIndex: 50,
                overflow: 'hidden'
              }}
            >
              <div className="flex items-center justify-between p-3 border-b border-cyan-900/40 bg-command-900">
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-cyan-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Alert Center</span>
                  {unreadCount > 0 && (
                    <span className="text-[9px] font-mono font-bold text-rose-400 bg-rose-500/20 border border-rose-500/40 px-1.5 py-0.2 rounded">
                      {unreadCount} NEW
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={markAllAsRead}
                    className="text-[9.5px] font-mono text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <CheckCheck size={11} /> Mark Read
                  </button>
                  <button
                    onClick={clearAll}
                    className="text-[9.5px] font-mono text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex border-b border-cyan-900/40 bg-command-950 p-1 gap-1">
                {(['ALL', 'CRITICAL', 'RANSOMWARE', 'GDELT'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setNotifFilter(filter)}
                    className={`flex-1 py-1 text-[8.5px] font-mono font-bold rounded transition-colors ${
                      notifFilter === filter
                        ? 'bg-cyan-500/20 border border-cyan-400/40 text-cyan-200'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Notification Items */}
              <div className="max-h-64 overflow-y-auto divide-y divide-cyan-900/30">
                {filteredNotifs.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 font-mono">
                    No alerts found in this category
                  </div>
                ) : (
                  filteredNotifs.slice(0, 10).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`p-2.5 hover:bg-cyan-500/10 cursor-pointer transition-colors ${
                        !n.is_read ? 'bg-cyan-500/5' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span
                              className={`text-[8px] font-mono font-bold px-1 py-0.2 rounded border ${
                                n.severity === 'CRITICAL'
                                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                                  : n.severity === 'HIGH'
                                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                                  : 'bg-slate-800 border-slate-700 text-slate-300'
                              }`}
                            >
                              {n.severity}
                            </span>
                            <span className="text-[9.5px] font-bold text-white truncate max-w-[180px]">
                              {n.title}
                            </span>
                          </div>
                          <p className="text-[9.5px] text-slate-400 line-clamp-2 leading-tight">
                            {n.message}
                          </p>
                        </div>
                        {!n.is_read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f2fe] flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-cyan-900/40 bg-command-950 text-center">
                <button
                  onClick={() => {
                    setNotificationsOpen(false)
                    router.push('/alerts')
                  }}
                  className="text-[10px] font-mono font-bold text-cyan-400 hover:underline"
                >
                  View All Alerts →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Role */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            paddingLeft: '8px',
            borderLeft: '1px solid rgba(56, 189, 248, 0.2)',
            flexShrink: 0
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #00f2fe 0%, #0284c7 100%)',
              border: '1px solid #00f2fe',
              boxShadow: '0 0 8px rgba(0, 242, 254, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#020617',
              flexShrink: 0
            }}
          >
            <User size={13} />
          </div>
          <div className="hidden lg:block text-left max-w-[110px] xl:max-w-[135px]">
            <div
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {user?.name || 'Admin User'}
            </div>
            <div
              style={{
                fontSize: '8.5px',
                fontWeight: 800,
                color: '#38bdf8',
                letterSpacing: '0.6px',
                fontFamily: 'var(--font-mono)'
              }}
            >
              OPERATOR
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            className="hover:text-rose-400 transition-colors"
            title="Logout"
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </header>
  )
}
