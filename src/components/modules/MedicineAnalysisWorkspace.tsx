import React, { useState } from 'react';
import { Drug } from '../../types';
import { VERIFIED_DRUGS } from '../../data/mockDrugs';
import { resolveRxNormIdentifier } from '../../services/rxnormApi';
import { runMedicineAnalysis } from '../../services/analysisEngine';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Database,
  Filter,
  Layers,
  Loader2,
  Pill,
  Plus,
  Search,
  Shield,
  Sparkles,
  Trash2,
  X,
  Zap
} from 'lucide-react';

interface MedicineAnalysisWorkspaceProps {
  onAnalysisComplete: (sessionId: string) => void;
  onNavigateToDrugDetail?: (drug: Drug) => void;
}

export const MedicineAnalysisWorkspace: React.FC<MedicineAnalysisWorkspaceProps> = ({
  onAnalysisComplete,
  onNavigateToDrugDetail
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDrugs, setSelectedDrugs] = useState<Drug[]>([
    VERIFIED_DRUGS[0], // Warfarin
    VERIFIED_DRUGS[1]  // Amiodarone
  ]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [showOptionalContext, setShowOptionalContext] = useState(false);

  // Clinical Context fields
  const [ageCategory, setAgeCategory] = useState('Adult (18-64)');
  const [renalFunction, setRenalFunction] = useState('Normal (eGFR > 90)');
  const [hepaticFunction, setHepaticFunction] = useState('Normal');

  // Search filtering
  const searchResults = searchQuery.trim()
    ? VERIFIED_DRUGS.filter((d) => {
        const q = searchQuery.toLowerCase();
        return (
          d.genericName.toLowerCase().includes(q) ||
          d.brandNames.some((b) => b.toLowerCase().includes(q)) ||
          d.drugClass.toLowerCase().includes(q) ||
          d.synonyms.some((s) => s.toLowerCase().includes(q))
        );
      })
    : [];

  const handleAddDrug = (drug: Drug) => {
    if (!selectedDrugs.find((d) => d.id === drug.id)) {
      setSelectedDrugs([...selectedDrugs, drug]);
    }
    setSearchQuery('');
  };

  const handleRemoveDrug = (drugId: string) => {
    setSelectedDrugs(selectedDrugs.filter((d) => d.id !== drugId));
  };

  const handleSelectPreset = (drugIds: string[]) => {
    const matched = VERIFIED_DRUGS.filter((d) => drugIds.includes(d.id));
    setSelectedDrugs(matched);
  };

  // Launch Analysis
  const handleLaunchAnalysis = async () => {
    if (selectedDrugs.length === 0) return;
    setIsAnalyzing(true);

    try {
      setAnalysisStep('Resolving standardized RxNorm RxCUIs & identifiers...');
      await new Promise((r) => setTimeout(r, 600));

      setAnalysisStep('Querying openFDA Structured Product Labels & Boxed Warnings...');
      await new Promise((r) => setTimeout(r, 700));

      setAnalysisStep('Calculating CYP450 enzyme competitive displacement kinetics...');
      await new Promise((r) => setTimeout(r, 600));

      setAnalysisStep('Synthesizing 3D Evidence Graph Topology & Citations...');
      const session = await runMedicineAnalysis(
        selectedDrugs,
        {
          ageCategory,
          renalFunction,
          hepaticFunction
        },
        'professional'
      );
      await new Promise((r) => setTimeout(r, 500));

      setIsAnalyzing(false);
      onAnalysisComplete(session.id);
    } catch (e) {
      console.error(e);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Hero Search Section */}
      <div className="bg-gradient-to-b from-[#0B1120] to-[#070B14] border border-white/[0.08] p-6 lg:p-10 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow backdrop accent */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#24D8ED]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#9475FF]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#24D8ED]/10 border border-[#24D8ED]/30 text-xs font-mono font-semibold text-[#24D8ED]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AUTONOMOUS MEDICINE ANALYSIS WORKSPACE</span>
          </div>
          <h1 className="text-2xl lg:text-4xl font-bold text-white tracking-tight">
            Explore the evidence behind your medicines
          </h1>
          <p className="text-sm text-[#A6B5CB] leading-relaxed">
            Search one or more medicines to investigate published FDA labeling, documented CYP450 enzyme conflicts, molecular target overlap, and supporting scientific literature.
          </p>
        </div>

        {/* Search Input Bar */}
        <div className="relative max-w-3xl mx-auto z-10">
          <div className="relative flex items-center bg-[#070B14] border border-white/15 focus-within:border-[#24D8ED] rounded-2xl shadow-xl transition-all">
            <Search className="w-5 h-5 text-[#71839E] ml-4 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search medicines by generic name, brand name, or active ingredient..."
              className="w-full bg-transparent px-4 py-3.5 text-sm text-white placeholder:text-[#71839E] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-2 text-[#71839E] hover:text-white mr-2"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Autocomplete Suggestions Popover */}
          {searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#0B1120] border border-white/10 rounded-2xl shadow-2xl p-2 z-30 max-h-80 overflow-y-auto">
              {searchResults.length > 0 ? (
                searchResults.map((drug) => {
                  const isSelected = selectedDrugs.some((d) => d.id === drug.id);
                  return (
                    <button
                      key={drug.id}
                      onClick={() => handleAddDrug(drug)}
                      disabled={isSelected}
                      className={`w-full p-3 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'opacity-50 cursor-not-allowed bg-white/[0.02]'
                          : 'hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#24D8ED]/10 border border-[#24D8ED]/30 flex items-center justify-center text-[#24D8ED] font-bold text-xs">
                          <Pill className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white flex items-center gap-2">
                            <span>{drug.genericName}</span>
                            <span className="text-[10px] font-mono text-[#71839E]">
                              RxCUI: {drug.rxNormCui}
                            </span>
                          </div>
                          <div className="text-xs text-[#A6B5CB] flex items-center gap-2 mt-0.5">
                            <span>Brands: {drug.brandNames.join(', ')}</span>
                            <span>•</span>
                            <span className="text-[#31CAB6]">{drug.drugClass}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isSelected ? (
                          <span className="text-xs text-[#31CAB6] font-medium flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Added
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-lg bg-[#24D8ED]/15 text-[#24D8ED] text-xs font-semibold hover:bg-[#24D8ED] hover:text-[#070B14] transition-colors">
                            + Select
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-[#71839E]">
                  No matching compound in local registry. You can still analyze via live RxNav lookup.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected Medicine Chips */}
        <div className="max-w-3xl mx-auto space-y-2 z-10 relative">
          <div className="flex items-center justify-between text-xs font-mono uppercase text-[#71839E]">
            <span>Selected Active Regimen ({selectedDrugs.length})</span>
            {selectedDrugs.length > 0 && (
              <button
                onClick={() => setSelectedDrugs([])}
                className="text-[#F16D7B] hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2.5">
            {selectedDrugs.map((drug) => (
              <div
                key={drug.id}
                className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-[#152238] border border-[#24D8ED]/30 text-white shadow-md group"
              >
                <div className="w-2 h-2 rounded-full bg-[#24D8ED]" />
                <div>
                  <div className="text-xs font-bold leading-tight">{drug.genericName}</div>
                  <div className="text-[10px] text-[#A6B5CB] font-mono leading-tight">
                    {drug.brandNames[0]} • {drug.drugClass.split(' ')[0]}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveDrug(drug.id)}
                  className="p-1 rounded-lg text-[#71839E] hover:text-white hover:bg-white/10 transition-colors"
                  title="Remove"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {selectedDrugs.length === 0 && (
              <div className="p-4 w-full rounded-xl bg-[#070B14]/60 border border-dashed border-white/15 text-center text-xs text-[#71839E]">
                Select at least one medicine above or choose a curated clinical regimen below to begin.
              </div>
            )}
          </div>
        </div>

        {/* Quick Presets Strip */}
        <div className="max-w-3xl mx-auto flex flex-wrap items-center gap-2 pt-2 z-10 relative">
          <span className="text-[11px] text-[#71839E] font-mono mr-1">Evidence Presets:</span>
          {[
            { label: 'Warfarin + Amiodarone (CYP2C9)', ids: ['drug-warfarin', 'drug-amiodarone'] },
            { label: 'Paxlovid + Simvastatin (CYP3A4)', ids: ['drug-paxlovid', 'drug-simvastatin'] },
            { label: 'Clopidogrel + Omeprazole (CYP2C19)', ids: ['drug-clopidogrel', 'drug-omeprazole'] },
            { label: 'Metoprolol + Fluoxetine (CYP2D6)', ids: ['drug-metoprolol', 'drug-fluoxetine'] }
          ].map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPreset(preset.ids)}
              className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-[11px] text-[#A6B5CB] hover:text-white transition-colors cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Optional Clinical Context Accordion */}
        <div className="max-w-3xl mx-auto border-t border-white/[0.08] pt-4 z-10 relative">
          <button
            onClick={() => setShowOptionalContext(!showOptionalContext)}
            className="flex items-center justify-between w-full text-xs font-semibold text-[#A6B5CB] hover:text-white cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#24D8ED]" />
              <span>Optional Research Context (Age, Organ Function)</span>
            </div>
            {showOptionalContext ? (
              <ChevronUp className="w-4 h-4 text-[#71839E]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#71839E]" />
            )}
          </button>

          {showOptionalContext && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 p-4 rounded-xl bg-[#070B14] border border-white/[0.06]">
              <div>
                <label className="text-[10px] font-mono text-[#71839E] uppercase">Patient Age Category</label>
                <select
                  value={ageCategory}
                  onChange={(e) => setAgeCategory(e.target.value)}
                  className="w-full mt-1 bg-[#0B1120] border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none"
                >
                  <option>Pediatric (&lt;18)</option>
                  <option>Adult (18-64)</option>
                  <option>Geriatric (65+)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-mono text-[#71839E] uppercase">Renal Function Status</label>
                <select
                  value={renalFunction}
                  onChange={(e) => setRenalFunction(e.target.value)}
                  className="w-full mt-1 bg-[#0B1120] border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none"
                >
                  <option>Normal (eGFR &gt; 90)</option>
                  <option>Mild Impairment (60-89)</option>
                  <option>Moderate Impairment (30-59)</option>
                  <option>Severe Impairment (&lt;30)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-mono text-[#71839E] uppercase">Hepatic Function Status</label>
                <select
                  value={hepaticFunction}
                  onChange={(e) => setHepaticFunction(e.target.value)}
                  className="w-full mt-1 bg-[#0B1120] border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none"
                >
                  <option>Normal</option>
                  <option>Mild Impairment (Child-Pugh A)</option>
                  <option>Moderate Impairment (Child-Pugh B)</option>
                  <option>Severe Impairment (Child-Pugh C)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Primary Launch Action CTA */}
        <div className="max-w-3xl mx-auto pt-2 z-10 relative">
          <button
            onClick={handleLaunchAnalysis}
            disabled={selectedDrugs.length === 0 || isAnalyzing}
            className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 shadow-2xl transition-all cursor-pointer ${
              selectedDrugs.length > 0 && !isAnalyzing
                ? 'bg-gradient-to-r from-[#24D8ED] via-[#31CAB6] to-[#9475FF] text-[#070B14] hover:opacity-95 shadow-[0_0_30px_rgba(36,216,237,0.3)]'
                : 'bg-white/5 text-[#71839E] cursor-not-allowed border border-white/5'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{analysisStep || 'Analyzing Biomedical Records...'}</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 fill-current" />
                <span>
                  Analyze Scientific Evidence ({selectedDrugs.length}{' '}
                  {selectedDrugs.length === 1 ? 'Medicine' : 'Medicines'})
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
