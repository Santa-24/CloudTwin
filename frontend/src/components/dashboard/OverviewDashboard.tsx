'use client';

import React from 'react';
import { 
  Play, 
  Workflow, 
  Activity, 
  DollarSign, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Globe,
  Radio,
  Zap,
  Cpu,
  Server,
  HardDrive,
  Database,
  Network,
  ExternalLink,
  Flame,
  ArrowUpRight,
  TrendingDown,
  RefreshCw
} from 'lucide-react';
import { ArchitectureSchema, Project, UnifiedAnalysisResult } from '../../types';

interface OverviewDashboardProps {
  currentProject: Project | null;
  architecture: ArchitectureSchema;
  analysis: UnifiedAnalysisResult | null;
  currency: 'USD' | 'INR';
  onNavigate: (tab: string) => void;
  onRunSimulation: (scenarioId?: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  currentProject,
  architecture,
  analysis,
  currency,
  onNavigate,
  onRunSimulation
}) => {
  const symbol = currency === 'INR' ? '₹' : '$';
  const currencyMultiplier = currency === 'INR' ? 83.5 : 1.0;
  const cost = analysis?.cost;
  const sec = analysis?.security;

  const nodes = architecture.nodes || [];
  const computeNodes = nodes.filter(n => n.category === 'compute' || ['EC2', 'ECS', 'LAMBDA'].includes(n.type.toUpperCase()));
  const databaseNodes = nodes.filter(n => n.category === 'database' || ['RDS', 'DYNAMODB', 'AURORA'].includes(n.type.toUpperCase()));
  const storageNodes = nodes.filter(n => n.category === 'storage' || ['S3', 'EBS'].includes(n.type.toUpperCase()));
  const networkNodes = nodes.filter(n => n.category === 'network' || ['ALB', 'CLOUDFRONT', 'VPC', 'NAT_GATEWAY', 'API_GATEWAY'].includes(n.type.toUpperCase()));

  const totalMonthlySpend = cost?.baseline_monthly_cost 
    ? Math.round(cost.baseline_monthly_cost)
    : Math.round(948 * currencyMultiplier);

  return (
    <div className="w-full h-full overflow-y-auto p-8 space-y-8 bg-slate-50 text-slate-900">
      {/* Hero Welcome Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 relative overflow-hidden shadow-sm">
        {/* Dynamic Prismatic Nebula Glows (Light Theme) */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-10 left-1/3 w-60 h-60 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[10px] font-mono uppercase px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-2 font-bold tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Cloud Digital Twin
              </span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs font-mono text-slate-600 tracking-wider flex items-center gap-1.5 font-medium">
                <Globe className="w-3.5 h-3.5 text-amber-600" />
                AWS {architecture.region || 'ap-south-1'}
              </span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300 font-bold">
                Workspace: {currentProject?.name || 'Production'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {architecture.name}
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              {architecture.description || 'Production topology with CloudFront edge caching, ALB, Auto-scaling API pool, and Multi-AZ RDS.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onRunSimulation('scenario-traffic-10x')}
                className="relative group overflow-hidden flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:via-orange-400 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="absolute inset-0 w-full h-full awwwards-shimmer opacity-30 pointer-events-none" />
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="tracking-wider uppercase font-mono text-[11px]">Simulate 10× Spike</span>
              </button>

              <button
                onClick={() => onNavigate('resources')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-amber-400 text-slate-800 text-xs font-semibold transition-all shadow-xs group font-mono"
              >
                <Cpu className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition-transform" />
                <span>Audit {nodes.length} AWS Resources</span>
              </button>

              <button
                onClick={() => onNavigate('architectures')}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors"
              >
                <Workflow className="w-3.5 h-3.5 text-slate-500" />
                <span>Designer Canvas</span>
              </button>
            </div>
          </div>

          {/* Quick Architecture Status Pill */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 lg:w-72 shrink-0 space-y-3">
            <div className="text-[10px] font-mono uppercase text-slate-500 tracking-wider font-bold">TWIN TELEMETRY STATUS</div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-slate-900 font-mono">{nodes.length} Services</span>
              <span className="text-xs font-mono text-emerald-700 font-bold">100% In-Sync</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex">
              <div className="bg-amber-500 h-full" style={{ width: `${(computeNodes.length / (nodes.length || 1)) * 100}%` }} title="Compute" />
              <div className="bg-blue-500 h-full" style={{ width: `${(databaseNodes.length / (nodes.length || 1)) * 100}%` }} title="Database" />
              <div className="bg-emerald-500 h-full" style={{ width: `${(storageNodes.length / (nodes.length || 1)) * 100}%` }} title="Storage" />
              <div className="bg-purple-500 h-full" style={{ width: `${(networkNodes.length / (nodes.length || 1)) * 100}%` }} title="Network" />
            </div>
            <div className="text-[10px] text-slate-500 flex items-center justify-between font-mono pt-1">
              <span>PostgreSQL Multi-AZ</span>
              <span>Encrypted KMS</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Architecture Health */}
        <div 
          onClick={() => onNavigate('simulator')}
          className="p-6 rounded-2xl bg-white border border-slate-200 cursor-pointer hover:border-emerald-400 transition-all group relative overflow-hidden shadow-xs hover:shadow-md"
        >
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2 font-bold">
            <span>Resilience Rating</span>
            <Activity className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {analysis?.health_score || 88.5}%
          </div>
          <div className="text-[11px] text-emerald-700 font-mono mt-2 flex items-center gap-1.5 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> 
            <span>Optimal Failover Tolerant</span>
          </div>
        </div>

        {/* Monthly Cost */}
        <div 
          onClick={() => onNavigate('cost')}
          className="p-6 rounded-2xl bg-white border border-slate-200 cursor-pointer hover:border-amber-400 transition-all group relative overflow-hidden shadow-xs hover:shadow-md"
        >
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2 font-bold">
            <span>Estimated Monthly</span>
            <DollarSign className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {symbol}{totalMonthlySpend.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-2 flex items-center justify-between">
            <span>AWS Mumbai ap-south-1</span>
            <span className="text-amber-700 text-[10px] font-bold">Real-Time Rates</span>
          </div>
        </div>

        {/* Security Findings */}
        <div 
          onClick={() => onNavigate('security')}
          className="p-6 rounded-2xl bg-white border border-slate-200 cursor-pointer hover:border-orange-400 transition-all group relative overflow-hidden shadow-xs hover:shadow-md"
        >
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2 font-bold">
            <span>CIS Security Posture</span>
            <ShieldCheck className="w-4 h-4 text-orange-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {sec?.security_score || 94}/100
          </div>
          <div className="text-[11px] text-emerald-700 font-mono mt-2 flex items-center gap-1.5 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> 
            <span>Zero Public DB Ingress</span>
          </div>
        </div>

        {/* Architecture Components */}
        <div 
          onClick={() => onNavigate('resources')}
          className="p-6 rounded-2xl bg-white border border-slate-200 cursor-pointer hover:border-violet-400 transition-all group relative overflow-hidden shadow-xs hover:shadow-md"
        >
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2 font-bold">
            <span>Active AWS Resources</span>
            <Cpu className="w-4 h-4 text-violet-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {nodes.length} <span className="text-sm font-normal text-slate-500 font-mono">Nodes</span>
          </div>
          <div className="text-[11px] text-amber-700 font-mono mt-2 flex items-center gap-1.5 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Click to Audit All Services</span>
          </div>
        </div>
      </div>

      {/* Dedicated AWS Resources Allocation Bar */}
      <div className="p-7 rounded-3xl bg-white border border-slate-200 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold">
                Cloud Inventory Telemetry
              </span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs font-mono text-slate-500 font-medium">AWS Resource Allocation Matrix</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">AWS Infrastructure Being Used</h3>
          </div>

          <button
            onClick={() => onNavigate('resources')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-mono font-bold transition-all shadow-xs"
          >
            <span>Open Full Resource Inspector</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Compute */}
          <div 
            onClick={() => onNavigate('resources')}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-400 cursor-pointer transition-all space-y-2 group shadow-2xs"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                <Server className="w-3.5 h-3.5 text-amber-600" />
                Compute Fleet
              </span>
              <span className="font-bold text-slate-900">{computeNodes.length}</span>
            </div>
            <div className="text-xs text-slate-800 font-semibold">
              EC2 Auto-Scaling, ECS, Lambda
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Target: Dual-AZ worker pods
            </div>
          </div>

          {/* Database */}
          <div 
            onClick={() => onNavigate('resources')}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 cursor-pointer transition-all space-y-2 group shadow-2xs"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                <Database className="w-3.5 h-3.5 text-blue-600" />
                Database Engine
              </span>
              <span className="font-bold text-slate-900">{databaseNodes.length}</span>
            </div>
            <div className="text-xs text-slate-800 font-semibold">
              RDS Multi-AZ, DynamoDB
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Standby replica in ap-south-1b
            </div>
          </div>

          {/* Storage */}
          <div 
            onClick={() => onNavigate('resources')}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-400 cursor-pointer transition-all space-y-2 group shadow-2xs"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
                Object Storage
              </span>
              <span className="font-bold text-slate-900">{storageNodes.length}</span>
            </div>
            <div className="text-xs text-slate-800 font-semibold">
              Encrypted S3 Vaults
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              SSE-KMS, Versioning Active
            </div>
          </div>

          {/* Network */}
          <div 
            onClick={() => onNavigate('resources')}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-purple-400 cursor-pointer transition-all space-y-2 group shadow-2xs"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                <Network className="w-3.5 h-3.5 text-purple-600" />
                Network & Ingress
              </span>
              <span className="font-bold text-slate-900">{networkNodes.length}</span>
            </div>
            <div className="text-xs text-slate-800 font-semibold">
              CloudFront, ALB, VPC, NAT GW
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Edge caching & CIDR segmentation
            </div>
          </div>
        </div>
      </div>

      {/* Chaos Injection Action Bar */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-600 animate-pulse" />
            <h3 className="text-base font-bold text-slate-900">Instant Chaos Simulation Triggers</h3>
          </div>
          <span className="text-xs font-mono text-slate-500">Zero Production Impact</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => onRunSimulation('scenario-traffic-10x')}
            className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-amber-400 text-left transition-all group shadow-2xs"
          >
            <div className="flex items-center justify-between text-xs font-mono text-amber-800 font-bold mb-1">
              <span>10× Flash Crowd Event</span>
              <Play className="w-3.5 h-3.5 group-hover:scale-110 transition-transform text-amber-600" />
            </div>
            <p className="text-xs text-slate-600">Surge traffic to 12,000 req/s to test EC2 auto-scaling thresholds.</p>
          </button>

          <button
            onClick={() => onRunSimulation('scenario-db-failover')}
            className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-blue-400 text-left transition-all group shadow-2xs"
          >
            <div className="flex items-center justify-between text-xs font-mono text-blue-800 font-bold mb-1">
              <span>RDS Multi-AZ Failover</span>
              <Play className="w-3.5 h-3.5 group-hover:scale-110 transition-transform text-blue-600" />
            </div>
            <p className="text-xs text-slate-600">Trigger simulated crash of primary DB node and evaluate promotion time.</p>
          </button>

          <button
            onClick={() => onRunSimulation('scenario-az-outage')}
            className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-rose-400 text-left transition-all group shadow-2xs"
          >
            <div className="flex items-center justify-between text-xs font-mono text-rose-800 font-bold mb-1">
              <span>AZ-1a Blackout Outage</span>
              <Play className="w-3.5 h-3.5 group-hover:scale-110 transition-transform text-rose-600" />
            </div>
            <p className="text-xs text-slate-600">Sever availability zone networking to verify cross-zone ALB rerouting.</p>
          </button>
        </div>
      </div>

      {/* Middle Split: Architecture Topology Summary & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Components List (7 cols) */}
        <div className="lg:col-span-7 p-7 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Active Node Topology</h3>
              <p className="text-xs text-slate-500">Inspected from AWS RDS Digital Twin baseline</p>
            </div>
            <button
              onClick={() => onNavigate('architectures')}
              className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 transition-colors"
            >
              <span>Canvas View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {nodes.map((node) => (
              <div 
                key={node.id} 
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-400 flex items-center justify-between text-xs font-mono transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" />
                  <div>
                    <span className="font-bold text-slate-900">{node.name}</span>
                    <span className="text-[11px] text-slate-500 ml-2">({node.type})</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-600">
                  <span className="text-slate-800 font-medium">{node.config.instance_type || `${node.config.storage_gb || 50} GB`}</span>
                  <span className="uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 font-bold text-[10px]">
                    {node.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: AI Insights Quick Card (5 cols) */}
        <div className="lg:col-span-5 p-7 rounded-2xl bg-white border border-slate-200 space-y-4 flex flex-col justify-between shadow-sm">
          <div className="space-y-3.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <h3 className="text-base font-bold text-slate-900 tracking-tight">AI Architecture Advisor</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Google Gemini analyzed your recent topology. A potential bottleneck was identified during simulated load surges on the single-node compute tier.
            </p>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2 text-xs font-mono shadow-xs">
              <div className="text-amber-800 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                Top Recommendation:
              </div>
              <div className="text-slate-700 leading-normal font-sans">
                Attach an Application Load Balancer (ALB) and configure Auto-Scaling Group with Min: 2, Max: 8 instances.
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-500">Estimated Cost Impact: +$16.40/mo</span>
            <button
              onClick={() => onNavigate('recommendations')}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 transition-colors"
            >
              <span>View All AI Advice</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
