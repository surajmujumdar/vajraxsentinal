'use client';

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ScanProgressModal } from './components/ScanProgressModal';
import { Dashboard } from './pages/Dashboard';
import { NewAssessment } from './pages/NewAssessment';
import { AssessmentDetails } from './pages/AssessmentDetails';
import { FindingsExplorer } from './pages/FindingsExplorer';
import { Projects } from './pages/Projects';
import { Reports } from './pages/Reports';
import { Capabilities } from './pages/Capabilities';
import { AICorrelation } from './pages/AICorrelation';
import { Assets } from './pages/Assets';
import { Login } from './pages/Login';
import { apiClient } from './api/client';

function SentinelMain() {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);
  
  // Live Active Assessment for Progress Modal
  const [activeRunningAssessment, setActiveRunningAssessment] = useState(null);

  // Poll running assessment status if active in modal
  useEffect(() => {
    let timer = null;
    if (activeRunningAssessment && activeRunningAssessment.status !== 'COMPLETED' && activeRunningAssessment.status !== 'FAILED' && activeRunningAssessment.status !== 'CANCELLED') {
      timer = setInterval(async () => {
        try {
          const updated = await apiClient.getAssessment(activeRunningAssessment.id);
          setActiveRunningAssessment(updated);
        } catch (err) {
          console.error('Error polling active assessment:', err);
        }
      }, 2000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeRunningAssessment?.id, activeRunningAssessment?.status]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#070a12' }}>
        <div className="scanning-pulse" style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#00f2fe' }} />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const handleAssessmentStarted = (newAssessment) => {
    setActiveRunningAssessment(newAssessment);
  };

  const handleCancelActiveScan = async () => {
    if (activeRunningAssessment) {
      try {
        const cancelled = await apiClient.cancelAssessment(activeRunningAssessment.id);
        setActiveRunningAssessment(cancelled);
      } catch (err) {
        console.error('Cancel failed:', err);
      }
    }
  };

  const handleViewAssessmentDetails = (id) => {
    setSelectedAssessmentId(id);
    setActiveRunningAssessment(null);
    setCurrentTab('assessment_detail');
  };

  const renderContent = () => {
    if (currentTab === 'assessment_detail' && selectedAssessmentId) {
      return (
        <AssessmentDetails
          assessmentId={selectedAssessmentId}
          onBack={() => setCurrentTab('assessments')}
          onViewAllFindings={() => setCurrentTab('findings')}
        />
      );
    }

    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard
            onNewAssessment={() => setCurrentTab('new_assessment')}
            onViewAssessment={handleViewAssessmentDetails}
            onViewFindings={() => setCurrentTab('findings')}
          />
        );
      case 'new_assessment':
        return (
          <NewAssessment
            onAssessmentStarted={handleAssessmentStarted}
          />
        );
      case 'assessments':
        return (
          <Reports
            onViewAssessment={handleViewAssessmentDetails}
          />
        );
      case 'findings':
        return <FindingsExplorer />;
      case 'sast':
        return <FindingsExplorer initialSource="SAST" />;
      case 'dast':
        return <FindingsExplorer initialSource="DAST" />;
      case 'sca':
        return <FindingsExplorer initialSource="SCA" />;
      case 'secrets':
        return <FindingsExplorer initialSource="SECRETS" />;
      case 'reports':
        return (
          <Reports
            onViewAssessment={handleViewAssessmentDetails}
          />
        );
      case 'projects':
        return (
          <Projects
            onSelectProject={(projId) => {
              setCurrentTab('new_assessment');
            }}
          />
        );
      case 'assets':
        return (
          <Assets
            onNewAssessment={(mode, url) => {
              setCurrentTab('new_assessment');
            }}
          />
        );
      case 'capabilities':
        return <Capabilities />;
      case 'ai-correlation':
        return <AICorrelation />;
      default:
        return (
          <Dashboard
            onNewAssessment={() => setCurrentTab('new_assessment')}
            onViewAssessment={handleViewAssessmentDetails}
            onViewFindings={() => setCurrentTab('findings')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-command-950 text-slate-200 antialiased cyber-grid flex flex-col justify-between">
      <div>
        {/* Top Global Navigation */}
        <Navbar
          onNewAssessmentClick={() => setCurrentTab('new_assessment')}
        />

        {/* Unified Dashboard Container with Cyber-HUD Sidebar */}
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <Sidebar
              currentTab={currentTab === 'assessment_detail' ? 'assessments' : currentTab}
              onTabChange={(tab) => {
                setSelectedAssessmentId(null);
                setCurrentTab(tab);
              }}
            />

            <main className="flex-1 min-w-0 w-full space-y-6" data-purpose="telemetry-dashboard">
              {renderContent()}
            </main>
          </div>
        </div>
      </div>

      {/* Footer Status */}
      <footer className="border-t border-slate-800/80 bg-command-950 text-center text-xs font-mono text-slate-500 py-3" data-purpose="command-footer">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
          <div>SENTINEL CYBERMETRIC CORE • SECURE SENSING NETWORK & CLOUD POSTURE</div>
          <div className="flex items-center space-x-4">
            <span>SECURITY LEVEL: AUTHORIZED</span>
            <span>ENCRYPTION: AES-GCM-256</span>
          </div>
        </div>
      </footer>

      {/* Real-time Scan Progress Modal */}
      {activeRunningAssessment && (
        <ScanProgressModal
          assessment={activeRunningAssessment}
          onClose={() => setActiveRunningAssessment(null)}
          onCancel={handleCancelActiveScan}
          onViewDetails={() => handleViewAssessmentDetails(activeRunningAssessment.id)}
        />
      )}
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <SentinelMain />
    </AuthProvider>
  );
}

export default App;
