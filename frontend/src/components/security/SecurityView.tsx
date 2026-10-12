'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Info, 
  ChevronRight, 
  CheckCircle2, 
  Lock, 
  Server,
  Sparkles 
} from 'lucide-react';
import { SecurityOverview, SecurityFinding, ArchitectureSchema } from '../../types';

interface SecurityViewProps {
  securityOverview: SecurityOverview | null;
  architecture: ArchitectureSchema;
}

export const SecurityView: React.FC<SecurityViewProps> = ({
  securityOverview,
  architecture
}) => {
  const [selectedFinding, setSelectedFinding] = useState<SecurityFinding | null>(
    securityOverview?.findings?.[0] || null
  );

  if (!securityOverview) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50">
        <ShieldCheck className="w-12 h-12 text-slate-400 mb-3" />
        <h2 className="text-base font-bold text-slate-800">Security Audit Not Yet Run</h2>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Perform a digital twin analysis to check your topology against CIS AWS Foundations Benchmark.
        </p>
      </div>
    );
  }

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL': return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MEDIUM': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'LOW': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto p-8 space-y-8 bg-slate-50 text-slate-900">
      {/* Header Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-2 font-bold tracking-widest">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                CIS AWS Foundations v3.0 Benchmark
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-mono text-slate-500 font-medium">Security Hub Rules Scanner</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Security & Posture Intelligence
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              Continuous compliance auditing, public exposure detection, and encryption verification for <span className="text-amber-700 font-semibold">{architecture.name}</span>.
            </p>
          </div>

          {/* Risk Level Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <div className={`px-5 py-3 rounded-2xl border flex items-center gap-2.5 font-bold text-xs uppercase font-mono tracking-wider shadow-xs ${
              securityOverview.overall_risk_level === 'CRITICAL' 
                ? 'bg-rose-100 border-rose-300 text-rose-800' 
                : securityOverview.overall_risk_level === 'HIGH'
                ? 'bg-orange-100 border-orange-300 text-orange-800'
                : 'bg-emerald-100 border-emerald-300 text-emerald-800'
            }`}>
              <ShieldAlert className="w-4 h-4" />
              <span>RISK LEVEL: {securityOverview.overall_risk_level}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Counters Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-semibold">Security Score</div>
          <div className="text-3xl font-extrabold text-amber-600 mt-1">{securityOverview.security_score}/100</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-semibold">Critical Risks</div>
          <div className="text-3xl font-extrabold text-rose-600 mt-1">{securityOverview.critical_count}</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-semibold">High Risks</div>
          <div className="text-3xl font-extrabold text-orange-600 mt-1">{securityOverview.high_count}</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-semibold">Medium Risks</div>
          <div className="text-3xl font-extrabold text-amber-600 mt-1">{securityOverview.medium_count}</div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-semibold">Low / Info</div>
          <div className="text-3xl font-extrabold text-slate-700 mt-1">{securityOverview.low_count}</div>
        </div>
      </div>

      {/* Findings Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List of Findings (5 cols) */}
        <div className="lg:col-span-5 space-y-2">
          <div className="text-xs font-mono uppercase text-slate-500 px-1 mb-2 tracking-wider font-semibold">
            Identified Vulnerabilities ({securityOverview.findings.length})
          </div>

          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
            {securityOverview.findings.map((finding) => {
              const isSelected = selectedFinding?.id === finding.id;
              return (
                <div
                  key={finding.id}
                  onClick={() => setSelectedFinding(finding)}
                  className={`p-4 rounded-2xl bg-white cursor-pointer border transition-all shadow-xs ${
                    isSelected
                      ? 'border-amber-400 ring-2 ring-amber-400/40 bg-gradient-to-b from-amber-50/70 to-white shadow-md'
                      : 'border-slate-200 hover:border-amber-400/70 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border font-bold ${getSeverityBadge(finding.severity)}`}>
                      {finding.severity}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 font-medium">{finding.category}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{finding.title}</h4>
                  <div className="text-[11px] text-slate-600 font-mono mt-1 flex items-center gap-1.5">
                    <Server className="w-3 h-3 text-amber-600 shrink-0" />
                    <span className="truncate">{finding.affected_resource_name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Finding Detail Inspector (7 cols) */}
        <div className="lg:col-span-7">
          {selectedFinding ? (
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-6">
              {/* Finding Header */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border font-bold ${getSeverityBadge(selectedFinding.severity)}`}>
                    {selectedFinding.severity}
                  </span>
                  <span className="text-xs font-mono text-slate-300">•</span>
                  <span className="text-xs font-mono text-amber-700 font-semibold">{selectedFinding.category}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{selectedFinding.title}</h3>
                <div className="text-xs font-mono text-slate-500 mt-1">
                  Detected in: <span className="text-slate-800 font-bold">{selectedFinding.affected_resource_name}</span> (ID: {selectedFinding.affected_resource_id})
                </div>
              </div>

              {/* Why it Matters */}
              <div className="space-y-1.5">
                <div className="text-xs font-mono uppercase text-slate-500 font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Why this matters
                </div>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {selectedFinding.description}
                </p>
              </div>

              {/* Recommendation */}
              <div className="space-y-1.5">
                <div className="text-xs font-mono uppercase text-slate-500 font-semibold flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Architect Recommendation
                </div>
                <p className="text-xs text-emerald-950 leading-relaxed bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 font-medium">
                  {selectedFinding.recommendation}
                </p>
              </div>

              {/* Remediation Steps */}
              {selectedFinding.remediation_steps && selectedFinding.remediation_steps.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-mono uppercase text-slate-500 font-semibold">
                    Step-by-Step Remediation Plan
                  </div>
                  <div className="space-y-2">
                    {selectedFinding.remediation_steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5 border border-amber-300 font-bold">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Compliance Frameworks */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs font-mono text-slate-500">
                <span>Compliance:</span>
                {selectedFinding.compliance_frameworks?.map((cf, idx) => (
                  <span key={idx} className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-semibold">
                    {cf}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
              Select a security finding on the left to inspect remediation details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
