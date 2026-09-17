import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Shield, 
  FileCode, 
  Globe, 
  Layers, 
  ArrowUpDown, 
  CheckCircle, 
  Trash2,
  Compass,
  AlertTriangle,
  Grid,
  Wand2,
  CheckCircle2,
  Sparkles,
  Check,
  RefreshCw,
  RotateCcw
} from 'lucide-react';
import { apiClient } from '../api/client';
import { SeverityBadge } from '../components/SeverityBadge';
import { FindingDrawer } from '../components/FindingDrawer';

export const FindingsExplorer = ({ initialSource = '' }) => {
  const [findings, setFindings] = useState([]);
  const [totalOpenFindings, setTotalOpenFindings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('');
  const [source, setSource] = useState(initialSource);
  const [statusFilter, setStatusFilter] = useState('open'); // Default to open
  const [limit, setLimit] = useState(250);

  useEffect(() => {
    setSource(initialSource);
  }, [initialSource]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const dash = await apiClient.getDashboard();
        if (dash && typeof dash.open_findings === 'number') {
          setTotalOpenFindings(dash.open_findings);
        }
      } catch (e) {
        // ignore
      }
    };
    fetchSummary();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadFindings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.getFindings({
        search: search ? search.trim() : undefined,
        severity: severity || undefined,
        source: source || undefined,
        status: statusFilter === 'all' ? undefined : (statusFilter || undefined),
        limit: limit || 250,
      });
      // Handle both paginated { items: [] } and raw array responses
      const items = res?.items || (Array.isArray(res) ? res : []);
      setFindings(items);
      if (statusFilter === 'open' && !search && !severity && !source) {
        setTotalOpenFindings(items.length);
      }
    } catch (err) {
      console.error('Error loading findings:', err);
      setError(err.message || 'Failed to connect to security database.');
      setFindings([]);
    } finally {
      setLoading(false);
    }
  }, [search, severity, source, statusFilter, limit]);

  useEffect(() => {
    loadFindings();
  }, [loadFindings]);

  // Listen to platform scan updates and auto-refresh
  useEffect(() => {
    const handleRefresh = () => loadFindings();
    window.addEventListener('sentinal_findings_updated', handleRefresh);
    window.addEventListener('focus', handleRefresh);
    return () => {
      window.removeEventListener('sentinal_findings_updated', handleRefresh);
      window.removeEventListener('focus', handleRefresh);
    };
  }, [loadFindings]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadFindings();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSeverity('');
    setSource('');
    setStatusFilter('open');
    setLimit(250);
  };

  const handleQuickResolve = async (e, f) => {
    e.stopPropagation();
    const id = f.id;
    const title = f.title;
    const itemSource = f.source;
    setResolvingId(id);

    // Optimistic removal from active list
    setFindings((prev) => prev.filter((item) => item.id !== id));
    showToast(`Vulnerability resolved & purged: ${title || 'Finding'}`);

    // Instantly notify sidebar and dashboard listeners with source detail
    window.dispatchEvent(new CustomEvent('sentinal_findings_updated', { detail: { id, source: itemSource } }));

    try {
      await apiClient.updateFindingStatus(id, 'resolved');
    } catch (err) {
      console.error('Failed to resolve finding on backend:', err);
      // Fallback reload if failed
      loadFindings();
      window.dispatchEvent(new CustomEvent('sentinal_findings_updated'));
    } finally {
      setResolvingId(null);
    }
  };

  const displayOpenCount = (statusFilter === 'open' && !search && !severity && !source && totalOpenFindings !== null)
    ? totalOpenFindings
    : findings.length;

  return (
    <div className="space-y-6 animate-fade-in pb-12 relative">
      {/* FLOATING HUD TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 animate-bounce-short">
          <div className="bg-command-900/95 border border-emerald-400/80 rounded-xl px-4 py-3 shadow-[0_0_25px_rgba(16,185,129,0.4)] backdrop-blur-md flex items-center space-x-3 text-emerald-300 font-mono text-xs">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center flex-shrink-0">
              <Check className="w-3.5 h-3.5 text-emerald-300" />
            </div>
            <div>
              <div className="font-hud font-bold text-white tracking-wider text-[11px]">STATUS REFLECTED</div>
              <div className="text-emerald-200/90 text-[10px] mt-0.5">{toastMessage}</div>
            </div>
          </div>
        </div>
      )}

      {/* MASTER CYBER HUD BARS */}
      <div className="tech-border-card rounded-xl bg-command-950/90 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] p-5 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-cyan-900/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_12px_rgba(56,189,248,0.3)]">
              <Compass className="w-6 h-6 text-cyan-400" />
            </div>
              <div>
                <h1 className="font-hud font-bold text-xl text-white tracking-widest uppercase drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]">
                  FINDINGS EXPLORER
                </h1>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Multi-engine vulnerability explorer • Automatic auto-purge on resolution
                </p>
              </div>
          </div>
        </div>

        {/* Metric Ticker */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 font-mono">
          <div className="p-3 rounded-lg bg-command-900/80 border border-rose-500/30 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">TRIAGE QUEUE</div>
              <div className="text-lg font-hud font-bold text-rose-400 mt-0.5">
                {statusFilter === 'resolved' 
                  ? `${findings.length} RESOLVED` 
                  : `${displayOpenCount} OPEN FINDINGS`}
              </div>
            </div>
            <AlertTriangle className="w-6 h-6 text-rose-400/80" />
          </div>

          <div className="p-3 rounded-lg bg-command-900/80 border border-cyan-500/30 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">MONITORED ENGINES</div>
              <div className="text-lg font-hud font-bold text-cyan-300 mt-0.5">6 ACTIVE ADAPTERS</div>
            </div>
            <Grid className="w-6 h-6 text-cyan-400/80" />
          </div>

          <div className="p-3 rounded-lg bg-command-900/80 border border-emerald-500/30 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">AUTO RESOLUTION ENGINE</div>
              <div className="text-lg font-hud font-bold text-emerald-400 mt-0.5">AUTO-PURGE ON RESOLVE</div>
            </div>
            <Trash2 className="w-6 h-6 text-emerald-400/80" />
          </div>
        </div>
      </div>

      {/* SEARCH & HUD FILTERS TOOLBAR */}
      <div className="tech-border-card rounded-xl bg-command-950/90 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)] p-4 backdrop-blur-md">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              className="w-full bg-command-900/90 border border-cyan-900/60 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              placeholder="Search title, file, CVE, CWE, endpoint..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <select
              className="w-full bg-command-900/90 border border-cyan-900/60 rounded-lg px-3 py-2 text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-400"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            >
              <option value="">ALL SEVERITIES</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              className="w-full bg-command-900/90 border border-cyan-900/60 rounded-lg px-3 py-2 text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-400"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              <option value="">ALL ENGINES & SOURCES</option>
              <option value="SAST">SAST (Semgrep / Static)</option>
              <option value="SCA">SCA (OSV Database)</option>
              <option value="SECRETS">Secret Detection</option>
              <option value="DAST">DAST (ZAP Spider)</option>
              <option value="WEB">Web (Nuclei Templates)</option>
              <option value="SSL">SSL / TLS Auditor</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              className="w-full bg-command-900/90 border border-cyan-900/60 rounded-lg px-3 py-2 text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-400"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="open">OPEN STATUS ONLY</option>
              <option value="resolved">RESOLVED ONLY</option>
              <option value="all">ALL STATUSES</option>
            </select>
          </div>

          <div className="md:col-span-2 flex items-center space-x-2">
            <button
              type="submit"
              className="flex-1 py-2 bg-cyan-500/20 border border-cyan-400/60 hover:bg-cyan-500 hover:text-black text-cyan-300 font-hud font-bold text-xs rounded-lg transition-colors shadow-[0_0_10px_rgba(56,189,248,0.3)] flex items-center justify-center space-x-1"
            >
              <Search className="w-3.5 h-3.5" />
              <span>SEARCH</span>
            </button>
            {(search || severity || source || statusFilter !== 'open') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-2.5 py-2 bg-rose-500/10 border border-rose-500/40 hover:bg-rose-500/25 text-rose-300 rounded-lg text-xs font-mono font-bold transition-all flex items-center space-x-1"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RESET</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* HUD DATA TABLE */}
      <div className="tech-border-card rounded-xl bg-command-950/90 border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.15)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-command-900/90 border-b border-cyan-900/60 text-[11px] font-hud tracking-wider text-cyan-300 uppercase">
                <th className="py-3 px-4">SEVERITY</th>
                <th className="py-3 px-4">ENGINE</th>
                <th className="py-3 px-4">VULNERABILITY & CATEGORY</th>
                <th className="py-3 px-4">TARGET FILE / ENDPOINT</th>
                <th className="py-3 px-4">RISK SCORE</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-900/30 text-xs font-mono">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400">
                    <span className="inline-block w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mr-3 align-middle"></span>
                    <span className="text-cyan-300 font-hud tracking-wider">Querying Unified Engine Database...</span>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-rose-400 font-mono">
                    <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
                    <div className="font-bold text-sm mb-1">{error}</div>
                    <p className="text-xs text-slate-400 mb-4">Ensure the unified backend is active on port 8000.</p>
                    <button
                      onClick={() => loadFindings()}
                      className="px-4 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/60 text-cyan-300 hover:bg-cyan-500 hover:text-black font-hud text-xs font-bold transition-all shadow-[0_0_12px_rgba(56,189,248,0.3)] inline-flex items-center space-x-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>RETRY CONNECTION</span>
                    </button>
                  </td>
                </tr>
              ) : findings.length > 0 ? (
                findings.map((f) => (
                  <tr
                    key={f.id}
                    onClick={() => setSelectedFinding(f)}
                    className="hover:bg-cyan-950/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4">
                      <SeverityBadge severity={f.severity} size="small" />
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-command-900 border border-cyan-500/30 text-cyan-300 text-[10px]">
                        {f.source}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-hud font-bold text-slate-200 group-hover:text-cyan-200 transition-colors">
                        {f.title}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{f.category}</div>
                    </td>
                    <td className="py-3 px-4 text-cyan-300 text-[11px]">
                      {f.file ? `${f.file}:${f.line || 1}` : (f.endpoint || '-')}
                    </td>
                    <td className="py-3 px-4 font-bold text-cyan-400">
                      {f.risk_score} / 100
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFinding(f);
                        }}
                        className="px-2.5 py-1 rounded bg-purple-500/20 border border-purple-400/50 text-[10px] font-bold text-purple-300 hover:bg-purple-500 hover:text-white transition-all shadow-[0_0_8px_rgba(168,85,247,0.3)] flex items-center space-x-1 inline-flex"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>AI REMEDY</span>
                      </button>

                      <button
                        onClick={(e) => handleQuickResolve(e, f)}
                        disabled={resolvingId === f.id}
                        className="px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-400/50 text-[10px] font-bold text-emerald-300 hover:bg-emerald-500 hover:text-black transition-all shadow-[0_0_8px_rgba(16,185,129,0.3)] flex items-center space-x-1 inline-flex cursor-pointer"
                      >
                        <CheckCircle size={12} />
                        <span>{resolvingId === f.id ? 'RESOLVING...' : 'RESOLVE & DELETE'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-mono">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <div className="text-sm font-hud text-slate-300 mb-1">No findings matching active filter</div>
                    <p className="text-xs text-slate-500 mb-4">
                      {statusFilter === 'resolved' 
                        ? 'No resolved findings stored in history.' 
                        : (source || severity || search)
                          ? `No matches for ${source ? `Source: ${source}` : ''} ${severity ? `Severity: ${severity}` : ''} ${search ? `Search: "${search}"` : ''}`
                          : 'All security findings have been resolved and purged from the triage queue.'}
                    </p>
                    {(search || severity || source || statusFilter !== 'open') && (
                      <button
                        onClick={handleResetFilters}
                        className="px-4 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/60 text-cyan-300 hover:bg-cyan-500 hover:text-black font-hud text-xs font-bold transition-all shadow-[0_0_10px_rgba(56,189,248,0.2)] inline-flex items-center space-x-2"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>RESET ALL FILTERS</span>
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* Detail Drawer */}
      <FindingDrawer
        finding={selectedFinding}
        onClose={() => setSelectedFinding(null)}
        onStatusUpdated={(id, newStatus) => {
          showToast(`Finding status updated to ${newStatus.toUpperCase()}`);
          if (newStatus === 'resolved') {
            setFindings((prev) => prev.filter((item) => item.id !== id));
            setSelectedFinding(null);
          }
          loadFindings();
        }}
      />
    </div>
  );
};
