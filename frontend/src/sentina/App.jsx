'use client'
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { NewAssessmentModal } from './components/NewAssessmentModal';
import { FindingDrawer } from './components/FindingDrawer';
import { GlobalFailureNotification } from './components/GlobalFailureNotification';
import { ScanFailureModal } from './components/ScanFailureModal';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Assessments } from './pages/Assessments';
import { Assets } from './pages/Assets';
import { FindingsExplorer } from './pages/FindingsExplorer';
import { SASTView } from './pages/SASTView';
import { DASTView } from './pages/DASTView';
import { SCAView } from './pages/SCAView';
import { SecretsView } from './pages/SecretsView';
import { ThreatIntelView } from './pages/ThreatIntelView';
import { AICorrelationView } from './pages/AICorrelationView';
import { Reports } from './pages/Reports';
import { SettingsPage } from './pages/Settings';
import { dashboardService } from './services/dashboardService';

export function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState('prj-001');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNewAssessmentOpen, setIsNewAssessmentOpen] = useState(false);
  const [activeFinding, setActiveFinding] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [failedAssessmentForModal, setFailedAssessmentForModal] = useState(null);

  const handleSelectFinding = async (findingId) => {
    const f = await dashboardService.getFindingById(findingId);
    if (f) setActiveFinding(f);
  };

  const handleStatusChange = async (id, newStatus) => {
    await dashboardService.updateFindingStatus(id, newStatus);
    if (activeFinding && activeFinding.id === id) {
      setActiveFinding({ ...activeFinding, status: newStatus });
    }
  };

  const handleStartAssessment = async (config) => {
    setIsNewAssessmentOpen(false);
    setCurrentTab('assessments');
    try {
      const newAsm = await dashboardService.triggerNewScan(config);
      if (newAsm) {
        dashboardService.setActiveAssessmentId(newAsm.id);
      }
    } catch (e) {
      console.error('Failed to trigger scan from navigation:', e);
    }
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard
            onNewAssessment={() => setIsNewAssessmentOpen(true)}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onSelectFindingId={handleSelectFinding}
          />
        );
      case 'assessments':
        return (
          <Assessments
            onSelectFinding={handleSelectFinding}
          />
        );
      case 'assets':
        return (
          <Assets
            onSelectFinding={handleSelectFinding}
          />
        );
      case 'findings':
        return <FindingsExplorer />;
      case 'sast':
        return <SASTView />;
      case 'dast':
        return <DASTView />;
      case 'sca':
        return <SCAView />;
      case 'secrets':
        return <SecretsView />;
      case 'threat_intel':
        return <ThreatIntelView />;
      case 'ai_correlation':
        return <AICorrelationView />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <SettingsPage />;
      default:
        return (
          <Dashboard
            onNewAssessment={() => setIsNewAssessmentOpen(true)}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onSelectFindingId={handleSelectFinding}
          />
        );
    }
  };

  return (
    <div className="app-container">
      {/* 13-item Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Viewport */}
      <div className="main-content">
        {/* Top Navigation */}
        <Navbar
          onNewAssessmentClick={() => setIsNewAssessmentOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          selectedProject={selectedProjectId}
          onSelectProject={(id) => setSelectedProjectId(id)}
          onViewFinding={handleSelectFinding}
        />

        {/* Dynamic Route View */}
        {renderContent()}
      </div>

      {/* Global On-Screen Scan Failure Toast Notification */}
      <GlobalFailureNotification
        onInspectFailure={(asm) => setFailedAssessmentForModal(asm)}
      />

      {/* Global Scan Failure Diagnostics & Remediation Modal */}
      <ScanFailureModal
        isOpen={Boolean(failedAssessmentForModal)}
        assessment={failedAssessmentForModal}
        onClose={() => setFailedAssessmentForModal(null)}
        onRelaunch={() => {
          setFailedAssessmentForModal(null);
          setIsNewAssessmentOpen(true);
        }}
      />

      {/* Global Command Palette / Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectFinding={(id) => {
          handleSelectFinding(id);
          setIsSearchOpen(false);
        }}
        onSelectAsset={() => {
          setCurrentTab('assets');
          setIsSearchOpen(false);
        }}
      />

      {/* New Assessment Launcher Modal */}
      <NewAssessmentModal
        isOpen={isNewAssessmentOpen}
        onClose={() => setIsNewAssessmentOpen(false)}
        onStartAssessment={handleStartAssessment}
      />

      {/* Slide-over Finding Drawer */}
      <FindingDrawer
        finding={activeFinding}
        isOpen={Boolean(activeFinding)}
        onClose={() => setActiveFinding(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

export default App;

