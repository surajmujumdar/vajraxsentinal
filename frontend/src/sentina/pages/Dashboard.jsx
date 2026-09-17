'use client'
import React, { useState, useEffect } from 'react';
import {
  Menu,
  Search,
  Sparkles,
  Plus,
  FileText,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { mockDashboardSummary } from '../api/mockData';
import { HeroCockpit } from '../components/dashboard/HeroCockpit';
import { DASTCoverageCard } from '../components/dashboard/DASTCoverageCard';
import { VulnerabilitiesBySeverity } from '../components/dashboard/VulnerabilitiesBySeverity';
import { AICorrelationPanel } from '../components/dashboard/AICorrelationPanel';
import { AssetOverviewSection } from '../components/dashboard/AssetOverviewSection';
import { FindingTable } from '../components/findings/FindingTable';
import { FindingDrawer } from '../components/FindingDrawer';
import { ReportViewerModal } from '../components/ReportViewerModal';
import { ScanFailureModal } from '../components/ScanFailureModal';

export function Dashboard({
  onNewAssessment,
  onNavigateTab,
  onSelectFindingId
}) {
  const [summary, setSummary] = useState(mockDashboardSummary);
  const [findings, setFindings] = useState(() => dashboardService.getInitialFindings());
  const [correlatedRisks, setCorrelatedRisks] = useState(() => dashboardService.correlatedRisks);
  const [latestFailedAssessment, setLatestFailedAssessment] = useState(null);
  const [failedAssessmentForModal, setFailedAssessmentForModal] = useState(null);
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [activeFinding, setActiveFinding] = useState(null);
  const [activeReport, setActiveReport] = useState(null);
  const [headerSearch, setHeaderSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [sum, fnds, corr, asms] = await Promise.all([
          dashboardService.getDashboardSummary(),
          dashboardService.getFindings(),
          dashboardService.getCorrelatedRisks(),
          dashboardService.getAssessments()
        ]);
        if (isMounted) {
          setSummary(sum);
          setFindings(fnds || []);
          setCorrelatedRisks(corr || []);
          const failed = (asms || []).find(a => a.status === 'FAILED');
          setLatestFailedAssessment(failed || null);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    // Subscribe to immediate event notifications
    const unsubscribe = dashboardService.subscribe(loadData);

    // Periodic live-poll every 15s for real-time background scans
    const pollInterval = setInterval(loadData, 15000);

    return () => {
      isMounted = false;
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, []);

  const handleOpenFinding = async (id) => {
    const item = await dashboardService.getFindingById(id);
    if (item) {
      setActiveFinding(item);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    await dashboardService.updateFindingStatus(id, newStatus);
    const updated = await dashboardService.getFindings();
    setFindings(updated);
  };

  const handleGenerateLiveReport = () => {
    const crit = findings.filter(f => f.severity === 'CRITICAL').length;
    const high = findings.filter(f => f.severity === 'HIGH').length;
    const med = findings.filter(f => f.severity === 'MEDIUM').length;

    const report = {
      id: `rep-${Date.now().toString().slice(-4)}`,
      assessmentId: 'SOC-AUDIT-CURRENT',
      assessmentName: 'Comprehensive Fleet Security Audit Report',
      project: 'Full Monitored Scope',
      leadAuditor: 'Sentina Autonomous SOC Engine',
      date: new Date().toLocaleDateString(),
      riskScore: summary?.securityScore?.score || 87,
      status: 'Generated & Signed',
      counts: { critical: crit, high: high, medium: med },
      executiveSummary: `Live multi-vector cybersecurity audit completed. Verified posture across Static AST analysis, Dynamic blackbox fuzzing, Software Composition Analysis, and Secret entropy scanning. Current posture score: ${summary?.securityScore?.score || 87}/100.`,
      keyFindings: findings.slice(0, 5),
      methodology: 'Autonomous real-time vulnerability aggregation, CVSS risk prioritization, tainted data flow tracing, and AI attack-chain correlation.'
    };

    setActiveReport(report);
  };

  if (loading || !summary) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="scanning-pulse" style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ff1744', margin: '0 auto 16px' }} />
          <div style={{ color: '#ff2a4d', fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
            INITIALIZING SENTINA SOC TELEMETRY...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '1600px' }}>
      {/* 1. Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        {/* Left: Official Sentina Logo Badge + Title + Subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '2px solid #ff1744',
              boxShadow: '0 0 16px rgba(255, 23, 68, 0.55)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#040005',
              flexShrink: 0
            }}
          >
            <img
              src="/sentina-logo.png"
              alt="Sentina Logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>

          <div>
            <h1
              style={{
                fontSize: '20px',
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '0.8px',
                lineHeight: 1.1
              }}
            >
              COMMAND DASHBOARD
            </h1>
            <p style={{ fontSize: '11px', color: '#a1a1aa', marginTop: '2px' }}>
              <strong style={{ color: '#ff1744', letterSpacing: '0.5px' }}>SENTINA</strong> • SECURE. ANALYZE. PREDICT.
            </p>
          </div>
        </div>

        {/* Right: Quick Search + Generate Report Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '16px',
              background: '#060108',
              border: '2px solid #360a25',
              width: '200px'
            }}
          >
            <Search size={12} color="#71717a" />
            <input
              type="text"
              placeholder="Search anything..."
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#f8fafc',
                fontSize: '11.5px',
                width: '100%',
                fontFamily: 'var(--font-main)'
              }}
            />
          </div>

          {/* Direct Generate Report Option */}
          <button
            onClick={handleGenerateLiveReport}
            className="btn btn-primary btn-sm"
            style={{ height: '30px', padding: '0 12px', fontSize: '11px', gap: '6px' }}
          >
            <FileText size={13} />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Failure Alert Banner if any recent scan failed */}
      {latestFailedAssessment && (
        <div
          style={{
            marginBottom: '16px',
            padding: '12px 18px',
            borderRadius: '8px',
            background: 'linear-gradient(90deg, rgba(255, 23, 68, 0.22) 0%, rgba(10, 1, 14, 0.95) 100%)',
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
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(255, 23, 68, 0.2)', border: '1.2px solid #ff1744', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={17} color="#ff1744" />
            </div>
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.6px' }}>
                RECENT SCAN FAILURE: {latestFailedAssessment.failureReason?.title || latestFailedAssessment.errorMessage || 'Target Exception'}
              </div>
              <div style={{ fontSize: '11px', color: '#fca5a5', marginTop: '1px' }}>
                Target: {latestFailedAssessment.target || 'Assessment Scope'} • Error: {latestFailedAssessment.errorMessage || 'Failed to complete all scan modules'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setFailedAssessmentForModal(latestFailedAssessment)}
              className="btn btn-primary btn-sm"
              style={{
                background: '#ff1744',
                borderColor: '#ff1744',
                fontSize: '11px',
                height: '28px',
                padding: '0 12px',
                gap: '5px'
              }}
            >
              <ShieldAlert size={12} />
              <span>View Failure Reason</span>
            </button>
            <button
              onClick={() => onNavigateTab && onNavigateTab('assessments')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px', height: '28px' }}
            >
              <span>Assessments Telemetry</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Hero Cockpit Panel (4 Metrics + 3D Holographic Particle Sphere + 6 Engines) */}
      <HeroCockpit
        summary={summary}
        onNavigateTab={(tab) => onNavigateTab && onNavigateTab(tab)}
      />

      {/* 3. DAST Target Connectivity & Coverage Telemetry Card */}
      <DASTCoverageCard
        dastCoverage={summary.dastCoverage}
        onNavigateToAssessments={() => onNavigateTab && onNavigateTab('assessments')}
      />

      {/* 4. Vulnerabilities By Severity Panel */}
      <VulnerabilitiesBySeverity
        breakdown={summary.severityBreakdown}
        activeSeverity={selectedSeverity}
        onSelectSeverity={(sev) => setSelectedSeverity(sev)}
      />

      {/* 4. AI Risk Correlation Highlight Panel */}
      <AICorrelationPanel
        correlatedRisks={correlatedRisks}
        onSelectFinding={handleOpenFinding}
        onViewFullCorrelation={() => onNavigateTab && onNavigateTab('ai_correlation')}
      />

      {/* 5. Asset Security Overview Section */}
      <AssetOverviewSection
        onNavigateToAssets={() => onNavigateTab && onNavigateTab('assets')}
        onSelectAsset={(assetId) => onNavigateTab && onNavigateTab('assets')}
      />

      {/* 6. Top 10 Security Findings Interactive Table */}
      <FindingTable
        findings={findings}
        limit={10}
        selectedSeverity={selectedSeverity}
        onSelectSeverity={setSelectedSeverity}
        onSelectFinding={handleOpenFinding}
        onViewAllFindings={() => onNavigateTab && onNavigateTab('findings')}
      />

      {/* Finding Detail Slide-over Drawer */}
      <FindingDrawer
        finding={activeFinding}
        isOpen={Boolean(activeFinding)}
        onClose={() => setActiveFinding(null)}
        onStatusChange={handleStatusChange}
      />

      {/* Scan Failure Diagnostics Popup Modal */}
      <ScanFailureModal
        isOpen={Boolean(failedAssessmentForModal)}
        onClose={() => setFailedAssessmentForModal(null)}
        assessment={failedAssessmentForModal}
        onRelaunch={(asm) => {
          setFailedAssessmentForModal(null);
          if (onNewAssessment) onNewAssessment();
        }}
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

export default Dashboard;
