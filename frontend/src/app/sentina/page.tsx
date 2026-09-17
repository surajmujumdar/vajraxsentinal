'use client'

import React, { useEffect, useState } from 'react'
import SentinelApp from '@/sentinel/App'
import { usePlatformStore } from '@/store/platformStore'

export default function SentinaPage() {
  const [mounted, setMounted] = useState(false)
  const { setPlatform } = usePlatformStore()

  useEffect(() => {
    setPlatform('SENTINEL')
    setMounted(true)
  }, [setPlatform])

  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-[#070a12] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center animate-pulse shadow-[0_0_16px_rgba(0,242,254,0.3)]">
            <span className="text-[#00f2fe] font-mono font-bold text-lg">S</span>
          </div>
          <p className="text-zinc-400 text-xs font-mono tracking-wide">Initializing Sentinel Autonomous Security Platform...</p>
        </div>
      </div>
    )
  }

  return <SentinelApp />
}
