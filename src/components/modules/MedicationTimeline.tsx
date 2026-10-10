import React, { useState } from 'react';
import { SYNTHETIC_PATIENT_CASES } from '../../data/mockClinicalCases';
import { AlertTriangle, Calendar, Clock, Info, ShieldAlert } from 'lucide-react';

export const MedicationTimeline: React.FC = () => {
  const [selectedCase, setSelectedCase] = useState(SYNTHETIC_PATIENT_CASES[0]);

  // Visual Gantt calculation: Timeline across 2024 months
  const months = ['Jan 2024', 'Mar 2024', 'May 2024', 'Jul 2024', 'Sep 2024', 'Nov 2024'];

  const getOffsetPercent = (dateStr: string): number => {
    const d = new Date(dateStr);
    const startYear = new Date('2023-01-01').getTime();
    const endYear = new Date('2024-12-31').getTime();
    const clamped = Math.max(startYear, Math.min(endYear, d.getTime()));
    return ((clamped - startYear) / (endYear - startYear)) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#37D6E6]" />
            Medication Timeline & Exposure Explorer
          </h1>
          <p className="text-xs text-[#A7B5C9] mt-1">
            Temporal overlap mapping of pharmacokinetics, dose titrations, and delayed-onset adverse windows
          </p>
        </div>

        {/* Case Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#64748B]">Active Patient:</span>
          <select
            value={selectedCase.patientId}
            onChange={(e) => {
              const c = SYNTHETIC_PATIENT_CASES.find((p) => p.patientId === e.target.value);
              if (c) setSelectedCase(c);
            }}
            className="bg-[#070B14] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#37D6E6]/40"
          >
            {SYNTHETIC_PATIENT_CASES.map((p) => (
              <option key={p.patientId} value={p.patientId}>
                {p.patientId} ({p.age}y {p.gender})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Interactive Timeline Chart */}
      <div className="glass-panel p-6 rounded-xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="text-xs font-mono uppercase text-[#37D6E6] font-semibold">
            Temporal Polypharmacy Gantt View (2023 - 2024)
          </div>
          <span className="text-[11px] text-[#A7B5C9]">
            Red vertical band indicates high-risk concurrent exposure window
          </span>
        </div>

        {/* Month Scale Header */}
        <div className="grid grid-cols-6 text-center text-[10px] font-mono text-[#64748B] border-b border-white/5 pb-2">
          {months.map((m, idx) => (
            <div key={idx}>{m}</div>
          ))}
        </div>

        {/* Medication Bars */}
        <div className="space-y-4 py-2 relative">
          {/* High-risk overlap marker (September 2024) */}
          <div
            className="absolute top-0 bottom-0 w-24 bg-[#F16D76]/10 border-x border-[#F16D76]/40 rounded pointer-events-none z-10"
            style={{ left: '78%' }}
          >
            <div className="text-[9px] font-mono text-[#F16D76] font-bold text-center pt-1 bg-[#101827]/80">
              CRITICAL OVERLAP
            </div>
          </div>

          {selectedCase.medications.map((med, idx) => {
            const startPct = getOffsetPercent(med.startDate);
            const widthPct = Math.max(20, 100 - startPct);

            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{med.drugName}</span>
                  <span className="font-mono text-[11px] text-[#A7B5C9]">
                    Started {med.startDate} ({med.dosage})
                  </span>
                </div>

                <div className="w-full bg-[#070B14] h-7 rounded-lg overflow-hidden relative border border-white/5">
                  <div
                    className="h-full rounded-lg bg-gradient-to-r from-[#37D6E6]/60 to-[#9079F7]/70 border border-[#37D6E6]/50 flex items-center px-3 text-[10px] font-mono text-white"
                    style={{ marginLeft: `${startPct * 0.7}%`, width: `${widthPct * 0.7}%` }}
                  >
                    <span className="truncate">{med.frequency}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Clinical Overlap Assessment */}
        <div className="p-4 rounded-xl bg-[#070B14]/80 border border-[#F16D76]/30 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-[#F16D76] font-bold uppercase font-mono">
            <AlertTriangle className="w-4 h-4" />
            Pharmacokinetic Exposure Window Analysis
          </div>
          <p className="text-[#F4F7FB] leading-relaxed">
            Patient initiated Amiodarone on 2024-09-18 while concurrently on stable Warfarin 5mg. Due to amiodarone's prolonged volume of distribution and CYP2C9 inhibition half-life, the peak interaction and INR displacement risk persists for up to 4 to 8 weeks following introduction.
          </p>
        </div>
      </div>
    </div>
  );
};
