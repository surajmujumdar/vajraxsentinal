const getApiBase = () => {
  if (typeof window !== 'undefined') {
    if (process.env.NEXT_PUBLIC_API_URL) {
      return `${process.env.NEXT_PUBLIC_API_URL}/api/sentinel`;
    }
    const host = window.location.hostname || 'localhost';
    const protocol = window.location.protocol || 'http:';
    return `${protocol}//${host}:8000/api/sentinel`;
  }
  return 'http://localhost:8000/api/sentinel';
};

export const apiClient = {
  getToken() {
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

    try {
      const res = await fetch(url, {
        ...options,
        headers
      });

      if (res.status === 401) {
        console.warn('Unauthorized request - clearing stale token');
        this.removeToken();
        // Retry once without invalid token
        if (token) {
          const retryHeaders = { ...headers };
          delete retryHeaders['Authorization'];
          const retryRes = await fetch(url, { ...options, headers: retryHeaders });
          if (retryRes.ok) {
            if (retryRes.status === 204) return null;
            return await retryRes.json();
          }
        }
      }

      if (res.status === 204) {
        return null;
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || `Request failed with status ${res.status}`);
      }

      return data;
    } catch (err) {
      console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, err);
      // Compatibility fallback: try /api instead of /api/sentinel if network error
      try {
        const compatBase = (typeof window !== 'undefined' && window.location.hostname)
          ? `${window.location.protocol}//${window.location.hostname}:8000/api`
          : 'http://localhost:8000/api';
        const compatUrl = `${compatBase}${endpoint}`;
        const compatRes = await fetch(compatUrl, { ...options, headers });
        if (compatRes.ok) {
          if (compatRes.status === 204) return null;
          return await compatRes.json();
        }
      } catch (e) {
        // ignore fallback error
      }
      throw err;
    }
  },

  // Auth
  login(username, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
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

  // Repositories
  validateGitHub(url, branch = 'main', token = '') {
    return this.request('/repositories/github/validate', {
      method: 'POST',
      body: JSON.stringify({ url, branch, token: token || null })
    });
  },

  uploadSourceZip(file) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request('/repositories/upload', {
      method: 'POST',
      body: formData
    });
  },

  // Assessments
  startAssessment(assessment) {
    return this.request('/assessments', {
      method: 'POST',
      body: JSON.stringify(assessment)
    });
  },

  getAssessments(projectId = null) {
    const query = projectId ? `?project_id=${projectId}` : '';
    return this.request(`/assessments${query}`);
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
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
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

  deleteFinding(id) {
    return this.request(`/findings/${id}`, {
      method: 'DELETE'
    });
  },

  // Reports
  getReport(assessmentId) {
    return this.request(`/reports/${assessmentId}`);
  },

  getExportUrl(assessmentId, format = 'html') {
    return `${API_BASE}/reports/${assessmentId}/export?format=${format}`;
  },

  // Assets
  getAssets(projectId = null) {
    const query = projectId ? `?project_id=${projectId}` : '';
    return this.request(`/assets${query}`);
  },

  verifyAsset(projectId, url) {
    return this.request('/assets/verify', {
      method: 'POST',
      body: JSON.stringify({ project_id: projectId, url })
    });
  },

  runTargetDiagnostics(url, customHeaders = null) {
    return this.request('/assets/diagnostics', {
      method: 'POST',
      body: JSON.stringify({ url, custom_headers: customHeaders })
    });
  },

  getAssetDetails(assetId) {
    return this.request(`/assets/${assetId}`);
  },

  // Dashboard & Health
  getDashboard() {
    return this.request('/dashboard');
  },

  getCapabilities() {
    return this.request('/capabilities');
  }
};
