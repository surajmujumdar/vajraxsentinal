'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, ShieldAlert, Radio, AlertTriangle, X, ExternalLink, ArrowRight } from 'lucide-react'
import { useNotificationStore } from '@/store/notificationStore'
import { useRouter, usePathname } from 'next/navigation'

export default function NotificationToast() {
  const { activeToast, dismissToast, markAsRead } = useNotificationStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!activeToast) return

    // Auto-dismiss toast after 6 seconds
    const timer = setTimeout(() => {
      dismissToast()
    }, 6000)

    return () => clearTimeout(timer)
  }, [activeToast, dismissToast])

  if (!activeToast || pathname === '/login' || pathname === '/signup' || pathname?.startsWith('/auth')) return null

  const getSeverityStyle = (sev: string = 'HIGH') => {
    switch (sev) {
      case 'CRITICAL':
        return {
          border: 'border-red-500/50',
          bg: 'bg-red-950/90',
          badge: 'bg-red-500/20 text-red-400 border-red-500/40',
          icon: <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse flex-shrink-0" />,
          glow: 'shadow-glow-red'
        }
      case 'HIGH':
        return {
          border: 'border-amber-500/50',
          bg: 'bg-amber-950/90',
          badge: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />,
          glow: 'shadow-glow'
        }
      case 'GDELT_NEWS':
      default:
        return {
          border: 'border-primary/50',
          bg: 'bg-slate-900/95',
          badge: 'bg-primary/20 text-primary border-primary/40',
          icon: <Radio className="w-5 h-5 text-primary animate-pulse flex-shrink-0" />,
          glow: 'shadow-glow'
        }
    }
  }

  const style = getSeverityStyle(activeToast.severity)

  const handleToastClick = () => {
    markAsRead(activeToast.id)
    dismissToast()
    if (activeToast.link) {
      if (activeToast.link.startsWith('http')) {
        // Internal reader or route
        router.push('/updates')
      } else {
        router.push(activeToast.link)
      }
    }
  }

  return (
    <div className="fixed top-20 right-6 z-50 max-w-md w-full pointer-events-none">
      <AnimatePresence>
        <motion.div
          key={activeToast.id}
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className={`pointer-events-auto rounded-2xl border ${style.border} ${style.bg} backdrop-blur-xl p-4 shadow-2xl ${style.glow} flex flex-col gap-2.5 cursor-pointer group`}
          onClick={handleToastClick}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="p-2 rounded-xl bg-background/80 border border-border mt-0.5">
                {style.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${style.badge}`}>
                    {activeToast.severity}
                  </span>
                  <span className="text-[10px] text-secondary font-mono">Live Telemetry Alert</span>
                </div>
                <h4 className="text-xs font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                  {activeToast.title}
                </h4>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation()
                dismissToast()
              }}
              className="p-1 text-secondary hover:text-foreground rounded-lg hover:bg-background/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-foreground/80 line-clamp-2 leading-relaxed pl-11">
            {activeToast.message}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-border/40 pl-11 text-[10px]">
            <span className="text-secondary font-mono">{activeToast.timestamp}</span>
            <span className="text-primary font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              View Threat Details <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
