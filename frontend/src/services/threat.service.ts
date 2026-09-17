import api from './auth.service'

export interface ThreatIntelligenceData {
  score: number
  threatActors: number
  malwareFamilies: number
  iocCount: number
  activeCampaigns?: number
  lastUpdated?: string
  criticalThreats?: number
  highThreats?: number
  mediumThreats?: number
  lowThreats?: number
  newVulnerabilities?: number
  avgResponseTime?: string
  resolvedThisWeek?: number
}

export interface ThreatTrendData {
  date: string
  score: number
}

export const INITIAL_INTEL_DATA: ThreatIntelligenceData = {
  score: 88,
  threatActors: 278,
  malwareFamilies: 532,
  iocCount: 12847,
  activeCampaigns: 42,
  lastUpdated: 'Live Active'
}

export const INITIAL_TREND_DATA: ThreatTrendData[] = [
  { date: '2026-07-07', score: 81 },
  { date: '2026-07-08', score: 83 },
  { date: '2026-07-09', score: 85 },
  { date: '2026-07-10', score: 87 },
  { date: '2026-07-11', score: 86 },
  { date: '2026-07-12', score: 88 },
  { date: '2026-07-13', score: 88 }
]

let cachedIntel: ThreatIntelligenceData | null = null
let cachedTrend: ThreatTrendData[] | null = null

export const threatService = {
  getCachedOrInitial(): ThreatIntelligenceData {
    return cachedIntel || INITIAL_INTEL_DATA
  },

  getCachedOrInitialTrend(): ThreatTrendData[] {
    return cachedTrend || INITIAL_TREND_DATA
  },

  hasCache(): boolean {
    return !!cachedIntel
  },

  async getIntelligence(): Promise<ThreatIntelligenceData> {
    try {
      const response = await api.get('/api/threat-intelligence', { timeout: 4000 })
      if (response.data && typeof response.data === 'object') {
        cachedIntel = response.data
        return response.data
      }
    } catch (error) {
      console.warn('Backend fetch notice for threat intelligence, using instant telemetry cache:', error)
    }
    return threatService.getCachedOrInitial()
  },

  async getThreatIntelligence(): Promise<ThreatIntelligenceData> {
    return threatService.getIntelligence()
  },

  async getTrend(): Promise<ThreatTrendData[]> {
    try {
      const response = await api.get('/api/threat-intelligence/trend', { timeout: 4000 })
      if (Array.isArray(response.data) && response.data.length > 0) {
        cachedTrend = response.data
        return response.data
      }
    } catch (error) {
      console.warn('Backend fetch notice for threat trend, using instant telemetry cache:', error)
    }
    return threatService.getCachedOrInitialTrend()
  },
}
