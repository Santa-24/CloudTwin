'use client';

import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Workflow, 
  Activity, 
  DollarSign, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Play, 
  Zap, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  Network, 
  Database,
  Globe,
  Lock,
  ExternalLink,
  ChevronRight,
  HardDrive,
  Server,
  Radio,
  Flame,
  Award,
  Users,
  Compass,
  Check,
  TrendingDown,
  RefreshCw
} from 'lucide-react';
import { UserProfile } from '../../types';

interface LandingPageProps {
  onEnterStudio: () => void;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  user?: UserProfile | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterStudio, onOpenAuth, user }) => {
  // Interactive Simulation Sandbox State on Landing Page
  const [activeScenario, setActiveScenario] = useState<'normal' | 'surge' | 'az_outage' | 'failover'>('normal');
  const [simulationMetrics, setSimulationMetrics] = useState({
    rps: 1200,
    latencyMs: 14.5,
    healthScore: 99.2,
    monthlyCost: 284,
    statusText: 'All 11 AWS Services Healthy'
  });

  // ROI Calculator State
  const [awsMonthlySpend, setAwsMonthlySpend] = useState<number>(15000);
  const [deploymentsPerMonth, setDeploymentsPerMonth] = useState<number>(8);

  const estimatedDowntimeSavings = Math.round(awsMonthlySpend * 0.28);
  const estimatedCostReduction = Math.round(awsMonthlySpend * 0.22);
  const totalAnnualRoi = (estimatedDowntimeSavings + estimatedCostReduction) * 12;

  useEffect(() => {
    if (activeScenario === 'normal') {
      setSimulationMetrics({
        rps: 1200,
        latencyMs: 14.5,
        healthScore: 99.2,
        monthlyCost: 284,
        statusText: 'Optimal Baseline Load (ap-south-1)'
      });
    } else if (activeScenario === 'surge') {
      setSimulationMetrics({
        rps: 12400,
        latencyMs: 42.1,
        healthScore: 91.0,
        monthlyCost: 495,
        statusText: 'Auto-Scaling EC2 Fleet Triggered (+4 nodes)'
      });
    } else if (activeScenario === 'az_outage') {
      setSimulationMetrics({
        rps: 7800,
        latencyMs: 68.4,
        healthScore: 84.5,
        monthlyCost: 284,
        statusText: 'AZ-1a Blackout: Traffic Rerouted to AZ-1b with Zero Data Loss'
      });
    } else if (activeScenario === 'failover') {
      setSimulationMetrics({
        rps: 5400,
        latencyMs: 82.0,
        healthScore: 88.0,
        monthlyCost: 310,
        statusText: 'RDS Standby Promoted to Primary in 8.4s'
      });
    }
  }, [activeScenario]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col selection:bg-amber-500/25 overflow-x-hidden awwwards-bg">
      {/* Dynamic Ambient Background Lights (Warm Amber, Soft Violet & Teal) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-amber-300/20 via-orange-200/10 to-transparent blur-[120px] animate-pulse" />
        <div className="absolute top-[25%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-bl from-violet-300/15 via-purple-200/10 to-transparent blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-tr from-emerald-300/15 via-cyan-200/10 to-transparent blur-[130px]" />
      </div>

      {/* Navigation Bar */}
      <nav className="h-20 px-6 sm:px-10 flex items-center justify-between border-b border-slate-200/90 backdrop-blur-2xl fixed top-0 left-0 right-0 z-50 bg-white/85 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20 border border-amber-300">
            <div className="w-4 h-4 rounded-sm border-2 border-white rotate-45 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-slate-900">CloudTwin</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold">
                AWS AI Twin
              </span>
            </div>
            <p className="text-[9px] text-slate-500 font-mono tracking-widest uppercase font-bold">WHAT-IF SIMULATION PLATFORM</p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-8 text-xs font-mono text-slate-600 font-semibold">
          <a href="#simulator-preview" className="hover:text-amber-700 transition-colors">Digital Twin Sandbox</a>
          <a href="#capabilities" className="hover:text-amber-700 transition-colors">Core Capabilities</a>
          <a href="#aws-services" className="hover:text-amber-700 transition-colors">11 AWS Services</a>
          <a href="#roi-calculator" className="hover:text-amber-700 transition-colors">ROI Calculator</a>
          <a href="#testimonials" className="hover:text-amber-700 transition-colors">Architect Reviews</a>
        </div>

        <div className="flex items-center gap-2.5">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block text-xs font-semibold text-slate-700">
                {user.full_name}
              </span>
              <button
                onClick={onEnterStudio}
                className="relative group overflow-hidden flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:via-orange-400 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02]"
              >
                <span className="font-mono uppercase tracking-wider text-[11px]">Go to Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-sm"
              >
                Register
              </button>
              <button
                onClick={onEnterStudio}
                className="hidden sm:flex relative group overflow-hidden items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all"
              >
                <span className="font-mono uppercase tracking-wider text-[10px]">Enter Studio</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-36 sm:pt-44 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-xs font-mono text-amber-800 mb-8 shadow-xs font-bold">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span className="tracking-wide">AI-Powered Digital Twin & What-If Simulation Engine for AWS</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-950 max-w-5xl leading-[1.06]">
          Model Cloud Architectures. <br />
          <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent">
            Simulate Chaos Before Deployment.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-600 max-w-3xl mt-7 leading-relaxed font-normal">
          CloudTwin empowers architects and engineering leads to visually compose 11 AWS cloud services, stress-test topologies against simulated traffic surges and AZ blackouts, audit real-time costs in USD ($) and INR (₹), and verify CIS benchmarks prior to production.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
          <button
            onClick={onEnterStudio}
            className="relative group overflow-hidden flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:via-orange-400 hover:to-amber-500 text-white font-bold text-sm shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.02]"
          >
            <div className="absolute inset-0 w-full h-full awwwards-shimmer opacity-30 pointer-events-none" />
            <Workflow className="w-4 h-4" />
            <span className="font-mono uppercase tracking-wider text-xs font-extrabold">{user ? 'Launch Digital Twin Workspace' : 'Enter Studio (Sign In / Register)'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {!user && (
            <button
              onClick={() => onOpenAuth('signup')}
              className="flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold font-mono tracking-wide transition-all shadow-xs"
            >
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Create Independent Account</span>
            </button>
          )}
        </div>

        {/* Live Badges Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl w-full mt-16 text-left">
          {[
            { label: 'Target Cloud', value: 'AWS ap-south-1 (Mumbai)', icon: Globe },
            { label: 'Live Database', value: 'AWS RDS Multi-AZ Postgres', icon: Database },
            { label: 'AI Advisor', value: 'Google Gemini 1.5 Flash', icon: Sparkles },
            { label: 'Security Model', value: 'CIS Foundations Benchmark', icon: ShieldCheck }
          ].map((b, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                <b.icon className="w-5 h-5 text-amber-600" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase text-slate-400 leading-tight font-bold">{b.label}</div>
                <div className="text-xs font-bold text-slate-900 truncate mt-0.5">{b.value}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Digital Twin Sandbox Preview */}
      <section id="simulator-preview" className="py-20 px-6 max-w-7xl mx-auto w-full relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <span className="text-[10px] font-mono uppercase px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold tracking-widest">
            Interactive Live Sandbox
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950">
            Experience What-If Simulation Live
          </h2>
          <p className="text-sm text-slate-600">
            Click any chaos scenario below to observe real-time failover, auto-scaling telemetry, and cost impact across an 11-service AWS Digital Twin topology.
          </p>
        </div>

        {/* Interactive Simulator Shell */}
        <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 relative overflow-hidden shadow-xl">
          {/* Scenario Selector Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-slate-500 mr-2 flex items-center gap-1.5 font-bold">
                <Radio className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                Inject Chaos Scenario:
              </span>
              {[
                { id: 'normal', label: '1. Baseline Load', badge: 'Normal' },
                { id: 'surge', label: '2. 10× Flash Crowd', badge: '12k RPS' },
                { id: 'az_outage', label: '3. AZ-1a Blackout', badge: 'Zone Outage' },
                { id: 'failover', label: '4. Primary RDS Failover', badge: 'Database Crash' }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveScenario(s.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 ${
                    activeScenario === s.id
                      ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold shadow-md shadow-amber-500/20'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-medium'
                  }`}
                >
                  <span>{s.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                    activeScenario === s.id ? 'bg-black/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {s.badge}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 font-mono text-xs text-emerald-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{simulationMetrics.statusText}</span>
            </div>
          </div>

          {/* Real-time Telemetry Readout Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-b border-slate-200">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">REQUEST VELOCITY</div>
              <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
                {simulationMetrics.rps.toLocaleString()} <span className="text-xs font-normal text-slate-500">req/s</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">P99 TAIL LATENCY</div>
              <div className="text-2xl font-bold font-mono mt-1 text-amber-600">
                {simulationMetrics.latencyMs} <span className="text-xs font-normal text-slate-500">ms</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">TWIN RESILIENCE SCORE</div>
              <div className="text-2xl font-bold font-mono mt-1 text-emerald-600">
                {simulationMetrics.healthScore}%
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">ESTIMATED INFRA SPEND</div>
              <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
                ${simulationMetrics.monthlyCost} <span className="text-xs font-normal text-slate-500">/mo</span>
              </div>
            </div>
          </div>

          {/* Interactive Topology Graph Visualizer */}
          <div className="pt-8 pb-4">
            <div className="relative min-h-[280px] sm:min-h-[320px] rounded-2xl canvas-grid-bg border border-slate-200 p-6 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500 font-bold">
                <span>CANVAS: ap-south-1 Production Topology</span>
                <span className="flex items-center gap-1.5 text-amber-700">
                  <Flame className="w-3.5 h-3.5" />
                  Live Packet Telemetry Active
                </span>
              </div>

              {/* Service Topology Pipeline Diagram */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 my-6 items-center">
                {/* Node 1: CloudFront CDN */}
                <div className="p-3.5 rounded-xl bg-white border border-cyan-300 shadow-sm space-y-1 text-center relative group">
                  <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center mx-auto text-cyan-600">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-slate-900">CloudFront</div>
                  <div className="text-[10px] font-mono text-slate-500">Edge Cache 94%</div>
                </div>

                {/* Node 2: ALB */}
                <div className="p-3.5 rounded-xl bg-white border border-purple-300 shadow-sm space-y-1 text-center relative group">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center mx-auto text-purple-600">
                    <Network className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-slate-900">Public ALB</div>
                  <div className="text-[10px] font-mono text-slate-500">Dual-AZ Target</div>
                </div>

                {/* Node 3: EC2 Workers */}
                <div className={`p-3.5 rounded-xl bg-white border shadow-sm space-y-1 text-center relative transition-all ${
                  activeScenario === 'surge'
                    ? 'border-amber-500 ring-2 ring-amber-400 shadow-md'
                    : 'border-orange-300'
                }`}>
                  <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto text-orange-600">
                    <Server className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-slate-900">EC2 Fleet</div>
                  <div className="text-[10px] font-mono text-amber-700 font-bold">
                    {activeScenario === 'surge' ? '6x t3.large (+3)' : '3x t3.large Auto'}
                  </div>
                </div>

                {/* Node 4: RDS Multi-AZ */}
                <div className={`p-3.5 rounded-xl bg-white border shadow-sm space-y-1 text-center relative transition-all ${
                  activeScenario === 'failover'
                    ? 'border-emerald-500 ring-2 ring-emerald-400 shadow-md'
                    : 'border-blue-300'
                }`}>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-600">
                    <Database className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-slate-900">RDS PostgreSQL</div>
                  <div className="text-[10px] font-mono text-slate-500">
                    {activeScenario === 'failover' ? 'Standby Promoted' : 'Multi-AZ Sync'}
                  </div>
                </div>

                {/* Node 5: S3 & DynamoDB */}
                <div className="p-3.5 rounded-xl bg-white border border-emerald-300 shadow-sm space-y-1 text-center relative group">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-slate-900">S3 Vault + Dynamo</div>
                  <div className="text-[10px] font-mono text-slate-500">11-9s Durability</div>
                </div>
              </div>

              {/* Bottom Actions inside Sandbox */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-200">
                <span className="text-xs text-slate-500 font-mono">
                  Canonical contract verified against Member 2 simulation engine & Member 3 cost intelligence.
                </span>

                <button
                  onClick={onEnterStudio}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 hover:border-amber-500 text-xs font-mono font-bold transition-all shadow-xs"
                >
                  <span>Open Full Canvas In Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Architectural Pillars Showcase */}
      <section id="capabilities" className="py-20 px-6 max-w-7xl mx-auto w-full relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-[10px] font-mono uppercase px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold tracking-widest">
            Core Engine Capabilities
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950">
            Everything You Need Before Production
          </h2>
          <p className="text-sm text-slate-600">
            Four specialized engines combined into a single, cohesive developer platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pillar 1 */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group space-y-4 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
              1. What-If Chaos & Traffic Simulation
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Inject 2× to 10× traffic surges, primary database failovers, and availability zone outages. Identify chokepoints and capacity exhaustion before your real users do.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-semibold">Burst Velocity</span>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-semibold">Tail Latency Modeling</span>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-semibold">Multi-AZ Blast Radius</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group space-y-4 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
              2. Real-Time AWS Cost Intelligence
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Calculates precise infrastructure run rates using official AWS pricing tables. Switch instantly between USD ($) and Indian Rupees (₹) with component-level granularity.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-semibold">Hourly vs Monthly Burn</span>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-semibold">USD & INR Currency Toggle</span>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-semibold">Idle Resource Detection</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group space-y-4 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-600 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-violet-700 transition-colors">
              3. CIS AWS Security Benchmark Scanning
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Detect public database port exposures, unencrypted S3 storage buckets, missing TLS 1.3 ELB policies, and non-compliant IAM bindings with 1-click remediation diffs.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-semibold">CIS Benchmark v1.4.0</span>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-semibold">Posture Health Score</span>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-semibold">Automated Remediation</span>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group space-y-4 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-orange-700 transition-colors">
              4. AI Solutions Architect (Google Gemini)
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Powered by Google Gemini LLM grounded with live simulation telemetry. Receives architectural recommendations tailored to latency bottlenecks and resilience goals.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-semibold">Gemini 1.5 Flash</span>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-semibold">Topology Diffs</span>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-semibold">Well-Architected Advice</span>
            </div>
          </div>
        </div>
      </section>

      {/* 11 AWS Native Services Showcase */}
      <section id="aws-services" className="py-20 px-6 max-w-7xl mx-auto w-full relative z-10 border-t border-slate-200">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-[10px] font-mono uppercase px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-300 font-bold tracking-widest">
            Full Cloud Spectrum
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950">
            11 Supported AWS Native Services
          </h2>
          <p className="text-sm text-slate-600">
            Every core AWS infrastructure pillar modeled with exact specifications, ports, protocols, and pricing.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { name: 'Amazon EC2', type: 'Compute Fleet', desc: 'Auto-scaling worker clusters with burst capacity', icon: Server, color: 'text-amber-600', bg: 'bg-amber-50' },
            { name: 'Amazon S3', type: 'Object Storage', desc: 'Encrypted statement vaults & static asset buckets', icon: HardDrive, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { name: 'Amazon RDS', type: 'Relational DB', desc: 'PostgreSQL Multi-AZ replication & automated snapshots', icon: Database, color: 'text-blue-600', bg: 'bg-blue-50' },
            { name: 'AWS Lambda', type: 'Serverless', desc: 'Event-driven compute with millisecond execution', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
            { name: 'Amazon API Gateway', type: 'API Ingress', desc: 'REST & HTTP rate-limiting and JWT token authorization', icon: Compass, color: 'text-orange-600', bg: 'bg-orange-50' },
            { name: 'Amazon CloudFront', type: 'Edge Delivery', desc: 'Global CDN distribution with low-latency edge caching', icon: Globe, color: 'text-cyan-600', bg: 'bg-cyan-50' },
            { name: 'Application Load Balancer', type: 'Traffic Router', desc: 'Multi-AZ layer 7 traffic distribution with TLS termination', icon: Network, color: 'text-purple-600', bg: 'bg-purple-50' },
            { name: 'Amazon VPC', type: 'Zero-Trust Net', desc: 'Isolated virtual cloud networks with CIDR segmentation', icon: Lock, color: 'text-pink-600', bg: 'bg-pink-50' },
            { name: 'NAT Gateway', type: 'Egress Router', desc: 'Secure outbound internet egress for private subnet workers', icon: Network, color: 'text-rose-600', bg: 'bg-rose-50' },
            { name: 'Amazon DynamoDB', type: 'NoSQL Store', desc: 'Single-digit millisecond latency state and session store', icon: Database, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { name: 'Amazon ECS Fargate', type: 'Containers', desc: 'Serverless container task execution without managing EC2', icon: Layers, color: 'text-teal-600', bg: 'bg-teal-50' },
            { name: 'AWS Security Hub', type: 'CIS Benchmark', desc: 'Continuous compliance scans and security auditing', icon: ShieldCheck, color: 'text-violet-600', bg: 'bg-violet-50' }
          ].map((svc, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 transition-all flex flex-col justify-between group shadow-xs hover:shadow-md">
              <div>
                <div className={`w-10 h-10 rounded-xl ${svc.bg} border border-slate-200 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                  <svc.icon className={`w-5 h-5 ${svc.color}`} />
                </div>
                <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">{svc.type}</div>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5 group-hover:text-amber-700 transition-colors">{svc.name}</h4>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">{svc.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive ROI Calculator Section */}
      <section id="roi-calculator" className="py-20 px-6 max-w-7xl mx-auto w-full relative z-10 border-t border-slate-200">
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <span className="text-[10px] font-mono uppercase px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold tracking-widest">
                Business & Financial ROI
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 leading-tight">
                Calculate What Digital Twin Simulation Saves You
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed">
                By modeling peak loads and testing failovers in CloudTwin before deploying to AWS, engineering teams eliminate costly over-provisioning and catastrophic downtime.
              </p>

              {/* Slider 1 */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <span className="text-slate-500">CURRENT MONTHLY AWS SPEND:</span>
                  <span className="text-slate-900">${awsMonthlySpend.toLocaleString()} /mo</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="100000"
                  step="1000"
                  value={awsMonthlySpend}
                  onChange={(e) => setAwsMonthlySpend(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
              </div>

              {/* Slider 2 */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <span className="text-slate-500">PRODUCTION DEPLOYMENTS PER MONTH:</span>
                  <span className="text-slate-900">{deploymentsPerMonth} releases</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="1"
                  value={deploymentsPerMonth}
                  onChange={(e) => setDeploymentsPerMonth(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
              </div>
            </div>

            {/* Projected Savings Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200 space-y-5">
              <div className="text-xs font-mono uppercase text-slate-500 tracking-wider font-bold">PROJECTED ANNUAL SAVINGS</div>

              <div className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 font-mono">
                ${totalAnnualRoi.toLocaleString()}
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-200 text-xs font-mono text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Downtime Incidents Prevented:</span>
                  <span className="text-emerald-700 font-bold">${(estimatedDowntimeSavings * 12).toLocaleString()} /yr</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Idle Cloud Waste Reduced:</span>
                  <span className="text-emerald-700 font-bold">${(estimatedCostReduction * 12).toLocaleString()} /yr</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Target AWS Region:</span>
                  <span className="text-slate-900 font-semibold">ap-south-1 (Mumbai)</span>
                </div>
              </div>

              <button
                onClick={onEnterStudio}
                className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:via-orange-400 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider font-mono shadow-md shadow-amber-500/20 transition-all"
              >
                Launch Workspace & Start Saving
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Verified Cloud Architect Testimonials */}
      <section id="testimonials" className="py-20 px-6 max-w-7xl mx-auto w-full relative z-10 border-t border-slate-200">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-[10px] font-mono uppercase px-3 py-1 rounded-full bg-violet-100 text-violet-800 border border-violet-300 font-bold tracking-widest">
            Architect Endorsements
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
            Trusted by Enterprise Platform Teams
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: "CloudTwin caught a NAT Gateway choke point and single-AZ RDS vulnerability in our banking platform during a simulated 5x traffic spike. Saved us an estimated $60,000 in downtime.",
              author: "Devendra Patil",
              role: "Head of Cloud Architecture, FinScale Technologies",
              tier: "Enterprise Tier"
            },
            {
              quote: "The multi-currency cost engine with INR ₹ and USD $ conversion gave our CFO complete clarity on our AWS Mumbai migration before we wrote a single line of Terraform.",
              author: "Ananya Iyer",
              role: "VP of Engineering, NeoPay India",
              tier: "FinTech Lead"
            },
            {
              quote: "The Gemini LLM recommendations are remarkably grounded. It recommended ALB sticky sessions and CloudFront TLS 1.3 policy upgrades that immediately elevated our security score to 98%.",
              author: "Marcus Chen",
              role: "Principal DevOps Architect, Global Cloud Partners",
              tier: "AWS Certified Architect"
            }
          ].map((t, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
              <p className="text-xs text-slate-600 leading-relaxed italic">"{t.quote}"</p>
              <div className="pt-3 border-t border-slate-100">
                <div className="text-sm font-bold text-slate-900">{t.author}</div>
                <div className="text-[11px] text-slate-500 font-medium">{t.role}</div>
                <span className="inline-block mt-2 text-[9px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                  {t.tier}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-24 px-6 max-w-5xl mx-auto w-full text-center relative z-10">
        <div className="p-10 sm:p-14 rounded-3xl bg-white border border-amber-300 relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950 leading-tight">
              Ready to Model Your Cloud Digital Twin?
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              Create an independent account, dynamically provision custom AWS workspaces, and simulate real failure conditions in seconds.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={onEnterStudio}
                className="relative group overflow-hidden flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:via-orange-400 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider font-mono shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.02]"
              >
                <div className="absolute inset-0 w-full h-full awwwards-shimmer opacity-30 pointer-events-none" />
                <span>Launch CloudTwin Studio Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {!user && (
                <>
                  <button
                    onClick={() => onOpenAuth('login')}
                    className="px-6 py-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-mono font-bold transition-all shadow-xs"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => onOpenAuth('signup')}
                    className="px-6 py-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-mono font-bold transition-all shadow-md shadow-amber-500/20"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-10 px-8 max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500 relative z-10 bg-white">
        <div className="flex items-center gap-2 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>CloudTwin Platform Engine • Connected to AWS RDS ap-south-1</span>
        </div>
        <div>
          © 2026 CloudTwin Inc. Multi-Tenant Digital Twin Architecture Platform.
        </div>
      </footer>
    </div>
  );
};
