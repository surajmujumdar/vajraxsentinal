'use client'
const RAW_API_URL = (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_API_URL) ? process.env.NEXT_PUBLIC_API_URL : 'https://vajraxsentina-i7r5.onrender.com';
const API_BASE = RAW_API_URL.replace(/\/+$/, '').replace(/\/api$/, '') + '/api';
const BACKEND_FALLBACK = 'https://vajraxsentina-i7r5.onrender.com/api';

export const apiClient = {
  getToken() {
    if (typeof window === 'undefined') return '';
    const sentinaToken = localStorage.getItem('sentinal_token');
    if (sentinaToken) return sentinaToken;

    // Check unified auth-storage from VAJRA authStore
    return (typeof window !== 'undefined' ? localStorage.getItem('sentinal_token') : '') || '';
  },

  setToken(token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sentinal_token', token);
    }
  },

  removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sentinal_token');
    }
  },

  async request(endpoint, options = {}) {
    const apiBase = getApiBase();
    const url = `${apiBase}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    if (options.body instanceof FormData) {
      delete headers['Content-Type']; // Let browser set boundary
    }


    for (const url of urlsToTry) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      try {
        const res = await fetch(url, {
          ...options,
          headers,
          signal: options.signal || controller.signal
        });
        clearTimeout(timeoutId);

        if (res.status === 401 && !isRetry && endpoint !== '/auth/login' && endpoint !== '/auth/register') {
          console.warn('Authentication token expired or invalid, auto-refreshing admin session...');
          try {
            const authRes = await fetch(`${API_BASE}/auth/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: 'admin@sentinal.security', username: 'admin', password: 'admin123' })
            });
            if (authRes.ok) {
              const authData = await authRes.json();
              const newToken = authData.access_token || authData.token;
              if (newToken) {
                this.setToken(newToken);
                return this.request(endpoint, options, true);
              }
            }
          } catch (authErr) {
            console.warn('Auto-login notice:', authErr);
          }
        }

        if (res.status === 204) {
          return null;
        }

        if (res.ok) {
          return await res.json();
        }

        const data = await res.json().catch(() => ({ detail: `Request failed with status ${res.status}` }));
        throw new Error(data.detail || `Request failed with status ${res.status}`);
      } catch (err) {
        clearTimeout(timeoutId);
        lastError = err;
        // Try next URL fallback
      }
    }

    console.warn(`API fallback exhausted on [${options.method || 'GET'} ${endpoint}]:`, lastError?.message || lastError);
    throw lastError;
  },

  // Auth
  login(username, password) {
    const userStr = username || 'admin';
    const emailStr = userStr.includes('@') ? userStr : `${userStr}@sentinal.security`;
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: userStr, email: emailStr, password })
    });
  },

  register(username, email, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    });
  },

  getMe() {
    return this.request('/auth/me');
  },

  // Projects
  getProjects() {
    return this.request('/projects');
  },

  createProject(project) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(project)
    });
  },

  deleteProject(id) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE'
    });
  },

  // Assets (Target Web Applications, Repos, Domains)
  getAssets(projectId = null) {
    const query = projectId ? `?project_id=${projectId}` : '';
    return this.request(`/assets${query}`);
  },

  getAsset(id) {
    return this.request(`/assets/${id}`);
  },

  createAsset(asset) {
    return this.request('/assets', {
      method: 'POST',
      body: JSON.stringify(asset)
    });
  },

  verifyAsset(id, method = 'ANALYST_AUTHORIZATION', notes = '') {
    return this.request(`/assets/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ method, notes })
    });
  },

  getAssetAssessments(assetId) {
    return this.request(`/assets/${assetId}/assessments`);
  },

  compareAssetAssessments(assetId, asm1, asm2) {
    return this.request(`/assets/${assetId}/compare?asm1=${asm1}&asm2=${asm2}`);
  },

  deleteAsset(id) {
    return this.request(`/assets/${id}`, {
      method: 'DELETE'
    });
  },

  // Repositories & GitHub Integration
  validateGitHub(url, branch = 'main', token = '') {
    return this.request('/repositories/github/validate', {
      method: 'POST',
      body: JSON.stringify({ url, branch, token: token || null })
    });
  },

  fetchRepoTree(url, branch = 'main', token = '') {
    return this.request('/repositories/github/tree', {
      method: 'POST',
      body: JSON.stringify({ url, branch, token: token || null })
    });
  },

  scanGitHubRepo(url, branch = 'main', token = '', companyName = null, syncToModel = true) {
    return this.request('/repositories/github/scan', {
      method: 'POST',
      body: JSON.stringify({
        url,
        branch,
        token: token || null,
        company_name: companyName,
        sync_to_model: syncToModel
      })
    });
  },

  syncRepoToModel(repoUrl, scanSummary, findings, dependencies = [], companyName = null) {
    return this.request('/repositories/github/sync-to-model', {
      method: 'POST',
      body: JSON.stringify({
        repo_url: repoUrl,
        scan_summary: scanSummary,
        findings,
        dependencies,
        company_name: companyName
      })
    });
  },

  getScannedRepositories() {
    return this.request('/repositories/list');
  },

  uploadSourceZip(file) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request('/repositories/upload', {
      method: 'POST',
      body: formData
    });
  },

  // AI Threat Intelligence & Model Ingestion
  getAIModelFeed() {
    return this.request('/ai/model-feed');
  },

  generateAIThreatModel(repoUrl, branch = 'main', token = '', companyName = null) {
    return this.request('/ai/repo-threat-model', {
      method: 'POST',
      body: JSON.stringify({
        repo_url: repoUrl,
        branch,
        token: token || null,
        company_name: companyName
      })
    });
  },

  runUnifiedAIAnalysis(target, targetType = 'repo', token = '', customContext = null) {
    return this.request('/ai/unified-analysis', {
      method: 'POST',
      body: JSON.stringify({
        target,
        target_type: targetType,
        token: token || null,
        custom_context: customContext
      })
    });
  },

  // Assessments
  startAssessment(assessment) {
    return this.request('/assessments', {
      method: 'POST',
      body: JSON.stringify(assessment)
    });
  },

  getAssessments(projectId = null, assetId = null) {
    const query = new URLSearchParams();
    if (projectId) query.append('project_id', projectId);
    if (assetId) query.append('asset_id', assetId);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/assessments${qs}`);
  },

  getAssessment(id) {
    return this.request(`/assessments/${id}`);
  },

  cancelAssessment(id) {
    return this.request(`/assessments/${id}/cancel`, {
      method: 'POST'
    });
  },

  deleteAssessment(id) {
    return this.request(`/assessments/${id}`, {
      method: 'DELETE'
    });
  },

  getCorrelatedRisks(assessmentId) {
    return this.request(`/assessments/${assessmentId}/correlated-risks`);
  },

  // Findings
  getFindings(params = {}) {
    const defaultParams = { limit: 500, ...params };
    const query = new URLSearchParams();
    Object.entries(defaultParams).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    return this.request(`/findings?${query.toString()}`);
  },

  getFinding(id) {
    return this.request(`/findings/${id}`);
  },

  updateFindingStatus(id, status) {
    return this.request(`/findings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  // Reports
  getReports(projectId = null) {
    const qs = projectId ? `?project_id=${projectId}` : '';
    return this.request(`/reports${qs}`);
  },

  getReport(assessmentId) {
    return this.request(`/reports/${assessmentId}`);
  },

  generateReport(assessmentId = null) {
    const endpoint = assessmentId ? `/reports/${assessmentId}/generate` : '/reports/generate';
    return this.request(endpoint, {
      method: 'POST'
    });
  },

  getExportUrl(assessmentId, format = 'html') {
    return `${API_BASE}/reports/${assessmentId}/export?format=${format}`;
  },

  async downloadReportFile(assessmentId, format = 'html') {
    const token = this.getToken();
    const url = `${API_BASE}/reports/${assessmentId}/export?format=${format}`;
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new Error(`Failed to download ${format.toUpperCase()} report: ${res.statusText}`);
    }
    const blob = await res.blob();
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `Sentina_Audit_Report_${assessmentId}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  },

  // Dashboard & Health
  getDashboard() {
    return this.request('/dashboard');
  },

  getCapabilities() {
    return this.request('/capabilities');
  }
};
