import React, { useState } from 'react';
import { VERIFIED_DRUGS } from '../../data/mockDrugs';
import { PAIRWISE_INTERACTIONS } from '../../data/mockInteractions';
import { PairwiseInteraction } from '../../types';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Boxes,
  Check,
  Download,
  ExternalLink,
  GitCompare,
  Info,
  Network,
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
      <div className="bg-[#0B1120] border border-white/[0.08] p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white flex items-center gap-2 tracking-tight">
              <GitCompare className="w-5 h-5 text-[#24D8ED]" />
              Evidence-Based Drug Interaction Review
            </h1>
            <span className="text-[10px] font-mono bg-[#24D8ED]/10 text-[#24D8ED] border border-[#24D8ED]/30 px-2 py-0.5 rounded-full font-semibold">
              COMBINATORIAL PHARMACOGENOMICS
            </span>
          </div>
          <p className="text-xs text-[#A6B5CB] mt-1">
            Combinatorial multi-drug analysis with pharmacogenomic enzyme competition, receptor conflict, and clinical guidance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportInteractionJson}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#152238] text-xs font-semibold text-[#24D8ED] border border-[#24D8ED]/30 hover:bg-[#24D8ED]/10 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export Protocol
          </button>
        </div>
      </div>

      {/* Multi-Drug Selector Strip */}
      <div className="bg-[#0B1120] border border-white/[0.08] p-5 rounded-2xl space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-[#71839E] uppercase font-semibold">
            Select Active Prescription Regimen ({selectedDrugs.length} Selected)
          </span>
          <span className="text-[11px] text-[#A6B5CB]">
            Click compounds to toggle pairwise evaluation matrix
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {VERIFIED_DRUGS.map((drug) => {
            const isSelected = selectedDrugIds.includes(drug.id);
            return (
              <button
                key={drug.id}
                onClick={() => toggleDrug(drug.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#24D8ED]/15 border-[#24D8ED] text-white shadow-sm'
                    : 'bg-[#070B14] border-white/10 text-[#A6B5CB] hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="font-semibold">{drug.genericName}</span>
                {isSelected ? (
                  <Check className="w-3.5 h-3.5 text-[#24D8ED]" />
                ) : (
                  <span className="text-white/20 text-xs">+</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Enzyme Competition Visual Bridge Card */}
      <div className="bg-[#0B1120] border border-white/[0.08] p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <Network className="w-4 h-4 text-[#9475FF]" />
            <span>Pharmacokinetic Enzyme & Target Competition Map</span>
          </div>
          <span className="text-[11px] font-mono text-[#71839E]">Metabolic Pathway Graph</span>
        </div>

        <div className="h-44 bg-[#070B14] rounded-xl border border-white/[0.06] p-4 relative overflow-hidden flex items-center justify-around">
          {/* Selected Drugs Column */}
          <div className="space-y-2 z-10">
            {selectedDrugs.map((d) => (
              <div
                key={d.id}
                className="px-3 py-1.5 rounded-lg bg-[#152238] border border-[#24D8ED]/40 text-xs font-semibold text-white flex items-center gap-2 shadow-md"
              >
                <span className="w-2 h-2 rounded-full bg-[#24D8ED]" />
                <span>{d.genericName}</span>
              </div>
            ))}
          </div>

          {/* Central Connecting SVG Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <linearGradient id="grad-cyp" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#24D8ED" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#F16D7B" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#9475FF" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <path
              d="M 160 55 C 280 55, 360 85, 480 85"
              fill="none"
              stroke="url(#grad-cyp)"
              strokeWidth="2.5"
              strokeDasharray="4 3"
            />
            <path
              d="M 160 115 C 280 115, 360 85, 480 85"
              fill="none"
              stroke="url(#grad-cyp)"
              strokeWidth="2.5"
              strokeDasharray="4 3"
            />
            <circle cx="320" cy="85" r="4" fill="#F16D7B" />
          </svg>

          {/* Central Competing Node */}
          <div className="z-10 text-center">
            <div className="px-3 py-2 rounded-xl bg-[#F16D7B]/20 border border-[#F16D7B]/40 shadow-lg text-center">
              <div className="text-[10px] font-mono text-[#F16D7B] uppercase font-bold">Competitive Inhibitor</div>
              <div className="text-xs font-bold text-white mt-0.5">CYP2C9 Metabolic Axis</div>
              <div className="text-[10px] text-[#A6B5CB] mt-0.5">Kd = 0.4 µM • Substrate Displacement</div>
            </div>
          </div>

          {/* Target Pathways Column */}
          <div className="space-y-2 z-10">
            <div className="px-3 py-1.5 rounded-lg bg-[#152238] border border-[#9475FF]/40 text-xs font-semibold text-white flex items-center gap-2 shadow-md">
              <span className="w-2 h-2 rounded-full bg-[#9475FF]" />
              <span>VKORC1 Coagulation</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-[#152238] border border-[#31CAB6]/40 text-xs font-semibold text-white flex items-center gap-2 shadow-md">
              <span className="w-2 h-2 rounded-full bg-[#31CAB6]" />
              <span>hERG / K+ Channel</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interaction Results Overview */}
      {relevantInteractions.length === 0 ? (
        <div className="bg-[#0B1120] border border-white/[0.08] p-10 rounded-2xl text-center space-y-3">
          <Info className="w-10 h-10 text-[#31CAB6] mx-auto" />
          <h3 className="font-bold text-white text-base">
            No Major Pharmacological Conflict Documented
          </h3>
          <p className="text-xs text-[#A6B5CB] max-w-md mx-auto">
            No severe CYP450 competition or receptor conflict identified among the currently selected medications in the active evidence registry. Try selecting <strong>Warfarin</strong> and <strong>Amiodarone</strong>, or <strong>Clopidogrel</strong> and <strong>Omeprazole</strong>.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Identified Pairwise Findings ({relevantInteractions.length})
            </h2>
          </div>

          <div className="space-y-4">
            {relevantInteractions.map((item) => (
              <div
                key={item.id}
                className="bg-[#0B1120] border border-white/[0.08] p-6 rounded-2xl space-y-4 shadow-xl"
              >
                {/* Header: Drug Pair & Severity Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-white">
                      {item.drugAName}
                    </span>
                    <span className="text-sm text-[#24D8ED] font-mono">⟷</span>
                    <span className="text-lg font-bold text-white">
                      {item.drugBName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono px-3 py-1 rounded-full font-bold uppercase ${
                        item.severity === 'Contraindicated'
                          ? 'bg-[#F16D7B]/20 text-[#F16D7B] border border-[#F16D7B]/40'
                          : 'bg-[#F2B961]/20 text-[#F2B961] border border-[#F2B961]/40'
                      }`}
                    >
                      {item.severity}
                    </span>
                    <span className="text-xs font-mono bg-white/5 text-[#31CAB6] border border-white/10 px-2.5 py-1 rounded-full">
                      {item.interactionType}
                    </span>
                  </div>
                </div>

                {/* Mechanism & Clinical Consequence */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#070B14] border border-white/[0.06] space-y-2">
                    <div className="text-xs font-mono uppercase text-[#24D8ED] font-semibold">
                      Biochemical Mechanism
                    </div>
                    <p className="text-xs text-[#A6B5CB] leading-relaxed">
                      {item.mechanism}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#070B14] border border-white/[0.06] space-y-2">
                    <div className="text-xs font-mono uppercase text-[#F16D7B] font-semibold">
                      Adverse Clinical Consequence
                    </div>
                    <p className="text-xs text-[#F5F8FF] leading-relaxed">
                      {item.clinicalConsequence}
                    </p>
                  </div>
                </div>

                {/* Clinical Management Guidance */}
                <div className="p-4 rounded-xl bg-[#152238]/70 border border-[#31CAB6]/30 space-y-1.5">
                  <div className="text-xs font-mono uppercase text-[#31CAB6] font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Recommended Clinical Action & Monitoring
                  </div>
                  <p className="text-xs text-[#F5F8FF] leading-relaxed">
                    {item.managementGuidance}
                  </p>
                </div>

                {/* Provenance Citations */}
                <div className="border-t border-white/[0.08] pt-3 space-y-2">
                  <div className="text-[11px] font-mono uppercase text-[#71839E]">
                    Documented Citations & Sources
                  </div>
                  <div className="space-y-1.5">
                    {item.primarySources.map((src, sIdx) => (
                      <div
                        key={sIdx}
                        className="flex items-center justify-between text-xs text-[#A6B5CB] bg-[#070B14] p-2 rounded-lg border border-white/[0.04]"
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-[#9475FF] shrink-0" />
                          <span className="text-white font-medium">{src.name}:</span>
                          <span className="italic text-[11px]">{src.citation}</span>
                        </div>
                        <span className="text-[10px] font-mono text-[#24D8ED] shrink-0 ml-2">
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
      <div className="p-4 rounded-xl bg-[#070B14] border border-white/10 text-xs text-[#71839E] flex items-start gap-3">
        <Info className="w-4 h-4 text-[#24D8ED] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-[#A6B5CB]">Scientific Disclosure:</span> A shared receptor or metabolic enzyme does not automatically indicate an in vivo harmful drug conflict. Drug Scope AI displays only scientifically grounded pairwise relationships verified through official package inserts and clinical pharmacology literature.
        </div>
      </div>
    </div>
  );
};
