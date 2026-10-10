import React, { useState } from 'react';
import { VERIFIED_DRUGS } from '../../data/mockDrugs';
import { PAIRWISE_INTERACTIONS } from '../../data/mockInteractions';
import { PairwiseInteraction } from '../../types';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  Download,
  ExternalLink,
  GitCompare,
  Info,
  ShieldAlert,
  Sparkles,
  X
} from 'lucide-react';

interface InteractionReviewProps {
  onNavigateTo3D: (pdbId: string) => void;
}

export const InteractionReview: React.FC<InteractionReviewProps> = ({ onNavigateTo3D }) => {
  // Default selected drugs for rich demonstration: Warfarin, Amiodarone, Clopidogrel, Omeprazole
  const [selectedDrugIds, setSelectedDrugIds] = useState<string[]>([
    'drug-warfarin',
    'drug-amiodarone'
  ]);

  const toggleDrug = (drugId: string) => {
    if (selectedDrugIds.includes(drugId)) {
      if (selectedDrugIds.length > 1) {
        setSelectedDrugIds(selectedDrugIds.filter((id) => id !== drugId));
      }
    } else {
      setSelectedDrugIds([...selectedDrugIds, drugId]);
    }
  };

  // Find all pairwise interactions among selected drugs
  const relevantInteractions = PAIRWISE_INTERACTIONS.filter(
    (interaction) =>
      selectedDrugIds.includes(interaction.drugAId) &&
      selectedDrugIds.includes(interaction.drugBId)
  );

  const selectedDrugs = VERIFIED_DRUGS.filter((d) => selectedDrugIds.includes(d.id));

  const exportInteractionJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(relevantInteractions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `DrugScope_Interactions_${Date.now()}.json`);
    downloadAnchor.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="glass-panel p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-[#37D6E6]" />
            Evidence-Based Drug Interaction Review
          </h1>
          <p className="text-xs text-[#A7B5C9] mt-1">
            Combinatorial multi-drug analysis with pharmacogenomic enzyme competition and target overlap
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportInteractionJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#172134] text-xs text-[#37D6E6] border border-[#37D6E6]/30 hover:bg-[#37D6E6]/10 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Multi-Drug Selector Strip */}
      <div className="glass-panel p-4 rounded-xl space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-[#64748B] uppercase">
            Select Active Prescription Regimen ({selectedDrugs.length} Selected)
          </span>
          <span className="text-[11px] text-[#A7B5C9]">
            Click any compound to add or remove from pairwise evaluation
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {VERIFIED_DRUGS.map((drug) => {
            const isSelected = selectedDrugIds.includes(drug.id);
            return (
              <button
                key={drug.id}
                onClick={() => toggleDrug(drug.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  isSelected
                    ? 'bg-[#37D6E6]/20 border-[#37D6E6] text-white shadow-sm'
                    : 'bg-[#070B14] border-white/10 text-[#A7B5C9] hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>{drug.genericName}</span>
                {isSelected ? (
                  <Check className="w-3 h-3 text-[#37D6E6]" />
                ) : (
                  <span className="text-white/20 text-[10px]">+</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interaction Results Overview */}
      {relevantInteractions.length === 0 ? (
        <div className="glass-panel p-10 rounded-xl text-center space-y-3">
          <Info className="w-10 h-10 text-[#32C8B7] mx-auto" />
          <h3 className="font-display font-bold text-white text-base">
            No Major Pharmacological Conflict Documented
          </h3>
          <p className="text-xs text-[#A7B5C9] max-w-md mx-auto">
            No severe CYP450 competition or receptor conflict identified among the currently selected medications in the active evidence registry. Try selecting <strong>Warfarin</strong> and <strong>Amiodarone</strong>, or <strong>Clopidogrel</strong> and <strong>Omeprazole</strong>.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-display font-bold text-white uppercase tracking-wider font-mono">
              Identified Pairwise Findings ({relevantInteractions.length})
            </h2>
          </div>

          <div className="space-y-4">
            {relevantInteractions.map((item) => (
              <div
                key={item.id}
                className="glass-panel p-6 rounded-xl border border-white/10 space-y-4"
              >
                {/* Header: Drug Pair & Severity Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-display font-bold text-white">
                      {item.drugAName}
                    </span>
                    <span className="text-sm text-[#37D6E6] font-mono">⟷</span>
                    <span className="text-lg font-display font-bold text-white">
                      {item.drugBName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono px-3 py-1 rounded font-bold uppercase ${
                        item.severity === 'Contraindicated'
                          ? 'bg-[#F16D76]/20 text-[#F16D76] border border-[#F16D76]/40'
                          : 'bg-[#EFB85A]/20 text-[#EFB85A] border border-[#EFB85A]/40'
                      }`}
                    >
                      {item.severity}
                    </span>
                    <span className="text-xs font-mono bg-white/5 text-[#32C8B7] border border-white/10 px-2.5 py-1 rounded">
                      {item.interactionType}
                    </span>
                  </div>
                </div>

                {/* Mechanism & Clinical Consequence */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-[#070B14]/80 border border-white/5 space-y-2">
                    <div className="text-xs font-mono uppercase text-[#37D6E6] font-semibold">
                      Biochemical Mechanism
                    </div>
                    <p className="text-xs text-[#A7B5C9] leading-relaxed">
                      {item.mechanism}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-[#070B14]/80 border border-white/5 space-y-2">
                    <div className="text-xs font-mono uppercase text-[#F16D76] font-semibold">
                      Adverse Clinical Consequence
                    </div>
                    <p className="text-xs text-[#F4F7FB] leading-relaxed">
                      {item.clinicalConsequence}
                    </p>
                  </div>
                </div>

                {/* Clinical Management Guidance */}
                <div className="p-4 rounded-lg bg-[#172134]/70 border border-[#32C8B7]/30 space-y-1.5">
                  <div className="text-xs font-mono uppercase text-[#32C8B7] font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Recommended Clinical Action & Monitoring
                  </div>
                  <p className="text-xs text-[#F4F7FB] leading-relaxed">
                    {item.managementGuidance}
                  </p>
                </div>

                {/* Provenance Citations */}
                <div className="border-t border-white/10 pt-3 space-y-2">
                  <div className="text-[11px] font-mono uppercase text-[#64748B]">
                    Documented Citations & Sources
                  </div>
                  <div className="space-y-1.5">
                    {item.primarySources.map((src, sIdx) => (
                      <div
                        key={sIdx}
                        className="flex items-center justify-between text-xs text-[#A7B5C9] bg-[#070B14]/40 p-2 rounded border border-white/5"
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-[#9079F7] shrink-0" />
                          <span className="text-white font-medium">{src.name}:</span>
                          <span className="italic text-[11px]">{src.citation}</span>
                        </div>
                        <span className="text-[10px] font-mono text-[#37D6E6] shrink-0 ml-2">
                          {src.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scientific Limitation Disclosure */}
      <div className="p-4 rounded-xl bg-[#070B14] border border-white/10 text-xs text-[#64748B] flex items-start gap-3">
        <Info className="w-4 h-4 text-[#37D6E6] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-[#A7B5C9]">Scientific Disclosure:</span> A shared receptor or metabolic enzyme does not automatically indicate an in vivo harmful drug conflict. Drug Scope AI displays only scientifically grounded pairwise relationships verified through official package inserts and clinical pharmacology literature.
        </div>
      </div>
    </div>
  );
};
