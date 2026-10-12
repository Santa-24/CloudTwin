'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { 
  Server, 
  Database, 
  HardDrive, 
  Network, 
  Globe, 
  Shield, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Zap
} from 'lucide-react';
import { NodeConfig } from '../../types';

export interface AWSNodeData {
  id: string;
  name: string;
  type: string;
  category: 'compute' | 'network' | 'database' | 'storage';
  config: NodeConfig;
  status: 'healthy' | 'warning' | 'critical' | 'configured';
  onConfigure?: (nodeId: string) => void;
  onDelete?: (nodeId: string) => void;
}

const getServiceIcon = (type: string) => {
  const t = (type || '').toUpperCase();
  if (t === 'EC2') return Cpu;
  if (t === 'LAMBDA') return Zap;
  if (t === 'ECS') return Layers;
  if (t === 'RDS' || t === 'AURORA' || t === 'DATABASE') return Database;
  if (t === 'DYNAMODB') return Database;
  if (t === 'S3' || t === 'EBS') return HardDrive;
  if (t === 'ALB' || t === 'ELB') return Network;
  if (t === 'API_GATEWAY' || t === 'APIGATEWAY') return Network;
  if (t === 'CLOUDFRONT') return Globe;
  if (t === 'NAT_GATEWAY' || t === 'NAT') return Network;
  if (t === 'VPC' || t === 'ROUTE53') return Globe;
  return Server;
};

const getCategoryBadgeColor = (category: string) => {
  switch (category) {
    case 'compute': return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'network': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'database': return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'storage': return 'bg-violet-100 text-violet-800 border-violet-300';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export const AWSNode = memo(({ data, selected }: NodeProps<any>) => {
  const nodeData = data as AWSNodeData;
  const Icon = getServiceIcon(nodeData.type);
  const config = nodeData.config || {};

  const isHealthy = nodeData.status === 'healthy';
  const isWarning = nodeData.status === 'warning';
  const isCritical = nodeData.status === 'critical';

  return (
    <div 
      className={`w-64 rounded-2xl bg-white border transition-all duration-200 select-none relative group shadow-sm ${
        selected 
          ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-lg shadow-amber-500/15' 
          : 'border-slate-200 hover:border-amber-400/60 hover:shadow-md'
      }`}
    >
      {/* Target/Source Connection Handles */}
      <Handle 
        type="target" 
        position={Position.Top} 
        id="top"
        className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white transition-transform hover:scale-125 !-top-1.5 shadow-xs" 
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="left"
        className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white transition-transform hover:scale-125 !-left-1.5 shadow-xs" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="right"
        className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white transition-transform hover:scale-125 !-right-1.5 shadow-xs" 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="bottom"
        className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white transition-transform hover:scale-125 !-bottom-1.5 shadow-xs" 
      />

      {/* Card Header */}
      <div className="p-3.5 pb-2.5 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 shadow-xs">
            <Icon className="w-4 h-4 text-amber-600" />
          </div>
          <div className="truncate">
            <div className="text-xs font-bold text-slate-900 truncate">{nodeData.name}</div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{nodeData.type}</div>
          </div>
        </div>

        <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border font-bold ${getCategoryBadgeColor(nodeData.category)}`}>
          {nodeData.category}
        </span>
      </div>

      {/* Configuration Specs Body */}
      <div className="px-3.5 py-2.5 space-y-1.5 text-[11px] font-mono">
        {config.api_type && (
          <div className="flex items-center justify-between text-slate-500">
            <span>Protocol:</span>
            <span className="text-amber-800 font-bold">{config.api_type}</span>
          </div>
        )}
        {config.runtime && (
          <div className="flex items-center justify-between text-slate-500">
            <span>Runtime:</span>
            <span className="text-amber-800 font-bold">{config.runtime}</span>
          </div>
        )}
        {config.launch_type && (
          <div className="flex items-center justify-between text-slate-500">
            <span>Launch:</span>
            <span className="text-violet-700 font-bold">{config.launch_type}</span>
          </div>
        )}
        {config.billing_mode && (
          <div className="flex items-center justify-between text-slate-500">
            <span>Billing:</span>
            <span className="text-slate-800 font-semibold">{config.billing_mode === 'PAY_PER_REQUEST' ? 'On-Demand' : 'Provisioned'}</span>
          </div>
        )}
        {config.cidr_block && (
          <div className="flex items-center justify-between text-slate-500">
            <span>CIDR:</span>
            <span className="text-slate-800 font-semibold">{config.cidr_block}</span>
          </div>
        )}
        {config.instance_type && (
          <div className="flex items-center justify-between text-slate-500">
            <span>Instance:</span>
            <span className="text-slate-900 font-bold">{config.instance_type}</span>
          </div>
        )}
        {config.count !== undefined && !config.launch_type && (
          <div className="flex items-center justify-between text-slate-500">
            <span>Count:</span>
            <span className="text-slate-800 font-semibold">{config.count} {config.auto_scaling ? '(Auto-Scale)' : ''}</span>
          </div>
        )}
        {config.storage_gb !== undefined && (
          <div className="flex items-center justify-between text-slate-500">
            <span>Storage:</span>
            <span className="text-slate-800 font-semibold">{config.storage_gb} GB</span>
          </div>
        )}
        {config.multi_az !== undefined && (
          <div className="flex items-center justify-between text-slate-500">
            <span>Resilience:</span>
            <span className={config.multi_az ? 'text-emerald-700 font-bold' : 'text-amber-700 font-semibold'}>
              {config.multi_az ? 'Multi-AZ' : 'Single-AZ'}
            </span>
          </div>
        )}
      </div>

      {/* Card Status & Flags Footer */}
      <div className="px-3.5 py-2 border-t border-slate-100 bg-slate-50/80 rounded-b-2xl flex items-center justify-between text-[10px] font-mono">
        <div className="flex items-center gap-1.5">
          {isHealthy && (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-xs" />
              <span className="text-emerald-700 font-bold">Healthy</span>
            </>
          )}
          {isWarning && (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              <span className="text-amber-800 font-bold">Warning</span>
            </>
          )}
          {isCritical && (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-rose-800 font-bold">Critical</span>
            </>
          )}
          {nodeData.status === 'configured' && (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="text-amber-800 font-bold">Active</span>
            </>
          )}
        </div>

        {config.publicly_accessible ? (
          <span className="text-rose-700 font-bold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Public
          </span>
        ) : (
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-600" /> Private
          </span>
        )}
      </div>
    </div>
  );
});

AWSNode.displayName = 'AWSNode';
