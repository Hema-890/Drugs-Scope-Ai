import React, { useState } from 'react';
import { CommandPalette } from './components/common/CommandPalette';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { VoiceSearchModal } from './components/common/VoiceSearchModal';
import { LandingPage } from './components/LandingPage';
import { CommandCenter } from './components/modules/CommandCenter';
import { MedicineExplorer } from './components/modules/MedicineExplorer';
import { InteractionReview } from './components/modules/InteractionReview';
import { MolecularLab } from './components/modules/MolecularLab';
import { PathwayNetwork } from './components/modules/PathwayNetwork';
import { ClinicalWorkspace } from './components/modules/ClinicalWorkspace';
import { HypothesisWorkbench } from './components/modules/HypothesisWorkbench';
import { Pharmacovigilance } from './components/modules/Pharmacovigilance';
import { LiteratureIntelligence } from './components/modules/LiteratureIntelligence';
import { ContradictionRadar } from './components/modules/ContradictionRadar';
import { MedicationTimeline } from './components/modules/MedicationTimeline';
import { ProfessionalReview } from './components/modules/ProfessionalReview';
import { CollaborationSpace } from './components/modules/CollaborationSpace';
import { ReportStudio } from './components/modules/ReportStudio';
import { PatientEducation } from './components/modules/PatientEducation';
import { SourceAdministration } from './components/modules/SourceAdministration';
import { ExplainableAiAssistant } from './components/modules/ExplainableAiAssistant';
import { AuditProvenance } from './components/modules/AuditProvenance';
import { EvidenceTimeMachine } from './components/differentiators/EvidenceTimeMachine';
import { EvidenceGapAtlas } from './components/differentiators/EvidenceGapAtlas';
import { MolecularStoryboard } from './components/differentiators/MolecularStoryboard';
import { MedicineAnalysisWorkspace } from './components/modules/MedicineAnalysisWorkspace';
import { AnalysisResultsDashboard } from './components/modules/AnalysisResultsDashboard';
import { ScientificDossierReport } from './components/reports/ScientificDossierReport';
import {
  getStoredMode,
  getStoredUser,
  recordAuditEvent,
  setStoredMode
} from './services/storageService';
import { AnalysisSession, BiologicalTarget, DatasetMode, Drug, ProteinStructure, UserProfile } from './types';

