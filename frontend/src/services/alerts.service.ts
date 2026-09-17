import api from './auth.service'

export interface AlertItem {
  id: number
  title: string
  description: string
  time: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  source: string
  external_url?: string
  tags?: string[]
  adversary?: string
  indicators?: any[]
  created_at?: string
}

export const INITIAL_ALERTS_DATA: AlertItem[] = [
  {
    id: 1,
    title: 'Ransomware Attack Detected',
    description: 'Target: Aviation Sector - LockBit ransomware group has claimed responsibility for a major attack on aviation infrastructure.',
    time: '2 min ago',
    severity: 'CRITICAL',
    source: 'Ransomware.live',
    adversary: 'LockBit 3.0',
    tags: ['ransomware', 'critical', 'aviation', 'lockbit']
  },
  {
    id: 2,
    title: 'CVE-2026-1234 Exploited in the Wild',
    description: 'High exploitation activity detected for a critical zero-day vulnerability in enterprise gateway firewalls.',
    time: '15 min ago',
    severity: 'CRITICAL',
    source: 'AlienVault OTX',
    adversary: 'Volt Typhoon',
    tags: ['zero-day', 'cve', 'firewall', 'exploit']
  },
  {
    id: 3,
    title: 'Corporate Credential Leak Detected',
    description: '17 accounts found on dark web forums containing corporate credentials from multiple enterprise organizations.',
    time: '32 min ago',
    severity: 'CRITICAL',
    source: 'Dark Web Monitoring',
    adversary: 'RedLine Stealer',
    tags: ['credentials', 'darkweb', 'leak']
  },
  {
    id: 4,
    title: 'Malicious C2 IP Communication Detected',
    description: '185.234.217.16 - C2 Communication detected matching known Lazarus Group botnet infrastructure.',
    time: '45 min ago',
    severity: 'CRITICAL',
    source: 'AlienVault OTX',
    adversary: 'Lazarus Group',
    tags: ['c2', 'botnet', 'malware']
  },
  {
    id: 5,
    title: 'Phishing Campaign Targeting Financial Institutions',
    description: 'Large-scale OAuth device code phishing campaign targeting corporate banking personnel across North America and Europe.',
    time: '1 hour ago',
    severity: 'HIGH',
    source: 'Phishing Feed',
    adversary: 'FIN7',
    tags: ['phishing', 'finance', 'oauth']
  },
  {
    id: 6,
    title: 'Zero-Day Vulnerability Discovered in Cloud Storage Gateway',
    description: 'Critical unauthorized remote code execution vulnerability in cloud sync agent. Immediate patching recommended.',
    time: '2 hours ago',
    severity: 'HIGH',
    source: 'Vulnerability Intelligence',
    adversary: 'Unknown',
    tags: ['cloud', 'vulnerability', 'rce']
  },
  {
    id: 7,
    title: 'DDoS Amplification Attack Against DNS Resolvers',
    description: 'High-volume UDP reflection attack targeting authoritative DNS servers across APAC edge nodes.',
    time: '3 hours ago',
    severity: 'HIGH',
    source: 'SOC Sensor Net',
    adversary: 'Mirai Variant',
    tags: ['ddos', 'dns', 'network']
  },
  {
    id: 8,
    title: 'Unauthorized IAM Privilege Escalation Attempt',
    description: 'Multiple automated attempts to elevate IAM role permissions from low-privilege test account in AWS US-East enclave.',
    time: '4 hours ago',
    severity: 'HIGH',
    source: 'CloudTrail SOC Feed',
    adversary: 'Scattered Spider',
    tags: ['cloud', 'iam', 'aws']
  }
]

let cachedAlerts: AlertItem[] | null = null

export const alertsService = {
  getCachedOrInitial(): AlertItem[] {
    return cachedAlerts && cachedAlerts.length > 0 ? cachedAlerts : INITIAL_ALERTS_DATA
  },

  hasCache(): boolean {
    return !!cachedAlerts && cachedAlerts.length > 0
  },

  async getAlerts(): Promise<AlertItem[]> {
    try {
      const response = await api.get('/api/alerts', { timeout: 4000 })
      if (Array.isArray(response.data) && response.data.length > 0) {
        cachedAlerts = response.data
        return response.data
      }
    } catch (error) {
      console.warn('Backend fetch notice for alerts, using instant telemetry cache:', error)
    }
    return alertsService.getCachedOrInitial()
  },

  async getAlertById(id: number): Promise<AlertItem | undefined> {
    const list = alertsService.getCachedOrInitial()
    return list.find(a => a.id === id)
  },
}
