'use client'
import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  Plus,
  Server,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  FolderOpen
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';

export function Projects({ onSelectProject, onNewAssessment }) {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    async function loadProjects() {
      const data = await dashboardService.getProjects();
      setProjects(data || []);
    }
    loadProjects();
  }, []);

  return (
    <div className="page-container">
      {/* Top Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#f8fafc' }}>
            Project Portfolios
          </h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
            Enterprise microservice boundaries, cloud environments, and security ownership groups.
          </p>
        </div>

        <button
          onClick={onNewAssessment}
          className="btn btn-primary"
          style={{ fontSize: '13px', padding: '9px 18px' }}
        >
          <Plus size={15} />
          <span>New Project Scope</span>
        </button>
      </div>

      {/* Empty State or Projects Grid */}
      {projects.length === 0 ? (
        <div
          className="cyber-card"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            background: '#040713',
            border: '1px dashed #14203a',
            borderRadius: '12px'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(192, 132, 252, 0.1)',
              border: '1px solid rgba(192, 132, 252, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: '#c084fc'
            }}
          >
            <FolderOpen size={28} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>
            No Project Portfolios
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '420px', margin: '0 auto 20px', lineHeight: 1.5 }}>
            No project portfolios are currently registered. Click below or launch a new security scan to create a project scope.
          </p>
          <button
            onClick={onNewAssessment}
            className="btn btn-primary"
            style={{ fontSize: '13px', padding: '8px 18px' }}
          >
            <Plus size={14} />
            <span>Create New Project Scope</span>
          </button>
        </div>
      ) : (
        <div className="grid-2" style={{ gap: '20px' }}>
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="cyber-card cyber-card-glow"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '230px'
              }}
            >
              <div>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: 'rgba(168, 85, 247, 0.15)',
                        border: '1px solid rgba(168, 85, 247, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <FolderGit2 size={20} color="#c084fc" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc' }}>
                        {proj.name}
                      </h3>
                      <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                        ID: {proj.id} • Last Scan: {proj.lastAssessment}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '24px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: proj.securityScore >= 85 ? '#10b981' : '#f59e0b' }}>
                      {proj.securityScore}/100
                    </div>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: proj.securityScore >= 85 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: proj.securityScore >= 85 ? '#10b981' : '#f59e0b',
                        border: proj.securityScore >= 85 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)'
                      }}
                    >
                      {proj.posture}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '16px' }}>
                  {proj.description}
                </p>

                {/* Stats row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '10px',
                    padding: '10px 14px',
                    background: '#070b16',
                    border: '1px solid #141f38',
                    borderRadius: '8px',
                    marginBottom: '16px'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Assets</div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
                      {proj.assetsCount || 0}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Findings</div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#ff3366', fontFamily: 'var(--font-mono)' }}>
                      {proj.criticalFindings || 0} Crit
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Assessments</div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#00f2fe', fontFamily: 'var(--font-mono)' }}>
                      {proj.totalAssessments || 0}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #141f38' }}>
                <span style={{ fontSize: '11.5px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                  Team: {proj.team}
                </span>
                <button
                  onClick={() => onSelectProject && onSelectProject(proj.id)}
                  className="btn btn-secondary btn-xs"
                  style={{ gap: '4px' }}
                >
                  <span>Open Portfolio</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Projects;
