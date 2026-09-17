'use client'

import { motion } from 'framer-motion'
import { Shield, Crosshair } from 'lucide-react'
import { usePlatformStore, PlatformMode } from '@/store/platformStore'
import { useRouter, usePathname } from 'next/navigation'

interface PlatformToggleProps {
  className?: string
  compact?: boolean
}

export default function PlatformToggle({ className = '', compact = false }: PlatformToggleProps) {
  const { currentPlatform, setPlatform } = usePlatformStore()
  const router = useRouter()
  const pathname = usePathname()

  const isVajra = currentPlatform === 'VAJRA'
  const isSentinel = currentPlatform === 'SENTINEL' || currentPlatform === 'SENTINA'

  const handleSwitch = (platform: PlatformMode) => {
    setPlatform(platform)
    if (pathname !== '/' && pathname !== '/vajra' && pathname !== '/sentinel') {
      router.push('/')
    }
  }

  return (
    <div
      className={`inline-flex items-center p-1 bg-command-950/90 border border-rose-500/30 rounded-xl backdrop-blur-xl shadow-[0_0_16px_rgba(255,23,68,0.25)] relative select-none flex-shrink-0 font-hud ${className}`}
      data-purpose="platform-mode-toggle"
    >
      {/* VAJRA Switch Button */}
      <button
        type="button"
        id="mode-toggle-vajra"
        onClick={() => handleSwitch('VAJRA')}
        className={`relative z-10 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
          isVajra
            ? 'text-white shadow-[0_0_12px_rgba(255,23,68,0.5)]'
            : 'text-slate-400 hover:text-rose-200'
        }`}
      >
        <Shield
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            isVajra ? 'text-rose-400 scale-110 drop-shadow-[0_0_8px_#ff1744]' : 'text-slate-500'
          }`}
        />
        <span>VAJRA</span>
        {!compact && (
          <span
            className={`text-[8.5px] px-1.5 py-0.5 rounded font-mono font-bold tracking-normal ${
              isVajra
                ? 'bg-rose-500/30 text-rose-200 border border-rose-400/50 shadow-[0_0_8px_rgba(255,23,68,0.3)]'
                : 'bg-slate-800/80 text-slate-500'
            }`}
          >
            INTEL
          </span>
        )}
        {isVajra && (
          <motion.div
            layoutId="platform-active-pill"
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            className="absolute inset-0 rounded-lg bg-gradient-to-r from-red-600/40 via-rose-600/40 to-red-600/40 border border-rose-400 shadow-[0_0_14px_rgba(255,23,68,0.6)] -z-10"
          />
        )}
      </button>

      {/* SENTINEL Switch Button */}
      <button
        type="button"
        id="mode-toggle-sentinel"
        onClick={() => handleSwitch('SENTINEL')}
        className={`relative z-10 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
          isSentinel
            ? 'text-white shadow-[0_0_12px_rgba(255,23,68,0.5)]'
            : 'text-slate-400 hover:text-rose-200'
        }`}
      >
        <Crosshair
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            isSentinel ? 'text-rose-400 scale-110 rotate-45 drop-shadow-[0_0_8px_#ff1744]' : 'text-slate-500'
          }`}
        />
        <span>SENTINEL</span>
        {!compact && (
          <span
            className={`text-[8.5px] px-1.5 py-0.5 rounded font-mono font-bold tracking-normal ${
              isSentinel
                ? 'bg-rose-500/30 text-rose-200 border border-rose-400/50 shadow-[0_0_8px_rgba(255,23,68,0.3)]'
                : 'bg-slate-800/80 text-slate-500'
            }`}
          >
            SECOPS
          </span>
        )}
        {isSentinel && (
          <motion.div
            layoutId="platform-active-pill"
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            className="absolute inset-0 rounded-lg bg-gradient-to-r from-red-600/40 via-rose-600/40 to-red-600/40 border border-rose-400 shadow-[0_0_14px_rgba(255,23,68,0.6)] -z-10"
          />
        )}
      </button>
    </div>
  )
}
