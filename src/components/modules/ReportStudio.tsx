import React, { useState } from 'react';
import { PAIRWISE_INTERACTIONS } from '../../data/mockInteractions';
import { VERIFIED_DRUGS } from '../../data/mockDrugs';
import { DATA_SOURCES } from '../../data/mockSources';
import {
  Download,
  FileCheck,
  FileText,
  Printer,
  Shield,
  Sparkles
} from 'lucide-react';

export const ReportStudio: React.FC = () => {
  const [reportType, setReportType] = useState('Drug Interaction Evidence Report');
  const [selectedPair, setSelectedPair] = useState(PAIRWISE_INTERACTIONS[0]);
  const [reportId] = useState(`DSA-REP-${Date.now().toString().slice(-6)}`);

  const reportCategories = [
    'Drug Interaction Evidence Report',
    'Medication Evidence Review',
    'Molecular Target Research',
    'Receptor Relationship Analysis',
    'Literature Evidence Review',
    'Adverse-Event Signal Research',
    'Evidence Contradiction Report',
    'Research Hypothesis Report',
    'Scientific Project Summary'
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Drug A,Drug B,Severity,Interaction Type,Mechanism,Clinical Consequence,Sources\n' +
      PAIRWISE_INTERACTIONS.map(
        (i) =>
          `"${i.drugAName}","${i.drugBName}","${i.severity}","${i.interactionType}","${i.mechanism.replace(
            /"/g,
            '""'
          )}","${i.clinicalConsequence.replace(/"/g, '""')}","${i.primarySources
            .map((s) => s.name)
            .join('; ')}"`
      ).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DrugScope_${reportId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJson = () => {
    const exportData = {
      reportId,
      reportTitle: reportType,
      engine: 'DRUG SCOPE AI 4.0 (PS-12 Autonomous Engine)',
      generatedAt: new Date().toISOString(),
      datasetVersion: '4.0.0-RELEASE',
      institution: 'Drug Scope AI Computational Pharmacology Network',
      subjectPair: selectedPair,
      activeSources: DATA_SOURCES.map((s) => ({ name: s.name, provider: s.provider, latency: s.latencyMs })),
      limitationsDisclosure: 'All findings sourced from official FDA SPL, RxNav, and peer-reviewed literature. No unverified probabilistic clinical outcomes.'
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute('href', dataStr);
    dl.setAttribute('download', `DrugScope_${reportId}.json`);
    dl.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Export Controls */}
      <div className="glass-panel p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#37D6E6]" />
            Professional Scientific Report Studio
          </h1>
          <p className="text-xs text-[#A7B5C9] mt-1">
            Produce publication-ready clinical dossiers and reproducible evidence summaries with full source citations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#172134] text-xs text-[#37D6E6] border border-[#37D6E6]/30 hover:bg-[#37D6E6]/10 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#172134] text-xs text-[#9079F7] border border-[#9079F7]/30 hover:bg-[#9079F7]/10 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export JSON
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#37D6E6] text-[#070B14] font-semibold text-xs hover:bg-[#37D6E6]/90 transition-all shadow-md"
          >
            <Printer className="w-3.5 h-3.5" /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Template Chooser Bar */}
      <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#64748B]">Template:</span>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="bg-[#070B14] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-[#37D6E6]/40"
          >
            {reportCategories.map((c, idx) => (
              <option key={idx} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#64748B]">Evidence Target:</span>
          <select
            value={selectedPair.id}
            onChange={(e) => {
              const p = PAIRWISE_INTERACTIONS.find((i) => i.id === e.target.value);
              if (p) setSelectedPair(p);
            }}
            className="bg-[#070B14] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#37D6E6]/40"
          >
            {PAIRWISE_INTERACTIONS.map((i) => (
              <option key={i.id} value={i.id}>
                {i.drugAName} ↔ {i.drugBName} ({i.severity})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Live Printable Report Sheet */}
      <div className="p-8 md:p-12 rounded-2xl bg-[#0D131F] border border-white/15 text-white space-y-8 shadow-2xl max-w-4xl mx-auto print:bg-white print:text-black print:border-none print:shadow-none">
        {/* Document Header */}
        <div className="border-b border-white/15 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-display font-extrabold text-xl text-white tracking-wide">
                DRUG SCOPE <span className="text-[#37D6E6]">AI</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#37D6E6]/10 text-[#37D6E6] border border-[#37D6E6]/30">
                CLINICAL EVIDENCE DOSSIER
              </span>
            </div>
            <h2 className="text-lg font-display font-bold text-white mt-1">
              {reportType}
            </h2>
            <p className="text-xs text-[#A7B5C9] font-mono mt-0.5">
              Subject Analysis: {selectedPair.drugAName} & {selectedPair.drugBName}
            </p>
          </div>

          <div className="text-right text-xs font-mono space-y-1">
            <div className="text-[#37D6E6] font-bold">Report ID: {reportId}</div>
            <div className="text-[#A7B5C9]">Date: {new Date().toLocaleDateString()}</div>
            <div className="text-[#64748B]">Engine: PS-12 Autonomous 4.0</div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#37D6E6] font-bold">
            1. Executive Pharmacological Summary
          </h3>
          <p className="text-xs text-[#F4F7FB] leading-relaxed">
            Co-administration of <strong>{selectedPair.drugAName}</strong> and{' '}
            <strong>{selectedPair.drugBName}</strong> presents a validated{' '}
            <span className="font-bold text-[#F16D76]">{selectedPair.severity} severity</span>{' '}
            {selectedPair.interactionType.toLowerCase()} interaction. Mechanistic review confirms{' '}
            {selectedPair.mechanism}
          </p>
        </div>

        {/* Pharmacological Breakdown Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#9079F7] font-bold">
            2. Pharmacokinetic & Dynamic Conflict Metrics
          </h3>
          <div className="border border-white/10 rounded-lg overflow-hidden text-xs">
            <div className="grid grid-cols-2 p-3 bg-white/5 border-b border-white/10 font-mono">
              <span className="text-[#64748B]">Interaction Classification:</span>
              <span className="font-bold text-[#F16D76]">{selectedPair.severity}</span>
            </div>
            <div className="grid grid-cols-2 p-3 border-b border-white/10 font-mono">
              <span className="text-[#64748B]">Interaction Domain:</span>
              <span className="text-white">{selectedPair.interactionType}</span>
            </div>
            <div className="grid grid-cols-2 p-3 bg-white/5 border-b border-white/10 font-mono">
              <span className="text-[#64748B]">Evidence Status:</span>
              <span className="text-[#32C8B7] font-bold">{selectedPair.evidenceStatus}</span>
            </div>
            <div className="grid grid-cols-2 p-3 font-mono">
              <span className="text-[#64748B]">Enzyme / Transporter Conflict:</span>
              <span className="text-[#37D6E6]">{selectedPair.enzymeConflicts.join(', ')}</span>
            </div>
          </div>
        </div>

        {/* Clinical Consequences & Guidance */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#F16D76] font-bold">
            3. Adverse Clinical Risk & Patient Management Protocol
          </h3>
          <div className="p-4 rounded-xl bg-[#F16D76]/10 border border-[#F16D76]/25 space-y-2 text-xs">
            <div className="font-semibold text-white">Anticipated In Vivo Event:</div>
            <p className="text-[#F4F7FB] leading-relaxed">{selectedPair.clinicalConsequence}</p>
            <div className="pt-2 font-semibold text-[#32C8B7]">Interventional Guidance:</div>
            <p className="text-[#F4F7FB] leading-relaxed">{selectedPair.managementGuidance}</p>
          </div>
        </div>

        {/* Primary Citations */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#64748B] font-bold">
            4. Verified Source Provenance & Citations
          </h3>
          <div className="space-y-1.5 text-xs">
            {selectedPair.primarySources.map((s, idx) => (
              <div key={idx} className="p-2 rounded bg-white/5 font-mono text-[#A7B5C9]">
                <strong className="text-white">[{idx + 1}] {s.name}</strong> — {s.citation}
              </div>
            ))}
          </div>
        </div>

        {/* Scientific Limitations Footer */}
        <div className="border-t border-white/10 pt-4 text-[10px] text-[#64748B] font-mono flex items-center justify-between">
          <span>Drug Scope AI 4.0 • Research Verification Standard</span>
          <span>Not intended as unverified medical substitution</span>
        </div>
      </div>
    </div>
  );
};
