import api from './auth.service'

export interface RansomwareIncident {
  id: number
  group: string
  target: string
  industry?: string
  country: string
  published: string
  impact: string
  status: string
  description?: string
  demand?: string
  employees?: string
  method?: string
  deadline?: string
  website?: string
}

export interface RansomwareStats {
  groupsCount: number
  overallVictims: number
  victimsThisYear: number
  victimsThisMonth: number
  victimsThisYearTrend: string
  victimsThisMonthTrend: string
  totalIncidents?: number
  activeGroups?: number
  totalRansom?: string
  avgRansom?: string
  topCountries?: { country: string; count: number }[]
  topSectors?: { sector: string; count: number }[]
}

export const INITIAL_RANSOMWARE_STATS: RansomwareStats = {
  groupsCount: 357,
  overallVictims: 29732,
  victimsThisYear: 5144,
  victimsThisMonth: 445,
  victimsThisYearTrend: '↑ 20.0% vs 2025',
  victimsThisMonthTrend: '↓ 37.1% vs Jun',
  totalIncidents: 357,
  activeGroups: 18,
  totalRansom: '$58.4M',
  avgRansom: '$320K',
  topCountries: [
    { country: 'USA', count: 184 },
    { country: 'UK', count: 62 },
    { country: 'Germany', count: 48 },
    { country: 'France', count: 35 },
    { country: 'Canada', count: 28 }
  ],
  topSectors: [
    { sector: 'Healthcare', count: 98 },
    { sector: 'Manufacturing', count: 82 },
    { sector: 'Finance', count: 64 },
    { sector: 'Government', count: 47 },
    { sector: 'Technology', count: 39 }
  ]
}

export const INITIAL_RANSOMWARE_INCIDENTS: RansomwareIncident[] = [
  {
    id: 1,
    group: 'LockBit 3.0',
    target: 'Healthcare Global Services',
    industry: 'Healthcare & Medical',
    country: 'USA',
    published: '2026-07-13',
    impact: 'Critical',
    status: 'Published',
    description: 'LockBit ransomware attack targeting Healthcare Global Services. Critical clinical databases encrypted and patient records exfiltrated.',
    demand: '$5.5M',
    employees: '3,400',
    method: 'Double Extortion (Citrix Bleed)',
    deadline: '2026-07-20',
    website: 'Down'
  },
  {
    id: 2,
    group: 'BlackCat (ALPHV)',
    target: 'Finance Trust Corp',
    industry: 'Financial Services',
    country: 'UK',
    published: '2026-07-12',
    impact: 'High',
    status: 'Published',
    description: 'BlackCat (ALPHV) ransomware attack targeting Finance Trust Corp. Threat actors claimed downloading 250GB of sensitive corporate finance logs.',
    demand: '$3.8M',
    employees: '1,800',
    method: 'Triple Extortion & DDoS',
    deadline: '2026-07-19',
    website: 'Down'
  },
  {
    id: 3,
    group: 'Cl0p Syndicate',
    target: 'Manufacturing Tech Ltd',
    industry: 'Manufacturing & Supply Chain',
    country: 'Germany',
    published: '2026-07-12',
    impact: 'Critical',
    status: 'Published',
    description: 'Cl0p ransomware attack exploiting zero-day vulnerability in MOVEit transfer service to extract data from Manufacturing Tech Ltd.',
    demand: '$8.2M',
    employees: '5,600',
    method: 'Supply Chain Zero-Day',
    deadline: '2026-07-18',
    website: 'Down'
  },
  {
    id: 4,
    group: 'Play Gang',
    target: 'Government City Portal',
    industry: 'Government & Public Sector',
    country: 'France',
    published: '2026-07-11',
    impact: 'High',
    status: 'Published',
    description: 'Play ransomware group claimed attack against municipal servers of Government City Portal, disrupting public administration services.',
    demand: '$2.5M',
    employees: '2,900',
    method: 'Spear-Phishing & Cobalt Strike',
    deadline: '2026-07-17',
    website: 'Partial'
  },
  {
    id: 5,
    group: 'Hive Syndicate',
    target: 'Retail Stores Inc',
    industry: 'Retail & E-commerce',
    country: 'Canada',
    published: '2026-07-11',
    impact: 'Medium',
    status: 'Published',
    description: 'Hive ransomware attack against Retail Stores Inc, causing brief checkout system downtime before detection and containment.',
    demand: '$1.8M',
    employees: '950',
    method: 'Ransomware-as-a-Service',
    deadline: '2026-07-16',
    website: 'Up'
  },
  {
    id: 6,
    group: 'Royal Ransomware',
    target: 'Technology Hub Solutions',
    industry: 'Technology & Software',
    country: 'India',
    published: '2026-07-10',
    impact: 'Critical',
    status: 'Published',
    description: 'Royal ransomware attack targeting active developer infrastructure at Technology Hub Solutions. Ransom demands sent to executive board.',
    demand: '$4.5M',
    employees: '4,100',
    method: 'ProxyNotShell Exploit',
    deadline: '2026-07-15',
    website: 'Down'
  },
  {
    id: 7,
    group: 'Akira Cartel',
    target: 'Apex Legal Partners',
    industry: 'Legal Services',
    country: 'USA',
    published: '2026-07-09',
    impact: 'High',
    status: 'Published',
    description: 'Akira ransomware extortion campaign targeting client litigation archives and proprietary corporate transaction records.',
    demand: '$2.1M',
    employees: '650',
    method: 'Cisco VPN Zero-Day',
    deadline: '2026-07-14',
    website: 'Down'
  },
  {
    id: 8,
    group: 'Medusa',
    target: 'National Research Academy',
    industry: 'Education & Research',
    country: 'Australia',
    published: '2026-07-08',
    impact: 'Medium',
    status: 'Published',
    description: 'Medusa gang published proof-of-compromise folders containing academic research grants and employee credential hashes.',
    demand: '$1.5M',
    employees: '1,200',
    method: 'Living-off-the-Land (LotL)',
    deadline: '2026-07-13',
    website: 'Up'
  }
]

