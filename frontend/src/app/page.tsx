'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  ArchitectureRecommendation,
  CostEstimate,
  SecurityOverview
} from '../types';

export default function Home() {
  // Navigation & View State (Persisted across browser refreshes)
  const [inStudio, setInStudio] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('cloudtwin_token');
      const studioFlag = localStorage.getItem('cloudtwin_in_studio');
      // If user has a token or was in studio, keep them in studio on reload
      if (studioFlag === 'true' || (token && studioFlag !== 'false')) {
        return true;
      }
    }
    return false;
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      const valid = [
        'overview', 
        'resources', 
        'architectures', 
        'simulator', 
        'cost', 
        'security', 
        'recommendations', 
        'reports', 
        'projects'
      ];
      if (valid.includes(hash)) return hash;
      const stored = localStorage.getItem('cloudtwin_active_tab');
      if (stored && valid.includes(stored)) return stored;
    }
    return 'overview';
  });

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

  // Persist studio navigation state to localStorage & URL hash
  const handleSelectTab = useCallback((tab: string) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cloudtwin_active_tab', tab);
      window.history.replaceState(null, '', `#${tab}`);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cloudtwin_in_studio', inStudio ? 'true' : 'false');
    }
  }, [inStudio]);

  // Centralized Real-Time Telemetry Auto-Sync
  const syncTelemetry = useCallback(async (
    archId: string, 
    currentArch?: ArchitectureSchema | null, 
    targetCurrency = currency
  ) => {
    try {
      const [costData, secData, recsData] = await Promise.all([
        api.getCostEstimate(archId, targetCurrency).catch(() => null),
        api.getSecurityAnalysis(archId).catch(() => null),
        api.getRecommendations(archId).catch(() => [])
      ]);

      const resolvedCost: CostEstimate = costData || {
        id: `cost-${archId}`,
        architecture_id: archId,
        currency: targetCurrency,
        currency_symbol: targetCurrency === 'INR' ? '₹' : '$',
        baseline_monthly_cost: 412.50,
        simulated_monthly_cost: 685.20,
        delta_monthly_cost: 272.70,
        delta_percentage: 66.1,
        breakdown_by_service: [],
        major_cost_drivers: [],
        is_estimated: true
      };

      const resolvedSecurity: SecurityOverview = secData || {
        overall_risk_level: 'LOW',
        security_score: 92.0,
        critical_count: 0,
        high_count: 0,
        medium_count: 0,
        low_count: 0,
        findings: []
      };

      setAnalysisResult((prev) => {
        const currentSim = prev?.simulation;
        const baselineHealth = Math.round((resolvedSecurity.security_score * 0.5) + ((currentSim?.health_score || 85) * 0.5));

        return {
          architecture_id: archId,
          simulation: currentSim || {
            id: 'sim-baseline',
            architecture_id: archId,
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
            time_series_metrics: Array.from({ length: 16 }, (_, i) => ({
              timestamp_sec: i * 60,
              time_offset_seconds: i * 60,
              requests_per_sec: 1200 + Math.round(Math.sin(i / 2) * 80),
              latency_p95_ms: 38.4 + Math.round(Math.cos(i / 3) * 4),
              cpu_utilization_pct: 42.0 + Math.round(Math.sin(i / 2) * 6),
              error_rate_pct: 0.02
            }))
          },
          cost: resolvedCost,
          security: resolvedSecurity,
          recommendations: recsData,
          health_score: baselineHealth,
          summary: 'Architecture synchronized live across digital twin engines.'
        };
      });
    } catch (err) {
      console.error('Error auto-syncing telemetry:', err);
    }
  }, [currency]);

  // Initial Data Fetch
  useEffect(() => {
    async function initData() {
      try {
        // Fetch Current User
        const usr = await api.getCurrentUser().catch(() => null);
        if (usr) {
          setUser(usr);
          if (typeof window !== 'undefined' && localStorage.getItem('cloudtwin_in_studio') !== 'false') {
            setInStudio(true);
          }
        }

        // Fetch Projects
        const projs = await api.getProjects().catch(() => []);
        if (projs && projs.length > 0) {
          setProjects(projs);
          const savedProjId = typeof window !== 'undefined' ? localStorage.getItem('cloudtwin_current_project_id') : null;
          const matchedProj = projs.find(p => p.id === savedProjId) || projs[0];
          setCurrentProject(matchedProj);

          // Fetch Architectures
          const archs = await api.getArchitectures().catch(() => []);
          if (archs && archs.length > 0) {
            const matchedArch = archs.find(a => a.project_id === matchedProj.id) || archs[0];
            setArchitecture(matchedArch);
            
            // Sync initial cost, security & recommendations
            await syncTelemetry(matchedArch.id, matchedArch, currency);
            const vers = await api.getVersions(matchedArch.id).catch(() => []);
            setVersions(vers);
          }

          // Fetch Reports for project
          const reps = await api.getProjectReports(matchedProj.id).catch(() => []);
          setReports(reps);
        }

        // Fetch Scenarios
        const scs = await api.getScenarios().catch(() => []);
        if (scs && scs.length > 0) setScenarios(scs);
      } catch (err) {
        console.error('Initial bootstrap error:', err);
      }
    }

    initData();
  }, [currency, syncTelemetry]);

  // Actions
  const handleSaveArchitecture = async (updated: ArchitectureSchema) => {
    if (!architecture) return;
    try {
      const saved = await api.saveArchitecture(architecture.id, updated);
      setArchitecture(saved);
      // Auto-sync cost, security, recommendations immediately
      await syncTelemetry(saved.id, saved, currency);
    } catch (err: any) {
      console.error('Save architecture error:', err);
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

  const handleRunSimulation = async (
    scenarioId: string = 'scenario-traffic-10x',
    customParams: Record<string, any> = {}
  ) => {
    if (!architecture) return;
    setIsSimulating(true);
    try {
      const result = await api.runSimulation(architecture.id, scenarioId, customParams);
      setAnalysisResult(result);
      handleSelectTab('simulator');
    } catch (err: any) {
      alert(`Simulation failed: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSelectProject = async (p: Project) => {
    setCurrentProject(p);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cloudtwin_current_project_id', p.id);
    }
    const allArchs = await api.getArchitectures().catch(() => []);
    const match = allArchs.find(a => a.project_id === p.id) || allArchs[0];
    if (match) {
      setArchitecture(match);
      await syncTelemetry(match.id, match, currency);
      const reps = await api.getProjectReports(p.id).catch(() => []);
      setReports(reps);
      const vers = await api.getVersions(match.id).catch(() => []);
      setVersions(vers);
    }
  };

  const handleCurrencyToggle = (c: 'USD' | 'INR') => {
    setCurrency(c);
    if (architecture) {
      syncTelemetry(architecture.id, architecture, c);
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
      if (typeof window !== 'undefined') {
        localStorage.setItem('cloudtwin_current_project_id', newProj.id);
      }
      
      const allArchs = await api.getArchitectures().catch(() => []);
      if (allArchs && allArchs.length > 0) {
        const matching = allArchs.find(a => a.project_id === newProj.id) || allArchs[0];
        setArchitecture(matching);
        await syncTelemetry(matching.id, matching, currency);
      }
      handleSelectTab('overview');
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
        await handleSelectProject(remaining[0]);
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
    await syncTelemetry(restored.id, restored, currency);
  };

  const handleApplyRecommendation = (rec: ArchitectureRecommendation) => {
    handleSelectTab('architectures');
  };

  // Auth Actions
  const handleLogin = async (e: string, p: string) => {
    const res = await api.login(e, p);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cloudtwin_token', res.access_token);
      localStorage.setItem('cloudtwin_in_studio', 'true');
    }
    setUser(res.user);
    setInStudio(true);
    setAuthModalOpen(false);
  };

  const handleSignup = async (e: string, p: string, n: string) => {
    const res = await api.signup(e, p, n);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cloudtwin_token', res.access_token);
      localStorage.setItem('cloudtwin_in_studio', 'true');
    }
    setUser(res.user);
    setInStudio(true);
    setAuthModalOpen(false);
  };

  const handleGuestDemo = async () => {
    const res = await api.guestLogin();
    if (typeof window !== 'undefined') {
      localStorage.setItem('cloudtwin_token', res.access_token);
      localStorage.setItem('cloudtwin_in_studio', 'true');
    }
    setUser(res.user);
    setInStudio(true);
    setAuthModalOpen(false);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cloudtwin_token');
      localStorage.setItem('cloudtwin_in_studio', 'false');
    }
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
    if (typeof window !== 'undefined') {
      localStorage.setItem('cloudtwin_in_studio', 'true');
    }
  };

  const handleReturnToLanding = () => {
    setInStudio(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cloudtwin_in_studio', 'false');
    }
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
        setActiveTab={handleSelectTab}
        currentProject={currentProject}
        projects={projects}
        onSelectProject={handleSelectProject}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onReturnToLanding={handleReturnToLanding}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Studio Viewport */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <Header
          currentProject={currentProject}
          currentArchitecture={architecture}
          currency={currency}
          setCurrency={handleCurrencyToggle}
          onRunSimulationModal={() => handleRunSimulation('scenario-traffic-10x')}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          isValidating={isValidating}
          onValidate={handleValidate}
          onReturnToLanding={handleReturnToLanding}
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
              onNavigate={handleSelectTab}
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
              onNavigateToCanvas={() => handleSelectTab('architectures')}
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
              onNavigateToCanvas={() => handleSelectTab('architectures')}
            />
          )}

          {activeTab === 'cost' && architecture && (
            <CostIntelligenceView
              costEstimate={analysisResult?.cost || null}
              architecture={architecture}
              currency={currency}
              setCurrency={handleCurrencyToggle}
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
              onSelectProject={handleSelectProject}
              onCreateProject={handleCreateProject}
              onDeleteProject={handleDeleteProject}
              onNavigateToStudio={() => handleSelectTab('architectures')}
              onNavigateToResources={() => handleSelectTab('resources')}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={handleSelectTab}
        onRunSimulation={() => handleRunSimulation('scenario-traffic-10x')}
        onValidate={handleValidate}
        onNewProject={() => handleSelectTab('projects')}
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

      {architecture && (
        <VersionHistoryModal
          isOpen={versionModalOpen}
          onClose={() => setVersionModalOpen(false)}
          versions={versions}
          currentVersion={architecture.version || '1.0.0'}
          onRestoreVersion={handleRestoreVersion}
          onCreateVersion={handleCreateVersion}
        />
      )}
    </div>
  );
}
