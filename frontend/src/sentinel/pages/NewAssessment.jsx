import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  UploadCloud, 
  Globe, 
  Layers, 
  ShieldCheck, 
  AlertTriangle, 
  Play, 
  Check, 
  KeyRound, 
  Sliders, 
  FileCode,
  FolderPlus,
  Plus,
  X,
  Activity,
  Wifi,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import { apiClient } from '../api/client';

export const NewAssessment = ({ onAssessmentStarted }) => {
  const [mode, setMode] = useState('repo'); // 'repo', 'source', 'dast', 'combined'
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  
  // Project creation modal
  const [showNewProjModal, setShowNewProjModal] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjRepo, setNewProjRepo] = useState('');
  const [newProjTarget, setNewProjTarget] = useState('');
  const [creatingProj, setCreatingProj] = useState(false);

  // Repo Fields
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [githubToken, setGithubToken] = useState('');
  
  // Source Upload Fields
  const [uploadedZip, setUploadedZip] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Live URL Fields
  const [targetUrl, setTargetUrl] = useState('https://');
  const [scanPolicy, setScanPolicy] = useState('standard'); // 'safe', 'standard', 'deep'
  const [authHeader, setAuthHeader] = useState('');

  // Target Connectivity & WAF Diagnostics State
  const [diagLoading, setDiagLoading] = useState(false);
  const [diagResult, setDiagResult] = useState(null);

  const handleRunDiagnostics = async () => {
    if (!targetUrl || !targetUrl.trim()) return;
    setDiagLoading(true);
    setDiagResult(null);
    try {
      const headers = authHeader ? { 'Authorization': authHeader } : null;
      const res = await apiClient.runTargetDiagnostics(targetUrl.trim(), headers);
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

  // Modules Selection
  const [modules, setModules] = useState({
    sast: true,
    sca: true,
    secrets: true,
    dast: true,
    nuclei: true,
    wapiti: true,
    nikto: true,
    ssl: true
  });

  const [authorizedChecked, setAuthorizedChecked] = useState(true);
  const [launching, setLaunching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await apiClient.getProjects();
      setProjects(data);
      if (data && data.length > 0) {
        setSelectedProjectId(data[0].id);
        if (data[0].repository_url) setRepoUrl(data[0].repository_url);
        if (data[0].target_url && !data[0].target_url.includes('httpbin')) {
          setTargetUrl(data[0].target_url);
        } else {
          setTargetUrl('https://');
        }
      } else {
        // Create initial default workspace if none exist
        const newProj = await apiClient.createProject({
          name: 'Default Workspace',
          description: 'Security assessment project scope',
          repository_url: null,
          target_url: null
        });
        setProjects([newProj]);
        setSelectedProjectId(newProj.id);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  const handleProjectChange = (projId) => {
    setSelectedProjectId(projId);
    const proj = projects.find(p => p.id === projId);
    if (proj) {
      setRepoUrl(proj.repository_url || '');
      setTargetUrl((proj.target_url && !proj.target_url.includes('httpbin')) ? proj.target_url : 'https://');
    }
  };

  const handleCreateProjectInline = async (e) => {
    e.preventDefault();
    if (!newProjName.trim()) return;
    setCreatingProj(true);
    setErrorMsg('');
    try {
      const created = await apiClient.createProject({
        name: newProjName.trim(),
        description: newProjDesc.trim() || null,
        repository_url: newProjRepo.trim() || null,
        target_url: newProjTarget.trim() || null
      });
      setProjects([...projects, created]);
      setSelectedProjectId(created.id);
      setRepoUrl(created.repository_url || '');
      setTargetUrl(created.target_url || '');
      setShowNewProjModal(false);
      setNewProjName('');
      setNewProjDesc('');
      setNewProjRepo('');
      setNewProjTarget('');
    } catch (err) {
      setErrorMsg(`Failed to create project: ${err.message}`);
    } finally {
      setCreatingProj(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedZip(file);
    setUploading(true);
    setErrorMsg('');
    try {
      const res = await apiClient.uploadSourceZip(file);
      setUploadResult(res);
    } catch (err) {
      setErrorMsg(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleLaunch = async (e) => {
    e.preventDefault();
    if (!authorizedChecked) {
      setErrorMsg('You must confirm that you are authorized to assess the specified target assets.');
      return;
    }
    if (!selectedProjectId) {
      setErrorMsg('Please select or create a target project scope first.');
      return;
    }

    setLaunching(true);
    setErrorMsg('');

    try {
      let payload;

      if (mode === 'repo') {
        if (!repoUrl.trim()) {
          throw new Error('Please enter a valid GitHub repository URL.');
        }
        payload = {
          project_id: selectedProjectId,
          assessment_type: 'repo',
          modules: {
            sast: modules.sast,
            sca: modules.sca,
            secrets: modules.secrets,
            dast: false,
            nuclei: false,
            ssl: false
          },
          repository: {
            url: repoUrl.trim(),
            branch: branch.trim() || 'main',
            token: githubToken.trim() || null
          },
          target: null
        };
      } else if (mode === 'source') {
        if (!uploadResult?.zip_path) {
          throw new Error('Please upload a source code archive (.zip / .tar) before launching assessment.');
        }
        payload = {
          project_id: selectedProjectId,
          assessment_type: 'source',
          modules: {
            sast: modules.sast,
            sca: modules.sca,
            secrets: modules.secrets,
            dast: false,
            nuclei: false,
            ssl: false
          },
          repository: {
            zip_path: uploadResult.zip_path
          },
          target: null
        };
      } else if (mode === 'dast') {
        if (!targetUrl.trim()) {
          throw new Error('Please enter a valid live application URL (e.g. https://example.com).');
        }
        payload = {
          project_id: selectedProjectId,
          assessment_type: 'dast',
          modules: {
            sast: false,
            sca: false,
            secrets: false,
            dast: modules.dast,
            nuclei: modules.nuclei,
            ssl: modules.ssl
          },
          repository: null,
          target: {
            url: targetUrl.trim(),
            scan_mode: scanPolicy,
            auth_header: authHeader.trim() || null
          }
        };
      } else {
        // Combined mode
        const hasRepo = Boolean(repoUrl.trim());
        const hasTarget = Boolean(targetUrl.trim());

        if (!hasRepo && !hasTarget) {
          throw new Error('Please provide at least a GitHub repository URL or a Live Target URL.');
        }

        payload = {
          project_id: selectedProjectId,
          assessment_type: 'combined',
          modules: {
            sast: hasRepo ? modules.sast : false,
            sca: hasRepo ? modules.sca : false,
            secrets: hasRepo ? modules.secrets : false,
            dast: hasTarget ? modules.dast : false,
            nuclei: hasTarget ? modules.nuclei : false,
            ssl: hasTarget ? modules.ssl : false
          },
          repository: hasRepo ? {
            url: repoUrl.trim(),
            branch: branch.trim() || 'main',
            token: githubToken.trim() || null
          } : null,
          target: hasTarget ? {
            url: targetUrl.trim(),
            scan_mode: scanPolicy,
            auth_header: authHeader.trim() || null
          } : null
        };
      }

      const res = await apiClient.startAssessment(payload);
      if (onAssessmentStarted) {
        onAssessmentStarted(res);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to start assessment.');
    } finally {
      setLaunching(false);
    }
  };

  const selectedProj = projects.find(p => p.id === selectedProjectId);

  // Determine scanner module applicability based on mode
  const isCodeMode = mode === 'repo' || mode === 'source';
  const isDastMode = mode === 'dast';

  return (
    <div className="page-container" style={{ maxWidth: '980px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 className="title-gradient" style={{ fontSize: '26px', marginBottom: '6px' }}>
          Configure Security Assessment
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Select assessment modality, configure source repositories, live targets, and scanning depth.
        </p>
      </div>

      {errorMsg && (
        <div style={{
          background: 'rgba(255, 51, 102, 0.1)',
          border: '1px solid #ff3366',
          borderRadius: '8px',
          padding: '12px 16px',
          color: '#ff3366',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertTriangle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Mode Selector Tabs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        marginBottom: '24px'
      }}>
        {[
          { id: 'repo', label: 'GitHub Repository', desc: 'SAST + SCA + Secret Detection', icon: GitBranch },
          { id: 'source', label: 'Source Code Upload', desc: 'ZIP / Folder Static Analysis', icon: UploadCloud },
          { id: 'dast', label: 'Live Target URL', desc: 'DAST + Web Probes + SSL/TLS', icon: Globe },
          { id: 'combined', label: 'Combined Assessment', desc: 'SAST + SCA + Secrets + DAST', icon: Layers }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSel = mode === tab.id;
          return (
            <div
              key={tab.id}
              onClick={() => setMode(tab.id)}
              style={{
                padding: '16px',
                background: isSel ? 'rgba(0, 242, 254, 0.08)' : '#0f172a',
                border: isSel ? '1px solid #00f2fe' : '1px solid #1e293b',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isSel ? '0 0 16px rgba(0, 242, 254, 0.2)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Icon size={18} color={isSel ? '#00f2fe' : '#94a3b8'} />
                <span style={{ fontSize: '13px', fontWeight: '700', color: isSel ? '#00f2fe' : '#f8fafc' }}>
                  {tab.label}
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                {tab.desc}
              </p>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleLaunch}>

        {/* Input A: GitHub Repository Configuration */}
        {(mode === 'repo' || mode === 'combined') && (
          <div className="cyber-card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <GitBranch size={18} color="#00f2fe" />
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc' }}>
                GitHub Repository Inputs
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Repository URL (Public or Private)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://github.com/owner/repository"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  required={mode === 'repo'}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Branch</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="main"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  required={mode === 'repo'}
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Optional GitHub Access Token (for Private Repositories)</label>
              <input
                type="password"
                className="form-input"
                placeholder="ghp_************************************"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
              />
              <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                Tokens are masked, never persisted in plain logs, and only used in isolated workers.
              </span>
            </div>
          </div>
        )}

        {/* Input B: Source Code File Upload */}
        {mode === 'source' && (
          <div className="cyber-card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <UploadCloud size={18} color="#a855f7" />
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc' }}>
                Upload Source Code Archive
              </h3>
            </div>

            <div style={{
              border: '2px dashed #334155',
              borderRadius: '10px',
              padding: '32px',
              textAlign: 'center',
              background: '#090d16',
              cursor: 'pointer'
            }}
            onClick={() => document.getElementById('zip-upload-input').click()}
            >
              <UploadCloud size={36} color="#38bdf8" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc', marginBottom: '4px' }}>
                {uploadedZip ? uploadedZip.name : 'Click to select .zip or .tar source archive'}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Supports JavaScript, TypeScript, Python, Java, Go, PHP, C/C++, C#, Ruby, Dockerfile, Terraform, K8s
              </div>
              <input
                id="zip-upload-input"
                type="file"
                accept=".zip,.tar,.gz"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </div>
            {uploading && <div style={{ fontSize: '12px', color: '#38bdf8', marginTop: '8px' }}>Uploading and scanning archive headers...</div>}
            {uploadResult && (
              <div style={{ fontSize: '12px', color: '#10b981', marginTop: '8px', fontWeight: '600' }}>
                ✓ Archive ready for analysis ({uploadResult.filename})
              </div>
            )}
          </div>
        )}

        {/* Input C: Live Application DAST Target */}
        {(mode === 'dast' || mode === 'combined') && (
          <div className="cyber-card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Globe size={18} color="#00f2fe" />
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc' }}>
                Live Application Target (DAST & Web Probes)
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Live Application URL</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  required={mode === 'dast'}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Scan Policy Depth</label>
                <select
                  className="form-select"
                  value={scanPolicy}
                  onChange={(e) => setScanPolicy(e.target.value)}
                >
                  <option value="safe">Safe (Passive & Header Checks)</option>
                  <option value="standard">Standard (Crawl & Controlled Probes)</option>
                  <option value="deep">Deep (Comprehensive Heuristic Probing)</option>
                </select>
              </div>
            </div>

          </div>
        )}

        {/* Modular Scanner Checklist */}
        <div className="cyber-card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>
              Enabled Scanner Engines
            </div>
            {isCodeMode && (
              <span style={{ fontSize: '11px', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                Code & Dependency Scans Active (DAST Skipped)
              </span>
            )}
            {isDastMode && (
              <span style={{ fontSize: '11px', color: '#00f2fe', background: 'rgba(0, 242, 254, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                Live Web Scans Active (SAST Skipped)
              </span>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              { id: 'sast', label: 'SAST (Semgrep & AST Engine)', desc: 'Code flaws, SQLi, XSS, RCE', type: 'code' },
              { id: 'sca', label: 'SCA (OSV Lockfile Analyzer)', desc: '15+ ecosystems, CVEs, patches', type: 'code' },
              { id: 'secrets', label: 'Secret Detector (Gitleaks)', desc: '50+ regex patterns & entropy', type: 'code' },
              { id: 'dast', label: 'DAST (OWASP ZAP Engine)', desc: 'Dynamic crawling, injection, XSS, cookies', type: 'dast' },
              { id: 'nikto', label: 'Nikto Web Server Scanner', desc: 'Dangerous files, CGI scripts, misconfigs', type: 'dast' },
              { id: 'nuclei', label: 'Web Exposure (Nuclei)', desc: 'Git, .env, misconfigurations', type: 'dast' },
              { id: 'wapiti', label: 'Wapiti DAST (Form Auditor)', desc: 'SQLi, XSS, SSRF, File handling', type: 'dast' },
              { id: 'ssl', label: 'SSL/TLS & Crypto (testssl.sh)', desc: 'Ciphers, expiration, protocols, heartbleed', type: 'dast' }
            ].map((mod) => {
              const isDisabled = (isCodeMode && mod.type === 'dast') || (isDastMode && mod.type === 'code');
              const isChecked = isDisabled ? false : modules[mod.id];
              return (
                <label
                  key={mod.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '12px',
                    background: isDisabled ? '#060a12' : '#090d16',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: isDisabled ? '#111827' : '#1e293b',
                    opacity: isDisabled ? 0.45 : 1,
                    cursor: isDisabled ? 'not-allowed' : 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    disabled={isDisabled}
                    checked={isChecked}
                    onChange={(e) => setModules({ ...modules, [mod.id]: e.target.checked })}
                    style={{ marginTop: '3px' }}
                  />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: isDisabled ? '#64748b' : '#f8fafc' }}>
                      {mod.label}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      {isDisabled ? (mod.type === 'dast' ? 'Requires Live URL Target' : 'Requires Repository/Source') : mod.desc}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Authorization Confirmation */}
        <div style={{
          background: 'rgba(56, 189, 248, 0.05)',
          border: '1px solid #1e293b',
          borderRadius: '10px',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <input
            type="checkbox"
            id="auth-check"
            checked={authorizedChecked}
            onChange={(e) => setAuthorizedChecked(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <label htmlFor="auth-check" style={{ fontSize: '13px', color: '#cbd5e1', cursor: 'pointer' }}>
            I certify that I am explicitly authorized to perform security scanning and vulnerability assessments against the supplied repositories and web targets.
          </label>
        </div>

        {/* Launch Button */}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={launching}
          style={{ width: '100%', padding: '16px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
        >
          <Play size={20} />
          <span>{launching ? 'Initializing Assessment Pipeline...' : 'Start Security Assessment'}</span>
        </button>
      </form>

      {/* Inline Create Project Modal */}
      {showNewProjModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 8, 15, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="cyber-card" style={{ width: '100%', maxWidth: '520px', background: '#0d1322' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc' }}>
                Create New Project Scope
              </h2>
              <button onClick={() => setShowNewProjModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProjectInline}>
              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Payments Gateway Microservice"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Brief description of application scope"
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Default Repository URL</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://github.com/company/repo"
                  value={newProjRepo}
                  onChange={(e) => setNewProjRepo(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Default Live Web Target URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://app.company.com"
                  value={newProjTarget}
                  onChange={(e) => setNewProjTarget(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowNewProjModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={creatingProj}>
                  {creatingProj ? 'Creating...' : 'Create & Select Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
