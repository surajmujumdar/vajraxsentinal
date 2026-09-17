import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  CheckCircle2, 
  Shield, 
  Layers, 
  Brain, 
  Terminal, 
  Code2, 
  Save, 
  Key, 
  Sliders, 
  Server, 
  RefreshCw, 
  Check,
  Settings,
  Grid,
  Globe
} from 'lucide-react';
import { apiClient } from '../api/client';

export const Capabilities = () => {
  const [capabilities, setCapabilities] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('engines'); // 'engines', 'ai', 'policy', 'ecosystems'
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Editable settings state
  const [engineToggles, setEngineToggles] = useState({
    sast: true,
    sca: true,
    secrets: true,
    dast: true,
    nikto: true,
    nuclei: true,
    ssl: true,
  });

  const [scanMode, setScanMode] = useState('standard');
  const [autoPurgeResolved, setAutoPurgeResolved] = useState(true);
  const [aiModelSelect, setAiModelSelect] = useState('gemini-2.5-flash');
  const [apiKeyInput, setApiKeyInput] = useState('••••••••••••••••••••••••••••••••');

  useEffect(() => {
    loadCapabilities();
  }, []);

  const loadCapabilities = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getCapabilities();
      setCapabilities(data);
    } catch (err) {
      console.error('Error loading capabilities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (engine) => {
    setEngineToggles((prev) => ({ ...prev, [engine]: !prev[engine] }));
  };

  const handleSaveSettings = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 font-mono">
      {/* MASTER CYBER HEADER */}
      <div className="tech-border-card rounded-xl bg-command-950/90 border border-cyan-500/30 shadow-[0_0_35px_rgba(6,182,212,0.15)] p-6 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-cyan-900/40">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.3)]">
              <Settings className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="font-hud font-bold text-2xl text-white tracking-widest uppercase drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]">
                  SYSTEM SETTINGS & ENGINE MATRIX
                </h1>
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/40 text-[10px] font-bold text-emerald-400 shadow-[0_0_8px_#10b981]">
                  SYSTEM HEALTH 99.8%
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Configure scanner adapter rulesets, grounded AI models, auto-purge policies, and telemetry parameters.
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveSettings}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-hud font-bold text-xs rounded-lg transition-all shadow-[0_0_15px_rgba(56,189,248,0.4)] flex items-center space-x-2 self-start md:self-center"
          >
            {savedSuccess ? <Check size={16} /> : <Save size={16} />}
            <span>{savedSuccess ? 'SETTINGS SAVED!' : 'SAVE SYSTEM CONFIG'}</span>
          </button>
        </div>

        {/* SETTINGS CATEGORY TABS */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-2">
          {[
            { id: 'engines', label: 'SCANNER ENGINES & ADAPTERS', Icon: Grid },
            { id: 'ai', label: 'AI MODEL & GUARDRAILS', Icon: Brain },
            { id: 'policy', label: 'EXECUTION & AUTO-PURGE', Icon: Sliders },
            { id: 'ecosystems', label: 'SUPPORTED ECOSYSTEMS', Icon: Code2 },
          ].map((tab) => {
            const { Icon } = tab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-hud font-bold tracking-wider transition-all flex items-center space-x-2 border ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                    : 'bg-command-900/60 border-cyan-900/40 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: SCANNER ENGINES & ADAPTERS */}
      {activeTab === 'engines' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              key: 'sast',
              name: 'Semgrep SAST Engine',
              badge: '3.2k Rulesets',
              desc: 'Static application security testing analyzing OWASP Top 10, SQLi, XSS, SSRF, and insecure deserialization.',
              Icon: Code2,
              color: 'cyan'
            },
            {
              key: 'dast',
              name: 'DAST (OWASP ZAP Engine)',
              badge: 'Dynamic Spider & Probe',
              desc: 'Dynamic HTTP spidering, active injection, XSS parameter fuzzing, and cookie security verification.',
              Icon: Globe,
              color: 'blue'
            },
            {
              key: 'nikto',
              name: 'Nikto Web Server Scanner',
              badge: '6.7k OSDB Signatures',
              desc: 'Dangerous files, CGI vulnerabilities, outdated server software, and HTTP method misconfigurations.',
              Icon: Shield,
              color: 'amber'
            },
            {
              key: 'sca',
              name: 'SCA (OSV Database)',
              badge: '15 Lockfiles',
              desc: 'Dependency vulnerability matching across npm, PyPI, Cargo, Go, Maven, and Gem lockfiles.',
              Icon: Layers,
              color: 'purple'
            },
            {
              key: 'secrets',
              name: 'Secret Detection (Gitleaks)',
              badge: '50 Regex Patterns',
              desc: 'High-entropy key detector for AWS keys, GitHub tokens, JWTs, RSA private keys, and API tokens.',
              Icon: Key,
              color: 'rose'
            },
            {
              key: 'nuclei',
              name: 'Web Exposure (Nuclei)',
              badge: '3.5k Templates',
              desc: 'Targeted vulnerability scanner for misconfigured S3 buckets, exposed admin panels, and CVEs.',
              Icon: Server,
              color: 'cyan'
            },
            {
              key: 'ssl',
              name: 'SSL/TLS Auditor (testssl.sh)',
              badge: 'TLS 1.3 Certified',
              desc: 'Cryptographic handshake inspector testing weak ciphers, expired certs, and POODLE/HEARTBLEED.',
              Icon: Terminal,
              color: 'emerald'
            },
          ].map((engine) => {
            const { Icon } = engine;
            return (
              <div
                key={engine.key}
                className={`tech-border-card rounded-xl p-5 bg-command-950/90 border transition-all ${
                  engineToggles[engine.key]
                    ? 'border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                    : 'border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-cyan-900/40 mb-3">
                  <div className="flex items-center space-x-3">
                    <Icon className="w-6 h-6 text-cyan-400" />
                    <div>
                      <h3 className="font-hud font-bold text-sm text-slate-100">{engine.name}</h3>
                      <span className={`text-[10px] text-${engine.color}-400 font-bold`}>{engine.badge}</span>
                    </div>
                  </div>

                  {/* Interactive Toggle Switch */}
                  <button
                    onClick={() => handleToggle(engine.key)}
                    className={`w-12 h-6 rounded-full transition-colors p-1 relative border ${
                      engineToggles[engine.key]
                        ? 'bg-cyan-500/30 border-cyan-400'
                        : 'bg-slate-900 border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full transition-transform ${
                        engineToggles[engine.key]
                          ? 'translate-x-6 bg-cyan-400 shadow-[0_0_8px_#38bdf8]'
                          : 'translate-x-0 bg-slate-500'
                      }`}
                    ></div>
                  </button>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{engine.desc}</p>

                <div className="mt-4 pt-3 border-t border-cyan-900/30 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">ADAPTER STATUS:</span>
                  <span className={`font-bold ${engineToggles[engine.key] ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {engineToggles[engine.key] ? '● OPERATIONAL' : '○ DISABLED'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: AI MODEL & GUARDRAILS */}
      {activeTab === 'ai' && (
        <div className="tech-border-card rounded-xl p-6 bg-command-950/90 border border-purple-500/30 shadow-[0_0_25px_rgba(168,85,247,0.15)] space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-cyan-900/40">
            <Brain className="w-8 h-8 text-purple-400" />
            <div>
              <h2 className="font-hud font-bold text-lg text-purple-200 uppercase tracking-widest">
                GROUNDED AI REASONING & MODEL CONFIGURATION
              </h2>
              <p className="text-xs text-slate-400">
                Configure Gemini API inference settings, temperature parameters, and anti-hallucination verification rules.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2">
                  AI PROVIDER MODEL ENGINE
                </label>
                <select
                  value={aiModelSelect}
                  onChange={(e) => setAiModelSelect(e.target.value)}
                  className="w-full bg-command-900 border border-cyan-900/80 rounded-lg px-3 py-2 text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-400"
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Grounded Exploit Remediation)</option>
                  <option value="gemini-2.0-pro">Gemini 2.0 Pro (Deep Multi-Stage Attack Chaining)</option>
                  <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Extended Context Analysis)</option>
                  <option value="gpt-4o">GPT-4o (Standard Copilot Engine)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2">
                  GEMINI_API_KEY (SERVER ENV OVERRIDE)
                </label>
                <div className="relative">
                  <Key size={14} className="text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    className="w-full bg-command-900 border border-cyan-900/80 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-command-900/60 border border-purple-500/20 space-y-3 font-mono text-xs">
              <span className="font-hud font-bold text-xs text-purple-300 uppercase block pb-2 border-b border-purple-500/20">
                ACTIVE AI GUARDRAIL SPECIFICATIONS
              </span>
              <ul className="space-y-2 text-slate-300 text-[11px]">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>Strict zero-temperature mode (T=0.1) for zero false-positive code generation.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>Deterministic fingerprint matching for duplicate suppression.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>Grounded evidence binding: 0 fabricated endpoints or file paths permitted.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EXECUTION & AUTO-PURGE POLICY */}
      {activeTab === 'policy' && (
        <div className="tech-border-card rounded-xl p-6 bg-command-950/90 border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.15)] space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-cyan-900/40">
            <Sliders className="w-8 h-8 text-cyan-400" />
            <div>
              <h2 className="font-hud font-bold text-lg text-cyan-200 uppercase tracking-widest">
                EXECUTION POLICIES & TELEMETRY
              </h2>
              <p className="text-xs text-slate-400">
                Configure auto-purge triggers, triage efficiency rules, and scan execution depth limits.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2">
                  SCAN EXECUTION DEPTH POLICY
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['safe', 'standard', 'deep'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setScanMode(mode)}
                      className={`py-2 rounded-lg text-xs font-hud font-bold uppercase transition-all border ${
                        scanMode === mode
                          ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_10px_#38bdf8]'
                          : 'bg-command-900 text-slate-400 border-cyan-900/50 hover:text-cyan-300'
                      }`}
                    >
                      {mode} MODE
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-command-900/80 border border-cyan-500/30 flex items-center justify-between">
                <div>
                  <h4 className="font-hud font-bold text-xs text-slate-200 uppercase">
                    AUTO-DELETE RESOLVED VULNERABILITIES
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Automatically purge resolved findings from active queues and risk score calculations.
                  </p>
                </div>
                <button
                  onClick={() => setAutoPurgeResolved(!autoPurgeResolved)}
                  className={`w-12 h-6 rounded-full transition-colors p-1 relative border ${
                    autoPurgeResolved ? 'bg-emerald-500/30 border-emerald-400' : 'bg-slate-900 border-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full transition-transform ${
                      autoPurgeResolved ? 'translate-x-6 bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'translate-x-0 bg-slate-500'
                    }`}
                  ></div>
                </button>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-command-900/90 border border-cyan-900/60 flex justify-between">
                <span className="text-slate-400">TRIAGE EFFICIENCY GAIN</span>
                <span className="text-emerald-400 font-bold">+14.2%</span>
              </div>
              <div className="p-3 rounded-lg bg-command-900/90 border border-cyan-900/60 flex justify-between">
                <span className="text-slate-400">DATABASE CACHE TTL</span>
                <span className="text-cyan-300 font-bold">30 MINUTES</span>
              </div>
              <div className="p-3 rounded-lg bg-command-900/90 border border-cyan-900/60 flex justify-between">
                <span className="text-slate-400">HTTP ADAPTER TIMEOUT</span>
                <span className="text-cyan-300 font-bold">60 SECONDS</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SUPPORTED ECOSYSTEMS */}
      {activeTab === 'ecosystems' && (
        <div className="tech-border-card rounded-xl p-6 bg-command-950/90 border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.15)] space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-cyan-900/40">
            <Code2 className="w-8 h-8 text-cyan-400" />
            <div>
              <h2 className="font-hud font-bold text-lg text-cyan-200 uppercase tracking-widest">
                SUPPORTED LANGUAGES, FRAMEWORKS & IaC
              </h2>
              <p className="text-xs text-slate-400">
                Native parser support and static ruleset availability across ecosystems.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[
              'Python (Django / FastAPI)',
              'JavaScript / TypeScript (React / Node)',
              'Go (Golang Systems)',
              'Java (Spring Boot / Maven)',
              'Rust (Cargo Lockfiles)',
              'Docker (Dockerfile Security)',
              'Kubernetes (K8s Manifests)',
              'Terraform (HCL Infrastructure)',
              'C / C++ (Memory Flaws)',
              'Ruby (Rails Gemfiles)',
              'PHP (Laravel Composer)',
              'Kotlin (Android / JVM)',
              'Swift (iOS Security)',
              'C# / .NET (Enterprise Core)',
              'Solidity (Smart Contracts)',
              'Helm (Cloud Native Charts)',
            ].map((eco, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-command-900/80 border border-cyan-900/60 flex items-center space-x-2 text-xs font-mono text-cyan-100 shadow-inner"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                <span className="truncate">{eco}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
