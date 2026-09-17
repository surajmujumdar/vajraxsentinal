import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PlatformNotification {
  id: string
  title: string
  message: string
  type: 'RANSOMWARE' | 'THREAT_ACTOR' | 'CVE_ALERT' | 'GDELT_NEWS' | 'COMPANY_RISK' | 'SYSTEM'
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO'
  timestamp: string
  is_read: boolean
  link?: string
  article?: any
}

interface NotificationState {
  notifications: PlatformNotification[]
  unreadCount: number
  activeToast: PlatformNotification | null
  addNotification: (notif: Omit<PlatformNotification, 'id' | 'timestamp' | 'is_read'>, triggerToast?: boolean) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearAll: () => void
  dismissToast: () => void
  generateLiveTelemetryAlerts: () => void
}

const DEFAULT_INITIAL_NOTIFICATIONS: PlatformNotification[] = [
  {
    id: 'notif-1',
    title: '🚨 Ransomware Campaign Surge',
    message: 'LockBit 3.0 has claimed 8 new victims across Healthcare & Manufacturing in the last 6 hours.',
    type: 'RANSOMWARE',
    severity: 'CRITICAL',
    timestamp: '5 mins ago',
    is_read: false,
    link: '/ransomware'
  },
  {
    id: 'notif-2',
    title: '🕵️ APT29 Active Reconnaissance',
    message: 'Cozy Bear / Midnight Blizzard identified probing Microsoft Exchange and Outlook edge gateways.',
    type: 'THREAT_ACTOR',
    severity: 'CRITICAL',
    timestamp: '25 mins ago',
    is_read: false,
    link: '/threat-intelligence/actors'
  },
  {
    id: 'notif-3',
    title: '🛡️ High-Risk Vulnerability Ingestion',
    message: 'CVE-2024-3400 (Palo Alto PAN-OS Command Injection - CVSS 10.0) added to active exploit watchlists.',
    type: 'CVE_ALERT',
    severity: 'HIGH',
    timestamp: '1 hour ago',
    is_read: false,
    link: '/alerts'
  },
  {
    id: 'notif-4',
    title: '📰 GDELT Breaking Cyber Bulletin',
    message: 'Global critical infrastructure warning issued following targeted OT SCADA intrusions in Western Europe.',
    type: 'GDELT_NEWS',
    severity: 'HIGH',
    timestamp: '2 hours ago',
    is_read: false,
    link: '/updates'
  },
  {
    id: 'notif-5',
    title: '🏢 Monitored Domain Security Audit',
    message: 'Telemetry synchronization complete for all monitored domains. DNS, SSL, and VirusTotal reputation updated.',
    type: 'COMPANY_RISK',
    severity: 'INFO',
    timestamp: '3 hours ago',
    is_read: false,
    link: '/companies'
  }
]

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: DEFAULT_INITIAL_NOTIFICATIONS,
      unreadCount: DEFAULT_INITIAL_NOTIFICATIONS.length,
      activeToast: null,

      addNotification: (notif, triggerToast = true) => {
        const newNotif: PlatformNotification = {
          ...notif,
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: 'Just now',
          is_read: false,
        }
        set((state) => {
          // Avoid duplicate notifications with same title
          const isDuplicate = state.notifications.some(
            (n) => n.title.toLowerCase() === newNotif.title.toLowerCase()
          )
          if (isDuplicate) return state

          const updated = [newNotif, ...state.notifications].slice(0, 50)
          return {
            notifications: updated,
            unreadCount: updated.filter((n) => !n.is_read).length,
            activeToast: triggerToast ? newNotif : state.activeToast,
          }
        })
      },

      dismissToast: () => {
        set({ activeToast: null })
      },

      markAsRead: (id: string) => {
        set((state) => {
          const updated = state.notifications.map((n) =>
            n.id === id ? { ...n, is_read: true } : n
          )
          return {
            notifications: updated,
            unreadCount: updated.filter((n) => !n.is_read).length,
          }
        })
      },

      markAllAsRead: () => {
        set((state) => {
          const updated = state.notifications.map((n) => ({ ...n, is_read: true }))
          return {
            notifications: updated,
            unreadCount: 0,
          }
        })
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0, activeToast: null })
      },

      generateLiveTelemetryAlerts: () => {
        const sampleAlerts = [
          {
            title: '🚨 New Ransomware Surge Detected',
            message: 'BlackCat / ALPHV activity detected targeting Financial Services & Cloud Infrastructure.',
            type: 'RANSOMWARE' as const,
            severity: 'CRITICAL' as const,
            link: '/ransomware'
          },
          {
            title: '🕵️ Volt Typhoon Pre-Positioning Activity',
            message: 'Living-off-the-land commands detected routing through compromised consumer router clusters.',
            type: 'THREAT_ACTOR' as const,
            severity: 'HIGH' as const,
            link: '/threat-intelligence/actors'
          },
          {
            title: '📰 GDELT Live Threat Advisory',
            message: 'New advisory issued on zero-day weaponization in corporate VPN concentrators.',
            type: 'GDELT_NEWS' as const,
            severity: 'HIGH' as const,
            link: '/updates'
          }
        ]
        const randomAlert = sampleAlerts[Math.floor(Math.random() * sampleAlerts.length)]
        get().addNotification(randomAlert, true)
      }
    }),
    {
      name: 'vajra-notifications-storage-v2',
    }
  )
)