let cachedIncidents: RansomwareIncident[] | null = null
let cachedStats: RansomwareStats | null = null

export const ransomwareService = {
  getCachedOrInitialIncidents(): RansomwareIncident[] {
    return cachedIncidents && cachedIncidents.length > 0 ? cachedIncidents : INITIAL_RANSOMWARE_INCIDENTS
  },

  getCachedOrInitialStats(): RansomwareStats {
    return cachedStats || INITIAL_RANSOMWARE_STATS
  },

  hasCache(): boolean {
    return !!cachedIncidents && cachedIncidents.length > 0
  },

  async getIncidents(): Promise<RansomwareIncident[]> {
    try {
      const response = await api.get('/api/ransomware', { timeout: 4000 })
      if (Array.isArray(response.data) && response.data.length > 0) {
        cachedIncidents = response.data
        return response.data
      }
    } catch (error) {
      console.warn('Backend fetch notice for ransomware incidents, using instant cache:', error)
    }
    return ransomwareService.getCachedOrInitialIncidents()
  },

  async getStats(): Promise<RansomwareStats> {
    try {
      const response = await api.get('/api/ransomware/stats', { timeout: 4000 })
      if (response.data && typeof response.data === 'object') {
        cachedStats = response.data
        return response.data
      }
    } catch (error) {
      console.warn('Backend fetch notice for ransomware stats, using instant cache:', error)
    }
    return ransomwareService.getCachedOrInitialStats()
  },

  async getGroupIncidents(groupName: string): Promise<RansomwareIncident[]> {
    try {
      const response = await api.get(`/api/ransomware/group/${encodeURIComponent(groupName)}`, { timeout: 4000 })
      if (Array.isArray(response.data)) {
        return response.data
      }
    } catch (error) {
      console.warn('Group incidents fetch notice:', error)
    }
    return INITIAL_RANSOMWARE_INCIDENTS.filter(i => i.group.toLowerCase().includes(groupName.toLowerCase()))
  },
}
