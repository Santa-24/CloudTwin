'use client';

import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Workflow, 
  Activity, 
  Calendar, 
  ArrowRight, 
  Globe, 
  ShieldCheck, 
  CheckCircle2, 
  FolderPlus,
  Trash2,
  Cpu,
  Server,
  Zap,
  HardDrive,
  Database,
  Network,
  Sparkles,
  ExternalLink,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { Project } from '../../types';

interface ProjectsViewProps {
  projects: Project[];
  currentProject: Project | null;
  onSelectProject: (proj: Project) => void;
  onCreateProject: (name: string, description: string, defaultRegion: string, tags: string[], template: string) => Promise<void>;
  onDeleteProject?: (id: string) => Promise<void>;
  onNavigateToStudio: () => void;
  onNavigateToResources?: () => void;
}

const TEMPLATES = [
  {
    id: 'enterprise_11_service',
    name: 'Enterprise 11-Service Twin',
    badge: 'Flagship Full Stack',
    icon: Sparkles,
    nodesCount: 11,
    costEst: '$840/mo',
    desc: 'Complete AWS topology with CloudFront, ALB, API Gateway, EC2, ECS, Lambda, Multi-AZ RDS, DynamoDB, S3, VPC, and NAT GW.'
  },
  {
    id: 'high_availability',
    name: 'High-Availability 3-Tier Multi-AZ',
    badge: 'Production Web App',
    icon: Server,
    nodesCount: 4,
    costEst: '$420/mo',
    desc: 'Public ALB, Auto-scaling EC2 API cluster, RDS PostgreSQL Multi-AZ standby replica, and encrypted S3 storage.'
  },
  {
    id: 'serverless',
    name: 'Modern Serverless Microservices',
    badge: 'Event-Driven',
    icon: Zap,
    nodesCount: 5,
    costEst: '$165/mo',
    desc: 'Global CloudFront CDN, API Gateway endpoint router, AWS Lambda Python runtime, DynamoDB, and S3 data bucket.'
  },
  {
    id: 'blank',
    name: 'Zero-Trust Virtual Cloud Network',
    badge: 'Network Baseline',
    icon: Network,
    nodesCount: 2,
    costEst: '$65/mo',
    desc: 'Custom isolated AWS VPC with dual availability zone public/private subnets and Multi-AZ NAT Gateways.'
  }
];

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  currentProject,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  onNavigateToStudio,
  onNavigateToResources
}) => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [region, setRegion] = useState('ap-south-1');
  const [selectedTemplate, setSelectedTemplate] = useState('enterprise_11_service');
  const [tagsStr, setTagsStr] = useState('Production, AWS, FinTech');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
    try {
      await onCreateProject(name, description, region, tags, selectedTemplate);
      setShowModal(false);
      setName('');
      setDescription('');
    } catch (err: any) {
      alert(`Project creation failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    setDeletingId(projectToDelete.id);
    try {
      if (onDeleteProject) {
        await onDeleteProject(projectToDelete.id);
      }
      setProjectToDelete(null);
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const activeTemplateObj = TEMPLATES.find(t => t.id === selectedTemplate) || TEMPLATES[0];

  return (
    <div className="w-full h-full overflow-y-auto p-8 space-y-8 bg-slate-50 text-slate-900">
      {/* Header Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-2 font-bold tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                AWS Multi-Tenant Cloud Twin Engine
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-mono text-slate-500 font-medium">Independent Isolated Workspaces</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Cloud Architecture Workspaces
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              Dynamically provision isolated digital twin environments with custom blueprints, regions, and telemetry baselines. All workspaces and node topologies are persisted in live AWS RDS PostgreSQL.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowModal(true)}
              className="relative group overflow-hidden flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:via-orange-400 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02]"
            >
              <div className="absolute inset-0 w-full h-full awwwards-shimmer opacity-30 pointer-events-none" />
              <Plus className="w-4 h-4" />
              <span className="font-mono uppercase tracking-wider text-[11px]">Dynamically Create Project</span>
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => {
          const isSelected = currentProject?.id === proj.id;
          return (
            <div
              key={proj.id}
              onClick={() => onSelectProject(proj)}
              className={`p-6 rounded-2xl bg-white cursor-pointer border transition-all flex flex-col justify-between group relative overflow-hidden shadow-xs hover:shadow-md ${
                isSelected
                  ? 'border-amber-400 ring-2 ring-amber-400/40 bg-gradient-to-b from-amber-50/50 to-white'
                  : 'border-slate-200 hover:border-amber-400/80'
              }`}
            >
              <div className="space-y-4">
                {/* Card Top: Region + Status + Delete Button */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center gap-1.5 font-semibold">
                    <Globe className="w-3 h-3 text-amber-600" />
                    AWS {proj.default_region}
                  </span>

                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        ACTIVE
                      </span>
                    )}

                    {/* Prominent, Always-Visible Delete Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProjectToDelete({ id: proj.id, name: proj.name });
                      }}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all flex items-center gap-1 text-[11px] font-mono font-semibold"
                      title={`Delete "${proj.name}" workspace`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                    {proj.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {proj.description || 'Enterprise AWS digital twin architecture workspace with automated stress testing.'}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {proj.tags && proj.tags.length > 0 ? (
                    proj.tags.map((t, idx) => (
                      <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 font-medium">
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-500">
                      AWS Twin
                    </span>
                  )}
                </div>
              </div>

              {/* Stats & Actions Footer */}
              <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <Workflow className="w-3.5 h-3.5 text-amber-600" />
                    {proj.architecture_count || 1} Twin Topology
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {onNavigateToResources && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProject(proj);
                        onNavigateToResources();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-mono text-slate-700 font-semibold transition-colors"
                      title="Inspect AWS Resources"
                    >
                      Resources
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProject(proj);
                      onNavigateToStudio();
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 font-mono transition-colors"
                  >
                    <span>Launch</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal Dialog */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Project Workspace?</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-slate-900">{projectToDelete.name}</strong>? All associated architectures, node graphs, and simulation records will be purged from the AWS RDS PostgreSQL database.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingId !== null}
                onClick={confirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all"
              >
                {deletingId ? 'Deleting from RDS...' : 'Yes, Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Project Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl p-7 rounded-3xl bg-white border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold">
                    Independent Cloud Twin
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-mono text-slate-500">AWS RDS Persistence</span>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900">Dynamically Provision New Project</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Configure workspace parameters and select a pre-architected AWS digital twin template.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-mono px-2 py-1 rounded-lg hover:bg-slate-100"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 text-xs font-mono">
              {/* Name & Region Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 uppercase text-[10px] font-bold mb-1.5">Project Workspace Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NeoBank Payments Twin"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 uppercase text-[10px] font-bold mb-1.5">Primary AWS Target Region</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 font-mono"
                  >
                    <option value="ap-south-1">Asia Pacific (Mumbai) ap-south-1</option>
                    <option value="us-east-1">US East (N. Virginia) us-east-1</option>
                    <option value="eu-west-1">Europe (Ireland) eu-west-1</option>
                    <option value="ap-northeast-1">Asia Pacific (Tokyo) ap-northeast-1</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 uppercase text-[10px] font-bold mb-1.5">Description & Purpose</label>
                <textarea
                  rows={2}
                  placeholder="Production microservices, high-volume database cluster, and edge CDN cache"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>

              {/* Template Blueprint Selector */}
              <div>
                <label className="block text-slate-700 uppercase text-[10px] font-bold mb-2">Select Initial Digital Twin Blueprint</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TEMPLATES.map((t) => {
                    const isPicked = selectedTemplate === t.id;
                    const Icon = t.icon;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTemplate(t.id)}
                        className={`p-3.5 rounded-xl cursor-pointer border transition-all text-left flex flex-col justify-between ${
                          isPicked
                            ? 'border-amber-500 ring-2 ring-amber-400/30 bg-amber-50/60 shadow-xs'
                            : 'border-slate-200 hover:border-amber-400 bg-white'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-amber-800 border border-slate-200 font-bold">
                              {t.badge}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">{t.nodesCount} AWS Nodes</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Icon className={`w-4 h-4 ${isPicked ? 'text-amber-600' : 'text-slate-400'}`} />
                            <h4 className="font-bold text-slate-900 text-xs">{t.name}</h4>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug">{t.desc}</p>
                        </div>

                        <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                          <span>Est. Spend: <strong className="text-slate-800">{t.costEst}</strong></span>
                          <span className={isPicked ? 'text-amber-700 font-bold' : 'text-slate-400'}>
                            {isPicked ? '✓ Selected' : 'Choose'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-slate-700 uppercase text-[10px] font-bold mb-1.5">Environment Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={tagsStr}
                  onChange={(e) => setTagsStr(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>

              {/* Preview Summary Bar */}
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-slate-700">
                    Will auto-generate <strong>{activeTemplateObj.nodesCount} AWS nodes</strong> in <strong>{region}</strong>
                  </span>
                </div>
                <span className="text-amber-800 font-bold font-mono">{activeTemplateObj.costEst}</span>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="relative group overflow-hidden px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:via-orange-400 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02]"
                >
                  <div className="absolute inset-0 w-full h-full awwwards-shimmer opacity-30 pointer-events-none" />
                  <span>{isSubmitting ? 'Provisioning...' : 'Provision Digital Twin'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
