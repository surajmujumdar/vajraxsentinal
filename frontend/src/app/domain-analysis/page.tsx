'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

function DomainAnalysisContent() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  
  const searchParams = useSearchParams()
  const domainQuery = searchParams.get('domain') || ''

  const iframeSrc = domainQuery 
    ? `/domain-analysis/index.html?domain=${encodeURIComponent(domainQuery)}`
    : '/domain-analysis/index.html'

  useEffect(() => {
    // Safety fallback: ensure iframe becomes visible even if browser onLoad was missed or cached
    const timer = setTimeout(() => {
      setIframeLoaded(true)
    }, 600)
    return () => clearTimeout(timer)
  }, [iframeSrc])

  return (
    <div className="flex min-h-screen bg-command-950 text-white font-sans">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-hidden relative">
          {/* Loading indicator while iframe loads */}
          {!iframeLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-command-950 z-10 transition-opacity duration-300">
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(0,242,254,0.4)]" />
                <p className="text-slate-400 text-sm font-hud font-bold">Initializing VAJRA Domain Pulse Telemetry Engine...</p>
              </div>
            </div>
          )}
          {/* 
            Using iframe for full CSS/JS isolation: 
            - DomainPulse has its own CSS reset, font imports, and body styles
            - These would conflict with Next.js if injected into the DOM directly
            - iframe ensures DOMContentLoaded fires properly for app.js
          */}
          <iframe
            key={iframeSrc}
            src={iframeSrc}
            className="w-full h-full border-0"
            style={{
              minHeight: 'calc(100vh - 46px)',
              opacity: iframeLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
            }}
            onLoad={() => setIframeLoaded(true)}
            title="VAJRA Domain Pulse - Attack Surface & Security Telemetry"
          />
        </main>
      </div>
    </div>
  )
}

export default function DomainAnalysisPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-command-950 items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <DomainAnalysisContent />
    </Suspense>
  )
}

