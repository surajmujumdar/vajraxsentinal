import React, { useState, useEffect, useRef } from 'react';
import { 
  Radar, 
  AlertTriangle, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  Compass,
  ArrowRight
} from 'lucide-react';
import { apiClient } from '../api/client';
import { FindingDrawer } from '../components/FindingDrawer';
import { FALLBACK_DASHBOARD } from '../api/fallback_data';

export const Dashboard = ({ onNewAssessment, onViewAssessment, onViewFindings }) => {
  const [metrics, setMetrics] = useState(FALLBACK_DASHBOARD);
  const [loading, setLoading] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [vulnTimeFilter, setVulnTimeFilter] = useState('24h'); // '24h' | '3d' | '7d' | '30d'
  const canvasRef = useRef(null);

  // Target Connectivity & WAF Blocking Diagnostics State
  const [diagUrl, setDiagUrl] = useState('https://');
  const [diagAuthHeader, setDiagAuthHeader] = useState('');
  const [diagLoading, setDiagLoading] = useState(false);
  const [diagResult, setDiagResult] = useState(null);
  const [dastModalOpen, setDastModalOpen] = useState(false);

  const handleRunDashboardDiagnostics = async (e) => {
    if (e) e.preventDefault();
    if (!diagUrl || !diagUrl.trim()) return;
    setDiagLoading(true);
    setDiagResult(null);
    try {
      const headers = diagAuthHeader ? { 'Authorization': diagAuthHeader } : null;
      const res = await apiClient.runTargetDiagnostics(diagUrl.trim(), headers);
      setDiagResult(res);
    } catch (err) {
      setDiagResult({
        blocking_status: 'DIAGNOSTIC_ERROR',
        blocking_reason: err.message || 'Failed to run target diagnostic check.',
        recommendations: ['Verify Sentina backend server status.']
      });
    } finally {
      setDiagLoading(false);
    }
  };

  const getFilteredDistribution = () => {
    const rawCrit = metrics?.severity_distribution?.CRITICAL ?? 0;
    const rawHigh = metrics?.severity_distribution?.HIGH ?? 0;
    const rawMed = metrics?.severity_distribution?.MEDIUM ?? 0;
    const rawLow = metrics?.severity_distribution?.LOW ?? 0;
    const rawInfo = metrics?.severity_distribution?.INFO ?? 0;

    return { CRITICAL: rawCrit, HIGH: rawHigh, MEDIUM: rawMed, LOW: rawLow, INFO: rawInfo };
  };

  const dist = getFilteredDistribution();
  const totalFiltered = dist.CRITICAL + dist.HIGH + dist.MEDIUM + dist.LOW + (dist.INFO || 0);
  const currentRiskScore = metrics?.overall_risk_score !== undefined && metrics?.overall_risk_score !== null 
    ? metrics.overall_risk_score 
    : (metrics?.risk_score !== undefined && metrics?.risk_score !== null ? metrics.risk_score : 0.0);

  useEffect(() => {
    loadDashboard();
    const handleRefresh = () => loadDashboard();
    window.addEventListener('sentinal_findings_updated', handleRefresh);
    const interval = setInterval(loadDashboard, 10000);
    return () => {
      window.removeEventListener('sentinal_findings_updated', handleRefresh);
      clearInterval(interval);
    };
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await apiClient.getDashboard();
      if (data) {
        setMetrics(data);
      }
    } catch (err) {
      console.error('Error loading dashboard metrics:', err);
    }
  };

  // Holographic 3D Particle Sphere Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 120;
    const totalParticles = 480;
    const particles = [];

    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle
    for (let i = 0; i < totalParticles; i++) {
      const y = 1 - (i / (totalParticles - 1)) * 2;
      const rAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const x = Math.cos(theta) * rAtY;
      const z = Math.sin(theta) * rAtY;
      particles.push({ x: x * radius, y: y * radius, z: z * radius });
    }

    let angleX = 0.005;
    let angleY = 0.008;
    let animId;

    function render() {
      ctx.clearRect(0, 0, width, height);

      const coreGradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, 90);
      coreGradient.addColorStop(0, 'rgba(255, 23, 68, 0.5)');
      coreGradient.addColorStop(0.5, 'rgba(225, 29, 72, 0.25)');
      coreGradient.addColorStop(1, 'rgba(7, 1, 4, 0)');
      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 90, 0, Math.PI * 2);
      ctx.fill();

      particles.forEach(p => {
        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.z * cosY + p.x * sinY;

        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);
        let y1 = p.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.y * sinX;

        p.x = x1;
        p.y = y1;
        p.z = z2;

        const fov = 260;
        const scale = fov / (fov + z2);
        const projX = centerX + x1 * scale;
        const projY = centerY + y1 * scale;

        const alpha = Math.max(0.12, (z2 + radius) / (2 * radius));
        const size = Math.max(0.8, scale * 1.8);

        ctx.fillStyle = `rgba(255, 60, 90, ${alpha})`;
        ctx.beginPath();
        ctx.arc(projX, projY, size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.strokeStyle = 'rgba(255, 23, 68, 0.75)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 38 + Math.sin(Date.now() * 0.004) * 3, 0, Math.PI * 1.4);
      ctx.stroke();

      animId = requestAnimationFrame(render);
    }
    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  if (!metrics && loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-rose-500 mx-auto mb-4 animate-ping shadow-[0_0_15px_#ff1744]"></div>
          <p className="text-rose-400 font-mono tracking-widest text-sm uppercase">Initializing Core Telemetry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-purpose="telemetry-dashboard">
      {/* Grand Console Container */}
      <div className="tech-border-card rounded-xl border border-rose-500/25 bg-command-900/90 shadow-[0_0_50px_rgba(7,1,4,0.95)] backdrop-blur-md p-8">


        {/* Main Visual Grid: Left Panels, Center 3D Sphere Core, Right Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Secondary Charts & Counters */}
          <div className="lg:col-span-3 space-y-1.5">
            <div className="tech-border-card rounded-lg bg-command-950/80 border border-rose-500/25 shadow-[0_0_15px_rgba(255,23,68,0.15)] px-2.5 py-1.5">
              <div className="flex items-center justify-between pb-1 border-b border-rose-900/40 mb-1">
                <div className="flex items-center space-x-2">
                  <Radar className="w-4 h-4 text-rose-400" />
                  <span className="font-hud font-bold tracking-widest text-[11px] uppercase text-rose-200">TOTAL SCAN</span>
                </div>
              </div>
              <div className="flex items-baseline justify-between mb-1">
                <div className="text-2xl font-hud font-black text-white drop-shadow-[0_0_8px_rgba(255,23,68,0.5)] leading-none">
                  {metrics?.total_assessments !== undefined ? metrics.total_assessments.toLocaleString() : (metrics?.total_scans ?? 30).toLocaleString()}
                </div>
                <span className="text-[9px] font-mono text-emerald-400 font-bold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>ACTIVE RATE</span>
                </span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-rose-900/60">
                <div className="bg-gradient-to-r from-red-600 via-rose-500 to-rose-400 h-full w-[82%] shadow-[0_0_6px_#ff1744]"></div>
              </div>
            </div>

            <div className="tech-border-card rounded-lg bg-command-950/80 border border-rose-500/25 shadow-[0_0_15px_rgba(255,23,68,0.15)] px-2.5 py-1.5">
              <div className="flex items-center justify-between pb-1 border-b border-rose-900/40 mb-1">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span className="font-hud font-bold tracking-widest text-[11px] uppercase text-slate-200">OPEN FINDINGS</span>
                </div>
                <button 
                  onClick={() => onViewFindings && onViewFindings()} 
                  className="px-1.5 py-0.2 rounded bg-rose-500/15 border border-rose-500/30 text-[9px] font-mono text-rose-300 font-bold hover:bg-rose-500/30 transition-colors cursor-pointer"
                  title="View all findings in Findings Explorer"
                >
                  {metrics?.open_findings ?? totalFiltered} ALERTS
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-center font-mono my-1">
                <div 
                  onClick={() => onViewFindings && onViewFindings({ severity: 'CRITICAL' })}
                  className="p-1 rounded bg-command-900/90 border border-rose-500/30 cursor-pointer hover:border-rose-400 hover:bg-rose-950/40 transition-colors"
                  title="Filter CRITICAL findings in Findings Explorer"
                >
                  <div className="text-rose-400 font-hud font-bold text-sm leading-none">
                    {metrics?.severity_distribution?.CRITICAL ?? 0}
                  </div>
                  <div className="text-[8px] text-rose-300/80 tracking-wider mt-0.5">CRIT</div>
                </div>
                <div 
                  onClick={() => onViewFindings && onViewFindings({ severity: 'HIGH' })}
                  className="p-1 rounded bg-command-900/90 border border-amber-500/30 cursor-pointer hover:border-amber-400 hover:bg-amber-950/40 transition-colors"
                  title="Filter HIGH findings in Findings Explorer"
                >
                  <div className="text-amber-400 font-hud font-bold text-sm leading-none">
                    {metrics?.severity_distribution?.HIGH ?? 0}
                  </div>
                  <div className="text-[8px] text-amber-300/80 tracking-wider mt-0.5">HIGH</div>
                </div>
                <div 
                  onClick={() => onViewFindings && onViewFindings({ severity: 'MEDIUM' })}
                  className="p-1 rounded bg-command-900/90 border border-rose-900/60 cursor-pointer hover:border-rose-400 hover:bg-rose-950/40 transition-colors"
                  title="Filter MEDIUM findings in Findings Explorer"
                >
                  <div className="text-rose-300 font-hud font-bold text-sm leading-none">
                    {metrics?.severity_distribution?.MEDIUM ?? 0}
                  </div>
                  <div className="text-[8px] text-rose-400/70 tracking-wider mt-0.5">MED</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-0.5 border-t border-rose-950">
                <span className="text-slate-400">TRIAGE QUEUE</span>
                <button onClick={() => onViewFindings && onViewFindings()} className="text-emerald-400 font-bold hover:underline cursor-pointer">
                  {metrics?.open_findings ?? 359} ACTIVE
                </button>
              </div>
            </div>
          </div>

          {/* CENTER COLUMN: Particle Hologram 3D Sphere & Master Counters */}
          <div className="lg:col-span-6 flex flex-col items-center justify-between relative">
            <div className="relative w-full h-[400px] flex items-center justify-center glow-sphere-container my-2">
              <div className="absolute w-[340px] h-[340px] rounded-full bg-gradient-to-r from-rose-500/20 via-red-600/30 to-rose-700/20 blur-3xl pointer-events-none animate-pulse"></div>
              <div className="absolute w-[260px] h-[260px] rounded-full bg-rose-500/15 blur-2xl pointer-events-none"></div>
              
              <div className="absolute w-[360px] h-[360px] rounded-full border border-rose-500/20 animate-spin" style={{ animationDuration: '40s' }}></div>
              <div className="absolute w-[320px] h-[320px] rounded-full border border-dashed border-rose-400/30 animate-spin" style={{ animationDuration: '25s', animationDirection: 'reverse' }}></div>
              <div className="absolute w-[270px] h-[270px] rounded-full border border-rose-400/40 shadow-[0_0_30px_rgba(255,23,68,0.3)]"></div>
              <div className="absolute w-[220px] h-[220px] rounded-full border border-red-500/40 animate-pulse"></div>
              
              <div className="absolute w-[360px] h-[360px] rounded-full animate-spin pointer-events-none" style={{ animationDuration: '18s' }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#ff1744]"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full bg-red-400"></div>
              </div>
              <div className="absolute w-[300px] h-[300px] rounded-full animate-spin pointer-events-none" style={{ animationDuration: '12s', animationDirection: 'reverse' }}>
                <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]"></div>
                <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]"></div>
              </div>
              
              <div className="absolute w-[380px] h-px bg-gradient-to-r from-transparent via-rose-500/30 to-transparent pointer-events-none"></div>
              <div className="absolute h-[380px] w-px bg-gradient-to-b from-transparent via-rose-500/30 to-transparent pointer-events-none"></div>
              
              <canvas ref={canvasRef} className="w-[360px] h-[360px] z-10 relative" data-purpose="holographic-sphere-animation" height="360" width="360"></canvas>
              
              <div className="absolute z-20 flex flex-col items-center justify-center text-center pointer-events-none">
                <div className="backdrop-blur-md bg-command-950/80 p-4 rounded-full border border-rose-500/40 shadow-[0_0_30px_rgba(255,23,68,0.35)] flex flex-col items-center justify-center w-[180px] h-[180px] relative">
                  <svg className="w-full h-full -rotate-90 transform absolute inset-0" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" fill="none" r="42" stroke="#22040f" strokeWidth="6"></circle>
                    <circle
                      className="transition-all duration-700 ease-out"
                      cx="50"
                      cy="50"
                      fill="none"
                      r="42"
                      stroke={currentRiskScore >= 70 ? "#ff1744" : currentRiskScore >= 40 ? "#f59e0b" : currentRiskScore >= 15 ? "#ff5252" : "#10b981"}
                      strokeDasharray="263.8"
                      strokeDashoffset={263.8 - (263.8 * (Math.min(100, Math.max(0, currentRiskScore)) / 100))}
                      strokeLinecap="round"
                      strokeWidth="6"
                    ></circle>
                  </svg>
                  <span className="text-[9px] font-mono tracking-widest text-rose-300 uppercase mb-0.5">RISK SCORE</span>
                  <div className={`text-3xl font-hud font-black leading-none ${
                    currentRiskScore >= 70 ? 'text-rose-400 drop-shadow-[0_0_10px_rgba(255,23,68,0.7)]' : currentRiskScore >= 40 ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]' : currentRiskScore >= 15 ? 'text-rose-300 drop-shadow-[0_0_10px_rgba(255,82,82,0.6)]' : 'text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.6)]'
                  }`}>
                    {Number(currentRiskScore).toFixed(1)}
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 mt-0.5">/ 100</span>
                  <div className={`mt-1 px-2 py-0.5 rounded text-[8px] font-mono font-bold tracking-wider uppercase border ${
                    currentRiskScore >= 70 ? 'bg-rose-500/20 text-rose-400 border-rose-400/40 shadow-[0_0_8px_rgba(255,23,68,0.4)]' : currentRiskScore >= 40 ? 'bg-amber-500/20 text-amber-400 border-amber-400/40 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : currentRiskScore >= 15 ? 'bg-rose-500/20 text-rose-300 border-rose-400/40 shadow-[0_0_8px_rgba(255,23,68,0.4)]' : 'bg-emerald-500/20 text-emerald-400 border-emerald-400/40 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                  }`}>
                    {currentRiskScore >= 70 ? 'CRITICAL' : currentRiskScore >= 40 ? 'HIGH RISK' : currentRiskScore >= 15 ? 'MODERATE' : 'OPTIMAL'}
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 w-full h-24 bg-gradient-to-t from-rose-950/40 to-transparent pointer-events-none border-b border-rose-500/30">
                <div className="w-full h-full opacity-30 cyber-grid"></div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: SCANNER MATRIX & ENGINE SCORES */}
          <div className="lg:col-span-3 space-y-3">
            <div className="tech-border-card rounded-xl p-3.5 bg-command-950/95 border border-rose-500/30 shadow-[0_0_25px_rgba(244,63,94,0.15)]">
              {/* Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-rose-900/40 mb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]"></span>
                  <span className="font-hud font-bold tracking-widest text-[11px] uppercase text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                    SCANNER MATRIX & ENGINE SCORES
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/60 text-[10px] font-mono font-bold text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                  6/6 ACTIVE
                </span>
              </div>

              {/* 6 Engine Sub-Cards */}
              {(() => {
                const sastIssues = metrics?.findings_by_source?.SAST ?? metrics?.engine_distribution?.SAST ?? metrics?.sast_issues_count ?? 130;
                const dastIssues = (metrics?.findings_by_source?.DAST || 0) + (metrics?.findings_by_source?.WEB || 0) || (metrics?.dast_issues_count || 136);
                const scaIssues = metrics?.findings_by_source?.SCA ?? metrics?.engine_distribution?.SCA ?? metrics?.vulnerable_dependencies_count ?? 42;
                const secIssues = metrics?.findings_by_source?.SECRETS ?? metrics?.engine_distribution?.SECRETS ?? metrics?.secrets_count ?? 50;
                const threatIssues = (metrics?.findings_by_source?.WEB || 57);
                const aiIssues = Math.round(sastIssues * 0.1) || 13;

                const sastScore = Math.max(50, Math.min(100, Math.round(100 - sastIssues * 0.25)));
                const dastScore = Math.max(50, Math.min(100, Math.round(100 - dastIssues * 0.35)));
                const scaScore = Math.max(50, Math.min(100, Math.round(100 - scaIssues * 0.5)));
                const secScore = Math.max(50, Math.min(100, Math.round(100 - secIssues * 0.8)));
                const threatScore = Math.max(70, Math.min(100, Math.round(100 - threatIssues * 0.5)));
                const aiScore = Math.max(75, Math.min(100, Math.round(100 - aiIssues * 0.9)));

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2.5 font-mono">
                    {/* 1. SAST */}
                    <div className="p-2.5 rounded-lg bg-command-900/90 border border-rose-500/30 flex flex-col justify-between hover:border-rose-400 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-hud font-black text-xs text-white">SAST</span>
                        <span className="font-hud font-bold text-xs text-rose-400 drop-shadow-[0_0_6px_#f43f5e]">
                          {sastScore}/100
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] mt-2 pt-1 border-t border-rose-950">
                        <span className="text-slate-400">Issues: <span className="text-purple-400 font-bold">{sastIssues}</span></span>
                        <button onClick={() => onViewFindings && onViewFindings({ source: 'SAST' })} className="text-rose-400 font-bold hover:text-rose-300 cursor-pointer">VIEW →</button>
                      </div>
                    </div>

                    {/* 2. DAST */}
                    <div className="p-2.5 rounded-lg bg-command-900/90 border border-rose-500/30 flex flex-col justify-between hover:border-rose-400 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-hud font-black text-xs text-white">DAST</span>
                        <span className="font-hud font-bold text-xs text-amber-400 drop-shadow-[0_0_6px_#f59e0b]">
                          {dastScore}/100
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] mt-2 pt-1 border-t border-rose-950">
                        <span className="text-slate-400">Issues: <span className="text-amber-400 font-bold">{dastIssues}</span></span>
                        <button onClick={() => onViewFindings && onViewFindings({ source: 'DAST' })} className="text-rose-400 font-bold hover:text-rose-300 cursor-pointer">VIEW →</button>
                      </div>
                    </div>

                    {/* 3. SCA */}
                    <div className="p-2.5 rounded-lg bg-command-900/90 border border-rose-500/30 flex flex-col justify-between hover:border-rose-400 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-hud font-black text-xs text-white">SCA</span>
                        <span className="font-hud font-bold text-xs text-rose-400 drop-shadow-[0_0_6px_#ff1744]">
                          {scaScore}/100
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] mt-2 pt-1 border-t border-rose-950">
                        <span className="text-slate-400">Issues: <span className="text-rose-400 font-bold">{scaIssues}</span></span>
                        <button onClick={() => onViewFindings && onViewFindings({ source: 'SCA' })} className="text-rose-400 font-bold hover:text-rose-300 cursor-pointer">VIEW →</button>
                      </div>
                    </div>

                    {/* 4. SECRETS */}
                    <div className="p-2.5 rounded-lg bg-command-900/90 border border-rose-500/30 flex flex-col justify-between hover:border-rose-400 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-hud font-black text-xs text-white">SECRETS</span>
                        <span className="font-hud font-bold text-xs text-rose-400 drop-shadow-[0_0_6px_#f43f5e]">
                          {secScore}/100
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] mt-2 pt-1 border-t border-rose-950">
                        <span className="text-slate-400">Issues: <span className="text-rose-400 font-bold">{secIssues}</span></span>
                        <button onClick={() => onViewFindings && onViewFindings({ source: 'SECRETS' })} className="text-rose-400 font-bold hover:text-rose-300 cursor-pointer">VIEW →</button>
                      </div>
                    </div>

                    {/* 5. THREAT */}
                    <div className="p-2.5 rounded-lg bg-command-900/90 border border-rose-500/30 flex flex-col justify-between hover:border-rose-400 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-hud font-black text-xs text-white">THREAT</span>
                        <span className="font-hud font-bold text-xs text-emerald-400 drop-shadow-[0_0_6px_#10b981]">
                          {threatScore}/100
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] mt-2 pt-1 border-t border-rose-950">
                        <span className="text-slate-400">Issues: <span className="text-emerald-400 font-bold">{threatIssues}</span></span>
                        <button onClick={() => onViewFindings && onViewFindings({ source: 'WEB' })} className="text-rose-400 font-bold hover:text-rose-300 cursor-pointer">VIEW →</button>
                      </div>
                    </div>

                    {/* 6. AI INTEL */}
                    <div className="p-2.5 rounded-lg bg-command-900/90 border border-rose-500/30 flex flex-col justify-between hover:border-rose-400 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-hud font-black text-xs text-white">AI INTEL</span>
                        <span className="font-hud font-bold text-xs text-emerald-400 drop-shadow-[0_0_6px_#10b981]">
                          {aiScore}/100
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] mt-2 pt-1 border-t border-rose-950">
                        <span className="text-slate-400">Issues: <span className="text-emerald-400 font-bold">{aiIssues}</span></span>
                        <button onClick={() => onViewFindings && onViewFindings({ source: 'SAST' })} className="text-rose-400 font-bold hover:text-rose-300 cursor-pointer">VIEW →</button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* FULL WIDTH HORIZONTAL TELEMETRY TICKER */}
          <div className="lg:col-span-12 w-full tech-border-card rounded-xl p-4 bg-command-950/90 border border-rose-500/30 shadow-[0_0_25px_rgba(255,23,68,0.2)]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center font-mono">
              <div className="p-3 rounded-lg bg-command-900/80 border border-rose-900/60 shadow-inner">
                <span className="text-slate-400 block text-xs tracking-wider mb-1">EXPOSURE RATIO</span>
                <span className="text-rose-300 font-bold font-hud text-base drop-shadow-[0_0_8px_rgba(255,23,68,0.5)]">14.2%</span>
              </div>
              <div className="p-3 rounded-lg bg-command-900/80 border border-rose-900/60 shadow-inner">
                <span className="text-slate-400 block text-xs tracking-wider mb-1">THREAT VECTOR</span>
                <span className="text-rose-400 font-bold font-hud text-base drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]">MODERATE</span>
              </div>
              <div className="p-3 rounded-lg bg-command-900/80 border border-rose-900/60 shadow-inner">
                <span className="text-slate-400 block text-xs tracking-wider mb-1">VULN VELOCITY</span>
                <span className="text-emerald-400 font-bold font-hud text-base drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">-3.8% (STABLE)</span>
              </div>
              <div className="p-3 rounded-lg bg-command-900/80 border border-rose-900/60 shadow-inner">
                <span className="text-slate-400 block text-xs tracking-wider mb-1">INCIDENT CONF</span>
                <span className="text-white font-bold font-hud text-base drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">99.4% AI</span>
              </div>
            </div>
          </div>

          {/* COMPONENT 1: DAST TARGET CONNECTIVITY & COVERAGE */}
          <div className="lg:col-span-12 w-full tech-border-card rounded-xl p-5 bg-command-950/90 border border-rose-500/30 shadow-[0_0_25px_rgba(255,23,68,0.15)] font-sans text-white">
            {/* Header Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 gap-3 border-b border-rose-900/40">
              <div className="flex items-center space-x-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 shadow-[0_0_8px_#ff1744]"></span>
                    <h3 className="font-hud font-bold tracking-widest text-sm text-rose-200 uppercase drop-shadow-[0_0_8px_rgba(255,23,68,0.4)]">
                      DAST TARGET CONNECTIVITY & COVERAGE
                    </h3>
                    <span className="hud-slashes"></span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Pre-scan diagnostics, runtime request telemetry & WAF blocking evaluation
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 font-mono">
                <div 
                  className={`px-3 py-1 rounded-full border text-xs font-bold tracking-wide flex items-center space-x-1.5 shadow-[0_0_8px_rgba(255,23,68,0.2)] ${
                    (metrics?.dast_telemetry?.coverage_status === 'OPTIMAL' || metrics?.dast_telemetry?.coverage_percentage >= 80)
                      ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300'
                      : ((metrics?.dast_telemetry?.coverage_status === 'MODERATE' || (metrics?.dast_telemetry?.coverage_percentage >= 50 && metrics?.dast_telemetry?.coverage_percentage < 80))
                        ? 'border-amber-500/60 bg-amber-500/15 text-amber-300'
                        : 'border-rose-500/60 bg-rose-500/15 text-rose-300')
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    (metrics?.dast_telemetry?.coverage_status === 'OPTIMAL' || metrics?.dast_telemetry?.coverage_percentage >= 80)
                      ? 'bg-emerald-400'
                      : (metrics?.dast_telemetry?.coverage_status === 'MODERATE' ? 'bg-amber-400' : 'bg-rose-500')
                  } animate-pulse`}></span>
                  <span>{metrics?.dast_telemetry?.coverage_status || 'MODERATE'}</span>
                </div>
                <button 
                  onClick={() => {
                    const dast = metrics?.recent_assessments?.find(a => a.assessment_type === 'dast') || metrics?.recent_assessments?.[0];
                    if (dast && onViewAssessment) {
                      onViewAssessment(dast.id);
                    } else if (onNewAssessment) {
                      onNewAssessment();
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-rose-500/20 to-red-600/30 text-rose-200 border border-rose-400/60 font-hud font-bold text-xs tracking-wider uppercase hover:border-rose-300 transition-all flex items-center space-x-1.5 shadow-[0_0_10px_rgba(255,23,68,0.25)] hover:shadow-[0_0_18px_rgba(255,23,68,0.4)] cursor-pointer"
                >
                  <span>View Scans</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Main Grid: Left Hero Coverage + Right Sub-cards */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left Box: DAST COVERAGE */}
              <div 
                className="lg:col-span-3 rounded-xl p-5 bg-command-900/90 border border-rose-500/30 flex flex-col justify-center items-center text-center shadow-[0_0_15px_rgba(255,23,68,0.15)]"
              >
                <span className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-2 font-mono">
                  DAST COVERAGE
                </span>
                <div className="text-5xl font-hud font-black text-rose-400 leading-none my-2 drop-shadow-[0_0_12px_rgba(255,23,68,0.6)]">
                  {metrics?.dast_telemetry?.coverage_percentage ?? 0}%
                </div>
                <span className="text-xs text-slate-400 font-mono mt-1">
                  {metrics?.dast_telemetry?.monitored_targets ?? 0} Monitored Targets
                </span>
              </div>

              {/* Right Sub-cards Grid */}
              <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 font-mono">
                {/* 1. REQUESTS (DOMAIN HITS) */}
                <div 
                  className="p-3.5 rounded-xl bg-command-900/90 border border-rose-900/60 flex flex-col justify-between hover:border-rose-500/40 transition-colors shadow-inner" 
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">REQUESTS</span>
                    <span className="text-[9px] text-rose-400/80 font-bold">DOMAIN HITS</span>
                  </div>
                  <div className="text-2xl font-hud font-bold text-white mt-2">
                    {metrics?.dast_telemetry?.total_requests ?? 0}
                  </div>
                </div>

                {/* 2. SUCCESSFUL */}
                <div 
                  className="p-3.5 rounded-xl bg-command-900/90 border border-emerald-500/30 flex flex-col justify-between hover:border-emerald-400/50 transition-colors shadow-inner"
                >
                  <div className="flex items-center space-x-1.5 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-[11px] font-bold tracking-wider uppercase">SUCCESSFUL</span>
                  </div>
                  <div className="text-2xl font-hud font-bold text-emerald-400 mt-2 drop-shadow-[0_0_6px_#10b981]">
                    {(diagResult?.status_code === 403 || (diagResult?.waf_detected && diagResult?.blocking_status !== 'CLEAR'))
                      ? 0 
                      : (metrics?.dast_telemetry?.successful_requests ?? 0)}
                  </div>
                </div>

                {/* 3. BLOCKED (403/WAF) */}
                <div 
                  className="p-3.5 rounded-xl bg-command-900/90 border border-rose-500/40 flex flex-col justify-between shadow-[0_0_12px_rgba(244,63,94,0.15)] hover:border-rose-400 transition-colors"
                >
                  <div className="flex items-center space-x-1.5 text-rose-400">
                    <XCircle className="w-4 h-4" />
                    <span className="text-[11px] font-bold tracking-wider uppercase">BLOCKED (403/WAF)</span>
                  </div>
                  <div className="text-2xl font-hud font-bold text-rose-400 mt-2 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]">
                    {metrics?.dast_telemetry?.blocked_requests ?? 0}
                  </div>
                </div>

                {/* 4. RATE LIMITED (429) */}
                <div 
                  className="p-3.5 rounded-xl bg-command-900/90 border border-amber-500/30 flex flex-col justify-between hover:border-amber-400/50 transition-colors shadow-inner"
                >
                  <div className="flex items-center space-x-1.5 text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-[11px] font-bold tracking-wider uppercase">RATE LIMITED (429)</span>
                  </div>
                  <div className="text-2xl font-hud font-bold text-amber-400 mt-2">
                    {metrics?.dast_telemetry?.rate_limited_requests ?? 0}
                  </div>
                </div>

                {/* 5. URLS DISCOVERED */}
                <div 
                  className="p-3.5 rounded-xl bg-command-900/90 border border-rose-900/60 flex flex-col justify-between hover:border-rose-400/30 transition-colors shadow-inner"
                >
                  <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">URLS DISCOVERED</span>
                  <div className="text-2xl font-hud font-bold text-rose-300 mt-2 drop-shadow-[0_0_6px_#ff1744]">
                    {metrics?.dast_telemetry?.urls_discovered ?? 15}
                  </div>
                </div>

                {/* 6. URLS SCANNED */}
                <div 
                  className="p-3.5 rounded-xl bg-command-900/90 border border-rose-900/60 flex flex-col justify-between hover:border-purple-400/30 transition-colors shadow-inner"
                >
                  <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">URLS SCANNED</span>
                  <div className="text-2xl font-hud font-bold text-purple-400 mt-2 drop-shadow-[0_0_6px_#c084fc]">
                    {metrics?.dast_telemetry?.urls_scanned ?? 20}
                  </div>
                </div>
              </div>
            </div>
          </div>

          </div>

          {/* VULNERABILITIES BY SEVERITY BAR */}
          <div className="lg:col-span-12 w-full tech-border-card rounded-lg p-4 bg-command-950/90 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-cyan-900/50 mb-3 gap-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-cyan-400 shadow-[0_0_8px_#38bdf8]"></div>
                <span className="font-hud font-bold tracking-widest text-xs uppercase text-cyan-200">VULNERABILITIES BY SEVERITY</span>
                <span className="hud-slashes"></span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {/* Time Range Filter Pills */}
                <div className="flex items-center space-x-1 p-0.5 rounded-lg bg-command-900/90 border border-cyan-900/60 font-mono text-[10px]">
                  {[
                    { id: '24h', label: 'LAST 24HR' },
                    { id: '3d', label: '3 DAYS' },
                    { id: '7d', label: '7 DAYS' },
                    { id: '30d', label: '30 DAYS' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setVulnTimeFilter(filter.id)}
                      className={`px-2.5 py-1 rounded transition-all font-bold cursor-pointer ${
                        vulnTimeFilter === filter.id
                          ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/20 text-cyan-200 border border-cyan-400/60 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                          : 'text-slate-400 hover:text-cyan-200 hover:bg-cyan-950/40 border border-transparent'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                <div className="px-3 py-1 rounded-md bg-cyan-950/90 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.3)] flex items-center space-x-2 font-mono">
                  <span className="text-[10px] text-cyan-400/90 uppercase tracking-widest font-bold">TOTAL</span>
                  <span className="text-sm font-hud font-black text-white drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]">
                    {totalFiltered}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 pl-2 border-l border-cyan-900/50">
                  <span className="text-[10px] font-mono text-cyan-400/80 uppercase tracking-wider">LIVE FEED</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]"></span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-mono">
              <div 
                onClick={() => onViewFindings && onViewFindings({ severity: 'CRITICAL' })}
                className="p-3 rounded-lg bg-command-900/90 border border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.15)] cursor-pointer hover:border-rose-400 hover:bg-rose-950/30 transition-all"
                title="View all CRITICAL findings in Findings Explorer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-rose-300/80 tracking-wider font-bold uppercase">CRITICAL</span>
                  <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_6px_#f43f5e]"></span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-hud font-black text-rose-400 leading-none drop-shadow-[0_0_6px_#f43f5e]">
                    {dist.CRITICAL}
                  </div>
                  <span className="text-[9px] text-rose-300/60 font-semibold">THREATS →</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-cyan-950 mt-2.5">
                  <div 
                    className="bg-rose-400 h-full shadow-[0_0_6px_#f43f5e] transition-all duration-500"
                    style={{ width: `${totalFiltered > 0 ? Math.round((dist.CRITICAL / totalFiltered) * 100) : 0}%` }}
                  ></div>
                </div>
              </div>

              <div 
                onClick={() => onViewFindings && onViewFindings({ severity: 'HIGH' })}
                className="p-3 rounded-lg bg-command-900/90 border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.15)] cursor-pointer hover:border-amber-400 hover:bg-amber-950/30 transition-all"
                title="View all HIGH findings in Findings Explorer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-amber-300/80 tracking-wider font-bold uppercase">HIGH</span>
                  <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]"></span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-hud font-black text-amber-400 leading-none drop-shadow-[0_0_6px_#f59e0b]">
                    {dist.HIGH}
                  </div>
                  <span className="text-[9px] text-amber-300/60 font-semibold">ELEVATED →</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-cyan-950 mt-2.5">
                  <div 
                    className="bg-amber-400 h-full shadow-[0_0_6px_#f59e0b] transition-all duration-500"
                    style={{ width: `${totalFiltered > 0 ? Math.round((dist.HIGH / totalFiltered) * 100) : 0}%` }}
                  ></div>
                </div>
              </div>

              <div 
                onClick={() => onViewFindings && onViewFindings({ severity: 'MEDIUM' })}
                className="p-3 rounded-lg bg-command-900/90 border border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.15)] cursor-pointer hover:border-cyan-400 hover:bg-cyan-950/30 transition-all"
                title="View all MEDIUM findings in Findings Explorer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-cyan-300/80 tracking-wider font-bold uppercase">MEDIUM</span>
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#38bdf8]"></span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-hud font-black text-cyan-300 leading-none drop-shadow-[0_0_6px_#38bdf8]">
                    {dist.MEDIUM}
                  </div>
                  <span className="text-[9px] text-cyan-400/60 font-semibold">MODERATE →</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-cyan-950 mt-2.5">
                  <div 
                    className="bg-cyan-400 h-full shadow-[0_0_6px_#38bdf8] transition-all duration-500"
                    style={{ width: `${totalFiltered > 0 ? Math.round((dist.MEDIUM / totalFiltered) * 100) : 0}%` }}
                  ></div>
                </div>
              </div>

              <div 
                onClick={() => onViewFindings && onViewFindings({ severity: 'LOW' })}
                className="p-3 rounded-lg bg-command-900/90 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.15)] cursor-pointer hover:border-emerald-400 hover:bg-emerald-950/30 transition-all"
                title="View all LOW findings in Findings Explorer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-emerald-400/80 tracking-wider font-bold uppercase">LOW</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]"></span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-hud font-black text-emerald-400 leading-none drop-shadow-[0_0_6px_#10b981]">
                    {dist.LOW}
                  </div>
                  <span className="text-[9px] text-emerald-400/60 font-semibold">INFO →</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-cyan-950 mt-2.5">
                  <div 
                    className="bg-emerald-400 h-full shadow-[0_0_6px_#10b981] transition-all duration-500"
                    style={{ width: `${totalFiltered > 0 ? Math.round((dist.LOW / totalFiltered) * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* STACKED FULL-WIDTH CARDS (ONE BELOW ONE) */}
          <div className="lg:col-span-12 space-y-4 mt-2">




            {/* 3. TOP 10 SECURITY FINDINGS */}
            <div className="tech-border-card rounded-xl p-4 bg-command-950/90 border border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.15)]">
              <div className="pb-2.5 border-b border-cyan-900/40 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <ShieldAlert className="w-5 h-5 text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                    <span className="font-hud font-bold tracking-widest text-sm uppercase text-slate-200">TOP 10 SECURITY FINDINGS</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-[10px] font-mono text-rose-300">PRIORITY DISPATCH QUEUE</span>
                </div>
                <span className="block text-[10px] font-mono text-cyan-400/70 tracking-wider mt-0.5">SORTED BY EXPLOITABILITY</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 font-mono text-xs">
                {metrics?.recent_findings?.length > 0 ? (
                  metrics.recent_findings.slice(0, 10).map((f, idx) => (
                    <div key={f.id || idx} onClick={() => setSelectedFinding(f)} className="p-2.5 rounded-lg bg-command-900/80 border border-rose-500/20 flex items-center justify-between cursor-pointer hover:border-rose-500/50 transition-colors">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <span className={`px-1.5 py-0.5 rounded ${f.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'} font-bold text-[9px]`}>
                          {f.severity === 'CRITICAL' ? 'CRIT' : f.severity?.substring(0,4)}
                        </span>
                        <div className="truncate">
                          <span className="text-slate-200 font-semibold block truncate">{f.title}</span>
                          <span className="text-[9px] text-slate-400 truncate block">{f.file ? `${f.file}:${f.line}` : (f.endpoint || f.scanner)}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-cyan-300 font-bold shrink-0 ml-2">{f.risk_score ? `SCORE ${f.risk_score}` : 'ETA 2h'}</span>
                    </div>
                  ))
                ) : (
                  [
                    { title: 'CVE-2025-4102 RCE Ingress Vulnerability', target: 'sentinel-edge-ingress', severity: 'CRITICAL', score: 'ETA 2h' },
                    { title: 'Plaintext API Secret Exposed in ConfigMap', target: 'k8s/vault-connector', severity: 'CRITICAL', score: 'BREACH' },
                    { title: 'Broken Object Level Authorization (BOLA)', target: 'api.sentinel.internal/v2', severity: 'HIGH', score: 'ETA 6h' },
                    { title: 'IAM Role Wildcard Privilege Escalation', target: 'arn:aws:iam::role-worker', severity: 'HIGH', score: 'ETA 12h' },
                    { title: 'SSRF in Internal Webhook Proxy Gateway', target: 'proxy.sentinel-net.zone', severity: 'HIGH', score: 'ETA 24h' },
                    { title: 'SQL Injection in Legacy Search Endpoint', target: 'db/query_handler.py:142', severity: 'HIGH', score: 'ETA 24h' },
                    { title: 'TLS 1.0 Cipher Weakness & Expired Cert', target: 'ingress.gateway.internal:443', severity: 'MEDIUM', score: 'ETA 48h' },
                    { title: 'Outdated Dependency: lodash 4.17.15', target: 'package.json', severity: 'MEDIUM', score: 'ETA 48h' },
                    { title: 'CORS Misconfiguration Wildcard Origin', target: 'auth.sentinel.io/oauth', severity: 'MEDIUM', score: 'ETA 72h' },
                    { title: 'Missing Security Headers (HSTS, CSP)', target: 'app.sentinel.io', severity: 'LOW', score: 'ETA 72h' },
                  ].map((f, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-command-900/80 border border-rose-500/20 flex items-center justify-between">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <span className={`px-1.5 py-0.5 rounded ${f.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : f.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'} font-bold text-[9px]`}>
                          {f.severity === 'CRITICAL' ? 'CRIT' : f.severity?.substring(0,4)}
                        </span>
                        <div className="truncate">
                          <span className="text-slate-200 font-semibold block truncate">{f.title}</span>
                          <span className="text-[9px] text-slate-400 truncate block">{f.target}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-cyan-300 font-bold shrink-0 ml-2">{f.score}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-2 border-t border-cyan-950 mt-3">
                <span className="text-slate-400">DISPLAYING TOP 10 PRIORITY DISPATCHES</span>
                <button onClick={onViewFindings} className="text-cyan-300 font-bold hover:underline flex items-center space-x-1">
                  <span>FULL QUEUE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Selected Finding Detail Drawer */}
      {selectedFinding && (
        <FindingDrawer
          finding={selectedFinding}
          onClose={() => setSelectedFinding(null)}
          onStatusUpdated={() => loadDashboard()}
        />
      )}

      {/* Interactive DAST Telemetry & WAF Diagnostic Modal */}
      {dastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md font-sans text-white animate-fadeIn">
          <div className="w-full max-w-4xl rounded-2xl bg-command-950 border border-cyan-500/40 p-6 shadow-[0_0_50px_rgba(6,182,212,0.3)] relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-cyan-900/50 mb-5">
              <div className="flex items-center space-x-3">
                <span className="w-3 h-3 rounded-sm bg-cyan-400 shadow-[0_0_10px_#38bdf8]"></span>
                <div>
                  <h2 className="font-hud font-bold text-lg text-cyan-200 uppercase tracking-widest drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]">
                    DAST TELEMETRY & DIAGNOSTIC COMMAND CENTER
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">
                    Real-time Target Connectivity, Runtime Request Telemetry & WAF Blocking Analysis
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setDastModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-command-900 border border-cyan-900/60 flex items-center justify-center text-slate-400 hover:text-white hover:border-cyan-400 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Target Diagnostic Probe Input Form */}
            <form onSubmit={handleRunDashboardDiagnostics} className="mb-5 p-4 rounded-xl bg-command-900/90 border border-cyan-900/80 flex flex-col md:flex-row items-center justify-between gap-3 font-mono text-xs shadow-inner">
              <div className="flex items-center space-x-2 w-full md:w-auto flex-1">
                <Radar className="w-5 h-5 text-cyan-400" />
                <span className="text-slate-300 font-bold whitespace-nowrap">Target Probe:</span>
                <input 
                  type="url" 
                  value={diagUrl}
                  onChange={(e) => setDiagUrl(e.target.value)}
                  placeholder="https://your-target-app.com"
                  className="flex-1 bg-command-950 border border-cyan-900/80 rounded-lg px-3.5 py-2 text-cyan-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs"
                />
              </div>
              <button 
                type="submit"
                disabled={diagLoading}
                className="w-full md:w-auto px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-600/30 text-cyan-200 border border-cyan-400/60 font-hud font-bold text-xs uppercase hover:border-cyan-300 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-[0_0_12px_rgba(0,242,254,0.3)] disabled:opacity-50"
              >
                {diagLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></span>
                    <span>PROBING TARGET...</span>
                  </>
                ) : (
                  <>
                    <Compass className="w-4 h-4" />
                    <span>RUN TARGET DIAGNOSTIC</span>
                  </>
                )}
              </button>
            </form>

            {/* Diagnostic Results Banner */}
            {diagResult && (
              <div className={`mb-5 p-4 rounded-xl border font-mono text-xs shadow-lg ${
                diagResult.blocking_status === 'UNBLOCKED' || diagResult.blocking_status === 'CLEAR'
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' 
                  : (diagResult.blocking_status === 'BLOCKED' || diagResult.blocking_status === 'WAF_BLOCKED' ? 'bg-rose-950/40 border-rose-500/50 text-rose-200' : 'bg-amber-950/40 border-amber-500/50 text-amber-200')
              }`}>
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2 font-bold">
                  <div className="flex items-center space-x-2">
                    {diagResult.blocking_status === 'CLEAR' || diagResult.blocking_status === 'UNBLOCKED' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    )}
                    <span className="text-sm">PROBE STATUS: {diagResult.blocking_status}</span>
                  </div>
                  <span>RESPONSE LATENCY: {diagResult.response_time_ms ? `${diagResult.response_time_ms}ms` : 'N/A'}</span>
                </div>
                <p className="text-xs mb-2 leading-relaxed">{diagResult.blocking_reason || 'Target is reachable for DAST security auditing.'}</p>
                {diagResult.recommendations && diagResult.recommendations.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/10 text-[11px] text-slate-300 space-y-1">
                    <span className="font-bold text-cyan-300 block">Guidance & Recommendations:</span>
                    {diagResult.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start space-x-1.5">
                        <span className="text-cyan-400">►</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* DAST Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono mb-5">
              <div className="p-3.5 rounded-xl bg-command-900/90 border border-cyan-900/60 text-center shadow-inner">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">DAST COVERAGE</span>
                <span className="text-2xl font-hud font-black text-cyan-300">{metrics?.dast_telemetry?.coverage_percentage ?? 69.7}%</span>
                <span className="text-[10px] text-slate-400 block mt-1">STATUS: {metrics?.dast_telemetry?.coverage_status || 'MODERATE'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-command-900/90 border border-cyan-900/60 text-center shadow-inner">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">MONITORED TARGETS</span>
                <span className="text-2xl font-hud font-bold text-white">{metrics?.dast_telemetry?.monitored_targets ?? 15}</span>
                <span className="text-[10px] text-slate-400 block mt-1">Scope Endpoints</span>
              </div>
              <div className="p-3.5 rounded-xl bg-command-900/90 border border-cyan-900/60 text-center shadow-inner">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">REQUESTS (HITS)</span>
                <span className="text-2xl font-hud font-bold text-white">{metrics?.dast_telemetry?.total_requests ?? 5583}</span>
                <span className="text-[10px] text-emerald-400 block mt-1">{metrics?.dast_telemetry?.successful_requests ?? 5495} Successful</span>
              </div>
              <div className="p-3.5 rounded-xl bg-command-900/90 border border-rose-500/40 text-center shadow-inner">
                <span className="text-[10px] text-rose-300 font-bold uppercase block mb-1">BLOCKED (403/WAF)</span>
                <span className="text-2xl font-hud font-bold text-rose-400">{metrics?.dast_telemetry?.blocked_requests ?? 88}</span>
                <span className="text-[10px] text-amber-400 block mt-1">{metrics?.dast_telemetry?.waf_status || 'NONE DETECTED'}</span>
              </div>
            </div>

            {/* Sub-metrics summary table */}
            <div className="p-4 rounded-xl bg-command-900/90 border border-cyan-900/60 font-mono text-xs mb-5">
              <span className="font-bold text-cyan-300 block mb-2 uppercase tracking-wide">Endpoint Audit Summary:</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-slate-300">
                <div className="flex justify-between border-b border-cyan-900/40 pb-1">
                  <span>URLs Discovered:</span>
                  <span className="font-bold text-cyan-300">{metrics?.dast_telemetry?.urls_discovered ?? 15}</span>
                </div>
                <div className="flex justify-between border-b border-cyan-900/40 pb-1">
                  <span>URLs Scanned:</span>
                  <span className="font-bold text-purple-400">{metrics?.dast_telemetry?.urls_scanned ?? 20}</span>
                </div>
                <div className="flex justify-between border-b border-cyan-900/40 pb-1">
                  <span>Rate Limited (429):</span>
                  <span className="font-bold text-amber-400">{metrics?.dast_telemetry?.rate_limited_requests ?? 0}</span>
                </div>
                <div className="flex justify-between border-b border-cyan-900/40 pb-1">
                  <span>WAF Active:</span>
                  <span className="font-bold text-amber-400">{metrics?.dast_telemetry?.waf_status || 'NONE DETECTED'}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-cyan-900/50">
              <button 
                onClick={() => setDastModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-command-900 border border-cyan-900/60 hover:border-cyan-400 text-slate-300 font-mono text-xs font-bold cursor-pointer"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  setDastModalOpen(false);
                  if (onNewAssessment) onNewAssessment();
                }}
                className="px-4.5 py-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-600/30 text-cyan-200 border border-cyan-400/60 font-hud font-bold text-xs uppercase hover:border-cyan-300 cursor-pointer shadow-[0_0_15px_rgba(0,242,254,0.3)]"
              >
                Start New DAST Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

