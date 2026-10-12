'use client';

import React from 'react';
import { 
  DollarSign, 
  Coins, 
  TrendingUp, 
  AlertCircle, 
  ArrowUpRight, 
  PieChart as PieIcon, 
  BarChart3, 
  Server, 
  Cpu, 
  HardDrive, 
  Network,
  Sparkles 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { CostEstimate, ArchitectureSchema } from '../../types';

interface CostIntelligenceViewProps {
  costEstimate: CostEstimate | null;
  architecture: ArchitectureSchema;
  currency: 'USD' | 'INR';
  setCurrency: (c: 'USD' | 'INR') => void;
}

export const CostIntelligenceView: React.FC<CostIntelligenceViewProps> = ({
  costEstimate,
  architecture,
  currency,
  setCurrency
}) => {
  const symbol = currency === 'INR' ? '₹' : '$';

  if (!costEstimate) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50">
        <Coins className="w-12 h-12 text-slate-400 mb-3" />
        <h2 className="text-base font-bold text-slate-800">Cost Data Not Yet Calculated</h2>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Execute a simulation or run twin telemetry to estimate baseline AWS infrastructure costs.
        </p>
      </div>
    );
  }

  // Format data for comparison BarChart
  const chartData = costEstimate.breakdown_by_service.map((item) => ({
    name: item.name.split(' ')[0] || item.service_type,
    Baseline: item.baseline_cost,
    Simulated: item.simulated_cost
  }));

  return (
    <div className="w-full h-full overflow-y-auto p-8 space-y-8 bg-slate-50 text-slate-900">
      {/* Header Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-2 font-bold tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                AWS Pricing Calculator Engine
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-mono text-slate-500 font-medium">11 AWS Services Topology</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Cost Intelligence & What-If Projection
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              Fine-grained multi-currency cost estimation for <span className="text-amber-700 font-semibold">{architecture.name}</span> across steady-state baseline and peak simulation workloads.
            </p>
          </div>

          {/* Currency Switcher */}
          <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs font-mono shrink-0 shadow-xs">
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3.5 py-1.5 rounded-lg transition-all font-semibold ${
                currency === 'USD' 
                  ? 'bg-white text-slate-900 border border-slate-200/80 shadow-xs font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              $ USD (Global)
            </button>
            <button
              onClick={() => setCurrency('INR')}
              className={`px-3.5 py-1.5 rounded-lg transition-all font-semibold ${
                currency === 'INR' 
                  ? 'bg-white text-slate-900 border border-slate-200/80 shadow-xs font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ₹ INR (ap-south-1)
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards: Baseline, Simulated, Delta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Baseline Spend */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <div className="text-xs font-mono uppercase text-slate-500 font-semibold">Baseline Steady-State Spend</div>
          <div className="text-3xl font-extrabold text-slate-900">
            {symbol}{costEstimate.baseline_monthly_cost.toLocaleString()}
            <span className="text-xs font-normal text-slate-500"> / month</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono pt-2">
            Normal business operating capacity
          </div>
        </div>

        {/* Simulated Spend */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <div className="text-xs font-mono uppercase text-slate-500 font-semibold">Simulated Architecture Spend</div>
          <div className="text-3xl font-extrabold text-amber-600">
            {symbol}{costEstimate.simulated_monthly_cost.toLocaleString()}
            <span className="text-xs font-normal text-slate-500"> / month</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono pt-2">
            Includes auto-scaling instances and surged traffic
          </div>
        </div>

        {/* Cost Delta */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
          <div className="text-xs font-mono uppercase text-slate-500 font-semibold">Projected Variance (Delta)</div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-extrabold text-rose-600">
              +{symbol}{costEstimate.delta_monthly_cost.toLocaleString()}
            </div>
            <span className="text-xs font-bold text-rose-700 px-2 py-0.5 rounded-full bg-rose-100 border border-rose-300">
              +{costEstimate.delta_percentage}%
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono pt-2">
            Monthly differential during stress periods
          </div>
        </div>
      </div>

      {/* Service Breakdown Comparison BarChart */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Spend by Service: Baseline vs. Simulated Scenario</h3>
            <p className="text-xs text-slate-500">Direct component comparison across infrastructure tiers</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-400" /> Baseline Monthly
            </span>
            <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Simulated Monthly
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} tickFormatter={(val) => `${symbol}${val}`} />
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
              <Bar dataKey="Baseline" fill="#94A3B8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Simulated" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Service Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900">Itemized Component Cost Breakdown</h3>
          <span className="text-xs font-mono text-slate-500">{costEstimate.breakdown_by_service.length} Services Evaluated</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                <th className="pb-3 pl-2 font-bold">AWS Component</th>
                <th className="pb-3 font-bold">Type</th>
                <th className="pb-3 text-right font-bold">Baseline Cost</th>
                <th className="pb-3 text-right font-bold">Simulated Cost</th>
                <th className="pb-3 text-right pr-2 font-bold">Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {costEstimate.breakdown_by_service.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 pl-2 font-bold text-slate-900">{item.name}</td>
                  <td className="py-3 text-slate-600">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] border border-slate-200 font-semibold">
                      {item.service_type}
                    </span>
                  </td>
                  <td className="py-3 text-right text-slate-600">
                    {symbol}{item.baseline_cost.toFixed(2)}
                  </td>
                  <td className="py-3 text-right font-bold text-amber-600">
                    {symbol}{item.simulated_cost.toFixed(2)}
                  </td>
                  <td className="py-3 text-right pr-2 text-rose-600 font-semibold">
                    +{symbol}{(item.simulated_cost - item.baseline_cost).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
