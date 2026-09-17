import api from './auth.service'

export const reportService = {
  async generateThreatReport() {
    const response = await api.get('/api/reports/threat', { responseType: 'blob' })
    return response.data
  },

  async generateRansomwareReport() {
    const response = await api.get('/api/reports/ransomware', { responseType: 'blob' })
    return response.data
  },

  async generateExecutiveReport() {
    const response = await api.get('/api/reports/executive', { responseType: 'blob' })
    return response.data
  },
}
