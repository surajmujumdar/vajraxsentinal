'use client'
import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export function RiskTrend({ trendData }) {
  const [timeframe, setTimeframe] = useState('7d');
  const { posture = 'Improving', postureDelta = '-14.2% Risk Exposure', history = {} } = trendData || {};

  const activeHistory = history[timeframe] || history['7d'] || [];

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          style={{
            background: '#090e1e',
            border: '1px solid #1e2c4d',
            borderRadius: '8px',
            padding: '10px 14px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            fontSize: '12px'
          }}
        >
          <div style={{ color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>{label}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00f2fe' }} />
            <span style={{ color: '#f8fafc', fontWeight: 700 }}>Security Score:</span>
            <span style={{ color: '#00f2fe', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{data.score}/100</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff3366' }} />
            <span style={{ color: '#f8fafc' }}>Critical Vulns:</span>
            <span style={{ color: '#ff3366', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{data.critical}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className="cyber-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '22px 20px',
        height: '100%'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              SECURITY RISK TREND
            </span>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '4px',
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                fontSize: '11px',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)'
              }}
            >
              <TrendingUp size={12} /> {posture}: {postureDelta}
            </div>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            Historical security health trajectory and remediations
          </div>
        </div>

        {/* Timeframe Buttons */}
        <div
          style={{
            display: 'flex',
            background: '#070b16',
            border: '1px solid #141f38',
            borderRadius: '6px',
            padding: '2px'
          }}
        >
          {['7d', '30d', '90d', '1y'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              style={{
                padding: '4px 10px',
                border: 'none',
                borderRadius: '4px',
                background: timeframe === tf ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
                color: timeframe === tf ? '#00f2fe' : '#64748b',
                fontWeight: timeframe === tf ? 700 : 500,
                fontSize: '11px',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                transition: 'all 0.15s'
              }}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div style={{ width: '100%', height: '220px', marginTop: '8px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={activeHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGlowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#00f2fe" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#121d36" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#15213d' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              domain={[50, 100]}
              tickLine={false}
              axisLine={{ stroke: '#15213d' }}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#00f2fe"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#scoreGlowGrad)"
              style={{ filter: 'drop-shadow(0 0 6px rgba(0, 242, 254, 0.4))' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default RiskTrend;
