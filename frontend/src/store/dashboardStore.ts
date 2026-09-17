import { create } from 'zustand'

interface DashboardSummary {
  total_attacks: number
  active_threat_actors: number
  critical_attacks: number
  last_updated: string
}

interface Alert {
  id: number
  title: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  description: string
  time: string
  source?: string
}

interface AttackMapData {
  source: string
  target: string
  latitude_from: number
  longitude_from: number
  latitude_to: number
  longitude_to: number
  count: number
}

interface DashboardState {
  summary: DashboardSummary | null
  alerts: Alert[]
  attackMapData: AttackMapData[]
  loading: boolean
  setSummary: (summary: DashboardSummary) => void
  setAlerts: (alerts: Alert[]) => void
  setAttackMapData: (data: AttackMapData[]) => void
  setLoading: (loading: boolean) => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  summary: null,
  alerts: [],
  attackMapData: [],
  loading: false,
  setSummary: (summary) => set({ summary }),
  setAlerts: (alerts) => set({ alerts }),
  setAttackMapData: (attackMapData) => set({ attackMapData }),
  setLoading: (loading) => set({ loading }),
}))
