'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { 
  Play, 
  Save, 
  RotateCcw, 
  Layout, 
  CheckCircle2, 
  FileDown, 
  Sparkles, 
  Plus, 
  Layers,
  History,
  AlertCircle
} from 'lucide-react';

import { AWSNode } from './AWSNode';
import { ServiceLibrary } from './ServiceLibrary';
import { NodeInspector } from './NodeInspector';
import { ArchitectureSchema, ArchitectureNode, ArchitectureConnection } from '../../types';

interface ArchitectureCanvasProps {
  architecture: ArchitectureSchema;
  onSave: (arch: ArchitectureSchema) => Promise<void>;
  onRunSimulation: () => void;
  onValidate: () => void;
  validationResult: { valid: boolean; issues: any[] } | null;
  onOpenVersions: () => void;
}

const nodeTypes: any = {
  awsNode: AWSNode
};

export const ArchitectureCanvas: React.FC<ArchitectureCanvasProps> = ({
  architecture,
  onSave,
  onRunSimulation,
  onValidate,
  validationResult,
  onOpenVersions
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const hasModifiedRef = React.useRef(false);
  const isSavingRef = React.useRef(false);

  // Convert canonical schema nodes to React Flow nodes
  const initialNodes: Node[] = useMemo(() => {
    return (architecture.nodes || []).map((n) => ({
      id: n.id,
      type: 'awsNode',
      position: { x: n.position?.x ?? 200, y: n.position?.y ?? 200 },
      data: {
        id: n.id,
        name: n.name,
        type: n.type,
        category: n.category,
        config: n.config,
        status: n.status
      }
    }));
  }, [architecture]);

  // Convert canonical connections to React Flow edges
  const initialEdges: Edge[] = useMemo(() => {
    return (architecture.connections || []).map((c) => ({
      id: c.id,
      source: c.source,
      target: c.target,
      sourceHandle: c.source_handle || undefined,
      targetHandle: c.target_handle || undefined,
      animated: true,
      style: { stroke: '#F59E0B', strokeWidth: 2 }
    }));
  }, [architecture]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Synchronize when architecture changes externally
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Connect handler
  const onConnect = useCallback((params: Connection) => {
    hasModifiedRef.current = true;
    setEdges((eds) => addEdge({
      ...params,
      animated: true,
      style: { stroke: '#F59E0B', strokeWidth: 2 }
    }, eds));
  }, [setEdges]);

  // Node selection handler
  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // Add new node from Service Library
  const handleAddNode = (type: string, category: 'compute' | 'network' | 'database' | 'storage', name: string) => {
    const id = `node-${type.toLowerCase().replace('_', '-')}-${Date.now().toString().slice(-5)}`;
    
    // Sensible defaults tailored per AWS service
    let defaultConfig: any = {
      encrypted: true,
      publicly_accessible: false
    };

    if (type === 'EC2') {
      defaultConfig = { ...defaultConfig, instance_type: 't3.medium', count: 1, auto_scaling: false };
    } else if (type === 'RDS') {
      defaultConfig = { ...defaultConfig, instance_type: 'db.t3.medium', engine: 'postgres', storage_gb: 50, multi_az: true, backup_retention_days: 7 };
    } else if (type === 'S3') {
      defaultConfig = { ...defaultConfig, storage_gb: 100, versioning_enabled: true, block_public_access: true };
    } else if (type === 'Lambda') {
      defaultConfig = { ...defaultConfig, runtime: 'python3.12', memory_mb: 512, timeout_sec: 30, concurrency_limit: 1000 };
    } else if (type === 'API_Gateway') {
      defaultConfig = { ...defaultConfig, api_type: 'REST', rate_limit_rps: 10000, burst_limit: 5000, waf_enabled: false };
    } else if (type === 'ALB') {
      defaultConfig = { ...defaultConfig, multi_az: true, ssl_policy: 'ELBSecurityPolicy-TLS13-1-2-2021-06', waf_enabled: false, publicly_accessible: true };
    } else if (type === 'CloudFront') {
      defaultConfig = { ...defaultConfig, waf_enabled: false, publicly_accessible: true };
    } else if (type === 'DynamoDB') {
      defaultConfig = { ...defaultConfig, billing_mode: 'PAY_PER_REQUEST', pitr_enabled: true, rcu: 5, wcu: 5 };
    } else if (type === 'ECS') {
      defaultConfig = { ...defaultConfig, launch_type: 'FARGATE', desired_tasks: 2, count: 2, cpu_units: 512, memory_mb: 1024 };
    } else if (type === 'VPC') {
      defaultConfig = { ...defaultConfig, cidr_block: '10.0.0.0/16', flow_logs_enabled: true };
    } else if (type === 'NAT_Gateway') {
      defaultConfig = { ...defaultConfig, multi_az: false, availability_zone: 'ap-south-1a' };
    }

    const newNode: Node = {
      id,
      type: 'awsNode',
      position: { x: 350 + Math.random() * 80, y: 220 + Math.random() * 80 },
      data: {
        id,
        name: `${name} ${nodes.length + 1}`,
        type,
        category,
        config: defaultConfig,
        status: 'configured'
      }
    };
    setNodes((nds) => [...nds, newNode]);
    setSelectedNodeId(id);
    hasModifiedRef.current = true;
  };

  // Update node config from Inspector
  const handleUpdateNode = (nodeId: string, updates: Partial<ArchitectureNode>) => {
    hasModifiedRef.current = true;
    setNodes((nds) => nds.map((n) => {
      if (n.id === nodeId) {
        return {
          ...n,
          data: {
            ...n.data,
            ...updates,
            config: {
              ...(n.data as any).config,
              ...(updates.config || {})
            }
          }
        };
      }
      return n;
    }));
  };

  // Delete node
  const handleDeleteNode = (nodeId: string) => {
    hasModifiedRef.current = true;
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  };

  // Hierarchical auto-layout
  const handleAutoLayout = () => {
    hasModifiedRef.current = true;
    const layerOrder: Record<string, number> = {
      CLOUDFRONT: 0,
      ROUTE53: 0,
      ALB: 1,
      API_GATEWAY: 1,
      APIGATEWAY: 1,
      ELB: 1,
      NAT_GATEWAY: 1,
      VPC: 1,
      EC2: 2,
      LAMBDA: 2,
      ECS: 2,
      RDS: 3,
      DYNAMODB: 3,
      AURORA: 3,
      S3: 3,
      EBS: 3
    };

    setNodes((nds) => {
      const grouped: Record<number, Node[]> = { 0: [], 1: [], 2: [], 3: [] };
      nds.forEach((n) => {
        const type = ((n.data as any).type || '').toUpperCase();
        const tier = layerOrder[type] ?? 2;
        grouped[tier].push(n);
      });

      const updated: Node[] = [];
      Object.keys(grouped).forEach((tierStr) => {
        const tier = parseInt(tierStr);
        const list = grouped[tier];
        const xOffset = 100 + tier * 280;
        list.forEach((n, idx) => {
          const yOffset = 140 + idx * 160;
          updated.push({
            ...n,
            position: { x: xOffset, y: yOffset }
          });
        });
      });
      return updated;
    });
  };

  // Canonical Save
  const handleSave = async () => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    setIsSaving(true);
    try {
      const canonicalNodes: ArchitectureNode[] = nodes.map((n) => ({
        id: n.id,
        name: (n.data as any).name,
        type: (n.data as any).type,
        category: (n.data as any).category,
        position: n.position,
        config: (n.data as any).config || {},
        status: (n.data as any).status || 'configured'
      }));

      const canonicalConnections: ArchitectureConnection[] = edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        source_handle: e.sourceHandle || undefined,
        target_handle: e.targetHandle || undefined
      }));

      const updatedArch: ArchitectureSchema = {
        ...architecture,
        nodes: canonicalNodes,
        connections: canonicalConnections
      };

      await onSave(updatedArch);
      hasModifiedRef.current = false;
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } finally {
      setIsSaving(false);
      isSavingRef.current = false;
    }
  };

  // Auto-sync debounce effect
  useEffect(() => {
    if (!hasModifiedRef.current) return;
    const timer = setTimeout(() => {
      handleSave();
    }, 1500);
    return () => clearTimeout(timer);
  }, [nodes, edges]);

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    const match = nodes.find((n) => n.id === selectedNodeId);
    if (!match) return null;
    return {
      id: match.id,
      name: (match.data as any).name,
      type: (match.data as any).type,
      category: (match.data as any).category,
      position: match.position,
      config: (match.data as any).config || {},
      status: (match.data as any).status || 'configured'
    } as ArchitectureNode;
  }, [selectedNodeId, nodes]);

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden bg-slate-50 text-slate-900">
      {/* Canvas Floating Top Toolbar */}
      <div className="h-14 px-6 flex items-center justify-between bg-white border-b border-slate-200/90 shrink-0 z-10 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-800">Canvas Controls</span>
          <span className="text-slate-300">•</span>
          <span className="text-[11px] font-mono text-slate-500 font-medium">
            {nodes.length} Components, {edges.length} Connections
          </span>
          <span className="text-slate-300">•</span>
          {isSaving ? (
            <span className="flex items-center gap-1.5 text-xs font-mono text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Auto-Syncing...
            </span>
          ) : saveSuccess ? (
            <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Live Synced
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Auto-Sync Active
            </span>
          )}
        </div>

        {/* Toolbar Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleAutoLayout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 shadow-xs transition-all cursor-pointer"
            title="Auto-organize topology hierarchy"
          >
            <Layout className="w-3.5 h-3.5 text-amber-600" />
            <span>Auto Layout</span>
          </button>

          <button
            onClick={onValidate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 shadow-xs transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Validate</span>
          </button>

          <button
            onClick={onOpenVersions}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 shadow-xs transition-all cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-violet-600" />
            <span>Versions</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              saveSuccess
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-xs font-bold'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 shadow-xs'
            }`}
          >
            <Save className="w-3.5 h-3.5 text-amber-600" />
            <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Twin'}</span>
          </button>

          <button
            onClick={onRunSimulation}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:via-orange-400 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="font-mono text-[11px] uppercase tracking-wider">Simulate</span>
          </button>
        </div>
      </div>

      {/* Validation Issue Banner if any */}
      {validationResult && !validationResult.valid && (
        <div className="px-6 py-2.5 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 font-semibold flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Architecture warnings detected: {validationResult.issues.map((i: any) => i.message).join(' ')}</span>
          </div>
        </div>
      )}

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Draggable Service Library */}
        <ServiceLibrary onAddNode={handleAddNode} />

        {/* React Flow Graph Canvas */}
        <div className="flex-1 h-full relative bg-slate-50">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.2}
            maxZoom={2.0}
            defaultEdgeOptions={{
              animated: true,
              style: { stroke: '#F59E0B', strokeWidth: 2 }
            }}
          >
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={24} 
              size={1.5} 
              color="rgba(148, 163, 184, 0.45)" 
            />
            <Controls className="!bg-white !border-slate-200 !text-slate-700 !shadow-sm !rounded-xl" />
            <MiniMap 
              nodeColor="#F59E0B" 
              maskColor="rgba(241, 245, 249, 0.75)"
              className="!bg-white !border-slate-200 !rounded-xl !overflow-hidden !shadow-sm" 
            />
          </ReactFlow>
        </div>

        {/* Right Configuration Inspector Panel */}
        {selectedNode && (
          <NodeInspector
            selectedNode={selectedNode}
            onClose={() => setSelectedNodeId(null)}
            onUpdateNode={handleUpdateNode}
            onDeleteNode={handleDeleteNode}
          />
        )}
      </div>
    </div>
  );
};
