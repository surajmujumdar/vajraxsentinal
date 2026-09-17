'use client'
import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  X,
  ExternalLink,
  RotateCw,
  ChevronRight,
  Shield,
  Activity,
  Terminal
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';

export function GlobalFailureNotification({ onInspectFailure }) {
  const [notifications, setNotifications] = useState([]);
  const prevStatusesRef = useRef(new Map());
  const isInitialLoadRef = useRef(true);

  // Play subtle tactical cyber sound (safe Web Audio API fallback)
  const playAlertSound = () => {
    try {
      if (typeof window === 'undefined') return;
      if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.close().catch(() => {});
        return;
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.28);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
      setTimeout(() => { ctx.close().catch(() => {}); }, 400);
    } catch (e) {
      // Audio autoplay policy or unavailable
    }
  };

  const addNotification = (assessment) => {
    if (!assessment || !assessment.id) return;
    setNotifications(prev => {
      // Check if already in active notifications
      if (prev.some(n => n.id === assessment.id)) return prev;
      playAlertSound();
      return [
        {
          ...assessment,
          notifKey: `${assessment.id}-${Date.now()}`,
          addedAt: Date.now()
        },
        ...prev
      ];
    });
  };

  const removeNotification = (notifKey) => {
    setNotifications(prev => prev.filter(n => n.notifKey !== notifKey));
  };

  useEffect(() => {
    let isMounted = true;

    async function checkAssessments() {
      try {
        const data = await dashboardService.getAssessments();
        if (!isMounted || !data) return;

        if (isInitialLoadRef.current) {
          // Record initial statuses so we only alert on newly failed scans
          const initMap = new Map();
          for (const asm of data) {
            initMap.set(asm.id, asm.status);
          }
          prevStatusesRef.current = initMap;
          isInitialLoadRef.current = false;
          return;
        }

        // Detect transition from in-flight to FAILED or DAST COVERAGE FAILED
        for (const asm of data) {
          const prevStatus = prevStatusesRef.current.get(asm.id);
          const wasRunning = prevStatus === 'RUNNING' || prevStatus === 'QUEUED' || (typeof prevStatus === 'string' && prevStatus.includes('RUNNING'));
          const isFailed = asm.status === 'FAILED' || asm.coverageStatus === 'FAILED' || (asm.coverageStatus === 'LIMITED COVERAGE' && asm.dastCoverageScore === 0);
          
          if (wasRunning && isFailed) {
            addNotification(asm);
          }
        }

        // Update map
        const newMap = new Map();
        for (const asm of data) {
          newMap.set(asm.id, asm.status);
        }
        prevStatusesRef.current = newMap;
      } catch (err) {
        console.warn('Error checking scan failures for notification:', err);
      }
    }

    checkAssessments();
    const unsubscribe = dashboardService.subscribe(checkAssessments);
    const interval = setInterval(checkAssessments, 15000);

    // Custom event listener for instant notification trigger
    const handleCustomFailureEvent = (e) => {
      if (e.detail) {
        addNotification(e.detail);
      }
    };
    window.addEventListener('sentinal:scan_failed', handleCustomFailureEvent);

    return () => {
      isMounted = false;
      unsubscribe();
      clearInterval(interval);
      window.removeEventListener('sentinal:scan_failed', handleCustomFailureEvent);
    };
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '56px',
        right: '20px',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '440px',
        width: 'calc(100vw - 40px)',
        pointerEvents: 'none'
      }}
    >
      {notifications.map((notif) => (
        <FailureToastCard
          key={notif.notifKey}
          notification={notif}
          onClose={() => removeNotification(notif.notifKey)}
          onInspect={() => {
            if (onInspectFailure) onInspectFailure(notif);
            removeNotification(notif.notifKey);
          }}
        />
      ))}
    </div>
  );
}

