import api from './auth.service'

export const dashboardService = {
  async getSummary() {
    const response = await api.get('/api/dashboard/summary')
    return response.data
  },

  async getAlerts() {
    const response = await api.get('/api/dashboard/alerts')
    return response.data
  },

  async getAttackMap() {
    const response = await api.get('/api/dashboard/attack-map')
    return response.data
  },
}
