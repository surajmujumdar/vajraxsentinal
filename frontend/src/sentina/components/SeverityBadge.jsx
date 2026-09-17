'use client'
import React from 'react';
import { ShieldAlert, AlertCircle, AlertTriangle, Info, ShieldCheck } from 'lucide-react';

export function getRatingMeta(val) {
  const str = String(val || 'INFO').toUpperCase();

  if (str.includes('CRIT') || str === 'F') {
    return {
      key: 'CRITICAL',
      label: 'CRITICAL RISK',
      shortLabel: 'CRITICAL',
      grade: 'F',
      color: '#ff1744',
      bg: 'rgba(69, 10, 10, 0.95)',
      border: '#ff1744',
      shadow: '0 0 12px rgba(255, 23, 68, 0.6)',
      icon: ShieldAlert
    };
  }
  if (str.includes('HIGH') || str.includes('ELEVATED') || str === 'C') {
    return {
      key: 'HIGH',
      label: 'ELEVATED RISK',
      shortLabel: 'ELEVATED',
      grade: 'C',
      color: '#f97316',
      bg: 'rgba(67, 20, 7, 0.95)',
      border: '#f97316',
      shadow: '0 0 12px rgba(249, 115, 22, 0.55)',
      icon: AlertTriangle
    };
  }
  if (str.includes('MED') || str.includes('MODERATE') || str === 'B') {
    return {
      key: 'MEDIUM',
      label: 'MODERATE RISK',
      shortLabel: 'MODERATE',
      grade: 'B',
      color: '#fbbf24',
      bg: 'rgba(66, 32, 6, 0.95)',
      border: '#fbbf24',
      shadow: '0 0 12px rgba(251, 191, 36, 0.55)',
      icon: AlertCircle
    };
  }
  if (str.includes('LOW') || str === 'A') {
    return {
      key: 'LOW',
      label: 'LOW RISK',
      shortLabel: 'LOW RISK',
      grade: 'A',
      color: '#00f2fe',
      bg: 'rgba(2, 6, 23, 0.95)',
      border: '#00f2fe',
      shadow: '0 0 12px rgba(0, 242, 254, 0.55)',
      icon: Info
    };
  }
  return {
    key: 'INFO',
    label: 'INFORMATIONAL',
    shortLabel: 'INFO',
    grade: 'A+',
    color: '#00ff88',
    bg: 'rgba(2, 44, 34, 0.95)',
    border: '#00ff88',
    shadow: '0 0 12px rgba(0, 255, 136, 0.55)',
    icon: ShieldCheck
  };
}

export function SeverityBadge({ severity, rating, size = 'md', showIcon = true, showScore = false, score = null, className = '' }) {
  const meta = getRatingMeta(rating || severity);
  const Icon = meta.icon;

  const sizeStyle = size === 'sm' 
    ? { fontSize: '9.5px', padding: '2px 6px' } 
    : size === 'lg'
    ? { fontSize: '12px', padding: '4px 12px', fontWeight: 900 }
    : { fontSize: '10.5px', padding: '3px 8px', fontWeight: 800 };

  return (
    <span 
      className={`rating-badge rating-${meta.key.toLowerCase()} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        borderRadius: '4px',
        fontWeight: 900,
        textTransform: 'uppercase',
        letterSpacing: '0.6px',
        fontFamily: 'var(--font-mono)',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        background: meta.bg,
        color: meta.color,
        border: `1.5px solid ${meta.border}`,
        boxShadow: meta.shadow,
        textShadow: `0 0 6px ${meta.color}80`,
        ...sizeStyle
      }}
      title={`Threat Rating: ${meta.label}`}
    >
      {showIcon && <Icon size={size === 'sm' ? 10 : 12} />}
      <span>{meta.label}</span>
      {showScore && score != null && (
        <span
          style={{
            marginLeft: '2px',
            padding: '0 4px',
            borderRadius: '3px',
            background: 'rgba(255,255,255,0.15)',
            color: '#ffffff',
            fontSize: '9px'
          }}
        >
          {Number(score).toFixed(1)}
        </span>
      )}
    </span>
  );
}

export const RatingBadge = SeverityBadge;
export const ThreatRatingBadge = SeverityBadge;

export default SeverityBadge;
