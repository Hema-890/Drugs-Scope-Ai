import React, { useMemo, useState } from 'react';
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
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
  Filter,
  GitCompare,
  Info,
  Network,
  Plus,
  Search,
  ShieldAlert,
  Sparkles,
  X
} from 'lucide-react';

interface InteractionReviewProps {
  onNavigateTo3D: (pdbId: string) => void;
}

export const InteractionReview: React.FC<InteractionReviewProps> = ({ onNavigateTo3D }) => {
  // Default selected drugs: Warfarin and Amiodarone
  const [selectedDrugIds, setSelectedDrugIds] = useState<string[]>([
    'drug-warfarin',
    'drug-amiodarone'
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'Contraindicated' | 'Major'>('ALL');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(PAIRWISE_INTERACTIONS[0]?.id || null);
  const [activeViewMode, setActiveViewMode] = useState<'detailed' | 'executive'>('detailed');

  const toggleDrug = (drugId: string) => {
    if (selectedDrugIds.includes(drugId)) {
      if (selectedDrugIds.length > 1) {
        setSelectedDrugIds(selectedDrugIds.filter((id) => id !== drugId));
      }
    } else {
      setSelectedDrugIds([...selectedDrugIds, drugId]);
    }
  };

  const removeDrug = (drugId: string) => {
    if (selectedDrugIds.length > 1) {
      setSelectedDrugIds(selectedDrugIds.filter((id) => id !== drugId));
    }
  };

  // Filter available compounds by search query
  const filteredAvailableDrugs = useMemo(() => {
    if (!searchQuery.trim()) return VERIFIED_DRUGS;
    const q = searchQuery.toLowerCase();
    return VERIFIED_DRUGS.filter(
      (d) =>
        d.genericName.toLowerCase().includes(q) ||
        d.brandNames.some((b) => b.toLowerCase().includes(q)) ||
        d.drugClass?.toLowerCase().includes(q) ||
        d.mechanismSummary?.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Find all pairwise interactions among selected drugs
  const relevantInteractions = useMemo(() => {
    return PAIRWISE_INTERACTIONS.filter((interaction) => {
      const isSelectedPair =
        selectedDrugIds.includes(interaction.drugAId) &&
        selectedDrugIds.includes(interaction.drugBId);
      if (!isSelectedPair) return false;
      if (severityFilter === 'ALL') return true;
      return interaction.severity === severityFilter;
    });
  }, [selectedDrugIds, severityFilter]);

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
    <div className="space-y-6 pb-20 select-none">
      {/* 1. TOP HEADER & WORKFLOW CONTEXT */}
      <div className="bg-[#0B1120] border border-white/[0.08] p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-display font-extrabold text-white flex items-center gap-2.5 tracking-tight">
              <GitCompare className="w-5 h-5 text-[#24D8ED]" />
              Evidence-Based Drug Interaction Review
            </h1>
            <span className="text-[10px] font-mono bg-[#24D8ED]/10 text-[#24D8ED] border border-[#24D8ED]/30 px-2 py-0.5 rounded-full font-semibold">
              v7.0 Verified
            </span>
          </div>
          <p className="text-xs text-[#A6B5CB] mt-1 max-w-2xl">
            Examine documented pairwise interactions, competitive CYP450 enzyme displacement, and target receptor conflicts grounded in FDA package inserts and NCBI literature.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl bg-[#070B14] p-1 border border-white/10 text-xs">
            <button
              onClick={() => setActiveViewMode('detailed')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeViewMode === 'detailed'
                  ? 'bg-[#152238] text-[#24D8ED] font-semibold'
                  : 'text-[#71839E] hover:text-white'
              }`}
            >
              Detailed Evidence
            </button>
            <button
              onClick={() => setActiveViewMode('executive')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeViewMode === 'executive'
                  ? 'bg-[#152238] text-[#24D8ED] font-semibold'
                  : 'text-[#71839E] hover:text-white'
              }`}
            >
              Executive Summary
            </button>
          </div>

          <button
            onClick={exportInteractionJson}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#152238] text-xs font-semibold text-[#24D8ED] border border-[#24D8ED]/30 hover:bg-[#24D8ED]/10 transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Protocol</span>
          </button>
        </div>
      </div>

      {/* 2. SEARCH-INTEGRATED COMPOUND CHOOSER (Section 9 Requirement) */}
      <div className="bg-[#0B1120] border border-white/[0.08] p-5 rounded-2xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">
              Active Prescribed Medicines ({selectedDrugs.length})
            </span>
            <div className="text-[11px] text-[#71839E]">
              Add or remove medications to inspect combinatorial pharmacology
            </div>
          </div>

          {/* Quick Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#71839E]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter or search compounds..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#070B14] border border-white/10 text-white placeholder-[#71839E] text-xs focus:outline-none focus:border-[#24D8ED]"
            />
          </div>
        </div>

        {/* Selected Drugs Active Chips */}
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-[#070B14]/80 border border-white/5">
          <span className="text-[10px] font-mono text-[#71839E] uppercase mr-1">Regimen:</span>
          {selectedDrugs.map((drug) => (
            <div
              key={drug.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#152238] border border-[#24D8ED]/40 text-xs font-semibold text-white shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-[#24D8ED]" />
              <span>{drug.genericName}</span>
              <button
                onClick={() => removeDrug(drug.id)}
                className="hover:text-rose-400 cursor-pointer ml-1 text-[#71839E]"
                title="Remove compound"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Available Drugs Catalog Pills */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono uppercase text-[#71839E]">
            Available Compounds in Clinical Registry:
          </div>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
            {filteredAvailableDrugs.map((drug) => {
              const isSelected = selectedDrugIds.includes(drug.id);
              return (
                <button
                  key={drug.id}
                  onClick={() => toggleDrug(drug.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#24D8ED]/20 border-[#24D8ED] text-[#24D8ED] font-semibold'
                      : 'bg-[#070B14] border-white/10 text-[#A6B5CB] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>{drug.genericName}</span>
                  {isSelected ? (
                    <Check className="w-3 h-3 text-[#24D8ED]" />
                  ) : (
                    <Plus className="w-3 h-3 text-white/30" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE PHARMACOKINETIC PATHWAY BRIDGE (Animated SVG edges) */}
      <div className="bg-[#0B1120] border border-white/[0.08] p-5 rounded-2xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <Network className="w-4 h-4 text-[#9475FF]" />
            <span>Pharmacokinetic Enzyme & Metabolic Bottleneck Graph</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-[#71839E]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#24D8ED]" /> Drug</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#F16D7B]" /> Competing Axis</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#9475FF]" /> Target Pathway</span>
          </div>
        </div>

        <div className="h-44 bg-[#070B14] rounded-xl border border-white/[0.06] p-4 relative overflow-hidden flex items-center justify-between px-8">
          {/* Left Column: Selected Drugs */}
          <div className="space-y-2.5 z-10">
            {selectedDrugs.map((d) => (
              <div
                key={d.id}
                className="px-3.5 py-1.5 rounded-xl bg-[#152238] border border-[#24D8ED]/50 text-xs font-bold text-white flex items-center gap-2 shadow-lg"
              >
                <span className="w-2 h-2 rounded-full bg-[#24D8ED] animate-pulse" />
                <span>{d.genericName}</span>
              </div>
            ))}
          </div>

          {/* Central Pulsing SVG Paths */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <linearGradient id="bridge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#24D8ED" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#F16D7B" stopOpacity="1" />
                <stop offset="100%" stopColor="#9475FF" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Dynamic Bezier Connections */}
            <path
              d="M 180 50 C 300 50, 420 88, 540 88"
              fill="none"
              stroke="url(#bridge-grad)"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              className="animate-pulse"
            />
            <path
              d="M 180 120 C 300 120, 420 88, 540 88"
              fill="none"
              stroke="url(#bridge-grad)"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              className="animate-pulse"
            />
          </svg>

          {/* Center Column: The Enzymatic Bottleneck */}
          <div className="z-10 text-center">
            <div className="px-4 py-2.5 rounded-2xl bg-[#F16D7B]/20 border border-[#F16D7B]/50 shadow-[0_0_20px_rgba(241,109,123,0.2)] text-center">
              <div className="text-[10px] font-mono text-[#F16D7B] uppercase font-bold tracking-wider">
                Competitive Enzymatic Locus
              </div>
              <div className="text-xs font-bold text-white mt-0.5">CYP450 / 2C9 & 3A4 Axis</div>
              <div className="text-[10px] font-mono text-[#A6B5CB] mt-0.5">Substrate Displacement • Bleeding Risk</div>
            </div>
          </div>

          {/* Right Column: Receptors / Biological Targets */}
          <div className="space-y-2.5 z-10">
            <div className="px-3.5 py-1.5 rounded-xl bg-[#152238] border border-[#9475FF]/50 text-xs font-semibold text-white flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-[#9475FF]" />
              <span>VKORC1 Complex</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-[#152238] border border-[#31CAB6]/50 text-xs font-semibold text-white flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-[#31CAB6]" />
              <span>hERG / Cardiac Channels</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. SEVERITY FILTER & FINDINGS COUNT */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-display font-bold text-white">
            Identified Pairwise Findings ({relevantInteractions.length})
          </h2>
          <span className="text-xs text-[#71839E]">Based on active regimen</span>
        </div>

        {/* Severity Filter Controls */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#71839E]" />
          <div className="flex items-center rounded-lg bg-[#0B1120] p-1 border border-white/10 text-xs">
            <button
              onClick={() => setSeverityFilter('ALL')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                severityFilter === 'ALL' ? 'bg-[#152238] text-white font-bold' : 'text-[#71839E] hover:text-white'
              }`}
            >
              All ({relevantInteractions.length})
            </button>
            <button
              onClick={() => setSeverityFilter('Contraindicated')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                severityFilter === 'Contraindicated'
                  ? 'bg-rose-500/20 text-rose-300 font-bold'
                  : 'text-[#71839E] hover:text-rose-400'
              }`}
            >
              Contraindicated
            </button>
            <button
              onClick={() => setSeverityFilter('Major')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                severityFilter === 'Major'
                  ? 'bg-amber-500/20 text-amber-300 font-bold'
                  : 'text-[#71839E] hover:text-amber-400'
              }`}
            >
              Major
            </button>
          </div>
        </div>
      </div>

      {/* 5. INTERACTION FINDINGS (TWO-LEVEL PROGRESSIVE DISCLOSURE) */}
      {relevantInteractions.length === 0 ? (
        <div className="bg-[#0B1120] border border-white/[0.08] p-12 rounded-2xl text-center space-y-3">
          <Info className="w-10 h-10 text-[#31CAB6] mx-auto" />
          <h3 className="font-bold text-white text-base">
            No Major Adverse Conflict Documented
          </h3>
          <p className="text-xs text-[#A6B5CB] max-w-md mx-auto">
            No severe CYP450 competition or receptor conflict identified among the selected medications. Try selecting <strong>Warfarin + Amiodarone</strong>, or <strong>Clopidogrel + Omeprazole</strong> to view validated clinical findings.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {relevantInteractions.map((item) => {
            const isExpanded = expandedCardId === item.id;

            return (
              <div
                key={item.id}
                className="bg-[#0B1120] border border-white/[0.08] rounded-2xl shadow-xl overflow-hidden transition-all"
              >
                {/* LEVEL 1: TOP EXECUTIVE SUMMARY BAR */}
                <div
                  onClick={() => setExpandedCardId(isExpanded ? null : item.id)}
                  className="p-5 cursor-pointer hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold text-white">
                        {item.drugAName}
                      </span>
                      <span className="text-xs text-[#24D8ED] font-mono">⟷</span>
                      <span className="text-base font-bold text-white">
                        {item.drugBName}
                      </span>

                      <span
                        className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          item.severity === 'Contraindicated'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {item.severity}
                      </span>
                    </div>

                    <p className="text-xs text-[#A6B5CB] line-clamp-1">
                      {item.mechanism}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateTo3D(item.id.includes('warfarin') ? '1OG5' : '6WVR');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#111C2E] border border-white/10 hover:border-[#24D8ED]/40 text-xs font-semibold text-[#24D8ED] flex items-center gap-1.5 cursor-pointer"
                    >
                      <Boxes className="w-3.5 h-3.5" />
                      <span>3D Crystal</span>
                    </button>

                    <div className="text-xs font-mono text-[#71839E] flex items-center gap-1">
                      <span>{isExpanded ? 'Less' : 'Details'}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* LEVEL 2: DETAILED EVIDENCE ACCORDION */}
                {isExpanded && (
                  <div className="p-6 pt-0 border-t border-white/[0.06] space-y-4 bg-[#070C16]/50 animate-fadeIn">
                    {/* Mechanism & Consequence Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      <div className="p-4 rounded-xl bg-[#09101C] border border-white/5 space-y-1.5">
                        <div className="text-[11px] font-mono uppercase text-[#24D8ED] font-bold">
                          Biochemical Mechanism & Enzyme Target
                        </div>
                        <p className="text-xs text-[#A6B5CB] leading-relaxed">
                          {item.mechanism}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-[#09101C] border border-white/5 space-y-1.5">
                        <div className="text-[11px] font-mono uppercase text-rose-400 font-bold">
                          Adverse Clinical Consequence
                        </div>
                        <p className="text-xs text-[#F5F8FF] leading-relaxed">
                          {item.clinicalConsequence}
                        </p>
                      </div>
                    </div>

                    {/* Clinical Guidance */}
                    <div className="p-4 rounded-xl bg-[#111C2E]/80 border border-[#31CAB6]/30 space-y-1.5">
                      <div className="text-[11px] font-mono uppercase text-[#31CAB6] font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Recommended Clinical Mitigation & Patient Monitoring</span>
                      </div>
                      <p className="text-xs text-[#F5F8FF] leading-relaxed">
                        {item.managementGuidance}
                      </p>
                    </div>

                    {/* Original Source Citations */}
                    <div className="space-y-2 pt-2">
                      <div className="text-[10px] font-mono uppercase text-[#71839E] font-bold">
                        Authoritative Citations & Package Inserts:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {item.primarySources.map((src, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-2.5 rounded-lg bg-[#070B14] border border-white/5 flex items-start justify-between text-xs"
                          >
                            <div className="space-y-0.5">
                              <span className="font-semibold text-white">{src.name}</span>
                              <div className="italic text-[11px] text-[#A6B5CB]">{src.citation}</div>
                            </div>
                            <span className="text-[9px] font-mono text-[#24D8ED] bg-[#24D8ED]/10 px-1.5 py-0.5 rounded border border-[#24D8ED]/20 shrink-0 ml-2">
                              {src.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 6. SCIENTIFIC LIMITATION DISCLOSURE */}
      <div className="p-4 rounded-xl bg-[#070B14] border border-white/10 text-xs text-[#71839E] flex items-start gap-3">
        <Info className="w-4 h-4 text-[#24D8ED] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-[#A6B5CB]">Scientific Disclosure:</span> Shared in vitro enzymatic affinity or target homology does not guarantee in vivo adverse events in every patient cohort. Drug Scope AI reflects consensus pharmacological classifications corroborated by peer-reviewed evidence and official FDA product warnings.
        </div>
      </div>
    </div>
  );
};
