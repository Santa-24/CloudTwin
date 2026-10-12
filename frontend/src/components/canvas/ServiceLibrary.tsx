'use client';

import React from 'react';
import { 
  Cpu, 
  Zap, 
  Layers, 
  Network, 
  Globe, 
  Database, 
  HardDrive, 
  Server, 
  Search, 
  Plus
} from 'lucide-react';

interface ServiceLibraryProps {
  onAddNode: (type: string, category: 'compute' | 'network' | 'database' | 'storage', name: string) => void;
}

export const ServiceLibrary: React.FC<ServiceLibraryProps> = ({ onAddNode }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const services = [
    {
      category: 'compute' as const,
      categoryName: 'Compute',
      items: [
        { type: 'EC2', name: 'Elastic Compute Cloud', desc: 'Virtual server instances with auto-scaling', icon: Cpu },
        { type: 'Lambda', name: 'AWS Lambda', desc: 'Serverless event-driven execution', icon: Zap },
        { type: 'ECS', name: 'Elastic Container Service', desc: 'Docker containerized microservices', icon: Layers },
      ]
    },
    {
      category: 'network' as const,
      categoryName: 'Networking & Content',
      items: [
        { type: 'ALB', name: 'Application Load Balancer', desc: 'Layer 7 HTTP/HTTPS traffic distributor', icon: Network },
        { type: 'API_Gateway', name: 'Amazon API Gateway', desc: 'Managed REST, HTTP & WebSocket API ingress', icon: Network },
        { type: 'CloudFront', name: 'Amazon CloudFront', desc: 'Global content delivery network (CDN)', icon: Globe },
        { type: 'NAT_Gateway', name: 'NAT Gateway', desc: 'Outbound internet access for private subnets', icon: Network },
        { type: 'VPC', name: 'Virtual Private Cloud', desc: 'Isolated software-defined cloud network', icon: Globe },
      ]
    },
    {
      category: 'database' as const,
      categoryName: 'Database',
      items: [
        { type: 'RDS', name: 'Amazon RDS (PostgreSQL/MySQL)', desc: 'Managed relational database engine', icon: Database },
        { type: 'DynamoDB', name: 'Amazon DynamoDB', desc: 'Key-value and document NoSQL database', icon: Database },
      ]
    },
    {
      category: 'storage' as const,
      categoryName: 'Storage',
      items: [
        { type: 'S3', name: 'Simple Storage Service (S3)', desc: 'High-durability object storage bucket', icon: HardDrive },
        { type: 'EBS', name: 'Elastic Block Store (EBS)', desc: 'Persistent block storage volumes', icon: HardDrive },
      ]
    }
  ];

  const filteredCategories = services.map(cat => ({
    ...cat,
    items: cat.items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="w-72 h-full flex flex-col bg-white border-r border-slate-200/90 select-none shrink-0 z-10 shadow-xs">
      {/* Header & Search */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-800">AWS Service Palette</span>
          <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300 font-bold">
            Click to Place
          </span>
        </div>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search AWS services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
        </div>
      </div>

      {/* Services List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {filteredCategories.map((cat) => (
          <div key={cat.category}>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-2 px-1">
              {cat.categoryName}
            </div>
            <div className="space-y-1.5">
              {cat.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.type}
                    onClick={() => onAddNode(item.type, cat.category, item.type)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 hover:border-amber-400/80 cursor-pointer transition-all group shadow-xs hover:shadow-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 group-hover:border-amber-400 group-hover:text-amber-600 transition-colors shadow-xs">
                        <Icon className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 group-hover:text-amber-800 truncate">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {item.desc}
                        </div>
                      </div>
                    </div>
                    <button className="p-1 rounded-md text-slate-400 group-hover:text-amber-700 group-hover:bg-amber-100 shrink-0 transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
