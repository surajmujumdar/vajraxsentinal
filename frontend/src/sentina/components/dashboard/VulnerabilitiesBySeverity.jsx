'use client'
import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  Info,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

// Wave Area Sparkline with gradient fill under the curve and glowing stroke
function AreaSparkline({ data = [], color = '#ff3366', height = 34 }) {
  const safeData = (!data || data.length < 2) ? [0, 0, 0, 0, 0] : data;
  const min = Math.min(...safeData);
  const max = Math.max(...safeData);
  const range = max - min || 1;
  const w = 200;
  const step = w / (safeData.length - 1);

  const points = safeData.map((val, idx) => {
    const x = idx * step;
    const y = (max === 0 && min === 0)
      ? height - 6
      : height - ((val - min) / range) * (height - 8) - 4;
    return { x, y };
  });

  const pathD = points.reduce((acc, pt, idx, arr) => {
    if (idx === 0) return `M ${pt.x},${pt.y}`;
    const prev = arr[idx - 1];
    const cp1x = prev.x + (pt.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (pt.x - prev.x) / 2;
    const cp2y = pt.y;
    return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${pt.x},${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${w},${height} L 0,${height} Z`;
  const gradId = `rating-grad-${Math.random().toString(36).substr(2, 7)}`;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" style={{ overflow: 'visible', marginTop: '4px' }}>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={0.45} />
          <stop offset="100%" stopColor={color} stopOpacity={0.0} />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 6px ${color})` }}
      />
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r="3.5"
        fill={color}
        style={{ filter: `drop-shadow(0 0 8px ${color})` }}
      />
    </svg>
  );
}

// Custom Shield Rating Icon with neon glow
function RatingIcon({ icon: Icon, color }) {
  return (
    <div
      style={{
        width: '20px',
        height: '20px',
        borderRadius: '5px',
        background: `${color}20`,
        border: `1.2px solid ${color}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: `0 0 8px ${color}60`
      }}
    >
      <Icon size={12} color={color} style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
    </div>
  );
}

export function VulnerabilitiesBySeverity({ breakdown = {}, activeSeverity = 'ALL', onSelectSeverity }) {
  const [timeRange, setTimeRange] = useState('Last 7 Days');
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  const critCount = breakdown?.critical ?? 0;
  const highCount = breakdown?.high ?? 0;
  const medCount = breakdown?.medium ?? 0;
  const lowCount = breakdown?.low ?? 0;
  const infoCount = breakdown?.info ?? 0;

  const cards = [
    {
      key: 'CRITICAL',
      label: 'CRITICAL RISK',
      shortKey: 'F',
      count: critCount,
      trend: critCount > 0 ? '↓ 12%' : '0%',
      trendDir: 'down',
      color: '#ff1744',
      bgCard: '#060108',
      borderCard: '2.5px solid #ff1744',
      glowShadow: '0 0 18px rgba(255, 23, 68, 0.55)',
      icon: ShieldAlert,
      sparkline: critCount > 0 ? [22, 19, 17, 16, 15, 14, 12, 11] : [0, 0, 0, 0, 0]
    },
    {
      key: 'HIGH',
      label: 'ELEVATED RISK',
      shortKey: 'C',
      count: highCount,
      trend: highCount > 0 ? '↓ 8%' : '0%',
      trendDir: 'down',
      color: '#f97316',
      bgCard: '#060108',
      borderCard: '2.5px solid #f97316',
      glowShadow: '0 0 16px rgba(249, 115, 22, 0.5)',
      icon: AlertTriangle,
      sparkline: highCount > 0 ? [18, 16, 17, 15, 14, 15, 13, 12] : [0, 0, 0, 0, 0]
    },
    {
      key: 'MEDIUM',
      label: 'MODERATE RISK',
      shortKey: 'B',
      count: medCount,
      trend: medCount > 0 ? '↑ 5%' : '0%',
      trendDir: 'up',
      color: '#fbbf24',
      bgCard: '#060108',
      borderCard: '2.5px solid #fbbf24',
      glowShadow: '0 0 16px rgba(251, 191, 36, 0.5)',
      icon: AlertCircle,
      sparkline: medCount > 0 ? [10, 11, 12, 13, 12, 14, 15, 16] : [0, 0, 0, 0, 0]
    },
    {
      key: 'LOW',
      label: 'LOW RISK',
      shortKey: 'A',
      count: lowCount,
      trend: lowCount > 0 ? '↑ 10%' : '0%',
      trendDir: 'up',
      color: '#00f2fe',
      bgCard: '#060108',
      borderCard: '2.5px solid #00f2fe',
      glowShadow: '0 0 16px rgba(0, 242, 254, 0.55)',
      icon: Info,
      sparkline: lowCount > 0 ? [8, 9, 10, 11, 13, 14, 16, 18] : [0, 0, 0, 0, 0]
    },
    {
      key: 'INFO',
      label: 'INFORMATIONAL',
      shortKey: 'A+',
      count: infoCount,
      trend: infoCount > 0 ? '↑ 15%' : '0%',
      trendDir: 'up',
      color: '#00ff88',
      bgCard: '#060108',
      borderCard: '2.5px solid #00ff88',
      glowShadow: '0 0 16px rgba(0, 255, 136, 0.55)',
      icon: ShieldCheck,
      sparkline: infoCount > 0 ? [10, 12, 14, 15, 18, 20, 22, 24] : [0, 0, 0, 0, 0]
    }
  ];

  return (
    <div
      style={{
        background: '#060108',
        borderRadius: '12px',
        border: '3px solid #360a25',
        boxShadow: '0 10px 36px 0 rgba(0, 0, 0, 0.95)',
        padding: '16px 18px',
        marginBottom: '16px',
        position: 'relative'
      }}
    >
      {/* Decorative Cyber Corner Accents */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '18px', height: '18px', borderTop: '3px solid #ff1744', borderLeft: '3px solid #ff1744', borderRadius: '12px 0 0 0', filter: 'drop-shadow(0 0 8px #ff1744)' }} />
      <div style={{ position: 'absolute', top: 0, right: 0, width: '18px', height: '18px', borderTop: '3px solid #00f2fe', borderRight: '3px solid #00f2fe', borderRadius: '0 12px 0 0', filter: 'drop-shadow(0 0 8px #00f2fe)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '18px', height: '18px', borderBottom: '3px solid #ff1744', borderLeft: '3px solid #ff1744', borderRadius: '0 0 0 12px', filter: 'drop-shadow(0 0 8px #ff1744)' }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: '18px', height: '18px', borderBottom: '3px solid #00ff88', borderRight: '3px solid #00ff88', borderRadius: '0 0 12px 0', filter: 'drop-shadow(0 0 8px #00ff88)' }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 900,
              color: '#f8fafc',
              textTransform: 'uppercase',
              letterSpacing: '0.9px'
            }}
          >
            THREAT RATINGS & RISK DISTRIBUTION
          </div>
          {activeSeverity && activeSeverity !== 'ALL' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: '#ffffff',
                  background: 'rgba(255, 23, 68, 0.25)',
                  border: '1.2px solid #ff1744',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  boxShadow: '0 0 8px rgba(255, 23, 68, 0.5)'
                }}
              >
                ● ACTIVE RATING: {activeSeverity}
              </span>
              <button
                onClick={() => onSelectSeverity && onSelectSeverity('ALL')}
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  color: '#94a3b8',
                  background: '#0e1730',
                  border: '1px solid #1e293b',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.borderColor = '#ff1744'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#1e293b'; }}
              >
                ✕ Clear Filter
              </button>
            </div>
          )}
        </div>

        {/* Dropdown Filter Pill */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowTimeDropdown(!showTimeDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '6px',
              background: '#090e22',
              border: '1px solid #1a294d',
              color: '#94a3b8',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <span>{timeRange}</span>
            <ChevronDown size={13} />
          </button>

          {showTimeDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '6px',
                background: '#080d1e',
                border: '1px solid #1e2c4d',
                borderRadius: '6px',
                padding: '4px',
                zIndex: 10,
                boxShadow: '0 10px 25px rgba(0,0,0,0.8)',
                minWidth: '130px'
              }}
            >
              {['Last 24 Hours', 'Last 7 Days', 'Last 30 Days', 'Last 90 Days'].map(opt => (
                <div
                  key={opt}
                  onClick={() => {
                    setTimeRange(opt);
                    setShowTimeDropdown(false);
                  }}
                  style={{
                    padding: '6px 10px',
                    fontSize: '11.5px',
                    color: timeRange === opt ? '#00f2fe' : '#94a3b8',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#0e1630'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {opt}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5 Threat Rating Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '14px'
        }}
      >
        {cards.map((c) => {
          const isSelected = activeSeverity === c.key || activeSeverity === c.label;

          return (
            <div
              key={c.key}
              onClick={() => onSelectSeverity && onSelectSeverity(isSelected ? 'ALL' : c.key)}
              title={`Click to filter findings by ${c.label}`}
              style={{
                background: isSelected ? `linear-gradient(180deg, ${c.color}25 0%, #060108 100%)` : c.bgCard,
                borderRadius: '10px',
                border: isSelected ? `2.5px solid ${c.color}` : `1.5px solid ${c.color}60`,
                boxShadow: isSelected ? `0 0 28px ${c.color}60, inset 0 0 16px ${c.color}25` : c.glowShadow,
                padding: '14px 16px 10px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '124px',
                position: 'relative',
                transform: isSelected ? 'scale(1.02)' : 'none',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = c.color;
                  e.currentTarget.style.boxShadow = `0 0 22px ${c.color}50`;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = `${c.color}60`;
                  e.currentTarget.style.boxShadow = c.glowShadow;
                  e.currentTarget.style.transform = 'none';
                }
              }}
            >
              {/* Top: Icon + Label + Selection indicator */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RatingIcon icon={c.icon} color={c.color} />
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 900,
                      fontFamily: 'var(--font-mono)',
                      color: c.color,
                      letterSpacing: '0.5px',
                      textShadow: `0 0 8px ${c.color}`
                    }}
                  >
                    {c.label}
                  </span>
                </div>
                {isSelected && (
                  <span
                    style={{
                      fontSize: '8.5px',
                      fontWeight: 900,
                      color: '#ffffff',
                      background: c.color,
                      padding: '1px 5px',
                      borderRadius: '3px',
                      letterSpacing: '0.5px'
                    }}
                  >
                    ACTIVE
                  </span>
                )}
              </div>

              {/* Middle: Number + Trend */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  margin: '8px 0 2px'
                }}
              >
                <div
                  style={{
                    fontSize: '30px',
                    fontWeight: 900,
                    fontFamily: 'var(--font-mono)',
                    color: '#ffffff',
                    lineHeight: 1,
                    textShadow: `0 0 16px ${c.color}40`
                  }}
                >
                  {c.count}
                </div>

                <div
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    color: c.count > 0 ? c.color : '#64748b',
                    textShadow: c.count > 0 ? `0 0 8px ${c.color}` : 'none'
                  }}
                >
                  {c.trend}
                </div>
              </div>

              {/* Bottom: Area Sparkline */}
              <AreaSparkline data={c.sparkline} color={c.color} height={28} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default VulnerabilitiesBySeverity;
