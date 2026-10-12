'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Terminal, 
  Layers, 
  Activity, 
  Coins, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  Plus, 
  X,
  Play,
  RotateCcw
} from 'lucide-react';
interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  onRunSimulation?: (scenarioId?: string) => void;
  onValidate?: () => void;
  onNewProject?: () => void;
  onGenerateReport?: () => void;
  onResetArchitecture?: () => void;
  onNewArchitecture?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onRunSimulation,
  onValidate,
  onNewProject,
  onGenerateReport,
  onResetArchitecture,
  onNewArchitecture
}) => {
  const [query, setQuery] = useState('');

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    {
      group: 'Navigation',
      items: [
        { id: 'nav-overview', title: 'Go to Cloud Twin Dashboard', icon: Layers, action: () => onNavigate('overview'), hint: 'Home' },
        { id: 'nav-canvas', title: 'Go to Architecture Studio', icon: Layers, action: () => onNavigate('canvas'), hint: 'Studio' },
        { id: 'nav-simulation', title: 'Go to What-If Simulator', icon: Activity, action: () => onNavigate('simulation'), hint: 'Chaos' },
        { id: 'nav-cost', title: 'Go to Cost Intelligence', icon: Coins, action: () => onNavigate('cost'), hint: 'FinOps' },
        { id: 'nav-security', title: 'Go to Security & Posture', icon: ShieldCheck, action: () => onNavigate('security'), hint: 'CIS' },
        { id: 'nav-recommendations', title: 'Go to AI Optimizer', icon: Sparkles, action: () => onNavigate('recommendations'), hint: 'GenAI' },
        { id: 'nav-reports', title: 'Go to Reports & Audits', icon: FileText, action: () => onNavigate('reports'), hint: 'Audit' },
      ]
    },
    {
      group: 'Architecture Actions',
      items: [
        { id: 'act-sim', title: 'Execute What-If Simulation Run', icon: Play, action: () => onRunSimulation && onRunSimulation(), hint: 'Run' },
        { id: 'act-val', title: 'Run Architecture Rule Validation', icon: ShieldCheck, action: () => onValidate && onValidate(), hint: 'Audit' },
        { id: 'act-rep', title: 'Generate Audit Report', icon: FileText, action: () => onGenerateReport && onGenerateReport(), hint: 'Report' },
        { id: 'act-new', title: 'Initialize New Project Blueprint', icon: Plus, action: () => onNewProject ? onNewProject() : (onNewArchitecture && onNewArchitecture()), hint: 'New' },
      ]
    }
  ];

  const filtered = commands.map(group => ({
    ...group,
    items: group.items.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) || 
      item.hint.toLowerCase().includes(query.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100">
          <Search className="w-4 h-4 text-amber-600 mr-3 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or search platform..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching commands found.
            </div>
          ) : (
            filtered.map((group) => (
              <div key={group.group}>
                <div className="text-[10px] font-mono uppercase text-slate-400 font-bold px-3 py-1 tracking-wider">
                  {group.group}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          item.action();
                          onClose();
                        }}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-700 hover:text-slate-900 hover:bg-amber-50 cursor-pointer transition-all group font-medium"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
                          <span>{item.title}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 group-hover:text-amber-700 font-bold">
                          {item.hint}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>Navigate with mouse or keyboard</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
