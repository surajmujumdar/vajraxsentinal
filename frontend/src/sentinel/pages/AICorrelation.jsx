import React, { useState } from 'react';
import { Wand2, CheckCircle2, Copy, Check, Loader2, Sparkles } from 'lucide-react';

export const AICorrelation = () => {
  const [executingFix, setExecutingFix] = useState(null);
  const [fixedRemedies, setFixedRemedies] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [deletedIds, setDeletedIds] = useState([]);

  const remedies = [
    {
      id: 'rem-1',
      number: 'REMEDY #1',
      title: 'Ingress Controller Remote Code Execution (RCE)',
      severity: 'CRITICAL RCE',
      severityColor: 'rose',
      vector: 'CVE-2024-38092 • NGINX Ingress',
      target: 'sentinel-edge-ingress (K8s Pod)',
      confidence: '99.8%',
      description: 'AI Neural model detected unauthenticated body parsing leading to arbitrary memory write in edge ingress.',
      aiFixSummary: 'Upgrade ingress-nginx to v1.25.4, enable request body schema validation, and set readOnlyRootFilesystem: true.',
      codeSnippet: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: sentinel-edge-ingress
spec:
  template:
    spec:
      containers:
      - name: nginx-ingress
        image: registry.sentinel.internal/nginx-ingress:v1.25.4
        securityContext:
          readOnlyRootFilesystem: true
          allowPrivilegeEscalation: false`,
    },
    {
      id: 'rem-2',
      number: 'REMEDY #2',
      title: 'Plaintext AWS Access Key Exposure',
      severity: 'SECRET LEAK',
      severityColor: 'rose',
      vector: 'CWE-798 • Git Repository Leak',
      target: 'k8s/vault-connector.yaml:L14',
      confidence: '100%',
      description: 'Exposed AWS Access Key AKIA...87X discovered in repository history. Immediate revocation required.',
      aiFixSummary: 'Revoke IAM credentials via AWS API, inject HashiCorp Vault Secrets Operator, and purge commit history.',
      codeSnippet: `# Step 1: Revoke exposed IAM key
aws iam update-access-key --access-key-id AKIA238947823 --status Inactive

# Step 2: Inject Vault Secrets Operator
apiVersion: secrets.hashicorp.com/v1beta1
kind: VaultStaticSecret
metadata:
  name: aws-vault-secret
spec:
  mount: kv-v2
  path: cloud/aws-credentials`,
    },
    {
      id: 'rem-3',
      number: 'REMEDY #3',
      title: 'Broken Object Level Authorization (BOLA)',
      severity: 'HIGH DAST',
      severityColor: 'amber',
      vector: 'API-01:2023 • /api/v1/users/{id}/billing',
      target: 'services/billing/routes.py:L89',
      confidence: '98.5%',
      description: 'Direct object reference allows any authenticated tenant to retrieve billing records of other tenants.',
      aiFixSummary: 'Inject tenant context validator decorator @require_tenant_access and verify org_id in JWT claims.',
      codeSnippet: `@router.get("/users/{user_id}/billing")
@require_tenant_access(scope="billing:read")
async def get_user_billing(
    user_id: str, 
    current_user: User = Depends(get_current_user)
):
    # Verify tenant ownership
    if current_user.tenant_id != get_tenant_for_user(user_id):
        raise HTTPException(status_code=403, detail="Cross-tenant access forbidden")
    return await billing_service.get_records(user_id)`,
    },
  ];

  const handleCopyCode = (id, code) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApplyFix = (id) => {
    setExecutingFix(id);
    setTimeout(() => {
      setExecutingFix(null);
      setFixedRemedies((prev) => [...prev, id]);
      // After 2.5 seconds, auto-purge the fixed remedy from the threat graph
      setTimeout(() => {
        setDeletedIds((prev) => [...prev, id]);
      }, 2500);
    }, 1800);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="tech-border-card rounded-xl bg-command-950/90 border border-purple-500/30 shadow-[0_0_35px_rgba(168,85,247,0.15)] p-6 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-cyan-900/40">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-400/40 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <Sparkles className="w-7 h-7 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-hud font-bold text-2xl text-white tracking-widest uppercase drop-shadow-[0_0_12px_rgba(168,85,247,0.6)]">
                  AI RISK CORRELATION & REMEDY PLAYBOOKS
                </h1>
                <span className="px-2 py-0.5 rounded bg-purple-500/20 border border-purple-400/40 text-[10px] font-mono font-bold text-purple-300">
                  GEMINI 2.0 FLASH POWERED
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Cross-engine finding deduplication, multi-stage attack chaining & automated pull-request remediation
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]"></span>
            <span className="text-xs text-emerald-400 font-bold">NEURAL HEURISTIC ENGINE ACTIVE</span>
          </div>
        </div>

        {/* AI Correlation Highlights Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 font-mono text-center">
          <div className="p-3 rounded-lg bg-command-900/80 border border-cyan-900/50">
            <span className="text-white font-hud font-bold text-lg">3 ATTACK CHAINS</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">SYNTHESIZED GRAPHS</span>
          </div>
          <div className="p-3 rounded-lg bg-command-900/80 border border-purple-500/30">
            <span className="text-purple-300 font-hud font-bold text-lg">99.4% CONF</span>
            <span className="text-[10px] text-purple-400/80 block mt-0.5">EXPLOIT PROBABILITY</span>
          </div>
          <div className="p-3 rounded-lg bg-command-900/80 border border-emerald-500/30">
            <span className="text-emerald-400 font-hud font-bold text-lg">3 PLAYBOOKS</span>
            <span className="text-[10px] text-emerald-400/80 block mt-0.5">ZERO-TOUCH REMEDIES</span>
          </div>
          <div className="p-3 rounded-lg bg-command-900/80 border border-cyan-900/50">
            <span className="text-cyan-300 font-hud font-bold text-lg">-84.2%</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">ROOT CAUSE DEDUP</span>
          </div>
        </div>
      </div>

      {/* Main Remedies List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between font-mono">
          <div className="flex items-center space-x-2">
            <Wand2 className="w-4 h-4 text-amber-400" />
            <h2 className="font-hud font-bold text-sm text-slate-200 tracking-wider uppercase">
              RECOMMENDED AI FIX REMEDIES & CODE PLAYBOOKS
            </h2>
          </div>
          <span className="text-xs text-cyan-400/80">CLICK "APPLY FIX" TO AUTOMATICALLY PATCH CODEBASE</span>
        </div>

        <div className="space-y-4">
          {remedies.filter((rem) => !deletedIds.includes(rem.id)).length === 0 ? (
            <div className="tech-border-card rounded-xl p-8 bg-command-950/90 border border-emerald-500/40 text-center font-mono space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
              <h3 className="text-lg font-hud font-bold text-emerald-300">ALL VULNERABILITIES AUTOMATICALLY RESOLVED & DELETED</h3>
              <p className="text-xs text-slate-400">Threat graph contains 0 active critical vulnerabilities. All automated fix playbooks executed successfully.</p>
            </div>
          ) : (
            remedies.filter((rem) => !deletedIds.includes(rem.id)).map((rem) => {
              const isFixed = fixedRemedies.includes(rem.id);
              const isExecuting = executingFix === rem.id;

              return (
                <div
                  key={rem.id}
                  className={`tech-border-card rounded-xl p-5 transition-all duration-300 ${
                    isFixed
                      ? 'bg-command-950/60 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                      : 'bg-command-950/90 border-purple-500/30 hover:border-purple-400/60 shadow-[0_0_20px_rgba(139,92,246,0.1)]'
                  }`}
                >
                  {/* Remedy Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cyan-900/40">
                    <div className="flex items-center space-x-3">
                      <span className="px-2.5 py-1 rounded bg-purple-500/20 border border-purple-400/50 text-xs font-mono font-bold text-purple-300">
                        {rem.number}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border bg-${rem.severityColor}-500/20 text-${rem.severityColor}-300 border-${rem.severityColor}-500/40`}>
                        {rem.severity}
                      </span>
                      <span className="text-xs font-mono text-cyan-400">
                        CONFIDENCE: <strong className="text-emerald-400">{rem.confidence}</strong>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCopyCode(rem.id, rem.codeSnippet)}
                        className="px-3 py-1.5 rounded-lg bg-command-900 border border-cyan-500/30 text-xs font-mono text-cyan-300 hover:bg-cyan-950 hover:border-cyan-400 transition-colors flex items-center space-x-1.5"
                      >
                        {copiedId === rem.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === rem.id ? 'COPIED!' : 'COPY FIX CODE'}</span>
                      </button>

                      <button
                        disabled={isFixed || isExecuting}
                        onClick={() => handleApplyFix(rem.id)}
                        className={`px-4 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center space-x-2 shadow-lg ${
                          isFixed
                            ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-300 cursor-default'
                            : isExecuting
                            ? 'bg-amber-500/20 border border-amber-400 text-amber-300 cursor-wait animate-pulse'
                            : 'bg-gradient-to-r from-purple-600 to-cyan-600 border border-purple-400 text-white hover:from-purple-500 hover:to-cyan-500 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                        }`}
                      >
                        {isFixed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        ) : isExecuting ? (
                          <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                        ) : (
                          <Wand2 className="w-4 h-4 text-white" />
                        )}
                        <span>
                          {isFixed ? 'REMEDY APPLIED' : isExecuting ? 'PATCHING...' : 'APPLY AUTOMATED FIX →'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Remedy Body */}
                  <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5 font-mono text-xs">
                    {/* Left Specs */}
                    <div className="lg:col-span-5 space-y-3">
                      <div>
                        <h3 className="text-sm font-bold text-white font-hud tracking-wide">{rem.title}</h3>
                        <p className="text-slate-400 text-xs mt-1 leading-relaxed">{rem.description}</p>
                      </div>

                      <div className="p-3 rounded-lg bg-command-900/90 border border-cyan-900/40 space-y-1.5 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400">VECTOR:</span>
                          <span className="text-cyan-300 font-bold">{rem.vector}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">TARGET:</span>
                          <span className="text-purple-300 font-bold truncate max-w-[200px]">{rem.target}</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-purple-950/40 border border-purple-500/30 text-purple-200">
                        <span className="font-bold block text-[10px] text-purple-400 uppercase tracking-wider mb-1">
                          AI REMEDIATION PLAN:
                        </span>
                        <p className="text-xs leading-relaxed text-slate-300">{rem.aiFixSummary}</p>
                      </div>
                    </div>

                    {/* Right Code Box */}
                    <div className="lg:col-span-7">
                      <div className="flex items-center justify-between px-3 py-2 bg-command-900/90 border border-cyan-900/60 rounded-t-lg text-[10px] text-cyan-400 font-bold">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                          <span>GENERATED FIX PATCH CODE</span>
                        </div>
                        <span className="text-slate-500">GEMINI AI VERIFIED</span>
                      </div>
                      <pre className="p-3.5 bg-command-950 border border-t-0 border-cyan-900/60 rounded-b-lg text-[11px] text-cyan-200 overflow-x-auto hud-scrollbar font-mono leading-relaxed">
                        <code>{rem.codeSnippet}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
