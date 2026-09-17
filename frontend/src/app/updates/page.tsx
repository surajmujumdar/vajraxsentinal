'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import { RefreshCw, Clock, AlertTriangle, CheckCircle, Info, TrendingUp } from 'lucide-react'

export default function UpdatesPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(200)
  const [updates, setUpdates] = useState<any[]>([])

  useEffect(() => {
    // Simulate live update data
    const systemUpdates = [
      { id: 1, type: 'Critical', message: 'New CVE-2026-4567 vulnerability detected', source: 'CVE Database', time: 'Just now', status: 'New' },
      { id: 2, type: 'High', message: 'Ransomware.live feed updated with 15 new incidents', source: 'Ransomware.live', time: '1 min ago', status: 'Updated' },
      { id: 3, type: 'Medium', message: 'Threat intelligence data refreshed', source: 'Threat Intel API', time: '2 min ago', status: 'Updated' },
      { id: 4, type: 'Info', message: 'System maintenance completed successfully', source: 'System', time: '5 min ago', status: 'Completed' },
      { id: 5, type: 'High', message: 'New APT group activity detected in Asia-Pacific', source: 'Threat Actors', time: '8 min ago', status: 'New' },
      { id: 6, type: 'Medium', message: 'Dark web monitoring found 23 new credential leaks', source: 'Dark Web', time: '10 min ago', status: 'Updated' },
      { id: 7, type: 'Critical', message: 'Zero-day exploit discovered in popular software', source: 'Zero-Day Tracker', time: '12 min ago', status: 'New' },
      { id: 8, type: 'Info', message: 'Data source connection verified', source: 'System', time: '15 min ago', status: 'Verified' },
      { id: 9, type: 'High', message: 'Phishing campaign targeting financial sector', source: 'Phishing Feed', time: '18 min ago', status: 'New' },
      { id: 10, type: 'Medium', message: 'Malware signatures database updated', source: 'Malware Analysis', time: '20 min ago', status: 'Updated' },
      { id: 11, type: 'Info', message: 'Weekly security report generated', source: 'Reports', time: '25 min ago', status: 'Completed' },
      { id: 12, type: 'High', message: 'Botnet activity increased in Eastern Europe', source: 'Botnet Tracking', time: '30 min ago', status: 'New' },
      { id: 13, type: 'Medium', message: 'IP reputation database synchronized', source: 'IP Reputation', time: '35 min ago', status: 'Updated' },
      { id: 14, type: 'Info', message: 'User activity logs archived', source: 'System', time: '40 min ago', status: 'Completed' },
      { id: 15, type: 'Critical', message: 'Supply chain vulnerability identified', source: 'Supply Chain', time: '45 min ago', status: 'New' },
    ]
    setUpdates(systemUpdates)
  }, [])

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Critical': return 'text-danger bg-danger/10 border-danger/20'
      case 'High': return 'text-warning bg-warning/10 border-warning/20'
      case 'Medium': return 'text-primary bg-primary/10 border-primary/20'
      case 'Info': return 'text-accent bg-accent/10 border-accent/20'
      default: return 'text-secondary bg-secondary/10 border-secondary/20'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Critical': return AlertTriangle
      case 'High': return AlertTriangle
      case 'Medium': return Info
      case 'Info': return CheckCircle
      default: return Info
    }
  }

  return (
    <div className="flex min-h-screen bg-command-950 text-white font-sans">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-4 w-full max-w-[1440px] mx-auto space-y-3.5">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-hud font-bold text-white text-glow-cyan">System Updates</h1>
              <p className="text-slate-400 text-sm mt-1 font-mono">Real-time system updates and data refresh status</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-command-900/80 border border-cyan-500/25 rounded-xl p-4 shadow-lg hover:border-cyan-400 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="w-5 h-5 text-cyan-400" />
                  <span className="text-sm font-hud font-bold text-slate-400">Total Updates</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono text-glow-cyan">{updates.length}</div>
              </div>
              <div className="bg-command-900/80 border border-cyan-500/25 rounded-xl p-4 shadow-lg hover:border-rose-400 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  <span className="text-sm font-hud font-bold text-slate-400">Critical</span>
                </div>
                <div className="text-2xl font-bold text-rose-400 font-mono">
                  {updates.filter(u => u.type === 'Critical').length}
                </div>
              </div>
              <div className="bg-command-900/80 border border-cyan-500/25 rounded-xl p-4 shadow-lg hover:border-emerald-400 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-hud font-bold text-slate-400">Completed</span>
                </div>
                <div className="text-2xl font-bold text-emerald-400 font-mono">
                  {updates.filter(u => u.status === 'Completed').length}
                </div>
              </div>
              <div className="bg-command-900/80 border border-cyan-500/25 rounded-xl p-4 shadow-lg hover:border-cyan-400 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  <span className="text-sm font-hud font-bold text-slate-400">New Items</span>
                </div>
                <div className="text-2xl font-bold text-cyan-400 font-mono">
                  {updates.filter(u => u.status === 'New').length}
                </div>
              </div>
            </div>

            {/* Live Updates Feed */}
            <div className="bg-card border border-border rounded-xl p-6 hover:border-glow-blue transition-all duration-300 hover:shadow-glow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Live Updates Feed</h2>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  <span className="text-xs text-secondary">Real-time</span>
                </div>
              </div>

              <div className="space-y-3">
                {updates.map((update, index) => {
                  const IconComponent = getTypeIcon(update.type)
                  return (
                    <motion.div
                      key={update.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-glow-blue transition-all duration-300 hover:shadow-glow cursor-pointer"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <IconComponent className={`w-5 h-5 ${update.type === 'Critical' ? 'text-danger' : update.type === 'High' ? 'text-warning' : 'text-primary'}`} />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground">{update.message}</div>
                          <div className="text-xs text-secondary mt-1">Source: {update.source}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-xs px-2 py-1 rounded border ${getTypeColor(update.type)}`}>
                          {update.type}
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-background border border-border">
                          {update.status}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-secondary">
                          <Clock className="w-3 h-3" />
                          <span>{update.time}</span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Update Sources */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-xl p-6 hover:border-glow-blue transition-all duration-300 hover:shadow-glow">
                <h3 className="text-sm font-semibold text-foreground mb-4">Update Sources</h3>
                <div className="space-y-3">
                  {[
                    { source: 'CVE Database', updates: 45, status: 'Active' },
                    { source: 'Ransomware.live', updates: 23, status: 'Active' },
                    { source: 'Threat Intel API', updates: 67, status: 'Active' },
                    { source: 'Dark Web Monitoring', updates: 34, status: 'Active' },
                    { source: 'Phishing Feed', updates: 56, status: 'Active' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.status === 'Active' ? 'bg-success' : 'bg-secondary'}`} />
                        <span className="text-xs text-foreground">{item.source}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-secondary">{item.updates} updates</span>
                        <span className={`text-xs px-2 py-1 rounded ${item.status === 'Active' ? 'bg-success/10 text-success' : 'bg-secondary/10 text-secondary'}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 hover:border-glow-blue transition-all duration-300 hover:shadow-glow">
                <h3 className="text-sm font-semibold text-foreground mb-4">Update Frequency</h3>
                <div className="space-y-3">
                  {[
                    { type: 'Real-time', frequency: 'Every 30 seconds', count: 8 },
                    { type: 'Near Real-time', frequency: 'Every 5 minutes', count: 12 },
                    { type: 'Hourly', frequency: 'Every hour', count: 5 },
                    { type: 'Daily', frequency: 'Once per day', count: 3 },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg">
                      <div>
                        <div className="text-xs text-foreground">{item.type}</div>
                        <div className="text-xs text-secondary">{item.frequency}</div>
                      </div>
                      <span className="text-xs font-medium text-foreground">{item.count} sources</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="bg-card border border-border rounded-xl p-6 hover:border-glow-blue transition-all duration-300 hover:shadow-glow">
              <h2 className="text-lg font-semibold text-foreground mb-4">About System Updates</h2>
              <p className="text-sm text-secondary mb-4">
                Our platform continuously updates threat intelligence data from multiple sources in real-time. 
                This ensures you have access to the most current security information and threat landscape.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-2">Update Types</h3>
                  <ul className="text-xs text-secondary space-y-1">
                    <li>• Critical security alerts</li>
                    <li>• New vulnerability disclosures</li>
                    <li>• Threat actor activity</li>
                    <li>• System maintenance</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-2">Data Freshness</h3>
                  <ul className="text-xs text-secondary space-y-1">
                    <li>• Real-time feeds (30s)</li>
                    <li>• Near real-time (5min)</li>
                    <li>• Scheduled updates (1hr)</li>
                    <li>• Daily summaries (24hr)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-2">Notification</h3>
                  <ul className="text-xs text-secondary space-y-1">
                    <li>• In-app notifications</li>
                    <li>• Email alerts</li>
                    <li>• Webhook integrations</li>
                    <li>• API callbacks</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
