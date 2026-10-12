'use client';

import React from 'react';
import { 
  Play, 
  CheckCircle2, 
  Search, 
  Globe, 
  Sparkles,
  Zap,
  Activity,
  Menu
} from 'lucide-react';
import { ArchitectureSchema, Project } from '../../types';

interface HeaderProps {
  currentProject: Project | null;
  currentArchitecture: ArchitectureSchema | null;
  currency: 'USD' | 'INR';
  setCurrency: (c: 'USD' | 'INR') => void;
  onRunSimulationModal: () => void;
  onOpenCommandPalette: () => void;
  isValidating: boolean;
  onValidate: () => void;
  onReturnToLanding?: () => void;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProject,
  currentArchitecture,
  currency,
  setCurrency,
  onRunSimulationModal,
  onOpenCommandPalette,
  isValidating,
  onValidate,
  onReturnToLanding,
  onToggleMobileSidebar
}) => {
  return (
    <header className="h-16 px-4 md:px-6 flex items-center justify-between bg-white/90 backdrop-blur-xl border-b border-slate-200/90 shrink-0 z-20 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
      {/* Left: Breadcrumbs & Twin Meta */}
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-1.5 -ml-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
        )}
        <div className="flex items-center gap-2 text-xs truncate">
          <span className="text-slate-500 font-medium tracking-wide">{currentProject?.name || 'FinTech Project'}</span>
          <span className="text-slate-300 font-light">/</span>
          <span className="font-bold text-slate-900 flex items-center gap-2">
            {currentArchitecture?.name || 'Production Architecture'}
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold tracking-wider">
              v{currentArchitecture?.version || '1.0.0'}
            </span>
          </span>
        </div>

        <div className="h-4 w-[1px] bg-slate-200 mx-1" />

        {/* Region Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-700 font-medium">
          <Globe className="w-3.5 h-3.5 text-amber-600" />
          <span className="tracking-wide">{currentArchitecture?.region || 'ap-south-1'}</span>
        </div>
      </div>

      {/* Center: Search / Command Trigger */}
      <div className="hidden lg:flex items-center">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-100/80 hover:bg-slate-100 border border-slate-200 hover:border-amber-400 text-xs text-slate-500 hover:text-slate-800 transition-all shadow-inner group"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors" />
          <span className="text-slate-500 group-hover:text-slate-700">Search architectures, scenarios, services...</span>
          <kbd className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-500 font-semibold shadow-xs">
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Right: Actions, Currency, Simulation Trigger */}
      <div className="flex items-center gap-3">
        {/* Currency Switcher */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-mono">
          <button
            onClick={() => setCurrency('USD')}
            className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
              currency === 'USD' 
                ? 'bg-white text-amber-800 font-bold border border-slate-200 shadow-xs' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            $ USD
          </button>
          <button
            onClick={() => setCurrency('INR')}
            className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
              currency === 'INR' 
                ? 'bg-white text-amber-800 font-bold border border-slate-200 shadow-xs' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ₹ INR
          </button>
        </div>

        {/* Return to Showcase Landing Button */}
        {onReturnToLanding && (
          <button
            onClick={onReturnToLanding}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs font-mono text-amber-800 font-semibold transition-all shadow-xs"
            title="Return to Public Awwwards Landing Page"
          >
            <Globe className="w-3.5 h-3.5 text-amber-600" />
            <span>Showcase Landing</span>
          </button>
        )}

        {/* Validation Button */}
        <button
          onClick={onValidate}
          disabled={isValidating}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-emerald-500 text-xs font-semibold text-slate-700 transition-all shadow-xs"
          title="Verify architecture graph integrity"
        >
          <CheckCircle2 className={`w-3.5 h-3.5 ${isValidating ? 'text-amber-500 animate-spin' : 'text-emerald-500'}`} />
          <span>{isValidating ? 'Validating...' : 'Validate'}</span>
        </button>

        {/* Primary Action: Run Simulation (Luminous Solar Amber Gradient) */}
        <button
          onClick={onRunSimulationModal}
          className="relative group overflow-hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:via-orange-400 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="absolute inset-0 w-full h-full awwwards-shimmer opacity-30 pointer-events-none" />
          <Play className="w-3.5 h-3.5 fill-current" />
          <span className="tracking-wide uppercase text-[11px] font-mono">Run Simulation</span>
        </button>
      </div>
    </header>
  );
};
