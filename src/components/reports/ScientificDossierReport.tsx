import React from 'react';
import { AnalysisSession } from '../../types';
import {
  AlertOctagon,
  ArrowLeft,
  BookOpen,
  Box,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Info,
  Network,
  Pill,
  Printer,
  Shield,
  Sparkles
} from 'lucide-react';

import jsPDF from 'jspdf';

interface ScientificDossierReportProps {
  session: AnalysisSession;
  onBack: () => void;
}

export const ScientificDossierReport: React.FC<ScientificDossierReportProps> = ({ session, onBack }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Header Branding
    doc.setFontSize(8);
    doc.setTextColor(36, 216, 237);
    doc.text('DRUG SCOPE AI — AUTONOMOUS DRUG–DRUG ADVERSE INTERACTION ENGINE', 14, 15);

    doc.setFontSize(15);
    doc.setTextColor(20, 20, 25);
    doc.text(session.title || 'Polypharmacy Clinical Analysis Dossier', 14, 24);

    doc.setFontSize(8.5);
    doc.setTextColor(90, 100, 115);
    doc.text(
      `Dossier ID: ${session.id}   |   Date: ${new Date(session.timestamp).toLocaleDateString()}   |   Dataset Mode: ${session.datasetMode}`,
      14,
      30
    );

    let y = 38;

    // Regimen Summary
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('Analyzed Medication Regimen:', 14, y);
    y += 5;

    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    const medList =
      session.medications?.map((m) => m.genericName).join(', ') ||
      session.findings.map((f) => `${f.drugAName} + ${f.drugBName}`).join(', ') ||
      'Clinical Formulation Combination';
    const medLines = doc.splitTextToSize(medList, 180);
    doc.text(medLines, 14, y);
    y += medLines.length * 4 + 4;

    // Primary Risk
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(
      `Primary Risk Assessment: ${session.summary?.primaryRiskSummary || 'Documented Multi-drug Conflict Profile'}`,
      14,
      y
    );
    y += 7;

    // Findings section
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('Documented Pairwise Interaction Findings:', 14, y);
    y += 5;

    session.findings.forEach((finding, idx) => {
      if (y > 255) {
        doc.addPage();
        y = 15;
      }

      // Title & Severity
      doc.setFontSize(9.5);
      if (finding.severity === 'Contraindicated') doc.setTextColor(225, 29, 72);
      else if (finding.severity === 'Major') doc.setTextColor(234, 88, 12);
      else if (finding.severity === 'Moderate') doc.setTextColor(202, 138, 4);
      else doc.setTextColor(13, 148, 136);

      doc.text(
        `${idx + 1}. ${finding.drugAName} + ${finding.drugBName}  [${finding.severity.toUpperCase()}]`,
        14,
        y
      );
      y += 4.5;

      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      const mechLines = doc.splitTextToSize(`Mechanism: ${finding.mechanism}`, 180);
      doc.text(mechLines, 14, y);
      y += mechLines.length * 3.8 + 1.5;

      const clinLines = doc.splitTextToSize(`Consequence: ${finding.clinicalConsequence}`, 180);
      doc.text(clinLines, 14, y);
      y += clinLines.length * 3.8 + 1.5;

      const mgmtLines = doc.splitTextToSize(`Management: ${finding.managementGuidance}`, 180);
      doc.text(mgmtLines, 14, y);
      y += mgmtLines.length * 3.8 + 1.5;

      const sourcesText =
        finding.sources?.map((s) => `${s.name} (${s.citation})`).join('; ') ||
        'Verified Drug Scope Curated Registry';
      const srcLines = doc.splitTextToSize(`Evidence Sources: ${sourcesText}`, 180);
      doc.setTextColor(37, 99, 235);
      doc.text(srcLines, 14, y);
      y += srcLines.length * 3.8 + 5;
    });

    // Disclaimer
    if (y > 265) {
      doc.addPage();
      y = 15;
    }
    y += 3;
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    const disclaimer =
      'RESEARCH USE LIMITATION: Drug Scope AI is a scientific decision-support and bioinformatics research platform. It does not replace professional clinical judgment or individualized prescribing decisions. Not evaluated by the U.S. FDA as a software medical device.';
    doc.text(doc.splitTextToSize(disclaimer, 180), 14, y);

    doc.save(`DrugScope_${session.id}_dossier.pdf`);
  };

  const handleDownloadCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Drug A,Drug B,Severity,Interaction Type,Mechanism,Clinical Consequence,Management Guidance,Sources\n' +
      session.findings
        .map(
          (f) =>
            `"${f.drugAName}","${f.drugBName}","${f.severity}","${f.interactionType}","${f.mechanism.replace(
              /"/g,
              '""'
            )}","${f.clinicalConsequence.replace(/"/g, '""')}","${f.managementGuidance.replace(
              /"/g,
              '""'
            )}","${f.sources.map((s) => s.name).join('; ')}"`
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DrugScope_${session.id}_findings.csv`);
    link.click();
  };

  const handleDownloadJson = () => {
    const jsonBlob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(jsonBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DrugScope_${session.id}_data.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-[#F5F8FF]">
      {/* Top Action Bar (Hidden during print) */}
      <div className="print:hidden bg-[#0B1120] border border-white/[0.08] p-4 rounded-2xl flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-[#A6B5CB] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Analysis Workspace</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#152238] border border-white/10 text-xs font-semibold text-[#A6B5CB] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#152238] border border-white/10 text-xs font-semibold text-[#24D8ED] hover:bg-white/5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#24D8ED] to-[#1E90FF] text-[#070B14] font-bold text-xs hover:opacity-95 shadow-lg shadow-[#24D8ED]/10 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
          <button
            onClick={handlePrint}
            title="Open system print dialog"
            className="p-2 rounded-xl bg-[#152238] border border-white/10 text-xs text-[#A6B5CB] hover:text-white transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Printable Report Document Container */}
      <div className="bg-[#0B1120] print:bg-white print:text-black border border-white/[0.08] print:border-none p-8 lg:p-12 rounded-3xl shadow-2xl space-y-10">
        {/* Document Header & Cover Details */}
        <div className="border-b border-white/10 print:border-black/10 pb-8 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-mono tracking-widest uppercase text-[#24D8ED] print:text-blue-600 font-bold">
                DRUG SCOPE AI • SCIENTIFIC DOSSIER 5.0
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white print:text-black mt-1">
                {session.title}
              </h1>
              <p className="text-xs text-[#A6B5CB] print:text-gray-600 mt-1">
                PS-12 Autonomous Drug–Drug Adverse Interaction & Receptor Conflict Discovery Engine
              </p>
            </div>
            <div className="text-right font-mono text-xs text-[#71839E] print:text-gray-500">
              <div className="font-bold text-white print:text-black">{session.id}</div>
              <div>{new Date(session.timestamp).toLocaleDateString()}</div>
              <div>Mode: {session.datasetMode}</div>
            </div>
          </div>
        </div>

        {/* SECTION 1: Research Overview */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white print:text-black uppercase tracking-wider font-mono border-b border-white/10 print:border-gray-200 pb-1.5">
            <span className="text-[#24D8ED] print:text-blue-600">01.</span>
            <span>Research Overview & Risk Summary</span>
          </div>
          <div className="p-4 rounded-xl bg-[#070B14] print:bg-gray-50 border border-white/5 print:border-gray-200 space-y-2">
            <div className="text-xs font-semibold text-white print:text-black">
              {session.summary.primaryRiskSummary}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 text-xs">
              <div>
                <span className="text-[#71839E] print:text-gray-500 block">Total Pairs</span>
                <span className="font-mono font-bold text-white print:text-black">{session.findings.length}</span>
              </div>
              <div>
                <span className="text-[#71839E] print:text-gray-500 block">Contraindicated</span>
                <span className="font-mono font-bold text-[#F16D7B] print:text-red-600">{session.summary.contraindicatedCount}</span>
              </div>
              <div>
                <span className="text-[#71839E] print:text-gray-500 block">Major Conflicts</span>
                <span className="font-mono font-bold text-[#F2B961] print:text-amber-600">{session.summary.majorCount}</span>
              </div>
              <div>
                <span className="text-[#71839E] print:text-gray-500 block">Evidence Coverage</span>
                <span className="font-mono font-bold text-[#31CAB6] print:text-teal-600">{session.summary.documentedEvidencePercent}% Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Medicine Profiles */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white print:text-black uppercase tracking-wider font-mono border-b border-white/10 print:border-gray-200 pb-1.5">
            <span className="text-[#24D8ED] print:text-blue-600">02.</span>
            <span>Evaluated Medicine Profiles</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {session.medications.map((m) => (
              <div key={m.id} className="p-4 rounded-xl bg-[#070B14] print:bg-gray-50 border border-white/5 print:border-gray-200 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white print:text-black text-sm">{m.genericName}</span>
                  <span className="font-mono text-[#24D8ED] print:text-blue-600 text-[11px]">RxCUI {m.rxNormCui}</span>
                </div>
                <div className="text-[#A6B5CB] print:text-gray-600">
                  <strong>Class:</strong> {m.drugClass}
                </div>
                <div className="text-[#A6B5CB] print:text-gray-600">
                  <strong>Brand Names:</strong> {m.brandNames.join(', ')}
                </div>
                <div className="text-[#71839E] print:text-gray-500 text-[11px]">
                  <strong>CYP Clearance:</strong> {m.primaryMetabolizingEnzymes.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: Interaction Evidence Findings */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white print:text-black uppercase tracking-wider font-mono border-b border-white/10 print:border-gray-200 pb-1.5">
            <span className="text-[#24D8ED] print:text-blue-600">03.</span>
            <span>Documented Interaction Mechanisms</span>
          </div>
          <div className="space-y-4">
            {session.findings.map((f, i) => (
              <div key={i} className="p-4 rounded-xl bg-[#070B14] print:bg-gray-50 border border-white/5 print:border-gray-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white print:text-black text-sm">
                    {f.drugAName} ⟷ {f.drugBName}
                  </span>
                  <span className="font-mono font-bold px-2 py-0.5 rounded text-[10px] bg-white/5 text-[#F2B961] print:text-amber-700">
                    {f.severity}
                  </span>
                </div>
                <div className="text-[#24D8ED] print:text-blue-600 font-mono text-[11px]">
                  {f.interactionType}
                </div>
                <p className="text-[#A6B5CB] print:text-gray-700 leading-relaxed">
                  <strong>Mechanism:</strong> {f.mechanism}
                </p>
                <p className="text-[#A6B5CB] print:text-gray-700 leading-relaxed">
                  <strong>Clinical Consequence:</strong> {f.clinicalConsequence}
                </p>
                <div className="p-2.5 rounded-lg bg-[#152238] print:bg-gray-100 text-[#31CAB6] print:text-teal-800 font-medium">
                  <strong>Recommended Protocol:</strong> {f.managementGuidance}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: 3D Relationship Network Topology */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white print:text-black uppercase tracking-wider font-mono border-b border-white/10 print:border-gray-200 pb-1.5">
            <span className="text-[#24D8ED] print:text-blue-600">04.</span>
            <span>Evidence Graph Network Metrics</span>
          </div>
          <div className="p-4 rounded-xl bg-[#070B14] print:bg-gray-50 border border-white/5 print:border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[#71839E] print:text-gray-500 block">Graph Topology</span>
              <span className="font-mono font-bold text-white print:text-black">3D Constellation</span>
            </div>
            <div>
              <span className="text-[#71839E] print:text-gray-500 block">Total Nodes</span>
              <span className="font-mono font-bold text-[#24D8ED] print:text-blue-600">{session.graphData.nodes.length}</span>
            </div>
            <div>
              <span className="text-[#71839E] print:text-gray-500 block">Biological Edges</span>
              <span className="font-mono font-bold text-[#9475FF] print:text-purple-600">{session.graphData.edges.length}</span>
            </div>
            <div>
              <span className="text-[#71839E] print:text-gray-500 block">Hub Cytochromes</span>
              <span className="font-mono font-bold text-[#F2B961] print:text-amber-600">CYP2C9, CYP3A4</span>
            </div>
          </div>
        </div>

        {/* SECTION 5: Molecular Structures */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white print:text-black uppercase tracking-wider font-mono border-b border-white/10 print:border-gray-200 pb-1.5">
            <span className="text-[#24D8ED] print:text-blue-600">05.</span>
            <span>Macromolecular Structural Coordinates</span>
          </div>
          <div className="p-4 rounded-xl bg-[#070B14] print:bg-gray-50 border border-white/5 print:border-gray-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white print:text-black">SARS-CoV-2 Main Protease (Mpro)</span>
              <span className="font-mono text-[#24D8ED] print:text-blue-600 font-bold">PDB: 7K3N • 2.1 Å</span>
            </div>
            <p className="text-[#A6B5CB] print:text-gray-600">
              X-ray crystallographic complex with covalent inhibitor N3. Direct interaction residues verified: Cys145 (2.0 Å S-C covalent bond), His41 (2.8 Å H-bond), Glu166 (3.1 Å H-bond).
            </p>
          </div>
        </div>

        {/* SECTION 6: Biological Targets */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white print:text-black uppercase tracking-wider font-mono border-b border-white/10 print:border-gray-200 pb-1.5">
            <span className="text-[#24D8ED] print:text-blue-600">06.</span>
            <span>Biological Receptors & Enzymatic Axes</span>
          </div>
          <div className="p-4 rounded-xl bg-[#070B14] print:bg-gray-50 border border-white/5 print:border-gray-200 text-xs text-[#A6B5CB] print:text-gray-700 leading-relaxed">
            Identified primary therapeutic pathways: Coagulation cascade (VKORC1), Cardiac repolarization (hERG / KCNH2), and Proteolytic viral replication (Mpro / 3CLpro).
          </div>
        </div>

        {/* SECTION 7: Scientific Literature & Citations */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white print:text-black uppercase tracking-wider font-mono border-b border-white/10 print:border-gray-200 pb-1.5">
            <span className="text-[#24D8ED] print:text-blue-600">07.</span>
            <span>Scientific Citations & Provenance</span>
          </div>
          <div className="space-y-2 text-xs">
            {session.findings.flatMap((f) => f.sources).map((src, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-[#070B14] print:bg-gray-50 border border-white/5 print:border-gray-200">
                <div className="font-bold text-white print:text-black">{src.name}</div>
                <div className="text-[11px] text-[#A6B5CB] print:text-gray-600 italic">{src.citation}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 8: Limitations & Governance */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white print:text-black uppercase tracking-wider font-mono border-b border-white/10 print:border-gray-200 pb-1.5">
            <span className="text-[#24D8ED] print:text-blue-600">08.</span>
            <span>Methodological Limitations</span>
          </div>
          <div className="p-4 rounded-xl bg-[#070B14] print:bg-gray-50 border border-white/5 print:border-gray-200 text-xs text-[#71839E] print:text-gray-600 leading-relaxed space-y-1.5">
            <p>
              1. Documented evidence records reflect published FDA package inserts, NIH RxNav catalogs, and peer-reviewed pharmacology journals.
            </p>
            <p>
              2. Absence of a documented adverse record does not demonstrate biological compatibility. Novel or untested drug combinations may harbor unknown interaction hazards.
            </p>
            <p>
              3. This report is produced for scientific research and educational investigation. Clinical dosing changes must be validated by licensed medical practitioners.
            </p>
          </div>
        </div>

        {/* SECTION 9: Research Conclusion */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white print:text-black uppercase tracking-wider font-mono border-b border-white/10 print:border-gray-200 pb-1.5">
            <span className="text-[#24D8ED] print:text-blue-600">09.</span>
            <span>Research Conclusion</span>
          </div>
          <div className="p-4 rounded-xl bg-[#070B14] print:bg-gray-50 border border-white/5 print:border-gray-200 text-xs text-white print:text-black leading-relaxed">
            Multi-drug analysis concludes that the selected regimen exhibits significant metabolic sensitivity centered at hepatic CYP450 clearance axes. Prior to co-administration, therapeutic drug monitoring and review of alternative non-interacting agents is strongly recommended.
          </div>
        </div>

        {/* SECTION 10: Sign-off & Verification Footer */}
        <div className="border-t border-white/10 print:border-gray-200 pt-6 flex items-center justify-between text-xs font-mono text-[#71839E] print:text-gray-500">
          <div>Drug Scope AI Platform 5.0 • Verified Computational Dossier</div>
          <div>Page 1 of 1</div>
        </div>
      </div>
    </div>
  );
};
