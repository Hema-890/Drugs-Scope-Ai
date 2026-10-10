import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Download,
  Info,
  Loader2,
  Minus,
  RefreshCw,
  Search,
  ShieldAlert,
  TrendingUp,
  ExternalLink,
  ShieldCheck,
  Activity
} from 'lucide-react';

interface FaersReaction {
  term: string;
  count: number;
}

interface FaersReportItem {
  safetyReportId: string;
  receiveDate: string;
  serious: boolean;
  seriousnessDeath: boolean;
  seriousnessHospitalization: boolean;
  patientOnsetAge?: string | null;
  patientSex: string;
  reactions: string[];
  concomitantDrugs: string[];
}

export const Pharmacovigilance: React.FC = () => {
  const [selectedDrug, setSelectedDrug] = useState<string>('Warfarin');
  const [searchInput, setSearchInput] = useState<string>('Warfarin');
  const [loading, setLoading] = useState<boolean>(true);
  const [totalReports, setTotalReports] = useState<number>(0);
  const [topReactions, setTopReactions] = useState<FaersReaction[]>([]);
  const [recentReports, setRecentReports] = useState<FaersReportItem[]>([]);
  const [sourceProvenance, setSourceProvenance] = useState<string>('openFDA FAERS Spontaneous Reporting System');

  const QUICK_DRUGS = ['Warfarin', 'Nirmatrelvir', 'Amiodarone', 'Clopidogrel', 'Omeprazole', 'Lisinopril', 'Simvastatin', 'Aspirin'];

  const queryFaersData = async (drugName: string) => {
    if (!drugName.trim()) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/openfda?drug=${encodeURIComponent(drugName.trim())}&type=events`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setTotalReports(data.totalReports || 0);
          setTopReactions(data.topReactions || []);
          setRecentReports(data.recentReports || []);
          setSourceProvenance(data.source);
        }
      }
    } catch (err) {
      console.error('Failed to query openFDA FAERS:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queryFaersData(selectedDrug);
  }, [selectedDrug]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSelectedDrug(searchInput.trim());
    }
  };

  const maxCount = topReactions[0]?.count || 1;

  return (
    <div className="space-y-6 pb-24 select-none">
      {/* 1. Header & Live Query Bar */}
      <div className="bg-[#0B1120] border border-white/[0.08] p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-display font-bold text-white flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-[#F16D7B]" />
              Pharmacovigilance & FAERS Safety Surveillance
            </h1>
            <span className="text-[10px] font-mono bg-[#F16D7B]/10 text-[#F16D7B] border border-[#F16D7B]/30 px-2.5 py-0.5 rounded-full font-semibold">
              openFDA Live API
            </span>
          </div>
          <p className="text-xs text-[#A6B5CB] mt-1 max-w-2xl leading-relaxed">
            Real-world post-marketing safety surveillance querying authentic FDA Adverse Event Reporting System (FAERS) case submissions and MedDRA reaction disproportionalities.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 text-[#71839E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Query any medication (e.g. Warfarin)..."
              className="w-full bg-[#070B14] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-[#71839E] focus:outline-none focus:border-[#F16D7B] transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#F16D7B] to-[#E11D48] text-white font-bold text-xs hover:opacity-95 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50 shadow-md"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>Surveil</span>
          </button>
        </form>
      </div>

      {/* Quick Drug Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[10px] font-mono text-[#71839E] uppercase shrink-0 mr-1 flex items-center gap-1">
          <Activity className="w-3 h-3 text-[#24D8ED]" /> Monitored Regimens:
        </span>
        {QUICK_DRUGS.map((d) => (
          <button
            key={d}
            onClick={() => {
              setSelectedDrug(d);
              setSearchInput(d);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer border ${
              selectedDrug.toLowerCase() === d.toLowerCase()
                ? 'bg-[#F16D7B]/15 border-[#F16D7B] text-white font-semibold'
                : 'bg-[#0B1120] border-white/10 text-[#A6B5CB] hover:bg-white/5 hover:text-white'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* 2. Top Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0B1120] border border-white/[0.08] p-5 rounded-2xl space-y-1.5 shadow-lg">
          <div className="text-xs font-mono uppercase text-[#71839E] flex items-center justify-between">
            <span>Total FAERS Submissions</span>
            <ShieldCheck className="w-4 h-4 text-[#31CAB6]" />
          </div>
          <div className="text-2xl font-mono font-bold text-white">
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-[#24D8ED]" /> : totalReports.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#71839E]">Cumulative spontaneous cases recorded in FDA database for {selectedDrug}</p>
        </div>

        <div className="bg-[#0B1120] border border-white/[0.08] p-5 rounded-2xl space-y-1.5 shadow-lg">
          <div className="text-xs font-mono uppercase text-[#71839E] flex items-center justify-between">
            <span>Primary Reported Signal</span>
            <AlertTriangle className="w-4 h-4 text-[#F16D7B]" />
          </div>
          <div className="text-lg font-display font-bold text-[#F16D7B] truncate">
            {loading ? '...' : topReactions[0]?.term || 'N/A'}
          </div>
          <p className="text-[11px] text-[#71839E]">
            {topReactions[0] ? `${topReactions[0].count.toLocaleString()} cases (${((topReactions[0].count / (totalReports || 1)) * 100).toFixed(1)}% of submissions)` : 'No records'}
          </p>
        </div>

        <div className="bg-[#0B1120] border border-white/[0.08] p-5 rounded-2xl space-y-1.5 shadow-lg">
          <div className="text-xs font-mono uppercase text-[#71839E] flex items-center justify-between">
            <span>FDA Regulatory Status</span>
            <ExternalLink className="w-4 h-4 text-[#24D8ED]" />
          </div>
          <div className="text-sm font-semibold text-white">Active Post-Market Surveillance</div>
          <p className="text-[11px] text-[#71839E]">Grounded strictly in openFDA /drug/event.json live endpoints</p>
        </div>
      </div>

      {/* 3. MedDRA Adverse Reaction Frequency Chart */}
      <div className="bg-[#0B1120] border border-white/[0.08] p-6 rounded-2xl space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-display font-bold text-white uppercase tracking-wider font-mono">
              Top Reported MedDRA Reaction Terms for {selectedDrug}
            </h2>
            <p className="text-xs text-[#71839E] mt-0.5">Aggregated disproportionality counts from official FDA FAERS records</p>
          </div>
          <span className="text-[10px] font-mono text-[#31CAB6] bg-[#31CAB6]/10 border border-[#31CAB6]/30 px-2.5 py-0.5 rounded-full font-semibold">
            Live openFDA Aggregation
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-[#71839E] flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#24D8ED]" /> Fetching FAERS reaction frequencies...
          </div>
        ) : topReactions.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#71839E]">No adverse reactions returned for this term.</div>
        ) : (
          <div className="space-y-2.5 pt-2">
            {topReactions.map((reaction, idx) => {
              const pct = (reaction.count / maxCount) * 100;
              return (
                <div key={reaction.term} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-semibold text-white">
                      {idx + 1}. {reaction.term}
                    </span>
                    <span className="text-[#F16D7B] font-bold">{reaction.count.toLocaleString()} cases</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#070B14] overflow-hidden border border-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#24D8ED] to-[#F16D7B] transition-all duration-500"
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Recent Case Reports Stream */}
      <div className="bg-[#0B1120] border border-white/[0.08] p-6 rounded-2xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-display font-bold text-white uppercase tracking-wider font-mono">
              Recent Spontaneous Case Submissions
            </h2>
            <p className="text-xs text-[#71839E] mt-0.5">Individual safety report details submitted by healthcare providers and manufacturers</p>
          </div>
        </div>

        {recentReports.length === 0 && !loading ? (
          <div className="p-8 text-center text-xs text-[#71839E]">No recent reports available for this medication.</div>
        ) : (
          <div className="space-y-3 pt-2">
            {recentReports.map((rep) => (
              <div
                key={rep.safetyReportId}
                className="p-4 rounded-xl bg-[#070B14] border border-white/5 space-y-2.5 text-xs hover:border-white/10 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2 text-[11px] font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-[#24D8ED] font-bold">Report #{rep.safetyReportId}</span>
                    <span className="text-[#71839E]">Date: {rep.receiveDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${rep.serious ? 'bg-[#F16D7B]/20 text-[#F16D7B]' : 'bg-[#31CAB6]/20 text-[#31CAB6]'}`}>
                      {rep.serious ? 'Serious Outcome' : 'Non-Serious'}
                    </span>
                    {rep.seriousnessDeath && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-600/30 text-red-400">
                        Fatal Outcome
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[#71839E] text-[10px] uppercase font-mono block">Patient Characteristics</span>
                    <span className="text-white">
                      Sex: {rep.patientSex} {rep.patientOnsetAge ? `• Onset Age: ${rep.patientOnsetAge} yrs` : ''}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#71839E] text-[10px] uppercase font-mono block">Reported Adverse Reactions</span>
                    <span className="text-[#F16D7B] font-semibold">
                      {rep.reactions.join(', ') || 'Unspecified'}
                    </span>
                  </div>
                </div>

                {rep.concomitantDrugs.length > 0 && (
                  <div className="pt-1 border-t border-white/5 text-[11px]">
                    <span className="text-[#71839E] font-mono">Concomitant Medications: </span>
                    <span className="text-[#A6B5CB]">{rep.concomitantDrugs.join(', ')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FDA Disclaimer */}
      <div className="p-4 rounded-xl bg-[#09101E] border border-white/10 flex items-start gap-3 text-xs text-[#71839E] leading-relaxed">
        <Info className="w-4 h-4 text-[#24D8ED] shrink-0 mt-0.5" />
        <p>
          <strong className="text-white">FDA FAERS Methodological Disclaimer:</strong> Reports in the FAERS database do not require proven causality. Submission of a report does not establish that the drug caused the adverse event. Reporting rates are influenced by publicity, market tenure, and reporting biases. Disproportionality scores (PRR/ROR) reflect statistical associations rather than direct clinical risk.
        </p>
      </div>
    </div>
  );
};
