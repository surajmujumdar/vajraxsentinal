import { create } from 'zustand'

interface ThreatIntelligence {
  score: number
  threatActors: number
  malwareFamilies: number
  iocCount: number
}

interface ThreatTrend {
  date: string
  score: number
}

interface ThreatState {
  intelligence: ThreatIntelligence | null
  trend: ThreatTrend[]
  loading: boolean
  setIntelligence: (intelligence: ThreatIntelligence) => void
  setTrend: (trend: ThreatTrend[]) => void
  setLoading: (loading: boolean) => void
}

export const useThreatStore = create<ThreatState>((set) => ({
  intelligence: null,
  trend: [],
  loading: false,
  setIntelligence: (intelligence) => set({ intelligence }),
  setTrend: (trend) => set({ trend }),
  setLoading: (loading) => set({ loading }),
}))
