'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { ArchitectureCanvas } from '../components/canvas/ArchitectureCanvas';
import { SimulatorView } from '../components/simulation/SimulatorView';
import { CostIntelligenceView } from '../components/cost/CostIntelligenceView';
import { SecurityView } from '../components/security/SecurityView';
import { RecommendationsView } from '../components/recommendations/RecommendationsView';
import { ReportsView } from '../components/reports/ReportsView';
import { ProjectsView } from '../components/projects/ProjectsView';
import { OverviewDashboard } from '../components/dashboard/OverviewDashboard';
import { AwsResourcesView } from '../components/resources/AwsResourcesView';
import { CommandPalette } from '../components/command/CommandPalette';
import { AuthModal } from '../components/auth/AuthModal';
import { VersionHistoryModal } from '../components/canvas/VersionHistoryModal';
import { LandingPage } from '../components/landing/LandingPage';

import { api } from '../lib/api';
import { 
  Project, 
  ArchitectureSchema, 
  SimulationScenario, 
  UnifiedAnalysisResult, 
  UserProfile,
  ArchitectureRecommendation
} from '../types';

export default function Home() {
  // Navigation & View State (Default to Landing Page showcase, toggleable anytime)
  const [inStudio, setInStudio] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Modals
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Currency
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');

  // Data State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [architecture, setArchitecture] = useState<ArchitectureSchema | null>(null);
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([]);
  const [analysisResult, setAnalysisResult] = useState<UnifiedAnalysisResult | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [versions, setVersions] = useState<any[]>([]);

  // Loading & Validation States
  const [isSimulating, setIsSimulating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; issues: any[] } | null>(null);

  // Initial Data Fetch
  useEffect(() => {
    async function initData() {
      try {
        // Fetch Current User / Guest Session
        const usr = await api.getCurrentUser().catch(() => null);
        if (usr) setUser(usr);

        // Fetch Projects
        const projs = await api.getProjects().catch(() => []);
        if (projs && projs.length > 0) {
          setProjects(projs);
          setCurrentProject(projs[0]);
        }

        // Fetch Architectures
        const archs = await api.getArchitectures().catch(() => []);
        if (archs && archs.length > 0) {
          setArchitecture(archs[0]);
          
          // Fetch initial cost & security for this architecture
          const costData = await api.getCostEstimate(archs[0].id, currency).catch(() => null);
          const secData = await api.getSecurityAnalysis(archs[0].id).catch(() => null);
          const recsData = await api.getRecommendations(archs[0].id).catch(() => []);
          const vers = await api.getVersions(archs[0].id).catch(() => []);
          setVersions(vers);

          if (costData && secData) {
            setAnalysisResult({
              architecture_id: archs[0].id,
              simulation: {
                id: 'sim-baseline',
                architecture_id: archs[0].id,
                scenario_id: 'scenario-traffic-10x',
                scenario_name: '10× Flash Crowd Event',
                status: 'completed',
                execution_duration_ms: 1280,
                health_score: 88.5,
                performance_score: 84.0,
                scalability_score: 92.0,
                metrics: {
                  baseline_rps: 1200,
                  simulated_rps: 12000,
                  p95_latency_ms: 38.4,
                  max_cpu_pct: 78.2,
                  error_rate_pct: 0.12
                },
                bottlenecks: [],
                scaling_requirements: [],
                time_series_metrics: []
              },
              cost: costData,
              security: secData,
              recommendations: recsData,
              health_score: 88.5,
              summary: 'Architecture evaluated against production cloud twin baseline.'
            });
          }
        }

        // Fetch Scenarios
        const scs = await api.getScenarios().catch(() => []);
        if (scs && scs.length > 0) setScenarios(scs);

        // Fetch Reports for project
        if (projs.length > 0) {
          const reps = await api.getProjectReports(projs[0].id).catch(() => []);
          setReports(reps);
        }
      } catch (err) {
        console.error('Initial bootstrap error:', err);
      }
    }

    initData();
  }, [currency]);

  // Actions
  const handleSaveArchitecture = async (updated: ArchitectureSchema) => {
    if (!architecture) return;
    try {
      const saved = await api.saveArchitecture(architecture.id, updated);
      setArchitecture(saved);
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    }
  };

  const handleValidate = async () => {
    if (!architecture) return;
    setIsValidating(true);
    try {
      const result = await api.validateArchitecture(architecture.id);
      setValidationResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsValidating(false);
    }
  };

  const handleRunSimulation = async (scenarioId: string = 'scenario-traffic-10x') => {
    if (!architecture) return;
    setIsSimulating(true);
    try {
      const result = await api.runSimulation(architecture.id, scenarioId);
      setAnalysisResult(result);
      setActiveTab('simulator');
    } catch (err: any) {
      alert(`Simulation failed: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCreateProject = async (
    name: string, 
    description: string, 
    defaultRegion: string, 
    tags: string[], 
    template: string = 'enterprise_11_service'
  ) => {
    try {
      const newProj = await api.createProject(name, description, defaultRegion, tags, template);
      setProjects((prev) => [...prev, newProj]);
      setCurrentProject(newProj);
      
      // Fetch latest architectures to pick up the newly generated blueprint
      const allArchs = await api.getArchitectures().catch(() => []);
      if (allArchs && allArchs.length > 0) {
        const matching = allArchs.find(a => a.project_id === newProj.id);
        if (matching) {
          setArchitecture(matching);
        } else {
          setArchitecture(allArchs[0]);
        }
      }
      setActiveTab('overview');
    } catch (err: any) {
      alert(`Project creation failed: ${err.message}`);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await api.deleteProject(projectId);
      const remaining = projects.filter(p => p.id !== projectId);
      setProjects(remaining);
      if (currentProject?.id === projectId && remaining.length > 0) {
        setCurrentProject(remaining[0]);
        const allArchs = await api.getArchitectures().catch(() => []);
        const matching = allArchs.find(a => a.project_id === remaining[0].id);
        if (matching) setArchitecture(matching);
      }
    } catch (err: any) {
      alert(`Delete project failed: ${err.message}`);
    }
  };

  const handleGenerateReport = async (title: string, format: string) => {
    if (!currentProject || !architecture) return;
    setIsGeneratingReport(true);
    try {
      const newRep = await api.generateReport(currentProject.id, architecture.id, title, format);
      setReports((prev) => [newRep, ...prev]);
    } catch (err: any) {
      alert(`Report compilation failed: ${err.message}`);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleCreateVersion = async (summary: string) => {
    if (!architecture) return;
    const newVer = await api.createVersion(architecture.id, summary);
    setVersions((prev) => [...prev, newVer]);
  };

  const handleRestoreVersion = async (vId: string) => {
    if (!architecture) return;
    const restored = await api.restoreVersion(architecture.id, vId);
    setArchitecture(restored);
  };

  const handleApplyRecommendation = (rec: ArchitectureRecommendation) => {
    setActiveTab('architectures');
  };

  // Auth Actions
  const handleLogin = async (e: string, p: string) => {
    const res = await api.login(e, p);
    localStorage.setItem('cloudtwin_token', res.access_token);
    setUser(res.user);
    setInStudio(true);
    setAuthModalOpen(false);
  };

  const handleSignup = async (e: string, p: string, n: string) => {
    const res = await api.signup(e, p, n);
    localStorage.setItem('cloudtwin_token', res.access_token);
    setUser(res.user);
    setInStudio(true);
    setAuthModalOpen(false);
  };

  const handleGuestDemo = async () => {
    const res = await api.guestLogin();
    localStorage.setItem('cloudtwin_token', res.access_token);
    setUser(res.user);
    setInStudio(true);
    setAuthModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('cloudtwin_token');
    setUser(null);
    setInStudio(false);
    setAuthModalOpen(false);
  };

  const handleEnterStudio = () => {
    if (!user) {
      setAuthMode('login');
      setAuthModalOpen(true);
      return;
    }
    setInStudio(true);
  };

  // Render Landing Page if not in studio
  if (!inStudio) {
    return (
      <>
        <LandingPage 
          onEnterStudio={handleEnterStudio} 
          onOpenAuth={(mode) => {
            setAuthMode(mode || 'login');
            setAuthModalOpen(true);
          }}
          user={user}
        />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          currentUser={user}
          onLogin={handleLogin}
          onSignup={handleSignup}
          onGuestDemo={handleGuestDemo}
          onLogout={handleLogout}
          initialMode={authMode}
        />
      </>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 select-none text-slate-900 font-sans awwwards-bg">
      {/* Collapsible Futuristic Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentProject={currentProject}
        projects={projects}
        onSelectProject={(p) => {
          setCurrentProject(p);
          api.getArchitectures().then(all => {
            const match = all.find(a => a.project_id === p.id);
            if (match) setArchitecture(match);
          });
        }}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onReturnToLanding={() => setInStudio(false)}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Studio Viewport */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <Header
          currentProject={currentProject}
          currentArchitecture={architecture}
          currency={currency}
          setCurrency={setCurrency}
          onRunSimulationModal={() => handleRunSimulation('scenario-traffic-10x')}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          isValidating={isValidating}
          onValidate={handleValidate}
          onReturnToLanding={() => setInStudio(false)}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        {/* Dynamic Route View */}
        <main className="flex-1 overflow-hidden relative">
          {activeTab === 'overview' && (
            <OverviewDashboard
              currentProject={currentProject}
              architecture={architecture || {
                id: 'arch-default',
                name: 'FinTech Production Twin',
                version: '1.0.0',
                schema_version: '1.0',
                region: 'ap-south-1',
                nodes: [],
                connections: []
              }}
              analysis={analysisResult}
              currency={currency}
              onNavigate={setActiveTab}
              onRunSimulation={(scId) => handleRunSimulation(scId || 'scenario-traffic-10x')}
            />
          )}

          {activeTab === 'resources' && (
            <AwsResourcesView
              architecture={architecture || {
                id: 'arch-default',
                name: 'FinTech Production Twin',
                version: '1.0.0',
                schema_version: '1.0',
                region: 'ap-south-1',
                nodes: [],
                connections: []
              }}
              currency={currency}
              onNavigateToCanvas={() => setActiveTab('architectures')}
            />
          )}

          {activeTab === 'architectures' && architecture && (
            <ArchitectureCanvas
              architecture={architecture}
              onSave={handleSaveArchitecture}
              onRunSimulation={() => handleRunSimulation('scenario-traffic-10x')}
              onValidate={handleValidate}
              validationResult={validationResult}
              onOpenVersions={() => setVersionModalOpen(true)}
            />
          )}

          {activeTab === 'simulator' && architecture && (
            <SimulatorView
              scenarios={scenarios}
              architecture={architecture}
              currentResult={analysisResult}
              isRunning={isSimulating}
              onExecuteSimulation={handleRunSimulation}
              currency={currency}
            />
          )}

          {activeTab === 'cost' && architecture && (
            <CostIntelligenceView
              costEstimate={analysisResult?.cost || null}
              architecture={architecture}
              currency={currency}
              setCurrency={setCurrency}
            />
          )}

          {activeTab === 'security' && architecture && (
            <SecurityView
              securityOverview={analysisResult?.security || null}
              architecture={architecture}
            />
          )}

          {activeTab === 'recommendations' && architecture && (
            <RecommendationsView
              recommendations={analysisResult?.recommendations || []}
              architecture={architecture}
              onApplyRecommendation={handleApplyRecommendation}
            />
          )}

          {activeTab === 'reports' && architecture && (
            <ReportsView
              reports={reports}
              currentProject={currentProject}
              currentArchitecture={architecture}
              onGenerateReport={handleGenerateReport}
              isGenerating={isGeneratingReport}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsView
              projects={projects}
              currentProject={currentProject}
              onSelectProject={(p) => {
                setCurrentProject(p);
                api.getArchitectures().then(all => {
                  const match = all.find(a => a.project_id === p.id);
                  if (match) setArchitecture(match);
                });
              }}
              onCreateProject={handleCreateProject}
              onDeleteProject={handleDeleteProject}
              onNavigateToStudio={() => setActiveTab('architectures')}
              onNavigateToResources={() => setActiveTab('resources')}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={setActiveTab}
        onRunSimulation={handleRunSimulation}
        onValidate={handleValidate}
        onNewProject={() => setActiveTab('projects')}
        onGenerateReport={() => setActiveTab('reports')}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={user}
        onLogin={handleLogin}
        onSignup={handleSignup}
        onGuestDemo={handleGuestDemo}
        onLogout={handleLogout}
        initialMode={authMode}
      />

      <VersionHistoryModal
        isOpen={versionModalOpen}
        onClose={() => setVersionModalOpen(false)}
        versions={versions}
        currentVersion={architecture?.version || '1.0.0'}
        onCreateVersion={handleCreateVersion}
        onRestoreVersion={handleRestoreVersion}
      />
    </div>
  );
}
