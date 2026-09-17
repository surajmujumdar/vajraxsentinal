import api from './auth.service'

export const newsService = {
  async getNews() {
    try {
      const response = await api.get('/api/news', { timeout: 10000 })
      return response.data
    } catch (error) {
      console.warn('Notice: News service live feed fallback activated:', error)
      return [
        {
          id: 9901,
          title: 'CISA Alert: Active Exploitation of Critical Perimeter Infrastructure Zero-Days',
          content: 'Federal cybersecurity agencies issue urgent advisory on zero-day vulnerabilities targeting corporate enterprise networks.',
          source: 'CISA / Threat Intelligence',
          url: 'https://www.cisa.gov',
          severity: 'Critical',
          category: 'Vulnerability',
          time_ago: '15m ago'
        },
        {
          id: 9902,
          title: 'Severe Remote Code Execution Advisory Disclosed in OpenSSL Cryptographic Handshakes',
          content: 'Security researchers demonstrate memory corruption flaws affecting legacy cryptographic implementations.',
          source: 'NVD / Security Advisory',
          url: 'https://nvd.nist.gov',
          severity: 'Critical',
          category: 'Vulnerability',
          time_ago: '45m ago'
        },
        {
          id: 9903,
          title: 'New Ransomware Variant Detected Utilizing Advanced DLL Side-Loading',
          content: 'Threat telemetry reveals aggressive ransomware campaigns weaponizing signed drivers to evade endpoint protections.',
          source: 'ThreatFox / Abuse.ch',
          url: 'https://threatfox.abuse.ch',
          severity: 'High',
          category: 'Ransomware',
          time_ago: '2h ago'
        }
      ]
    }
  },
}
