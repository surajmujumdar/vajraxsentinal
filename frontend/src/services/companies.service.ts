const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface CompanyRiskAssessment {
  id: number;
  risk_level: string;
  security_score: number;
  active_incidents: number;
  abuse_confidence_score: number;
  reputation_score: number;
  vulnerabilities_count: number;
  ssl_valid: boolean;
  domain_age_days: number | null;
  country: string | null;
  isp: string | null;
  assessment_details?: string;
  created_at: string;
}

export interface CompanyWithDetails {
  id: number;
  name: string;
  domain: string;
  industry: string | null;
  description: string | null;
  logo_url?: string | null;
  monitoring_enabled: boolean;
  is_active: boolean;
  is_global: boolean;
  created_by_user_id: number | null;
  created_by_user_name: string | null;
  created_by_user_email: string | null;
  created_at: string;
  updated_at: string | null;
  last_analyzed: string | null;
  latest_risk_assessment: CompanyRiskAssessment | null;
  active_threats_count: number;
  total_threats_count: number;
  primary_ip?: string | null;
  resolved_ips?: string[] | null;
}

const INITIAL_COMPANIES: CompanyWithDetails[] = [];

let inMemoryCompaniesCache: CompanyWithDetails[] | null = null;

export const companiesService = {
  getCachedOrInitial(): CompanyWithDetails[] {
    if (inMemoryCompaniesCache && inMemoryCompaniesCache.length > 0) {
      return inMemoryCompaniesCache;
    }
    return INITIAL_COMPANIES;
  },

  async getAll(token?: string | null): Promise<CompanyWithDetails[]> {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const candidateUrls = [
        `${API_URL}/api/companies/?active_only=true`,
        'http://localhost:8000/api/companies/?active_only=true',
        'http://127.0.0.1:8000/api/companies/?active_only=true',
        '/api/companies/?active_only=true'
      ];

      for (const url of candidateUrls) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);
          const res = await fetch(url, { headers, signal: controller.signal });
          clearTimeout(timeoutId);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              inMemoryCompaniesCache = data;
              return data;
            }
          }
        } catch {
          // try next
        }
      }
    } catch {
      // return fallback
    }

    return inMemoryCompaniesCache || INITIAL_COMPANIES;
  }
};
