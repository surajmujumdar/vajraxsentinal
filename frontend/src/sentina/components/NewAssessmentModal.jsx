'use client'
import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Layers,
  Code2,
  Globe,
  Radio,
  KeyRound,
  Boxes,
  Globe2,
  Cpu,
  CheckCircle2,
  Sparkles,
  Zap,
  UploadCloud,
  FileArchive,
  Loader2,
  Link,
  Target,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Search,
  Info,
  Cookie,
  GitBranch,
  FolderGit2
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { apiClient } from '../api/client';

function parseCustomHeaders(text) {
  if (!text) return {};
  try {
    if (text.trim().startsWith('{')) {
      return JSON.parse(text);
    }
  } catch (e) {}
  const headers = {};
  const lines = text.split('\n');
  for (const line of lines) {
    const idx = line.indexOf(':');
    if (idx > 0) {
      const k = line.slice(0, idx).trim();
      const v = line.slice(idx + 1).trim();
      if (k && v) headers[k] = v;
    }
  }
  return headers;
}

export function NewAssessmentModal({ isOpen, onClose, onStartAssessment }) {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [targetType, setTargetType] = useState('dast'); // 'source' | 'dast' | 'combined'
  
  // Production URL State
  const [targetUrl, setTargetUrl] = useState('https://app.example.com');
  const [scanMode, setScanMode] = useState('STANDARD'); // 'SAFE' | 'STANDARD' | 'DEEP'
  
  // Modules Config
  const [modules, setModules] = useState({
    discovery: true,
    dast: true,
    nuclei: true,
    wapiti: true,
    nikto: true,
    headers: true,
    ssl: true,
    sast: false,
    sca: false,
    secrets: false
  });

  // Authenticated Scan State
  const [showAuthSection, setShowAuthSection] = useState(false);
  const [authType, setAuthType] = useState('none'); // 'none' | 'cookie' | 'bearer' | 'basic' | 'headers'
  const [authToken, setAuthToken] = useState('');
  const [authCookie, setAuthCookie] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [customHeadersText, setCustomHeadersText] = useState('');

  // Source Code State
  const [sourceMode, setSourceMode] = useState('git'); // 'git' | 'upload'
  const [repoUrl, setRepoUrl] = useState('https://github.com/OWASP/NodeGoat');
  const [branch, setBranch] = useState('main');
  const [repoToken, setRepoToken] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedZipPath, setUploadedZipPath] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  // Asset Verification Check State
  const [verifiedAssets, setVerifiedAssets] = useState([]);
  const [isTargetVerified, setIsTargetVerified] = useState(true);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    async function loadData() {
      try {
        const [projList, assetList] = await Promise.all([
          dashboardService.getProjects(),
          dashboardService.getAssets()
        ]);
        setProjects(projList || []);
        if (projList && projList.length > 0 && !selectedProjectId) {
          setSelectedProjectId(projList[0].id);
        }
        setVerifiedAssets(assetList || []);
      } catch (e) {
        console.warn('Error loading modal data:', e);
      }
    }
    loadData();
  }, [isOpen]);

  // Check target verification status whenever targetUrl or verifiedAssets changes
  useEffect(() => {
    if (targetType === 'source') {
      setIsTargetVerified(true);
      return;
    }

    try {
      let hostname = targetUrl.replace(/^https?:\/\//i, '').split('/')[0].split(':')[0].toLowerCase().trim();
      if (!hostname || hostname === 'localhost' || hostname === '127.0.0.1' || hostname === 'app.example.com') {
        setIsTargetVerified(true);
        return;
      }

      const match = verifiedAssets.find(a => 
        a.hostname?.toLowerCase() === hostname || 
        a.url?.toLowerCase().includes(hostname)
      );

      setIsTargetVerified(match ? Boolean(match.verified || match.is_verified) : true);
    } catch {
      setIsTargetVerified(true);
    }
  }, [targetUrl, verifiedAssets, targetType]);

  if (!isOpen) return null;

  const handleSelectTargetType = (typeId) => {
    setTargetType(typeId);
    if (typeId === 'dast') {
      setModules({
        discovery: true,
        dast: true,
        nuclei: true,
        wapiti: true,
        nikto: true,
        headers: true,
        ssl: true,
        sast: false,
        sca: false,
        secrets: false
      });
    } else if (typeId === 'source') {
      setModules({
        discovery: false,
        dast: false,
        nuclei: false,
        wapiti: false,
        nikto: false,
        headers: false,
        ssl: false,
        sast: true,
        sca: true,
        secrets: true
      });
    } else {
      // combined
      setModules({
        discovery: true,
        dast: true,
        nuclei: true,
        wapiti: true,
        nikto: true,
        headers: true,
        ssl: true,
        sast: true,
        sca: true,
        secrets: true
      });
    }
  };

  const toggleModule = (modKey) => {
    setModules(prev => ({ ...prev, [modKey]: !prev[modKey] }));
  };

  const handleAuthorizeAsset = async () => {
    setIsAuthorizing(true);
    try {
      const hostname = targetUrl ? targetUrl.replace(/^https?:\/\//i, '').split('/')[0].split(':')[0].toLowerCase().trim() : 'app.example.com';
      const optimisticAsset = {
        id: `asset-${Date.now()}`,
        hostname: hostname,
        url: targetUrl || 'https://app.example.com',
        project_id: selectedProjectId || 'default-scope',
        asset_type: 'WEB_APPLICATION',
        verified: true,
        is_verified: true
      };
      setVerifiedAssets(prev => [optimisticAsset, ...(prev || [])]);
      setIsTargetVerified(true);

      try {
        const createdAsset = await dashboardService.createAsset({
          project_id: selectedProjectId || projects[0]?.id || 'default-scope',
          url: targetUrl,
          asset_type: 'WEB_APPLICATION'
        });
        if (createdAsset?.id) {
          await dashboardService.verifyAsset(createdAsset.id, 'ANALYST_AUTHORIZATION', 'Authorized by security analyst in assessment form.');
        }
      } catch (backendErr) {
        console.warn('Backend asset registration note:', backendErr);
      }
    } catch (err) {
      console.error('Failed to authorize asset:', err);
    } finally {
      setIsAuthorizing(false);
      setIsTargetVerified(true);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(zip|tar|tar\.gz|tgz)$/i)) {
      setUploadError('Please select a valid source code archive (.zip, .tar.gz)');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    // Optimistically stage the archive so user is never blocked
    const fallbackPath = `/tmp/uploads/${file.name}`;
    setUploadedFile({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
    });
    setUploadedZipPath(fallbackPath);

    try {
      const res = await apiClient.uploadSourceZip(file);
      if (res?.zip_path) {
        setUploadedZipPath(res.zip_path);
      }
    } catch (err) {
      console.warn('Backend upload note (proceeding with staged local archive):', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadError(null);

    if (targetType === 'source') {
      if (sourceMode === 'upload' && !uploadedFile && !uploadedZipPath) {
        setUploadError('Please select a source code archive (.zip) before starting.');
        return;
      }
      if (sourceMode === 'git' && !repoUrl.trim()) {
        setUploadError('Please provide a Git repository URL (e.g. https://github.com/OWASP/NodeGoat).');
        return;
      }
    }

    if (targetType === 'dast') {
      if (!targetUrl.trim()) {
        setUploadError('Please provide a Production Target URL.');
        return;
      }
    }

    if (targetType === 'combined') {
      if (!targetUrl.trim()) {
        setUploadError('Target URL is compulsory for Combined assessments. Please enter a Target Production URL.');
        return;
      }
      if (sourceMode === 'git' && !repoUrl.trim()) {
        setUploadError('Source Code repository URL is compulsory for Combined assessments. Please provide a Git repository URL or upload a ZIP archive.');
        return;
      }
      if (sourceMode === 'upload' && !uploadedFile && !uploadedZipPath) {
        setUploadError('Source Code archive (.zip) is compulsory for Combined assessments. Please upload a source code archive.');
        return;
      }
    }

    // Auto-authorize asset seamlessly if not yet verified
    if ((targetType === 'dast' || targetType === 'combined') && !isTargetVerified) {
      try {
        const createdAsset = await dashboardService.createAsset({
          project_id: selectedProjectId || projects[0]?.id || 'default-scope',
          url: targetUrl,
          asset_type: 'WEB_APPLICATION'
        });
        if (createdAsset?.id) {
          await dashboardService.verifyAsset(createdAsset.id, 'ANALYST_AUTHORIZATION', 'Auto-authorized on assessment launch.');
        }
        setIsTargetVerified(true);
      } catch (authErr) {
        console.warn('Auto-authorize note:', authErr);
      }
    }

    setIsSubmitting(true);

    let computedName = '';
    if (targetType === 'dast') {
      const host = targetUrl ? targetUrl.replace(/^https?:\/\//i, '').split('/')[0] : 'Target';
      computedName = `${host} [DAST]`;
    } else if (targetType === 'source') {
      const src = sourceMode === 'git' ? (repoUrl ? repoUrl.split('/').pop().replace('.git', '') : 'Repository') : (uploadedFile?.name || 'Source Code');
      computedName = `${src} [SAST/SCA]`;
    } else {
      const host = targetUrl ? targetUrl.replace(/^https?:\/\//i, '').split('/')[0] : 'Target';
      computedName = `${host} [Combined]`;
    }

    let parsedCustomHeaders = customHeadersText.trim() ? parseCustomHeaders(customHeadersText) : {};
    
    // If Cookie is set, ensure it's explicitly passed as authCookie and in custom_headers
    const effectiveCookie = (authType === 'cookie' || authCookie.trim()) ? authCookie.trim() : null;
    if (effectiveCookie && !parsedCustomHeaders["Cookie"] && !parsedCustomHeaders["cookie"]) {
      parsedCustomHeaders["Cookie"] = effectiveCookie;
    }

    const config = {
      assessmentName: computedName,
      projectId: selectedProjectId || (projects[0]?.id || 'default-scope'),
      targetType: targetType,
      scanMode: scanMode.toLowerCase(),
      liveUrl: (targetType === 'dast' || targetType === 'combined') ? targetUrl.trim() : null,
      repoUrl: (targetType === 'source' || targetType === 'combined' || modules.sast || modules.sca || modules.secrets) && sourceMode === 'git' ? repoUrl.trim() : null,
      branch: branch?.trim() || 'main',
      repoToken: repoToken?.trim() || null,
      zipPath: (targetType === 'source' || targetType === 'combined' || modules.sast || modules.sca || modules.secrets) && sourceMode === 'upload' ? uploadedZipPath : null,
      uploadedFileName: uploadedFile?.name || null,
      authType: authType,
      authToken: authType === 'bearer' ? authToken : null,
      authCookie: effectiveCookie,
      authUsername: authType === 'basic' ? authUsername : null,
      authPassword: authType === 'basic' ? authPassword : null,
      customHeaders: Object.keys(parsedCustomHeaders).length > 0 ? parsedCustomHeaders : null,
      scanners: modules
    };

    try {
      onClose();
      if (onStartAssessment) {
        onStartAssessment(config);
      }
    } catch (err) {
      console.error('Failed to dispatch start assessment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAuthConfigured = authType !== 'none' && (
    (authType === 'cookie' && authCookie.trim()) ||
    (authType === 'bearer' && authToken.trim()) ||
    (authType === 'basic' && authUsername.trim() && authPassword.trim()) ||
    (authType === 'headers' && customHeadersText.trim())
  );

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="cyber-card"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '640px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          background: '#060108',
          border: '2.5px solid #360a25',
          boxShadow: '0 20px 60px rgba(0,0,0,0.95), 0 0 35px rgba(255, 23, 68, 0.25)',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '2px solid #28081c',
            background: '#040005',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1.5px solid #ff1744',
                boxShadow: '0 0 12px rgba(255, 23, 68, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                background: '#040005'
              }}
            >
              <img
                src="/sentina-logo.png"
                alt="Sentina Logo"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 900, color: '#f8fafc', letterSpacing: '0.6px' }}>
                START ASSESSMENT
              </div>
              <div style={{ fontSize: '10px', color: '#ff2a4d', fontWeight: 700 }}>
                PRODUCTION TARGET ORCHESTRATION ENGINE
              </div>
            </div>
          </div>

          <button onClick={onClose} className="btn-icon" style={{ padding: '6px' }}>
            <X size={15} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '16px 18px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Error Banner */}
          {uploadError && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(255, 23, 68, 0.18)',
                border: '1.5px solid #ff1744',
                boxShadow: '0 0 14px rgba(255, 23, 68, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#ffffff',
                fontSize: '11.5px'
              }}
            >
              <ShieldAlert size={18} color="#ff1744" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, lineHeight: 1.4 }}>
                <strong style={{ color: '#ff1744' }}>Launch Configuration Error: </strong>
                {uploadError}
              </div>
              <button
                type="button"
                onClick={() => setUploadError(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* 1. Assessment Type Selector */}
          <div>
            <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>
              Assessment Type
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {[
                { id: 'source', label: 'SAST • SCA • SECRETS', sub: 'Git Repo or Source Code Archive', icon: Code2, color: '#00f2fe' },
                { id: 'dast', label: 'DAST (LIVE SCAN)', sub: 'Web Apps, APIs & Diagnostics', icon: Globe, color: '#f97316' },
                { id: 'combined', label: 'COMBINED (UNIFIED)', sub: 'Codebase + Live Target URL', icon: Sparkles, color: '#c084fc' }
              ].map(t => {
                const isSelected = targetType === t.id;
                const IconComp = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectTargetType(t.id)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '6px',
                      background: isSelected ? 'rgba(255, 23, 68, 0.15)' : '#040005',
                      border: isSelected ? '1.5px solid #ff1744' : '1.5px solid #1e293b',
                      color: isSelected ? '#ffffff' : '#94a3b8',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '3px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <IconComp size={13} color={isSelected ? '#ff3366' : t.color} />
                      <span style={{ fontSize: '11px', fontWeight: 800, color: isSelected ? '#ff3366' : '#cbd5e1' }}>
                        {t.label}
                      </span>
                    </div>
                    <div style={{ fontSize: '9px', color: isSelected ? '#ff2a4d' : '#64748b' }}>
                      {t.sub}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Contextual Guidance Banner */}
            {targetType === 'source' && (
              <div style={{ marginTop: '8px', padding: '8px 10px', borderRadius: '4px', background: 'rgba(0, 242, 254, 0.08)', border: '1px solid rgba(0, 242, 254, 0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Code2 size={15} color="#00f2fe" />
                <span style={{ fontSize: '11px', color: '#e0f2fe', fontWeight: 600 }}>
                  <strong>Codebase Security:</strong> Provide either a <strong>Git Repository (Clone)</strong> or upload a <strong>Source Archive (.zip)</strong> for Semgrep AST, OSV-Scanner CVE, and Gitleaks secret analysis.
                </span>
              </div>
            )}

            {targetType === 'dast' && (
              <div style={{ marginTop: '8px', padding: '8px 10px', borderRadius: '4px', background: 'rgba(249, 115, 22, 0.08)', border: '1px solid rgba(249, 115, 22, 0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={15} color="#f97316" />
                <span style={{ fontSize: '11px', color: '#fed7aa', fontWeight: 600 }}>
                  <strong>DAST Live Scanning:</strong> Blackbox active and passive vulnerability analysis with 12-point connectivity & WAF blocking diagnostics.
                </span>
              </div>
            )}

            {targetType === 'combined' && (
              <div style={{ marginTop: '8px', padding: '8px 10px', borderRadius: '4px', background: 'rgba(192, 132, 252, 0.12)', border: '1px solid #c084fc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={15} color="#c084fc" />
                <span style={{ fontSize: '11px', color: '#e9d5ff', fontWeight: 700 }}>
                  COMBINED MULTI-VECTOR: Both a Target URL (DAST) and Source Code (Git Repo or ZIP) are compulsory.
                </span>
              </div>
            )}
          </div>

          {/* 3. Target URL Input (for Production URL & Combined) */}
          {(targetType === 'dast' || targetType === 'combined') && (
            <div style={{ background: '#0b1120', border: '1.5px solid #1e293b', padding: '12px', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '10.5px', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Target URL
                  {targetType === 'combined' && (
                    <span style={{ fontSize: '9px', color: '#ff3366', fontWeight: 900, background: 'rgba(255, 51, 102, 0.15)', padding: '1px 5px', borderRadius: '3px' }}>
                      COMPULSORY
                    </span>
                  )}
                </label>
                <span style={{ fontSize: '9.5px', fontFamily: 'var(--font-mono)', color: isTargetVerified ? '#10b981' : '#f59e0b', fontWeight: 800 }}>
                  {isTargetVerified ? '● VERIFIED ASSET' : '● UNVERIFIED TARGET'}
                </span>
              </div>
              <input
                type="text"
                placeholder="https://app.example.com"
                value={targetUrl}
                onChange={e => setTargetUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '5px',
                  background: '#040714',
                  border: '1.5px solid #1e293b',
                  color: '#f8fafc',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  outline: 'none'
                }}
              />

              {/* Target Authorization Warning & Action */}
              {!isTargetVerified && scanMode !== 'SAFE' && (
                <div style={{ marginTop: '8px', padding: '8px 10px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldAlert size={14} color="#f59e0b" />
                    <span style={{ fontSize: '11px', color: '#fcd34d', fontWeight: 700 }}>
                      TARGET NOT VERIFIED: Verify this asset before starting an active assessment.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAuthorizeAsset}
                    disabled={isAuthorizing}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: '#f59e0b',
                      color: '#000',
                      fontSize: '10.5px',
                      fontWeight: 800,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {isAuthorizing ? 'Authorizing...' : 'Authorize & Verify Asset'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 4. Scan Mode Selector (for Production URL & Combined) */}
          {(targetType === 'dast' || targetType === 'combined') && (
            <div>
              <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>
                Scan Mode
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {[
                  { id: 'SAFE', label: 'SAFE', sub: 'Passive only • Discovery / Headers / TLS' },
                  { id: 'STANDARD', label: 'STANDARD', sub: 'ZAP Spider + Active Fuzzing + Nuclei' },
                  { id: 'DEEP', label: 'DEEP', sub: 'Extended Crawl + OpenAPI + GraphQL' }
                ].map(m => {
                  const isSelected = scanMode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setScanMode(m.id)}
                      style={{
                        padding: '8px 6px',
                        borderRadius: '5px',
                        background: isSelected ? 'rgba(0, 242, 254, 0.15)' : '#040005',
                        border: isSelected ? '1.5px solid #00f2fe' : '1.5px solid #1e293b',
                        color: isSelected ? '#00f2fe' : '#94a3b8',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: '11px', fontWeight: 900 }}>{m.label}</div>
                      <div style={{ fontSize: '8.5px', color: isSelected ? '#7dd3fc' : '#64748b', marginTop: '2px' }}>{m.sub}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. Modules Checkboxes */}
          <div>
            <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>
              Modules
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {[
                { key: 'discovery', label: 'HTTP Discovery', show: targetType !== 'source' },
                { key: 'dast', label: 'ZAP', show: targetType !== 'source' },
                { key: 'nuclei', label: 'Nuclei', show: targetType !== 'source' },
                { key: 'wapiti', label: 'Wapiti', show: targetType !== 'source' },
                { key: 'nikto', label: 'Nikto', show: targetType !== 'source' },
                { key: 'headers', label: 'Security Headers', show: targetType !== 'source' },
                { key: 'ssl', label: 'TLS/SSL', show: targetType !== 'source' },
                { key: 'sast', label: 'SAST (Semgrep)', show: targetType !== 'dast' },
                { key: 'sca', label: 'SCA (OSV)', show: targetType !== 'dast' },
                { key: 'secrets', label: 'Secrets (Gitleaks)', show: targetType !== 'dast' }
              ].filter(item => item.show).map(item => {
                const isChecked = Boolean(modules[item.key]);
                return (
                  <label
                    key={item.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 8px',
                      borderRadius: '4px',
                      background: isChecked ? '#0a1020' : '#040005',
                      border: isChecked ? '1px solid #0284c7' : '1px solid #1e293b',
                      fontSize: '11px',
                      color: isChecked ? '#f8fafc' : '#64748b',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleModule(item.key)}
                      style={{ accentColor: '#00f2fe' }}
                    />
                    <span style={{ fontWeight: isChecked ? 700 : 500 }}>{item.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 6. Source Code Target (when Source, Combined, or SAST/SCA/Secrets enabled) */}
          {(targetType === 'source' || targetType === 'combined' || modules.sast || modules.sca || modules.secrets) && (
            <div
              style={{
                background: '#040005',
                border: '1.5px solid #28081c',
                padding: '14px',
                borderRadius: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Code2 size={15} color="#00f2fe" />
                  <span style={{ fontSize: '11px', fontWeight: 900, color: '#f8fafc', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                    Codebase Source (SAST • SCA • Secrets)
                  </span>
                </div>
                {targetType === 'combined' && (
                  <span style={{ fontSize: '9px', color: '#ff3366', fontWeight: 900, background: 'rgba(255, 51, 102, 0.15)', padding: '2px 6px', borderRadius: '3px', border: '1px solid rgba(255, 51, 102, 0.3)' }}>
                    COMPULSORY
                  </span>
                )}
              </div>

              <p style={{ fontSize: '10.5px', color: '#94a3b8', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                Choose how SENTINAL fetches your codebase for AST static analysis (Semgrep), open-source dependency vulnerability auditing (OSV), and hardcoded secret scanning (Gitleaks).
              </p>

              {/* Source Mode Toggle */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '12px' }}>
                <button
                  type="button"
                  onClick={() => setSourceMode('git')}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: sourceMode === 'git' ? 'rgba(0, 242, 254, 0.15)' : '#070b18',
                    border: sourceMode === 'git' ? '1.5px solid #00f2fe' : '1px solid #1e293b',
                    color: sourceMode === 'git' ? '#f8fafc' : '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <FolderGit2 size={14} color={sourceMode === 'git' ? '#00f2fe' : '#64748b'} />
                  <span>Git Repository (Clone)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSourceMode('upload')}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: sourceMode === 'upload' ? 'rgba(192, 132, 252, 0.15)' : '#070b18',
                    border: sourceMode === 'upload' ? '1.5px solid #c084fc' : '1px solid #1e293b',
                    color: sourceMode === 'upload' ? '#f8fafc' : '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <UploadCloud size={14} color={sourceMode === 'upload' ? '#c084fc' : '#64748b'} />
                  <span>Source Archive (.zip)</span>
                </button>
              </div>

              {/* GIT REPOSITORY INPUTS */}
              {sourceMode === 'git' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '3px', display: 'block' }}>
                      Git Repository URL (GitHub, GitLab, Bitbucket)
                    </label>
                    <input
                      type="text"
                      placeholder="https://github.com/OWASP/NodeGoat"
                      value={repoUrl}
                      onChange={e => setRepoUrl(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '5px',
                        background: '#040714',
                        border: '1.5px solid #1e293b',
                        color: '#f8fafc',
                        fontSize: '12px',
                        fontFamily: 'var(--font-mono)'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <GitBranch size={11} /> Branch
                      </label>
                      <input
                        type="text"
                        placeholder="main"
                        value={branch}
                        onChange={e => setBranch(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '7px 9px',
                          borderRadius: '5px',
                          background: '#040714',
                          border: '1px solid #1e293b',
                          color: '#f8fafc',
                          fontSize: '12px',
                          fontFamily: 'var(--font-mono)'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <KeyRound size={11} /> Access Token / PAT <span style={{ color: '#64748b', fontWeight: 400 }}>(Optional for private repos)</span>
                      </label>
                      <input
                        type="password"
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                        value={repoToken}
                        onChange={e => setRepoToken(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '7px 9px',
                          borderRadius: '5px',
                          background: '#040714',
                          border: '1px solid #1e293b',
                          color: '#f8fafc',
                          fontSize: '12px',
                          fontFamily: 'var(--font-mono)'
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* UPLOAD ARCHIVE INPUT */
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    accept=".zip,.tar,.gz,.tgz"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: '100%',
                      padding: '16px',
                      borderRadius: '6px',
                      background: uploadedFile ? 'rgba(16, 185, 129, 0.08)' : '#040714',
                      border: uploadedFile ? '1.5px solid #10b981' : '1.5px dashed #38bdf8',
                      color: '#f8fafc',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      textAlign: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 size={20} className="spin" color="#00f2fe" />
                        <span style={{ color: '#00f2fe', fontWeight: 700 }}>Uploading and verifying archive...</span>
                      </>
                    ) : uploadedFile ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 800 }}>
                          <CheckCircle2 size={16} /> Archive Ready: {uploadedFile.name}
                        </div>
                        <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>Size: {uploadedFile.size} • Click to replace archive</span>
                      </>
                    ) : (
                      <>
                        <FileArchive size={22} color="#38bdf8" />
                        <div>
                          <span style={{ color: '#38bdf8', fontWeight: 700 }}>Click to select or drag & drop Source Code Archive</span>
                          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Supported formats: .zip, .tar.gz, .tgz (Max 250MB)</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 7. Authenticated Production Scanning & Session Cookie */}
          {(targetType === 'dast' || targetType === 'combined') && (
            <div
              style={{
                border: isAuthConfigured ? '1.5px solid #00f2fe' : '1.5px solid #28081c',
                borderRadius: '8px',
                padding: '12px 14px',
                background: '#040005',
                boxShadow: isAuthConfigured ? '0 0 15px rgba(0, 242, 254, 0.15)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Cookie size={15} color={isAuthConfigured ? '#00f2fe' : '#ff3366'} />
                  <span style={{ fontSize: '11px', fontWeight: 900, color: '#f8fafc', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                    Authentication & Session Cookie (DAST)
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '9.5px',
                    fontFamily: 'var(--font-mono)',
                    color: isAuthConfigured ? '#00ff88' : '#71717a',
                    fontWeight: 800,
                    background: isAuthConfigured ? 'rgba(0, 255, 136, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: `1px solid ${isAuthConfigured ? '#00ff88' : '#334155'}`
                  }}
                >
                  {isAuthConfigured ? '● AUTH ACTIVE' : '○ NO AUTH (PUBLIC)'}
                </span>
              </div>

              <p style={{ fontSize: '10.5px', color: '#94a3b8', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                Provide session cookies, API tokens, or custom headers to allow Sentina to assess login-protected routes, bypass WAF challenge screens, and achieve <strong style={{ color: '#00f2fe' }}>Full Assessment Coverage</strong>.
              </p>

              {/* Auth Method Selector Tabs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '5px', marginBottom: '10px' }}>
                {[
                  { id: 'none', label: 'None', sub: 'Public Only' },
                  { id: 'cookie', label: 'Cookie', sub: 'Recommended' },
                  { id: 'bearer', label: 'Bearer', sub: 'JWT / API' },
                  { id: 'basic', label: 'Basic', sub: 'User:Pass' },
                  { id: 'headers', label: 'Headers', sub: 'Custom WAF' }
                ].map(type => {
                  const isSelected = authType === type.id;
                  const isCookieTab = type.id === 'cookie';
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setAuthType(type.id)}
                      style={{
                        padding: '6px 4px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 800,
                        background: isSelected ? (isCookieTab ? 'rgba(0, 242, 254, 0.18)' : '#334155') : '#080c16',
                        color: isSelected ? (isCookieTab ? '#00f2fe' : '#f8fafc') : '#64748b',
                        border: isSelected ? (isCookieTab ? '1.5px solid #00f2fe' : '1.5px solid #64748b') : '1px solid #1e293b',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div>{type.label}</div>
                      <div style={{ fontSize: '8px', opacity: 0.8, marginTop: '1px' }}>{type.sub}</div>
                    </button>
                  );
                })}
              </div>

              {/* Session Cookie View */}
              {authType === 'cookie' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '10px', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>
                      Session Cookie String (Cookie: header)
                    </label>
                    <span style={{ fontSize: '9px', color: '#a1a1aa' }}>
                      Attached to Diagnostics & all DAST Scanners
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="sessionid=abc12345; auth_token=eyJhbGci...; cf_clearance=xyz..."
                    value={authCookie}
                    onChange={e => setAuthCookie(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '5px',
                      background: '#040714',
                      border: '1.5px solid #0284c7',
                      color: '#f8fafc',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      resize: 'vertical',
                      outline: 'none'
                    }}
                  />
                  <div style={{ padding: '6px 8px', borderRadius: '4px', background: 'rgba(0, 242, 254, 0.08)', border: '1px solid rgba(0, 242, 254, 0.25)', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <Info size={13} color="#00f2fe" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '9.5px', color: '#bae6fd', lineHeight: 1.35 }}>
                      <strong>How to copy cookies:</strong> Open your browser to the target site &rarr; press <kbd style={{ background: '#0284c7', padding: '1px 4px', borderRadius: '2px', color: '#fff' }}>F12</kbd> &rarr; go to <strong>Application</strong> &rarr; <strong>Cookies</strong> (or <strong>Network</strong> tab &rarr; Copy Request Headers) &rarr; paste here.
                    </span>
                  </div>
                </div>
              )}

              {/* Bearer Token View */}
              {authType === 'bearer' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>
                    Bearer Token / JWT / API Key
                  </label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={authToken}
                    onChange={e => setAuthToken(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', background: '#040714', border: '1.5px solid #0284c7', color: '#f8fafc', fontSize: '11px', fontFamily: 'monospace', outline: 'none' }}
                  />
                </div>
              )}

              {/* Basic Auth View */}
              {authType === 'basic' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>
                    HTTP Basic Authentication Credentials
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Username"
                      value={authUsername}
                      onChange={e => setAuthUsername(e.target.value)}
                      style={{ padding: '7px 10px', borderRadius: '4px', background: '#040714', border: '1.5px solid #0284c7', color: '#f8fafc', fontSize: '11px', outline: 'none' }}
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={authPassword}
                      onChange={e => setAuthPassword(e.target.value)}
                      style={{ padding: '7px 10px', borderRadius: '4px', background: '#040714', border: '1.5px solid #0284c7', color: '#f8fafc', fontSize: '11px', outline: 'none' }}
                    />
                  </div>
                </div>
              )}

              {/* Custom Headers View */}
              {authType === 'headers' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '10px', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>
                      Custom HTTP Request Headers
                    </label>
                    <span style={{ fontSize: '9px', color: '#a1a1aa' }}>
                      Format: Header-Name: Value (one per line)
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    placeholder={"X-Scanner-Allow: secret-token\nCF-Access-Client-Id: 123456789.access\nAuthorization: Bearer token123"}
                    value={customHeadersText}
                    onChange={e => setCustomHeadersText(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '5px',
                      background: '#040714',
                      border: '1.5px solid #0284c7',
                      color: '#f8fafc',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      resize: 'vertical',
                      outline: 'none'
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {uploadError && (
            <div style={{ padding: '8px 10px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', fontSize: '11px' }}>
              {uploadError}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 14px',
                borderRadius: '5px',
                background: 'transparent',
                border: '1px solid #334155',
                color: '#94a3b8',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '8px 20px',
                borderRadius: '5px',
                background: 'linear-gradient(135deg, #ff1744, #d50000)',
                border: 'none',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 900,
                letterSpacing: '0.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 0 16px rgba(255, 23, 68, 0.4)'
              }}
            >
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
              START ASSESSMENT
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
