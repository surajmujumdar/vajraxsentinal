import { create } from 'zustand'

interface RansomwareIncident {
  id?: number
  group: string
  target: string
  country: string
  published: string
  impact: 'Critical' | 'High' | 'Medium' | 'Low'
  status: 'Published' | 'Active' | 'Resolved'
}

interface RansomwareStats {
  totalIncidents: number
  activeGroups: number
  topCountries: { country: string; count: number }[]
  topGroups: { group: string; count: number }[]
}

interface RansomwareState {
  incidents: RansomwareIncident[]
  stats: RansomwareStats | null
  loading: boolean
  setIncidents: (incidents: RansomwareIncident[]) => void
  setStats: (stats: RansomwareStats) => void
  setLoading: (loading: boolean) => void
}

export const useRansomwareStore = create<RansomwareState>((set) => ({
  incidents: [],
  stats: null,
  loading: false,
  setIncidents: (incidents) => set({ incidents }),
  setStats: (stats) => set({ stats }),
  setLoading: (loading) => set({ loading }),
}))