function FailureToastCard({ notification, onClose, onInspect }) {
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);
  const duration = 16000; // 16 seconds auto-dismiss
  const startTimeRef = useRef(Date.now());

  const isCoverageFailed = notification.coverageStatus === 'FAILED' || (notification.coverageStatus === 'LIMITED COVERAGE' && notification.dastCoverageScore === 0);
  const failure = notification.failureReason || {};
  const errorCode = failure.error_code || (isCoverageFailed ? 'ERR_DAST_COVERAGE_FAILED' : 'ERR_SCAN_FAILED');
  const bannerText = isCoverageFailed ? 'DAST COVERAGE FAILED' : 'SCAN EXECUTION FAILED';
  const title = failure.title || (isCoverageFailed ? 'DAST Target Coverage Blocked / Unreachable' : 'Security Scan Failed');
  const summary = failure.summary || notification.errorMessage || (isCoverageFailed ? 'DAST crawler was unable to audit target (0% coverage achieved / host unreachable).' : 'Scan execution encountered an unexpected connection or engine failure.');
  const failedStage = failure.failed_stage || (isCoverageFailed ? 'DAST COVERAGE & REACHABILITY' : 'EXECUTION PIPELINE');
  const target = notification.target || failure.target_url || 'Target Application';

  useEffect(() => {
    let timer;
    if (!isHovered) {
      const interval = 100;
      timer = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(remaining);
        if (remaining <= 0) {
          clearInterval(timer);
          onClose();
        }
      }, interval);
    }
    return () => clearInterval(timer);
  }, [isHovered, onClose]);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        startTimeRef.current = Date.now() - (1 - progress / 100) * duration;
      }}
      style={{
        pointerEvents: 'auto',
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(20, 2, 8, 0.98) 0%, rgba(10, 0, 14, 0.98) 100%)',
        border: '2.5px solid #ff1744',
        borderRadius: '10px',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.95), 0 0 30px rgba(255, 23, 68, 0.65)',
        backdropFilter: 'blur(16px)',
        overflow: 'hidden',
        animation: 'slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}
    >
      {/* Top red neon pulse accent line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #ff1744 0%, #ff5252 50%, #ff1744 100%)',
          boxShadow: '0 0 10px #ff1744'
        }}
      />

      {/* Main Toast Content */}
      <div style={{ padding: '14px 16px 12px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                background: 'rgba(255, 23, 68, 0.25)',
                border: '1.5px solid #ff1744',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 0 12px rgba(255, 23, 68, 0.5)'
              }}
            >
              <AlertTriangle size={16} color="#ff1744" />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.8px', fontFamily: 'var(--font-mono)' }}>
                  {bannerText}
                </span>
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 900,
                    fontFamily: 'var(--font-mono)',
                    color: '#ff1744',
                    background: 'rgba(255, 23, 68, 0.25)',
                    border: '1px solid #ff1744',
                    padding: '1px 5px',
                    borderRadius: '3px'
                  }}
                >
                  {errorCode}
                </span>
              </div>
              <div style={{ fontSize: '10px', color: '#fda4af', fontWeight: 600, marginTop: '1px' }}>
                Stage: {failedStage}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; }}
            title="Dismiss notification"
          >
            <X size={15} />
          </button>
        </div>

        {/* Target & Summary */}
        <div style={{ marginTop: '10px', padding: '8px 10px', background: 'rgba(5, 0, 8, 0.8)', borderRadius: '6px', border: '1px solid #28081c' }}>
          <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Target: <span style={{ color: '#f8fafc', fontWeight: 800 }}>{target}</span>
          </div>
          <div style={{ fontSize: '11.5px', color: '#e2e8f0', marginTop: '4px', lineHeight: 1.4 }}>
            {summary}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid #360a25',
              borderRadius: '5px',
              padding: '5px 10px',
              color: '#cbd5e1',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
          >
            Dismiss
          </button>

          <button
            onClick={onInspect}
            style={{
              background: 'linear-gradient(90deg, #ff1744 0%, #d50000 100%)',
              border: '1.5px solid #ff1744',
              borderRadius: '5px',
              padding: '5px 14px',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 0 16px rgba(255, 23, 68, 0.65)',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 0 22px rgba(255, 23, 68, 0.9)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 16px rgba(255, 23, 68, 0.65)'; }}
          >
            <ShieldAlert size={13} />
            <span>Inspect Diagnostics & Fix</span>
          </button>
        </div>
      </div>

      {/* Auto-dismiss progress bar */}
      <div style={{ height: '3px', background: 'rgba(255, 23, 68, 0.2)', width: '100%' }}>
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: '#ff1744',
            boxShadow: '0 0 8px #ff1744',
            transition: 'width 0.1s linear'
          }}
        />
      </div>
    </div>
  );
}

export default GlobalFailureNotification;
