'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Copy, 
  Shield, 
  AlertTriangle, 
  Check, 
  Settings2,
  Server,
  Layers,
  Database,
  Cpu
} from 'lucide-react';
import { ArchitectureNode, NodeConfig } from '../../types';

interface NodeInspectorProps {
  selectedNode: ArchitectureNode | null;
  onClose: () => void;
  onUpdateNode: (nodeId: string, updates: Partial<ArchitectureNode>) => void;
  onDeleteNode: (nodeId: string) => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  selectedNode,
  onClose,
  onUpdateNode,
  onDeleteNode
}) => {
  const [name, setName] = useState('');
  const [config, setConfig] = useState<NodeConfig>({});

  useEffect(() => {
    if (selectedNode) {
      setName(selectedNode.name || '');
      setConfig(selectedNode.config || {});
    }
  }, [selectedNode]);

  if (!selectedNode) return null;

  const handleConfigChange = (key: keyof NodeConfig, value: any) => {
    const updated = { ...config, [key]: value };
    setConfig(updated);
    onUpdateNode(selectedNode.id, { config: updated });
  };

  const handleNameChange = (val: string) => {
    setName(val);
    onUpdateNode(selectedNode.id, { name: val });
  };

  const nodeType = (selectedNode.type || '').toUpperCase();
  const isEC2 = nodeType === 'EC2';
  const isLambda = nodeType === 'LAMBDA';
  const isECS = nodeType === 'ECS';
  const isRDS = nodeType === 'RDS' || nodeType === 'AURORA' || nodeType === 'DATABASE';
  const isDynamoDB = nodeType === 'DYNAMODB';
  const isS3 = nodeType === 'S3' || nodeType === 'EBS';
  const isALB = nodeType === 'ALB' || nodeType === 'ELB';
  const isAPIGateway = nodeType === 'API_GATEWAY' || nodeType === 'APIGATEWAY';
  const isCloudFront = nodeType === 'CLOUDFRONT';
  const isNATGateway = nodeType === 'NAT_GATEWAY' || nodeType === 'NAT';
  const isVPC = nodeType === 'VPC';

  return (
    <div className="w-80 h-full flex flex-col bg-white border-l border-slate-200/90 select-none shrink-0 z-20 shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-bold text-slate-900">Component Inspector</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onDeleteNode(selectedNode.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete node"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inspector Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-slate-800">
        {/* Resource Name */}
        <div>
          <label className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block mb-1.5 font-bold">
            Resource Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
        </div>

        {/* AWS Service Type & ID */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">AWS Service:</span>
            <span className="font-bold text-amber-700 font-mono">{selectedNode.type}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Node ID:</span>
            <span className="text-slate-600 truncate max-w-[140px] font-medium">{selectedNode.id}</span>
          </div>
        </div>

        {/* 1. EC2 Configuration */}
        {isEC2 && (
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
              EC2 Compute Sizing
            </div>
            
            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">Instance Type</label>
              <select
                value={config.instance_type || 't3.medium'}
                onChange={(e) => handleConfigChange('instance_type', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              >
                <option value="t3.micro">t3.micro (2 vCPU, 1 GiB)</option>
                <option value="t3.small">t3.small (2 vCPU, 2 GiB)</option>
                <option value="t3.medium">t3.medium (2 vCPU, 4 GiB)</option>
                <option value="t3.large">t3.large (2 vCPU, 8 GiB)</option>
                <option value="c6i.xlarge">c6i.xlarge (4 vCPU, 8 GiB Compute Optimized)</option>
                <option value="m6i.xlarge">m6i.xlarge (4 vCPU, 16 GiB General Purpose)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">Instance Count</label>
              <input
                type="number"
                min="1"
                max="32"
                value={config.count ?? 1}
                onChange={(e) => handleConfigChange('count', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <div className="text-xs font-semibold text-slate-800">Auto Scaling Group</div>
                <div className="text-[10px] text-slate-500">Elastic scale on traffic surge</div>
              </div>
              <input
                type="checkbox"
                checked={!!config.auto_scaling}
                onChange={(e) => handleConfigChange('auto_scaling', e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* 2. Lambda Configuration */}
        {isLambda && (
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
              Lambda Execution Parameters
            </div>
            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">Runtime Environment</label>
              <select
                value={config.runtime || 'python3.12'}
                onChange={(e) => handleConfigChange('runtime', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              >
                <option value="python3.12">Python 3.12</option>
                <option value="nodejs20.x">Node.js 20.x</option>
                <option value="java21">Java 21</option>
                <option value="go1.x">Go 1.x</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">Allocated Memory (MB)</label>
              <select
                value={config.memory_mb || 512}
                onChange={(e) => handleConfigChange('memory_mb', parseInt(e.target.value) || 512)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              >
                <option value={128}>128 MB (Lightweight)</option>
                <option value={256}>256 MB</option>
                <option value={512}>512 MB (Recommended)</option>
                <option value={1024}>1024 MB (1 vCPU equivalent)</option>
                <option value={2048}>2048 MB</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">Reserved Concurrency Limit</label>
              <input
                type="number"
                min="10"
                max="10000"
                value={config.concurrency_limit ?? 1000}
                onChange={(e) => handleConfigChange('concurrency_limit', parseInt(e.target.value) || 1000)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>
          </div>
        )}

        {/* 3. ECS Configuration */}
        {isECS && (
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
              ECS Container Service
            </div>
            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">Launch Type</label>
              <select
                value={config.launch_type || 'FARGATE'}
                onChange={(e) => handleConfigChange('launch_type', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              >
                <option value="FARGATE">AWS Fargate (Serverless)</option>
                <option value="EC2">EC2 Container Cluster</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">Desired Tasks Count</label>
              <input
                type="number"
                min="1"
                max="64"
                value={config.desired_tasks ?? config.count ?? 2}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  handleConfigChange('desired_tasks', val);
                  handleConfigChange('count', val);
                }}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">Task CPU Units</label>
              <select
                value={config.cpu_units || 512}
                onChange={(e) => handleConfigChange('cpu_units', parseInt(e.target.value) || 512)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              >
                <option value={256}>256 (.25 vCPU)</option>
                <option value={512}>512 (.50 vCPU)</option>
                <option value={1024}>1024 (1 vCPU)</option>
                <option value={2048}>2048 (2 vCPU)</option>
              </select>
            </div>
          </div>
        )}

        {/* 4. API Gateway Configuration */}
        {isAPIGateway && (
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
              API Gateway Ingress
            </div>
            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">Protocol Type</label>
              <select
                value={config.api_type || 'REST'}
                onChange={(e) => handleConfigChange('api_type', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              >
                <option value="REST">REST API (Edge / Regional)</option>
                <option value="HTTP">HTTP API (Low Latency / Cost)</option>
                <option value="WEBSOCKET">WebSocket API (Real-time)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">Throttling Rate Limit (RPS)</label>
              <input
                type="number"
                min="100"
                max="50000"
                value={config.rate_limit_rps ?? 10000}
                onChange={(e) => handleConfigChange('rate_limit_rps', parseInt(e.target.value) || 10000)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <div className="text-xs font-semibold text-slate-800">AWS WAF Association</div>
                <div className="text-[10px] text-slate-500">DDoS & SQLi protection WebACL</div>
              </div>
              <input
                type="checkbox"
                checked={!!config.waf_enabled}
                onChange={(e) => handleConfigChange('waf_enabled', e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* 5. RDS Configuration */}
        {isRDS && (
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
              RDS Database Configuration
            </div>

            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">DB Engine Class</label>
              <select
                value={config.instance_type || 'db.t3.medium'}
                onChange={(e) => handleConfigChange('instance_type', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              >
                <option value="db.t3.micro">db.t3.micro</option>
                <option value="db.t3.small">db.t3.small</option>
                <option value="db.t3.medium">db.t3.medium</option>
                <option value="db.r6g.large">db.r6g.large (Memory Optimized)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">Storage Allocation (GB)</label>
              <input
                type="number"
                min="20"
                max="5000"
                value={config.storage_gb ?? 50}
                onChange={(e) => handleConfigChange('storage_gb', parseInt(e.target.value) || 50)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <div className="text-xs font-semibold text-slate-800">Multi-AZ Deployment</div>
                <div className="text-[10px] text-slate-500">Synchronous standby replica</div>
              </div>
              <input
                type="checkbox"
                checked={!!config.multi_az}
                onChange={(e) => handleConfigChange('multi_az', e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* 6. DynamoDB Configuration */}
        {isDynamoDB && (
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
              DynamoDB NoSQL Table
            </div>
            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">Capacity Mode</label>
              <select
                value={config.billing_mode || 'PAY_PER_REQUEST'}
                onChange={(e) => handleConfigChange('billing_mode', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              >
                <option value="PAY_PER_REQUEST">On-Demand (Pay-Per-Request)</option>
                <option value="PROVISIONED">Provisioned Throughput</option>
              </select>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <div className="text-xs font-semibold text-slate-800">Point-in-Time Recovery</div>
                <div className="text-[10px] text-slate-500">Continuous 35-day backup</div>
              </div>
              <input
                type="checkbox"
                checked={config.pitr_enabled !== false}
                onChange={(e) => handleConfigChange('pitr_enabled', e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* 7. S3 / Storage Configuration */}
        {isS3 && (
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
              S3 Bucket Configuration
            </div>

            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">Allocated Volume (GB)</label>
              <input
                type="number"
                min="10"
                max="100000"
                value={config.storage_gb ?? 100}
                onChange={(e) => handleConfigChange('storage_gb', parseInt(e.target.value) || 100)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <div className="text-xs font-semibold text-slate-800">Bucket Versioning</div>
                <div className="text-[10px] text-slate-500">Keep historic object versions</div>
              </div>
              <input
                type="checkbox"
                checked={config.versioning_enabled !== false}
                onChange={(e) => handleConfigChange('versioning_enabled', e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* 8. ALB Load Balancer Configuration */}
        {isALB && (
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
              Application Load Balancer
            </div>
            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">SSL/TLS Security Policy</label>
              <select
                value={config.ssl_policy || 'ELBSecurityPolicy-TLS13-1-2-2021-06'}
                onChange={(e) => handleConfigChange('ssl_policy', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              >
                <option value="ELBSecurityPolicy-TLS13-1-2-2021-06">TLS 1.3 (Strict Security)</option>
                <option value="ELBSecurityPolicy-2016-08">TLS 1.2 (Legacy Support)</option>
              </select>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <div className="text-xs font-semibold text-slate-800">AWS WAF WebACL</div>
                <div className="text-[10px] text-slate-500">Attach managed firewall rules</div>
              </div>
              <input
                type="checkbox"
                checked={!!config.waf_enabled}
                onChange={(e) => handleConfigChange('waf_enabled', e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* 9. CloudFront Configuration */}
        {isCloudFront && (
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
              CloudFront Edge Distribution
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <div className="text-xs font-semibold text-slate-800">AWS WAF Edge Protection</div>
                <div className="text-[10px] text-slate-500">Block exploits before origin</div>
              </div>
              <input
                type="checkbox"
                checked={!!config.waf_enabled}
                onChange={(e) => handleConfigChange('waf_enabled', e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* 10. VPC Configuration */}
        {isVPC && (
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
              Virtual Private Cloud (VPC)
            </div>
            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">IPv4 CIDR Block</label>
              <input
                type="text"
                value={config.cidr_block || '10.0.0.0/16'}
                onChange={(e) => handleConfigChange('cidr_block', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <div className="text-xs font-semibold text-slate-800">VPC Flow Logs</div>
                <div className="text-[10px] text-slate-500">Capture IP traffic audit trail</div>
              </div>
              <input
                type="checkbox"
                checked={config.flow_logs_enabled !== false}
                onChange={(e) => handleConfigChange('flow_logs_enabled', e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* 11. NAT Gateway Configuration */}
        {isNATGateway && (
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
              NAT Gateway Resilience
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <div className="text-xs font-semibold text-slate-800">Multi-AZ Redundancy</div>
                <div className="text-[10px] text-slate-500">Provision redundant NAT per AZ</div>
              </div>
              <input
                type="checkbox"
                checked={!!config.multi_az}
                onChange={(e) => handleConfigChange('multi_az', e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Security & Access Controls */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
            Security & Exposure
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <div className="text-xs font-semibold text-slate-800">Public Exposure</div>
              <div className="text-[10px] text-slate-500">Expose directly to internet</div>
            </div>
            <input
              type="checkbox"
              checked={!!config.publicly_accessible}
              onChange={(e) => handleConfigChange('publicly_accessible', e.target.checked)}
              className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <div className="text-xs font-semibold text-slate-800">KMS Encryption at Rest</div>
              <div className="text-[10px] text-slate-500">AWS managed key encryption</div>
            </div>
            <input
              type="checkbox"
              checked={config.encrypted !== false}
              onChange={(e) => handleConfigChange('encrypted', e.target.checked)}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/70 text-[10px] font-mono text-slate-500 text-center font-medium">
        Changes automatically synchronized to digital twin state
      </div>
    </div>
  );
};
