import React, { useState } from 'react';
import { DashboardMoleculePreview } from '../3d/DashboardMoleculePreview';
import { DATA_SOURCES } from '../../data/mockSources';
import { DatasetMode } from '../../types';
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  ChevronDown,
  Database,
  ExternalLink,
  FileText,
  Filter,
  GitCompare,
  Layers,
  Network,
  RefreshCw,
  Search,
  Send,
  Share2,
  Sparkles,
  TrendingUp,
  Zap
} from 'lucide-react';

interface CommandCenterProps {
  mode: DatasetMode;
  onNavigate: (moduleId: string) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({ mode, onNavigate }) => {
  const [promptInput, setPromptInput] = useState('');
  const [activeEvidenceFilter, setActiveEvidenceFilter] = useState('All');

  // KPI Metrics with sparkline paths matching Image 2
  const kpiCards = [
    {
      title: 'Drug & bioactive compounds',
      value: '120M+',
      iconColor: 'text-[#24D8ED]',
      bgColor: 'bg-[#24D8ED]/10',
      sparkline: 'M0,15 Q20,5 40,12 T80,8 T120,3',
      strokeColor: '#24D8ED'
    },
    {
      title: 'Peer-reviewed studies',
      value: '8M+',
      iconColor: 'text-[#9475FF]',
      bgColor: 'bg-[#9475FF]/10',
      sparkline: 'M0,16 Q20,10 40,8 T80,12 T120,4',
      strokeColor: '#9475FF'
    },
    {
      title: 'Drug interaction records',
      value: '2.5M+',
      iconColor: 'text-[#31CAB6]',
      bgColor: 'bg-[#31CAB6]/10',
      sparkline: 'M0,14 Q20,15 40,6 T80,10 T120,2',
      strokeColor: '#31CAB6'
    },
    {
      title: '3D molecular structures',
      value: '50K+',
      iconColor: 'text-[#C084FC]',
      bgColor: 'bg-[#C084FC]/10',
      sparkline: 'M0,16 Q20,8 40,14 T80,6 T120,3',
      strokeColor: '#C084FC'
    }
  ];

  // Evidence Summary Rows matching Image 2
  const evidenceRows = [
    {
      compound: 'Nirmatrelvir',
      target: 'Mpro',
      evidenceType: 'Binding affinity',
      disease: 'COVID-19',
      confidence: 'High',
      sources: 248
    },
    {
      compound: 'Remdesivir',
      target: 'RdRp',
      evidenceType: 'Clinical study',
      disease: 'SARS-CoV-2',
      confidence: 'High',
      sources: 186
    },
    {
      compound: 'Molnupiravir',
      target: 'RdRp',
      evidenceType: 'Real-world evidence',
      disease: 'COVID-19',
      confidence: 'Medium',
      sources: 142
    },
    {
      compound: 'Baricitinib',
      target: 'JAK1/2',
      evidenceType: 'Mechanism of action',
      disease: 'Cytokine storm',
      confidence: 'High',
      sources: 97
    },
    {
      compound: 'Dexamethasone',
      target: 'GR',
      evidenceType: 'Clinical guideline',
      disease: 'Severe COVID-19',
      confidence: 'High',
      sources: 312
    }
  ];

  // Recent Scientific Reports matching Image 2
  const recentReports = [
    {
      title: 'GLP-1 Receptor Agonists in Metabolic Disease',
      journal: 'Nature Reviews Drug Discovery',
      date: 'Jun 2, 2024 • 24 pages',
      tag: 'Review',
      tagColor: 'text-[#9475FF] bg-[#9475FF]/10'
    },
    {
      title: 'JAK Inhibitors in Autoimmune Diseases',
      journal: 'The Lancet',
      date: 'May 28, 2024 • 18 pages',
      tag: 'Meta-analysis',
      tagColor: 'text-[#24D8ED] bg-[#24D8ED]/10'
    },
    {
      title: 'SARS-CoV-2 Antiviral Drug Mechanisms',
      journal: 'Cell',
      date: 'May 20, 2024 • 31 pages',
      tag: 'Research',
      tagColor: 'text-[#31CAB6] bg-[#31CAB6]/10'
    }
  ];

  return (
    <div className="space-y-6 pb-24 select-none">
      {/* 1. TOP GREETING & AI INSIGHT BANNER (Matching Reference Image 2) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#24D8ED] font-semibold mb-1">
            Research Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Welcome back, Dr. Sarah Chen
          </h1>
          <p className="text-xs text-[#A6B5CB] mt-0.5">
            Transforming molecular data into real-world medical breakthroughs.
          </p>
        </div>

        {/* AI Insight Card matching Image 2 top right */}
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#111C2E]/90 border border-[#24D8ED]/20 shadow-lg max-w-md">
          <div className="w-8 h-8 rounded-xl bg-[#24D8ED]/10 flex items-center justify-center text-[#24D8ED] shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-xs space-y-0.5">
            <div className="font-bold text-white flex items-center gap-1.5">
              <span>AI Insight</span>
            </div>
            <p className="text-[#A6B5CB] leading-relaxed text-[11px]">
              Based on your recent searches, 3 new high-confidence drug repurposing opportunities were identified.
            </p>
          </div>
        </div>
      </div>

      {/* 2. 4 METRIC KPI CARDS WITH SPARKLINES (Matching Reference Image 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, idx) => (
          <div
            key={idx}
            className="glass-card p-4 rounded-2xl flex items-center justify-between hover:border-white/20 transition-all"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg ${kpi.bgColor} flex items-center justify-center ${kpi.iconColor}`}>
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <span className="text-xl font-display font-bold text-white tracking-tight">
                  {kpi.value}
                </span>
              </div>
              <div className="text-[11px] text-[#71839E] font-medium truncate max-w-[140px]">
                {kpi.title}
              </div>
            </div>

            {/* Sparkline mini wave */}
            <svg className="w-24 h-10 shrink-0" viewBox="0 0 120 20" fill="none">
              <path
                d={kpi.sparkline}
                stroke={kpi.strokeColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
        ))}
      </div>