export function App() {
  const [activeModule, setActiveModule] = useState<string>('landing');
  const [mode, setMode] = useState<DatasetMode>(getStoredMode());
  const [user, setUser] = useState<UserProfile>(getStoredUser());
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState<boolean>(false);

  // Cross-module active items
  const [targetDrug, setTargetDrug] = useState<Drug | null>(null);
  const [targetPdbId, setTargetPdbId] = useState<string>('6WVR');
  const [targetBiologicalTarget, setTargetBiologicalTarget] = useState<BiologicalTarget | null>(null);
  const [activeAnalysisSessionId, setActiveAnalysisSessionId] = useState<string | null>(null);
  const [activeReportSession, setActiveReportSession] = useState<AnalysisSession | null>(null);

  const handleModeChange = (newMode: DatasetMode) => {
    setMode(newMode);
    setStoredMode(newMode);
    recordAuditEvent('MODE_CHANGE', 'Dataset Configuration', `Switched mode to ${newMode}`);
  };

  const handleNavigate = (moduleId: string, itemData?: any) => {
    setActiveModule(moduleId);
    if (itemData) {
      if (itemData.genericName) setTargetDrug(itemData);
      if (itemData.pdbId) setTargetPdbId(itemData.pdbId);
      if (itemData.geneSymbol) setTargetBiologicalTarget(itemData);
      if (itemData.sessionId) setActiveAnalysisSessionId(itemData.sessionId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'landing':
        return <LandingPage onLaunch={(mod) => handleNavigate(mod)} />;
      case 'command-center':
        return <CommandCenter mode={mode} onNavigate={(mod) => handleNavigate(mod)} />;
      case 'analyze':
        return (
          <MedicineAnalysisWorkspace
            onAnalysisComplete={(sessionId) => {
              setActiveAnalysisSessionId(sessionId);
              setActiveModule('analysis-results');
            }}
            onNavigateToDrugDetail={(drug) => {
              setTargetDrug(drug);
              setActiveModule('medicine-explorer');
            }}
          />
        );
      case 'analysis-results':
        return (
          <AnalysisResultsDashboard
            sessionId={activeAnalysisSessionId || 'DSA-ANL-DEMO'}
            onBackToSearch={() => setActiveModule('analyze')}
            onNavigateTo3DStructure={(pdbId) => {
              setTargetPdbId(pdbId);
              setActiveModule('molecular-lab');
            }}
            onViewReportDossier={(session) => {
              setActiveReportSession(session);
              setActiveModule('analysis-report');
            }}
          />
        );
      case 'analysis-report':
        return activeReportSession ? (
          <ScientificDossierReport
            session={activeReportSession}
            onBack={() => setActiveModule('analysis-results')}
          />
        ) : (
          <CommandCenter mode={mode} onNavigate={(mod) => handleNavigate(mod)} />
        );
      case 'medicine-explorer':
        return (
          <MedicineExplorer
            initialDrug={targetDrug}
            onNavigateTo3D={(pdbId) => {
              setTargetPdbId(pdbId);
              setActiveModule('molecular-lab');
            }}
          />
        );
      case 'interaction-review':
        return (
          <InteractionReview
            onNavigateTo3D={(pdbId) => {
              setTargetPdbId(pdbId);
              setActiveModule('molecular-lab');
            }}
          />
        );
      case 'molecular-lab':
        return <MolecularLab initialPdbId={targetPdbId} />;
      case 'pathway-network':
        return (
          <PathwayNetwork
            initialTarget={targetBiologicalTarget}
            onNavigateToDrug={(drug) => {
              setTargetDrug(drug);
              setActiveModule('medicine-explorer');
            }}
          />
        );
      case 'clinical-workspace':
        return <ClinicalWorkspace />;
      case 'hypothesis-workbench':
        return <HypothesisWorkbench />;
      case 'pharmacovigilance':
        return <Pharmacovigilance />;
      case 'literature-intel':
        return <LiteratureIntelligence />;
      case 'contradiction-radar':
        return <ContradictionRadar />;
      case 'medication-timeline':
        return <MedicationTimeline />;
      case 'professional-review':
        return <ProfessionalReview />;
      case 'collaboration':
        return <CollaborationSpace />;
      case 'report-studio':
        return <ReportStudio />;
      case 'patient-education':
        return <PatientEducation />;
      case 'source-admin':
        return <SourceAdministration />;
      case 'ai-assistant':
        return <ExplainableAiAssistant />;
      case 'audit-provenance':
        return <AuditProvenance />;
      case 'time-machine':
        return <EvidenceTimeMachine />;
      case 'gap-atlas':
        return <EvidenceGapAtlas />;
      case 'storyboard':
        return <MolecularStoryboard />;
      default:
        return <CommandCenter mode={mode} onNavigate={(mod) => handleNavigate(mod)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-[#F4F7FB] flex flex-col">
      {/* Top Navigation Bar */}
      <Navbar
        mode={mode}
        onModeChange={handleModeChange}
        user={user}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onOpenVoiceModal={() => setVoiceModalOpen(true)}
        activeModule={activeModule}
        onNavigate={handleNavigate}
      />

      <div className="flex-1 flex">
        {/* Left Sidebar Navigation */}
        <Sidebar
          activeModule={activeModule}
          onSelectModule={handleNavigate}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content Area */}
        <main
          className={`transition-all duration-300 w-full ${
            activeModule === 'landing'
              ? 'p-0 min-h-screen'
              : activeModule === 'molecular-lab'
              ? 'p-4 lg:p-6 max-w-[1920px] mx-auto'
              : activeModule === 'analysis-report'
              ? 'p-4 lg:p-8 max-w-5xl mx-auto'
              : `flex-1 p-4 md:p-8 max-w-7xl mx-auto ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`
          }`}
        >
          {renderActiveModule()}
        </main>
      </div>

      {/* Global Command Palette (⌘K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Voice-Assisted Search Modal */}
      <VoiceSearchModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
export default App;
