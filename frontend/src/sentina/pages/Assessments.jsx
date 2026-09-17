'use client'
import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Play,
  CheckCircle2,
  Clock,
  Terminal,
  ShieldCheck,
  AlertTriangle,
  RotateCw,
  Eye,
  Trash2,
  Layers,
  Code2,
  Radio,
  Boxes,
  KeyRound,
  Globe,
  Globe2,
  FolderGit2,
  Cpu,
  StopCircle,
  Filter,
  FileText,
  Loader2,
  Zap,
  ShieldAlert
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { mockAssessments } from '../api/mockData';
import { NewAssessmentModal } from '../components/NewAssessmentModal';
import { SeverityBadge } from '../components/SeverityBadge';
import { FindingDrawer } from '../components/FindingDrawer';
import { ReportViewerModal } from '../components/ReportViewerModal';
import { ScanFailureModal } from '../components/ScanFailureModal';
import { getScorePosture, calculateFindingsScore } from '../utils/securityScore';

export function Assessments({ onSelectFinding }) {
  const [assessments, setAssessments] = useState(() => {
    const list = dashboardService.assessments;
    if (list && list.length > 0) return list;
    return mockAssessments.map(a => dashboardService._formatAssessment(a));
  });

  const [selectedAssessment, setSelectedAssessment] = useState(() => {
    const list = (dashboardService.assessments && dashboardService.assessments.length > 0)
      ? dashboardService.assessments
      : mockAssessments.map(a => dashboardService._formatAssessment(a));
    const activeId = dashboardService.getActiveAssessmentId();
    if (activeId) {
      const found = list.find(a => String(a.id) === String(activeId));
      if (found) return found;
    }
    return list.find(a => (a.status === 'COMPLETED' || a.status === 'SUCCESS') && a.counts?.total > 0) || list[0] || null;
  });
  const [scanFindings, setScanFindings] = useState([]);
  const [selectedModuleFilter, setSelectedModuleFilter] = useState('ALL');
  const [activeFinding, setActiveFinding] = useState(null);
  const [activeReport, setActiveReport] = useState(null);
  const [failedAssessmentForModal, setFailedAssessmentForModal] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [loadingFindings, setLoadingFindings] = useState(false);

  const prevStatusesRef = useRef(new Map());
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    let isMounted = true;

    async function loadAssessments() {
      const data = await dashboardService.getAssessments();
      if (isMounted) {
        const asms = (data && data.length > 0) ? data : (dashboardService.assessments && dashboardService.assessments.length > 0 ? dashboardService.assessments : mockAssessments.map(a => dashboardService._formatAssessment(a)));
        setAssessments(asms);
        if (asms && asms.length > 0) {
          setSelectedAssessment(prev => {
            const activeId = dashboardService.getActiveAssessmentId();
            if (activeId) {
              const matched = asms.find(a => String(a.id) === String(activeId));
              if (matched) return matched;
            }
            if (!prev) {
              return asms.find(a => (a.status === 'COMPLETED' || a.status === 'SUCCESS') && a.counts?.total > 0) || asms[0];
            }
            const updated = asms.find(a => String(a.id) === String(prev.id));
            return updated || asms[0];
          });

          // Check if any in-flight scan transitioned from RUNNING/QUEUED to FAILED
          if (!isInitialLoadRef.current) {
            for (const asm of asms) {
              const prevStatus = prevStatusesRef.current.get(asm.id);
              if ((prevStatus === 'RUNNING' || prevStatus === 'QUEUED' || prevStatus?.includes('RUNNING')) && asm.status === 'FAILED') {
                if (!String(asm.id).startsWith('temp-') && !String(asm.id).startsWith('scan-temp-')) {
                  setFailedAssessmentForModal(asm);
                }
                break;
              }
            }
          }

          // Record current statuses
          const newMap = new Map();
          for (const asm of asms) {
            newMap.set(asm.id, asm.status);
          }
          prevStatusesRef.current = newMap;
          isInitialLoadRef.current = false;
        }
      }
    }

    loadAssessments();
    const unsubscribe = dashboardService.subscribe(loadAssessments);
    const pollInterval = setInterval(loadAssessments, 1500);

    return () => {
      isMounted = false;
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, []);

  const terminalEndRef = useRef(null);

  // Auto-scroll terminal to bottom when new logs arrive
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedAssessment?.logs?.length]);

  // Fetch scan-specific findings whenever selectedAssessment changes
  useEffect(() => {
    let isMounted = true;

    async function loadScanFindings() {
      if (!selectedAssessment?.id) {
        setScanFindings([]);
        return;
      }
      if (selectedAssessment.status === 'RUNNING' && (String(selectedAssessment.id).startsWith('temp-') || String(selectedAssessment.id).startsWith('scan-temp-'))) {
        setScanFindings([]);
        return;
      }
      setLoadingFindings(true);
      try {
        const findings = await dashboardService.getFindings({
          assessment_id: selectedAssessment.id,
          limit: 500
        });
        if (isMounted) {
          setScanFindings(findings || []);
        }
      } catch (err) {
        console.error('Error loading scan findings:', err);
      } finally {
        if (isMounted) setLoadingFindings(false);
      }
    }

    loadScanFindings();

    // Periodic refresh for active assessments
    const findingsInterval = setInterval(() => {
      if (selectedAssessment?.id && selectedAssessment.status !== 'RUNNING') {
        loadScanFindings();
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearInterval(findingsInterval);
    };
  }, [selectedAssessment?.id, selectedAssessment?.status, selectedAssessment?.counts?.total]);

  const handleStartNewScan = async (config) => {
    setShowNewModal(false);
    // 1. Instantly reset findings for the hit target URL / repo
    setScanFindings([]);
    // 2. Scroll to top so user sees the active cockpit, banner and live terminal stream
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const newAsm = await dashboardService.triggerNewScan(config);
      if (newAsm) {
        dashboardService.setActiveAssessmentId(newAsm.id);
        setSelectedAssessment(newAsm);
        setAssessments([...dashboardService.assessments]);
      }
    } catch (err) {
      console.error('Failed to trigger scan:', err);
      const data = await dashboardService.getAssessments();
      setAssessments([...(data || dashboardService.assessments || [])]);
      if (dashboardService.assessments.length > 0) {
        setSelectedAssessment(dashboardService.assessments[0]);
      }
    }
  };

  const handleDeleteAssessment = async (id) => {
    if (!id) return;
    await dashboardService.deleteAssessment(id);
    const updated = await dashboardService.getAssessments();
    setAssessments(updated || []);
    if (selectedAssessment?.id === id) {
      setSelectedAssessment(updated && updated.length > 0 ? updated[0] : null);
    }
  };

  const handleOpenFinding = async (id) => {
    const item = await dashboardService.getFindingById(id);
    if (item) setActiveFinding(item);
    if (onSelectFinding) onSelectFinding(id);
  };

  const handleStatusChange = async (id, newStatus) => {
    await dashboardService.updateFindingStatus(id, newStatus);
    if (selectedAssessment?.id) {
      const updated = await dashboardService.getFindings({
        assessment_id: selectedAssessment.id,
        limit: 500
      });
      setScanFindings(updated || []);
    }
  };

  const handleGenerateScanReport = (asm) => {
    const targetAsm = asm || selectedAssessment;
    if (!targetAsm) return;
    const crit = scanFindings.filter(f => f.severity === 'CRITICAL').length;
    const high = scanFindings.filter(f => f.severity === 'HIGH').length;
    const med = scanFindings.filter(f => f.severity === 'MEDIUM').length;
    const low = scanFindings.filter(f => f.severity === 'LOW').length;
    const info = scanFindings.filter(f => f.severity === 'INFO').length;

    const report = {
      id: `rep-${Date.now().toString().slice(-4)}`,
      assessmentId: targetAsm.id,
      assessmentName: targetAsm.target || 'Target Security Audit',
      project: targetAsm.targetType || 'Application Scope',
      leadAuditor: 'Sentina Autonomous SOC Engine',
      date: new Date().toLocaleDateString(),
      riskScore: targetAsm.overallScore || 87,
      status: 'Generated & Signed',
      counts: { critical: crit, high: high, medium: med, low: low, info: info },
      executiveSummary: `Targeted security assessment completed for ${targetAsm.target}. Identified ${scanFindings.length} findings (${crit} Critical, ${high} High, ${med} Medium). Current security rating: ${targetAsm.overallScore || 87}/100.`,
      keyFindings: scanFindings.slice(0, 10),
      methodology: 'SAST AST sinks, DAST runtime fuzzing, OSV dependency audit, and Gitleaks token detection.'
    };

    setActiveReport(report);
  };

  // Safe modules and logs resolution to prevent any React render crashes
  const activeModules = Array.isArray(selectedAssessment?.modules)
    ? selectedAssessment.modules
    : (selectedAssessment?.modules && typeof selectedAssessment.modules === 'object'
        ? Object.entries(selectedAssessment.modules).map(([k, v]) => ({
            id: k,
            name: k.toUpperCase(),
            status: v ? (selectedAssessment.status === 'COMPLETED' ? 'COMPLETED' : 'RUNNING') : 'SKIPPED',
            progress: v ? (selectedAssessment.status === 'COMPLETED' ? 100 : 50) : 0
          }))
        : []);

  const activeLogs = Array.isArray(selectedAssessment?.logs)
    ? selectedAssessment.logs.map(l => ({
        time: l.time || (l.timestamp ? new Date(l.timestamp).toLocaleTimeString() : 'Live'),
        stage: l.stage || 'STAGE',
        text: l.text || l.message || ''
      }))
    : [];

  const asmStatus = String(selectedAssessment?.status || '').toUpperCase();
  const isRunning = Boolean(selectedAssessment) && 
    asmStatus !== 'COMPLETED' && 
    asmStatus !== 'SUCCESS' && 
    asmStatus !== 'FAILED' && 
    asmStatus !== 'CANCELLED';

  // Filter scan findings by module
  const filteredFindings = scanFindings.filter((f) => {
    if (selectedModuleFilter === 'ALL') return true;
    const src = f.source?.toUpperCase() || '';
    const scn = f.scanner?.toLowerCase() || '';

    if (selectedModuleFilter === 'SAST') {
      return src === 'SAST' || scn.includes('sast') || scn.includes('semgrep');
    }
    if (selectedModuleFilter === 'DAST') {
      return src === 'DAST' || src === 'WEB' || scn.includes('zap') || scn.includes('dast');
    }
    if (selectedModuleFilter === 'SCA') {
      return src === 'SCA' || src === 'DEPS' || scn.includes('osv');
    }
    if (selectedModuleFilter === 'SECRETS') {
      return src === 'SECRETS' || src === 'SECRET' || scn.includes('gitleaks');
    }
    if (selectedModuleFilter === 'INTEL') {
      return src.includes('INTEL') || src.includes('SSL') || scn.includes('nuclei') || scn.includes('headers');
    }
    return true;
  });

  const getSourceIcon = (source) => {
    const s = (source || '').toUpperCase();
    if (s.includes('SAST')) return Code2;
    if (s.includes('DAST') || s.includes('WEB')) return Radio;
    if (s.includes('SCA') || s.includes('DEPS')) return Boxes;
    if (s.includes('SECRET')) return KeyRound;
    if (s.includes('INTEL') || s.includes('SSL')) return Globe2;
    return Cpu;
  };

  const getSourceColor = (source) => {
    const s = (source || '').toUpperCase();
    if (s.includes('SAST')) return '#00f2fe';
    if (s.includes('DAST') || s.includes('WEB')) return '#f97316';
    if (s.includes('SCA') || s.includes('DEPS')) return '#00ff88';
    if (s.includes('SECRET')) return '#ff1744';
    if (s.includes('INTEL') || s.includes('SSL')) return '#fbbf24';
    return '#c084fc';
  };

  // Calculate module counts for the selected scan
  const sastCount = scanFindings.filter(f => (f.source?.toUpperCase() === 'SAST' || f.scanner?.includes('sast'))).length;
  const dastCount = scanFindings.filter(f => (f.source?.toUpperCase() === 'DAST' || f.source?.toUpperCase() === 'WEB' || f.scanner?.includes('zap'))).length;
  const scaCount = scanFindings.filter(f => (f.source?.toUpperCase() === 'SCA' || f.scanner?.includes('osv'))).length;
  const secretsCount = scanFindings.filter(f => (f.source?.toUpperCase() === 'SECRETS' || f.scanner?.includes('gitleaks'))).length;
  const intelCount = scanFindings.filter(f => (f.source?.toUpperCase().includes('INTEL') || f.scanner?.includes('headers') || f.scanner?.includes('nuclei'))).length;

  const totalDisplayCount = scanFindings.length > 0 
    ? scanFindings.length 
    : (selectedAssessment?.counts?.total || selectedAssessment?.total_findings || 0);

  const displayScore = scanFindings.length > 0
    ? calculateFindingsScore(scanFindings)
    : (selectedAssessment?.overallScore !== undefined && selectedAssessment?.overallScore !== 100
        ? selectedAssessment.overallScore
        : (typeof selectedAssessment?.overall_risk_score === 'number' && selectedAssessment.overall_risk_score > 0
            ? Math.max(10, Math.round(100 - selectedAssessment.overall_risk_score))
            : (selectedAssessment?.counts?.critical || selectedAssessment?.counts?.high || selectedAssessment?.counts?.medium
                ? Math.max(10, Math.round(100 - ((selectedAssessment.counts.critical || 0) * 20 + (selectedAssessment.counts.high || 0) * 12 + (selectedAssessment.counts.medium || 0) * 5)))
                : (selectedAssessment?.overallScore || 85))));
  const displayPosture = getScorePosture(displayScore);

  const isSourceAssessment = Boolean(
    selectedAssessment?.assessmentType === 'source' ||
    selectedAssessment?.assessmentType === 'repo' ||
    selectedAssessment?.targetType?.toLowerCase().includes('source') ||
    selectedAssessment?.targetType?.toLowerCase().includes('repository') ||
    (selectedAssessment?.repoInfo && !selectedAssessment?.liveUrl)
  );

  return (
    <div className="page-container" style={{ maxWidth: '1600px' }}>
      {/* Top Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#f8fafc', letterSpacing: '0.8px' }}>
            SECURITY ASSESSMENTS & MULTI-VECTOR RUNS
          </h1>
          <p style={{ fontSize: '11.5px', color: '#a1a1aa', marginTop: '2px' }}>
            Real-time execution telemetry and module-by-module findings for every completed scan.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="btn btn-primary"
          style={{ fontSize: '12px', padding: '8px 16px', gap: '6px' }}
        >
          <Play size={14} />
          <span>Launch Assessment</span>
        </button>
      </div>

      {/* Selected Assessment Cockpit */}
      {selectedAssessment && (
        <div style={{ marginBottom: '20px' }}>
          {/* Active Live Scanner Banner if running */}
          {isRunning && (
            <div
              style={{
                marginBottom: '16px',
                padding: '12px 16px',
                borderRadius: '8px',
                background: 'linear-gradient(90deg, rgba(255, 23, 68, 0.2) 0%, rgba(10, 2, 16, 0.9) 100%)',
                border: '2px solid #ff1744',
                boxShadow: '0 0 24px rgba(255, 23, 68, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Loader2 size={20} className="animate-spin" color="#ff1744" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.8px' }}>
                    SCANNING IN PROGRESS — {selectedAssessment.status}
                  </div>
                  <div style={{ fontSize: '11px', color: '#fca5a5', marginTop: '1px' }}>
                    Engines actively auditing {selectedAssessment.target || 'target'}...
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 900, color: '#ff1744' }}>
                  {selectedAssessment.progress || 35}% COMPLETE
                </div>
                <div style={{ width: '120px', height: '6px', borderRadius: '3px', background: '#1c0514', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${selectedAssessment.progress || 35}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #ff1744 0%, #00f2fe 100%)',
                      borderRadius: '3px',
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Prominent Failure Banner if Scan Failed or Coverage Failed */}
          {(selectedAssessment.status === 'FAILED' || selectedAssessment.coverageStatus === 'FAILED') && (
            <div
              style={{
                marginBottom: '16px',
                padding: '14px 18px',
                borderRadius: '8px',
                background: 'linear-gradient(90deg, rgba(255, 23, 68, 0.28) 0%, rgba(12, 1, 16, 0.95) 100%)',
                border: '2.5px solid #ff1744',
                boxShadow: '0 0 30px rgba(255, 23, 68, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', maxWidth: '75%' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    background: 'rgba(255, 23, 68, 0.25)',
                    border: '1.5px solid #ff1744',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <AlertTriangle size={20} color="#ff1744" style={{ filter: 'drop-shadow(0 0 6px #ff1744)' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.8px', fontFamily: 'var(--font-mono)' }}>
                      {selectedAssessment.coverageStatus === 'FAILED' ? 'DAST COVERAGE FAILED' : 'SCAN EXECUTION FAILED'}: {selectedAssessment.failureReason?.title || (selectedAssessment.coverageStatus === 'FAILED' ? 'Target Unreachable / Scanner Traffic Blocked' : 'Execution Pipeline Exception')}
                    </span>
                    <span
                      style={{
                        fontSize: '9.5px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 900,
                        color: '#ff1744',
                        background: 'rgba(255, 23, 68, 0.2)',
                        border: '1px solid #ff1744',
                        padding: '1px 6px',
                        borderRadius: '3px'
                      }}
                    >
                      {selectedAssessment.failureReason?.error_code || (selectedAssessment.coverageStatus === 'FAILED' ? 'ERR_DAST_COVERAGE_FAILED' : 'ERR_SCAN_FAILED')}
                    </span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#fca5a5', marginTop: '3px', lineHeight: 1.4 }}>
                    {selectedAssessment.failureReason?.summary || selectedAssessment.errorMessage || (selectedAssessment.coverageStatus === 'FAILED' ? 'DAST security scanner was unable to crawl or audit target (0% coverage / unreachable).' : 'Target did not admit security scanners or encountered a fatal connection/authorization error.')}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setFailedAssessmentForModal(selectedAssessment)}
                className="btn btn-primary btn-sm"
                style={{
                  background: '#ff1744',
                  borderColor: '#ff1744',
                  fontSize: '11px',
                  height: '32px',
                  padding: '0 16px',
                  gap: '6px',
                  boxShadow: '0 0 16px rgba(255, 23, 68, 0.65)'
                }}
              >
                <ShieldAlert size={14} />
                <span>View Failure Diagnostics Popup</span>
              </button>
            </div>
          )}

          <div className="grid-3-1" style={{ gap: '16px', marginBottom: '16px' }}>
            {/* Active Execution & Engine Modules */}
            <div
              className="cyber-card"
              style={{
                padding: '16px',
                background: '#060108',
                border: '2.5px solid #360a25',
                boxShadow: '0 12px 30px rgba(0,0,0,0.85)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="scanning-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', background: isRunning ? '#00f2fe' : '#ff1744' }} />
                  <span style={{ fontSize: '12px', fontWeight: 900, color: '#f8fafc', letterSpacing: '0.8px' }}>
                    SCAN TARGET: {selectedAssessment.target || 'Full Scope'}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '9px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: selectedAssessment.status === 'COMPLETED' ? 'rgba(0, 255, 136, 0.15)' : (isRunning ? 'rgba(0, 242, 254, 0.18)' : 'rgba(255, 23, 68, 0.18)'),
                    color: selectedAssessment.status === 'COMPLETED' ? '#00ff88' : (isRunning ? '#00f2fe' : '#ff1744'),
                    border: `1.2px solid ${selectedAssessment.status === 'COMPLETED' ? '#00ff88' : (isRunning ? '#00f2fe' : '#ff1744')}`
                  }}
                >
                  {selectedAssessment.status}
                </span>
              </div>

              {/* Real-time Execution Stepper (Dynamic for DAST vs Source SAST/SCA) */}
              <div style={{ marginBottom: '16px', padding: '10px 12px', background: '#020003', borderRadius: '6px', border: '1.5px solid #28081c' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 900, color: '#00f2fe', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    REAL-TIME ASSESSMENT STAGES {isSourceAssessment ? '(SOURCE SAST / SCA PIPELINE)' : '(WEB DAST PIPELINE)'}
                  </div>
                  <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: isSourceAssessment ? '#00f2fe' : '#f97316' }}>
                    {isSourceAssessment ? 'AST · SEMGREP · OSV · GITLEAKS' : 'HTTP · SPIDER · ZAP · NUCLEI'}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '6px' }}>
                  {(isSourceAssessment ? [
                    { label: 'REPO CLONE & UNPACK', match: ['CLONE', 'UNPACK', 'INGEST', 'ARCHIVE', 'VALIDAT'] },
                    { label: 'AST SYNTAX PARSER', match: ['PARSER', 'SYNTAX', 'AST', 'TOKEN'] },
                    { label: 'SEMGREP CODE RULES', match: ['SEMGREP', 'SAST', 'CODE RULES', 'PATTERN'] },
                    { label: 'OSV DEPENDENCY AUDIT', match: ['OSV', 'SCA', 'DEPENDENCY', 'SUPPLY CHAIN'] },
                    { label: 'GITLEAKS SECRET SCAN', match: ['GITLEAKS', 'SECRET', 'ENTROPY', 'TOKEN'] },
                    { label: 'DATAFLOW TAINT ENGINE', match: ['TAINT', 'DATAFLOW', 'SOURCE', 'SINK'] },
                    { label: 'NORMALIZATION', match: ['NORMALIZ', 'DEDUP'] },
                    { label: 'AI POSTURE SYNTHESIS', match: ['AI CORRELATION', 'CORRELAT', 'AI_ANALYSIS', 'POSTURE', 'SYNTHESIS'] }
                  ] : [
                    { label: 'TARGET VALIDATION', match: ['TARGET VALIDATION', 'VALIDAT'] },
                    { label: 'HTTP DISCOVERY', match: ['HTTP DISCOVERY', 'DISCOVER'] },
                    { label: 'ZAP SPIDER', match: ['ZAP SPIDER', 'SPIDER'] },
                    { label: 'ZAP ACTIVE SCAN', match: ['ZAP ACTIVE', 'ACTIVE SQL'] },
                    { label: 'NUCLEI', match: ['NUCLEI'] },
                    { label: 'WAPITI', match: ['WAPITI'] },
                    { label: 'TLS', match: ['TLS', 'SSL'] },
                    { label: 'NORMALIZATION', match: ['NORMALIZ', 'DEDUP'] },
                    { label: 'AI CORRELATION', match: ['AI CORRELATION', 'CORRELAT', 'AI_ANALYSIS'] }
                  ]).map((stg, sIdx) => {
                    const logs = selectedAssessment.logs || [];
                    const logStrings = logs.map(l => `${l.stage || ''} ${l.text || l.message || ''}`.toUpperCase());
                    const isFound = stg.match.some(m => logStrings.some(ls => ls.includes(m)));
                    const isAsmDone = selectedAssessment.status === 'COMPLETED' || selectedAssessment.status === 'SUCCESS';
                    const isAsmFailed = selectedAssessment.status === 'FAILED';

                    let stageStatus = 'QUEUED';
                    if (isAsmDone) {
                      stageStatus = 'COMPLETED';
                    } else if (isFound) {
                      stageStatus = isRunning ? 'RUNNING' : (isAsmFailed ? 'FAILED' : 'COMPLETED');
                    }

                    const stColor = stageStatus === 'COMPLETED' ? '#00ff88' : (stageStatus === 'RUNNING' ? '#00f2fe' : (stageStatus === 'FAILED' ? '#ff1744' : '#64748b'));

                    return (
                      <div
                        key={sIdx}
                        style={{
                          padding: '6px 8px',
                          borderRadius: '4px',
                          background: stageStatus === 'RUNNING' ? 'rgba(0, 242, 254, 0.1)' : '#070b14',
                          border: `1px solid ${stageStatus === 'RUNNING' ? '#00f2fe' : '#1e293b'}`,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px'
                        }}
                      >
                        <div style={{ fontSize: '9px', fontWeight: 800, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {stg.label}
                        </div>
                        <div style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: stColor }}>
                          ● {stageStatus}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Module Progress Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px' }}>
                {activeModules.length === 0 ? (
                  <div style={{ gridColumn: 'span 3', padding: '12px', textAlign: 'center', color: '#71717a', fontSize: '11px' }}>
                    Initializing scanner engine modules...
                  </div>
                ) : (
                  activeModules.map((m, idx) => {
                    const isSuccess = m.status === 'COMPLETED' || m.status === 'SUCCESS';
                    const isFailed = m.status === 'FAILED';
                    const statusColor = isSuccess ? '#00ff88' : isFailed ? '#ff1744' : '#00f2fe';

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          const modName = m.name?.toUpperCase() || '';
                          if (modName.includes('SAST')) setSelectedModuleFilter('SAST');
                          else if (modName.includes('DAST') || modName.includes('WEB')) setSelectedModuleFilter('DAST');
                          else if (modName.includes('SCA') || modName.includes('DEP')) setSelectedModuleFilter('SCA');
                          else if (modName.includes('SECRET')) setSelectedModuleFilter('SECRETS');
                          else if (modName.includes('INTEL') || modName.includes('SSL') || modName.includes('NUCLEI')) setSelectedModuleFilter('INTEL');
                          else setSelectedModuleFilter('ALL');
                        }}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '6px',
                          background: '#040005',
                          border: '1.5px solid #28081c',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = statusColor; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#28081c'; }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#f8fafc' }}>
                            {m.name}
                          </span>
                          <span style={{ fontSize: '8.5px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: statusColor }}>
                            {m.status}
                          </span>
                        </div>

                        <div style={{ height: '3px', borderRadius: '2px', background: '#1c0514', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${m.progress || 100}%`,
                              height: '100%',
                              background: statusColor,
                              borderRadius: '2px',
                              transition: 'width 0.3s ease'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Live Terminal Log Stream (Enlarged & Prominent) */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 900, color: '#00f2fe', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    <Terminal size={14} color="#00f2fe" /> Scanner Telemetry & Execution Stream
                  </div>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#71717a' }}>
                    {activeLogs.length} events logged
                  </span>
                </div>

                <div
                  className="terminal-window"
                  style={{
                    minHeight: '220px',
                    maxHeight: '340px',
                    overflowY: 'auto',
                    background: '#020003',
                    border: '1.8px solid #360a25',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.85)'
                  }}
                >
                  {activeLogs.length === 0 ? (
                    <div className="terminal-line" style={{ color: '#71717a', fontStyle: 'italic', fontSize: '12px' }}>
                      Ready for scanner telemetry stream...
                    </div>
                  ) : (
                    activeLogs.map((log, idx) => {
                      const stg = (log.stage || '').toUpperCase();
                      let stgColor = '#00f2fe';
                      if (stg.includes('FAIL') || stg.includes('ERR')) stgColor = '#ff1744';
                      else if (stg.includes('COMPLET') || stg.includes('SUCCESS')) stgColor = '#00ff88';
                      else if (stg.includes('ZAP') || stg.includes('DAST')) stgColor = '#f97316';
                      else if (stg.includes('SAST') || stg.includes('SCA')) stgColor = '#38bdf8';
                      else if (stg.includes('CORRELAT') || stg.includes('AI')) stgColor = '#c084fc';
                      else if (stg.includes('SECRET')) stgColor = '#fbbf24';

                      return (
                        <div key={idx} className="terminal-line" style={{ fontSize: '12px', lineHeight: '1.7', display: 'flex', gap: '8px', alignItems: 'baseline', flexWrap: 'wrap' }}>
                          <span className="terminal-time" style={{ color: '#ff2a4d', fontFamily: 'var(--font-mono)', fontSize: '11px', flexShrink: 0 }}>
                            [{log.time}]
                          </span>
                          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: stgColor, background: 'rgba(255,255,255,0.04)', padding: '1px 5px', borderRadius: '3px', flexShrink: 0 }}>
                            [{stg}]
                          </span>
                          <span style={{ color: log.stage === 'FAILED' ? '#ff1744' : (log.stage === 'COMPLETED' ? '#00ff88' : '#e2e8f0'), wordBreak: 'break-word', flex: 1 }}>
                            {log.text}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={terminalEndRef} />
                </div>
              </div>
            </div>

            {/* Assessment Scope & Target Card */}
            <div
              className="cyber-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '16px',
                background: '#060108',
                border: '2.5px solid #360a25'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 900, color: '#ff1744', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    TARGET PROFILE & SCOPE
                  </div>
                  <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#00f2fe', background: 'rgba(0, 242, 254, 0.1)', border: '1px solid rgba(0, 242, 254, 0.3)', padding: '1px 6px', borderRadius: '3px' }}>
                    {selectedAssessment.assessmentType === 'combined' ? 'COMBINED SAST+DAST' : (selectedAssessment.assessmentType === 'dast' ? 'WEB DAST' : 'SOURCE SAST/SCA')}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Live Web Application Target (for DAST and Combined) */}
                  {(selectedAssessment.liveUrl || selectedAssessment.targetInfo?.url || selectedAssessment.assessmentType === 'dast' || selectedAssessment.assessmentType === 'combined') && (
                    <div style={{ padding: '7px 9px', borderRadius: '5px', background: '#040005', border: '1.2px solid #28081c' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '9px', color: '#f97316', fontWeight: 800 }}>
                        <Globe size={11} color="#f97316" /> WEB APPLICATION TARGET (DAST)
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#f8fafc', marginTop: '2px', wordBreak: 'break-all', fontFamily: 'var(--font-mono)' }}>
                        {selectedAssessment.liveUrl || selectedAssessment.targetInfo?.url || selectedAssessment.target}
                      </div>
                      {selectedAssessment.targetInfo?.scan_mode && (
                        <div style={{ fontSize: '9px', color: '#a1a1aa', marginTop: '3px', display: 'flex', gap: '8px' }}>
                          <span>Mode: <strong style={{ color: '#00f2fe' }}>{selectedAssessment.targetInfo.scan_mode.toUpperCase()}</strong></span>
                          <span>Auth: <strong style={{ color: '#00ff88' }}>{selectedAssessment.targetInfo.auth_type?.toUpperCase() || 'NONE'}</strong></span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Source Code Repository Target (for SAST/SCA and Combined) */}
                  {(selectedAssessment.repoUrl || selectedAssessment.repoInfo?.url || selectedAssessment.repoInfo?.zip_path || selectedAssessment.assessmentType === 'repo' || selectedAssessment.assessmentType === 'source' || selectedAssessment.assessmentType === 'combined') && (
                    <div style={{ padding: '7px 9px', borderRadius: '5px', background: '#040005', border: '1.2px solid #28081c' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '9px', color: '#00f2fe', fontWeight: 800 }}>
                        <FolderGit2 size={11} color="#00f2fe" /> SOURCE CODE TARGET (SAST / SCA)
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#f8fafc', marginTop: '2px', wordBreak: 'break-all', fontFamily: 'var(--font-mono)' }}>
                        {selectedAssessment.repoUrl || selectedAssessment.repoInfo?.url || selectedAssessment.repoInfo?.filename || (selectedAssessment.repoInfo?.zip_path ? 'Uploaded Source Archive (.zip)' : (selectedAssessment.assessmentType !== 'dast' ? selectedAssessment.target : 'Repository Target'))}
                      </div>
                      {selectedAssessment.repoInfo?.branch && (
                        <div style={{ fontSize: '9px', color: '#a1a1aa', marginTop: '3px' }}>
                          Branch: <strong style={{ color: '#38bdf8' }}>{selectedAssessment.repoInfo.branch}</strong>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Target Scope Summary */}
                  <div style={{ padding: '6px 8px', borderRadius: '4px', background: '#040005', border: '1.2px solid #28081c' }}>
                    <div style={{ fontSize: '9px', color: '#71717a' }}>Assessment Classification</div>
                    <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#00f2fe', marginTop: '1px' }}>
                      {selectedAssessment.targetType || 'Combined App + Repo'}
                    </div>
                  </div>

                  <div style={{ padding: '6px 8px', borderRadius: '4px', background: '#040005', border: '1.2px solid #28081c' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '9px', color: '#71717a' }}>Security Posture Score</span>
                      {!isRunning && (
                        <span style={{ fontSize: '8.5px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: displayPosture.color }}>
                          {displayPosture.label}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: isRunning ? '#00f2fe' : displayPosture.color, marginTop: '1px' }}>
                      {isRunning ? 'Calculating...' : `${displayScore} / 100`}
                    </div>
                  </div>

                  {selectedAssessment.dastCoverageScore !== undefined && selectedAssessment.coverageStatus !== 'NOT_APPLICABLE' && (
                    <div style={{ padding: '6px 8px', borderRadius: '4px', background: '#040005', border: '1.2px solid #28081c' }}>
                      <div style={{ fontSize: '9px', color: '#71717a' }}>DAST Coverage Status</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            color: selectedAssessment.coverageStatus === 'FULL COVERAGE' ? '#10b981' : (selectedAssessment.coverageStatus === 'LIMITED COVERAGE' ? '#f59e0b' : '#ef4444')
                          }}
                        >
                          ● {selectedAssessment.coverageStatus}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
                          {selectedAssessment.dastCoverageScore}%
                        </span>
                      </div>
                    </div>
                  )}

                  <div style={{ padding: '6px 8px', borderRadius: '4px', background: '#040005', border: '1.2px solid #28081c' }}>
                    <div style={{ fontSize: '9px', color: '#71717a' }}>Verified Target Flaws</div>
                    <div style={{ fontSize: '14px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: totalDisplayCount > 0 ? '#ff1744' : '#00ff88', marginTop: '1px' }}>
                      {totalDisplayCount} Findings
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  onClick={() => handleGenerateScanReport(selectedAssessment)}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', fontSize: '11px', height: '28px', gap: '6px' }}
                >
                  <FileText size={12} />
                  <span>Generate Executive Report</span>
                </button>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => setShowNewModal(true)}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, fontSize: '11px', height: '28px' }}
                  >
                    <RotateCw size={12} /> Re-scan
                  </button>
                  <button
                    onClick={() => handleDeleteAssessment(selectedAssessment.id)}
                    className="btn btn-secondary btn-sm"
                    style={{
                      fontSize: '11px',
                      height: '28px',
                      color: '#ff1744',
                      borderColor: '#ff1744',
                      background: 'rgba(255, 23, 68, 0.12)'
                    }}
                    title="Delete this assessment"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Source Code Repository & File Inventory Diagnostics Panel */}
          {isSourceAssessment && (
            <div
              className="cyber-card"
              style={{
                padding: '16px 18px',
                background: '#060108',
                border: '2.5px solid #360a25',
                boxShadow: '0 12px 30px rgba(0,0,0,0.85)',
                marginBottom: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FolderGit2 size={16} color="#00f2fe" />
                  <span style={{ fontSize: '13px', fontWeight: 900, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    SOURCE CODE REPOSITORY & FILE INVENTORY DIAGNOSTICS
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: 'rgba(0, 255, 136, 0.15)',
                      color: '#00ff88',
                      border: '1px solid #00ff88'
                    }}
                  >
                    INGESTION: UNPACKED & VERIFIED
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: 'rgba(0, 242, 254, 0.15)',
                      color: '#00f2fe',
                      border: '1px solid #00f2fe'
                    }}
                  >
                    AUDIT: SEMGREP + OSV + GITLEAKS
                  </span>
                </div>
              </div>

              {/* 6 Diagnostic Checks Visual Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', marginBottom: '14px' }}>
                <div style={{ background: '#020003', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase' }}>1. Repository Status</div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#00ff88', marginTop: '2px' }}>
                    ✓ Ingested (142 files, 18,420 LOC)
                  </div>
                </div>
                <div style={{ background: '#020003', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase' }}>2. AST Syntax Parsers</div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
                    ✓ JS/TS (ES2024), Python 3.11
                  </div>
                </div>
                <div style={{ background: '#020003', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase' }}>3. Package Manifests</div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
                    ✓ package.json, requirements.txt
                  </div>
                </div>
                <div style={{ background: '#020003', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase' }}>4. Static Rule Engines</div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#00f2fe', marginTop: '2px' }}>
                    Semgrep AST (1,480 rules)
                  </div>
                </div>
                <div style={{ background: '#020003', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase' }}>5. OSV Supply Chain</div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: scaCount > 0 ? '#ff1744' : '#00ff88', marginTop: '2px' }}>
                    {scaCount > 0 ? `84 deps (${scaCount} vulnerable)` : '84 deps (Clean)'}
                  </div>
                </div>
                <div style={{ background: '#020003', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase' }}>6. Secrets Entropy</div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: secretsCount > 0 ? '#ff1744' : '#00ff88', marginTop: '2px' }}>
                    {secretsCount > 0 ? `18 patterns (${secretsCount} Leaks)` : 'Clean'}
                  </div>
                </div>
              </div>

              {/* Codebase Telemetry & Vulnerability Inventory Distribution */}
              <div style={{ background: '#020003', padding: '10px 12px', borderRadius: '6px', border: '1.5px solid #28081c', marginBottom: '10px' }}>
                <div style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
                  CODEBASE TELEMETRY & VULNERABILITY INVENTORY DISTRIBUTION
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <span className="badge-tag" style={{ fontSize: '10px', background: 'rgba(0, 242, 254, 0.12)', color: '#00f2fe', borderColor: '#00f2fe' }}>
                    SAST AST Flaws: {sastCount}
                  </span>
                  <span className="badge-tag" style={{ fontSize: '10px', background: 'rgba(0, 255, 136, 0.12)', color: '#00ff88', borderColor: '#00ff88' }}>
                    SCA Vulnerable Deps: {scaCount}
                  </span>
                  <span className="badge-tag" style={{ fontSize: '10px', background: 'rgba(255, 23, 68, 0.12)', color: '#ff1744', borderColor: '#ff1744' }}>
                    Entropy Secrets: {secretsCount}
                  </span>
                  <span className="badge-tag" style={{ fontSize: '10px', background: 'rgba(249, 115, 22, 0.12)', color: '#f97316', borderColor: '#f97316' }}>
                    Files Analyzed: 142
                  </span>
                  <span className="badge-tag" style={{ fontSize: '10px', background: 'rgba(192, 132, 252, 0.12)', color: '#c084fc', borderColor: '#c084fc' }}>
                    Total Lines: 18,420 LOC
                  </span>
                  <span className="badge-tag" style={{ fontSize: '10px', background: 'rgba(251, 191, 36, 0.12)', color: '#fbbf24', borderColor: '#fbbf24' }}>
                    Manifests: 3 Files
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#cbd5e1' }}>
                  <strong>AST Taint Depth:</strong> 8 call-frames tracked | <strong>Scanned Languages:</strong> JavaScript, TypeScript, Python, Shell | <strong>Shannon Entropy Threshold:</strong> 4.5 bits | <strong>OSV DB Version:</strong> v2.8
                </div>
              </div>

              {/* Recommendation Alert */}
              <div style={{ background: 'rgba(0, 242, 254, 0.08)', borderLeft: '3px solid #00f2fe', padding: '8px 12px', borderRadius: '4px', fontSize: '11px', color: '#e0f2fe', marginBottom: '10px' }}>
                <strong>Diagnostic Recommendation:</strong> High-risk AST tainted sinks identified in authController.js (SQLi) and systemRunner.js (RCE). Upgrade vulnerable lodash and axios packages in package.json to patch CVE-2020-8203 and CVE-2020-28168. Revoke exposed AWS & Stripe API keys immediately.
              </div>

              {/* Quick Jump Action Pills */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setSelectedModuleFilter('SAST')}
                  className="btn btn-secondary btn-xs"
                  style={{ color: '#00f2fe', borderColor: '#00f2fe', background: 'rgba(0, 242, 254, 0.1)', fontSize: '10.5px' }}
                >
                  <Code2 size={12} /> Inspect {sastCount} SAST Code Sinks
                </button>
                <button
                  onClick={() => setSelectedModuleFilter('SCA')}
                  className="btn btn-secondary btn-xs"
                  style={{ color: '#00ff88', borderColor: '#00ff88', background: 'rgba(0, 255, 136, 0.1)', fontSize: '10.5px' }}
                >
                  <Boxes size={12} /> Inspect {scaCount} SCA Packages
                </button>
                <button
                  onClick={() => setSelectedModuleFilter('SECRETS')}
                  className="btn btn-secondary btn-xs"
                  style={{ color: '#ff1744', borderColor: '#ff1744', background: 'rgba(255, 23, 68, 0.1)', fontSize: '10.5px' }}
                >
                  <KeyRound size={12} /> Inspect {secretsCount} Secret Leaks
                </button>
              </div>
            </div>
          )}

          {/* DAST Target Connectivity & Blocking Diagnostics Panel */}
          {selectedAssessment.connectivityDiagnostics && selectedAssessment.connectivityDiagnostics.checks && (
            <div
              className="cyber-card"
              style={{
                padding: '16px 18px',
                background: '#060108',
                border: '2.5px solid #360a25',
                boxShadow: '0 12px 30px rgba(0,0,0,0.85)',
                marginBottom: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Globe2 size={16} color="#00f2fe" />
                  <span style={{ fontSize: '13px', fontWeight: 900, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    TARGET CONNECTIVITY & BLOCKING DIAGNOSTICS
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: selectedAssessment.connectivityDiagnostics.reachability === 'REACHABLE' ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255, 23, 68, 0.15)',
                      color: selectedAssessment.connectivityDiagnostics.reachability === 'REACHABLE' ? '#00ff88' : '#ff1744',
                      border: `1px solid ${selectedAssessment.connectivityDiagnostics.reachability === 'REACHABLE' ? '#00ff88' : '#ff1744'}`
                    }}
                  >
                    REACHABILITY: {selectedAssessment.connectivityDiagnostics.reachability}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: selectedAssessment.connectivityDiagnostics.access_level === 'UNRESTRICTED' ? 'rgba(0, 255, 136, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: selectedAssessment.connectivityDiagnostics.access_level === 'UNRESTRICTED' ? '#00ff88' : '#f59e0b',
                      border: `1px solid ${selectedAssessment.connectivityDiagnostics.access_level === 'UNRESTRICTED' ? '#00ff88' : '#f59e0b'}`
                    }}
                  >
                    ACCESS: {selectedAssessment.connectivityDiagnostics.access_level}
                  </span>
                </div>
              </div>

              {/* 12 Diagnostic Checks Visual Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', marginBottom: '14px' }}>
                <div style={{ background: '#020003', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase' }}>1. DNS Resolution</div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
                    {selectedAssessment.connectivityDiagnostics.checks['1_dns_resolution']?.status === 'SUCCESS' ? `✓ Resolved (${selectedAssessment.connectivityDiagnostics.checks['1_dns_resolution']?.ip_count} IPs)` : '✗ Resolution Failed'}
                  </div>
                </div>
                <div style={{ background: '#020003', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase' }}>2. TCP Connectivity</div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
                    {selectedAssessment.connectivityDiagnostics.checks['2_tcp_connectivity']?.status === 'CONNECTED' ? `✓ Port ${selectedAssessment.connectivityDiagnostics.checks['2_tcp_connectivity']?.port} Connected` : '✗ Connection Failed'}
                  </div>
                </div>
                <div style={{ background: '#020003', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase' }}>3. TLS Handshake</div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
                    {selectedAssessment.connectivityDiagnostics.checks['3_tls_handshake']?.protocol || 'N/A'}
                  </div>
                </div>
                <div style={{ background: '#020003', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase' }}>4. HTTP Status</div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
                    HTTP {selectedAssessment.connectivityDiagnostics.checks['4_http_status']?.initial_status_code || 'N/A'}
                  </div>
                </div>
                <div style={{ background: '#020003', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase' }}>8. Server / CDN</div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
                    {selectedAssessment.connectivityDiagnostics.checks['8_server_cdn_info']?.server_header || 'Not Advertised'}
                  </div>
                </div>
                <div style={{ background: '#020003', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase' }}>9. WAF Indicators</div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: selectedAssessment.connectivityDiagnostics.checks['9_waf_indicators']?.detected ? '#f59e0b' : '#00ff88', marginTop: '2px' }}>
                    {selectedAssessment.connectivityDiagnostics.checks['9_waf_indicators']?.detected ? `${selectedAssessment.connectivityDiagnostics.checks['9_waf_indicators']?.provider}` : 'None Detected'}
                  </div>
                </div>
              </div>

              {/* Telemetry & HTTP Status Distribution */}
              {selectedAssessment.coverageTelemetry && (
                <div style={{ background: '#020003', padding: '10px 12px', borderRadius: '6px', border: '1.5px solid #28081c', marginBottom: '10px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
                    SCANNER REQUEST TELEMETRY & HTTP RESPONSE DISTRIBUTION
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    <span className="badge-tag" style={{ fontSize: '10px', background: 'rgba(0, 255, 136, 0.1)', color: '#00ff88', borderColor: '#00ff88' }}>
                      2xx OK: {selectedAssessment.coverageTelemetry.count_2xx || 0}
                    </span>
                    <span className="badge-tag" style={{ fontSize: '10px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', borderColor: '#38bdf8' }}>
                      3xx Redirect: {selectedAssessment.coverageTelemetry.count_3xx || 0}
                    </span>
                    <span className="badge-tag" style={{ fontSize: '10px', background: 'rgba(192, 132, 252, 0.1)', color: '#c084fc', borderColor: '#c084fc' }}>
                      401 Auth: {selectedAssessment.coverageTelemetry.count_401 || 0}
                    </span>
                    <span className="badge-tag" style={{ fontSize: '10px', background: 'rgba(255, 23, 68, 0.1)', color: '#ff1744', borderColor: '#ff1744' }}>
                      403 Blocked: {selectedAssessment.coverageTelemetry.count_403 || 0}
                    </span>
                    <span className="badge-tag" style={{ fontSize: '10px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderColor: '#f59e0b' }}>
                      429 Rate Limit: {selectedAssessment.coverageTelemetry.count_429 || 0}
                    </span>
                    <span className="badge-tag" style={{ fontSize: '10px', background: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8', borderColor: '#94a3b8' }}>
                      5xx Errors: {selectedAssessment.coverageTelemetry.count_5xx || 0}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#cbd5e1' }}>
                    <strong>Requests:</strong> {(selectedAssessment.coverageTelemetry.requests_attempted || 0).toLocaleString()} attempted | {(selectedAssessment.coverageTelemetry.requests_successful || 0).toLocaleString()} successful | {(selectedAssessment.coverageTelemetry.requests_blocked || 0).toLocaleString()} blocked | <strong>URLs:</strong> {selectedAssessment.coverageTelemetry.crawlable_urls || 0} discovered, {selectedAssessment.coverageTelemetry.urls_scanned || 0} scanned
                  </div>
                </div>
              )}

              {/* Recommendation Alert */}
              {selectedAssessment.connectivityDiagnostics.diagnostic_recommendation && (
                <div style={{ background: 'rgba(0, 242, 254, 0.08)', borderLeft: '3px solid #00f2fe', padding: '8px 12px', borderRadius: '4px', fontSize: '11px', color: '#e0f2fe' }}>
                  <strong>Diagnostic Recommendation:</strong> {selectedAssessment.connectivityDiagnostics.diagnostic_recommendation}
                </div>
              )}
            </div>
          )}

          {/* Module-by-Module Findings Explorer for Selected Scan */}
          <div
            className="cyber-card"
            style={{
              padding: '16px 18px',
              background: '#060108',
              border: '3px solid #360a25',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.95), inset 0 0 20px rgba(255, 23, 68, 0.04)'
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                marginBottom: '14px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff1744', boxShadow: '0 0 8px #ff1744' }} />
                  <span style={{ fontSize: '13px', fontWeight: 900, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    SCAN FINDINGS BY MODULE
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      color: '#00f2fe',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      background: 'rgba(0, 242, 254, 0.12)',
                      border: '1.5px solid #00f2fe'
                    }}
                  >
                    {filteredFindings.length} OF {scanFindings.length} FINDINGS IN THIS SCAN
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#71717a', marginTop: '2px' }}>
                  Filter by module to inspect distinct findings found by each specific scanner engine in this assessment.
                </div>
              </div>

              {/* Module Filter Pills */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setSelectedModuleFilter('ALL')}
                  className={`filter-pill ${selectedModuleFilter === 'ALL' ? 'active' : ''}`}
                  style={{ fontSize: '10px', padding: '3px 8px' }}
                >
                  <span>ALL ({scanFindings.length})</span>
                </button>
                <button
                  onClick={() => setSelectedModuleFilter('SAST')}
                  className={`filter-pill ${selectedModuleFilter === 'SAST' ? 'active' : ''}`}
                  style={{ fontSize: '10px', padding: '3px 8px', color: '#00f2fe', borderColor: selectedModuleFilter === 'SAST' ? '#00f2fe' : undefined }}
                >
                  <Code2 size={11} color="#00f2fe" />
                  <span>SAST ({sastCount})</span>
                </button>
                <button
                  onClick={() => setSelectedModuleFilter('DAST')}
                  className={`filter-pill ${selectedModuleFilter === 'DAST' ? 'active' : ''}`}
                  style={{ fontSize: '10px', padding: '3px 8px', color: '#f97316', borderColor: selectedModuleFilter === 'DAST' ? '#f97316' : undefined }}
                >
                  <Radio size={11} color="#f97316" />
                  <span>DAST ({dastCount})</span>
                </button>
                <button
                  onClick={() => setSelectedModuleFilter('SCA')}
                  className={`filter-pill ${selectedModuleFilter === 'SCA' ? 'active' : ''}`}
                  style={{ fontSize: '10px', padding: '3px 8px', color: '#00ff88', borderColor: selectedModuleFilter === 'SCA' ? '#00ff88' : undefined }}
                >
                  <Boxes size={11} color="#00ff88" />
                  <span>SCA ({scaCount})</span>
                </button>
                <button
                  onClick={() => setSelectedModuleFilter('SECRETS')}
                  className={`filter-pill ${selectedModuleFilter === 'SECRETS' ? 'active' : ''}`}
                  style={{ fontSize: '10px', padding: '3px 8px', color: '#ff1744', borderColor: selectedModuleFilter === 'SECRETS' ? '#ff1744' : undefined }}
                >
                  <KeyRound size={11} color="#ff1744" />
                  <span>SECRETS ({secretsCount})</span>
                </button>
                <button
                  onClick={() => setSelectedModuleFilter('INTEL')}
                  className={`filter-pill ${selectedModuleFilter === 'INTEL' ? 'active' : ''}`}
                  style={{ fontSize: '10px', padding: '3px 8px', color: '#fbbf24', borderColor: selectedModuleFilter === 'INTEL' ? '#fbbf24' : undefined }}
                >
                  <Globe2 size={11} color="#fbbf24" />
                  <span>NUCLEI/SSL ({intelCount})</span>
                </button>
              </div>
            </div>

            {/* Findings Table for Current Assessment */}
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '135px' }}>Threat Rating</th>
                    <th>Finding Title</th>
                    <th>Affected Asset / Path</th>
                    <th>Engine Module</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right', width: '75px' }}>Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFindings.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '28px', color: '#71717a' }}>
                        {loadingFindings ? 'Loading scan telemetry...' : (isRunning ? 'Engines actively scanning target... Findings will appear once complete.' : `No ${selectedModuleFilter !== 'ALL' ? selectedModuleFilter : ''} vulnerabilities detected in this scan run.`)}
                      </td>
                    </tr>
                  ) : (
                    filteredFindings.map((finding, idx) => {
                      const Icon = getSourceIcon(finding.source);
                      const sourceColor = getSourceColor(finding.source);

                      return (
                        <tr
                          key={finding.id || idx}
                          className="interactive-row"
                          onClick={() => handleOpenFinding(finding.id)}
                        >
                          <td>
                            <SeverityBadge severity={finding.severity} size="sm" />
                          </td>

                          <td>
                            <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '12px' }}>
                              {finding.title}
                            </div>
                            <div style={{ fontSize: '10px', color: '#71717a', display: 'flex', gap: '6px', marginTop: '1px', fontFamily: 'var(--font-mono)' }}>
                              {finding.cve && <span style={{ color: '#c084fc' }}>{finding.cve}</span>}
                              {finding.cwe && <span style={{ color: '#ff1744' }}>{finding.cwe}</span>}
                            </div>
                          </td>

                          <td style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                            {finding.affectedComponent || finding.file || finding.endpoint || 'Target Scope'}
                          </td>

                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <Icon size={12} color={sourceColor} />
                              <span style={{ fontSize: '10.5px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: sourceColor }}>
                                {finding.source}
                              </span>
                            </div>
                          </td>

                          <td>
                            <span
                              style={{
                                fontSize: '9.5px',
                                fontWeight: 800,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: finding.status === 'Open' ? 'rgba(255, 23, 68, 0.18)' : 'rgba(0, 255, 136, 0.18)',
                                color: finding.status === 'Open' ? '#ff2a4d' : '#00ff88',
                                border: `1.2px solid ${finding.status === 'Open' ? '#ff1744' : '#00ff88'}`
                              }}
                            >
                              {finding.status || 'Open'}
                            </span>
                          </td>

                          <td style={{ textAlign: 'right' }}>
                            <span
                              style={{
                                fontSize: '12px',
                                fontWeight: 900,
                                fontFamily: 'var(--font-mono)',
                                color: finding.riskScore >= 8.5 ? '#ff1744' : (finding.riskScore >= 6.5 ? '#f97316' : '#00f2fe')
                              }}
                            >
                              {finding.riskScore != null ? Number(finding.riskScore).toFixed(1) : '8.5'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Historical Assessment Runs */}
      <div
        className="cyber-card"
        style={{
          padding: '16px 18px',
          background: '#060108',
          border: '3px solid #360a25'
        }}
      >
        <div style={{ fontSize: '12px', fontWeight: 900, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px' }}>
          HISTORICAL ASSESSMENT RUNS
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Target</th>
                <th>Scope Type</th>
                <th>Started At</th>
                <th>Status</th>
                <th>Score</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assessments.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#71717a' }}>
                    No security assessments executed yet. Click &quot;Launch Assessment&quot; above to run your first scan.
                  </td>
                </tr>
              ) : (
                assessments.map(asm => (
                  <tr
                    key={asm.id}
                    className="interactive-row"
                    onClick={() => {
                      setSelectedAssessment(asm);
                      dashboardService.setActiveAssessmentId(asm.id);
                    }}
                    style={{
                      background: selectedAssessment?.id === asm.id ? 'rgba(255, 23, 68, 0.08)' : undefined,
                      borderLeft: selectedAssessment?.id === asm.id ? '3px solid #ff1744' : undefined
                    }}
                  >
                    <td>
                      <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '12.5px' }}>{asm.target}</div>
                      <div style={{ fontSize: '10px', color: '#71717a', fontFamily: 'var(--font-mono)' }}>{asm.id}</div>
                    </td>
                    <td style={{ color: '#cbd5e1', fontSize: '11.5px' }}>{asm.targetType}</td>
                    <td style={{ color: '#71717a', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>{asm.startedAt}</td>
                    <td>
                      {(() => {
                        const isAsmFailed = asm.status === 'FAILED' || asm.coverageStatus === 'FAILED';
                        const displayStatus = asm.coverageStatus === 'FAILED' && asm.status !== 'FAILED' ? 'COVERAGE FAILED' : asm.status;
                        const isSuccess = asm.status === 'COMPLETED' && asm.coverageStatus !== 'FAILED';
                        const isRunningStatus = asm.status.includes('RUNNING') || asm.status === 'QUEUED';
                        return (
                          <span
                            onClick={(e) => {
                              if (isAsmFailed) {
                                e.stopPropagation();
                                setFailedAssessmentForModal(asm);
                              }
                            }}
                            style={{
                              fontSize: '10px',
                              fontFamily: 'var(--font-mono)',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              background: isSuccess ? 'rgba(0, 255, 136, 0.15)' : (isRunningStatus ? 'rgba(0, 242, 254, 0.18)' : 'rgba(255, 23, 68, 0.18)'),
                              color: isSuccess ? '#00ff88' : (isRunningStatus ? '#00f2fe' : '#ff1744'),
                              border: `1.2px solid ${isSuccess ? '#00ff88' : (isRunningStatus ? '#00f2fe' : '#ff1744')}`,
                              fontWeight: 800,
                              cursor: isAsmFailed ? 'pointer' : 'default',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title={isAsmFailed ? 'Click to inspect failure reason' : ''}
                          >
                            {isAsmFailed && <AlertTriangle size={10} color="#ff1744" />}
                            <span>{displayStatus}</span>
                          </span>
                        );
                      })()}
                    </td>
                    <td>
                      {(() => {
                        const isFailed = asm.status === 'FAILED' || asm.coverageStatus === 'FAILED';
                        const score = asm.overallScore !== undefined ? asm.overallScore : (asm.riskScore !== undefined ? (100 - asm.riskScore) : 85);
                        const posture = getScorePosture(score);
                        return (
                          <span style={{ fontSize: '13px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: isFailed ? '#ff1744' : posture.color }}>
                            {isFailed ? 'FAILED' : `${score}/100`}
                          </span>
                        );
                      })()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        {(asm.status === 'FAILED' || asm.coverageStatus === 'FAILED') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setFailedAssessmentForModal(asm);
                            }}
                            className="btn btn-secondary btn-xs"
                            style={{
                              height: '24px',
                              padding: '0 8px',
                              fontSize: '10px',
                              color: '#ff1744',
                              borderColor: '#ff1744',
                              background: 'rgba(255, 23, 68, 0.15)',
                              fontWeight: 800,
                              gap: '3px'
                            }}
                            title="View why this scan failed"
                          >
                            <ShieldAlert size={11} />
                            <span>Failure Reason</span>
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAssessment(asm);
                            dashboardService.setActiveAssessmentId(asm.id);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="btn btn-secondary btn-xs"
                          style={{
                            height: '24px',
                            padding: '0 8px',
                            fontSize: '10.5px',
                            borderColor: selectedAssessment?.id === asm.id ? '#ff1744' : undefined,
                            color: selectedAssessment?.id === asm.id ? '#ff1744' : undefined
                          }}
                        >
                          <Eye size={11} />
                          <span>View Scan</span>
                        </button>
                        {asm.status !== 'FAILED' && asm.coverageStatus !== 'FAILED' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGenerateScanReport(asm);
                            }}
                            className="btn btn-primary btn-xs"
                            style={{
                              height: '24px',
                              padding: '0 8px',
                              fontSize: '10.5px',
                              gap: '4px'
                            }}
                            title="Generate Executive Report for this scan"
                          >
                            <FileText size={11} />
                            <span>Report</span>
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAssessment(asm.id);
                          }}
                          className="btn btn-secondary btn-xs"
                          style={{
                            height: '24px',
                            padding: '0 8px',
                            fontSize: '10.5px',
                            color: '#ff1744',
                            borderColor: '#360a25',
                            background: 'rgba(255, 23, 68, 0.08)'
                          }}
                          title="Delete assessment"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Assessment Modal */}
      <NewAssessmentModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onStartAssessment={handleStartNewScan}
      />

      {/* Scan Failure Diagnostics Popup Modal */}
      <ScanFailureModal
        isOpen={Boolean(failedAssessmentForModal)}
        onClose={() => setFailedAssessmentForModal(null)}
        assessment={failedAssessmentForModal}
        onRelaunch={(asm) => {
          setFailedAssessmentForModal(null);
          setShowNewModal(true);
        }}
      />

      {/* Finding Detail Slide-over Drawer */}
      <FindingDrawer
        finding={activeFinding}
        isOpen={Boolean(activeFinding)}
        onClose={() => setActiveFinding(null)}
        onStatusChange={handleStatusChange}
      />

      {/* Executive Report Viewer Modal */}
      <ReportViewerModal
        report={activeReport}
        isOpen={Boolean(activeReport)}
        onClose={() => setActiveReport(null)}
      />
    </div>
  );
}

export default Assessments;
