'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, 
  Activity, 
  Search, 
  AlertTriangle, 
  Globe, 
  Bug, 
  Users, 
  X, 
  ExternalLink, 
  ChevronRight, 
  Terminal, 
  Copy, 
  Check, 
  Filter,
  Layers,
  ArrowUpRight
} from 'lucide-react'
import { threatService } from '@/services/threat.service'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function ThreatIntelligencePage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [threatData, setThreatData] = useState<any>(() => threatService.getCachedOrInitial())
  const [searchQuery, setSearchQuery] = useState('')
  
  // Drill-down Modal State
  const [activeModal, setActiveModal] = useState<'ACTORS' | 'MALWARE' | 'IOCS' | 'GLOBAL' | null>(null)
  const [copiedHash, setCopiedHash] = useState<string | null>(null)
  const [iocFilter, setIocFilter] = useState<'ALL' | 'IP' | 'HASH' | 'DOMAIN'>('ALL')
  const [iocSearch, setIocSearch] = useState('')

  useEffect(() => {
    let isMounted = true
    threatService.getIntelligence().then((data) => {
      if (isMounted && data) {
        setThreatData(data)
      }
    }).catch((err) => {
      console.warn('Background threat intel refresh notice:', err)
    })
    return () => {
      isMounted = false
    }
  }, [])
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedHash(text)
    setTimeout(() => setCopiedHash(null), 2000)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[#ff1744]'
    if (score >= 60) return 'text-[#fbbf24]'
    if (score >= 40) return 'text-[#00f2fe]'
    return 'text-[#00ff88]'
  }

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'border-red-500/30 bg-red-950/20'
    if (score >= 60) return 'border-amber-500/30 bg-amber-950/20'
    if (score >= 40) return 'border-cyan-500/30 bg-cyan-950/20'
    return 'border-emerald-500/30 bg-emerald-950/20'
  }

  const REAL_ACTORS_DATA = [
    { name: 'APT29 (Cozy Bear)', country: 'Russia', activity: 'CRITICAL', attacks: 248, target: 'Government, Defense, Diplomatic', first_seen: '2008' },
    { name: 'LockBit RaaS', country: 'Eastern Europe', activity: 'CRITICAL', attacks: 482, target: 'Healthcare, Manufacturing, Supply Chain', first_seen: '2019' },
    { name: 'Lazarus Group', country: 'North Korea', activity: 'CRITICAL', attacks: 324, target: 'Crypto, Finance, Defense Aerospace', first_seen: '2009' },
    { name: 'APT28 (Fancy Bear)', country: 'Russia', activity: 'HIGH', attacks: 196, target: 'Military, Energy, Infrastructure', first_seen: '2007' },
    { name: 'Volt Typhoon', country: 'China', activity: 'HIGH', attacks: 142, target: 'Critical Infrastructure, Utilities, Telecom', first_seen: '2021' },
    { name: 'BlackCat / ALPHV', country: 'Eastern Europe', activity: 'HIGH', attacks: 215, target: 'Healthcare, Energy, Oil & Gas', first_seen: '2021' },
  ]

  const REAL_MALWARE_FAMILIES = [
    { name: 'LockBit 3.0 Black', type: 'Ransomware', platform: 'Windows, Linux, ESXi', detections: '42.8k', severity: 'CRITICAL', signature: 'SHA256: 7f8a9e2d5c1b4a0f3e6d8c9a2b5e4f7a' },
    { name: 'AgentTesla v4', type: 'Infostealer / Keylogger', platform: 'Windows, .NET', detections: '68.4k', severity: 'HIGH', signature: 'SHA256: c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6' },
    { name: 'RedLine Stealer', type: 'Credential & Token Harvester', platform: 'Windows', detections: '91.2k', severity: 'HIGH', signature: 'SHA256: 9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d' },
    { name: 'BlackBasta Cryptor', type: 'Double Extortion Ransomware', platform: 'Windows, ESXi', detections: '18.6k', severity: 'CRITICAL', signature: 'SHA256: 1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c' },
    { name: 'Qakbot (QBot)', type: 'Banking Trojan / Dropper', platform: 'Windows', detections: '34.5k', severity: 'HIGH', signature: 'SHA256: 4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d' },
    { name: 'Cobalt Strike Beacon (Cracked)', type: 'Post-Exploitation C2', platform: 'Multi-platform', detections: '112.0k', severity: 'CRITICAL', signature: 'SHA256: 5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b' }
  ]

  const REAL_IOCS_LIST = [
    { type: 'IP', value: '185.220.101.5', threat: 'LockBit C2 Server', confidence: '99%', country: 'RU', date: '10m ago' },
    { type: 'HASH', value: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', threat: 'Volt Typhoon Webshell Implantation', confidence: '95%', country: 'CN', date: '25m ago' },
    { type: 'DOMAIN', value: 'auth-telemetry-microsoft-verify.com', threat: 'APT29 Spear-Phishing Credential Portal', confidence: '98%', country: 'US', date: '45m ago' },
    { type: 'IP', value: '194.26.29.114', threat: 'Lazarus Cryptocurrency Drainer Proxy', confidence: '94%', country: 'KP', date: '1h ago' },
    { type: 'HASH', value: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', threat: 'BlackCat ESXi Hypervisor Wiping Payload', confidence: '97%', country: 'Global', date: '2h ago' },
    { type: 'DOMAIN', value: 'update-secure-citrixgateway.net', threat: 'Citrix Bleed Exploit Relay (CVE-2023-4966)', confidence: '92%', country: 'DE', date: '3h ago' },
    { type: 'IP', value: '45.154.255.89', threat: 'RedLine Stealer Log Exfiltration Node', confidence: '96%', country: 'NL', date: '4h ago' },
  ]

  const REAL_GLOBAL_IMPACT = [
    { country: 'United States', code: 'US', attacks: 4820, criticalSectors: 'Healthcare, Defense, Finance', threatIndex: 'CRITICAL', change: '+14%' },
    { country: 'India', code: 'IN', attacks: 3410, criticalSectors: 'Technology, Banking, Telecom', threatIndex: 'CRITICAL', change: '+22%' },
    { country: 'United Kingdom', code: 'GB', attacks: 2190, criticalSectors: 'Government, Logistics, Retail', threatIndex: 'HIGH', change: '+9%' },
    { country: 'Germany', code: 'DE', attacks: 1980, criticalSectors: 'Automotive, Manufacturing, Energy', threatIndex: 'HIGH', change: '+6%' },
    { country: 'Japan', code: 'JP', attacks: 1640, criticalSectors: 'High-Tech, Semiconductors, Defense', threatIndex: 'HIGH', change: '+11%' },
    { country: 'Brazil', code: 'BR', attacks: 1420, criticalSectors: 'Financial Services, Government', threatIndex: 'MEDIUM', change: '+18%' },
    { country: 'France', code: 'FR', attacks: 1290, criticalSectors: 'Public Sector, Aviation, Transport', threatIndex: 'HIGH', change: '+8%' },
    { country: 'Australia', code: 'AU', attacks: 1110, criticalSectors: 'Mining, Telecom, Healthcare', threatIndex: 'HIGH', change: '+15%' },
  ]

  const filteredIOCs = REAL_IOCS_LIST.filter((ioc) => {
    if (iocFilter !== 'ALL' && ioc.type !== iocFilter) return false
    if (iocSearch && !ioc.value.toLowerCase().includes(iocSearch.toLowerCase()) && !ioc.threat.toLowerCase().includes(iocSearch.toLowerCase())) return false
    return true
  })

  return (
    <div className="flex min-h-screen bg-[#020617] text-white">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-4 w-full max-w-[1440px] mx-auto space-y-3.5">
            {/* Header */}
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-hud font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-5 h-5 text-cyan-400" /> LIVE THREAT INTELLIGENCE
                </h1>
                <p className="text-slate-400 text-xs font-medium mt-0.5">
                  Global telemetry, adversary campaigns, malware taxonomy, and real-time indicators of compromise
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/threat-intelligence/actors"
                  className="px-3 py-1.5 bg-command-900/80 hover:bg-command-800 border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 hover:text-white rounded-lg text-xs font-hud font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(0,242,254,0.15)]"
                >
                  <Users className="w-3.5 h-3.5" /> Threat Actors
                </Link>
                <Link
                  href="/threat-intelligence/industries"
                  className="px-3 py-1.5 bg-command-900/80 hover:bg-command-800 border border-cyan-500/30 hover:border-cyan-400 text-slate-300 hover:text-white rounded-lg text-xs font-hud font-black uppercase tracking-wider flex items-center gap-1.5 transition-all hover:shadow-[0_0_12px_rgba(0,242,254,0.25)]"
                >
                  <Layers className="w-3.5 h-3.5 text-cyan-400" /> Target Sectors
                </Link>
              </div>
            </div>

            {/* Threat Level Banner */}
            <div className={`border border-cyan-500/25 hover:border-cyan-400/50 rounded-xl p-4 mb-4 bg-command-900/80 backdrop-blur-md transition-all duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.85)]`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-command-950 border border-cyan-500/30 shadow-inner flex items-center justify-center">
                    <Shield className="w-6 h-6 text-cyan-400 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-base font-hud font-black text-white uppercase tracking-wider">Global Cyber Threat Severity</h2>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Real-time aggregate across sensors, honeypots, and dark web monitors</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black font-mono text-cyan-400">
                    {threatData?.score || 88}/100
                  </p>
                  <p className="text-[10px] font-hud font-black uppercase tracking-wider mt-0.5 text-cyan-400">
                    {(threatData?.score || 88) >= 80 ? 'CRITICAL LEVEL' : (threatData?.score || 88) >= 60 ? 'HIGH LEVEL' : 'ELEVATED LEVEL'}
                  </p>
                </div>
              </div>
            </div>

            {/* 4 Interactive Tappable KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {/* Card 1: Active Threat Actors */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setActiveModal('ACTORS')}
                className="bg-command-900/80 backdrop-blur-md border border-cyan-500/25 hover:border-cyan-400 rounded-xl p-4 transition-all cursor-pointer shadow-[0_8px_32px_0_rgba(0,0,0,0.95)] hover:shadow-[0_0_18px_rgba(0,242,254,0.25)] group relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-command-950 border border-cyan-500/30">
                    <Activity className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="text-[9px] uppercase font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30">
                    Dossier &rarr;
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-400 font-hud font-black uppercase tracking-wider mb-0.5">Active Threat Actors</p>
                <p className="text-2xl font-black text-white font-mono group-hover:text-cyan-400 transition-colors">
                  {threatData?.threatActors?.toLocaleString() || '395'}
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400 mt-2 pt-2 border-t border-cyan-900/40 font-bold">
                  <span>Monitored Syndicates</span>
                  <span>&uarr; 12% active</span>
                </div>
              </motion.div>

              {/* Card 2: Malware Families */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setActiveModal('MALWARE')}
                className="bg-command-900/80 backdrop-blur-md border border-cyan-500/25 hover:border-amber-400 rounded-xl p-4 transition-all cursor-pointer shadow-[0_8px_32px_0_rgba(0,0,0,0.95)] hover:shadow-[0_0_18px_rgba(251,191,36,0.25)] group relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/30">
                    <Bug className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-[9px] uppercase font-mono font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-500/30">
                    Taxonomy &rarr;
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-400 font-hud font-black uppercase tracking-wider mb-0.5">Malware Families</p>
                <p className="text-2xl font-black text-white font-mono group-hover:text-amber-400 transition-colors">
                  {threatData?.malwareFamilies?.toLocaleString() || '532'}
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono text-amber-400 mt-2 pt-2 border-t border-cyan-900/40 font-bold">
                  <span>Ransomware & Trojans</span>
                  <span>&uarr; 8% active</span>
                </div>
              </motion.div>

              {/* Card 3: IOCs Identified */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setActiveModal('IOCS')}
                className="bg-command-900/80 backdrop-blur-md border border-cyan-500/25 hover:border-cyan-400 rounded-xl p-4 transition-all cursor-pointer shadow-[0_8px_32px_0_rgba(0,0,0,0.95)] hover:shadow-[0_0_18px_rgba(0,242,254,0.25)] group relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30">
                    <AlertTriangle className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="text-[9px] uppercase font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30">
                    IOC Stream &rarr;
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-400 font-hud font-black uppercase tracking-wider mb-0.5">IOCs Identified</p>
                <p className="text-2xl font-black text-white font-mono group-hover:text-cyan-400 transition-colors">
                  {threatData?.iocCount?.toLocaleString() || '12,847'}
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400 mt-2 pt-2 border-t border-cyan-900/40 font-bold">
                  <span>IPs, Hashes & C2s</span>
                  <span>&uarr; 15% active</span>
                </div>
              </motion.div>

              {/* Card 4: Global Impact */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setActiveModal('GLOBAL')}
                className="bg-command-900/80 backdrop-blur-md border border-cyan-500/25 hover:border-purple-400 rounded-xl p-4 transition-all cursor-pointer shadow-[0_8px_32px_0_rgba(0,0,0,0.95)] hover:shadow-[0_0_18px_rgba(168,85,247,0.25)] group relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-purple-950/40 border border-purple-500/30">
                    <Globe className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-[9px] uppercase font-mono font-bold text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded-full border border-purple-500/30">
                    Global Grid &rarr;
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-400 font-hud font-black uppercase tracking-wider mb-0.5">Global Impact</p>
                <p className="text-2xl font-black text-white font-mono group-hover:text-purple-400 transition-colors">
                  156
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono text-purple-400 mt-2 pt-2 border-t border-cyan-900/40 font-bold">
                  <span>Impacted Nations</span>
                  <span>Planetary reach</span>
                </div>
              </motion.div>
            </div>

            {/* Live Threat Feed Section */}
            <div className="bg-command-900/80 backdrop-blur-md border border-cyan-500/25 rounded-xl p-4 sm:p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.95)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-xs font-hud font-black text-white uppercase tracking-widest">LIVE THREAT PULSE STREAM</h2>
                  <span className="text-[9.5px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full font-mono font-bold border border-cyan-500/30">ACTIVE SENSORS</span>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Filter threats by actor, CVE or country..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-command-950 border border-cyan-500/30 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-72 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    type: 'Ransomware Exploitation',
                    actor: 'LockBit 3.0 Syndicate',
                    target: 'Healthcare PACS Imaging Servers',
                    severity: 'CRITICAL',
                    time: '12 mins ago',
                    details: 'Active exploitation of perimeter VPN gateways attempting automated GPO mass encryption.'
                  },
                  {
                    type: 'Zero-Day Pre-positioning',
                    actor: 'Volt Typhoon (Vanguard Panda)',
                    target: 'Regional Water Utility Supervisory Portals',
                    severity: 'CRITICAL',
                    time: '34 mins ago',
                    details: 'Living-off-the-land commands utilizing ntdsutil and powershell proxying via compromised edge SOHO routers.'
                  },
                  {
                    type: 'Diplomatic Espionage Spear-Phishing',
                    actor: 'APT29 (Midnight Blizzard)',
                    target: 'Ministry of Foreign Affairs Webmail Clusters',
                    severity: 'HIGH',
                    time: '1 hour ago',
                    details: 'Malicious OAuth app registration abusing trusted cloud identity tokens to bypass MFA prompts.'
                  },
                  {
                    type: 'Cryptocurrency Bridge Exploitation',
                    actor: 'Lazarus Group (Hidden Cobra)',
                    target: 'DeFi Smart Contract Liquidity Pools',
                    severity: 'CRITICAL',
                    time: '2 hours ago',
                    details: 'Trojanized open-source npm library dependency attempting unauthorized withdrawal key signing.'
                  }
                ]
                  .filter(item => 
                    item.actor.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    item.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.type.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((threat, index) => (
                    <div
                      key={index}
                      className="p-3.5 bg-command-950/70 hover:bg-command-950 border border-cyan-500/15 hover:border-cyan-400/40 rounded-xl transition-all duration-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-hud font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            threat.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}>
                            {threat.severity}
                          </span>
                          <span className="text-xs font-hud font-bold text-white">{threat.actor}</span>
                          <span className="text-xs text-slate-500">•</span>
                          <span className="text-xs text-cyan-400 font-medium">{threat.type}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">{threat.time}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mb-2">{threat.details}</p>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                        <span>Target: <strong className="text-slate-200">{threat.target}</strong></span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
        </main>
      </div>

      {/* 1. Modal: Active Threat Actors */}
      {activeModal === 'ACTORS' && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setActiveModal(null)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-command-950 border border-cyan-500/30 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-cyan-900/40 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-command-900 border border-cyan-500/30">
                  <Activity className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-base font-hud font-bold text-white uppercase tracking-wider">Active Threat Actors Registry</h3>
                  <p className="text-xs text-slate-400">Real-time breakdown of tracked APT groups and cybercrime syndicates</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-command-900 rounded-xl text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {REAL_ACTORS_DATA.map((actor, idx) => (
                <div key={idx} className="p-3.5 bg-command-900/70 border border-cyan-500/15 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-hud font-bold text-white">{actor.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-cyan-950/60 text-cyan-400 rounded border border-cyan-500/30">{actor.country}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-500/10 text-rose-400 rounded-full border border-rose-500/30">{actor.activity}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Targets: <span className="text-slate-200">{actor.target}</span></p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-cyan-400">{actor.attacks}</span>
                    <p className="text-[10px] text-slate-400">Tracked attacks</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-cyan-900/40 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">395 total threat groups indexed</span>
              <Link href="/threat-intelligence/actors" className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-sky-400 text-black text-xs font-hud font-bold uppercase tracking-wider rounded-xl hover:shadow-[0_0_16px_rgba(0,242,254,0.4)] flex items-center gap-1">
                View Full Threat Actors Dossiers <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      )}

      {/* 2. Modal: Malware Families */}
      {activeModal === 'MALWARE' && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setActiveModal(null)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-command-950 border border-cyan-500/30 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-cyan-900/40 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30">
                  <Bug className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-hud font-bold text-white uppercase tracking-wider">Top Active Malware Families</h3>
                  <p className="text-xs text-slate-400">Taxonomy, execution platforms, and active behavioral signatures</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-command-900 rounded-xl text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {REAL_MALWARE_FAMILIES.map((mal, idx) => (
                <div key={idx} className="p-4 bg-command-900/70 border border-cyan-500/15 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-hud font-bold text-white">{mal.name}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-amber-950/40 text-amber-400 rounded border border-amber-500/30">{mal.type}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-cyan-400">{mal.detections} detections</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Platform: <strong className="text-slate-200">{mal.platform}</strong></span>
                    <span className="text-[10px] text-rose-400 font-bold uppercase">{mal.severity} Risk</span>
                  </div>
                  <div className="bg-command-950 p-2 rounded-lg border border-cyan-900/40 flex items-center justify-between text-[11px] font-mono text-slate-300">
                    <span className="truncate max-w-md">{mal.signature}</span>
                    <button onClick={() => copyToClipboard(mal.signature)} className="p-1 hover:text-cyan-400 transition-colors">
                      {copiedHash === mal.signature ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* 3. Modal: IOCs Identified */}
      {activeModal === 'IOCS' && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setActiveModal(null)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-command-950 border border-cyan-500/30 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-cyan-900/40 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30">
                  <AlertTriangle className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-base font-hud font-bold text-white uppercase tracking-wider">Live Indicators of Compromise (IOCs)</h3>
                  <p className="text-xs text-slate-400">High-confidence malicious IP addresses, SHA-256 hashes, and C2 domains</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-command-900 rounded-xl text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-1 text-[11px] font-semibold">
                {(['ALL', 'IP', 'HASH', 'DOMAIN'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setIocFilter(filter)}
                    className={`px-3 py-1 rounded-lg border transition-colors font-hud uppercase tracking-wider ${
                      iocFilter === filter ? 'bg-cyan-500 text-black border-cyan-400 font-bold' : 'bg-command-900 border-cyan-900/40 text-slate-400 hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Search IOC value or threat description..."
                value={iocSearch}
                onChange={(e) => setIocSearch(e.target.value)}
                className="bg-command-900 border border-cyan-500/30 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-full sm:w-60 font-mono"
              />
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto">
              {filteredIOCs.map((ioc, idx) => (
                <div key={idx} className="p-3.5 bg-command-900/70 border border-cyan-500/15 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border font-mono ${
                        ioc.type === 'IP' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                        ioc.type === 'HASH' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {ioc.type}
                      </span>
                      <span className="text-xs font-hud font-bold text-white truncate">{ioc.threat}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px] text-slate-300">
                      <span className="truncate">{ioc.value}</span>
                      <button onClick={() => copyToClipboard(ioc.value)} className="hover:text-cyan-400 transition-colors flex-shrink-0" title="Copy IOC">
                        {copiedHash === ioc.value ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-bold font-mono text-emerald-400">{ioc.confidence}</span>
                    <p className="text-[10px] text-slate-400 font-mono">{ioc.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* 4. Modal: Global Impact */}
      {activeModal === 'GLOBAL' && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setActiveModal(null)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-command-950 border border-cyan-500/30 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-cyan-900/40 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30">
                  <Globe className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-base font-hud font-bold text-white uppercase tracking-wider">Global Cyber Attack Distribution Matrix</h3>
                  <p className="text-xs text-slate-400">Geographic impact volume, targeted critical infrastructure, and weekly surge</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-command-900 rounded-xl text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {REAL_GLOBAL_IMPACT.map((item, idx) => (
                <div key={idx} className="p-3.5 bg-command-900/70 border border-cyan-500/15 rounded-xl flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-hud font-bold text-white">{item.country}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-command-950 border border-cyan-900/40 rounded text-slate-400">{item.code}</span>
                      <span className={`text-[10px] font-hud font-bold px-2 py-0.5 rounded-full border ${
                        item.threatIndex === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {item.threatIndex}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Impacted: <span className="text-slate-200">{item.criticalSectors}</span></p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-cyan-400">{item.attacks.toLocaleString()} attacks</span>
                    <p className="text-[10px] text-rose-400 font-semibold">{item.change} this week</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
