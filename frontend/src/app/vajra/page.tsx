'use client'

import React, { useEffect, useState } from 'react'
import Dashboard from '@/components/Dashboard'
import { usePlatformStore } from '@/store/platformStore'

export default function VajraPage() {
  const [mounted, setMounted] = useState(false)
  const { setPlatform } = usePlatformStore()

  useEffect(() => {
    setPlatform('VAJRA')
    setMounted(true)
  }, [setPlatform])

  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-command-950 items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center animate-pulse shadow-[0_0_16px_rgba(0,242,254,0.3)]">
            <span className="text-cyan-400 font-hud font-bold text-lg">V</span>
          </div>
          <p className="text-slate-400 text-xs font-mono tracking-wide">Initializing VAJRA Threat Intelligence Platform...</p>
        </div>
      </div>
    )
  }

  return <Dashboard />
}
