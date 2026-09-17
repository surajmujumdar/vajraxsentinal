import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Layers, 
  ShieldCheck, 
  Clock, 
  Trash2, 
  RefreshCw,
  GitBranch,
  Globe,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { apiClient } from '../api/client';

export const Reports = ({ onViewAssessment }) => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getAssessments();
      setAssessments(data);
    } catch (err) {
      console.error('Failed to load assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (e, id, format) => {
    e.stopPropagation();
    const url = apiClient.getExportUrl(id, format);
    window.open(url, '_blank');
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to permanently delete Assessment #${id.slice(0, 8)}? All findings, telemetry, and report files will be removed.`)) {
      return;
    }
    setDeletingId(id);
    try {
      await apiClient.deleteAssessment(id);
      setAssessments(assessments.filter(a => a.id !== id));
    } catch (err) {
      alert(`Failed to delete assessment: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredAssessments = assessments.filter((a) => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'COMPLETED') return a.status === 'COMPLETED';
    if (filterStatus === 'RUNNING') return a.status !== 'COMPLETED' && a.status !== 'FAILED' && a.status !== 'CANCELLED';
    if (filterStatus === 'FAILED') return a.status === 'FAILED' || a.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="title-gradient" style={{ fontSize: '26px', marginBottom: '6px' }}>
            Security Assessments & Audit Reports
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Manage and export multi-engine security audits, review telemetry, and clean up historical scan scopes.
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={loadAssessments}>
          <RefreshCw size={14} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[
          { id: 'ALL', label: 'All Scans' },
          { id: 'COMPLETED', label: 'Completed Reports' },
          { id: 'RUNNING', label: 'In-Progress / Queued' },
          { id: 'FAILED', label: 'Failed / Cancelled' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '700',
              border: filterStatus === tab.id ? '1px solid #00f2fe' : '1px solid #1e293b',
              background: filterStatus === tab.id ? 'rgba(0, 242, 254, 0.12)' : '#090d16',
              color: filterStatus === tab.id ? '#00f2fe' : '#94a3b8',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
            <div className="scanning-pulse" style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#00f2fe', margin: '0 auto 12px' }} />
            <span>Loading assessments archive...</span>
          </div>
        ) : filteredAssessments.length > 0 ? (
          filteredAssessments.map((a) => {
            const isCompleted = a.status === 'COMPLETED';
            const isRunning = a.status !== 'COMPLETED' && a.status !== 'FAILED' && a.status !== 'CANCELLED';
            const isFailed = a.status === 'FAILED' || a.status === 'CANCELLED';

            return (
              <div
                key={a.id}
                className="cyber-card"
                onClick={() => onViewAssessment(a.id)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '18px 20px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#00f2fe'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1e293b'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: isCompleted ? 'rgba(16, 185, 129, 0.15)' : (isFailed ? 'rgba(255, 51, 102, 0.15)' : 'rgba(0, 242, 254, 0.15)'),
                    color: isCompleted ? '#10b981' : (isFailed ? '#ff3366' : '#00f2fe'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {isCompleted ? <CheckCircle2 size={22} /> : (isFailed ? <AlertCircle size={22} /> : <Loader2 size={22} className="scanning-pulse" />)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc' }}>
                        Security Assessment #{a.id.slice(0, 8)}
                      </h3>
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: '#1e293b',
                        color: '#38bdf8',
                        fontWeight: '600'
                      }}>
                        {a.assessment_type?.toUpperCase()}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: isCompleted ? 'rgba(16, 185, 129, 0.15)' : (isFailed ? 'rgba(255, 51, 102, 0.15)' : 'rgba(0, 242, 254, 0.15)'),
                        color: isCompleted ? '#10b981' : (isFailed ? '#ff3366' : '#00f2fe')
                      }}>
                        {a.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      <span>{new Date(a.created_at).toLocaleString()}</span>
                      <span>•</span>
                      <span>{a.total_findings} findings recorded</span>
                      {a.repository_info?.url && (
                        <>
                          <span>•</span>
                          <span style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>{a.repository_info.url}</span>
                        </>
                      )}
                      {a.target_info?.url && (
                        <>
                          <span>•</span>
                          <span style={{ color: '#00f2fe', fontFamily: 'var(--font-mono)' }}>{a.target_info.url}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {isCompleted && (
                    <div style={{ textAlign: 'right', marginRight: '8px' }}>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: '#00f2fe', fontFamily: 'var(--font-mono)' }}>
                        {a.overall_risk_score} / 100
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Risk Score</div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {isCompleted && (
                      <>
                        <button className="btn btn-secondary btn-sm" onClick={(e) => handleExport(e, a.id, 'json')}>
                          <Download size={13} />
                          <span>JSON</span>
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={(e) => handleExport(e, a.id, 'pdf')}>
                          <Download size={13} />
                          <span>PDF</span>
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={(e) => handleExport(e, a.id, 'html')}>
                          <Eye size={13} />
                          <span>HTML</span>
                        </button>
                      </>
                    )}

                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => handleDelete(e, a.id)}
                      disabled={deletingId === a.id}
                      title="Delete assessment"
                      style={{
                        padding: '6px 10px',
                        background: 'rgba(255, 51, 102, 0.1)',
                        border: '1px solid rgba(255, 51, 102, 0.3)',
                        color: '#ff3366'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="cyber-card" style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
            No assessments found matching the current filter.
          </div>
        )}
      </div>
    </div>
  );
};
