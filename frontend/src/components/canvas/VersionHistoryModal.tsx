'use client';

import React, { useState } from 'react';
import { 
  History, 
  RotateCcw, 
  Plus, 
  Check, 
  Calendar, 
  X, 
  GitCommit, 
  Layers, 
  ArrowRight 
} from 'lucide-react';
import { ArchitectureSchema } from '../../types';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  versions: any[];
  currentVersion: string;
  onCreateVersion: (summary: string) => Promise<void>;
  onRestoreVersion: (versionId: string) => Promise<void>;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  versions,
  currentVersion,
  onCreateVersion,
  onRestoreVersion
}) => {
  const [showCreate, setShowCreate] = useState(false);
  const [summary, setSummary] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) return;
    setIsProcessing(true);
    await onCreateVersion(summary);
    setIsProcessing(false);
    setShowCreate(false);
    setSummary('');
  };

  const handleRestore = async (vId: string) => {
    setIsProcessing(true);
    await onRestoreVersion(vId);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-violet-600" />
            <h3 className="text-sm font-bold text-slate-900">Architecture Version Timeline</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Snapshot Current</span>
            </button>
            <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-700 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Create Snapshot Subform */}
        {showCreate && (
          <form onSubmit={handleCreate} className="p-4 bg-slate-50 border-b border-slate-200 space-y-2">
            <label className="text-xs text-slate-700 font-bold block">Version Change Summary</label>
            <input
              autoFocus
              required
              type="text"
              placeholder="e.g. Added Multi-AZ RDS standby and tuned Auto Scaling triggers"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-500 hover:text-slate-800 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs hover:from-amber-400 hover:to-orange-400 shadow-md shadow-amber-500/20"
              >
                {isProcessing ? 'Saving...' : 'Commit Version'}
              </button>
            </div>
          </form>
        )}

        {/* Versions Timeline List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {versions.slice().reverse().map((v, idx) => {
            const isCurrent = idx === 0;
            return (
              <div 
                key={v.id}
                className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/90 hover:border-amber-400/80 transition-all flex items-start justify-between gap-4 shadow-xs"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-700">
                      v{v.version_number}.0
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                        ACTIVE STATE
                      </span>
                    )}
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(v.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">{v.change_summary}</p>
                  
                  {/* Nodes & Connections in Snapshot */}
                  {v.snapshot_json && (
                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 pt-1">
                      <span>{v.snapshot_json.nodes?.length || 0} Nodes</span>
                      <span>•</span>
                      <span>{v.snapshot_json.connections?.length || 0} Connections</span>
                    </div>
                  )}
                </div>

                {!isCurrent && (
                  <button
                    onClick={() => handleRestore(v.id)}
                    disabled={isProcessing}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200 transition-colors shrink-0 shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                    <span>Rollback</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