      {/* 3. MIDDLE ROW (3 CARDS): Data Sources Status, Research Activity Wave, 3D Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Col 1 (3.5/12): Data Sources Status */}
        <div className="lg:col-span-3 glass-panel p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <h2 className="text-xs font-display font-bold text-white">Data Sources Status</h2>
            <span className="flex items-center gap-1.5 text-[10px] font-mono text-[#31CAB6] bg-[#31CAB6]/10 px-2 py-0.5 rounded-full font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#31CAB6] animate-pulse" />
              Live
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#4ADE80]" />
                <span className="text-white font-medium">PubMed</span>
              </div>
              <span className="font-mono text-[11px] text-[#A6B5CB]">12.4M papers</span>
              <span className="text-[10px] text-[#31CAB6] font-mono">Online</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#24D8ED]" />
                <span className="text-white font-medium">ChEMBL</span>
              </div>
              <span className="font-mono text-[11px] text-[#A6B5CB]">2.1M compounds</span>
              <span className="text-[10px] text-[#31CAB6] font-mono">Online</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F2B961]" />
                <span className="text-white font-medium">ClinicalTrials.gov</span>
              </div>
              <span className="font-mono text-[11px] text-[#A6B5CB]">482K trials</span>
              <span className="text-[10px] text-[#F2B961] font-mono">Syncing...</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#9475FF]" />
                <span className="text-white font-medium">Open Targets</span>
              </div>
              <span className="font-mono text-[11px] text-[#A6B5CB]">918K associations</span>
              <span className="text-[10px] text-[#31CAB6] font-mono">Online</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                <span className="text-white font-medium">BindingDB</span>
              </div>
              <span className="font-mono text-[11px] text-[#A6B5CB]">2.3M interactions</span>
              <span className="text-[10px] text-[#31CAB6] font-mono">Online</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#31CAB6]" />
                <span className="text-white font-medium">UniProt</span>
              </div>
              <span className="font-mono text-[11px] text-[#A6B5CB]">587K proteins</span>
              <span className="text-[10px] text-[#31CAB6] font-mono">Online</span>
            </div>
          </div>
        </div>

        {/* Col 2 (4.5/12): Research Activity Chart */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <h2 className="text-xs font-display font-bold text-white">Research Activity</h2>
            <div className="flex items-center gap-1 text-[11px] text-[#A6B5CB] bg-[#070B14] px-2.5 py-1 rounded-md border border-white/5 cursor-pointer font-mono">
              <span>Last 30 days</span>
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>

          {/* Activity Metrics Strip */}
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div>
              <div className="text-base font-bold text-white font-display">1,248</div>
              <div className="text-[10px] text-[#71839E]">Searches</div>
              <span className="text-[9px] text-[#31CAB6] font-mono">↑ 42%</span>
            </div>
            <div>
              <div className="text-base font-bold text-white font-display">386</div>
              <div className="text-[10px] text-[#71839E]">Unique targets</div>
              <span className="text-[9px] text-[#31CAB6] font-mono">↑ 28%</span>
            </div>
            <div>
              <div className="text-base font-bold text-white font-display">142</div>
              <div className="text-[10px] text-[#71839E]">Compounds</div>
              <span className="text-[9px] text-[#31CAB6] font-mono">↑ 67%</span>
            </div>
            <div>
              <div className="text-base font-bold text-white font-display">24</div>
              <div className="text-[10px] text-[#71839E]">Reports gen.</div>
              <span className="text-[9px] text-[#9475FF] font-mono">↑ 50%</span>
            </div>
          </div>

          {/* Interactive Multi-Wave Activity Chart matching Image 2 */}
          <div className="h-32 w-full pt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="wave_cyan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#24D8ED" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#24D8ED" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="wave_purple" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9475FF" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#9475FF" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1="0" y1="25" x2="400" y2="25" stroke="rgba(255,255,255,0.05)" />
              <line x1="0" y1="50" x2="400" y2="50" stroke="rgba(255,255,255,0.05)" />
              <line x1="0" y1="75" x2="400" y2="75" stroke="rgba(255,255,255,0.05)" />

              {/* Area Fills */}
              <path
                d="M0,80 Q50,40 100,60 T200,30 T300,50 T400,20 L400,100 L0,100 Z"
                fill="url(#wave_cyan)"
              />
              <path
                d="M0,80 Q50,40 100,60 T200,30 T300,50 T400,20"
                stroke="#24D8ED"
                strokeWidth="2.5"
                fill="none"
              />

              <path
                d="M0,90 Q50,70 100,75 T200,45 T300,60 T400,35 L400,100 L0,100 Z"
                fill="url(#wave_purple)"
              />
              <path
                d="M0,90 Q50,70 100,75 T200,45 T300,60 T400,35"
                stroke="#9475FF"
                strokeWidth="2"
                fill="none"
              />
            </svg>
            <div className="flex justify-between text-[9px] font-mono text-[#71839E] pt-1">
              <span>May 1</span>
              <span>May 5</span>
              <span>May 10</span>
              <span>May 15</span>
              <span>May 20</span>
              <span>May 25</span>
              <span>May 30</span>
            </div>
          </div>
        </div>

        {/* Col 3 (4/12): 3D Molecular Preview */}
        <div className="lg:col-span-4 glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-2">
            <h2 className="text-xs font-display font-bold text-white">3D Molecular Preview</h2>
            <button
              onClick={() => onNavigate('molecular-lab')}
              className="text-xs text-[#24D8ED] hover:underline flex items-center gap-1 font-mono cursor-pointer"
            >
              Open Lab →
            </button>
          </div>

          <DashboardMoleculePreview onExpand={() => onNavigate('molecular-lab')} />
        </div>
      </div>

      {/* 4. BOTTOM ROW (3 CARDS): Interaction Network, Evidence Summary Table, Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Col 1 (4/12): Compound-Target Interaction Network (Matching Image 2) */}
        <div className="lg:col-span-4 glass-panel p-5 rounded-2xl space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <h2 className="text-xs font-display font-bold text-white">
              Compound-Target Interaction Network
            </h2>
          </div>

          {/* Interactive Network Graph */}
          <div className="relative h-60 rounded-xl bg-[#070B14]/80 border border-white/5 flex items-center justify-center overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 300 220">
              {/* Connection Lines */}
              <line x1="150" y1="110" x2="80" y2="50" stroke="#9475FF" strokeWidth="1.5" strokeOpacity="0.6" />
              <line x1="150" y1="110" x2="230" y2="55" stroke="#24D8ED" strokeWidth="1.5" strokeOpacity="0.6" />
              <line x1="150" y1="110" x2="240" y2="150" stroke="#F16D7B" strokeWidth="1.5" strokeOpacity="0.6" />
              <line x1="150" y1="110" x2="160" y2="185" stroke="#31CAB6" strokeWidth="1.5" strokeOpacity="0.6" />
              <line x1="150" y1="110" x2="60" y2="160" stroke="#24D8ED" strokeWidth="1.5" strokeOpacity="0.6" />

              {/* Surrounding Nodes */}
              <circle cx="80" cy="50" r="14" fill="#152238" stroke="#9475FF" strokeWidth="2" />
              <text x="80" y="53" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontFamily="monospace">Mpro</text>

              <circle cx="230" cy="55" r="14" fill="#152238" stroke="#24D8ED" strokeWidth="2" />
              <text x="230" y="58" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontFamily="monospace">ACE2</text>

              <circle cx="240" cy="150" r="15" fill="#152238" stroke="#F16D7B" strokeWidth="2" />
              <text x="240" y="153" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontFamily="monospace">COVID-19</text>

              <circle cx="160" cy="185" r="13" fill="#152238" stroke="#31CAB6" strokeWidth="2" />
              <text x="160" y="188" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontFamily="monospace">TMPRSS2</text>

              <circle cx="60" cy="160" r="13" fill="#152238" stroke="#24D8ED" strokeWidth="2" />
              <text x="60" y="163" textAnchor="middle" fill="#FFFFFF" fontSize="6.5" fontFamily="monospace">Inflammation</text>

              {/* Central Active Compound Node */}
              <circle cx="150" cy="110" r="22" fill="#111C2E" stroke="#24D8ED" strokeWidth="3" className="animate-pulse" />
              <text x="150" y="108" textAnchor="middle" fill="#24D8ED" fontSize="9" fontWeight="bold">Paxlovid</text>
              <text x="150" y="118" textAnchor="middle" fill="#A6B5CB" fontSize="7">(Nirmatrelvir)</text>
            </svg>
          </div>

          {/* Graph Legend Pills matching Image 2 */}
          <div className="flex items-center justify-between text-[10px] font-mono text-[#A6B5CB] pt-1">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#24D8ED]" /> Drug</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#9475FF]" /> Target</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#F16D7B]" /> Disease</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#31CAB6]" /> Pathway</span>
          </div>
        </div>

        {/* Col 2 (5/12): Evidence Summary Table (Matching Image 2) */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <h2 className="text-xs font-display font-bold text-white">Evidence Summary</h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#A6B5CB]">Sort by Relevance ▾</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-[#71839E] font-mono text-[9px] uppercase">
                  <th className="pb-2">Compound / Target</th>
                  <th className="pb-2">Evidence Type</th>
                  <th className="pb-2">Disease / Condition</th>
                  <th className="pb-2 text-center">Confidence</th>
                  <th className="pb-2 text-right">Sources</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {evidenceRows.map((row, idx) => (
                  <tr key={idx} className="text-[#A6B5CB] hover:bg-white/[0.03] transition-colors">
                    <td className="py-2.5 font-semibold text-white">
                      <span>{row.compound}</span>
                      <span className="text-[#9475FF] font-mono text-[10px] ml-1">→ {row.target}</span>
                    </td>
                    <td className="py-2.5 text-[11px] text-[#A6B5CB]">{row.evidenceType}</td>
                    <td className="py-2.5 text-[11px]">{row.disease}</td>
                    <td className="py-2.5 text-center">
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          row.confidence === 'High'
                            ? 'bg-[#31CAB6]/15 text-[#31CAB6] border border-[#31CAB6]/30'
                            : 'bg-[#F2B961]/15 text-[#F2B961] border border-[#F2B961]/30'
                        }`}
                      >
                        {row.confidence}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-mono text-white text-[11px]">
                      {row.sources}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Col 3 (3/12): Recent Scientific Reports (Matching Image 2) */}
        <div className="lg:col-span-3 glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <h2 className="text-xs font-display font-bold text-white">Recent Scientific Reports</h2>
            <button
              onClick={() => onNavigate('report-studio')}
              className="text-[10px] text-[#24D8ED] hover:underline font-mono cursor-pointer"
            >
              View All →
            </button>
          </div>

          <div className="space-y-3">
            {recentReports.map((rep, idx) => (
              <div
                key={idx}
                onClick={() => onNavigate('report-studio')}
                className="p-3 rounded-xl bg-[#070B14]/70 border border-white/5 hover:border-[#24D8ED]/30 transition-all cursor-pointer space-y-1.5 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xs font-semibold text-white group-hover:text-[#24D8ED] transition-colors leading-snug">
                    {rep.title}
                  </h3>
                  <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded font-semibold shrink-0 ${rep.tagColor}`}>
                    {rep.tag}
                  </span>
                </div>
                <div className="text-[10px] text-[#A6B5CB]">{rep.journal}</div>
                <div className="text-[9px] text-[#71839E] font-mono">{rep.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. FLOATING BOTTOM AI PROMPT DOCK (Matching Reference Image 2) */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 w-full max-w-4xl px-4 pointer-events-auto">
        <div className="p-2 rounded-2xl bg-[#0D1526]/95 backdrop-blur-2xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] space-y-2">
          {/* Main Input Row */}
          <div className="flex items-center gap-3 px-3 py-1">
            <Sparkles className="w-4 h-4 text-[#9475FF] shrink-0" />
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Ask Drug Scope AI... E.g. Show me compounds targeting Mpro with clinical evidence"
              className="flex-1 bg-transparent border-none text-xs text-white placeholder:text-[#71839E] focus:outline-none"
            />
            <button
              onClick={() => onNavigate('ai-assistant')}
              className="p-2 rounded-xl bg-[#9475FF] text-white hover:bg-[#9475FF]/90 transition-colors shrink-0 cursor-pointer shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Action Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5 text-[10px] font-mono px-2">
            <button
              onClick={() => onNavigate('interaction-review')}
              className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-[#A6B5CB] hover:text-white transition-colors cursor-pointer"
            >
              Analyze compound
            </button>
            <button
              onClick={() => onNavigate('hypothesis-workbench')}
              className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-[#A6B5CB] hover:text-white transition-colors cursor-pointer"
            >
              Find drug repurposing opportunities
            </button>
            <button
              onClick={() => onNavigate('pathway-network')}
              className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-[#A6B5CB] hover:text-white transition-colors cursor-pointer"
            >
              Compare targets
            </button>
            <button
              onClick={() => onNavigate('literature-intel')}
              className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-[#A6B5CB] hover:text-white transition-colors cursor-pointer"
            >
              Summarize recent literature
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
