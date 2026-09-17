'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Loader2, 
  ShieldCheck, 
  Radio, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Server, 
  Lock, 
  Bug, 
  Activity,
  Clock
} from 'lucide-react'
import { getGradeFromScore } from '@/lib/securityScoring'

export interface ScanState {
  active: boolean
  companyId: number | null
  companyName: string
  domain: string
  step: number
  totalSteps: number
  phaseTitle: string
  phaseDetail: string
  percent: number
  secondsRemaining: number
  status: 'scanning' | 'completed' | 'error'
  resultScore?: number
  resultRisk?: string
  resultIssues?: number
  errorMessage?: string
}

interface ScanProgressNotificationProps {
  scan: ScanState
  onClose: () => void
}

export default function ScanProgressNotification({ scan, onClose }: ScanProgressNotificationProps) {
  if (!scan.active) return null

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1:
        return <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
      case 2:
        return <Lock className="w-4 h-4 text-purple-400 animate-pulse" />
      case 3:
        return <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
      case 4:
        return <Server className="w-4 h-4 text-sky-400 animate-pulse" />
      case 5:
        return <Bug className="w-4 h-4 text-rose-400 animate-pulse" />
      default:
        return <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="fixed bottom-5 right-5 z-[9999] max-w-md w-[calc(100vw-2.5rem)] sm:w-[420px] tech-border-card bg-command-950/95 backdrop-blur-xl border border-cyan-500/40 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.95),0_0_24px_rgba(0,242,254,0.2)] p-4 text-white overflow-hidden"
      >
        {/* Glowing Top Status Line */}
        <div 
          className="absolute top-0 left-0 right-0 h-[3px] transition-all duration-300"
          style={{
            background: scan.status === 'completed'
              ? 'linear-gradient(90deg, #00ff88, #00f2fe)'
              : scan.status === 'error'
              ? '#f43f5e'
              : 'linear-gradient(90deg, #00f2fe, #38bdf8, #6366f1)'
          }}
        />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${
              scan.status === 'completed'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                : scan.status === 'error'
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
            }`}>
              {scan.status === 'completed' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : scan.status === 'error' ? (
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              ) : (
                <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-hud font-bold uppercase tracking-wider text-slate-300">
                  {scan.status === 'completed' ? 'Scan Complete' : scan.status === 'error' ? 'Scan Failed' : 'Security Recon In Progress'}
                </span>
                {scan.status === 'scanning' && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    ~{scan.secondsRemaining}s left
                  </span>
                )}
              </div>
              <h4 className="text-sm font-hud font-bold text-white truncate font-mono mt-0.5">
                {scan.domain || scan.companyName}
              </h4>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scanning Content & Live Progress */}
        {scan.status === 'scanning' && (
          <div className="space-y-2.5 mt-1">
            {/* Phase Description */}
            <div className="flex items-center justify-between text-xs font-medium">
              <div className="flex items-center gap-1.5 text-slate-200">
                {getStepIcon(scan.step)}
                <span className="font-hud font-bold">{scan.phaseTitle}</span>
              </div>
              <span className="font-mono text-[11px] font-bold text-cyan-400">
                {scan.percent}%
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-tight line-clamp-1 font-mono">
              {scan.phaseDetail}
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-command-900 border border-cyan-900/50 rounded-full h-2 overflow-hidden p-[1px]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 shadow-[0_0_10px_rgba(0,242,254,0.5)]"
                initial={{ width: '0%' }}
                animate={{ width: `${Math.min(100, Math.max(5, scan.percent))}%` }}
                transition={{ ease: 'easeOut', duration: 0.35 }}
              />
            </div>

            {/* Multi-Engine Matrix Strip */}
            <div className="flex items-center justify-between pt-1 border-t border-cyan-900/40 text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${scan.step >= 1 ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                DNS/WHOIS
              </span>
              <span className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${scan.step >= 2 ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                TLS/SSL
              </span>
              <span className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${scan.step >= 3 ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                ThreatFox/VT
              </span>
              <span className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${scan.step >= 4 ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                Ports/CVEs
              </span>
            </div>
          </div>
        )}

        {/* Completed State */}
        {scan.status === 'completed' && (() => {
          const score = scan.resultScore ?? 95
          const gradeInfo = getGradeFromScore(score)
          return (
            <div className="mt-2.5 pt-2.5 border-t border-cyan-900/50 flex items-center justify-between text-xs gap-3">
              <div className="flex items-center gap-2.5">
                {/* Rating Badge */}
                <div className={`w-8 h-8 rounded-lg border flex flex-col items-center justify-center font-mono flex-shrink-0 ${gradeInfo.ring} ${gradeInfo.badge}`}>
                  <span className="text-xs font-black leading-none">{gradeInfo.grade}</span>
                  <span className="text-[5px] uppercase font-bold tracking-tight mt-0.5">Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-bold">
                    Score: {score}/100
                  </div>
                  <span className="text-slate-300 font-hud font-bold">
                    {scan.resultRisk || gradeInfo.risk} Risk
                  </span>
                </div>
              </div>
              <span className="text-slate-400 text-[10px] font-mono whitespace-nowrap">
                Telemetry Synced
              </span>
            </div>
          )
        })()}

        {/* Error State */}
        {scan.status === 'error' && (
          <div className="mt-2 pt-2 border-t border-rose-500/30 text-xs text-rose-300">
            {scan.errorMessage || 'Scan could not reach external engines. Retrying with local cache.'}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
