import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Boxes, CheckCircle2, GitCompare, Play, Sparkles } from 'lucide-react';

interface StoryStep {
  step: number;
  stage: string;
  headline: string;
  detail: string;
  telemetry: string;
}

export const MolecularStoryboard: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps: StoryStep[] = [
    {
      step: 1,
      stage: 'Compound Identity & Ingestion',
      headline: 'Dual Prescribing: Warfarin Sodium + Amiodarone HCl',
      detail: 'A 72-year-old patient with persistent atrial fibrillation and ventricular tachycardia receives oral Warfarin 5mg and is initiated on Amiodarone 200mg daily. Both drugs enter hepatic first-pass metabolism simultaneously.',
      telemetry: 'RxCUI: 11289 & 703 • Oral Bioavailability: 95% & 50%'
    },
    {
      step: 2,
      stage: 'Hepatic Cytochrome Saturation',
      headline: 'Enzymatic Competition at Cytochrome P450 2C9',
      detail: 'S-Warfarin relies entirely on CYP2C9 monooxygenase for 7-hydroxylation clearance. Concurrently, amiodarone and desethylamiodarone bind with high non-competitive affinity to CYP2C9, creating a steep metabolic bottleneck.',
      telemetry: 'Target: CYP2C9 (P11712) • Enzyme Inhibition Constant Ki: ~5 uM'
    },
    {
      step: 3,
      stage: 'Macromolecular Active Site Occlusion',
      headline: '3D Binding in the Catalytic Cleft (PDB 4GQR & 6WVR)',
      detail: 'In the crystallographic active site of CYP2C9, the 4-hydroxycoumarin core of warfarin requires specific axial orientation 4.2 Å above the central heme iron. Amiodarone induces steric crowding, halting electron transfer from NADPH-cytochrome P450 reductase.',
      telemetry: 'RCSB PDB 4GQR • Resolution: 2.45 Å • Method: X-Ray Diffraction'
    },
    {
      step: 4,
      stage: 'Target Epoxide Reduction Halting',
      headline: 'Severe Depletion of Vitamin K Clotting Factors (VKORC1)',
      detail: 'With S-warfarin clearance impaired by ~50%, accumulated plasma levels completely arrest VKORC1 in endoplasmic reticulum membranes. Functional prothrombin (Factor II) and Factor VII carboxylations drop below 15% of physiological levels.',
      telemetry: 'Target: VKORC1 (Q9BQB6) • INR Surge: > 4.5'
    },
    {
      step: 5,
      stage: 'Clinical Consequence & Interventional Resolution',
      headline: 'Hemorrhagic Cascade Prevention via Proactive Dose Modification',
      detail: 'Without intervention, the patient experiences spontaneous mucosal and intracranial hemorrhage. Drug Scope AI detects the conflict before dispensing and prescribes preemptive 40% warfarin dose titration with alternate day INR surveillance.',
      telemetry: 'Intervention: 40% Dose Reduction • Clinical Sign-off Mandatory'
    }
  ];

  const current = steps[activeStep];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#37D6E6]" />
            Molecular Evidence Storyboard: Guided Presentation Mode
          </h1>
          <p className="text-xs text-[#A7B5C9] mt-1">
            An interactive step-by-step scientific narrative linking compound ingestion to active site occlusion and clinical outcome
          </p>
        </div>

        <span className="text-xs font-mono text-[#37D6E6] bg-[#37D6E6]/10 border border-[#37D6E6]/30 px-3 py-1 rounded-full font-semibold">
          LIVE DEMO MODE • STEP {activeStep + 1} OF {steps.length}
        </span>
      </div>

      {/* Storyboard Progression Card */}
      <div className="glass-panel p-8 rounded-2xl border border-white/10 space-y-6 max-w-3xl mx-auto shadow-2xl">
        {/* Step Indicators */}
        <div className="flex items-center justify-between">
          {steps.map((st, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`w-9 h-9 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all border ${
                activeStep === idx
                  ? 'bg-[#37D6E6] text-[#070B14] border-[#37D6E6] shadow-lg scale-110'
                  : activeStep > idx
                  ? 'bg-[#32C8B7]/20 text-[#32C8B7] border-[#32C8B7]/40'
                  : 'bg-[#101827] text-[#64748B] border-white/10 hover:border-white/20'
              }`}
            >
              {st.step}
            </button>
          ))}
        </div>

        <div className="space-y-2 border-b border-white/10 pb-4">
          <span className="text-xs font-mono text-[#9079F7] font-semibold uppercase tracking-wider">
            {current.stage}
          </span>
          <h2 className="text-xl font-display font-extrabold text-white">
            {current.headline}
          </h2>
        </div>

        <p className="text-sm text-[#F4F7FB] leading-relaxed font-mono bg-[#070B14]/80 p-5 rounded-xl border border-white/10">
          {current.detail}
        </p>

        <div className="p-3.5 rounded-lg bg-[#172134] border border-[#37D6E6]/30 text-xs font-mono text-[#37D6E6] flex items-center justify-between">
          <span>Biomedical Telemetry:</span>
          <span className="text-white font-bold">{current.telemetry}</span>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
            disabled={activeStep === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#101827] border border-white/10 text-xs text-[#A7B5C9] disabled:opacity-40 disabled:cursor-not-allowed hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" /> Previous Step
          </button>

          <button
            onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
            disabled={activeStep === steps.length - 1}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#37D6E6] text-[#070B14] font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#37D6E6]/90 shadow-lg"
          >
            Next Scientific Step <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
