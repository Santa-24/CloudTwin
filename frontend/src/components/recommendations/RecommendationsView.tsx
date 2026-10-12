'use client';

import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Shield, 
  DollarSign, 
  TrendingUp, 
  Check, 
  AlertCircle
} from 'lucide-react';
import { ArchitectureRecommendation, ArchitectureSchema } from '../../types';

interface RecommendationsViewProps {
  recommendations: ArchitectureRecommendation[];
  architecture: ArchitectureSchema;
  onApplyRecommendation: (rec: ArchitectureRecommendation) => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  recommendations,
  architecture,
  onApplyRecommendation
}) => {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50">
        <Sparkles className="w-12 h-12 text-slate-400 mb-3" />
        <h2 className="text-base font-bold text-slate-800">No Recommendations Generated Yet</h2>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Run a simulation against <span className="text-amber-700 font-semibold">{architecture.name}</span> to generate intelligent topology proposals.
        </p>
      </div>
    );
  }

  const getPriorityBadge = (p: string) => {
    switch (p.toLowerCase()) {
      case 'critical': return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto p-8 space-y-8 bg-slate-50 text-slate-900">
      {/* Header Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-3 py-1 rounded-full bg-violet-100 text-violet-800 border border-violet-300 flex items-center gap-1.5 font-bold tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                AI Neural Advisor
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-mono text-slate-500 font-medium">AWS Well-Architected Framework</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              AI Architecture Recommendations
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              Actionable topology improvements synthesized from your digital twin stress simulations and cost curves.
            </p>
          </div>

          <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold shrink-0">
            {recommendations.length} Active Optimization Proposals
          </span>
        </div>
      </div>

      {/* Recommended Topology Flow Banner */}
      <div className="p-6 rounded-2xl bg-white border border-amber-300/80 bg-gradient-to-r from-amber-50/50 via-white to-violet-50/50 space-y-3 shadow-xs">
        <div className="text-xs font-mono uppercase text-amber-800 font-bold tracking-wider">
          CloudTwin Canonical Reference Topology
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-700">
          <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 font-medium">Internet Users</span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
          <span className="px-3.5 py-1.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 font-semibold">CloudFront Edge</span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
          <span className="px-3.5 py-1.5 rounded-xl bg-orange-100 border border-orange-300 text-orange-900 font-semibold">Application Load Balancer</span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
          <span className="px-3.5 py-1.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 font-semibold">Auto-Scaling EC2 Fleet</span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
          <span className="px-3.5 py-1.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 font-semibold">Multi-AZ RDS PostgreSQL</span>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="space-y-4">
        {recommendations.map((rec) => (
          <div key={rec.id} className="p-6 rounded-2xl bg-white border border-slate-200/90 space-y-4 hover:border-amber-400/80 shadow-xs hover:shadow-sm transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border font-bold ${getPriorityBadge(rec.priority)}`}>
                  {rec.priority} Priority
                </span>
                <span className="text-xs font-mono text-slate-500 font-medium">{rec.category}</span>
              </div>
              <button
                onClick={() => onApplyRecommendation(rec)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-all self-start sm:self-auto hover:scale-[1.02]"
              >
                <span>Preview In Canvas</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
              </button>
            </div>

            {/* Title & Reason */}
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">{rec.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{rec.reason}</p>
            </div>

            {/* Impact Statement */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <strong className="text-amber-800 font-bold">Architectural Impact:</strong> {rec.impact}
            </div>

            {/* Multi-Dimensional Impact Pill Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                  <span className="font-medium">Cost Impact</span>
                </div>
                <div className="text-slate-900 font-bold text-[11px]">{rec.cost_impact}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-medium">Security Impact</span>
                </div>
                <div className="text-slate-900 font-bold text-[11px]">{rec.security_impact}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <TrendingUp className="w-3.5 h-3.5 text-violet-600" />
                  <span className="font-medium">Scalability Impact</span>
                </div>
                <div className="text-slate-900 font-bold text-[11px]">{rec.scalability_impact}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
