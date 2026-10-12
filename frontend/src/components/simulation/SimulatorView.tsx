'use client';

import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Zap, 
  Cpu, 
  ShieldAlert, 
  Coins, 
  ArrowRight,
  Server,
  Layers,
  Activity,
  Flame,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { SimulationScenario, SimulationResult, ArchitectureSchema, UnifiedAnalysisResult } from '../../types';

interface SimulatorViewProps {
  scenarios: SimulationScenario[];
  architecture: ArchitectureSchema;
  currentResult: UnifiedAnalysisResult | null;
  isRunning: boolean;
  onExecuteSimulation: (scenarioId: string) => Promise<void>;
  currency: 'USD' | 'INR';
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({
  scenarios,
  architecture,
  currentResult,
  isRunning,
  onExecuteSimulation,
  currency
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(scenarios[0]?.id || 'scenario-traffic-10x');
  const [executionStep, setExecutionStep] = useState<number>(0);

  const handleRun = async () => {
    // Step-by-step loading animation
    setExecutionStep(1);
    const stepInterval = setInterval(() => {
      setExecutionStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 350);

    try {
      await onExecuteSimulation(selectedScenarioId);
    } finally {
      clearInterval(stepInterval);
      setExecutionStep(0);
    }
  };

  const sim = currentResult?.simulation;
  const cost = currentResult?.cost;
  const sec = currentResult?.security;
  const symbol = currency === 'INR' ? '₹' : '$';

  return (
    <div className="w-full h-full overflow-y-auto p-8 space-y-8 bg-slate-50 text-slate-900">
      {/* Title & Header Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-2 font-bold tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Chaos Engine & What-If Core
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-mono text-slate-500 font-medium">AWS Digital Twin Telemetry</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              What-If Chaos & Stress Simulator
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              Stress-test <span className="text-amber-700 font-semibold">{architecture.name}</span> against real-world traffic surges, availability zone blackouts, and worker node crashes before production rollout.
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="relative group overflow-hidden flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:via-orange-400 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0 disabled:opacity-50"
          >
            <div className="absolute inset-0 w-full h-full awwwards-shimmer opacity-30 pointer-events-none" />
            <Play className="w-4 h-4 fill-current" />
            <span className="font-mono uppercase tracking-wider text-[11px]">
              {isRunning ? 'Executing Simulation...' : 'Execute What-If Run'}
            </span>
          </button>
        </div>
      </div>

      {/* Scenario Selection Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">1. Select Stress Scenario</span>
          <span className="text-xs text-slate-500 font-mono">{scenarios.length} Scenarios Available</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {scenarios.map((sc) => {
            const isSelected = selectedScenarioId === sc.id;
            const isTraffic = sc.scenario_type.includes('traffic');
            return (
              <div
                key={sc.id}
                onClick={() => setSelectedScenarioId(sc.id)}
                className={`p-5 rounded-2xl bg-white cursor-pointer border transition-all shadow-xs flex flex-col justify-between ${
                  isSelected 
                    ? 'border-amber-400 ring-2 ring-amber-400/40 bg-gradient-to-b from-amber-50/70 to-white shadow-md' 
                    : 'border-slate-200 hover:border-amber-400/70 hover:shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold ${
                      isTraffic 
                        ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {sc.scenario_type.replace('_', ' ')}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">{sc.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{sc.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Loading Steps State */}
      {isRunning && (
        <div className="p-6 rounded-2xl bg-white border border-amber-300 bg-amber-50/50 space-y-4 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" />
            <span className="text-xs font-mono text-amber-900 uppercase tracking-wider font-semibold">
              {executionStep === 1 && 'Building AWS Topology Graph & Ingress Routes...'}
              {executionStep === 2 && 'Injecting Chaos Load Vector (10× Traffic Surge)...'}
              {executionStep === 3 && 'Evaluating Multi-AZ Latency & Provisioned Throughput...'}
              {executionStep >= 4 && 'Consolidating Performance & Scaling Recommendations...'}
            </span>
          </div>
          <div className="w-full bg-amber-100 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300 rounded-full"
              style={{ width: `${(executionStep / 4) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Simulation Results Dashboard */}
      {sim && !isRunning && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* System Health Score */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <div className="text-xs font-mono uppercase text-slate-500 mb-1 font-semibold">Architecture Resilience</div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold tracking-tight text-emerald-600">{sim.health_score}%</span>
                <span className="text-xs text-slate-400 font-mono">/ 100</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${sim.health_score > 80 ? 'bg-gradient-to-r from-emerald-500 to-amber-500' : 'bg-gradient-to-r from-amber-500 to-rose-500'}`} 
                  style={{ width: `${currentResult?.health_score}%` }}
                />
              </div>
            </div>

            {/* Performance Score */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <div className="text-xs font-mono uppercase text-slate-500 mb-1 font-semibold">Performance Efficiency</div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold tracking-tight text-amber-600">{sim.performance_score}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${sim.performance_score}%` }} />
              </div>
            </div>

            {/* Scalability Score */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <div className="text-xs font-mono uppercase text-slate-500 mb-1 font-semibold">Elastic Scalability</div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold tracking-tight text-violet-600">{sim.scalability_score}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full" style={{ width: `${sim.scalability_score}%` }} />
              </div>
            </div>

            {/* Cost Delta Summary */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <div className="text-xs font-mono uppercase text-slate-500 mb-1 font-semibold">Estimated Cost Impact</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                  +{symbol}{cost?.delta_monthly_cost ? Math.abs(cost.delta_monthly_cost).toLocaleString() : '0'}
                </span>
                <span className="text-xs font-bold text-rose-600">+{cost?.delta_percentage}%</span>
              </div>
              <div className="text-[11px] font-mono text-slate-500 mt-2 font-medium">
                Baseline: {symbol}{cost?.baseline_monthly_cost.toLocaleString()} / mo
              </div>
            </div>
          </div>

          {/* Time Series Stress Chart (Recharts) */}
          {sim.time_series_metrics && sim.time_series_metrics.length > 0 && (
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Live Traffic & Latency Curve (15-Minute Event Timeline)</h3>
                  <p className="text-xs text-slate-500">Dynamic telemetry modeling computed by digital twin engine</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Requests/sec
                  </span>
                  <span className="flex items-center gap-1.5 text-violet-700 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-sm bg-violet-500" /> P95 Latency (ms)
                  </span>
                  <span className="flex items-center gap-1.5 text-rose-700 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> CPU Load (%)
                  </span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sim.time_series_metrics}>
                    <defs>
                      <linearGradient id="colorRps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="time_offset_seconds" 
                      tickFormatter={(sec) => `${Math.floor(sec / 60)}m`} 
                      stroke="#64748B" 
                      fontSize={11} 
                    />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#FFFFFF', 
                        borderColor: '#E2E8F0', 
                        borderRadius: '12px', 
                        fontSize: '11px',
                        color: '#0F172A',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                      }} 
                    />
                    <Area type="monotone" dataKey="requests_per_sec" stroke="#D97706" strokeWidth={2} fillOpacity={1} fill="url(#colorRps)" name="Throughput (RPS)" />
                    <Area type="monotone" dataKey="latency_p95_ms" stroke="#7C3AED" strokeWidth={2} fillOpacity={1} fill="url(#colorLatency)" name="Latency P95 (ms)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Bottlenecks and Scaling Requirements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bottlenecks */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-600" />
                  <h3 className="text-sm font-bold text-slate-900">Detected System Bottlenecks</h3>
                </div>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 font-bold">
                  {sim.bottlenecks.length} Identified
                </span>
              </div>

              {sim.bottlenecks.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No saturation bottlenecks detected under this workload.
                </div>
              ) : (
                <div className="space-y-3">
                  {sim.bottlenecks.map((b, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{b.resource_name}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          b.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {b.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{b.summary}</p>
                      <div className="text-[11px] font-mono text-slate-500 flex items-center gap-3 pt-1">
                        <span>Metric: {b.metric}</span>
                        <span>Threshold: {b.threshold_value}%</span>
                        <span className="text-rose-600 font-bold">Observed: {b.observed_value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Scaling Requirements */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-bold text-slate-900">Recommended Scaling Actions</h3>
                </div>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold">
                  Twin Auto-Scale
                </span>
              </div>

              {sim.scaling_requirements.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  Current fleet capacity accommodates scenario without manual scaling intervention.
                </div>
              ) : (
                <div className="space-y-3">
                  {sim.scaling_requirements.map((s, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="text-xs font-bold text-slate-800">{s.resource_name}</div>
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="text-slate-400 line-through">{s.current_capacity}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-amber-700 font-bold">{s.recommended_capacity}</span>
                      </div>
                      <p className="text-[11px] text-slate-600">{s.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
