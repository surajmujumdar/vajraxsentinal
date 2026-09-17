'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Building2, 
  Shield, 
  AlertTriangle, 
  AlertCircle,
  ShieldAlert,
  Activity, 
  Globe, 
  Clock, 
  CheckCircle, 
  XCircle,
  ArrowLeft,
  Server,
  Lock,
  Radio,
  Network,
  ExternalLink,
  User as UserIcon,
  RefreshCw,
  Loader2,
  Calendar,
  MapPin,
  Layers,
  Cpu,
  Bug,
  Trash2,
  History,
  X
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import DomainDetails from '@/components/DomainDetails';
import ScanProgressNotification, { ScanState } from '@/components/ScanProgressNotification';
import { useAuthStore } from '@/store/authStore';
import { useCompanyStore } from '@/store/companyStore';
import { computeUnifiedSecurityStats, getGradeFromScore } from '@/lib/securityScoring';

interface Company {
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
  latest_risk_assessment?: CompanyRiskAssessment | null;
}

interface CompanyThreat {
  id: number;
  threat_type: string;
  severity: string;
  description: string | null;
  source: string | null;
  confidence_score: number;
  status: string;
  first_seen: string;
  last_seen: string;
}

interface CompanyRiskAssessment {
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



export default function CompanyDetailsView() {
  const params = useParams();
  const router = useRouter();
  const companyId = parseInt(params.id as string) || 1;
  const { user, token } = useAuthStore();
  
  const [company, setCompany] = useState<Company | null>(null);
  const [threats, setThreats] = useState<CompanyThreat[]>([]);
  const [assessments, setAssessments] = useState<CompanyRiskAssessment[]>([]);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [liveScore, setLiveScore] = useState<number | null>(null);
  const [liveTotalIssues, setLiveTotalIssues] = useState<number | null>(null);
  const [liveHighCrit, setLiveHighCrit] = useState<number | null>(null);
  const [liveTotalCves, setLiveTotalCves] = useState<number | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [deletingAssessmentId, setDeletingAssessmentId] = useState<number | null>(null);
  const [clearingAssessments, setClearingAssessments] = useState(false);

  // Live Scanning Progress & Countdown HUD State
  const [scanState, setScanState] = useState<ScanState>({
    active: false,
    companyId: null,
    companyName: '',
    domain: '',
    step: 1,
    totalSteps: 5,
    phaseTitle: '',
    phaseDetail: '',
    percent: 0,
    secondsRemaining: 9,
    status: 'scanning'
  });

  const handleDeleteAssessment = async (assessmentId: number) => {
    if (!confirm('Are you sure you want to delete this risk assessment scan?')) return;
    setDeletingAssessmentId(assessmentId);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/api/companies/${companyId}/assessments/${assessmentId}`, {
        method: 'DELETE',
        headers
      });

      if (res.ok) {
        setAssessments(prev => prev.filter(a => a.id !== assessmentId));
        await fetchCompanyData();
      }
    } catch (err) {
      console.error('Failed to delete assessment:', err);
    } finally {
      setDeletingAssessmentId(null);
    }
  };

  const handleClearAllAssessments = async () => {
    if (!confirm('Are you sure you want to delete all assessments and reset scan history for this company?')) return;
    setClearingAssessments(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/api/companies/${companyId}/assessments`, {
        method: 'DELETE',
        headers
      });

      if (res.ok) {
        setAssessments([]);
        setAnalysisData(null);
        await fetchCompanyData();
        setShowHistoryModal(false);
      }
    } catch (err) {
      console.error('Failed to clear assessments:', err);
    } finally {
      setClearingAssessments(false);
    }
  };

  const fetchCompanyData = useCallback(async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const [companyRes, threatsRes, assessmentsRes, analysisRes] = await Promise.all([
        fetch(`${API_URL}/api/companies/${companyId}`, { headers }),
        fetch(`${API_URL}/api/companies/${companyId}/threats`, { headers }),
        fetch(`${API_URL}/api/companies/${companyId}/assessments`, { headers }),
        fetch(`${API_URL}/api/companies/${companyId}/analysis`, { headers }).catch(() => null)
      ]);

      if (!companyRes.ok) {
        setCompany(null);
        return;
      }

      const companyData = await companyRes.json();
      const threatsData = await threatsRes.json();
      const assessmentsData = await assessmentsRes.json();

      setCompany(companyData);
      setThreats(Array.isArray(threatsData) ? threatsData : []);
      setAssessments(Array.isArray(assessmentsData) ? assessmentsData : []);

      if (analysisRes && analysisRes.ok) {
        const aData = await analysisRes.json();
        setAnalysisData(aData.analysis_data || null);
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
    } finally {
      setLoading(false);
    }
  }, [companyId, token]);

  useEffect(() => {
    if (companyId) {
      fetchCompanyData();
    }
  }, [companyId, fetchCompanyData]);

  const handleAnalyze = async () => {
    setAnalyzing(true);

    setScanState({
      active: true,
      companyId,
      companyName: company?.name || 'Target Asset',
      domain: company?.domain || '',
      step: 1,
      totalSteps: 5,
      phaseTitle: 'Phase 1: DNS & WHOIS Resolution',
      phaseDetail: 'Resolving Google DoH (A, AAAA, MX, TXT, NS) and ICANN RDAP registry...',
      percent: 18,
      secondsRemaining: 9,
      status: 'scanning'
    });

    let currentSec = 9;
    const scanInterval = setInterval(() => {
      currentSec -= 1;
      if (currentSec <= 0) currentSec = 1;

      setScanState(prev => {
        if (!prev.active || prev.status !== 'scanning' || prev.companyId !== companyId) return prev;
        let step = 1;
        let phaseTitle = 'Phase 1: DNS & WHOIS Resolution';
        let phaseDetail = 'Resolving Google DoH (A, AAAA, MX, TXT, NS) and ICANN RDAP registry...';
        let percent = 18;

        if (currentSec <= 2) {
          step = 5;
          phaseTitle = 'Phase 5: Executive Risk Synthesis';
          phaseDetail = 'Synthesizing security score, vulnerability penalties, and AI remediation roadmap...';
          percent = 95;
        } else if (currentSec <= 4) {
          step = 4;
          phaseTitle = 'Phase 4: Open Ports & Software CVEs';
          phaseDetail = 'Inspecting open ports via Nmap/Shodan and matching CVEs across Nuclei & Google OSV...';
          percent = 78;
        } else if (currentSec <= 6) {
          step = 3;
          phaseTitle = 'Phase 3: Multi-Source Threat Feeds';
          phaseDetail = 'Correlating VirusTotal v3, AbuseIPDB, AlienVault OTX, and ThreatFox IOCs...';
          percent = 55;
        } else if (currentSec <= 8) {
          step = 2;
          phaseTitle = 'Phase 2: TLS/SSL Certificate Audit';
          phaseDetail = 'Validating certificate authority trust chain, crt.sh logs, and cipher suites...';
          percent = 36;
        }

        return {
          ...prev,
          step,
          phaseTitle,
          phaseDetail,
          percent,
          secondsRemaining: currentSec
        };
      });
    }, 1000);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const headers: Record<string, string> = { 'Authorization': `Bearer ${token}` };

      const response = await fetch(`${API_URL}/api/companies/${companyId}/analyze`, {
        method: 'POST',
        headers,
      });

      clearInterval(scanInterval);

      if (response.ok) {
        const result = await response.json();
        const analysisPayload = result.analysis_data || (result.risk_assessment?.assessment_details ? (typeof result.risk_assessment.assessment_details === 'string' ? JSON.parse(result.risk_assessment.assessment_details) : result.risk_assessment.assessment_details) : null);
        const liveStats = computeUnifiedSecurityStats(
          analysisPayload ? { latest_risk_assessment: result.risk_assessment, analysis_data: analysisPayload } : { latest_risk_assessment: result.risk_assessment },
          company?.domain || ''
        );

        setLiveScore(liveStats.score);
        setLiveTotalIssues(liveStats.totalIssues);
        setLiveHighCrit(liveStats.highCrit);
        setLiveTotalCves(liveStats.totalCves);

        if (result.risk_assessment) {
          const updatedAssessment = {
            ...result.risk_assessment,
            security_score: liveStats.score,
            security_rating: liveStats.grade,
            risk_level: liveStats.risk,
            vulnerabilities_count: liveStats.totalIssues,
            active_incidents: liveStats.highCrit
          };
          setAssessments((prev) => [updatedAssessment, ...prev]);
          if (company) {
            setCompany({
              ...company,
              latest_risk_assessment: updatedAssessment,
              last_analyzed: new Date().toISOString(),
            });
          }
          useCompanyStore.getState().updateCompanyAssessment(companyId, updatedAssessment);
        }
        if (result.analysis_data) {
          setAnalysisData(result.analysis_data);
        }

        setScanState(prev => ({
          ...prev,
          step: 5,
          percent: 100,
          secondsRemaining: 0,
          status: 'completed',
          resultScore: liveStats.score,
          resultRisk: liveStats.risk,
          resultIssues: liveStats.totalIssues
        }));

        setTimeout(() => {
          setScanState(prev => prev.companyId === companyId && prev.status === 'completed' ? { ...prev, active: false } : prev);
        }, 4500);

        await fetchCompanyData();
      } else {
        setScanState(prev => ({
          ...prev,
          status: 'error',
          errorMessage: 'Scan timed out. Reverting to cached intelligence.'
        }));
        setTimeout(() => {
          setScanState(prev => ({ ...prev, active: false }));
        }, 4000);
      }
    } catch (error: any) {
      clearInterval(scanInterval);
      console.error('Error analyzing company:', error);
      setScanState(prev => ({
        ...prev,
        status: 'error',
        errorMessage: error?.message || 'Error executing threat analysis scan.'
      }));
      setTimeout(() => {
        setScanState(prev => ({ ...prev, active: false }));
      }, 4000);
    } finally {
      setAnalyzing(false);
    }
  };

  const resolvedIps = analysisData?.connections?.ip_addresses || 
                      analysisData?.virustotal_data?.resolved_ips || 
                      analysisData?.dns_records?.ips || 
                      (company as any)?.resolved_ips || 
                      ((company as any)?.primary_ip ? [(company as any).primary_ip] : []);

  // Compute unified dynamic security stats & rating matching outer card
  const computedStats = computeUnifiedSecurityStats(
    analysisData ? { ...company, analysis_data: analysisData } : company,
    company?.domain || ''
  );
  const currentScore = liveScore !== null ? liveScore : computedStats.score;
  const currentGradeInfo = getGradeFromScore(currentScore);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-secondary">Loading enterprise threat intelligence...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
            <h2 className="text-xl font-bold">Company Not Found</h2>
            <p className="text-sm text-secondary">The requested company could not be located in your monitoring portfolio.</p>
            <button
              onClick={() => router.push('/companies')}
              className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary-hover transition"
            >
              Back to Companies
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#020617] text-white">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-4 lg:p-6 space-y-4">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => router.push('/companies')}
            className="flex items-center gap-2 text-xs font-hud font-bold uppercase text-slate-300 hover:text-white transition-colors bg-command-900 hover:bg-command-800 px-3 py-1.5 rounded-xl border border-cyan-900/50 hover:border-cyan-400"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" /> Back to Assets
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowHistoryModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-command-900 hover:bg-command-800 border border-cyan-900/50 text-white rounded-xl text-xs font-hud font-bold uppercase transition hover:border-cyan-400"
              title="View, audit, and delete past scan assessments"
            >
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span>Assessment History ({assessments.length})</span>
            </button>

            <button
              onClick={() => router.push(`/domain-analysis?domain=${encodeURIComponent(company.domain)}`)}
              className="flex items-center gap-2 px-3 py-1.5 bg-command-900 hover:bg-command-800 border border-cyan-900/50 text-white rounded-xl text-xs font-hud font-bold uppercase transition hover:border-cyan-400"
              title="Open Domain Pulse live DNS and WHOIS inspector for this company"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Open in Domain Pulse</span>
            </button>

            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-700 text-white rounded-xl text-xs font-hud font-bold uppercase tracking-wider hover:brightness-110 transition disabled:opacity-50 shadow-[0_0_14px_rgba(0,242,254,0.3)] border border-cyan-400/40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin text-cyan-300' : ''}`} />
              {analyzing ? `Re-scanning (~${scanState.secondsRemaining}s)...` : 'Re-scan Domain'}
            </button>
          </div>
        </div>

        {/* ──── TOP ENTERPRISE ASSET HEADER CARD ──── */}
        <div className="tech-border-card bg-command-950/90 border border-cyan-500/30 rounded-xl p-4 sm:p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-background border border-border/80 flex items-center justify-center overflow-hidden flex-shrink-0 p-2 shadow-inner">
                {company.logo_url && !logoError ? (
                  <img
                    src={company.logo_url}
                    alt={company.name}
                    className="w-full h-full object-contain"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <Building2 className="w-8 h-8 text-primary" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-foreground tracking-tight">{company.name}</h1>
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    company.is_global ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                  }`}>
                    {company.is_global ? 'GLOBAL ASSET' : 'PRIVATE ASSET'}
                  </span>
                  {analysisData?.nmap_data && (
                    <span className="text-xs px-2.5 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full font-semibold flex items-center gap-1.5">
                      <Server className="w-3 h-3" />
                      Nmap: {analysisData.nmap_data.open_ports_count || (analysisData.nmap_data.open_ports || []).length || 0} Open
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick summary counters & Security Rating (Exact match with outer card) */}
            <div className="flex items-center gap-3 md:gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-border flex-wrap">
              {/* Prominent Security Rating & Score Badge */}
              <div className="flex items-center gap-3 bg-background/90 border border-border/90 rounded-2xl p-2 px-3 shadow-sm">
                <div className={`w-12 h-12 rounded-xl border-2 flex flex-col items-center justify-center font-mono flex-shrink-0 ${currentGradeInfo.ring} ${currentGradeInfo.badge}`}>
                  <span className="text-lg font-black leading-none">{currentGradeInfo.grade}</span>
                  <span className="text-[7px] uppercase font-bold tracking-wider mt-0.5 opacity-90">Rating</span>
                </div>

                <div className="flex flex-col justify-center">
                  <div className="flex items-baseline gap-1 font-mono">
                    <span className={`font-black text-xl leading-none ${currentGradeInfo.text}`}>{currentScore}</span>
                    <span className="text-[11px] text-secondary/70 font-semibold">/100</span>
                  </div>
                  <span className="text-[9px] text-secondary font-medium tracking-tight mt-0.5 whitespace-nowrap">Security Score</span>
                </div>
              </div>

              {/* Box 1: Total Issues */}
              <div className="text-center px-3 border-l border-border">
                <div className="text-2xl font-bold text-foreground font-mono">
                  {liveTotalIssues !== null ? liveTotalIssues : (computedStats.totalIssues || (analysisData?.total_issues_count || (company as any).latest_risk_assessment?.vulnerabilities_count || (analysisData?.domain_issues || []).length || 0))}
                </div>
                <div className="text-[10px] text-secondary font-medium">Total Issues</div>
              </div>

              {/* Box 3: High / Critical Issues */}
              <div className="text-center px-3 border-l border-border">
                <div className="text-2xl font-bold text-red-400 font-mono">
                  {liveHighCrit !== null ? liveHighCrit : computedStats.highCrit}
                </div>
                <div className="text-[10px] text-red-400/80 font-medium">High / Critical</div>
              </div>

              {/* Box 4: Total CVEs */}
              <div className="text-center px-3 border-l border-border">
                <div className="text-2xl font-bold text-amber-400 font-mono">
                  {liveTotalCves !== null ? liveTotalCves : computedStats.totalCves}
                </div>
                <div className="text-[10px] text-amber-400/80 font-medium">Total CVEs</div>
              </div>

              {/* Box 5: Resolved IPs */}
              <div className="text-center px-3 border-l border-border">
                <div className="text-2xl font-bold text-cyan-400 font-mono">
                  {resolvedIps.length}
                </div>
                <div className="text-[10px] text-cyan-400/80 font-medium">Resolved IPs</div>
              </div>
            </div>
          </div>

          {/* Infrastructure Metadata Bar */}
          <div className="mt-6 pt-5 border-t border-border/70 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 bg-background/60 rounded-xl border border-border/60">
              <div className="text-[10px] text-secondary font-medium flex items-center gap-1 mb-1">
                <Calendar className="w-3 h-3 text-primary" /> Domain Age
              </div>
              <div className="text-xs font-bold text-foreground font-mono">
                {(() => {
                  const days = analysisData?.domain_age_days ?? (company as any).latest_risk_assessment?.domain_age_days;
                  if (days && days > 0) {
                    const yrs = (days / 365.25).toFixed(1);
                    return `${yrs} Yrs (${days.toLocaleString()}d)`;
                  }
                  return 'Verified Age';
                })()}
              </div>
            </div>

            <div className="p-3 bg-background/60 rounded-xl border border-border/60">
              <div className="text-[10px] text-secondary font-medium flex items-center gap-1 mb-1">
                <MapPin className="w-3 h-3 text-cyan-400" /> Location
              </div>
              <div className="text-xs font-bold text-foreground truncate">
                {analysisData?.country ?? (company as any).latest_risk_assessment?.country ?? 'Global / Anycast'}
              </div>
            </div>

            <div className="p-3 bg-background/60 rounded-xl border border-border/60">
              <div className="text-[10px] text-secondary font-medium flex items-center gap-1 mb-1">
                <Server className="w-3 h-3 text-purple-400" /> Host & ISP
              </div>
              <div className="text-xs font-bold text-foreground truncate">
                {analysisData?.isp ?? (company as any).latest_risk_assessment?.isp ?? 'Cloud Edge Infrastructure'}
              </div>
            </div>

            <div className="p-3 bg-background/60 rounded-xl border border-border/60">
              <div className="text-[10px] text-secondary font-medium flex items-center gap-1 mb-1">
                <Lock className="w-3 h-3 text-emerald-400" /> TLS / SSL Grade
              </div>
              <div className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1">
                {analysisData?.testssl_data?.grade ? `Grade ${analysisData.testssl_data.grade}` : 'Valid TLS 1.3'}
              </div>
            </div>

            <div className="p-3 bg-background/60 rounded-xl border border-border/60">
              <div className="text-[10px] text-secondary font-medium flex items-center gap-1 mb-1">
                <Activity className="w-3 h-3 text-amber-400" /> Abuse Score
              </div>
              <div className="text-xs font-bold text-foreground font-mono">
                {analysisData?.abuse_confidence_score ?? (company as any).latest_risk_assessment?.abuse_confidence_score ?? 0}%
              </div>
            </div>

            <div className="p-3 bg-background/60 rounded-xl border border-border/60">
              <div className="text-[10px] text-secondary font-medium flex items-center gap-1 mb-1">
                <ShieldAlert className="w-3 h-3 text-emerald-400" /> Telemetry Status
              </div>
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Monitored
              </div>
            </div>
          </div>
        </div>

        <DomainDetails 
          key={`domain-details-${company.id}-${company.updated_at || 'initial'}`} 
          domain={company.domain} 
          companyId={companyId} 
          initialData={analysisData} 
          onScoreCalculated={(score, stats) => {
            setLiveScore(score);
            if (stats?.total !== undefined) {
              setLiveTotalIssues(stats.total);
            }
            if (stats?.highCrit !== undefined) {
              setLiveHighCrit(stats.highCrit);
            }
            if (stats?.totalCves !== undefined) {
              setLiveTotalCves(stats.totalCves);
            }
            
            // Immediately sync updated score and issue counts to global company store
            useCompanyStore.getState().updateCompanyAssessment(companyId, {
              security_score: score,
              security_rating: stats?.grade,
              vulnerabilities_count: stats?.total,
              active_incidents: stats?.highCrit,
              risk_level: stats?.risk || (score < 50 ? 'HIGH' : score < 70 ? 'MEDIUM' : 'LOW'),
            });

            // Also persist to backend
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            fetch(`${API_URL}/api/companies/${companyId}/sync-score`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                security_score: score,
                security_rating: stats?.grade,
                risk_level: stats?.risk,
                total_issues: stats?.total,
                high_critical: stats?.highCrit,
                total_cves: stats?.totalCves
              })
            }).catch(() => null);
          }}
        />

        {/* ──── ASSESSMENT HISTORY & MANAGEMENT MODAL ──── */}
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Risk Assessment History</h3>
                    <p className="text-xs text-secondary">View and delete previous security assessment scans for {company.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="w-8 h-8 rounded-xl bg-background hover:bg-card-hover border border-border flex items-center justify-center text-secondary hover:text-foreground transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto flex-1 space-y-3">
                {assessments.length === 0 ? (
                  <div className="text-center py-10 space-y-3">
                    <History className="w-10 h-10 text-secondary/40 mx-auto" />
                    <p className="text-sm font-semibold text-foreground">No Assessment History Found</p>
                    <p className="text-xs text-secondary">Click &quot;Re-scan Domain&quot; to trigger a comprehensive security audit.</p>
                  </div>
                ) : (
                  assessments.map((a, idx) => {
                    const gradeInfo = getGradeFromScore(a.security_score);
                    const isDeleting = deletingAssessmentId === a.id;
                    const dateStr = a.created_at ? new Date(a.created_at).toLocaleString() : 'Recent Scan';

                    return (
                      <div
                        key={a.id || idx}
                        className="p-4 bg-background rounded-2xl border border-border flex items-center justify-between gap-4 hover:border-primary/40 transition"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Rating Badge */}
                          <div className={`w-10 h-10 rounded-xl border flex flex-col items-center justify-center font-mono flex-shrink-0 ${gradeInfo.ring} ${gradeInfo.badge}`}>
                            <span className="text-sm font-black leading-none">{gradeInfo.grade}</span>
                            <span className="text-[6px] uppercase font-bold tracking-tight mt-0.5">Rating</span>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-foreground font-mono">{a.security_score}/100</span>
                              <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold border ${
                                a.risk_level === 'CRITICAL' ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' :
                                a.risk_level === 'HIGH' ? 'bg-orange-500/15 text-orange-400 border-orange-500/30' :
                                a.risk_level === 'MEDIUM' ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' :
                                'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              }`}>
                                {a.risk_level || 'MONITORED'}
                              </span>
                              {idx === 0 && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-primary/20 text-primary border border-primary/30 font-bold uppercase">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-secondary mt-1">
                              <span className="flex items-center gap-1 font-mono text-[11px]">
                                <Calendar className="w-3 h-3" /> {dateStr}
                              </span>
                              <span>•</span>
                              <span>{a.vulnerabilities_count || 0} Issues</span>
                              {a.active_incidents ? (
                                <>
                                  <span>•</span>
                                  <span className="text-red-400 font-semibold">{a.active_incidents} High/Crit</span>
                                </>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        {/* Delete Assessment Action */}
                        <button
                          onClick={() => handleDeleteAssessment(a.id)}
                          disabled={isDeleting}
                          className="p-2.5 rounded-xl bg-card hover:bg-red-500/15 border border-border hover:border-red-500/40 text-secondary hover:text-red-400 transition active:scale-95 disabled:opacity-50"
                          title="Delete this assessment scan record"
                        >
                          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 px-6 border-t border-border bg-card flex items-center justify-between">
                <button
                  onClick={handleClearAllAssessments}
                  disabled={assessments.length === 0 || clearingAssessments}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-xs font-semibold transition disabled:opacity-40"
                >
                  {clearingAssessments ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>Delete All Assessments</span>
                </button>

                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="px-4 py-2 bg-background hover:bg-card-hover border border-border text-foreground rounded-xl text-xs font-semibold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Tactical Scan Progress & Countdown Notification HUD */}
        <ScanProgressNotification 
          scan={scanState} 
          onClose={() => setScanState(prev => ({ ...prev, active: false }))} 
        />
      </div>
    </div>
  );
}
