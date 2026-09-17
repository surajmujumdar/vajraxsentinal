'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Newspaper, TrendingUp, ArrowRight } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { newsService } from '../services/news.service'

export default function BottomSection() {
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAllNews, setShowAllNews] = useState(false)
  const [showFullChart, setShowFullChart] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await newsService.getNews()
        setNews(data)
      } catch (error) {
        console.error('Error fetching news:', error)
        // Fallback to mock data
        setNews([
          { title: 'Critical CVE-2026-1234 exploited in attacks against healthcare sector', time: '1 hour ago' },
          { title: 'New ransomware variant "DarkVault" discovered targeting financial institutions', time: '2 hours ago' },
          { title: 'State-sponsored APT group targeting critical infrastructure in Europe', time: '3 hours ago' },
          { title: 'Massive data breach exposes 10M user records from major tech company', time: '4 hours ago' },
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const attackTrendData = [
    { month: 'Jan', attacks: 850 },
    { month: 'Feb', attacks: 920 },
    { month: 'Mar', attacks: 880 },
    { month: 'Apr', attacks: 1050 },
    { month: 'May', attacks: 1180 },
    { month: 'Jun', attacks: 1247 },
  ]

  if (loading) {
    return (
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {[1, 2].map((i) => (
          <div key={i} className="tech-border-card bg-command-950/90 border border-cyan-500/30 rounded-xl p-4 animate-pulse h-48" />
        ))}
      </div>
    )
  }

  return (
    <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3.5">
      {/* Live Cyber Threat News */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="tech-border-card bg-command-950/90 border border-cyan-500/30 rounded-xl p-4 hover:border-cyan-400/60 transition-all duration-200 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-hud font-bold uppercase tracking-widest text-white text-glow-cyan">LIVE CYBER THREAT NEWS</h2>
          </div>
          <button
            onClick={() => setShowAllNews(!showAllNews)}
            className="text-[10px] font-hud font-bold uppercase tracking-wider text-cyan-400 hover:text-white transition-colors px-2 py-0.5 bg-cyan-950/50 border border-cyan-800/60 rounded-lg"
          >
            {showAllNews ? 'Show Less' : 'See More'}
          </button>
        </div>
        <div className="space-y-2">
          {(showAllNews ? news : news.slice(0, 4)).map((item, index) => (
            <div 
              key={index} 
              className="p-2.5 bg-command-900/60 border border-cyan-900/50 rounded-lg cursor-pointer hover:border-cyan-400 hover:bg-command-900 transition-all duration-150 group"
              onClick={() => {
                if (item.url) {
                  window.open(item.url, '_blank', 'noopener,noreferrer')
                }
              }}
            >
              <p className="text-[11.5px] font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors line-clamp-1">{item.title}</p>
              <p className="text-[10px] text-slate-400 font-mono">{item.time || 'Recently'}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Attack Trend Graph */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="tech-border-card bg-command-950/90 border border-cyan-500/30 rounded-xl p-4 hover:border-cyan-400/60 transition-all duration-200 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-hud font-bold uppercase tracking-widest text-cyan-400 text-glow-cyan">ATTACK TREND (6 MONTHS)</h2>
          </div>
          <button
            onClick={() => setShowFullChart(!showFullChart)}
            className="text-[10px] font-hud font-bold uppercase tracking-wider text-cyan-400 hover:text-white transition-colors px-2 py-0.5 bg-cyan-950/50 border border-cyan-800/60 rounded-lg"
          >
            {showFullChart ? 'Show Less' : 'See More'}
          </button>
        </div>
        <div className={showFullChart ? "h-48" : "h-36"}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={attackTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0e2238" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={9} />
              <YAxis stroke="#64748b" fontSize={9} />
              <Tooltip
                contentStyle={{ backgroundColor: '#040814', border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: '6px', fontSize: '10px' }}
                itemStyle={{ color: '#f8fafc' }}
              />
              <Area
                type="monotone"
                dataKey="attacks"
                stroke="#00f2fe"
                fill="rgba(0, 242, 254, 0.2)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  )
}
