import React, { useEffect, useRef } from 'react';
import { X, CheckCircle2, AlertCircle, Loader2, Terminal, Shield, ArrowRight } from 'lucide-react';

const ALL_STAGES = [
  { key: 'INITIALIZING', label: 'Init', type: 'common' },
  { key: 'CLONING', label: 'Source', type: 'code' },
  { key: 'SAST_RUNNING', label: 'SAST', type: 'code' },
  { key: 'SCA_RUNNING', label: 'SCA', type: 'code' },
  { key: 'SECRET_SCAN_RUNNING', label: 'Secrets', type: 'code' },
  { key: 'DAST_RUNNING', label: 'DAST', type: 'dast' },
  { key: 'SSL_RUNNING', label: 'SSL', type: 'dast' },
  { key: 'NORMALIZING', label: 'Normalize', type: 'common' },
  { key: 'CORRELATING', label: 'Correlate', type: 'common' },
  { key: 'AI_ANALYSIS', label: 'AI Risk', type: 'common' },
  { key: 'COMPLETED', label: 'Report', type: 'common' }
];

export const ScanProgressModal = ({ assessment, onClose, onCancel, onViewDetails }) => {
  const terminalRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [assessment?.logs]);

  if (!assessment) return null;

  const currentStatus = assessment.status;
  const isCompleted = currentStatus === 'COMPLETED';
  const isFailed = currentStatus === 'FAILED';
  const isCancelled = currentStatus === 'CANCELLED';
  const aType = assessment.assessment_type || 'combined';

  // Filter stages based on assessment type
  const activeStages = ALL_STAGES.filter(st => {
    if (st.type === 'common') return true;
    if (aType === 'repo' || aType === 'source') return st.type === 'code';
    if (aType === 'dast') return st.type === 'dast';
    return true; // combined
  });

  const getStageIndex = (status) => {
    const idx = activeStages.findIndex(s => s.key === status);
    if (idx !== -1) return idx;
    if (status === 'DISCOVERING') return 1;
    if (status === 'GENERATING_REPORT') return activeStages.length - 2;
    return isCompleted ? activeStages.length - 1 : 0;
  };

  const activeStageIdx = getStageIndex(currentStatus);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 8, 15, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="cyber-card cyber-card-glow" style={{
        width: '100%',
        maxWidth: '780px',
        background: '#0c1322',
        border: '1px solid #1e293b',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #1e293b',
          paddingBottom: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(0, 242, 254, 0.15)',
              color: '#00f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isCompleted ? <CheckCircle2 size={18} color="#10b981" /> : (isFailed ? <AlertCircle size={18} color="#ff3366" /> : <Loader2 size={18} className="scanning-pulse" />)}
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc' }}>
                {isCompleted ? 'Assessment Completed' : (isFailed ? 'Assessment Failed' : 'Security Assessment in Progress')}
              </h3>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                ID: {assessment.id.slice(0, 8)}... • Type: {assessment.assessment_type?.toUpperCase()}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Stepper */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          padding: '12px',
          background: '#070a12',
          borderRadius: '10px',
          border: '1px solid #1e293b'
        }}>
          {activeStages.map((st, idx) => {
            const isDone = activeStageIdx > idx || isCompleted;
            const isCurrent = activeStageIdx === idx && !isCompleted;
            return (
              <div key={st.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: isDone ? '#10b981' : (isCurrent ? '#00f2fe' : '#1e293b'),
                  color: isDone || isCurrent ? '#000' : '#64748b',
                  fontSize: '10px',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isCurrent ? '0 0 12px #00f2fe' : 'none'
                }}>
                  {isDone ? '✓' : idx + 1}
                </div>
                <span style={{
                  fontSize: '10px',
                  fontWeight: isCurrent ? '700' : '500',
                  color: isCurrent ? '#00f2fe' : (isDone ? '#e2e8f0' : '#475569')
                }}>
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Terminal Log Stream */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
            <Terminal size={14} color="#38bdf8" />
            <span>Execution Log Stream</span>
          </div>
          <div ref={terminalRef} className="terminal-window">
            {assessment.logs?.map((log, i) => (
              <div key={i} className="terminal-line">
                <span className="terminal-time">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                <span style={{ color: '#00f2fe', fontWeight: '600' }}>[{log.stage}]</span>
                <span style={{ color: '#e2e8f0' }}>{log.message}</span>
              </div>
            ))}
            {!isCompleted && !isFailed && (
              <div className="terminal-line" style={{ color: '#64748b' }}>
                <span className="terminal-time">[{new Date().toLocaleTimeString()}]</span>
                <span style={{ color: '#00f2fe' }}>... processing scan tasks</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          {!isCompleted && !isFailed && !isCancelled && (
            <button className="btn btn-danger btn-sm" onClick={onCancel}>
              Cancel Scan
            </button>
          )}
          {isCompleted && (
            <button className="btn btn-primary" onClick={onViewDetails} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>View Full Assessment & Findings</span>
              <ArrowRight size={16} />
            </button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
