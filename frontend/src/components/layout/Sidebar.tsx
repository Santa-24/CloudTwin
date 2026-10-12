'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  Workflow, 
  Activity, 
  DollarSign, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  ChevronDown, 
  Command,
  Flame,
  Radio,
  Cpu,
  Globe,
  X
} from 'lucide-react';
import { Project, UserProfile } from '../../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentProject: Project | null;
  projects: Project[];
  onSelectProject: (proj: Project) => void;
  onOpenCommandPalette: () => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onReturnToLanding?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentProject,
  projects,
  onSelectProject,
  onOpenCommandPalette,
  user,
  onOpenAuth,
  onReturnToLanding,
  isOpenMobile = false,
  onCloseMobile
}) => {
  const [projectDropdownOpen, setProjectDropdownOpen] = React.useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: Layers, badge: projects.length },
    { id: 'resources', label: 'AWS Resources', icon: Cpu, badge: '11 Live' },
    { id: 'architectures', label: 'Architecture Studio', icon: Workflow, highlight: true },
    { id: 'simulator', label: 'What-If Simulator', icon: Activity },
    { id: 'cost', label: 'Cost Intelligence', icon: DollarSign },
    { id: 'security', label: 'Security & Posture', icon: ShieldCheck },
    { id: 'recommendations', label: 'AI Optimizer', icon: Sparkles, badge: 'AI' },
    { id: 'reports', label: 'Reports & Audits', icon: FileText },
  ];

  return (
    <>
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 md:hidden animate-in fade-in duration-150"
          onClick={onCloseMobile}
        />
      )}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 md:static md:h-screen flex flex-col bg-white/95 backdrop-blur-xl border-r border-slate-200/90 select-none shrink-0 shadow-2xl md:shadow-[2px_0_12px_rgba(0,0,0,0.02)] transition-transform duration-200 ease-in-out ${isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200/80">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveTab('overview'); if (onCloseMobile) onCloseMobile(); }}>
            <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20 border border-amber-300 group">
              <div className="w-3.5 h-3.5 rounded-sm border-2 border-white rotate-45 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-slate-900 text-base">CloudTwin</span>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-semibold">
                  v2.3
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase font-semibold">AWS DIGITAL TWIN</p>
            </div>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Close Navigation"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

      {/* Project Switcher Bar */}
      <div className="px-3 pt-3 pb-1 relative">
        <div 
          onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
          className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50/90 border border-slate-200 hover:border-amber-500/60 hover:bg-white cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/60" />
            <div className="truncate">
              <div className="text-[9px] font-mono tracking-wider text-slate-400 uppercase leading-tight font-bold">ACTIVE WORKSPACE</div>
              <div className="text-xs font-bold text-slate-800 truncate group-hover:text-amber-600 transition-colors">{currentProject?.name || 'FinTech Core Twin'}</div>
            </div>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-transform ${projectDropdownOpen ? 'rotate-180' : ''}`} />
        </div>

        {/* Dropdown Menu */}
        {projectDropdownOpen && (
          <div className="absolute left-3 right-3 top-16 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-50">
            <div className="text-[9px] font-mono text-slate-400 px-2 py-1 uppercase tracking-widest font-bold">Switch Workspace</div>
            {projects.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  onSelectProject(p);
                  setProjectDropdownOpen(false);
                }}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                  currentProject?.id === p.id 
                    ? 'bg-amber-50 text-amber-800 font-semibold border border-amber-200' 
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="truncate">{p.name}</span>
                <span className="text-[10px] font-mono text-slate-400">{p.default_region}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className="text-[9px] font-mono text-slate-400 px-3 py-1 uppercase tracking-widest font-bold">PLATFORM MODULES</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-amber-50 text-amber-900 border border-amber-200/90 border-l-4 border-l-amber-500 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-amber-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  typeof item.badge === 'string'
                    ? 'bg-violet-100 text-violet-800 border border-violet-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Command Palette & Landing Triggers */}
      <div className="px-3 pb-2 space-y-1.5">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-amber-400 text-xs text-slate-600 hover:text-slate-900 transition-all shadow-sm group font-medium"
        >
          <div className="flex items-center gap-2">
            <Command className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors" />
            <span>Command Palette</span>
          </div>
          <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded text-slate-500 border border-slate-200 font-semibold">Ctrl K</span>
        </button>

        {onReturnToLanding && (
          <button
            onClick={onReturnToLanding}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-xs text-amber-800 font-mono transition-all shadow-sm group font-bold"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-amber-600 group-hover:rotate-12 transition-transform" />
              <span>Showcase Landing</span>
            </div>
            <span className="text-[10px] text-amber-700 font-bold">↗</span>
          </button>
        )}
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/70">
        <div 
          onClick={onOpenAuth}
          className="flex items-center justify-between p-2 rounded-xl hover:bg-white cursor-pointer transition-all border border-transparent hover:border-slate-200 hover:shadow-sm"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-bold text-xs text-white uppercase border border-amber-300 shadow-sm shadow-amber-500/20">
              {user ? user.full_name.slice(0, 2) : 'CT'}
            </div>
            <div className="truncate text-left">
              <div className="text-xs font-bold text-slate-900 truncate">{user ? user.full_name : 'Sign In / Register'}</div>
              <div className="text-[10px] text-slate-500 font-mono truncate">{user ? user.email : 'Click to authenticate'}</div>
            </div>
          </div>
          <div className={`w-2 h-2 rounded-full ${user ? 'bg-emerald-500' : 'bg-amber-400'} shadow-sm`} />
        </div>
      </div>
    </aside>
    </>
  );
};
