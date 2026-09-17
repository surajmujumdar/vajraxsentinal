'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'
import { Users, ArrowLeft, Shield, Lock, Trash2 } from 'lucide-react'

interface User {
  id: number
  email: string
  name: string
  role: string
  is_active: boolean
  created_at: string
  updated_at?: string
}

export default function UserManagement() {
  const router = useRouter()
  const { user, isAuthenticated, token } = useAuthStore()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [newRole, setNewRole] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(200)

  const fetchUsers = useCallback(async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        console.error('Failed to fetch users:', response.status)
        // Set mock data if API fails
        setUsers([
          { id: 1, email: 'admin@indigo.com', name: 'Admin User', role: 'Admin', is_active: true, created_at: new Date().toISOString() },
          { id: 2, email: 'user@example.com', name: 'Test User', role: 'SOC Analyst', is_active: true, created_at: new Date().toISOString() },
          { id: 3, email: 'analyst@example.com', name: 'Security Analyst', role: 'SOC Analyst', is_active: true, created_at: new Date().toISOString() },
        ])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      // Set mock data on error
      setUsers([
        { id: 1, email: 'admin@indigo.com', name: 'Admin User', role: 'Admin', is_active: true, created_at: new Date().toISOString() },
        { id: 2, email: 'user@example.com', name: 'Test User', role: 'SOC Analyst', is_active: true, created_at: new Date().toISOString() },
        { id: 3, email: 'analyst@example.com', name: 'Security Analyst', role: 'SOC Analyst', is_active: true, created_at: new Date().toISOString() },
      ])
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleUpdateRole = async () => {
    if (!selectedUser) return
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_URL}/api/admin/users/${selectedUser.id}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })
      if (response.ok) {
        alert('Role updated successfully')
        fetchUsers()
        setShowRoleModal(false)
        setSelectedUser(null)
        setNewRole('')
      } else {
        alert('Failed to update role')
      }
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Error updating role')
    }
  }

  const handleUpdatePassword = async () => {
    if (!selectedUser) return
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_URL}/api/admin/users/${selectedUser.id}/password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ new_password: newPassword }),
      })
      if (response.ok) {
        alert('Password updated successfully')
        fetchUsers()
        setShowPasswordModal(false)
        setSelectedUser(null)
        setNewPassword('')
      } else {
        alert('Failed to update password')
      }
    } catch (error) {
      console.error('Error updating password:', error)
      alert('Error updating password')
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        alert('User deleted successfully')
        fetchUsers()
      } else {
        alert('Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error deleting user')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-command-950">
        <Sidebar collapsed={false} setCollapsed={() => {}} />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar />
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="text-xs text-slate-400 font-mono">Loading users...</div>
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
                <Users className="w-6 h-6 text-cyan-400" />
                <div>
                  <h1 className="text-2xl font-hud font-bold text-white text-glow-cyan">User Management</h1>
                  <p className="text-sm text-slate-400 font-mono">Manage users, roles, and permissions</p>
                </div>
              </div>
              <Link
                href="/admin"
                className="flex items-center gap-2 px-4 py-2 bg-command-900 hover:bg-command-800 border border-cyan-500/25 rounded-xl transition-colors text-white font-hud text-xs font-bold"
              >
                <ArrowLeft className="w-4 h-4 text-cyan-400" />
                <span>Back</span>
              </Link>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-glow-blue transition-all duration-300 hover:shadow-glow">
              <table className="w-full">
                <thead className="bg-background border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-background/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{user.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-primary/20 text-primary">{user.role}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${user.is_active ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setNewRole(user.role)
                            setShowRoleModal(true)
                          }}
                          className="text-primary hover:text-primary-hover mr-3 flex items-center gap-1"
                        >
                          <Shield className="w-4 h-4" />
                          <span>Role</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowPasswordModal(true)
                          }}
                          className="text-warning hover:text-warning-hover mr-3 flex items-center gap-1"
                        >
                          <Lock className="w-4 h-4" />
                          <span>Password</span>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-danger hover:text-danger-hover flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Role Update Modal */}
            {showRoleModal && selectedUser && (
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
                  <h3 className="text-xl font-bold text-foreground mb-4">Update User Role</h3>
                  <p className="text-secondary mb-4">User: {selectedUser.email}</p>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 mb-4 text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="SOC Analyst">SOC Analyst</option>
                    <option value="Admin">Admin</option>
                  </select>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowRoleModal(false)}
                      className="px-4 py-2 bg-card hover:bg-card-hover border border-border rounded-lg transition-colors text-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateRole}
                      className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
                    >
                      Update
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Password Update Modal */}
            {showPasswordModal && selectedUser && (
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
                  <h3 className="text-xl font-bold text-foreground mb-4">Update User Password</h3>
                  <p className="text-secondary mb-4">User: {selectedUser.email}</p>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Password"
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 mb-4 text-foreground focus:outline-none focus:border-primary"
                  />
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowPasswordModal(false)}
                      className="px-4 py-2 bg-card hover:bg-card-hover border border-border rounded-lg transition-colors text-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdatePassword}
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
