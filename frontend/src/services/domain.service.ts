import api from './auth.service'

export const domainService = {
  async scanDomain(domain: string) {
    const response = await api.get(`/api/domain-risk/scan?domain=${encodeURIComponent(domain)}`)
    return response.data
  }
}
