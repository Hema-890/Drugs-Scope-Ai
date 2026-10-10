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
  const [showAdvancedTools, setShowAdvancedTools] = React.useState(false);

  const primaryNav = [
    { id: 'landing', name: 'Home', icon: Compass },
    { id: 'analyze', name: 'Analyze Medicines', icon: Zap, badge: 'Core' },
    { id: 'interaction-review', name: 'Interaction Analysis', icon: GitCompare },
    { id: 'molecular-lab', name: '3D Molecular Lab', icon: Boxes },
    { id: 'literature-intel', name: 'Literature Intelligence', icon: BookOpen },
    { id: 'report-studio', name: 'Reports & Dossiers', icon: FileText }
  ];

  const advancedTools = [
    { id: 'command-center', name: 'Command Center', icon: Activity },
    { id: 'medicine-explorer', name: 'Drug & Target Explorer', icon: Database },
    { id: 'pathway-network', name: 'Pathway & Receptor Explorer', icon: Network },
    { id: 'clinical-workspace', name: 'Clinical Evidence Logs', icon: FileCheck },
    { id: 'collaboration', name: 'Saved Projects', icon: FolderGit2 },
    { id: 'ai-assistant', name: 'AI Scientific Assistant', icon: Cpu, badge: 'AI' },
    { id: 'hypothesis-workbench', name: 'Research Notebook', icon: Layers },
    { id: 'pharmacovigilance', name: 'Screening Workflows', icon: ShieldAlert },
    { id: 'source-admin', name: 'Data Sources & APIs', icon: KeyRound }
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
        {/* Primary Navigation */}
        <div className="space-y-1">
          {!collapsed && (
            <div className="px-3.5 mb-2 text-[10px] font-mono uppercase tracking-wider text-[#71839E] font-semibold">
              Core Modules
            </div>
          )}
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectModule(item.id)}
                title={collapsed ? item.name : undefined}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-[#152238] text-[#24D8ED] font-semibold border-l-2 border-[#24D8ED] shadow-sm'
                    : 'text-[#A6B5CB] hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3.5 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isActive ? 'text-[#24D8ED]' : 'text-[#71839E] group-hover:text-white'
                    }`}
                  />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </div>
                {!collapsed && item.badge && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-[#24D8ED]/15 text-[#24D8ED] border border-[#24D8ED]/30 font-semibold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Secondary / Advanced Tools with Progressive Disclosure */}
        <div className="border-t border-white/[0.06] pt-4">
          {!collapsed && (
            <button
              onClick={() => setShowAdvancedTools(!showAdvancedTools)}
              className="w-full flex items-center justify-between px-3.5 mb-2 text-[10px] font-mono uppercase tracking-wider text-[#71839E] hover:text-[#A6B5CB] font-semibold cursor-pointer"
            >
              <span>Research Tools ({advancedTools.length})</span>
              <span className="text-xs">{showAdvancedTools ? '−' : '+'}</span>
            </button>
          )}
          <div className={`space-y-1 ${!collapsed && !showAdvancedTools ? 'hidden' : 'block'}`}>
            {advancedTools.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectModule(item.id)}
                  title={collapsed ? item.name : undefined}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                    isActive
                      ? 'bg-[#152238] text-[#24D8ED] font-semibold'
                      : 'text-[#8A9EB7] hover:bg-white/[0.04] hover:text-white'
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
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-[#9475FF]/15 text-[#9475FF] border border-[#9475FF]/30 font-semibold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Understated Production Status Footer */}
      {!collapsed ? (
        <div className="p-3 border-t border-white/[0.08]">
          <div className="p-3 rounded-xl bg-[#0E1726] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#31CAB6] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#31CAB6]"></span>
              </span>
              <div className="text-[10px] text-[#A6B5CB]">
                <span className="text-white font-medium">openFDA & PubMed</span>
                <div className="text-[#71839E]">v7.0 Production Engine</div>
              </div>
            </div>
            <span className="text-[9px] font-mono text-[#24D8ED] px-1.5 py-0.5 rounded bg-[#24D8ED]/10 border border-[#24D8ED]/20">
              LIVE
            </span>
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
