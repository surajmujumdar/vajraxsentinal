import api from './auth.service'

export const socService = {
  // Get SOC provider configurations
  async getSocProviders() {
    const response = await api.get('/api/soc/providers')
    return response.data
  },

  // Add SOC provider
  async addSocProvider(provider: any) {
    console.log('Adding SOC provider with data:', provider)
    try {
      const response = await api.post('/api/soc/providers', provider)
      console.log('Add provider response:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Add provider error:', error)
      console.error('Error response:', error.response)
      console.error('Error message:', error.message)
      throw error
    }
  },

  // Update SOC provider
  async updateSocProvider(id: string, provider: any) {
    const response = await api.put(`/api/soc/providers/${id}`, provider)
    return response.data
  },

  // Delete SOC provider
  async deleteSocProvider(id: string) {
    const response = await api.delete(`/api/soc/providers/${id}`)
    return response.data
  },

  // Test SOC provider connection
  async testSocConnection(id: string) {
    const response = await api.post(`/api/soc/providers/${id}/test`)
    return response.data
  },

  // Export alerts to SOC
  async exportAlertsToSoc(providerId: string, data: any) {
    const response = await api.post(`/api/soc/providers/${providerId}/export/alerts`, data)
    return response.data
  },

  // Export threat intelligence to SOC
  async exportThreatIntelToSoc(providerId: string, data: any) {
    const response = await api.post(`/api/soc/providers/${providerId}/export/threat-intel`, data)
    return response.data
  },

  // Export ransomware data to SOC
  async exportRansomwareToSoc(providerId: string, data: any) {
    const response = await api.post(`/api/soc/providers/${providerId}/export/ransomware`, data)
    return response.data
  },

  // Get SOC sync status
  async getSocSyncStatus(providerId: string) {
    const response = await api.get(`/api/soc/providers/${providerId}/sync-status`)
    return response.data
  },

  // Manual sync with SOC
  async syncWithSoc(providerId: string) {
    const response = await api.post(`/api/soc/providers/${providerId}/sync`)
    return response.data
  },

  // Get SOC export logs
  async getSocExportLogs(providerId: string, params?: any) {
    const response = await api.get(`/api/soc/providers/${providerId}/logs`, { params })
    return response.data
  },

  // Generate API key for SOC provider
  async generateApiKey(providerId: string) {
    const response = await api.post(`/api/soc/providers/${providerId}/generate-api-key`)
    return response.data
  },

  // Upload SOC report PDF
  async uploadSocReport(providerId: string, file: File) {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post(`/api/soc/providers/${providerId}/upload-report`, formData)
    return response.data
  },

  // Get SOC reports for a provider
  async getSocReports(providerId: string) {
    const response = await api.get(`/api/soc/providers/${providerId}/reports`)
    return response.data
  },

  // Export SOC logs
  async exportSocLogs(providerId: string, format: string = 'json') {
    const response = await api.get(`/api/soc/providers/${providerId}/export-logs`, {
      params: { format }
    })
    return response.data
  },

  // Generate SOC report
  async generateSocReport(providerId: string, reportType: string = 'summary') {
    const response = await api.post(`/api/soc/providers/${providerId}/generate-report`, null, {
      params: { report_type: reportType }
    })
    return response.data
  },

  // Download SOC report
  async downloadSocReport(providerId: string, filename: string) {
    const response = await api.get(`/api/soc/providers/${providerId}/download-report/${filename}`, {
      responseType: 'blob'
    })
    return response.data
  },

  // Verify SOC report with AI
  async verifySocReport(reportId: string, verificationType: string = 'full') {
    const response = await api.post(`/api/soc/reports/${reportId}/verify`, {
      verification_type: verificationType
    })
    return response.data
  },

  // Get report verification status
  async getReportVerification(reportId: string) {
    const response = await api.get(`/api/soc/reports/${reportId}/verification`)
    return response.data
  },

  // Get all reports with filters
  async getAllReports(timeFilter?: string, verificationFilter?: string) {
    const response = await api.get('/api/soc/reports/all', {
      params: {
        time_filter: timeFilter,
        verification_filter: verificationFilter
      }
    })
    return response.data
  }
}
