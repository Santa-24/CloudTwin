'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Plus, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Share2, 
  ShieldCheck, 
  DollarSign, 
  Layers,
  Sparkles 
} from 'lucide-react';
import { ArchitectureSchema, Project } from '../../types';

interface ReportsViewProps {
  reports: any[];
  currentProject: Project | null;
  currentArchitecture: ArchitectureSchema;
  onGenerateReport: (title: string, format: string) => Promise<void>;
  isGenerating: boolean;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  reports,
  currentProject,
  currentArchitecture,
  onGenerateReport,
  isGenerating
}) => {
  const [showModal, setShowModal] = useState(false);
  const [reportTitle, setReportTitle] = useState(`${currentArchitecture.name} Executive Audit`);
  const [selectedFormat, setSelectedFormat] = useState('markdown');
  const [previewContent, setPreviewContent] = useState<string | null>(null);

  const handleCreate = async () => {
    await onGenerateReport(reportTitle, selectedFormat);
    setShowModal(false);
  };

  return (
    <div className="w-full h-full overflow-y-auto p-8 space-y-8 bg-slate-50 text-slate-900">
      {/* Header Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-2 font-bold tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Amazon S3 Storage Vault
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-mono text-slate-500 font-medium">Executive Architecture Audits</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Reports & Compliance Audits
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              Generate and export comprehensive digital twin audit reports containing topology specs, simulation stress metrics, AWS cost breakdowns, and security remediations.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="relative group overflow-hidden flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:via-orange-400 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="font-mono uppercase tracking-wider text-[11px]">Generate New Audit Report</span>
          </button>
        </div>
      </div>

      {/* Reports Grid */}
      {reports.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
          <FileText className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Reports Generated Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click "Generate New Audit Report" above to compile an executive audit snapshot of your cloud twin architecture.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((r) => (
            <div key={r.id} className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between hover:border-amber-400/80 hover:shadow-sm transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span className="uppercase px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold">
                    {r.format || 'MARKDOWN'}
                  </span>
                  <span>{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 line-clamp-1">{r.title}</h3>
                <p className="text-xs text-slate-500 font-mono">
                  {currentArchitecture.name} (v{currentArchitecture.version})
                </p>
              </div>

              {/* Summary Stats */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">HEALTH</div>
                  <div className="text-emerald-600 font-bold">{r.summary_json?.health_score || 85}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">RISK</div>
                  <div className="text-orange-600 font-bold">{r.summary_json?.risk_level || 'LOW'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">NODES</div>
                  <div className="text-slate-900 font-bold">{r.summary_json?.node_count || currentArchitecture.nodes.length}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                <button
                  onClick={() => setPreviewContent(r.markdown_content || '# CloudTwin Report')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-600" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([r.markdown_content || ''], { type: 'text/markdown' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${r.title.replace(/\s+/g, '_')}.md`;
                    a.click();
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-amber-600" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Generate Report Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white border border-slate-200 shadow-2xl space-y-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Generate Executive CloudTwin Audit</h3>
              <p className="text-xs text-slate-500 mt-1">
                Compile topology graphs, stress metrics, AWS billing, and CIS findings into an exportable document.
              </p>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-500 uppercase text-[10px] mb-1.5 font-bold">Report Title</label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <div>
                <label className="block text-slate-500 uppercase text-[10px] mb-1.5 font-bold">Export Format</label>
                <div className="grid grid-cols-2 gap-2">
                  {['markdown', 'json'].map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setSelectedFormat(fmt)}
                      className={`p-2.5 rounded-xl border uppercase transition-all font-bold ${
                        selectedFormat === fmt
                          ? 'border-amber-400 bg-amber-50 text-amber-900 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-900 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={isGenerating}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                {isGenerating ? 'Compiling Report...' : 'Generate Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Markdown Modal */}
      {previewContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-3xl max-h-[85vh] flex flex-col p-6 rounded-3xl bg-white border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm font-bold text-slate-900">Report Content Preview</span>
              <button
                onClick={() => setPreviewContent(null)}
                className="text-xs font-mono text-slate-500 hover:text-slate-900 p-1"
              >
                ✕ Close
              </button>
            </div>
            <pre className="flex-1 overflow-y-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed">
              {previewContent}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
