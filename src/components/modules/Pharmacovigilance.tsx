import React, { useState } from 'react';
import { PHARMACOVIGILANCE_SIGNALS } from '../../data/mockSignals';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Download,
  Info,
  Minus,
  Search,
  ShieldAlert,
  TrendingUp
} from 'lucide-react';

export const Pharmacovigilance: React.FC = () => {
  const [filterQuery, setFilterQuery] = useState('');

  const filteredSignals = PHARMACOVIGILANCE_SIGNALS.filter(
    (s) =>
      s.drugName.toLowerCase().includes(filterQuery.toLowerCase()) ||
      s.reactionTerm.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#F16D76]" />
            Pharmacovigilance Signal Explorer
          </h1>
          <p className="text-xs text-[#A7B5C9] mt-1">
            Real-world post-marketing safety signal surveillance via openFDA FAERS disproportionality metrics
          </p>
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search reaction or drug pair..."
            className="w-full bg-[#070B14] border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#F16D76]/40"
          />
        </div>
      </div>

      {/* Safety Signal Table */}
      <div className="glass-panel p-6 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-display font-bold text-white uppercase tracking-wider font-mono">
            Surveillance Signals ({filteredSignals.length})
          </h2>
          <span className="text-[10px] font-mono text-[#32C8B7] bg-[#32C8B7]/10 px-2 py-0.5 rounded">
            FAERS Duplicate-De-duplicated
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[#64748B] font-mono text-[10px] uppercase">
                <th className="pb-3">Drug Combination</th>
                <th className="pb-3">Adverse Reaction Term (MedDRA)</th>
                <th className="pb-3">FAERS Reports</th>
                <th className="pb-3">PRR Score</th>
                <th className="pb-3">ROR Score</th>
                <th className="pb-3">Serious Outcome %</th>
                <th className="pb-3">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredSignals.map((signal) => (
                <tr key={signal.id} className="text-[#A7B5C9] hover:bg-white/5 transition-colors">
                  <td className="py-3.5 font-bold text-white">{signal.drugName}</td>
                  <td className="py-3.5 text-[#F16D76] font-medium">{signal.reactionTerm}</td>
                  <td className="py-3.5 font-mono text-white">
                    {signal.reportCount.toLocaleString()}
                  </td>
                  <td className="py-3.5 font-mono text-[#37D6E6] font-bold">
                    {signal.proportionalReportingRatio.toFixed(2)}
                  </td>
                  <td className="py-3.5 font-mono text-[#9079F7] font-bold">
                    {signal.reportingOddsRatio.toFixed(2)}
                  </td>
                  <td className="py-3.5 font-mono text-[#EFB85A]">
                    {signal.seriousOutcomeRate}%
                  </td>
                  <td className="py-3.5">
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded bg-white/5">
                      {signal.signalTrend === 'Increasing' ? (
                        <ArrowUp className="w-3 h-3 text-[#F16D76]" />
                      ) : signal.signalTrend === 'Decreasing' ? (
                        <ArrowDown className="w-3 h-3 text-[#32C8B7]" />
                      ) : (
                        <Minus className="w-3 h-3 text-[#EFB85A]" />
                      )}
                      {signal.signalTrend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Methodological Guidance & FAERS Disclaimers */}
      <div className="glass-panel p-5 rounded-xl space-y-2 border border-white/10 text-xs text-[#A7B5C9]">
        <div className="flex items-center gap-2 text-white font-semibold font-mono text-xs">
          <Info className="w-4 h-4 text-[#37D6E6]" />
          Methodological Governance on Spontaneous Reporting
        </div>
        <p className="leading-relaxed">
          Proportional Reporting Ratios (PRR &gt; 2.0 with Chi-Square &gt; 4) indicate statistical disproportionality in FAERS submission volumes. Spontaneous adverse event reports are subject to under-reporting, Weber effect, and confounding by indication. These metrics serve for exploratory hypothesis generation and cannot independently establish medical causation.
        </p>
      </div>
    </div>
  );
};
