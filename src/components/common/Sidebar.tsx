import React from 'react';
import {
  Activity,
  AlertOctagon,
  BookOpen,
  Boxes,
  CheckCircle,
  Clock,
  Compass,
  Cpu,
  Database,
  FileCheck,
  FileText,
  GitCompare,
  GraduationCap,
  HeartPulse,
  History,
  Layers,
  Network,
  Share2,
  ShieldAlert,
  Sparkles,
  Users
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
  const navSections = [
    {
      label: 'Core Research',
      items: [
        { id: 'command-center', name: 'Command Center', icon: Activity, badge: 'Live' },
        { id: 'medicine-explorer', name: 'Medicine Explorer', icon: Compass },
        { id: 'interaction-review', name: 'Interaction Review', icon: GitCompare, badge: 'Core' },
        { id: 'molecular-lab', name: '3D Molecular Lab', icon: Boxes, highlight: true },
        { id: 'pathway-network', name: 'Receptor & Pathways', icon: Network }
      ]
    },
    {
      label: 'Clinical & Safety',
      items: [
        { id: 'clinical-workspace', name: 'Clinical Review', icon: HeartPulse },
        { id: 'pharmacovigilance', name: 'Safety Signals (FAERS)', icon: ShieldAlert },
        { id: 'contradiction-radar', name: 'Contradiction Radar', icon: AlertOctagon },
        { id: 'medication-timeline', name: 'Medication Timeline', icon: Clock },
        { id: 'professional-review', name: 'Sign-off Workflow', icon: CheckCircle }
      ]
    },
    {
      label: 'Scientific Intel',
      items: [
        { id: 'hypothesis-workbench', name: 'Hypothesis Canvas', icon: Layers },
        { id: 'literature-intel', name: 'PubMed Intelligence', icon: BookOpen },
        { id: 'collaboration', name: 'Collaboration Space', icon: Users },
        { id: 'report-studio', name: 'Report Studio (PDF)', icon: FileText, highlight: true },
        { id: 'patient-education', name: 'Patient Education', icon: GraduationCap }
      ]
    },
    {
      label: 'Differentiators & Admin',
      items: [
        { id: 'time-machine', name: 'Evidence Time Machine', icon: History },
        { id: 'gap-atlas', name: 'Evidence Gap Atlas', icon: GitCompare },
        { id: 'storyboard', name: 'Molecular Storyboard', icon: Sparkles },
        { id: 'ai-assistant', name: 'Explainable AI Assistant', icon: Cpu },
        { id: 'source-admin', name: 'Data Source Admin', icon: Database },
        { id: 'audit-provenance', name: 'Audit & Provenance', icon: FileCheck }
      ]
    }
  ];

  return (
    <aside
      className={`fixed top-16 left-0 bottom-0 z-30 bg-[#101827] border-r border-white/10 transition-all duration-300 flex flex-col ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {navSections.map((section, sIdx) => (
          <div key={sIdx}>
            {!collapsed && (
              <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-wider text-[#64748B] font-semibold">
                {section.label}
              </div>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectModule(item.id)}
                    title={collapsed ? item.name : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-[#37D6E6]/15 text-[#37D6E6] border border-[#37D6E6]/30 shadow-sm'
                        : 'text-[#A7B5C9] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isActive
                          ? 'text-[#37D6E6] scale-110'
                          : item.highlight
                          ? 'text-[#9079F7]'
                          : 'text-[#A7B5C9] group-hover:text-white'
                      }`}
                    />
                    {!collapsed && (
                      <div className="flex-1 flex items-center justify-between text-left truncate">
                        <span className="truncate">{item.name}</span>
                        {item.badge && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-white/80">
                            {item.badge}
                          </span>
                        )}
                        {item.highlight && !item.badge && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#9079F7]" />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-2 border-t border-white/10 flex items-center justify-between">
        {!collapsed && (
          <div className="px-2 text-[10px] text-[#64748B] font-mono">
            PS-12 ENGINE • ONLINE
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-[#A7B5C9] hover:text-white hover:bg-white/5 mx-auto"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <div className="w-4 h-4 flex flex-col justify-center items-center gap-1">
            <span className="w-3.5 h-0.5 bg-current" />
            <span className="w-3.5 h-0.5 bg-current" />
          </div>
        </button>
      </div>
    </aside>
  );
};
