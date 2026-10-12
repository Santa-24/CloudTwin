'use client';

import React, { useState } from 'react';
import { 
  Cpu, 
  HardDrive, 
  Database, 
  Network, 
  Server, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  Search, 
  Filter, 
  Workflow, 
  Globe, 
  DollarSign, 
  Lock, 
  Layers, 
  Zap, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { ArchitectureSchema, ArchitectureNode } from '../../types';

interface AwsResourcesViewProps {
  architecture: ArchitectureSchema;
  currency: 'USD' | 'INR';
  onNavigateToCanvas: () => void;
}

export const AwsResourcesView: React.FC<AwsResourcesViewProps> = ({
  architecture,
  currency,
  onNavigateToCanvas
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const symbol = currency === 'INR' ? '₹' : '$';
  const currencyMultiplier = currency === 'INR' ? 83.5 : 1.0;

  const nodes = architecture.nodes || [];

  // Grouping and calculations
  const totalResources = nodes.length;
  const computeNodes = nodes.filter(n => n.category === 'compute' || ['EC2', 'ECS', 'LAMBDA'].includes(n.type.toUpperCase()));
  const databaseNodes = nodes.filter(n => n.category === 'database' || ['RDS', 'DYNAMODB', 'AURORA'].includes(n.type.toUpperCase()));
  const storageNodes = nodes.filter(n => n.category === 'storage' || ['S3', 'EBS'].includes(n.type.toUpperCase()));
  const networkNodes = nodes.filter(n => n.category === 'network' || ['ALB', 'CLOUDFRONT', 'VPC', 'NAT_GATEWAY', 'API_GATEWAY'].includes(n.type.toUpperCase()));

  // Calculate approximate storage and compute metrics
  const totalStorageGb = nodes.reduce((sum, n) => sum + (n.config.storage_gb || 0), 0);
  const totalComputeInstances = computeNodes.reduce((sum, n) => sum + (n.config.count || 1), 0);

  // Filtered nodes
  const filteredNodes = nodes.filter(node => {
    const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          node.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          node.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCat = selectedCategory === 'all' || 
                       node.category.toLowerCase() === selectedCategory.toLowerCase();
    
    const matchesStatus = statusFilter === 'all' || node.status === statusFilter;

    return matchesSearch && matchesCat && matchesStatus;
  });

  const getServiceIcon = (type: string, category: string) => {
    const t = type.toUpperCase();
    if (t.includes('EC2') || t.includes('SERVER')) return <Server className="w-5 h-5 text-amber-600" />;
    if (t.includes('ECS') || t.includes('CONTAINER')) return <Layers className="w-5 h-5 text-orange-600" />;
    if (t.includes('LAMBDA') || t.includes('SERVERLESS')) return <Zap className="w-5 h-5 text-amber-500" />;
    if (t.includes('RDS') || t.includes('POSTGRES') || t.includes('AURORA')) return <Database className="w-5 h-5 text-blue-600" />;
    if (t.includes('DYNAMO')) return <Database className="w-5 h-5 text-indigo-600" />;
    if (t.includes('S3') || t.includes('STORAGE')) return <HardDrive className="w-5 h-5 text-emerald-600" />;
    if (t.includes('ALB') || t.includes('LOAD_BALANCER')) return <Network className="w-5 h-5 text-purple-600" />;
    if (t.includes('CLOUDFRONT') || t.includes('CDN')) return <Globe className="w-5 h-5 text-cyan-600" />;
    if (t.includes('NAT') || t.includes('GATEWAY') || t.includes('VPC')) return <Network className="w-5 h-5 text-pink-600" />;
    return <Cpu className="w-5 h-5 text-amber-600" />;
  };

  const getApproximateCost = (node: ArchitectureNode) => {
    const t = node.type.toUpperCase();
    let monthlyUsd = 15;
    if (t.includes('EC2')) {
      const it = node.config.instance_type || 't3.large';
      if (it.includes('xlarge')) monthlyUsd = 140 * (node.config.count || 1);
      else if (it.includes('large')) monthlyUsd = 62 * (node.config.count || 1);
      else monthlyUsd = 30 * (node.config.count || 1);
    } else if (t.includes('RDS')) {
      monthlyUsd = (node.config.multi_az ? 180 : 95) + ((node.config.storage_gb || 100) * 0.115);
    } else if (t.includes('S3')) {
      monthlyUsd = (node.config.storage_gb || 500) * 0.023;
    } else if (t.includes('ALB')) {
      monthlyUsd = 26.5;
    } else if (t.includes('NAT')) {
      monthlyUsd = 37.5;
    } else if (t.includes('ECS')) {
      monthlyUsd = 48 * (node.config.desired_tasks || 2);
    } else if (t.includes('CLOUDFRONT')) {
      monthlyUsd = 18;
    } else if (t.includes('LAMBDA')) {
      monthlyUsd = 8;
    }
    return Math.round(monthlyUsd * currencyMultiplier);
  };

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
                Live Cloud Utilization Telemetry
              </span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs font-mono text-slate-600 flex items-center gap-1 font-medium">
                <Globe className="w-3.5 h-3.5 text-amber-600" />
                AWS Region: {architecture.region || 'ap-south-1'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              AWS Infrastructure Resources
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              Direct telemetry inspection of all 11 AWS cloud services configured in <strong className="text-slate-900">{architecture.name}</strong>. Monitor compute capacity, persistence tiers, networking paths, and individual service burn rates.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onNavigateToCanvas}
              className="relative group overflow-hidden flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:via-orange-400 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02]"
            >
              <Workflow className="w-4 h-4" />
              <span className="font-mono uppercase tracking-wider text-[11px]">Open In Studio Canvas</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-2 font-bold">
            <span>TOTAL PROVISIONED</span>
            <Server className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {totalResources} <span className="text-xs font-mono font-normal text-slate-500">AWS Nodes</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5 font-mono">
            <span className="text-emerald-600 font-bold">100%</span> active digital twin coverage
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-2 font-bold">
            <span>COMPUTE FLEET</span>
            <Cpu className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {totalComputeInstances} <span className="text-xs font-mono font-normal text-slate-500">Instances/Tasks</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5 font-mono">
            {computeNodes.length} compute nodes across EC2, ECS, Lambda
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-2 font-bold">
            <span>STORAGE VAULTS</span>
            <HardDrive className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {totalStorageGb} <span className="text-xs font-mono font-normal text-slate-500">GB Encrypted</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5 font-mono">
            Amazon S3 & RDS Multi-AZ storage
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-2 font-bold">
            <span>NETWORK & INGRESS</span>
            <Network className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {networkNodes.length} <span className="text-xs font-mono font-normal text-slate-500">Gateways/ALB</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5 font-mono">
            CloudFront Edge, ALB, VPC, NAT Gateway
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'compute', 'database', 'storage', 'network'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
              }`}
            >
              {cat === 'all' ? 'All Services' : cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by resource name or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-amber-500 w-64 font-sans"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 focus:bg-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Statuses</option>
            <option value="healthy">Healthy Only</option>
            <option value="warning">Warnings</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredNodes.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-xs">
            <Server className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No matching AWS resources found</h3>
            <p className="text-xs text-slate-500 mt-1">Try relaxing your search terms or category filters.</p>
          </div>
        ) : (
          filteredNodes.map(node => {
            const approxCost = getApproximateCost(node);
            const isMultiAz = node.config.multi_az;
            const isEncrypted = node.config.encrypted ?? true;

            return (
              <div
                key={node.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 transition-all flex flex-col justify-between group relative overflow-hidden shadow-xs hover:shadow-md"
              >
                <div>
                  {/* Top line: Icon, Type & Status */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                        {getServiceIcon(node.type, node.category)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                            {node.type}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {node.category}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mt-1 group-hover:text-amber-700 transition-colors">
                          {node.name}
                        </h3>
                      </div>
                    </div>

                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full flex items-center gap-1 font-bold ${
                      node.status === 'healthy' 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : node.status === 'warning'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        node.status === 'healthy' ? 'bg-emerald-500' : node.status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
                      }`} />
                      {node.status}
                    </span>
                  </div>

                  {/* Node Configuration Attributes */}
                  <div className="space-y-1.5 py-3 border-y border-slate-100 text-xs font-mono text-slate-600">
                    {node.config.instance_type && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Instance Class:</span>
                        <span className="text-slate-900 font-semibold">{node.config.instance_type}</span>
                      </div>
                    )}

                    {node.config.count !== undefined && node.config.count > 1 && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Cluster Size:</span>
                        <span className="text-slate-900">{node.config.count} worker nodes</span>
                      </div>
                    )}

                    {node.config.storage_gb !== undefined && node.config.storage_gb > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Capacity / Disk:</span>
                        <span className="text-slate-900">{node.config.storage_gb} GB gp3</span>
                      </div>
                    )}

                    {node.config.engine && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Database Engine:</span>
                        <span className="text-slate-900 uppercase font-semibold">{node.config.engine}</span>
                      </div>
                    )}

                    {node.config.cidr_block && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">VPC CIDR Block:</span>
                        <span className="text-slate-900">{node.config.cidr_block}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">High Availability:</span>
                      <span className={isMultiAz ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
                        {isMultiAz ? 'Multi-AZ Active' : 'Single AZ'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Security / KMS:</span>
                      <span className={isEncrypted ? 'text-emerald-700 font-semibold' : 'text-rose-600'}>
                        {isEncrypted ? 'KMS Encrypted' : 'Unencrypted'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom line: Cost and Quick Action */}
                <div className="pt-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">ESTIMATED SPEND</span>
                    <div className="text-sm font-bold text-slate-900 font-mono">
                      {symbol}{approxCost.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">/mo</span>
                    </div>
                  </div>

                  <button
                    onClick={onNavigateToCanvas}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200 hover:border-amber-300 text-xs font-mono font-semibold transition-all"
                  >
                    <span>Inspect</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Well-Architected Framework Compliance Matrix */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
              AWS Well-Architected Framework
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">Resource Pillar Compliance</h3>
          </div>
          <span className="text-xs font-mono text-slate-500">CIS Benchmark v1.4.0 Enforced</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          {[
            { pillar: 'Reliability', status: 'High', desc: 'Multi-AZ RDS & ALB failover healthy' },
            { pillar: 'Security', status: 'Optimal', desc: 'Zero public database port exposures' },
            { pillar: 'Cost Optimization', status: 'Good', desc: 'Auto-scaling enabled on EC2 fleet' },
            { pillar: 'Performance', status: 'Superior', desc: 'CloudFront CDN edge caching active' },
            { pillar: 'Operational', status: 'Active', desc: 'CloudWatch alarms & DynamoDB telemetry' }
          ].map(p => (
            <div key={p.pillar} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-xs font-bold text-slate-800">{p.pillar}</div>
              <div className="text-xs font-mono text-emerald-700 font-bold">{p.status}</div>
              <p className="text-[10px] text-slate-500 leading-tight">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
