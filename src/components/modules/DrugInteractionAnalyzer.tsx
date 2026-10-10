import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FastForward,
  FileText,
  Globe,
  HelpCircle,
  Info,
  Layers,
  Pause,
  Pill,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
  X,
  Zap
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  autocompleteMedications,
  MedicationSuggestion,
  ResolvedMedicationIdentity
} from '../../services/rxnormApi';
import {
  runUniversalMedicineAnalysis,
  UniversalAnalysisOutput,
  SingleDrugClinicalDossier,
  MultiDrugRegimenAnalysisResult
} from '../../services/universalMedicineEngine';
import { InteractionSeverity } from '../../services/interactionDiscoveryEngine';
import {
  audioVoiceEngine,
  AudioPlaybackState
} from '../../services/audioVoiceEngine';
import {
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
  translateMedicalText,
  formatMultilingualDrugName,
  MEDICAL_GLOSSARY
} from '../../services/medicalTranslationEngine';
import { jsPDF } from 'jspdf';
import { EvidenceMolecularPanel } from './EvidenceMolecularPanel';
import { deriveMolecularPayload } from '../../services/molecularContextEngine';
import { ReportAudioPlayer, AudioReportSection } from '../audio/ReportAudioPlayer';
import { speechEngine } from '../../services/speech/SpeechEngine';

interface DrugInteractionAnalyzerProps {
  onNavigateTo3D?: (pdbId: string) => void;
}

interface MedicineInputItem {
  id: string;
  name: string;
}

const PRESET_QUERIES = [
  { label: 'Warfarin + Aspirin', drugs: ['Warfarin', 'Aspirin'], tag: 'Major Hemorrhage' },
  { label: 'Paracetamol (Single)', drugs: ['Paracetamol'], tag: 'Single Monograph' },
  { label: 'Metformin (Single)', drugs: ['Metformin'], tag: 'Single Monograph' },
  { label: 'Warfarin + Amiodarone', drugs: ['Warfarin', 'Amiodarone'], tag: 'CYP2C9 Blockade' },
  { label: 'Clopidogrel + Omeprazole', drugs: ['Clopidogrel', 'Omeprazole'], tag: 'CYP2C19 Bioactivation' },
  { label: '3-Drug Regimen (Warfarin + Aspirin + Omeprazole)', drugs: ['Warfarin', 'Aspirin', 'Omeprazole'], tag: 'Triple Regimen' },
  { label: 'Paxlovid + Simvastatin', drugs: ['Paxlovid', 'Simvastatin'], tag: 'Contraindicated' }
];

