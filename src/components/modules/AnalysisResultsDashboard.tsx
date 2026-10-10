import React, { useState, useEffect } from 'react';
import { AnalysisFinding, AnalysisSession, ExplanationMode, GraphNode } from '../../types';
import { getAnalysisSessionById } from '../../services/analysisEngine';
import { EvidenceGraph3D } from '../3d/EvidenceGraph3D';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Box,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Filter,
  Info,
  Layers,
  Network,
  Pill,
  Printer,
  Share2,
  Shield,
  Sparkles,
  Users
} from 'lucide-react';

interface AnalysisResultsDashboardProps {
  sessionId: string;
  onBackToSearch: () => void;
  onNavigateTo3DStructure?: (pdbId: string) => void;
  onViewReportDossier?: (session: AnalysisSession) => void;
}

export const AnalysisResultsDashboard: React.FC<AnalysisResultsDashboardProps> = ({
  sessionId,
  onBackToSearch,
  onNavigateTo3DStructure,
  onViewReportDossier
}) => {
  const [session, setSession] = useState<AnalysisSession | null>(null);
  const [explanationMode, setExplanationMode] = useState<ExplanationMode>('professional');
  const [selectedFinding, setSelectedFinding] = useState<AnalysisFinding | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [viewMode, setViewMode] = useState<'graph' | 'table'>('graph');

  useEffect(() => {
    const s = getAnalysisSessionById(sessionId);
    if (s) {
      setSession(s);
      if (s.findings.length > 0) {
        setSelectedFinding(s.findings[0]);
      }
    }
  }, [sessionId]);

  if (!session) {
    return (
      <div className="bg-[#0B1120] border border-white/10 rounded-2xl p-12 text-center space-y-4 max-w-xl mx-auto">
        <Info className="w-12 h-12 text-[#24D8ED] mx-auto" />
        <h2 className="text-lg font-bold text-white">Analysis Session Not Found</h2>
        <p className="text-xs text-[#A6B5CB]">
          The requested analysis session could not be retrieved from local or cloud storage.
        </p>
        <button
          onClick={onBackToSearch}
          className="px-4 py-2 rounded-xl bg-[#24D8ED] text-[#070B14] font-semibold text-xs"
        >
          Return to Medicine Search
        </button>
      </div>
    );
  }

  const exportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(session, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute('href', dataStr);
    dl.setAttribute('download', `DrugScope_${session.id}.json`);
    dl.click();
  };

  const exportCsv = () => {
    const headers = ['Drug A', 'Drug B', 'Severity', 'Interaction Type', 'Evidence Status', 'Mechanism', 'Clinical Consequence', 'Management Guidance', 'Primary Citations'];
    const rows = session.findings.map((f) => [
      `"${f.drugAName.replace(/"/g, '""')}"`,
      `"${f.drugBName.replace(/"/g, '""')}"`,
      `"${f.severity}"`,
      `"${f.interactionType}"`,
      `"${f.evidenceStatus}"`,
      `"${f.mechanism.replace(/"/g, '""')}"`,
      `"${f.clinicalConsequence.replace(/"/g, '""')}"`,
      `"${f.managementGuidance.replace(/"/g, '""')}"`,
      `"${f.sources.map((s) => s.citation).join('; ').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const dl = document.createElement('a');
    dl.setAttribute('href', url);
    dl.setAttribute('download', `DrugScope_${session.id}_findings.csv`);
    dl.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 text-[#F5F8FF]">
      {/* Top Header Command Bar */}
      <div className="bg-[#0B1120] border border-white/[0.08] p-5 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToSearch}
              className="p-1 rounded-lg text-[#71839E] hover:text-white hover:bg-white/10 transition-colors"
              title="Back to search"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-lg lg:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>{session.title}</span>
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#24D8ED]/10 text-[#24D8ED] border border-[#24D8ED]/30 font-semibold">
              {session.id}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#A6B5CB]">
            <span>Generated: {new Date(session.timestamp).toLocaleDateString()}</span>
            <span>•</span>
            <span>{session.medications.length} Evaluated Medicines</span>
            <span>•</span>
            <span className="text-[#31CAB6]">
              {session.summary.documentedEvidencePercent}% Verified Provenance
            </span>
          </div>
        </div>

        {/* Audience Mode Switcher & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-[#070B14] p-1 rounded-xl border border-white/[0.08]">
            {(
              [
                { id: 'simple', label: 'Simple Mode', desc: 'Patient / Educational' },
                { id: 'professional', label: 'Professional Mode', desc: 'Physicians & Pharmacists' },
                { id: 'research', label: 'Research Mode', desc: 'Scientists & Structural' }
              ] as const
            ).map((mode) => (
              <button
                key={mode.id}
                onClick={() => setExplanationMode(mode.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  explanationMode === mode.id
                    ? 'bg-[#24D8ED] text-[#070B14] font-semibold shadow-sm'
                    : 'text-[#A6B5CB] hover:text-white'
                }`}
                title={mode.desc}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {/* Export Actions */}
          <button
            onClick={() => {
              if (onViewReportDossier) onViewReportDossier(session);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#24D8ED] to-[#9475FF] text-[#070B14] font-semibold text-xs hover:opacity-95 shadow-md cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate PDF Report</span>
          </button>
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#152238] border border-white/10 text-xs font-semibold text-[#A6B5CB] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Export CSV data table"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            onClick={exportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#152238] border border-white/10 text-xs font-semibold text-[#A6B5CB] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Export JSON graph dataset"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* 3-Panel Main Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ======================================================== */}
        {/* LEFT WORKSPACE (3/12 cols) */}
        {/* ======================================================== */}
        <div className="lg:col-span-3 space-y-4">
          {/* Primary Risk Alert Card */}
          <div
            className={`border rounded-2xl p-4 space-y-3 ${
              session.summary.contraindicatedCount > 0
                ? 'bg-[#F16D7B]/10 border-[#F16D7B]/30'
                : session.summary.majorCount > 0
                ? 'bg-[#F2B961]/10 border-[#F2B961]/30'
                : 'bg-[#31CAB6]/10 border-[#31CAB6]/30'
            }`}
          >
            <div className="flex items-center gap-2">
              {session.summary.contraindicatedCount > 0 ? (
                <AlertOctagon className="w-4 h-4 text-[#F16D7B]" />
              ) : (
                <Shield className="w-4 h-4 text-[#31CAB6]" />
              )}
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Risk Classification
              </span>
            </div>
            <p className="text-xs text-[#F5F8FF] leading-relaxed">
              {session.summary.primaryRiskSummary}
            </p>

            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/10 text-center">
              <div>
                <div className="text-sm font-bold text-[#F16D7B]">
                  {session.summary.contraindicatedCount}
                </div>
                <div className="text-[9px] font-mono text-[#A6B5CB] uppercase">Contraindicated</div>
              </div>
              <div>
                <div className="text-sm font-bold text-[#F2B961]">
                  {session.summary.majorCount}
                </div>
                <div className="text-[9px] font-mono text-[#A6B5CB] uppercase">Major</div>
              </div>
              <div>
                <div className="text-sm font-bold text-[#31CAB6]">
                  {session.summary.moderateCount}
                </div>
                <div className="text-[9px] font-mono text-[#A6B5CB] uppercase">Moderate</div>
              </div>
            </div>
          </div>

          {/* Evaluated Medications List */}
          <div className="bg-[#0B1120] border border-white/[0.08] rounded-2xl p-4 space-y-3">
            <div className="text-xs font-mono uppercase text-[#71839E] font-semibold">
              Evaluated Regimen ({session.medications.length})
            </div>
            <div className="space-y-2">
              {session.medications.map((drug) => (
                <div
                  key={drug.id}
                  className="p-3 rounded-xl bg-[#070B14] border border-white/[0.06] space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{drug.genericName}</span>
                    <span className="text-[10px] font-mono text-[#24D8ED]">
                      RxCUI {drug.rxNormCui}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#A6B5CB] truncate">
                    {drug.drugClass}
                  </div>
                  <div className="flex items-center gap-1.5 pt-1 text-[10px] text-[#71839E]">
                    <span>CYP: {drug.primaryMetabolizingEnzymes.join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Biological Targets */}
          <div className="bg-[#0B1120] border border-white/[0.08] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-white">Macromolecular Targets</span>
              <span className="text-[10px] font-mono text-[#24D8ED]">Verified PDBs</span>
            </div>
            <div className="space-y-2">
              {session.medications.flatMap((m) => m.targets).slice(0, 3).map((targetId, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-[#070B14] border border-white/[0.06] flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Box className="w-3.5 h-3.5 text-[#9475FF]" />
                    <span className="text-xs font-mono font-bold text-white uppercase">{targetId}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (onNavigateTo3DStructure) onNavigateTo3DStructure('7K3N');
                    }}
                    className="text-[11px] text-[#24D8ED] hover:underline flex items-center gap-1"
                  >
                    <span>Inspect 3D</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CENTER WORKSPACE (6/12 cols) */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#0B1120] border border-white/[0.08] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Network className="w-4 h-4 text-[#24D8ED]" />
                <span>Three-Dimensional Scientific Evidence Graph</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#71839E]">
                <span>{session.graphData.nodes.length} Nodes</span>
                <span>•</span>
                <span>{session.graphData.edges.length} Biological Edges</span>
              </div>
            </div>

            {/* Interactive 3D Evidence Graph */}
            <EvidenceGraph3D
              nodes={session.graphData.nodes}
              edges={session.graphData.edges}
              selectedNodeId={selectedNode?.id}
              onSelectNode={(node) => {
                setSelectedNode(node);
                if (node && node.type === 'drug') {
                  const match = session.findings.find(
                    (f) => f.drugAId === node.id || f.drugBId === node.id
                  );
                  if (match) setSelectedFinding(match);
                }
              }}
            />
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT WORKSPACE (3/12 cols) - Dynamic Explanation Inspector */}
        {/* ======================================================== */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-[#0B1120] border border-white/[0.08] rounded-2xl p-4 space-y-4">
            {/* Inspector Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#24D8ED]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Evidence Inspector
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#A6B5CB] capitalize">
                {explanationMode}
              </span>
            </div>

            {/* Selected Finding Details */}
            {selectedFinding ? (
              <div className="space-y-4 text-xs">
                {/* Drug Pair Title & Badge */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">
                      {selectedFinding.drugAName} ⟷ {selectedFinding.drugBName}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                        selectedFinding.severity === 'Contraindicated'
                          ? 'bg-[#F16D7B]/20 text-[#F16D7B] border border-[#F16D7B]/40'
                          : selectedFinding.severity === 'Major'
                          ? 'bg-[#F2B961]/20 text-[#F2B961] border border-[#F2B961]/40'
                          : 'bg-[#31CAB6]/20 text-[#31CAB6] border border-[#31CAB6]/40'
                      }`}
                    >
                      {selectedFinding.severity}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#24D8ED] font-mono">
                    {selectedFinding.interactionType}
                  </div>
                </div>

                {/* Explanation Content based on Mode */}
                <div className="p-3.5 rounded-xl bg-[#070B14] border border-white/[0.06] space-y-2">
                  <div className="text-[10px] font-mono uppercase text-[#71839E] font-semibold">
                    {explanationMode === 'simple'
                      ? 'What You Should Know (Educational)'
                      : explanationMode === 'professional'
                      ? 'Pharmacological Mechanism & Protocol'
                      : 'Assay Bioactivity & Kinetics'}
                  </div>
                  <p className="text-xs text-[#F5F8FF] leading-relaxed">
                    {explanationMode === 'simple'
                      ? selectedFinding.simpleExplanation
                      : explanationMode === 'professional'
                      ? selectedFinding.professionalExplanation
                      : selectedFinding.researchExplanation}
                  </p>
                </div>

                {/* Clinical Guidance / Action */}
                <div className="p-3.5 rounded-xl bg-[#152238] border border-[#31CAB6]/30 space-y-1.5">
                  <div className="text-[10px] font-mono uppercase text-[#31CAB6] font-semibold flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> Recommended Clinical Action
                  </div>
                  <p className="text-xs text-[#A6B5CB] leading-relaxed">
                    {selectedFinding.managementGuidance}
                  </p>
                </div>

                {/* Sources & Citations */}
                <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                  <div className="text-[10px] font-mono uppercase text-[#71839E]">
                    Supporting Citations ({selectedFinding.sources.length})
                  </div>
                  <div className="space-y-1.5">
                    {selectedFinding.sources.map((src, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-[#070B14] border border-white/[0.04] text-[11px] space-y-0.5"
                      >
                        <div className="flex items-center justify-between text-white font-medium">
                          <span className="truncate">{src.name}</span>
                          <span className="text-[9px] font-mono text-[#24D8ED]">{src.type}</span>
                        </div>
                        <div className="text-[10px] text-[#71839E] italic truncate">
                          {src.citation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-[#71839E]">
                Select any node or interaction in the graph or table to view detailed source evidence.
              </div>
            )}

            {/* Scientific Limitations Disclosure */}
            <div className="p-3 rounded-xl bg-[#070B14] border border-white/[0.06] text-[10px] text-[#71839E] flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-[#24D8ED] shrink-0 mt-0.5" />
              <span>
                Evidence claims reflect published FDA labeling and pharmacogenomic registries. Individual patient metabolizer phenotypes (e.g. CYP2C9*2/*3) can alter clinical outcomes.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Full Findings Matrix Table */}
      <div className="bg-[#0B1120] border border-white/[0.08] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white tracking-tight">
              Pairwise Findings Matrix ({session.findings.length})
            </h2>
            <span className="text-[10px] font-mono text-[#71839E]">
              Synchronized with 3D Graph
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] text-[10px] font-mono uppercase text-[#71839E]">
                <th className="py-2.5 px-3">Medication Pair</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Interaction Type</th>
                <th className="py-2.5 px-3">Mechanism Summary</th>
                <th className="py-2.5 px-3">Evidence Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {session.findings.map((item) => {
                const isSelected = selectedFinding?.id === item.id;
                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedFinding(item)}
                    className={`hover:bg-white/[0.03] transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#152238]/60 font-medium' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">
                        {item.drugAName} ⟷ {item.drugBName}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          item.severity === 'Contraindicated'
                            ? 'bg-[#F16D7B]/20 text-[#F16D7B] border border-[#F16D7B]/40'
                            : item.severity === 'Major'
                            ? 'bg-[#F2B961]/20 text-[#F2B961] border border-[#F2B961]/40'
                            : 'bg-[#31CAB6]/20 text-[#31CAB6] border border-[#31CAB6]/40'
                        }`}
                      >
                        {item.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#A6B5CB]">{item.interactionType}</td>
                    <td className="py-3 px-3 text-[#A6B5CB] max-w-md truncate">
                      {item.mechanism}
                    </td>
                    <td className="py-3 px-3 font-mono text-[#31CAB6] text-[11px]">
                      {item.evidenceStatus}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFinding(item);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#24D8ED]/10 text-[#24D8ED] hover:bg-[#24D8ED]/20 text-[11px] font-semibold transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
