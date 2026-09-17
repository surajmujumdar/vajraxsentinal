'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'
import { Settings, ArrowLeft, Plus, Edit } from 'lucide-react'

interface Configuration {
  key: string
  value: string
  description?: string
  category?: string
  is_sensitive?: boolean
}

export default function ConfigurationManagement() {
  const router = useRouter()
  const { user, isAuthenticated, token } = useAuthStore()
  const [configurations, setConfigurations] = useState<Configuration[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [selectedConfig, setSelectedConfig] = useState<Configuration | null>(null)
  const [newConfig, setNewConfig] = useState({ key: '', value: '', description: '', category: 'general' })
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(200)

  const fetchConfigurations = useCallback(async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_URL}/api/admin/configurations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setConfigurations(data)
      } else {
        console.error('Failed to fetch configurations:', response.status)
      }
    } catch (error) {
      console.error('Error fetching configurations:', error)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchConfigurations()
  }, [fetchConfigurations])

  const handleCreateConfig = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_URL}/api/admin/configurations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newConfig),
      })
      if (response.ok) {
        fetchConfigurations()
        setShowCreateModal(false)
        setNewConfig({ key: '', value: '', description: '', category: 'general' })
      }
    } catch (error) {
      console.error('Error creating configuration:', error)
    }
  }

  const handleUpdateConfig = async () => {
    if (!selectedConfig) return
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_URL}/api/admin/configurations/${selectedConfig.key}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: selectedConfig.value }),
      })
      if (response.ok) {
        fetchConfigurations()
        setShowUpdateModal(false)
        setSelectedConfig(null)
      }
    } catch (error) {
      console.error('Error updating configuration:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-command-950">
        <Sidebar collapsed={false} setCollapsed={() => {}} />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar />
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="text-xs text-slate-400 font-mono">Loading configurations...</div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-command-950 text-white font-sans">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-4 w-full max-w-[1440px] mx-auto space-y-3.5">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-cyan-400" />
                <div>
                  <h1 className="text-2xl font-hud font-bold text-white text-glow-cyan">Configuration Management</h1>
                  <p className="text-sm text-slate-400 font-mono">View and update system configurations</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-hud text-xs font-bold rounded-xl transition-all shadow-[0_0_14px_rgba(0,242,254,0.4)]"
                >
                  <Plus className="w-4 h-4 text-slate-950" />
                  <span>Create</span>
                </button>
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-4 py-2 bg-command-900 hover:bg-command-800 border border-cyan-500/25 rounded-xl transition-colors text-white font-hud text-xs font-bold"
                >
                  <ArrowLeft className="w-4 h-4 text-cyan-400" />
                  <span>Back</span>
                </Link>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-glow-blue transition-all duration-300 hover:shadow-glow">
              <table className="w-full">
                <thead className="bg-background border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Key</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {configurations.map((config) => (
                    <tr key={config.key} className="hover:bg-background/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-foreground">{config.key}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-foreground">
                        {config.is_sensitive ? '******' : config.value}
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary">{config.description || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-accent/20 text-accent">{config.category || 'general'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => {
                            setSelectedConfig(config)
                            setShowUpdateModal(true)
                          }}
                          className="text-primary hover:text-primary-hover flex items-center gap-1"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Create Configuration Modal */}
            {showCreateModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card border border-border rounded-xl p-6 w-96 shadow-glow"
                >
                  <h3 className="text-xl font-bold text-foreground mb-4">Create Configuration</h3>
                  <input
                    type="text"
                    value={newConfig.key}
                    onChange={(e) => setNewConfig({ ...newConfig, key: e.target.value })}
                    placeholder="Key"
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 mb-3 text-foreground focus:outline-none focus:border-primary"
                  />
                  <textarea
                    value={newConfig.value}
                    onChange={(e) => setNewConfig({ ...newConfig, value: e.target.value })}
                    placeholder="Value"
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 mb-3 text-foreground focus:outline-none focus:border-primary"
                    rows={3}
                  />
                  <input
                    type="text"
                    value={newConfig.description}
                    onChange={(e) => setNewConfig({ ...newConfig, description: e.target.value })}
                    placeholder="Description"
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 mb-3 text-foreground focus:outline-none focus:border-primary"
                  />
                  <select
                    value={newConfig.category}
                    onChange={(e) => setNewConfig({ ...newConfig, category: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 mb-4 text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="general">General</option>
                    <option value="security">Security</option>
                    <option value="api">API</option>
                    <option value="database">Database</option>
                  </select>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 bg-card hover:bg-card-hover border border-border rounded-lg transition-colors text-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateConfig}
                      className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
                    >
                      Create
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Update Configuration Modal */}
            {showUpdateModal && selectedConfig && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card border border-border rounded-xl p-6 w-96 shadow-glow"
                >
                  <h3 className="text-xl font-bold text-foreground mb-4">Update Configuration</h3>
                  <p className="text-secondary mb-2">Key: {selectedConfig.key}</p>
                  <textarea
                    value={selectedConfig.value}
                    onChange={(e) => setSelectedConfig({ ...selectedConfig, value: e.target.value })}
                    placeholder="New Value"
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 mb-4 text-foreground focus:outline-none focus:border-primary"
                    rows={3}
                  />
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowUpdateModal(false)}
                      className="px-4 py-2 bg-card hover:bg-card-hover border border-border rounded-lg transition-colors text-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateConfig}
                      className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
                    >
                      Update
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
