import React from 'react';
import { HeroMolecule } from './3d/HeroMolecule';
import {
  Activity,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Compass,
  Database,
  FileCheck,
  FileText,
  GitCompare,
  HeartPulse,
  Layers,
  Network,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface LandingPageProps {
  onLaunch: (moduleId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunch }) => {
  return (
    <div className="space-y-16 pb-16">
      {/* SECTION 1: HERO WITH 3D MOLECULE */}
      <section className="relative overflow-hidden pt-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#172134] border border-[#37D6E6]/30 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-[#37D6E6] animate-pulse" />
              <span className="text-[#37D6E6] font-bold">DRUG SCOPE AI 4.0</span>
              <span className="text-white/40">|</span>
              <span className="text-[#A7B5C9]">PS-12 Autonomous Engine</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white tracking-tight leading-[1.15]">
              Autonomous Drug–Drug Adverse Interaction & Receptor Conflict Discovery
            </h1>

            <p className="text-base text-[#A7B5C9] leading-relaxed max-w-2xl">
              <strong className="text-white">Explore Drugs. Understand Interactions. Discover Molecular Evidence.</strong>{' '}
              A world-class computational pharmacology and structural biology workstation connecting FDA structured product labeling, 
              RxNorm concepts, RCSB 3D macromolecules, and PubMed literature to prevent lethal polypharmacy conflicts.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => onLaunch('medicine-explorer')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#37D6E6] text-[#070B14] font-bold text-xs hover:bg-[#37D6E6]/90 transition-all shadow-xl"
              >
                <Compass className="w-4 h-4" /> Explore Medicines
              </button>
              <button
                onClick={() => onLaunch('command-center')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#172134] text-white border border-white/10 hover:border-[#37D6E6]/40 font-semibold text-xs transition-all"
              >
                <Activity className="w-4 h-4 text-[#37D6E6]" /> Launch Research Workspace
              </button>
              <button
                onClick={() => onLaunch('molecular-lab')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#172134] text-white border border-[#9079F7]/40 hover:border-[#9079F7] font-semibold text-xs transition-all text-[#9079F7]"
              >
                <Boxes className="w-4 h-4 text-[#9079F7]" /> View 3D Molecular Lab
              </button>
            </div>

            {/* Factual Credibility Badges */}
            <div className="pt-4 grid grid-cols-3 gap-3 border-t border-white/10 max-w-lg">
              <div>
                <div className="font-mono text-lg font-bold text-white">NIH RxNav</div>
                <div className="text-[10px] text-[#64748B] font-mono">Live Terminology</div>
              </div>
              <div>
                <div className="font-mono text-lg font-bold text-[#37D6E6]">RCSB PDB</div>
                <div className="text-[10px] text-[#64748B] font-mono">3D Cryo-EM & X-Ray</div>
              </div>
              <div>
                <div className="font-mono text-lg font-bold text-[#32C8B7]">openFDA</div>
                <div className="text-[10px] text-[#64748B] font-mono">Verified SPL & FAERS</div>
              </div>
            </div>
          </div>

          {/* Right Hero Column: Interactive 3D WebGL Canvas */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl bg-gradient-to-br from-[#101827] via-[#172134] to-[#070B14] border border-white/10 shadow-2xl overflow-hidden p-2">
              <HeroMolecule />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: SCIENTIFIC CAPABILITIES */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[10px] font-mono text-[#37D6E6] uppercase tracking-widest font-bold">
            Built for Computational Pharmacologists & Clinical Specialists
          </span>
          <h2 className="text-2xl font-display font-bold text-white">
            Comprehensive Evidence Architecture
          </h2>
          <p className="text-xs text-[#A7B5C9]">
            Every asserted drug conflict is grounded in verified crystallographic or regulatory evidence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="glass-card p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#37D6E6]/10 border border-[#37D6E6]/30 flex items-center justify-center text-[#37D6E6]">
              <GitCompare className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-white">
              CYP450 Enzyme Competition
            </h3>
            <p className="text-xs text-[#A7B5C9] leading-relaxed">
              Detects competitive, non-competitive, and mechanism-based suicide inhibition across CYP2C9, CYP3A4, CYP2C19, and CYP2D6 isoforms with active enantiomeric specificity.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#9079F7]/10 border border-[#9079F7]/30 flex items-center justify-center text-[#9079F7]">
              <Boxes className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-white">
              Crystallographic 3D Validation
            </h3>
            <p className="text-xs text-[#A7B5C9] leading-relaxed">
              Direct integration with RCSB Protein Data Bank. Inspect real Angstrom-level coordinates, binding pockets, covalent bonds, and ligand steric clashes in interactive WebGL.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#32C8B7]/10 border border-[#32C8B7]/30 flex items-center justify-center text-[#32C8B7]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-white">
              Post-Marketing FAERS Signals
            </h3>
            <p className="text-xs text-[#A7B5C9] leading-relaxed">
              Real-world surveillance tracking Proportional Reporting Ratios (PRR) and Reporting Odds Ratios (ROR) across millions of de-duplicated adverse event submissions.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: DATA SOURCE TRANSPARENCY */}
      <section className="glass-panel p-8 rounded-2xl border border-white/10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono text-[#32C8B7] uppercase tracking-wider font-bold">
              Provenance Transparency
            </span>
            <h2 className="text-xl font-display font-bold text-white mt-1">
              Authoritative Biomedical Data Providers
            </h2>
          </div>
          <button
            onClick={() => onLaunch('source-admin')}
            className="text-xs text-[#37D6E6] hover:underline flex items-center gap-1 font-mono font-medium"
          >
            Inspect Source SLAs & Handshakes →
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#070B14]/80 border border-white/5 space-y-1">
            <div className="font-mono text-[#37D6E6] font-bold">NIH RxNav</div>
            <div className="text-white font-medium">U.S. National Library of Medicine</div>
            <div className="text-[10px] text-[#64748B] font-mono">RxCUI Normalization</div>
          </div>

          <div className="p-4 rounded-xl bg-[#070B14]/80 border border-white/5 space-y-1">
            <div className="font-mono text-[#32C8B7] font-bold">openFDA SPL</div>
            <div className="text-white font-medium">U.S. Food & Drug Administration</div>
            <div className="text-[10px] text-[#64748B] font-mono">Structured Product Labels</div>
          </div>

          <div className="p-4 rounded-xl bg-[#070B14]/80 border border-white/5 space-y-1">
            <div className="font-mono text-[#9079F7] font-bold">RCSB PDB</div>
            <div className="text-white font-medium">Worldwide Protein Data Bank</div>
            <div className="text-[10px] text-[#64748B] font-mono">3D Macromolecular Files</div>
          </div>

          <div className="p-4 rounded-xl bg-[#070B14]/80 border border-white/5 space-y-1">
            <div className="font-mono text-[#EFB85A] font-bold">NCBI PubMed</div>
            <div className="text-white font-medium">Entrez Biomedical Index</div>
            <div className="text-[10px] text-[#64748B] font-mono">Clinical Literature Citations</div>
          </div>
        </div>
      </section>

      {/* SECTION 4: CALL TO ACTION */}
      <section className="text-center space-y-4 py-8">
        <h2 className="text-2xl font-display font-extrabold text-white">
          Ready to Investigate Polypharmacy Conflicts?
        </h2>
        <p className="text-xs text-[#A7B5C9] max-w-lg mx-auto">
          Launch the Drug Scope AI research engine to explore multi-drug regimens, resolve 3D PDB crystallographic models, and export verified clinical reports.
        </p>
        <button
          onClick={() => onLaunch('command-center')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#37D6E6] to-[#32C8B7] text-[#070B14] font-bold text-xs hover:opacity-95 transition-all shadow-xl"
        >
          Enter Scientific Command Center <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
};
