import React, { useState } from 'react';
import { EVIDENCE_CONFLICTS } from '../../data/mockConflicts';
import { EvidenceConflict } from '../../types';
import { AlertOctagon, CheckCircle2, GitCompare, Info, MessageSquare } from 'lucide-react';

export const ContradictionRadar: React.FC = () => {
  const [conflicts, setConflicts] = useState<EvidenceConflict[]>(EVIDENCE_CONFLICTS);
  const [activeTab, setActiveTab] = useState<string>('all');

  const updateStatus = (id: string, newStatus: EvidenceConflict['status']) => {
    setConflicts(
      conflicts.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-[#EFB85A]" />
            Evidence Contradiction Radar
          </h1>
          <p className="text-xs text-[#A7B5C9] mt-1">
            Detect, categorize, and adjudicate conflicting statements between FDA labeling, guidelines, and clinical trials
          </p>
        </div>

        <span className="text-xs font-mono text-[#EFB85A] bg-[#EFB85A]/10 border border-[#EFB85A]/30 px-3 py-1 rounded-full font-semibold">
          {conflicts.length} Identified Controversies
        </span>
      </div>

      {/* Discrepancy Cards */}
      <div className="space-y-5">
        {conflicts.map((conflict) => (
          <div
            key={conflict.id}
            className="glass-panel p-6 rounded-xl border border-white/10 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <span className="text-base font-display font-bold text-white">
                  {conflict.drugPair[0]} ⟷ {conflict.drugPair[1]}
                </span>
                <span className="ml-3 text-[10px] font-mono text-[#EFB85A] bg-[#EFB85A]/10 px-2 py-0.5 rounded border border-[#EFB85A]/30">
                  {conflict.discrepancyType}
                </span>
              </div>

              {/* Status Selector */}
              <div className="flex items-center gap-1.5 bg-[#070B14] p-1 rounded-lg border border-white/10 text-xs">
                {(['Requires Context', 'Reviewed', 'Resolved', 'Inconclusive'] as const).map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => updateStatus(conflict.id, st)}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                        conflict.status === st
                          ? 'bg-[#37D6E6]/20 text-[#37D6E6] font-semibold'
                          : 'text-[#A7B5C9] hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Split Comparison Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#070B14]/80 border border-[#F16D76]/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#F16D76] font-mono">{conflict.sourceA.name}</span>
                  <span className="text-[10px] text-[#64748B] font-mono">{conflict.sourceA.date}</span>
                </div>
                <p className="text-xs text-[#F4F7FB] leading-relaxed italic">
                  "{conflict.sourceA.claim}"
                </p>
                <div className="text-[10px] font-mono text-[#F16D76]">
                  Classification: {conflict.sourceA.severity} Severity
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#070B14]/80 border border-[#32C8B7]/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#32C8B7] font-mono">{conflict.sourceB.name}</span>
                  <span className="text-[10px] text-[#64748B] font-mono">{conflict.sourceB.date}</span>
                </div>
                <p className="text-xs text-[#F4F7FB] leading-relaxed italic">
                  "{conflict.sourceB.claim}"
                </p>
                <div className="text-[10px] font-mono text-[#32C8B7]">
                  Classification: {conflict.sourceB.severity} Severity
                </div>
              </div>
            </div>

            {/* Analyst Context Synthesis */}
            {conflict.analystNotes && (
              <div className="p-4 rounded-xl bg-[#172134]/80 border border-white/5 space-y-1.5 text-xs">
                <div className="text-[11px] font-mono uppercase text-[#37D6E6] font-semibold flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> Clinical Pharmacologist Synthesis
                </div>
                <p className="text-[#A7B5C9] leading-relaxed">
                  {conflict.analystNotes}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
