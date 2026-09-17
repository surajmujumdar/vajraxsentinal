'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import Dashboard from '@/components/Dashboard'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [isHydrated, setIsHydrated] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      setIsHydrated(true)
    } catch (err) {
      console.error('Hydration error:', err)
      setError('Failed to initialize application')
    }
  }, [])

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router, isHydrated])

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-danger mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-white rounded-lg"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  if (!isHydrated) {
    return null
  }

  if (!isAuthenticated) {
    return null
  }

  return <Dashboard />
}
