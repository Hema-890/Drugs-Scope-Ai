import React from 'react';
import { HeroMolecule } from './3d/HeroMolecule';
import {
  ArrowRight,
  Boxes,
  Compass,
  Database,
  FileText,
  GitCompare,
  Network,
  Sparkles
} from 'lucide-react';

interface LandingPageProps {
  onLaunch: (moduleId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunch }) => {
  return (
    <div className="space-y-16 pb-20 select-none">
      {/* SECTION 1: HERO VIEWPORT (Matching Reference Image 1) */}
      <section className="pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column (7/12): Narrative, Badges, CTAs, and Metrics */}
          <div className="lg:col-span-6 space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1A32]/80 border border-[#9475FF]/30 text-xs font-mono text-[#9475FF]">
              <Sparkles className="w-3.5 h-3.5 text-[#9475FF]" />
              <span className="font-semibold tracking-wide uppercase text-[11px]">
                AI-Powered Biomedical Research Platform
              </span>
            </div>

            {/* Display Headline */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-display font-extrabold text-white tracking-tight leading-[1.1]">
                Drug Scope <span className="bg-gradient-to-r from-[#24D8ED] to-[#9475FF] bg-clip-text text-transparent">AI</span>
              </h1>
              <div className="text-2xl sm:text-3xl xl:text-4xl font-display font-bold text-[#F5F8FF] leading-snug">
                Explore Drugs. Understand Interactions. Discover Molecular Evidence.
              </div>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-[#A6B5CB] leading-relaxed max-w-xl">
              An advanced AI platform for biomedical research, combining real-world drug evidence, interaction analysis, and 3D molecular visualization to accelerate scientific discovery.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onLaunch('command-center')}
                className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-[#24D8ED] to-[#1E90FF] text-[#070B14] font-bold text-xs hover:opacity-95 transition-all shadow-[0_0_20px_rgba(36,216,237,0.4)] cursor-pointer"
              >
                <span>Launch Research Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onLaunch('molecular-lab')}
                className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#111C2E]/80 border border-white/10 hover:border-[#9475FF]/40 text-xs font-semibold text-white transition-all cursor-pointer"
              >
                <Boxes className="w-4 h-4 text-[#9475FF]" />
                <span>Open 3D Molecular Lab</span>
              </button>
            </div>

            {/* Metric Statistics Strip (Matching Reference Image 1) */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/[0.08]">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-[#24D8ED] font-mono text-sm font-bold">|</span>
                  <span className="font-display font-bold text-xl text-white">120M+</span>
                </div>
                <div className="text-[11px] text-[#71839E] font-medium mt-0.5">
                  Drug & bioactive compounds
                </div>
              </div>

              <div>
                <div className="font-display font-bold text-xl text-white">8M+</div>
                <div className="text-[11px] text-[#71839E] font-medium mt-0.5">
                  Peer-reviewed studies
                </div>
              </div>

              <div>
                <div className="font-display font-bold text-xl text-white">2.5M+</div>
                <div className="text-[11px] text-[#71839E] font-medium mt-0.5">
                  Drug interaction records
                </div>
              </div>

              <div>
                <div className="font-display font-bold text-xl text-white">50K+</div>
                <div className="text-[11px] text-[#71839E] font-medium mt-0.5">
                  3D molecular structures
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (6/12): 3D Molecular Viewport with Floating HUDs */}
          <div className="lg:col-span-6 relative">
            <HeroMolecule onOpenLab={() => onLaunch('molecular-lab')} />
          </div>
        </div>
      </section>

      {/* SECTION 2: 4 BELOW-HERO FEATURE CARDS (Matching Reference Image 1) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Real Drug Evidence */}
        <div
          onClick={() => onLaunch('medicine-explorer')}
          className="glass-card p-5 rounded-2xl cursor-pointer flex flex-col justify-between space-y-4 hover:border-[#24D8ED]/40 transition-all group"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#24D8ED]/10 border border-[#24D8ED]/30 flex items-center justify-center text-[#24D8ED]">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="font-display font-bold text-sm text-white">
                Real Drug Evidence
              </h3>
            </div>
            <p className="text-xs text-[#A6B5CB] leading-relaxed">
              Access curated data from clinical trials, publications, and real-world evidence.
            </p>
          </div>

          {/* Mini UI Snippet */}
          <div className="p-2.5 rounded-xl bg-[#070B14]/70 border border-white/5 space-y-1.5 text-[10px] font-mono">
            <div className="flex items-center justify-between text-[#A6B5CB]">
              <span>Clinical Trials</span>
              <span className="text-[#24D8ED]">Phase III NCT04515120</span>
            </div>
            <div className="flex items-center justify-between text-[#A6B5CB]">
              <span>PubMed</span>
              <span className="text-[#31CAB6]">1,240 results</span>
            </div>
            <div className="flex items-center justify-between text-[#A6B5CB]">
              <span>Real-World Evidence</span>
              <span className="text-[#9475FF]">RWE datasets</span>
            </div>
          </div>
        </div>

        {/* Card 2: Interaction Analysis */}
        <div
          onClick={() => onLaunch('interaction-review')}
          className="glass-card p-5 rounded-2xl cursor-pointer flex flex-col justify-between space-y-4 hover:border-[#24D8ED]/40 transition-all group"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#9475FF]/10 border border-[#9475FF]/30 flex items-center justify-center text-[#9475FF]">
                <GitCompare className="w-4 h-4" />
              </div>
              <h3 className="font-display font-bold text-sm text-white">
                Interaction Analysis
              </h3>
            </div>
            <p className="text-xs text-[#A6B5CB] leading-relaxed">
              Analyze drug-drug, drug-gene, and drug-disease interactions with AI-powered insights.
            </p>
          </div>

          {/* Mini Graph Snippet */}
          <div className="p-2.5 rounded-xl bg-[#070B14]/70 border border-white/5 flex items-center justify-center h-14 relative font-mono text-[9px]">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-[#9475FF]/20 text-[#9475FF]">Rivaroxaban</span>
              <span className="text-[#71839E]">→</span>
              <span className="px-1.5 py-0.5 rounded bg-[#24D8ED]/20 text-[#24D8ED]">CYP3A4</span>
              <span className="text-[#71839E]">→</span>
              <span className="px-1.5 py-0.5 rounded bg-[#31CAB6]/20 text-[#31CAB6]">Clopidogrel</span>
            </div>
          </div>
        </div>

        {/* Card 3: 3D Molecular Lab */}
        <div
          onClick={() => onLaunch('molecular-lab')}
          className="glass-card p-5 rounded-2xl cursor-pointer flex flex-col justify-between space-y-4 hover:border-[#24D8ED]/40 transition-all group"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#31CAB6]/10 border border-[#31CAB6]/30 flex items-center justify-center text-[#31CAB6]">
                <Boxes className="w-4 h-4" />
              </div>
              <h3 className="font-display font-bold text-sm text-white">
                3D Molecular Lab
              </h3>
            </div>
            <p className="text-xs text-[#A6B5CB] leading-relaxed">
              Visualize and explore molecular structures in an interactive environment.
            </p>
          </div>

          {/* Mini 3D Icon Graphic */}
          <div className="p-2.5 rounded-xl bg-[#070B14]/70 border border-white/5 flex items-center justify-center h-14">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#24D8ED] shadow-[0_0_8px_#24D8ED]" />
              <div className="w-4 h-0.5 bg-[#64748B]" />
              <div className="w-4 h-4 rounded-full bg-[#9475FF] shadow-[0_0_8px_#9475FF]" />
              <div className="w-4 h-0.5 bg-[#64748B]" />
              <div className="w-3 h-3 rounded-full bg-[#31CAB6] shadow-[0_0_8px_#31CAB6]" />
            </div>
          </div>
        </div>

        {/* Card 4: Scientific Reports */}
        <div
          onClick={() => onLaunch('report-studio')}
          className="glass-card p-5 rounded-2xl cursor-pointer flex flex-col justify-between space-y-4 hover:border-[#24D8ED]/40 transition-all group"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#24D8ED]/10 border border-[#24D8ED]/30 flex items-center justify-center text-[#24D8ED]">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="font-display font-bold text-sm text-white">
                Scientific Reports
              </h3>
            </div>
            <p className="text-xs text-[#A6B5CB] leading-relaxed">
              Generate AI-assisted reports with citations, visualizations, and actionable insights.
            </p>
          </div>

          {/* Mini Report Document Preview */}
          <div className="p-2.5 rounded-xl bg-[#070B14]/70 border border-white/5 flex items-center justify-between text-[10px] font-mono">
            <div>
              <div className="text-white font-semibold">Comprehensive Analysis</div>
              <div className="text-[#71839E]">Drug Class • Metabolic Pathway</div>
            </div>
            <FileText className="w-4 h-4 text-[#24D8ED]" />
          </div>
        </div>
      </section>

      {/* SECTION 3: WORKSPACE PREVIEW (Matching Reference Image 1 Bottom) */}
      <section className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111C2E] border border-[#24D8ED]/30 text-xs font-mono text-[#24D8ED]">
              <Sparkles className="w-3 h-3 text-[#24D8ED]" />
              <span className="font-semibold uppercase text-[10px]">Turn Data into Discovery</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white leading-tight">
              A Unified Research Workspace for Modern Science
            </h2>

            <p className="text-xs sm:text-sm text-[#A6B5CB] leading-relaxed">
              From molecular structures to real-world evidence, Drug Scope AI brings everything researchers need into one seamless, intelligent workspace.
            </p>

            <button
              onClick={() => onLaunch('command-center')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#24D8ED] to-[#1E90FF] text-[#070B14] font-bold text-xs hover:opacity-95 transition-all shadow-[0_0_15px_rgba(36,216,237,0.3)] cursor-pointer"
            >
              <span>Explore Research Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Miniature interactive preview link */}
          <div
            onClick={() => onLaunch('command-center')}
            className="lg:col-span-7 rounded-2xl bg-[#0B1120] border border-white/10 p-5 space-y-4 cursor-pointer hover:border-[#24D8ED]/40 transition-all shadow-2xl group"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3 text-xs">
              <span className="font-display font-bold text-white group-hover:text-[#24D8ED] transition-colors">
                Research Command Center Preview
              </span>
              <span className="text-[10px] font-mono text-[#31CAB6] bg-[#31CAB6]/10 px-2 py-0.5 rounded">
                Live Data Connected
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#111C2E] border border-white/5">
                <span className="text-[10px] text-[#71839E] font-mono">Targets Mapped</span>
                <div className="text-base font-bold text-white font-display mt-1">386</div>
                <span className="text-[9px] text-[#31CAB6] font-mono">↑ 28% this month</span>
              </div>
              <div className="p-3 rounded-xl bg-[#111C2E] border border-white/5">
                <span className="text-[10px] text-[#71839E] font-mono">Compounds</span>
                <div className="text-base font-bold text-white font-display mt-1">142</div>
                <span className="text-[9px] text-[#31CAB6] font-mono">↑ 67% analyzed</span>
              </div>
              <div className="p-3 rounded-xl bg-[#111C2E] border border-white/5">
                <span className="text-[10px] text-[#71839E] font-mono">Reports</span>
                <div className="text-base font-bold text-white font-display mt-1">24</div>
                <span className="text-[9px] text-[#9475FF] font-mono">100% verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
