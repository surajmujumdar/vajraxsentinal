'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, ShieldAlert, Home, Terminal } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CRITICAL: React Client-Side Exception Caught by ErrorBoundary:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  private handleReset = () => {
    try {
      if (typeof window !== 'undefined') {
        // Clear potential corrupted storage keys
        localStorage.removeItem('platform-mode-storage')
        window.location.reload()
      }
    } catch {
      window.location.reload()
    }
  }

  private handleHardReset = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
        window.location.href = '/'
      }
    } catch {
      window.location.href = '/'
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-4 font-mono select-none">
          <div className="max-w-xl w-full bg-[#040814]/95 border border-rose-500/50 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(244,63,94,0.3)] backdrop-blur-xl relative overflow-hidden">
            {/* Top red laser accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_12px_#f43f5e]" />

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-[0_0_16px_rgba(244,63,94,0.4)]">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-base font-hud font-bold text-white uppercase tracking-wider">
                  TELEMETRY SUBSYSTEM EXCEPTION
                </h1>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  An isolated component error was intercepted by VAJRA/SENTINEL Guard
                </p>
              </div>
            </div>

            <div className="bg-[#020617] border border-rose-900/50 rounded-xl p-3.5 my-4 text-xs">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold mb-1.5">
                <Terminal className="w-3.5 h-3.5" />
                <span>EXCEPTION DIAGNOSTIC:</span>
              </div>
              <p className="text-slate-300 font-mono break-all text-[11px] leading-relaxed">
                {this.state.error?.message || 'An unexpected client-side rendering exception occurred.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
              <button
                onClick={this.handleReset}
                className="w-full sm:flex-1 py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-slate-950 font-hud font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(0,242,254,0.3)] border border-cyan-400/40"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Subsystem</span>
              </button>

              <button
                onClick={this.handleHardReset}
                className="w-full sm:flex-1 py-2.5 px-4 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-white font-hud font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 border border-rose-500/40"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Clear Cache & Reset</span>
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
