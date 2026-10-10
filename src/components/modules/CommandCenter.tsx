import React from 'react';
import { VERIFIED_DRUGS } from '../../data/mockDrugs';
import { BIOLOGICAL_TARGETS } from '../../data/mockTargets';
import { PROTEIN_STRUCTURES } from '../../data/mockStructures';
import { PAIRWISE_INTERACTIONS } from '../../data/mockInteractions';
import { DATA_SOURCES } from '../../data/mockSources';
import { getStoredAuditLog } from '../../services/storageService';
import { DatasetMode } from '../../types';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Clock,
  Compass,
  Database,
  FileText,
  GitCompare,
  Layers,
  Network,
  Shield,
  Zap
} from 'lucide-react';

interface CommandCenterProps {
  mode: DatasetMode;
  onNavigate: (moduleId: string) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({ mode, onNavigate }) => {
  const auditLogs = getStoredAuditLog();

  // Summary statistics
  const contraindicatedCount = PAIRWISE_INTERACTIONS.filter((i) => i.severity === 'Contraindicated').length;
  const majorCount = PAIRWISE_INTERACTIONS.filter((i) => i.severity === 'Major').length;
  const healthySourcesCount = DATA_SOURCES.filter((s) => s.status === 'Operational').length;

  return (
    <div className="space-y-6">
      {/* Top Welcome & Mission Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#101827] via-[#172134] to-[#1D2A3E] border border-white/10 p-6 md:p-8">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-[#37D6E6]/15 text-[#37D6E6] border border-[#37D6E6]/30 font-semibold">
              PS-12 AUTONOMOUS ENGINE • ACTIVE
            </span>
            <span className="text-xs text-[#A7B5C9] font-medium">Mode: {mode}</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-display font-extrabold text-white tracking-tight">
            Scientific Intelligence Command Center
          </h1>
          <p className="mt-2 text-sm text-[#A7B5C9] leading-relaxed">
            Autonomous multi-database discovery engine correlating FDA structured product labeling, 
            RxNorm clinical identifiers, RCSB 3D macromolecular structures, and PubMed pharmacological evidence 
            to uncover high-stakes drug–drug conflicts and receptor competition.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('molecular-lab')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#37D6E6] text-[#070B14] font-semibold text-xs hover:bg-[#37D6E6]/90 transition-all shadow-lg"
            >
              <Boxes className="w-4 h-4" />
              Launch 3D Molecular Lab
            </button>
            <button
              onClick={() => onNavigate('interaction-review')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#172134] text-[#F4F7FB] border border-white/10 hover:border-[#37D6E6]/40 font-medium text-xs transition-all"
            >
              <GitCompare className="w-4 h-4 text-[#37D6E6]" />
              Run Interaction Matrix
            </button>
            <button
              onClick={() => onNavigate('report-studio')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#172134] text-[#F4F7FB] border border-white/10 hover:border-[#9079F7]/40 font-medium text-xs transition-all"
            >
              <FileText className="w-4 h-4 text-[#9079F7]" />
              Generate Clinical PDF Report
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-[#37D6E6]/10 to-transparent pointer-events-none" />
      </div>

      {/* Primary Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#A7B5C9] text-xs">
            <span>Indexed Drugs</span>
            <Compass className="w-4 h-4 text-[#37D6E6]" />
          </div>
          <div className="text-2xl font-display font-bold text-white mt-2">
            {VERIFIED_DRUGS.length}
          </div>
          <div className="text-[11px] text-[#32C8B7] mt-1 flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-3 h-3" /> RxNorm & openFDA Mapped
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#A7B5C9] text-xs">
            <span>Biological Targets</span>
            <Network className="w-4 h-4 text-[#9079F7]" />
          </div>
          <div className="text-2xl font-display font-bold text-white mt-2">
            {BIOLOGICAL_TARGETS.length}
          </div>
          <div className="text-[11px] text-[#9079F7] mt-1 font-mono">
            Enzymes, Receptors & Ion Channels
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#A7B5C9] text-xs">
            <span>3D Macromolecules</span>
            <Boxes className="w-4 h-4 text-[#32C8B7]" />
          </div>
          <div className="text-2xl font-display font-bold text-white mt-2">
            {PROTEIN_STRUCTURES.length}
          </div>
          <div className="text-[11px] text-[#37D6E6] mt-1 font-mono">
            Cryo-EM & X-Ray PDB Models
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center justify-between text-[#A7B5C9] text-xs">
            <span>Critical Conflicts</span>
            <AlertTriangle className="w-4 h-4 text-[#F16D76]" />
          </div>
          <div className="text-2xl font-display font-bold text-[#F16D76] mt-2">
            {contraindicatedCount} Contraindicated
          </div>
          <div className="text-[11px] text-[#EFB85A] mt-1 font-mono">
            + {majorCount} Major Severity Interactions
          </div>
        </div>
      </div>

      {/* Middle Split: Evidence Distribution & Live Data Source SLAs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interaction Evidence Overview */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-display font-bold text-white flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-[#37D6E6]" />
              High-Stakes Drug Conflict Distribution
            </h2>
            <button
              onClick={() => onNavigate('interaction-review')}
              className="text-xs text-[#37D6E6] hover:underline flex items-center gap-1 font-medium"
            >
              View Full Matrix <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {PAIRWISE_INTERACTIONS.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigate('interaction-review')}
                className="p-3.5 rounded-lg bg-[#070B14]/80 border border-white/5 hover:border-[#37D6E6]/40 cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-xs">
                      {item.drugAName} ↔ {item.drugBName}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        item.severity === 'Contraindicated'
                          ? 'bg-[#F16D76]/20 text-[#F16D76] border border-[#F16D76]/40'
                          : 'bg-[#EFB85A]/20 text-[#EFB85A] border border-[#EFB85A]/40'
                      }`}
                    >
                      {item.severity}
                    </span>
                  </div>
                  <p className="text-xs text-[#A7B5C9] mt-1 line-clamp-1">
                    {item.clinicalConsequence}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-right shrink-0">
                  <span className="text-[10px] font-mono text-[#32C8B7] bg-[#32C8B7]/10 px-2 py-1 rounded">
                    {item.interactionType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Verified Biomedical Data Adapters SLA */}
        <div className="glass-panel p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-display font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-[#32C8B7]" />
              Data Source Adapters
            </h2>
            <span className="text-[10px] font-mono text-[#32C8B7] bg-[#32C8B7]/15 px-2 py-0.5 rounded">
              {healthySourcesCount}/{DATA_SOURCES.length} Active
            </span>
          </div>

          <div className="space-y-2.5">
            {DATA_SOURCES.map((source) => (
              <div
                key={source.sourceCode}
                className="p-2.5 rounded-lg bg-[#070B14]/60 border border-white/5 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-[#F4F7FB]">{source.name}</div>
                  <div className="text-[10px] text-[#64748B]">{source.provider}</div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[10px] text-[#37D6E6]">
                    {source.latencyMs} ms
                  </span>
                  <div className="w-2 h-2 rounded-full bg-[#32C8B7] ml-auto mt-0.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Activity & Provenance Audit Log */}
      <div className="glass-panel p-5 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-display font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#9079F7]" />
            Recent Research Provenance Audit Log
          </h2>
          <button
            onClick={() => onNavigate('audit-provenance')}
            className="text-xs text-[#37D6E6] hover:underline font-medium"
          >
            Full Audit History →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[#64748B] font-mono text-[10px] uppercase">
                <th className="pb-2">Timestamp</th>
                <th className="pb-2">Researcher</th>
                <th className="pb-2">Action</th>
                <th className="pb-2">Target / Resource</th>
                <th className="pb-2">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {auditLogs.slice(0, 4).map((log) => (
                <tr key={log.id} className="text-[#A7B5C9]">
                  <td className="py-2.5 font-mono text-[11px] text-[#64748B]">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2.5 font-medium text-white">{log.actor}</td>
                  <td className="py-2.5">
                    <span className="font-mono text-[10px] bg-white/5 px-2 py-0.5 rounded text-[#37D6E6]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 font-mono text-[11px] text-white">{log.resource}</td>
                  <td className="py-2.5 text-[#A7B5C9] max-w-xs truncate">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
