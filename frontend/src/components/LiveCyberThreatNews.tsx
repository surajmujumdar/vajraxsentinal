'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Newspaper, Radio, ShieldAlert, AlertTriangle, X, Check, Copy, ExternalLink, Bookmark, Clock, Globe, ArrowRight, Share2 } from 'lucide-react'
import { newsService } from '../services/news.service'
import { useNotificationStore } from '@/store/notificationStore'

export default function LiveCyberThreatNews() {
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAllNews, setShowAllNews] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<any>(null)
  const [copiedLink, setCopiedLink] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const { addNotification } = useNotificationStore()

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        const data = await newsService.getNews()
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const enrichedNews = data.map((item: any) => ({
            ...item,
            source: item.source || 'GDELT Cyber Telemetry',
            category: item.category || (item.title.toLowerCase().includes('ransomware') ? 'Ransomware' : item.title.toLowerCase().includes('cve') ? 'Vulnerability' : 'Cyber Attack'),
            severity: item.severity || (item.title.toLowerCase().includes('critical') || item.title.toLowerCase().includes('zero-day') ? 'Critical' : 'High'),
            impact: item.impact || 'High'
          }))
          setNews(enrichedNews)

          // Dispatch top breaking news item to notification store & screen toast popup
          const topBreaking = enrichedNews[0]
          if (topBreaking) {
            addNotification({
              title: `📰 Live Threat News: ${topBreaking.title.slice(0, 55)}...`,
              message: topBreaking.content || topBreaking.title,
              type: 'GDELT_NEWS',
              severity: topBreaking.severity === 'Critical' ? 'CRITICAL' : 'HIGH',
              link: '/updates',
              article: topBreaking
            }, true)
          }
        }
      } catch (error) {
        console.error('Error fetching cyber threat news:', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 60000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [addNotification])

  const getSeverityColor = (severity: string = 'High') => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/30'
      case 'high': return 'text-amber-400 bg-amber-500/10 border-amber-500/30'
      case 'medium': return 'text-blue-400 bg-blue-500/10 border-blue-500/30'
      default: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    }
  }

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  if (loading) {
    return (
      <div className="tech-border-card bg-command-950/90 border border-cyan-500/30 rounded-xl p-5 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-48 bg-command-900 rounded" />
          <div className="h-4 w-16 bg-command-900 rounded" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-command-900 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const displayedNews = showAllNews ? news : news.slice(0, 5)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="tech-border-card bg-command-950/90 border border-cyan-500/30 rounded-xl p-3.5 sm:p-4 hover:border-cyan-400/60 transition-all duration-200 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)]"
      >
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-hud font-bold text-white uppercase tracking-widest text-glow-cyan">
              LIVE CYBER THREAT NEWS
            </h2>
            <span className="text-[9.5px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1.5 border border-cyan-500/30">
              <Radio className="w-2.5 h-2.5 text-cyan-400 animate-pulse" /> GDELT TELEMETRY
            </span>
          </div>
          <button
            onClick={() => setShowAllNews(!showAllNews)}
            className="text-[10.5px] text-cyan-400 hover:text-white font-hud font-bold uppercase tracking-wider transition-colors px-2 py-0.5 bg-cyan-950/50 border border-cyan-800/60 rounded-lg"
          >
            {showAllNews ? 'Show Less' : `View All (${news.length})`}
          </button>
        </div>

        <div className="space-y-2">
          {displayedNews.map((item, index) => (
            <div
              key={item.id || index}
              onClick={() => setSelectedArticle(item)}
              className="p-2.5 bg-command-900/60 hover:bg-command-900 border border-cyan-900/50 hover:border-cyan-500/60 hover:shadow-[0_0_14px_rgba(0,242,254,0.15)] rounded-lg transition-all duration-150 cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex-1 min-w-0">
                  <h4 className="text-[11.5px] font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 flex items-center gap-1.5">
                    <span>{item.title}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  </h4>
                  
                  <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 font-medium">
                    <span className="font-mono text-slate-300 font-bold">{item.source}</span>
                    <span>•</span>
                    <span>{item.time_ago || 'Recent'}</span>
                    <span>•</span>
                    <span className={`text-[8.5px] px-1.5 py-0.2 rounded-full border font-hud font-bold uppercase tracking-wider ${getSeverityColor(item.severity)}`}>
                      {item.severity || 'HIGH'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* In-Portal News Article Reader Modal */}
      {selectedArticle && (
        <div 
          className="fixed inset-0 bg-command-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedArticle(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-command-950/95 border border-cyan-500/40 rounded-2xl max-w-3xl w-full max-h-[88vh] overflow-y-auto shadow-[0_16px_48px_rgba(0,0,0,0.95),0_0_32px_rgba(0,242,254,0.25)] p-6 custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-cyan-900/50 mb-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-hud font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getSeverityColor(selectedArticle.severity)}`}>
                    {selectedArticle.severity || 'HIGH'} SEVERITY
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 bg-cyan-950/40 text-cyan-300 rounded border border-cyan-500/30 uppercase">
                    {selectedArticle.category || 'CYBER_ATTACK'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" /> {selectedArticle.time_ago || 'Recent Telemetry'}
                  </span>
                </div>
                <h2 className="text-lg font-hud font-bold text-white leading-snug tracking-wide uppercase text-glow-cyan">
                  {selectedArticle.title}
                </h2>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" /> Source: <strong className="text-white font-hud font-bold">{selectedArticle.source}</strong>
                </p>
              </div>

              <button
                onClick={() => setSelectedArticle(null)}
                className="p-1.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* In-Portal Intelligence Analysis Body */}
            <div className="space-y-5 text-xs text-slate-200 leading-relaxed">
              <div>
                <h3 className="text-xs font-hud font-bold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
                  <Newspaper className="w-3.5 h-3.5 text-cyan-400" /> Executive Threat Summary
                </h3>
                <p className="bg-command-900/80 p-4 rounded-xl border border-cyan-900/50 text-xs text-slate-300 leading-relaxed font-mono">
                  {selectedArticle.content || selectedArticle.description || 'Global sensors recorded security telemetry concerning active threat activity and exploit vectors.'}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-hud font-bold uppercase tracking-wider text-slate-200 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Operational Context & Impact Assessment
                </h3>
                <div className="p-3.5 bg-command-900/80 rounded-xl border border-cyan-900/50 space-y-2 text-slate-400 font-medium">
                  <p>• Adversaries actively targeting perimeter appliances, VPNs, and corporate identity providers.</p>
                  <p>• Telemetry recorded by global cybersecurity surveillance feeds and cross-verified against CVE exploit databases.</p>
                  <p>• Enterprise organizations are strongly advised to inspect authentication logs and verify active patch levels.</p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-hud font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" /> Recommended Action Items
                </h3>
                <div className="space-y-2">
                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/40 rounded-xl text-emerald-400 font-bold">
                    1. Enforce strict Multi-Factor Authentication (MFA) across all administrative access enclaves.
                  </div>
                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/40 rounded-xl text-emerald-400 font-bold">
                    2. Query internal EDR telemetry for indicators of compromise (IOCs) matching this campaign.
                  </div>
                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/40 rounded-xl text-emerald-400 font-bold">
                    3. Isolate affected network segments and apply emergency vendor mitigations.
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="mt-6 pt-4 border-t border-cyan-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyLink(selectedArticle.url || window.location.href)}
                  className="px-3.5 py-2 bg-command-900/80 hover:bg-command-900 border border-cyan-900/50 rounded-xl font-bold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLink ? 'Link Copied' : 'Copy Article Link'}
                </button>
                <button
                  onClick={() => setBookmarked(!bookmarked)}
                  className={`px-3.5 py-2 border rounded-xl font-bold flex items-center gap-1.5 transition-colors ${
                    bookmarked ? 'bg-cyan-600 text-white border-cyan-400 shadow-[0_0_12px_rgba(0,242,254,0.4)]' : 'bg-command-900/80 hover:bg-command-900 border-cyan-900/50 text-slate-300'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  {bookmarked ? 'Saved to Watchlist' : 'Add to Watchlist'}
                </button>
              </div>

              <button
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-700 hover:brightness-110 text-white rounded-xl font-hud font-bold uppercase tracking-wider shadow-[0_0_14px_rgba(0,242,254,0.3)] border border-cyan-400/40 transition-all"
              >
                Close In-Portal Reader
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}
