import React, { useState, useEffect } from 'react';
import { FolderGit2, Plus, Trash2, Globe, GitBranch, ArrowRight, X } from 'lucide-react';
import { apiClient } from '../api/client';

export const Projects = ({ onSelectProject }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [targetUrl, setTargetUrl] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await apiClient.createProject({
        name,
        description: desc,
        repository_url: repoUrl || null,
        target_url: targetUrl || null
      });
      setShowModal(false);
      setName('');
      setDesc('');
      setRepoUrl('');
      setTargetUrl('');
      loadProjects();
    } catch (err) {
      alert(`Failed to create project: ${err.message}`);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project and its assessments?')) return;
    try {
      await apiClient.deleteProject(id);
      loadProjects();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 className="title-gradient" style={{ fontSize: '26px', marginBottom: '6px' }}>
            Target Projects & Scopes
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Manage repository scopes, web application domains, and access configurations.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          <span>New Target Project</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="cyber-card"
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: 'rgba(56, 189, 248, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38bdf8'
                  }}>
                    <FolderGit2 size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc' }}>
                      {proj.name}
                    </h3>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      Created {new Date(proj.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(proj.id, e)}
                  style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px', lineHeight: 1.5 }}>
                {proj.description || 'No description provided.'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', marginBottom: '16px' }}>
                {proj.repository_url && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                    <GitBranch size={14} />
                    <span>{proj.repository_url}</span>
                  </div>
                )}
                {proj.target_url && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00f2fe', fontFamily: 'var(--font-mono)' }}>
                    <Globe size={14} />
                    <span>{proj.target_url}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onSelectProject(proj.id)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <span>View Assessment History</span>
              <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* New Project Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 8, 15, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="cyber-card" style={{ width: '100%', maxWidth: '520px', background: '#0d1322' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc' }}>
                Create New Target Project
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Core API Gateway"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Brief description of application scope"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Default Repository URL</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://github.com/company/repo"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Default Live Web Target URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://app.company.com"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
