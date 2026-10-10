import React, { useState } from 'react';
import { SYNTHETIC_PATIENT_CASES } from '../../data/mockClinicalCases';
import { ClinicalPatientCase } from '../../types';
import {
  AlertTriangle,
  CheckCircle,
  FileCheck,
  HeartPulse,
  Info,
  ShieldCheck,
  Stethoscope,
  UserCheck
} from 'lucide-react';

export const ClinicalWorkspace: React.FC = () => {
  const [cases, setCases] = useState<ClinicalPatientCase[]>(SYNTHETIC_PATIENT_CASES);
  const [selectedCaseId, setSelectedCaseId] = useState<string>(SYNTHETIC_PATIENT_CASES[0].patientId);
  const [noteInput, setNoteInput] = useState<string>('');

  const activeCase = cases.find((c) => c.patientId === selectedCaseId) || cases[0];

  const handleSignOff = () => {
    const updated = cases.map((c) => {
      if (c.patientId === activeCase.patientId) {
        return {
          ...c,
          reviewStatus: 'Signed-Off' as const,
          reviewerNotes: (c.reviewerNotes || '') + (noteInput ? `\n[Addendum]: ${noteInput}` : ''),
          signedOffBy: 'Dr. Evelyn Reed, PharmD (Lead Reviewer)',
          signedOffAt: new Date().toISOString()
        };
      }
      return c;
    });
    setCases(updated);
    setNoteInput('');
  };

  return (
    <div className="space-y-6">
      {/* Synthetic Case Assurance Banner */}
      <div className="p-4 rounded-xl bg-[#070B14] border border-[#37D6E6]/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#37D6E6]/10 text-[#37D6E6]">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-display font-bold text-white">
              Clinical Medication Review Workspace
            </h1>
            <p className="text-xs text-[#A7B5C9]">
              Multidisciplinary reconciliation and risk escalation for complex polypharmacy patients
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-[#32C8B7] bg-[#32C8B7]/15 border border-[#32C8B7]/30 px-3 py-1 rounded-full font-semibold">
          SYNTHETIC DEMO DATASET • HIPAA SAFE
        </span>
      </div>

      {/* Main 2-Column Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4/12): Patient Selector & Vitals */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel p-4 rounded-xl space-y-2">
            <div className="text-xs font-mono uppercase text-[#64748B] mb-2">
              Assigned Clinical Cases ({cases.length})
            </div>
            {cases.map((patient) => {
              const isSelected = patient.patientId === activeCase.patientId;
              return (
                <button
                  key={patient.patientId}
                  onClick={() => setSelectedCaseId(patient.patientId)}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all ${
                    isSelected
                      ? 'bg-[#37D6E6]/15 border-[#37D6E6]/40 text-white shadow-md'
                      : 'bg-[#101827]/40 border-white/5 text-[#A7B5C9] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-white text-xs">{patient.patientId}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        patient.reviewStatus === 'Signed-Off'
                          ? 'bg-[#32C8B7]/20 text-[#32C8B7]'
                          : patient.reviewStatus === 'In Review'
                          ? 'bg-[#EFB85A]/20 text-[#EFB85A]'
                          : 'bg-white/10 text-white'
                      }`}
                    >
                      {patient.reviewStatus}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#A7B5C9] mt-1">
                    {patient.age}y {patient.gender} • {patient.medications.length} Concurrent Meds
                  </div>
                </button>
              );
            })}
          </div>

          {/* Organ Function & Lab Parameters */}
          <div className="glass-panel p-4 rounded-xl space-y-3">
            <div className="text-xs font-mono uppercase text-[#64748B]">
              Physiological Clearance Parameters
            </div>
            <div className="p-3 rounded-lg bg-[#070B14]/70 border border-white/5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Estimated GFR:</span>
                <span className="font-mono text-white font-bold">
                  {activeCase.renalFunction.egfr} mL/min/1.73m²
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Serum Creatinine:</span>
                <span className="font-mono text-white font-bold">
                  {activeCase.renalFunction.serumCreatinine} mg/dL
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Renal Stage:</span>
                <span className="text-[#EFB85A] font-medium">
                  {activeCase.renalFunction.stage}
                </span>
              </div>
              <div className="flex justify-between border-t border-white/5 pt-2">
                <span className="text-[#64748B]">Hepatic Status:</span>
                <span className="text-[#32C8B7] font-medium">{activeCase.hepaticFunction}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (8/12): Medication Regimen & Sign-off Actions */}
        <div className="lg:col-span-8 space-y-5">
          {/* Active Medication Regimen Table */}
          <div className="glass-panel p-6 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-display font-bold text-white uppercase tracking-wider font-mono">
                Active In-Hospital & Outpatient Regimen
              </h2>
              <span className="text-xs text-[#A7B5C9]">
                {activeCase.medications.length} Prescribed Agents
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[#64748B] font-mono text-[10px] uppercase">
                    <th className="pb-2.5">Medication</th>
                    <th className="pb-2.5">Dosage & Frequency</th>
                    <th className="pb-2.5">Route</th>
                    <th className="pb-2.5">Prescriber</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {activeCase.medications.map((med, idx) => (
                    <tr key={idx} className="text-[#A7B5C9]">
                      <td className="py-3 font-semibold text-white">{med.drugName}</td>
                      <td className="py-3 font-mono text-[#37D6E6]">
                        {med.dosage} • {med.frequency}
                      </td>
                      <td className="py-3">{med.route}</td>
                      <td className="py-3 text-[11px] text-[#64748B]">{med.prescriber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Reviewer Alert & Reconciliation Field */}
            {activeCase.reviewerNotes && (
              <div className="p-4 rounded-xl bg-[#F16D76]/10 border border-[#F16D76]/30 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F16D76] uppercase font-mono">
                  <AlertTriangle className="w-4 h-4" /> Pharmacist & Clinical Review Findings
                </div>
                <p className="text-xs text-[#F4F7FB] leading-relaxed whitespace-pre-line font-mono">
                  {activeCase.reviewerNotes}
                </p>
                {activeCase.signedOffBy && (
                  <div className="pt-2 text-[10px] text-[#32C8B7] font-mono">
                    Signed-off by {activeCase.signedOffBy} on {new Date(activeCase.signedOffAt!).toLocaleDateString()}
                  </div>
                )}
              </div>
            )}

            {/* Reconciliation Sign-off Bar */}
            {activeCase.reviewStatus !== 'Signed-Off' ? (
              <div className="border-t border-white/10 pt-4 space-y-3">
                <textarea
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Enter pharmacist reconciliation notes or dosage recommendation..."
                  rows={2}
                  className="w-full bg-[#070B14] border border-white/10 rounded-lg p-3 text-xs text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#37D6E6]/40"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleSignOff}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#32C8B7] text-[#070B14] font-semibold text-xs hover:bg-[#32C8B7]/90 transition-all shadow-md"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Complete Reconciliation Sign-Off
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-[#32C8B7]/10 border border-[#32C8B7]/30 text-xs text-[#32C8B7] flex items-center gap-2 font-mono justify-center">
                <ShieldCheck className="w-4 h-4" />
                Case Signed-Off and Verified in Audit Trail
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
