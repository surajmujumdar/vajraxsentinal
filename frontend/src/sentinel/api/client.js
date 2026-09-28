const getApiBase = () => {
  if (typeof window !== 'undefined') {
    if (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes('vajraxsentina-i7r5')) {
      return `${process.env.NEXT_PUBLIC_API_URL}/api/sentinel`;
    }
    const host = window.location.hostname || 'localhost';
    if (host.includes('onrender.com')) {
      return `https://vajraxsentinel-backend.onrender.com/api/sentinel`;
    }
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

  // ── Persistent Local Assessment Storage (Preserves User Scans) ─────────────
  getLocalAssessments() {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('sentinel_assessments_history');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(a => a && typeof a === 'object' && a.id);
    } catch {
      return [];
    }
  },

  saveLocalAssessment(assessment) {
    if (typeof window === 'undefined' || !assessment || !assessment.id) return;
    try {
      const list = this.getLocalAssessments();
      const existingIdx = list.findIndex(a => a?.id === assessment.id);
      if (existingIdx >= 0) {
        list[existingIdx] = { ...list[existingIdx], ...assessment };
      } else {
        list.unshift(assessment);
      }
      localStorage.setItem('sentinel_assessments_history', JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('sentinel_assessments_updated', { detail: assessment }));
    } catch (e) {
      console.warn('Failed to save assessment to localStorage:', e);
    }
  },

  removeLocalAssessment(id) {
    if (typeof window === 'undefined' || !id) return;
    try {
      const list = this.getLocalAssessments().filter(a => a?.id && a.id !== id);
      localStorage.setItem('sentinel_assessments_history', JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('sentinel_assessments_updated'));
    } catch (e) {
      console.warn('Failed to remove assessment from localStorage:', e);
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
      delete headers['Content-Type'];
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const res = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.status === 401) {
        this.removeToken();
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
      clearTimeout(timeoutId);

      // Try namespace fallback (/api/... instead of /api/sentinel/...)
      try {
        const altBase = apiBase.replace('/api/sentinel', '/api');
        const altRes = await fetch(`${altBase}${endpoint}`, {
          ...options,
          headers,
          signal: AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined
        });
        if (altRes.ok) {
          if (altRes.status === 204) return null;
          return await altRes.json();
        }
      } catch {
        // Fallthrough
      }

      throw err;
    }
  },

  // ── Auth ──────────────────────────────────────────────────────────────────
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

  // ── Projects ──────────────────────────────────────────────────────────────
  async getProjects() {
    try {
      const res = await this.request('/projects');
      return Array.isArray(res) ? res : [];
    } catch (err) {
      console.error('Failed to fetch projects from backend:', err);
      return [];
    }
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

  // ── Repositories ──────────────────────────────────────────────────────────
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

  // ── Assessments (100% Real Live Engine with Local Persistence) ─────────────
  async startAssessment(assessment) {
    const res = await this.request('/assessments', {
      method: 'POST',
      body: JSON.stringify(assessment)
    });
    if (res && res.id) {
      this.saveLocalAssessment(res);
    }
    return res;
  },

  async getAssessments(projectId = null) {
    const query = projectId ? `?project_id=${projectId}` : '';
    let backendData = [];
    try {
      const res = await this.request(`/assessments${query}`);
      const rawItems = res?.items || (Array.isArray(res) ? res : []);
      backendData = rawItems.filter(a => a && typeof a === 'object' && a.id);
    } catch (err) {
      console.warn('Could not fetch backend assessments:', err);
    }

    const localList = this.getLocalAssessments();
    
    // Merge: backend data combined with any user scans in local cache
    const mergedMap = new Map();
    localList.forEach(a => { if (a?.id) mergedMap.set(a.id, a); });
    backendData.forEach(a => { if (a?.id) mergedMap.set(a.id, a); });

    const combined = Array.from(mergedMap.values()).sort((a, b) => {
      const tA = new Date(a?.created_at || 0).getTime();
      const tB = new Date(b?.created_at || 0).getTime();
      return tB - tA;
    });

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sentinel_assessments_history', JSON.stringify(combined));
      } catch {}
    }

    return combined;
  },

  async getAssessment(id) {
    if (!id) throw new Error("Assessment ID is required.");
    try {
      const res = await this.request(`/assessments/${id}`);
      if (res && res.id) {
        this.saveLocalAssessment(res);
        return res;
      }
    } catch (err) {
      console.warn(`Failed to fetch live assessment ${id}:`, err);
    }
    const local = this.getLocalAssessments().find(a => a?.id === id);
    if (local) return local;
    throw new Error(`Assessment #${id} not found.`);
  },

  async cancelAssessment(id) {
    if (!id) return null;
    const local = this.getLocalAssessments().find(a => a?.id === id);
    if (local) {
      local.status = 'CANCELLED';
      this.saveLocalAssessment(local);
    }
    try {
      const res = await this.request(`/assessments/${id}/cancel`, {
        method: 'POST'
      });
      if (res && res.id) {
        this.saveLocalAssessment(res);
        return res;
      }
    } catch (err) {
      console.warn('Cancel failed on backend:', err);
    }
    return local;
  },

  async deleteAssessment(id) {
    this.removeLocalAssessment(id);
    return await this.request(`/assessments/${id}`, {
      method: 'DELETE'
    });
  },

  getCorrelatedRisks(assessmentId) {
    return this.request(`/assessments/${assessmentId}/correlated-risks`);
  },

  // ── Findings (100% Real Database Findings) ────────────────────────────────
  async getFindings(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    try {
      const res = await this.request(`/findings?${query.toString()}`);
      return Array.isArray(res) ? res : [];
    } catch (err) {
      console.error('Failed to fetch findings from backend:', err);
      return [];
    }
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

  // ── Reports ───────────────────────────────────────────────────────────────
  getReport(assessmentId) {
    return this.request(`/reports/${assessmentId}`);
  },

  getExportUrl(assessmentId, format = 'html') {
    return `${getApiBase()}/reports/${assessmentId}/export?format=${format}`;
  },

  // ── Assets ────────────────────────────────────────────────────────────────
  async getAssets(projectId = null) {
    const query = projectId ? `?project_id=${projectId}` : '';
    try {
      const res = await this.request(`/assets${query}`);
      return Array.isArray(res) ? res : [];
    } catch (err) {
      console.error('Failed to fetch assets from backend:', err);
      return [];
    }
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

  // ── Dashboard & Health (100% Live Metrics) ─────────────────────────────────
  async getDashboard() {
    return await this.request('/dashboard');
  },

  getCapabilities() {
    return this.request('/capabilities');
  }
};
