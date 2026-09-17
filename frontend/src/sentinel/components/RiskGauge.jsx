import React from 'react';

export const RiskGauge = ({ score = 0, size = 180 }) => {
  const cleanScore = Math.min(100, Math.max(0, Number(score) || 0));
  const radius = 70;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (cleanScore / 100) * circumference;

  const getColor = (s) => {
    if (s >= 75) return '#ff1744'; // Critical Red
    if (s >= 50) return '#f59e0b'; // High Amber
    if (s >= 25) return '#eab308'; // Medium Yellow
    if (s > 0) return '#ff5252';   // Low Red-Orange
    return '#10b981';              // Safe Green
  };

  const getLabel = (s) => {
    if (s >= 75) return 'CRITICAL RISK';
    if (s >= 50) return 'HIGH RISK';
    if (s >= 25) return 'ELEVATED';
    if (s > 0) return 'LOW RISK';
    return 'SECURE';
  };

  const activeColor = getColor(cleanScore);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg height={size} width={size} viewBox="0 0 160 160">
          <circle
            stroke="rgba(255, 23, 68, 0.18)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx="80"
            cy="80"
          />
          <circle
            stroke={activeColor}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease-in-out' }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx="80"
            cy="80"
            transform="rotate(-90 80 80)"
          />
        </svg>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: '36px', fontWeight: '800', color: activeColor, fontFamily: 'var(--font-mono)' }}>
            {cleanScore}
          </span>
          <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
            / 100
          </span>
        </div>
      </div>
      <div style={{
        marginTop: '8px',
        fontSize: '12px',
        fontWeight: '700',
        letterSpacing: '1px',
        color: activeColor,
        background: `${activeColor}15`,
        padding: '4px 12px',
        borderRadius: '9999px',
        border: `1px solid ${activeColor}40`
      }}>
        {getLabel(cleanScore)}
      </div>
    </div>
  );
};
