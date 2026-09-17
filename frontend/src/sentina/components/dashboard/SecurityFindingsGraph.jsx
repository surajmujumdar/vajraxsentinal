'use client'
import React, { useState } from 'react';
import {
  Server,
  AlertTriangle,
  Boxes,
  KeyRound,
  ShieldAlert,
  Cpu,
  Layers,
  Sparkles,
  Info,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { SeverityBadge } from '../SeverityBadge';

export function SecurityFindingsGraph({ onSelectFinding }) {
  const [selectedNode, setSelectedNode] = useState(null);

  // Graph Node Definition
  const nodes = [
    // Column 1: Assets
    {
      id: 'node-asset-1',
      col: 0,
      row: 0,
      type: 'Asset',
      title: 'api.example.com',
      sub: 'API Gateway (Production)',
      color: '#38bdf8',
      icon: Server,
      details: 'Publicly reachable API ingress handling customer authentication and query routing.'
    },
    {
      id: 'node-asset-2',
      col: 0,
      row: 1,
      type: 'Asset',
      title: 'GitHub: backend-core',
      sub: 'Source Code Repository',
      color: '#38bdf8',
      icon: Server,
      details: 'Primary repository containing Python FastAPI microservices and Docker definitions.'
    },

    // Column 2: Findings
    {
      id: 'node-fnd-1',
      col: 1,
      row: 0,
      type: 'Finding',
      findingId: 'fnd-001',
      title: 'SQL Injection on /api/login',
      sub: 'DAST Runtime Finding',
      severity: 'CRITICAL',
      color: '#ff3366',
      icon: AlertTriangle,
      details: 'Blind SQLi verified with 5042ms sleep payload.'
    },
    {
      id: 'node-fnd-2',
      col: 1,
      row: 1,
      type: 'Finding',
      findingId: 'fnd-002',
      title: 'Hardcoded AWS Access Key',
      sub: 'Secret Scanning',
      severity: 'HIGH',
      color: '#f59e0b',
      icon: KeyRound,
      details: 'Exposed root IAM key committed to main branch.'
    },
    {
      id: 'node-fnd-3',
      col: 1,
      row: 2,
      type: 'Finding',
      findingId: 'fnd-003',
      title: 'SQLAlchemy Deserialization',
      sub: 'SCA Dependency Vulnerability',
      severity: 'HIGH',
      color: '#00f2fe',
      icon: Boxes,
      details: 'CVE-2023-4863 in sqlalchemy==1.4.20 allows RCE.'
    },

    // Column 3: Correlated Risk
    {
      id: 'node-corr-1',
      col: 2,
      row: 0.5,
      type: 'Correlated Risk',
      title: 'Remote Exfiltration & DB Takeover',
      sub: 'AI Correlated Attack Path',
      severity: 'CRITICAL',
      color: '#c084fc',
      icon: Cpu,
      details: 'Attacker leverages SQLi to dump user DB, uses AWS key for S3 exfiltration, and invokes RCE payload via deserializer.'
    }
  ];

  // Coordinates Mapping
  const getCoords = (node) => {
    const colX = [80, 360, 680];
    const rowY = [50, 160, 270];
    const x = colX[node.col];
    const y = node.row === 0.5 ? 135 : rowY[node.row];
    return { x, y };
  };

  // Edges Definition
  const edges = [
    { from: 'node-asset-1', to: 'node-fnd-1', color: '#38bdf8' },
    { from: 'node-asset-2', to: 'node-fnd-2', color: '#f59e0b' },
    { from: 'node-asset-2', to: 'node-fnd-3', color: '#00f2fe' },
    { from: 'node-fnd-1', to: 'node-corr-1', color: '#ff3366', animated: true },
    { from: 'node-fnd-2', to: 'node-corr-1', color: '#f59e0b', animated: true },
    { from: 'node-fnd-3', to: 'node-corr-1', color: '#00f2fe', animated: true }
  ];

  const activeNode = selectedNode || nodes[nodes.length - 1];

  return (
    <div
      className="cyber-card"
      style={{
        padding: '22px 20px',
        marginBottom: '24px',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              SECURITY FINDINGS & ATTACK PATH GRAPH
            </span>
            <span
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: '#00f2fe',
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'rgba(0, 242, 254, 0.1)',
                border: '1px solid rgba(0, 242, 254, 0.3)'
              }}
            >
              INTERACTIVE TOPOLOGY
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            Assets → Scanner Findings → Dependencies → AI Correlated Critical Risks
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', fontSize: '11.5px', color: '#94a3b8' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }} /> Asset Nodes
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff3366' }} /> Scanner Findings
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c084fc' }} /> Correlated Risk
          </span>
        </div>
      </div>

      {/* Main Interactive Graph Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px', alignItems: 'stretch' }}>
        {/* SVG Graph Canvas */}
        <div
          style={{
            background: '#070b16',
            border: '1px solid #141f38',
            borderRadius: '10px',
            position: 'relative',
            height: '320px',
            overflow: 'hidden'
          }}
        >
          {/* Subtle Grid Background */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }}
          />

          <svg width="100%" height="100%" viewBox="0 0 880 320" style={{ position: 'relative', zIndex: 1 }}>
            <defs>
              <linearGradient id="edgePulse" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#00f2fe" stopOpacity="1" />
                <stop offset="100%" stopColor="#ff3366" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Connecting Edges */}
            {edges.map((edge, idx) => {
              const srcNode = nodes.find(n => n.id === edge.from);
              const dstNode = nodes.find(n => n.id === edge.to);
              if (!srcNode || !dstNode) return null;
              const src = getCoords(srcNode);
              const dst = getCoords(dstNode);

              const cp1x = src.x + (dst.x - src.x) * 0.5;
              const cp1y = src.y;
              const cp2x = src.x + (dst.x - src.x) * 0.5;
              const cp2y = dst.y;
              const pathD = `M ${src.x + 90} ${src.y + 20} C ${cp1x} ${cp1y + 20}, ${cp2x} ${cp2y + 20}, ${dst.x - 90} ${dst.y + 20}`;

              return (
                <g key={idx}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke={edge.color}
                    strokeWidth="1.5"
                    strokeOpacity="0.4"
                  />
                  {edge.animated && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="url(#edgePulse)"
                      strokeWidth="2.5"
                      strokeDasharray="8 12"
                      style={{ animation: 'scanline 3s linear infinite' }}
                    />
                  )}
                </g>
              );
            })}

            {/* Render HTML Nodes as foreignObject */}
            {nodes.map((node) => {
              const { x, y } = getCoords(node);
              const isSelected = activeNode.id === node.id;
              const Icon = node.icon;

              return (
                <foreignObject
                  key={node.id}
                  x={x - 85}
                  y={y - 10}
                  width="180"
                  height="68"
                  style={{ overflow: 'visible' }}
                >
                  <div
                    onClick={() => setSelectedNode(node)}
                    style={{
                      width: '180px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: isSelected ? '#121d3a' : '#0a0f20',
                      border: isSelected ? `2px solid ${node.color}` : '1px solid #1a2744',
                      boxShadow: isSelected ? `0 0 16px ${node.color}50` : '0 4px 12px rgba(0,0,0,0.5)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      userSelect: 'none'
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = node.color;
                        e.currentTarget.style.background = '#0e1730';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#1a2744';
                        e.currentTarget.style.background = '#0a0f20';
                      }
                    }}
                  >
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        background: `${node.color}15`,
                        border: `1px solid ${node.color}40`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Icon size={14} color={node.color} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 700,
                          color: '#f8fafc',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {node.title}
                      </div>
                      <div
                        style={{
                          fontSize: '9.5px',
                          color: '#64748b',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {node.sub}
                      </div>
                    </div>
                  </div>
                </foreignObject>
              );
            })}
          </svg>
        </div>

        {/* Node Detail Inspector Panel */}
        <div
          style={{
            background: '#070b16',
            border: '1px solid #1a2744',
            borderRadius: '10px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  color: activeNode.color,
                  textTransform: 'uppercase'
                }}
              >
                {activeNode.type} Node
              </span>
              {activeNode.severity && <SeverityBadge severity={activeNode.severity} size="sm" />}
            </div>

            <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
              {activeNode.title}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '12px' }}>
              {activeNode.sub}
            </div>

            <div
              style={{
                fontSize: '12px',
                color: '#94a3b8',
                lineHeight: 1.5,
                padding: '10px',
                borderRadius: '6px',
                background: '#0b1224',
                border: '1px solid #141f38'
              }}
            >
              {activeNode.details}
            </div>
          </div>

          {activeNode.findingId && onSelectFinding ? (
            <button
              onClick={() => onSelectFinding(activeNode.findingId)}
              className="btn btn-primary btn-sm"
              style={{ width: '100%', marginTop: '12px', fontSize: '12px' }}
            >
              <span>Inspect Finding</span>
              <ExternalLink size={13} />
            </button>
          ) : (
            <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', marginTop: '12px' }}>
              Click any node in the graph to inspect details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SecurityFindingsGraph;
