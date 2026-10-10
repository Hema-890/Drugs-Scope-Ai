import React, { useState } from 'react';
import { History, Calendar, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const EvidenceTimeMachine: React.FC = () => {
  const [selectedSnapshot, setSelectedSnapshot] = useState('2024');

  const snapshots: Record<string, { date: string; fdaStatus: string; labelText: string; changeSummary: string }> = {
    '2009': {
      date: 'November 2009',
      fdaStatus: 'Initial Public Health Advisory Issued',
      labelText: 'Preliminary laboratory studies indicate omeprazole reduces the antiplatelet activity of clopidogrel by approximately 47%. Concomitant use should be avoided when possible.',
      changeSummary: 'First regulatory warning identifying CYP2C19 competitive inhibition pathway.'
    },
    '2011': {
      date: 'June 2011',
      fdaStatus: 'Boxed Warning Formalized',
      labelText: 'Diminished antiplatelet effect in CYP2C19 poor metabolizers. Tests are available to identify a patient\'s CYP2C19 genotype. Consider alternative platelet P2Y12 inhibitor or treatment strategy.',
      changeSummary: 'Pharmacogenomic testing recommendation codified into black-box warning.'
    },
    '2024': {
      date: 'October 2024 (Current)',
      fdaStatus: 'Harmonized Pharmacogenomic Standard',
      labelText: 'Avoid concomitant use of clopidogrel with omeprazole or esomeprazole. In clinical pharmacology studies, omeprazole 80 mg significantly decreased the active metabolite exposure of clopidogrel. Consider use of alternative acid-reducing agent such as pantoprazole with low CYP2C19 inhibition.',
      changeSummary: 'Explicit substitution recommendation for pantoprazole added; differential PPI profiling established.'
    }
  };

  const current = snapshots[selectedSnapshot];

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-[#37D6E6]" />
            Evidence Time Machine: Historical Snapshot Comparator
          </h1>
          <p className="text-xs text-[#A7B5C9] mt-1">
            Compare regulatory drug labeling and interaction evidence as it evolved across revision cycles
          </p>
        </div>

        {/* Snapshot Selector Buttons */}
        <div className="flex items-center gap-2 bg-[#070B14] p-1.5 rounded-lg border border-white/10 text-xs">
          {Object.keys(snapshots).map((year) => (
            <button
              key={year}
              onClick={() => setSelectedSnapshot(year)}
              className={`px-3 py-1.5 rounded font-mono font-semibold transition-all ${
                selectedSnapshot === year
                  ? 'bg-[#37D6E6] text-[#070B14] shadow-md'
                  : 'text-[#A7B5C9] hover:text-white'
              }`}
            >
              Snapshot {year}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-panel p-6 rounded-xl border border-white/10 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h2 className="text-base font-display font-bold text-white">
              Clopidogrel (Plavix) Label Evolution: {current.date}
            </h2>
            <span className="text-[11px] text-[#32C8B7] font-mono mt-0.5 block">
              Regulatory Status: {current.fdaStatus}
            </span>
          </div>

          <span className="text-xs font-mono bg-white/5 text-[#A7B5C9] px-2.5 py-1 rounded">
            Version ID: FDA-SPL-{selectedSnapshot}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#070B14]/80 border border-white/5 space-y-2">
          <div className="text-xs font-mono uppercase text-[#37D6E6]">
            Section 7: Drug Interaction Wording as Deposited in {selectedSnapshot}
          </div>
          <p className="text-xs text-[#F4F7FB] leading-relaxed font-mono italic">
            "{current.labelText}"
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#172134]/80 border border-[#32C8B7]/30 space-y-1">
          <div className="text-xs font-mono uppercase text-[#32C8B7] font-semibold">
            Historical Delta & Pharmacological Shift
          </div>
          <p className="text-xs text-[#A7B5C9] leading-relaxed">
            {current.changeSummary}
          </p>
        </div>
      </div>
    </div>
  );
};
