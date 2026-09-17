'use client'

import { TrendingUp, ShieldAlert, Globe, Database, ExternalLink } from 'lucide-react'

export default function GlobalAttackMap() {
  const countries = [
    { name: 'United States', count: 387 },
    { name: 'India', count: 94 },
    { name: 'United Kingdom', count: 51 },
    { name: 'Germany', count: 47 },
    { name: 'France', count: 36 },
  ]

  const counters = [
    { label: 'Critical Attacks', value: '217', trend: '↑ 22%', color: 'text-rose-400', iconName: 'TrendingUp' },
    { label: 'Malware Detected', value: '532', trend: '↑ 15%', color: 'text-amber-400', iconName: 'ShieldAlert' },
    { label: 'Phishing Sites', value: '1,124', trend: '↑ 19%', color: 'text-rose-400', iconName: 'Globe' },
    { label: 'Data Breaches', value: '74', trend: '↑ 11%', color: 'text-purple-400', iconName: 'Database' },
  ]

  const iconMap: Record<string, React.ElementType> = {
    TrendingUp,
    ShieldAlert,
    Globe,
    Database,
  }

  return (
    <div className="tech-border-card bg-command-950/90 border border-rose-500/30 rounded-xl p-6 hover:border-rose-400/60 transition-all duration-300 hover:shadow-[0_0_24px_rgba(255,23,68,0.2)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-hud font-bold text-white uppercase tracking-wider text-glow-red">LIVE GLOBAL ATTACK MAP</h2>
          <p className="text-xs text-slate-400 font-mono">Real-time Global Threat Vector & Intercept Telemetry</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-command-900 border border-rose-500/30 rounded-lg text-xs font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Telemetry</span>
          </div>
          <div className="text-right">
            <p className="text-xs font-hud font-bold text-slate-400 uppercase">TOTAL ATTACKS TODAY</p>
            <p className="text-2xl font-hud font-bold text-rose-400 text-glow-critical">1,247</p>
            <p className="text-xs text-rose-400 font-mono">↑ 18% vs yesterday</p>
          </div>
        </div>
      </div>

      <div className="relative h-96 bg-command-900/60 border border-rose-900/50 rounded-lg overflow-hidden mb-4">
        <iframe
          src="https://livethreatmap.radware.com/"
          className="w-full h-full border-0"
          title="Radware Live Threat Map"
          allowFullScreen
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-command-900/80 border border-rose-900/50 rounded-lg p-3.5">
          <h3 className="text-xs font-hud font-bold uppercase tracking-wider text-slate-300 mb-3">Top Targeted Countries</h3>
          <div className="space-y-2">
            {countries.map((country, index) => (
              <div key={index} className="flex items-center justify-between border-b border-rose-950/60 pb-1.5">
                <span className="text-xs text-slate-300 font-medium">{country.name}</span>
                <span className="text-xs font-hud font-bold text-rose-400">{country.count}</span>
              </div>
            ))}
          </div>
          <button className="mt-3 text-xs font-hud font-bold text-rose-400 hover:text-rose-300 transition-colors uppercase">View All Countries →</button>
        </div>

        <div className="space-y-2.5">
          {counters.map((counter, index) => {
            const IconComponent = iconMap[counter.iconName]
            return (
              <div key={index} className="flex items-center justify-between p-2.5 bg-command-900/80 border border-rose-900/50 rounded-lg hover:border-rose-500/50 transition-colors">
                <div className="flex items-center gap-2">
                  <IconComponent className={`w-4 h-4 ${counter.color}`} />
                  <span className="text-xs text-slate-300 font-medium">{counter.label}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-hud font-bold text-white">{counter.value}</p>
                  <p className={`text-xs font-mono font-bold ${counter.color}`}>{counter.trend}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
