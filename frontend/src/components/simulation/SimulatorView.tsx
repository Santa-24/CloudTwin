'use client';

import React, { useState, useMemo } from 'react';
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
  Sparkles,
  Sliders,
  Filter,
  BarChart3,
  ExternalLink
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
import { SimulationScenario, ArchitectureSchema, UnifiedAnalysisResult } from '../../types';

interface SimulatorViewProps {
  scenarios: SimulationScenario[];
  architecture: ArchitectureSchema;
  currentResult: UnifiedAnalysisResult | null;
  isRunning: boolean;
  onExecuteSimulation: (scenarioId: string, customParams?: Record<string, any>) => Promise<void>;
  currency: 'USD' | 'INR';
  onNavigateToCanvas?: () => void;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({
  scenarios,
  architecture,
  currentResult,
  isRunning,
  onExecuteSimulation,
  currency,
  onNavigateToCanvas
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    scenarios[0]?.id || 'scenario-traffic-10x'
  );
  const [executionStep, setExecutionStep] = useState<number>(0);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Interactive What-If Parameter Controls
  const [multiplier, setMultiplier] = useState<number>(10);
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [injectNodeFailure, setInjectNodeFailure] = useState<boolean>(false);
  const [injectAzOutage, setInjectAzOutage] = useState<boolean>(false);

  // Chart Metric Visibility Toggles
  const [showRps, setShowRps] = useState<boolean>(true);
  const [showLatency, setShowLatency] = useState<boolean>(true);
  const [showCpu, setShowCpu] = useState<boolean>(true);
  const [showErrors, setShowErrors] = useState<boolean>(false);

  // Sync parameters when scenario changes
  const handleSelectScenario = (sc: SimulationScenario) => {
    setSelectedScenarioId(sc.id);
    const p = sc.parameters || {};
    if (p.multiplier) setMultiplier(Number(p.multiplier));
    else if (sc.id.includes('2x')) setMultiplier(2);
    else if (sc.id.includes('5x')) setMultiplier(5);
    else if (sc.id.includes('10x')) setMultiplier(10);
    else setMultiplier(1);

    if (p.duration_minutes) setDurationMinutes(Number(p.duration_minutes));
    else setDurationMinutes(15);

    setInjectNodeFailure(sc.scenario_type === 'node_failure' || sc.id.includes('fail'));
    setInjectAzOutage(sc.scenario_type === 'zone_outage' || sc.id.includes('az-outage'));
  };

  const handleRun = async () => {
    setExecutionStep(1);
    const stepInterval = setInterval(() => {
      setExecutionStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 350);

    try {
      await onExecuteSimulation(selectedScenarioId, {
        multiplier,
        duration_minutes: durationMinutes,
        node_failure: injectNodeFailure,
        az_outage: injectAzOutage
      });
    } finally {
      clearInterval(stepInterval);
      setExecutionStep(0);
    }
  };

  const filteredScenarios = useMemo(() => {
    if (categoryFilter === 'all') return scenarios;
    if (categoryFilter === 'traffic') return scenarios.filter(s => s.scenario_type.includes('traffic'));
    if (categoryFilter === 'chaos') return scenarios.filter(s => s.scenario_type === 'node_failure' || s.scenario_type === 'network_congestion');
    if (categoryFilter === 'disaster') return scenarios.filter(s => s.scenario_type === 'zone_outage' || s.scenario_type === 'database_failover');
    return scenarios;
  }, [scenarios, categoryFilter]);

  const sim = currentResult?.simulation;
  const cost = currentResult?.cost;
  const symbol = currency === 'INR' ? '₹' : '$';

  // Format time-series metrics data for Recharts, ensuring valid numeric coordinates
  const chartData = useMemo(() => {
    if (!sim?.time_series_metrics || sim.time_series_metrics.length === 0) {
      // Generate default baseline curve if no simulation has been run yet
      return Array.from({ length: 16 }, (_, i) => ({
        timestamp_sec: i * 60,
        time_offset_seconds: i * 60,
        time_label: `${i}m`,
        requests_per_sec: 1200 + Math.round(Math.sin(i / 2) * 80),
        latency_p95_ms: 38.4 + Math.round(Math.cos(i / 3) * 4),
        cpu_utilization_pct: 42.0 + Math.round(Math.sin(i / 2) * 6),
        error_rate_pct: 0.02
      }));
    }

    return sim.time_series_metrics.map((pt, index) => {
      const sec = pt.timestamp_sec ?? pt.time_offset_seconds ?? (index * 60);
      const minutes = Math.floor(sec / 60);
      return {
        ...pt,
        timestamp_sec: sec,
        time_offset_seconds: sec,
        time_label: `${minutes}m`,
        requests_per_sec: Number(pt.requests_per_sec || 0),
        latency_p95_ms: Number(pt.latency_p95_ms || 0),
        cpu_utilization_pct: Number(pt.cpu_utilization_pct || 0),
        error_rate_pct: Number(pt.error_rate_pct || 0)
      };
    });
  }, [sim]);

  return (
    <div className="w-full h-full overflow-y-auto p-4 sm:p-8 space-y-8 bg-slate-50 text-slate-900">
      {/* Title & Header Banner */}
      <div className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200/90 relative overflow-hidden shadow-xs">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-2 font-bold tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Chaos Engine & What-If Core
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-mono text-slate-500 font-medium">
                AWS Digital Twin Telemetry
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Region: {architecture.region || 'ap-south-1'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              What-If Chaos & Stress Simulator
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              Stress-test <span className="text-amber-700 font-semibold">{architecture.name}</span> against real-world traffic surges, multi-AZ facility blackouts, worker node crashes, and network chokepoints before production rollout.
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="relative group overflow-hidden flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:via-orange-400 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0 disabled:opacity-50 cursor-pointer"
          >
            <Play className={`w-4 h-4 fill-current ${isRunning ? 'animate-pulse' : ''}`} />
            <span className="font-mono uppercase tracking-wider text-[11px]">
              {isRunning ? 'Injecting Chaos...' : 'Execute What-If Run'}
            </span>
          </button>
        </div>
      </div>

      {/* Scenario Selection Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-mono uppercase tracking-wider text-slate-800 font-bold flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              1. Select Stress Scenario
            </h2>
            <p className="text-xs text-slate-500">Pick an industry standard failure mode or traffic surge model</p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
            {[
              { id: 'all', label: 'All Scenarios' },
              { id: 'traffic', label: 'Traffic Surges' },
              { id: 'chaos', label: 'Node & Network Chaos' },
              { id: 'disaster', label: 'AZ / DB Failover' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  categoryFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scenarios Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredScenarios.map((sc) => {
            const isSelected = selectedScenarioId === sc.id;
            const isTraffic = sc.scenario_type.includes('traffic');
            const isFailover = sc.scenario_type.includes('failover') || sc.scenario_type.includes('zone');
            
            return (
              <div
                key={sc.id}
                onClick={() => handleSelectScenario(sc)}
                className={`p-5 rounded-2xl bg-white cursor-pointer border transition-all flex flex-col justify-between ${
                  isSelected 
                    ? 'border-amber-500 ring-2 ring-amber-400/40 bg-gradient-to-b from-amber-50/70 to-white shadow-md' 
                    : 'border-slate-200/90 hover:border-amber-300 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold ${
                      isTraffic 
                        ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                        : isFailover
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-violet-100 text-violet-800 border border-violet-300'
                    }`}>
                      {sc.scenario_type.replace('_', ' ')}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1.5">{sc.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{sc.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>{sc.parameters?.multiplier ? `${sc.parameters.multiplier}× Surge` : 'Failure Injection'}</span>
                  <span>{sc.parameters?.duration_minutes ? `${sc.parameters.duration_minutes}m Duration` : '15m Event'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive What-If Parameter Tuning Panel */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-slate-900">2. Tune What-If Parameters & Chaos Injections</h2>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Selected Scenario: <strong className="text-amber-800">{scenarios.find(s => s.id === selectedScenarioId)?.name || 'Custom Run'}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          {/* Multiplier Presets */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Traffic Load Multiplier</span>
              <span className="font-mono text-amber-600 text-xs font-extrabold">{multiplier}× Baseline</span>
            </label>
            <div className="flex items-center gap-1.5">
              {[2, 5, 10, 15, 20].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setMultiplier(val)}
                  className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                    multiplier === val
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {val}×
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">Injects spike relative to baseline 1,200 requests/sec</p>
          </div>

          {/* Event Duration */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Simulated Event Window</span>
              <span className="font-mono text-violet-600 text-xs font-extrabold">{durationMinutes} Minutes</span>
            </label>
            <div className="flex items-center gap-1.5">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDurationMinutes(mins)}
                  className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                    durationMinutes === mins
                      ? 'bg-violet-600 text-white border-violet-700 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">Evaluates auto-scaler warmup and cool-down lags</p>
          </div>

          {/* Chaos: EC2 Node Crash */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Compute Fleet Chaos</label>
            <button
              type="button"
              onClick={() => setInjectNodeFailure(!injectNodeFailure)}
              className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                injectNodeFailure
                  ? 'bg-rose-50 border-rose-300 text-rose-800'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <span className="text-xs font-medium flex items-center gap-2">
                <Zap className={`w-3.5 h-3.5 ${injectNodeFailure ? 'text-rose-600' : 'text-slate-400'}`} />
                Kill 50% Worker Instances
              </span>
              <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                injectNodeFailure ? 'bg-rose-200 text-rose-900' : 'bg-slate-200 text-slate-600'
              }`}>
                {injectNodeFailure ? 'ACTIVE' : 'OFF'}
              </span>
            </button>
            <p className="text-[11px] text-slate-500">Terminates EC2 worker pool instances mid-stream</p>
          </div>

          {/* Chaos: AZ Blackout */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Multi-AZ Resilience</label>
            <button
              type="button"
              onClick={() => setInjectAzOutage(!injectAzOutage)}
              className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                injectAzOutage
                  ? 'bg-rose-50 border-rose-300 text-rose-800'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <span className="text-xs font-medium flex items-center gap-2">
                <Flame className={`w-3.5 h-3.5 ${injectAzOutage ? 'text-rose-600' : 'text-slate-400'}`} />
                ap-south-1a Facility Blackout
              </span>
              <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                injectAzOutage ? 'bg-rose-200 text-rose-900' : 'bg-slate-200 text-slate-600'
              }`}>
                {injectAzOutage ? 'ACTIVE' : 'OFF'}
              </span>
            </button>
            <p className="text-[11px] text-slate-500">Simulates catastrophic AWS data center outage</p>
          </div>
        </div>
      </div>

      {/* Loading Steps State */}
      {isRunning && (
        <div className="p-6 rounded-2xl bg-white border border-amber-300 bg-amber-50/50 space-y-4 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" />
            <span className="text-xs font-mono text-amber-900 uppercase tracking-wider font-semibold">
              {executionStep <= 1 && 'Building AWS Topology Graph & Ingress Routes...'}
              {executionStep === 2 && `Injecting Chaos Load Vector (${multiplier}× Traffic Surge)...`}
              {executionStep === 3 && 'Evaluating Multi-AZ Latency & Provisioned Throughput...'}
              {executionStep >= 4 && 'Consolidating Performance & Auto-Scale Recommendations...'}
            </span>
          </div>
          <div className="w-full bg-amber-100 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300 rounded-full"
              style={{ width: `${Math.max(15, (executionStep / 4) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Simulation Results Dashboard */}
      {sim && !isRunning && (
        <div className="space-y-6">
          {/* Top Resilience Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Architecture Resilience Score */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <div className="text-xs font-mono uppercase text-slate-500 mb-1 font-semibold">Architecture Resilience</div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold tracking-tight text-emerald-600">{sim.health_score}%</span>
                <span className="text-xs text-slate-400 font-mono">/ 100</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    sim.health_score > 80 
                      ? 'bg-gradient-to-r from-emerald-500 to-amber-500' 
                      : 'bg-gradient-to-r from-amber-500 to-rose-500'
                  }`} 
                  style={{ width: `${sim.health_score}%` }}
                />
              </div>
            </div>

            {/* Performance Efficiency Score */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <div className="text-xs font-mono uppercase text-slate-500 mb-1 font-semibold">Performance Efficiency</div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold tracking-tight text-amber-600">{sim.performance_score}%</span>
                <span className="text-xs text-slate-400 font-mono">/ 100</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                  style={{ width: `${sim.performance_score}%` }} 
                />
              </div>
            </div>

            {/* Elastic Scalability Score */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <div className="text-xs font-mono uppercase text-slate-500 mb-1 font-semibold">Elastic Scalability</div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold tracking-tight text-violet-600">{sim.scalability_score}%</span>
                <span className="text-xs text-slate-400 font-mono">/ 100</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                <div 
                  className="h-full bg-violet-500 rounded-full transition-all duration-500" 
                  style={{ width: `${sim.scalability_score}%` }} 
                />
              </div>
            </div>

            {/* Cost Delta Impact */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <div className="text-xs font-mono uppercase text-slate-500 mb-1 font-semibold">Estimated Cost Impact</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                  +{symbol}{cost?.delta_monthly_cost ? Math.abs(cost.delta_monthly_cost).toLocaleString() : '0'}
                </span>
                <span className="text-xs font-bold text-rose-600">+{cost?.delta_percentage ?? 0}%</span>
              </div>
              <div className="text-[11px] font-mono text-slate-500 mt-2 font-medium">
                Baseline: {symbol}{cost?.baseline_monthly_cost?.toLocaleString() ?? 0} / mo
              </div>
            </div>
          </div>

          {/* Real-Time Key Telemetry KPI Ribbon */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <div className="text-[11px] font-mono uppercase text-slate-500 font-medium">Throughput Peak</div>
              <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                {sim.metrics?.simulated_rps ? sim.metrics.simulated_rps.toLocaleString() : '12,000'} <span className="text-xs font-mono font-normal text-slate-500">req/s</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-1">
                Base: {sim.metrics?.baseline_rps ? sim.metrics.baseline_rps.toLocaleString() : '1,200'} RPS
              </div>
            </div>

            <div>
              <div className="text-[11px] font-mono uppercase text-slate-500 font-medium">P95 / P99 Latency</div>
              <div className="text-lg font-extrabold text-violet-700 mt-0.5">
                {sim.metrics?.p95_latency_ms ?? 38.4} <span className="text-xs font-mono font-normal text-slate-500">ms</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-1">
                P99: {sim.metrics?.p99_latency_ms ?? 61.4} ms
              </div>
            </div>

            <div>
              <div className="text-[11px] font-mono uppercase text-slate-500 font-medium">Peak CPU Load</div>
              <div className="text-lg font-extrabold text-amber-700 mt-0.5">
                {sim.metrics?.max_cpu_pct ?? 78.2}%
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-1">
                Headroom: {(100 - (sim.metrics?.max_cpu_pct ?? 78.2)).toFixed(1)}%
              </div>
            </div>

            <div>
              <div className="text-[11px] font-mono uppercase text-slate-500 font-medium">Saturation Threshold</div>
              <div className="text-lg font-extrabold text-rose-700 mt-0.5">
                {sim.metrics?.saturation_point_rps ? sim.metrics.saturation_point_rps.toLocaleString() : '14,500'} <span className="text-xs font-mono font-normal text-slate-500">RPS</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-1">
                Breaking Point
              </div>
            </div>

            <div>
              <div className="text-[11px] font-mono uppercase text-slate-500 font-medium">Error Rate</div>
              <div className="text-lg font-extrabold text-emerald-700 mt-0.5">
                {sim.metrics?.error_rate_pct ?? 0.12}%
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-1">
                HTTP 5xx / Timeouts
              </div>
            </div>
          </div>

          {/* Time Series Stress Chart (Recharts) */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-amber-600" />
                  Live Workload & Latency Telemetry Curve ({durationMinutes}-Minute Event Timeline)
                </h3>
                <p className="text-xs text-slate-500">Dual-axis dynamic telemetry modeling computed by AWS digital twin engine</p>
              </div>

              {/* Interactive Metric Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setShowRps(!showRps)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    showRps ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold' : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Requests/sec
                </button>

                <button
                  type="button"
                  onClick={() => setShowLatency(!showLatency)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    showLatency ? 'bg-violet-50 text-violet-900 border-violet-300 font-bold' : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-sm bg-violet-500" /> P95 Latency (ms)
                </button>

                <button
                  type="button"
                  onClick={() => setShowCpu(!showCpu)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    showCpu ? 'bg-rose-50 text-rose-900 border-rose-300 font-bold' : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> CPU Load (%)
                </button>

                <button
                  type="button"
                  onClick={() => setShowErrors(!showErrors)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    showErrors ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold' : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Error Rate (%)
                </button>
              </div>
            </div>

            {/* Recharts Area Container */}
            <div className="w-full h-72 min-h-[280px]">
              <ResponsiveContainer width="100%" height="100%" minHeight={260} minWidth={0}>
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorError" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="time_label" 
                    stroke="#64748B" 
                    fontSize={11} 
                    tickLine={false}
                  />
                  {/* Left Y-axis: Throughput in Requests/sec */}
                  <YAxis 
                    yAxisId="throughput"
                    stroke="#D97706" 
                    fontSize={11}
                    tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : `${val}`}
                    tickLine={false}
                  />
                  {/* Right Y-axis: Latency (ms) / CPU (%) */}
                  <YAxis 
                    yAxisId="percentage"
                    orientation="right"
                    stroke="#7C3AED" 
                    fontSize={11}
                    domain={[0, 'auto']}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF', 
                      borderColor: '#CBD5E1', 
                      borderRadius: '12px', 
                      fontSize: '11px',
                      color: '#0F172A',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                    }} 
                    formatter={(value: any, name: any) => {
                      if (name === 'Throughput (RPS)') return [`${Number(value).toLocaleString()} req/s`, name];
                      if (name === 'Latency P95 (ms)') return [`${value} ms`, name];
                      if (name === 'CPU Load (%)') return [`${value}%`, name];
                      if (name === 'Error Rate (%)') return [`${value}%`, name];
                      return [value, name];
                    }}
                    labelFormatter={(label) => `Timeline Minute: +${label}`}
                  />
                  {showRps && (
                    <Area 
                      yAxisId="throughput"
                      type="monotone" 
                      dataKey="requests_per_sec" 
                      stroke="#D97706" 
                      strokeWidth={2.5} 
                      fillOpacity={1} 
                      fill="url(#colorRps)" 
                      name="Throughput (RPS)" 
                    />
                  )}
                  {showLatency && (
                    <Area 
                      yAxisId="percentage"
                      type="monotone" 
                      dataKey="latency_p95_ms" 
                      stroke="#7C3AED" 
                      strokeWidth={2} 
                      fillOpacity={1} 
                      fill="url(#colorLatency)" 
                      name="Latency P95 (ms)" 
                    />
                  )}
                  {showCpu && (
                    <Area 
                      yAxisId="percentage"
                      type="monotone" 
                      dataKey="cpu_utilization_pct" 
                      stroke="#E11D48" 
                      strokeWidth={2} 
                      fillOpacity={1} 
                      fill="url(#colorCpu)" 
                      name="CPU Load (%)" 
                    />
                  )}
                  {showErrors && (
                    <Area 
                      yAxisId="percentage"
                      type="monotone" 
                      dataKey="error_rate_pct" 
                      stroke="#059669" 
                      strokeWidth={2} 
                      fillOpacity={1} 
                      fill="url(#colorError)" 
                      name="Error Rate (%)" 
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

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
                  {sim.bottlenecks?.length || 0} Identified
                </span>
              </div>

              {!sim.bottlenecks || sim.bottlenecks.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  <span>No saturation bottlenecks detected under this workload. Architecture headroom is healthy.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {sim.bottlenecks.map((b, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Server className="w-3.5 h-3.5 text-slate-500" />
                          {b.resource_name}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          b.severity === 'CRITICAL' 
                            ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {b.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{b.summary}</p>
                      <div className="text-[11px] font-mono text-slate-500 flex flex-wrap items-center gap-3 pt-1 border-t border-slate-200/60">
                        <span>Metric: <strong className="text-slate-700">{b.metric}</strong></span>
                        <span>Threshold: <strong className="text-slate-700">{b.threshold_value}%</strong></span>
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
                  <h3 className="text-sm font-bold text-slate-900">Recommended Auto-Scaling Actions</h3>
                </div>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold">
                  Twin Remedy
                </span>
              </div>

              {!sim.scaling_requirements || sim.scaling_requirements.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  <span>Current fleet capacity accommodates scenario without manual scaling intervention.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {sim.scaling_requirements.map((s, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{s.resource_name}</span>
                        {onNavigateToCanvas && (
                          <button
                            type="button"
                            onClick={onNavigateToCanvas}
                            className="text-[10px] font-mono text-amber-700 hover:text-amber-800 flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            Apply on Canvas <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="text-slate-400 line-through">{s.current_capacity}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="text-amber-700 font-bold">{s.recommended_capacity}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{s.reason}</p>
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
