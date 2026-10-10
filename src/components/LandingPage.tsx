import React from 'react';
import { HeroMolecule } from './3d/HeroMolecule';
import {
  ArrowRight,
  BookOpen,
  Boxes,
  CheckCircle2,
  Database,
  ExternalLink,
  FileText,
  GitCompare,
  Search,
  ShieldCheck,
  Sparkles,
  Zap
} from 'lucide-react';

interface LandingPageProps {
  onLaunch: (moduleId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunch }) => {
  return (
    <div className="space-y-16 pb-24 select-none">
      {/* SECTION 1: HERO VIEWPORT */}
      <section className="pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column (6/12): Clear, focused value proposition */}
          <div className="lg:col-span-6 space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1A32]/80 border border-[#9475FF]/30 text-xs font-mono text-[#9475FF]">
              <Sparkles className="w-3.5 h-3.5 text-[#9475FF]" />
              <span className="font-semibold tracking-wide uppercase text-[11px]">
                Autonomous Biomedical Discovery Engine • v7.0
              </span>
            </div>

            {/* Display Headline */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-display font-extrabold text-white tracking-tight leading-[1.08]">
                Drug Scope <span className="bg-gradient-to-r from-[#24D8ED] to-[#9475FF] bg-clip-text text-transparent">AI</span>
              </h1>
              <p className="text-xl sm:text-2xl font-display font-semibold text-[#E2E8F0] leading-snug">
                Explore medicines, understand interactions, and investigate molecular evidence through real scientific data and immersive 3D visualization.
              </p>
            </div>

            {/* Concise Product Description */}
            <p className="text-sm text-[#A6B5CB] leading-relaxed max-w-xl">
              Engineered for clinical pharmacologists, biomedical researchers, and physicians. Uncover pairwise adverse interactions, competitive CYP450 enzyme bottlenecks, and receptor conflicts grounded strictly in openFDA drug labels, NIH PubMed literature, and RCSB macromolecular crystal structures.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                onClick={() => onLaunch('analyze')}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#24D8ED] to-[#1E90FF] text-[#070B14] font-bold text-xs hover:opacity-95 transition-all shadow-[0_0_25px_rgba(36,216,237,0.4)] cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Analyze Medicines</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onLaunch('molecular-lab')}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#111C2E]/90 border border-white/10 hover:border-[#9475FF]/40 text-xs font-semibold text-white transition-all cursor-pointer"
              >
                <Boxes className="w-4 h-4 text-[#9475FF]" />
                <span>Open 3D Molecular Lab</span>
              </button>
            </div>

            {/* Real Source Provenance Bar */}
            <div className="pt-4 flex items-center gap-5 border-t border-white/[0.08] text-[11px] font-mono text-[#71839E]">
              <span className="text-[#A6B5CB] font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#31CAB6]" /> Live Connectors:
              </span>
              <span className="text-white hover:text-[#24D8ED] transition-colors">openFDA API</span>
              <span>•</span>
              <span className="text-white hover:text-[#24D8ED] transition-colors">NIH PubMed</span>
              <span>•</span>
              <span className="text-white hover:text-[#24D8ED] transition-colors">NLM RxNorm</span>
              <span>•</span>
              <span className="text-white hover:text-[#24D8ED] transition-colors">RCSB PDB</span>
            </div>
          </div>

          {/* Right Column (6/12): 3D Molecular Viewport */}
          <div className="lg:col-span-6 relative">
            <HeroMolecule onOpenLab={() => onLaunch('molecular-lab')} />
          </div>
        </div>
      </section>

      {/* SECTION 2: 4 ESSENTIAL CAPABILITY CARDS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-display font-bold text-white">Core Research Capabilities</h2>
            <p className="text-xs text-[#71839E]">Direct entry points into the primary scientific workflows</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Medicine Analysis */}
          <div
            onClick={() => onLaunch('analyze')}
            className="glass-card p-5 rounded-2xl cursor-pointer flex flex-col justify-between space-y-4 hover:border-[#24D8ED]/40 transition-all group"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#24D8ED]/10 border border-[#24D8ED]/30 flex items-center justify-center text-[#24D8ED] group-hover:scale-105 transition-transform">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#24D8ED]/10 text-[#24D8ED] border border-[#24D8ED]/20">
                  Primary Flow
                </span>
              </div>
              <h3 className="font-display font-bold text-sm text-white group-hover:text-[#24D8ED] transition-colors">
                Medicine Analysis
              </h3>
              <p className="text-xs text-[#A6B5CB] leading-relaxed">
                Input multi-drug regimens with clinical context. Resolves RxNorm IDs, parses openFDA warnings, and flags CYP conflicts.
              </p>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-[#24D8ED]">
              <span>Launch Analysis</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Interaction Review */}
          <div
            onClick={() => onLaunch('interaction-review')}
            className="glass-card p-5 rounded-2xl cursor-pointer flex flex-col justify-between space-y-4 hover:border-[#9475FF]/40 transition-all group"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#9475FF]/10 border border-[#9475FF]/30 flex items-center justify-center text-[#9475FF] group-hover:scale-105 transition-transform">
                  <GitCompare className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#9475FF]/10 text-[#9475FF] border border-[#9475FF]/20">
                  Pharmacology
                </span>
              </div>
              <h3 className="font-display font-bold text-sm text-white group-hover:text-[#9475FF] transition-colors">
                Interaction Review
              </h3>
              <p className="text-xs text-[#A6B5CB] leading-relaxed">
                Inspect pairwise drug-drug adverse relationships, pharmacokinetic enzyme competition, and receptor conflict pathways.
              </p>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-[#9475FF]">
              <span>Review Findings</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: 3D Molecular Exploration */}
          <div
            onClick={() => onLaunch('molecular-lab')}
            className="glass-card p-5 rounded-2xl cursor-pointer flex flex-col justify-between space-y-4 hover:border-[#31CAB6]/40 transition-all group"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#31CAB6]/10 border border-[#31CAB6]/30 flex items-center justify-center text-[#31CAB6] group-hover:scale-105 transition-transform">
                  <Boxes className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#31CAB6]/10 text-[#31CAB6] border border-[#31CAB6]/20">
                  Interactive 3D
                </span>
              </div>
              <h3 className="font-display font-bold text-sm text-white group-hover:text-[#31CAB6] transition-colors">
                3D Molecular Exploration
              </h3>
              <p className="text-xs text-[#A6B5CB] leading-relaxed">
                Full-viewport inspection of macromolecular crystal structures from RCSB PDB with customizable rendering representations.
              </p>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-[#31CAB6]">
              <span>Enter 3D Lab</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Scientific Literature Intelligence */}
          <div
            onClick={() => onLaunch('literature-intel')}
            className="glass-card p-5 rounded-2xl cursor-pointer flex flex-col justify-between space-y-4 hover:border-[#24D8ED]/40 transition-all group"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#24D8ED]/10 border border-[#24D8ED]/30 flex items-center justify-center text-[#24D8ED] group-hover:scale-105 transition-transform">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#24D8ED]/10 text-[#24D8ED] border border-[#24D8ED]/20">
                  PubMed Grounding
                </span>
              </div>
              <h3 className="font-display font-bold text-sm text-white group-hover:text-[#24D8ED] transition-colors">
                Literature Intelligence
              </h3>
              <p className="text-xs text-[#A6B5CB] leading-relaxed">
                Search verified peer-reviewed articles from the National Center for Biotechnology Information (NCBI) with DOI & PMID citations.
              </p>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-[#24D8ED]">
              <span>Query Literature</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: PRODUCT WORKFLOW PREVIEW (Section 5 requirement) */}
      <section className="p-8 rounded-3xl bg-[#09101E] border border-white/10 space-y-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111C2E] border border-[#24D8ED]/30 text-xs font-mono text-[#24D8ED] mb-3">
            <Sparkles className="w-3 h-3" />
            <span className="font-semibold uppercase text-[10px]">End-to-End Workflow</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-white">
            From Medicine Input to Peer-Reviewed Clinical Dossier
          </h2>
          <p className="text-xs text-[#A6B5CB] mt-1">
            A structured four-step journey designed to eliminate clinical blind spots and deliver actionable pharmacological evidence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Step 1 */}
          <div className="p-5 rounded-2xl bg-[#0F1829] border border-white/5 space-y-3 relative overflow-hidden group">
            <div className="text-2xl font-mono font-bold text-[#24D8ED]/30">01</div>
            <div className="font-display font-bold text-sm text-white">Search Medicines</div>
            <p className="text-xs text-[#A6B5CB] leading-relaxed">
              Add brand or generic drug names. Instant RxNorm identifier mapping and multi-drug combo selection.
            </p>
            <div className="pt-2 text-[10px] font-mono text-[#24D8ED]">RxNorm API Resolution</div>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-2xl bg-[#0F1829] border border-white/5 space-y-3 relative overflow-hidden group">
            <div className="text-2xl font-mono font-bold text-[#9475FF]/30">02</div>
            <div className="font-display font-bold text-sm text-white">Analyze Evidence</div>
            <p className="text-xs text-[#A6B5CB] leading-relaxed">
              Synthesize FDA Boxed Warnings, adverse event frequencies, and pharmacokinetic CYP competition.
            </p>
            <div className="pt-2 text-[10px] font-mono text-[#9475FF]">openFDA Drug Label Parsing</div>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-2xl bg-[#0F1829] border border-white/5 space-y-3 relative overflow-hidden group">
            <div className="text-2xl font-mono font-bold text-[#31CAB6]/30">03</div>
            <div className="font-display font-bold text-sm text-white">Explore 3D Relationships</div>
            <p className="text-xs text-[#A6B5CB] leading-relaxed">
              Inspect macromolecular binding pockets, CYP enzymes, and 3D evidence network topology interactively.
            </p>
            <div className="pt-2 text-[10px] font-mono text-[#31CAB6]">RCSB PDB Crystal Models</div>
          </div>

          {/* Step 4 */}
          <div className="p-5 rounded-2xl bg-[#0F1829] border border-white/5 space-y-3 relative overflow-hidden group">
            <div className="text-2xl font-mono font-bold text-[#E2E8F0]/30">04</div>
            <div className="font-display font-bold text-sm text-white">Export Dossier</div>
            <p className="text-xs text-[#A6B5CB] leading-relaxed">
              Generate 10-section publication-ready clinical dossiers with PDF printing, CSV matrices, and audit logs.
            </p>
            <div className="pt-2 text-[10px] font-mono text-[#E2E8F0]">PDF & CSV Export Studio</div>
          </div>
        </div>
      </section>

      {/* SECTION 4: REAL SOURCE TRUST PROVIDERS (Section 5 requirement) */}
      <section className="p-8 rounded-3xl bg-[#0B1220] border border-white/10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#31CAB6]" />
              <span>Grounded in Original Biomedical Repositories</span>
            </h2>
            <p className="text-xs text-[#A6B5CB] mt-1">
              Drug Scope AI avoids hallucinatory claims by tethering every inference to primary authoritative databases.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#31CAB6] bg-[#31CAB6]/10 px-3 py-1.5 rounded-full border border-[#31CAB6]/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% Provenance-Backed</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-[#070B14] border border-white/5 space-y-1.5">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>openFDA</span>
              <ExternalLink className="w-3 h-3 text-[#71839E]" />
            </div>
            <p className="text-[11px] text-[#71839E]">Official FDA drug labeling, boxed warnings & FAERS adverse reporting.</p>
          </div>

          <div className="p-4 rounded-xl bg-[#070B14] border border-white/5 space-y-1.5">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>NIH NLM RxNorm</span>
              <ExternalLink className="w-3 h-3 text-[#71839E]" />
            </div>
            <p className="text-[11px] text-[#71839E]">Standardized clinical drug naming and semantic RxCUI identifiers.</p>
          </div>

          <div className="p-4 rounded-xl bg-[#070B14] border border-white/5 space-y-1.5">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>PubMed / NCBI</span>
              <ExternalLink className="w-3 h-3 text-[#71839E]" />
            </div>
            <p className="text-[11px] text-[#71839E]">Peer-reviewed biomedical literature abstracts, PMIDs, and DOIs.</p>
          </div>

          <div className="p-4 rounded-xl bg-[#070B14] border border-white/5 space-y-1.5">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>RCSB PDB</span>
              <ExternalLink className="w-3 h-3 text-[#71839E]" />
            </div>
            <p className="text-[11px] text-[#71839E]">High-resolution 3D macromolecular crystal coordinates and ligand structures.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
