import React from 'react';
import {
  Activity,
  BookOpen,
  Boxes,
  Compass,
  Cpu,
  Database,
  FileCheck,
  FileText,
  FolderGit2,
  GitCompare,
  KeyRound,
  Layers,
  Network,
  Settings,
  Share2,
  ShieldAlert,
  Sparkles,
  Zap
} from 'lucide-react';

interface SidebarProps {
  activeModule: string;
  onSelectModule: (moduleId: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  collapsed,
  onToggleCollapse
}) => {
  const mainNav = [
    { id: 'analyze', name: 'Analyze Medicines', icon: Zap, badge: 'Core' },
    { id: 'command-center', name: 'Research Command Center', icon: Activity },
    { id: 'medicine-explorer', name: 'Drug Search', icon: Compass },
    { id: 'interaction-review', name: 'Interaction Analysis', icon: GitCompare },
    { id: 'molecular-lab', name: '3D Molecular Lab', icon: Boxes },
    { id: 'literature-intel', name: 'Literature Intelligence', icon: BookOpen },
    { id: 'pathway-network', name: 'Disease & Pathway Explorer', icon: Network },
    { id: 'clinical-workspace', name: 'Real Drug Evidence', icon: Database },
    { id: 'collaboration', name: 'Saved Projects', icon: FolderGit2 },
    { id: 'report-studio', name: 'Reports & Exports', icon: FileText }
  ];

  const toolsNav = [
    { id: 'ai-assistant', name: 'AI Assistant', icon: Cpu, badge: 'New' },
    { id: 'hypothesis-workbench', name: 'Notebook', icon: Layers },
    { id: 'pharmacovigilance', name: 'Screening Workflows', icon: ShieldAlert },
    { id: 'source-admin', name: 'API Access', icon: KeyRound }
  ];

  if (activeModule === 'landing' || activeModule === 'molecular-lab' || activeModule === 'analysis-report') {
    return null;
  }

  return (
    <aside
      className={`fixed top-[68px] left-0 bottom-0 z-30 bg-[#0A1323] border-r border-white/[0.08] transition-all duration-300 flex flex-col justify-between select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Scrollable Nav Area */}
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
        {/* Main Navigation */}
        <div className="space-y-1">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectModule(item.id)}
                title={collapsed ? item.name : undefined}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-[#152238] text-[#24D8ED] font-semibold border-l-2 border-[#24D8ED] shadow-sm'
                    : 'text-[#A6B5CB] hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    isActive ? 'text-[#24D8ED]' : 'text-[#71839E] group-hover:text-white'
                  }`}
                />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </button>
            );
          })}
        </div>

        {/* Tools Sub-section */}
        <div>
          {!collapsed && (
            <div className="px-3.5 mb-2 text-[10px] font-mono uppercase tracking-wider text-[#71839E] font-semibold">
              Tools
            </div>
          )}
          <div className="space-y-1">
            {toolsNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectModule(item.id)}
                  title={collapsed ? item.name : undefined}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                    isActive
                      ? 'bg-[#152238] text-[#24D8ED] font-semibold'
                      : 'text-[#A6B5CB] hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5 truncate">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-[#24D8ED]' : 'text-[#71839E] group-hover:text-white'
                      }`}
                    />
                    {!collapsed && <span className="truncate">{item.name}</span>}
                  </div>
                  {!collapsed && item.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-[#24D8ED]/15 text-[#24D8ED] border border-[#24D8ED]/30 font-semibold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Professional Plan Card (Matching Image 2) */}
      {!collapsed ? (
        <div className="p-3 border-t border-white/[0.08]">
          <div className="p-3.5 rounded-2xl bg-[#111C2E] border border-white/5 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-white">
              <span>Professional Plan</span>
              <Sparkles className="w-3.5 h-3.5 text-[#9475FF]" />
            </div>

            <div className="flex items-center gap-3">
              {/* Circular Gauge */}
              <div className="relative w-8 h-8 rounded-full border-2 border-[#24D8ED] border-t-transparent flex items-center justify-center shrink-0">
                <span className="text-[9px] font-mono text-[#24D8ED] font-bold">62%</span>
              </div>
              <div className="text-[11px] text-[#A6B5CB] leading-tight">
                <span className="text-white font-medium">1,240</span> / 2,000 searches
              </div>
            </div>

            <button
              onClick={() => onSelectModule('report-studio')}
              className="w-full py-1.5 rounded-lg bg-gradient-to-r from-[#24D8ED]/20 to-[#9475FF]/20 border border-[#24D8ED]/30 hover:border-[#24D8ED]/60 text-[11px] font-semibold text-white transition-all cursor-pointer"
            >
              Upgrade Plan
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3 border-t border-white/[0.08] text-center">
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg text-[#71839E] hover:text-white hover:bg-white/5 mx-auto cursor-pointer"
            title="Expand Sidebar"
          >
            <Zap className="w-4 h-4 text-[#24D8ED]" />
          </button>
        </div>
      )}
    </aside>
  );
};