export const DrugInteractionAnalyzer: React.FC<DrugInteractionAnalyzerProps> = ({ onNavigateTo3D }) => {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language?.slice(0, 2) as SupportedLanguage) || 'en';

  // Dynamic list of medicine inputs (Supports 1, 2, 3+ medicines)
  const [medicines, setMedicines] = useState<MedicineInputItem[]>([
    { id: '1', name: 'Warfarin' },
    { id: '2', name: 'Aspirin' }
  ]);

  // Autocomplete suggestions per input ID
  const [suggestionsMap, setSuggestionsMap] = useState<Record<string, MedicationSuggestion[]>>({});
  const [activeSuggestionId, setActiveSuggestionId] = useState<string | null>(null);

  // Analysis pipeline states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [analysisOutput, setAnalysisOutput] = useState<UniversalAnalysisOutput | null>(null);

  // Multilingual display toggle: show translated vs original English evidence
  const [showOriginalEnglish, setShowOriginalEnglish] = useState(false);

  // Selected section for audio narration
  const [selectedAudioSection, setSelectedAudioSection] = useState<AudioReportSection>('all');

  // Derive real 3D molecular payload matching current report context
  const currentDrugNames = useMemo(() => {
    if (analysisOutput?.mode === 'SINGLE_DRUG') {
      return [analysisOutput.dossier.medicine.genericName || medicines[0]?.name || 'Paracetamol'];
    }
    if (analysisOutput?.mode === 'MULTI_DRUG') {
      return analysisOutput.regimen.medicines.map((m) => m.genericName || m.inputQuery);
    }
    return medicines.map((m) => m.name).filter(Boolean);
  }, [analysisOutput, medicines]);

  const molecularPayload = useMemo(() => {
    return deriveMolecularPayload(currentDrugNames.length > 0 ? currentDrugNames : ['Warfarin', 'Aspirin']);
  }, [currentDrugNames]);

  const containerRef = useRef<HTMLDivElement>(null);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      audioVoiceEngine.stop();
    };
  }, []);

  // Update suggestions on medicine input changes
  const handleInputChange = (id: string, value: string) => {
    setMedicines((prev) => prev.map((m) => (m.id === id ? { ...m, name: value } : m)));
    if (value.trim().length >= 2) {
      autocompleteMedications(value).then((suggs) => {
        setSuggestionsMap((prev) => ({ ...prev, [id]: suggs }));
      });
      setActiveSuggestionId(id);
    } else {
      setSuggestionsMap((prev) => ({ ...prev, [id]: [] }));
    }
  };

  const handleAddMedicine = () => {
    const newId = (Date.now() + Math.random()).toString();
    setMedicines((prev) => [...prev, { id: newId, name: '' }]);
  };

  const handleRemoveMedicine = (id: string) => {
    if (medicines.length <= 1) return;
    setMedicines((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSelectPreset = (drugs: string[]) => {
    setMedicines(drugs.map((d, idx) => ({ id: (idx + 1).toString(), name: d })));
    setSuggestionsMap({});
    setActiveSuggestionId(null);
  };

  // Close suggestions popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveSuggestionId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Universal Analysis Execution
  const handleAnalyze = async () => {
    const rawNames = medicines.map((m) => m.name.trim()).filter((n) => n.length > 0);
    if (rawNames.length === 0 || isAnalyzing) return;

    setIsAnalyzing(true);
    audioVoiceEngine.stop();

    try {
      setCurrentStep('Step 1/4: Querying live RxNorm for medication resolution & active ingredients...');
      await new Promise((r) => setTimeout(r, 350));

      setCurrentStep('Step 2/4: Retrieving FDA Structured Product Labeling & Boxed Warnings...');
      await new Promise((r) => setTimeout(r, 380));

      setCurrentStep('Step 3/4: Inspecting PubMed & OpenAlex clinical pharmacology repositories...');
      await new Promise((r) => setTimeout(r, 350));

      setCurrentStep('Step 4/4: Synthesizing evidence-based interaction & risk dossier...');
      const result = await runUniversalMedicineAnalysis(rawNames);
      setAnalysisOutput(result);
    } catch (err) {
      console.error('Analysis execution error:', err);
    } finally {
      setIsAnalyzing(false);
      setCurrentStep('');
    }
  };

  // Initial trigger
  useEffect(() => {
    handleAnalyze();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Text generator for Audio Voice Engine
  const generateSpokenSummaryText = (section: typeof selectedAudioSection): string => {
    if (!analysisOutput) return '';
    const lang = currentLang;

    if (analysisOutput.mode === 'SINGLE_DRUG') {
      const d = analysisOutput.dossier;
      if (d.status === 'UNRECOGNIZED') {
        return lang === 'te'
          ? `ఔషధం ${d.medicine.inputQuery} గుర్తించబడలేదు. దయచేసి సరైన పేరు నమోదు చేయండి.`
          : lang === 'hi'
          ? `दवा ${d.medicine.inputQuery} पहचानी नहीं गई। कृपया सही नाम दर्ज करें।`
          : `The medication ${d.medicine.inputQuery} could not be resolved in standardized terminologies.`;
      }

      const drugName = formatMultilingualDrugName(d.medicine.genericName || d.medicine.inputQuery, lang);
      const indications = translateMedicalText(d.approvedIndications, lang);
      const reactions = d.documentedAdverseReactions.slice(0, 4).map((r) => translateMedicalText(r, lang)).join(', ');
      const warning = d.boxedWarning ? translateMedicalText(d.boxedWarning, lang) : '';

      if (section === 'overview') {
        return `${drugName}. ${indications}`;
      }
      if (section === 'warnings' && warning) {
        return `${drugName}. ${warning}`;
      }
      if (section === 'risks') {
        return `${drugName}. ${reactions}`;
      }

      return `${drugName}. ${indications}. ${reactions}. ${warning}`;
    } else {
      const r = analysisOutput.regimen;
      const drugNames = r.medicines.map((m) => formatMultilingualDrugName(m.genericName || m.inputQuery, lang)).join(', ');
      const riskSummary = translateMedicalText(r.combinedRiskSummary, lang);
      const topInteractions = r.pairwiseInteractions
        .filter((p) => p.reportA.hasInteraction)
        .map((p) => translateMedicalText(p.reportA.knownInteractionsSummary, lang))
        .join('. ');

      if (section === 'overview') {
        return `${drugNames}. ${riskSummary}`;
      }
      if (section === 'interactions') {
        return `${topInteractions || riskSummary}`;
      }
      if (section === 'risks') {
        const adverse = r.commonAdverseEffects.slice(0, 5).map((a) => translateMedicalText(a, lang)).join(', ');
        return `${riskSummary}. ${adverse}`;
      }

      return `${drugNames}. ${riskSummary}. ${topInteractions}`;
    }
  };



  const getSeverityBadgeClass = (sev: InteractionSeverity) => {
    switch (sev) {
      case 'Contraindicated':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'Major':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Moderate':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      case 'Minor':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  // PDF Export
  const handleExportPdf = () => {
    if (!analysisOutput) return;
    const doc = new jsPDF();
    const dateStr = new Date().toLocaleString();

    doc.setFontSize(18);
    doc.text('Drug Scope AI — Evidence-Based Clinical Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${dateStr} | Language: ${currentLang.toUpperCase()}`, 14, 28);

    if (analysisOutput.mode === 'SINGLE_DRUG') {
      const d = analysisOutput.dossier;
      doc.text(`Medicine: ${d.medicine.genericName} (RxCUI: ${d.medicine.rxcui || 'N/A'})`, 14, 36);
      doc.text(`Status: ${d.status}`, 14, 42);

      doc.setFontSize(12);
      doc.text('Approved Indications:', 14, 52);
      doc.setFontSize(9);
      const splitInd = doc.splitTextToSize(d.approvedIndications, 180);
      doc.text(splitInd, 14, 58);

      let y = 58 + splitInd.length * 5 + 6;
      doc.setFontSize(12);
      doc.text('Documented Adverse Reactions:', 14, y);
      y += 6;
      doc.setFontSize(9);
      d.documentedAdverseReactions.forEach((ar) => {
        doc.text(`• ${ar}`, 16, y);
        y += 5;
      });

      if (d.boxedWarning) {
        y += 4;
        doc.setFontSize(12);
        doc.text('FDA Boxed Warning:', 14, y);
        y += 6;
        doc.setFontSize(9);
        const splitWarn = doc.splitTextToSize(d.boxedWarning, 180);
        doc.text(splitWarn, 14, y);
      }

      doc.save(`DrugScope_SingleDrug_${d.medicine.genericName}_${currentLang}.pdf`);
    } else {
      const r = analysisOutput.regimen;
      const drugListStr = r.medicines.map((m) => m.genericName || m.inputQuery).join(' + ');
      doc.text(`Regimen: ${drugListStr}`, 14, 36);
      doc.text(`Overall Classification: ${r.overallClassification.toUpperCase()}`, 14, 42);

      doc.setFontSize(12);
      doc.text('Combined Risk Summary:', 14, 52);
      doc.setFontSize(9);
      const splitSumm = doc.splitTextToSize(r.combinedRiskSummary, 180);
      doc.text(splitSumm, 14, 58);

      let y = 58 + splitSumm.length * 5 + 6;
      doc.setFontSize(12);
      doc.text('Pairwise Interaction Findings:', 14, y);
      y += 6;
      doc.setFontSize(9);

      r.pairwiseInteractions.forEach((p) => {
        doc.text(`${p.drug1.genericName} + ${p.drug2.genericName} [${p.reportA.classification.toUpperCase()}]:`, 16, y);
        y += 5;
        const splitInter = doc.splitTextToSize(p.reportA.knownInteractionsSummary, 175);
        doc.text(splitInter, 18, y);
        y += splitInter.length * 5 + 4;
      });

      doc.save(`DrugScope_Regimen_${r.sessionId}_${currentLang}.pdf`);
    }
  };

  // JSON Export
  const handleExportJson = () => {
    if (!analysisOutput) return;
    const blob = new Blob([JSON.stringify(analysisOutput, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DrugScope_Analysis_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div ref={containerRef} className="space-y-8 max-w-[1520px] mx-auto px-4 sm:px-6 pb-24">
      {/* ==================================================================== */}
      {/* HEADER BANNER WITH TRILINGUAL SWITCHER & AUTHENTIC BADGES             */}
      {/* ==================================================================== */}
      <div className="glass-panel p-6 lg:p-8 rounded-3xl border border-white/10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#24D8ED]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#9475FF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#24D8ED]/10 border border-[#24D8ED]/30 text-xs font-mono font-semibold text-[#24D8ED]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>DRUG SCOPE AI 15.0 — UNIVERSAL MEDICINE ENGINE</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-white tracking-tight">
              {currentLang === 'te'
                ? 'ఔషధ పరస్పర చర్యలు & దుష్ప్రభావాల విశ్లేషణ'
                : currentLang === 'hi'
                ? 'दवा परस्पर क्रिया एवं दुष्प्रभाव विश्लेषण'
                : 'Universal Medicine Intelligence & Interaction Engine'}
            </h1>
            <p className="text-xs text-[#A7B5C9] leading-relaxed">
              {currentLang === 'te'
                ? 'ఏదైనా మందు పేరు నమోదు చేయండి. సింగిల్ డ్రగ్ మోనోగ్రాఫ్ లేదా బహుళ ఔషధాల పరస్పర చర్యలు, దుష్ప్రభావాలు మరియు శాస్త్రీయ ఆధారాలను తెలుగు, హిందీ లేదా ఇంగ్లీషులో పొందండి.'
                : currentLang === 'hi'
                ? 'किसी भी दवा का नाम दर्ज करें। एकल दवा मोनोग्राफ अथवा एकाधिक दवाओं की परस्पर क्रिया, दुष्प्रभाव एवं वैज्ञानिक प्रमाण हिंदी, तेलुगु या अंग्रेजी में प्राप्त करें।'
                : 'Enter any medicine name (single drug, pair, or multiple medications). Receive evidence-grounded adverse reaction monographs and interaction dossiers in English, Telugu, or Hindi.'}
            </p>
          </div>

          {/* Trilingual Toggle Pill */}
          <div className="flex flex-col items-end gap-3 shrink-0">
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#0B1120] border border-white/15 shadow-inner">
              <Globe className="w-4 h-4 text-[#37D6E6] ml-2 shrink-0" />
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isActive = currentLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      speechEngine.handleLanguageChanged(lang.code);
                      i18n.changeLanguage(lang.code);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-[#24D8ED] to-[#9475FF] text-[#070B14] font-bold shadow-md shadow-[#24D8ED]/20'
                        : 'text-[#A6B5CB] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{lang.nativeName}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-[#32C8B7] bg-[#32C8B7]/10 border border-[#32C8B7]/30 px-3 py-1 rounded-full font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#32C8B7] animate-pulse" />
                <span>RxNorm + openFDA + PubMed</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MEDICINE INPUT WORKSPACE (DYNAMIC: 1, 2, 3+ MEDICINES)                 */}
      {/* ==================================================================== */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6 shadow-xl relative">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4 text-[#37D6E6]" />
            <h2 className="text-sm font-display font-bold text-white tracking-wide uppercase">
              {currentLang === 'te'
                ? 'ఔషధాల నమోదు (ఒకటి లేదా అంతకంటే ఎక్కువ)'
                : currentLang === 'hi'
                ? 'दवाओं की प्रविष्टि (एक या अधिक)'
                : 'Enter Medicines (Single or Multiple Regimen)'}
            </h2>
          </div>
          <span className="text-xs font-mono text-[#A7B5C9]">
            {medicines.length === 1 ? 'Single Medicine Mode' : `${medicines.length} Medicines Regimen Mode`}
          </span>
        </div>

        {/* Input Rows */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {medicines.map((med, index) => {
            const hasSuggestions = activeSuggestionId === med.id && (suggestionsMap[med.id]?.length || 0) > 0;
            return (
              <div key={med.id} className="space-y-1.5 relative">
                <div className="flex items-center justify-between text-xs font-mono text-[#A7B5C9]">
                  <span className="flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white">
                      {index + 1}
                    </span>
                    <span>{currentLang === 'te' ? `ఔషధం ${index + 1}` : currentLang === 'hi' ? `दवा ${index + 1}` : `Medicine ${index + 1}`}</span>
                  </span>
                  {medicines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicine(med.id)}
                      className="text-rose-400 hover:text-rose-300 p-0.5 rounded transition-colors"
                      title="Remove this medicine"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={med.name}
                    onChange={(e) => handleInputChange(med.id, e.target.value)}
                    onFocus={() => setActiveSuggestionId(med.id)}
                    placeholder="e.g. Paracetamol, Warfarin, Metformin..."
                    className="w-full bg-[#101827] border border-white/15 focus:border-[#37D6E6] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#64748B] focus:outline-none transition-all shadow-inner"
                  />
                  {med.name && (
                    <button
                      type="button"
                      onClick={() => handleInputChange(med.id, '')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Suggestions Popover */}
                {hasSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#0B1120] border border-white/20 rounded-xl shadow-2xl p-1.5 z-40 max-h-52 overflow-y-auto">
                    {suggestionsMap[med.id].map((s, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => {
                          handleInputChange(med.id, s.name);
                          setActiveSuggestionId(null);
                        }}
                        className="w-full p-2 rounded-lg text-left hover:bg-white/10 flex items-center justify-between text-xs text-white transition-colors"
                      >
                        <span className="font-medium truncate">{s.name}</span>
                        <span className="text-[9px] font-mono text-[#A7B5C9] uppercase bg-white/5 px-1.5 py-0.5 rounded ml-2 shrink-0">
                          {s.type}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Buttons: Add Medicine & Presets */}
        <div className="pt-2 flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-white/10">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleAddMedicine}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#37D6E6]" />
              <span>
                {currentLang === 'te'
                  ? '+ మరొక ఔషధాన్ని జోడించండి'
                  : currentLang === 'hi'
                  ? '+ एक और दवा जोड़ें'
                  : '+ Add Another Medicine'}
              </span>
            </button>

            <span className="text-[11px] font-mono text-[#A7B5C9] ml-2 hidden sm:inline">Presets:</span>
            {PRESET_QUERIES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(preset.drugs)}
                className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 hover:border-[#37D6E6]/50 hover:bg-white/10 text-white transition-all cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing || medicines.every((m) => !m.name.trim())}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#37D6E6] to-[#9475FF] text-[#070B14] font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-lg shadow-[#37D6E6]/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>
                  {currentLang === 'te'
                    ? 'ఆధారాలు సేకరిస్తోంది...'
                    : currentLang === 'hi'
                    ? 'प्रमाण जुटा रहा है...'
                    : 'Synthesizing Evidence...'}
                </span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>
                  {currentLang === 'te'
                    ? 'విశ్లేషణ ప్రారంభించండి'
                    : currentLang === 'hi'
                    ? 'विश्लेषण शुरू करें'
                    : 'Analyze Medicines'}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Step Progress Bar */}
        {isAnalyzing && (
          <div className="p-3.5 rounded-xl bg-[#070B14] border border-[#37D6E6]/30 text-xs font-mono text-[#37D6E6] flex items-center gap-2.5 animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
            <span>{currentStep}</span>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* CENTRALIZED REPORT AUDIO NARRATION ENGINE (EN, TE, HI)               */}
      {/* ==================================================================== */}
      {analysisOutput && (
        <ReportAudioPlayer
          currentLang={currentLang}
          selectedSection={selectedAudioSection}
          onSectionChange={setSelectedAudioSection}
          onGenerateText={generateSpokenSummaryText}
        />
      )}

      {/* ==================================================================== */}
      {/* REPORT OUTPUT AREA                                                    */}
      {/* ==================================================================== */}
      {analysisOutput ? (
        <div className="space-y-6">
          {/* Top Bar: Language & Export Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0B1120] border border-white/10">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowOriginalEnglish(!showOriginalEnglish)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                  showOriginalEnglish
                    ? 'bg-[#37D6E6]/20 border border-[#37D6E6] text-[#37D6E6]'
                    : 'bg-white/5 border border-white/10 text-[#A7B5C9] hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>
                  {showOriginalEnglish ? 'Viewing English Source' : 'View Original English Evidence'}
                </span>
              </button>

              <span className="text-xs font-mono text-[#A7B5C9]">
                Active Locale: <strong className="text-white">{currentLang.toUpperCase()}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportPdf}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#37D6E6]" />
                <span>PDF Report</span>
              </button>

              <button
                type="button"
                onClick={handleExportJson}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#A7B5C9] hover:text-white text-xs font-mono transition-colors cursor-pointer"
              >
                JSON
              </button>
            </div>
          </div>

          {/* Main Two-Panel Responsive Analysis Workspace: Left 58% Report / Right 42% Sticky 3D Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Comprehensive Evidence Report Stream (58% width) */}
            <div className="lg:col-span-7 space-y-6">
              {/* ---------------------------------------------------------------- */}
              {/* SCENARIO A: SINGLE MEDICINE CLINICAL DOSSIER                     */}
              {/* ---------------------------------------------------------------- */}
              {analysisOutput.mode === 'SINGLE_DRUG' && (
            <div className="space-y-6">
              {analysisOutput.dossier.status === 'UNRECOGNIZED' ? (
                <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span>Medication Identity Resolution Notice</span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    The entered medicine &quot;{analysisOutput.dossier.medicine.inputQuery}&quot; could not be resolved in standardized RxNorm terminology. Please check the spelling or enter the active ingredient / brand name.
                  </p>
                </div>
              ) : (
                <div className="glass-panel p-6 lg:p-8 rounded-3xl border border-white/10 space-y-6 bg-[#0B1120]/80">
                  {/* Title & Identity Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-white/10 gap-4">
                    <div className="space-y-1">
                      <div className="text-[11px] font-mono text-[#37D6E6] uppercase tracking-wider">
                        {currentLang === 'te' ? 'సింగిల్ డ్రగ్ మోనోగ్రాఫ్' : currentLang === 'hi' ? 'एकल दवा मोनोग्राफ' : 'Single Medicine Clinical Monograph'}
                      </div>
                      <h2 className="text-2xl font-bold text-white">
                        {showOriginalEnglish
                          ? analysisOutput.dossier.medicine.genericName
                          : formatMultilingualDrugName(analysisOutput.dossier.medicine.genericName || '', currentLang)}
                      </h2>
                      <div className="text-xs text-[#A7B5C9]">
                        Class: <span className="text-white font-medium">{analysisOutput.dossier.medicine.drugClass || 'Therapeutic Agent'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#32C8B7] bg-[#32C8B7]/10 border border-[#32C8B7]/30 px-3 py-1 rounded-full font-semibold">
                        RxCUI: {analysisOutput.dossier.medicine.rxcui || 'Standardized'}
                      </span>
                    </div>
                  </div>

                  {/* Indications */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-mono uppercase text-[#37D6E6] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{currentLang === 'te' ? 'ఆమోదించబడిన ఉపయోగాలు (Indications)' : currentLang === 'hi' ? 'स्वीकृत संकेत (Indications)' : 'FDA Approved Indications'}</span>
                    </h3>
                    <p className="text-xs text-[#E2E8F0] leading-relaxed bg-[#070B14] p-4 rounded-xl border border-white/5">
                      {showOriginalEnglish
                        ? analysisOutput.dossier.approvedIndications
                        : translateMedicalText(analysisOutput.dossier.approvedIndications, currentLang)}
                    </p>
                  </div>

                  {/* Documented Adverse Reactions */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-mono uppercase text-[#FF6B6B] flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{currentLang === 'te' ? 'నమోదైన దుష్ప్రభావాలు (Documented Adverse Reactions)' : currentLang === 'hi' ? 'प्रलेखित प्रतिकूल प्रभाव (Adverse Reactions)' : 'Documented Adverse Reactions'}</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {analysisOutput.dossier.documentedAdverseReactions.map((ar, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-200">
                          • {showOriginalEnglish ? ar : translateMedicalText(ar, currentLang)}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Boxed Warning */}
                  {analysisOutput.dossier.boxedWarning && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-1.5">
                      <div className="font-bold text-xs font-mono text-amber-300 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>FDA Boxed Warning:</span>
                      </div>
                      <p className="text-xs leading-relaxed opacity-95">
                        {showOriginalEnglish
                          ? analysisOutput.dossier.boxedWarning
                          : translateMedicalText(analysisOutput.dossier.boxedWarning, currentLang)}
                      </p>
                    </div>
                  )}

                  {/* Contraindications & Clinical Pharmacology */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#070B14] border border-white/5 space-y-2">
                      <div className="text-xs font-semibold text-white">
                        {currentLang === 'te' ? 'విరుద్ధ ఉపయోగం (Contraindications)' : currentLang === 'hi' ? 'निषेध (Contraindications)' : 'Contraindications & Precautions'}
                      </div>
                      <p className="text-xs text-[#A7B5C9] leading-relaxed">
                        {showOriginalEnglish
                          ? analysisOutput.dossier.contraindications
                          : translateMedicalText(analysisOutput.dossier.contraindications, currentLang)}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#070B14] border border-white/5 space-y-2">
                      <div className="text-xs font-semibold text-white">
                        {currentLang === 'te' ? 'క్లినికల్ ఫార్మకాలజీ' : currentLang === 'hi' ? 'नैदानिक औषध विज्ञान' : 'Clinical Pharmacology'}
                      </div>
                      <p className="text-xs text-[#A7B5C9] leading-relaxed">
                        {showOriginalEnglish
                          ? analysisOutput.dossier.clinicalPharmacology
                          : translateMedicalText(analysisOutput.dossier.clinicalPharmacology, currentLang)}
                      </p>
                    </div>
                  </div>

                  {/* Citations */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#32C8B7]" />
                      <span>Original Clinical Citations ({analysisOutput.dossier.citations.length}):</span>
                    </div>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {analysisOutput.dossier.citations.map((c, idx) => (
                        <div key={idx} className="p-2 rounded bg-[#070B14] border border-white/5 text-[11px] flex items-center justify-between gap-2">
                          <div className="truncate flex-1">
                            <span className="text-white font-medium">{c.title}</span>
                            <span className="text-[#A7B5C9] ml-1">({c.source}{c.year ? `, ${c.year}` : ''})</span>
                          </div>
                          {c.url && (
                            <a
                              href={c.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#37D6E6] hover:underline flex items-center gap-0.5 shrink-0 font-mono text-[9px]"
                            >
                              <span>{c.doi ? 'DOI' : 'Link'}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* SCENARIO B: MULTI-DRUG REGIMEN INTERACTION ANALYSIS              */}
          {/* ---------------------------------------------------------------- */}
          {analysisOutput.mode === 'MULTI_DRUG' && (
            <div className="space-y-6">
              {/* Overall Regimen Status Banner */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="text-xs font-mono text-[#A7B5C9] uppercase">
                    Overall Regimen Interaction Severity:
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-mono px-3 py-1 rounded-full border font-bold ${getSeverityBadgeClass(
                        analysisOutput.regimen.overallClassification
                      )}`}
                    >
                      {analysisOutput.regimen.overallClassification.toUpperCase()}
                    </span>
                    <span className="text-base font-bold text-white">
                      {analysisOutput.regimen.medicines
                        .map((m) =>
                          showOriginalEnglish
                            ? m.genericName || m.inputQuery
                            : formatMultilingualDrugName(m.genericName || m.inputQuery, currentLang)
                        )
                        .join(' + ')}
                    </span>
                  </div>
                </div>

                <div className="text-xs font-mono text-[#A7B5C9]">
                  Evaluated {analysisOutput.regimen.pairwiseInteractions.length} interaction pairs
                </div>
              </div>

              {/* Combined Risk Summary */}
              <div className="p-5 rounded-2xl bg-[#070B14] border border-white/10 space-y-2">
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-[#37D6E6]" />
                  <span>
                    {currentLang === 'te'
                      ? 'సమ్మేళన ప్రమాద సారాంశం (Combined Risk Assessment)'
                      : currentLang === 'hi'
                      ? 'संयुक्त जोखिम मूल्यांकन (Combined Risk Assessment)'
                      : 'Combined Regimen Risk Assessment'}
                  </span>
                </div>
                <p className="text-xs text-[#E2E8F0] leading-relaxed">
                  {showOriginalEnglish
                    ? analysisOutput.regimen.combinedRiskSummary
                    : translateMedicalText(analysisOutput.regimen.combinedRiskSummary, currentLang)}
                </p>
              </div>

              {/* Pairwise Interactions Cards */}
              <div className="space-y-6">
                {analysisOutput.regimen.pairwiseInteractions.map((pair, pIdx) => {
                  const drug1Name = showOriginalEnglish
                    ? pair.drug1.genericName
                    : formatMultilingualDrugName(pair.drug1.genericName || '', currentLang);
                  const drug2Name = showOriginalEnglish
                    ? pair.drug2.genericName
                    : formatMultilingualDrugName(pair.drug2.genericName || '', currentLang);

                  return (
                    <div
                      key={pIdx}
                      className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 bg-[#0B1120]/80"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-bold ${getSeverityBadgeClass(
                              pair.reportA.classification
                            )}`}
                          >
                            {pair.reportA.classification.toUpperCase()}
                          </span>
                          <span className="text-sm font-bold text-white">
                            {drug1Name} + {drug2Name}
                          </span>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="space-y-1">
                        <div className="text-[11px] font-mono text-[#A7B5C9]">Interaction Summary:</div>
                        <p className="text-xs text-[#E2E8F0] leading-relaxed bg-[#070B14] p-3 rounded-xl border border-white/5">
                          {showOriginalEnglish
                            ? pair.reportA.knownInteractionsSummary
                            : translateMedicalText(pair.reportA.knownInteractionsSummary, currentLang)}
                        </p>
                      </div>

                      {/* Potential Side Effects */}
                      {pair.reportA.potentialSideEffects.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="text-[11px] font-semibold text-white">Potential Adverse Effects:</div>
                          <div className="flex flex-wrap gap-1.5">
                            {pair.reportA.potentialSideEffects.map((se, sIdx) => (
                              <span
                                key={sIdx}
                                className="text-[11px] px-2 py-0.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 font-sans"
                              >
                                {showOriginalEnglish ? se : translateMedicalText(se, currentLang)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Mechanism */}
                      <div className="space-y-1">
                        <div className="text-[11px] font-semibold text-white">Pharmacological Mechanism:</div>
                        <p className="text-xs text-[#A7B5C9] leading-relaxed">
                          {showOriginalEnglish
                            ? pair.reportB.whyInteractionOccurs
                            : translateMedicalText(pair.reportB.whyInteractionOccurs, currentLang)}
                        </p>
                      </div>

                      {/* Clinical Consequences */}
                      <div className="space-y-1">
                        <div className="text-[11px] font-semibold text-white">Clinical Consequences:</div>
                        <ul className="space-y-1 text-xs text-[#A7B5C9]">
                          {pair.reportA.clinicalConsequences.map((c, cIdx) => (
                            <li key={cIdx} className="flex items-start gap-1.5">
                              <span className="text-[#37D6E6]">•</span>
                              <span>{showOriginalEnglish ? c : translateMedicalText(c, currentLang)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Safety Considerations */}
                      {pair.reportB.safetyConsiderations.length > 0 && (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 space-y-1">
                          <div className="font-semibold font-mono text-[11px] text-emerald-300">
                            Monitoring & Precautions:
                          </div>
                          {pair.reportB.safetyConsiderations.map((sc, scIdx) => (
                            <div key={scIdx}>✔ {showOriginalEnglish ? sc : translateMedicalText(sc, currentLang)}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Evidence-Linked 3D Molecular Intelligence Panel (42% width) */}
        <div className="lg:col-span-5 sticky top-20 space-y-4">
          <EvidenceMolecularPanel
            payload={molecularPayload}
            onOpenLab={onNavigateTo3D}
          />
        </div>
      </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Loading Skeleton or Workspace Readiness Card (58% width) */}
          <div className="lg:col-span-7 space-y-6">
            {isAnalyzing ? (
              <div className="glass-panel p-6 lg:p-8 rounded-3xl border border-[#37D6E6]/20 bg-[#0B1120]/80 space-y-6 animate-pulse">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="space-y-2">
                    <div className="h-6 w-48 bg-white/10 rounded-lg" />
                    <div className="h-4 w-32 bg-white/5 rounded-lg" />
                  </div>
                  <div className="h-8 w-24 bg-[#37D6E6]/10 rounded-xl" />
                </div>
                <div className="space-y-3">
                  <div className="h-4 w-full bg-white/10 rounded" />
                  <div className="h-4 w-5/6 bg-white/10 rounded" />
                  <div className="h-4 w-4/6 bg-white/5 rounded" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-24 bg-white/5 rounded-2xl border border-white/5" />
                  <div className="h-24 bg-white/5 rounded-2xl border border-white/5" />
                </div>
                <div className="h-32 bg-white/5 rounded-2xl border border-white/5" />
              </div>
            ) : (
              <div className="glass-panel p-6 lg:p-8 rounded-3xl border border-white/10 bg-[#0B1120]/80 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-[#37D6E6]/10 border border-[#37D6E6]/30 text-[#37D6E6]">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-display">
                      Evidence-Based Clinical Intelligence Ready
                    </h3>
                    <p className="text-xs text-[#A7B5C9]">
                      Enter active pharmaceutical ingredients or brand names above to query live RxNorm, openFDA, and PubMed.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#070B14] border border-white/5 space-y-3 text-xs text-[#A7B5C9]">
                  <div className="font-semibold text-white">Recommended Clinical Evaluation Regimens:</div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: 'Warfarin + Aspirin', desc: 'Synergistic Hemorrhage Risk' },
                      { name: 'Warfarin + Amiodarone', desc: 'CYP2C9 Clearance Blockade' },
                      { name: 'Clopidogrel + Omeprazole', desc: 'CYP2C19 Bioactivation Inhibition' },
                      { name: 'Metformin', desc: 'Single-Drug Mitochondrial Profile' },
                      { name: 'Paracetamol', desc: 'Single-Drug NAPQI Peroxidase Profile' }
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const drugs = preset.name.split(' + ');
                          handleSelectPreset(drugs);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Zap className="w-3 h-3 text-[#37D6E6]" />
                        <span>{preset.name}</span>
                        <span className="text-[10px] text-[#A7B5C9] hidden sm:inline">({preset.desc})</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Evidence-Linked 3D Molecular Intelligence Panel (42% width) */}
          <div className="lg:col-span-5 sticky top-20 space-y-4">
            <EvidenceMolecularPanel
              payload={molecularPayload}
              onOpenLab={onNavigateTo3D}
            />
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MANDATORY CLINICAL SAFETY DISCLAIMER                                 */}
      {/* ==================================================================== */}
      <div className="p-4 rounded-xl bg-[#070B14] border border-white/10 text-xs text-[#A7B5C9] flex items-center gap-3">
        <Info className="w-4 h-4 text-[#37D6E6] shrink-0" />
        <span>
          <strong>Clinical Safety Notice:</strong> Drug Scope AI provides research and decision-support intelligence synthesized exclusively from verified biomedical repositories (openFDA, RxNorm, OpenAlex). Do not adjust dosages, discontinue medications, or alter therapy without professional clinical consultation.
        </span>
      </div>
    </div>
  );
};
