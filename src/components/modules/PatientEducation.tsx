import React, { useState } from 'react';
import { VERIFIED_DRUGS } from '../../data/mockDrugs';
import { BookOpen, GraduationCap, Heart, HelpCircle, Info, ShieldAlert } from 'lucide-react';

export const PatientEducation: React.FC = () => {
  const [selectedDrug, setSelectedDrug] = useState(VERIFIED_DRUGS[0]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#32C8B7]" />
            Patient Education & Medication Literacy Mode
          </h1>
          <p className="text-xs text-[#A7B5C9] mt-1">
            Plain-language explanations, essential questions for your doctor or pharmacist, and safety facts
          </p>
        </div>

        {/* Medicine Chooser */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#64748B]">Select Medicine:</span>
          <select
            value={selectedDrug.id}
            onChange={(e) => {
              const d = VERIFIED_DRUGS.find((item) => item.id === e.target.value);
              if (d) setSelectedDrug(d);
            }}
            className="bg-[#070B14] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#32C8B7]/40"
          >
            {VERIFIED_DRUGS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.genericName} ({d.brandNames[0]})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Patient Education Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Heart className="w-5 h-5 text-[#F16D76]" />
            <h2 className="text-base font-display font-bold text-white">
              What is {selectedDrug.genericName}?
            </h2>
          </div>

          <div className="space-y-3 text-xs leading-relaxed text-[#F4F7FB]">
            <p>
              <strong>Brand Name(s):</strong> {selectedDrug.brandNames.join(', ')}
            </p>
            <p>
              <strong>Primary Purpose:</strong> {selectedDrug.description}
            </p>
            <div className="p-3.5 rounded-lg bg-[#070B14]/70 border border-white/5 space-y-1">
              <span className="font-semibold text-[#32C8B7] block">How it works in your body:</span>
              <p className="text-[#A7B5C9]">
                This medicine works by specifically helping your system regulate key bodily signals to protect your organs and maintain healthy balance.
              </p>
            </div>
          </div>
        </div>

        {/* Questions for Your Healthcare Team */}
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <HelpCircle className="w-5 h-5 text-[#37D6E6]" />
            <h2 className="text-base font-display font-bold text-white">
              Important Questions to Ask Your Clinician
            </h2>
          </div>

          <div className="space-y-2.5 text-xs text-[#A7B5C9]">
            <div className="p-3 rounded-lg bg-[#070B14]/60 border border-white/5 flex items-start gap-2.5">
              <span className="font-mono text-[#37D6E6] font-bold">1.</span>
              <span>
                "Are any of my other prescriptions, over-the-counter painkillers, or vitamins likely to interact with {selectedDrug.genericName}?"
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#070B14]/60 border border-white/5 flex items-start gap-2.5">
              <span className="font-mono text-[#37D6E6] font-bold">2.</span>
              <span>
                "What specific early symptoms (such as unusual bruising, dizziness, or muscle pain) mean I should call your office right away?"
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#070B14]/60 border border-white/5 flex items-start gap-2.5">
              <span className="font-mono text-[#37D6E6] font-bold">3.</span>
              <span>
                "Do I need regular blood tests (like INR, kidney function, or potassium checks) while taking this medicine?"
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-xl bg-[#F16D76]/10 border border-[#F16D76]/30 text-xs text-[#F4F7FB] flex items-center gap-3">
        <ShieldAlert className="w-5 h-5 text-[#F16D76] shrink-0" />
        <div>
          <strong className="text-white">Safety Warning:</strong> Never stop taking, skip, or change the dose of prescribed medications without consulting your prescribing physician or pharmacist.
        </div>
      </div>
    </div>
  );
};
