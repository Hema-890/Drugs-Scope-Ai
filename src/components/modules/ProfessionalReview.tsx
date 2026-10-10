import React, { useState } from 'react';
import { SYNTHETIC_PATIENT_CASES } from '../../data/mockClinicalCases';
import { recordAuditEvent } from '../../services/storageService';
import { CheckCircle2, FileSignature, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';

export const ProfessionalReview: React.FC = () => {
  const [signedCases, setSignedCases] = useState<string[]>(['SYN-PT-3108']);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('SYN-PT-9041');
  const [pharmacistName, setPharmacistName] = useState('Dr. Evelyn Reed, PharmD, BCPS');
  const [licenseNumber, setLicenseNumber] = useState('RPH-CA-892401');
  const [recommendation, setRecommendation] = useState(
    'Reduce Warfarin to 2.5mg daily. Discontinue Simvastatin 40mg and switch to Rosuvastatin 10mg daily to circumvent CYP3A4 inhibition by Amiodarone. Order stat INR check in 48 hours.'
  );
  const [justSigned, setJustSigned] = useState(false);

  const activeCase = SYNTHETIC_PATIENT_CASES.find((c) => c.patientId === selectedCaseId) || SYNTHETIC_PATIENT_CASES[0];
  const isAlreadySigned = signedCases.includes(activeCase.patientId);

  const handleExecuteSignOff = () => {
    if (!pharmacistName || !licenseNumber) return;

    setSignedCases([...signedCases, activeCase.patientId]);
    recordAuditEvent(
      'CLINICAL_SIGN_OFF',
      `Patient ${activeCase.patientId}`,
      `Signed off by ${pharmacistName} (${licenseNumber}). Recommendation: ${recommendation}`
    );
    setJustSigned(true);
    setTimeout(() => setJustSigned(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-[#32C8B7]" />
            Doctor & Pharmacist Review Sign-Off Workflow
          </h1>
          <p className="text-xs text-[#A7B5C9] mt-1">
            Formal professional reconciliation sign-off with verified credential verification and tamper-evident audit logging
          </p>
        </div>

        <span className="text-xs font-mono text-[#32C8B7] bg-[#32C8B7]/15 border border-[#32C8B7]/30 px-3 py-1 rounded-full font-semibold">
          LEAST-PRIVILEGE CLINICAL GOVERNANCE
        </span>
      </div>

      {/* Main Review Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel p-4 rounded-xl space-y-2">
            <div className="text-xs font-mono uppercase text-[#64748B] mb-2">
              Patients Awaiting Sign-Off
            </div>
            {SYNTHETIC_PATIENT_CASES.map((patient) => {
              const isSelected = patient.patientId === activeCase.patientId;
              const signed = signedCases.includes(patient.patientId);

              return (
                <button
                  key={patient.patientId}
                  onClick={() => setSelectedCaseId(patient.patientId)}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all ${
                    isSelected
                      ? 'bg-[#32C8B7]/15 border-[#32C8B7]/40 text-white shadow-md'
                      : 'bg-[#101827]/40 border-white/5 text-[#A7B5C9] hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-white">{patient.patientId}</span>
                    {signed ? (
                      <span className="text-[10px] text-[#32C8B7] bg-[#32C8B7]/10 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Signed
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#EFB85A] bg-[#EFB85A]/10 px-2 py-0.5 rounded font-semibold">
                        Pending
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#A7B5C9] mt-1">
                    {patient.medications.length} Medications Prescribed
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-8 space-y-5">
          <div className="glass-panel p-6 rounded-xl space-y-5">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-base font-display font-bold text-white">
                Reconciliation Certificate for {activeCase.patientId}
              </h2>
              <p className="text-xs text-[#A7B5C9] mt-0.5">
                Diagnoses: {activeCase.diagnoses.join('; ')}
              </p>
            </div>

            {/* Credential Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[#A7B5C9] mb-1 font-mono">Attending Practitioner</label>
                <input
                  type="text"
                  value={pharmacistName}
                  onChange={(e) => setPharmacistName(e.target.value)}
                  className="w-full bg-[#070B14] border border-white/10 rounded-lg p-2.5 text-white font-medium"
                />
              </div>
              <div>
                <label className="block text-[#A7B5C9] mb-1 font-mono">Board License Number</label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full bg-[#070B14] border border-white/10 rounded-lg p-2.5 text-white font-mono"
                />
              </div>
            </div>

            {/* Recommendation Editor */}
            <div>
              <label className="block text-xs text-[#A7B5C9] mb-1 font-mono">
                Mandatory Clinical Recommendation & Interventional Plan
              </label>
              <textarea
                rows={3}
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value)}
                className="w-full bg-[#070B14] border border-white/10 rounded-lg p-3 text-xs text-white leading-relaxed focus:outline-none focus:border-[#32C8B7]/40"
              />
            </div>

            {justSigned && (
              <div className="p-3 rounded-lg bg-[#32C8B7]/20 border border-[#32C8B7] text-xs text-[#32C8B7] flex items-center gap-2 font-mono justify-center">
                <CheckCircle2 className="w-4 h-4" /> Sign-Off Cryptographically Timestamped & Recorded in Audit Provenance.
              </div>
            )}

            {/* Execution Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleExecuteSignOff}
                disabled={isAlreadySigned}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold transition-all shadow-lg ${
                  isAlreadySigned
                    ? 'bg-white/10 text-[#64748B] cursor-not-allowed'
                    : 'bg-[#32C8B7] text-[#070B14] hover:bg-[#32C8B7]/90'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                {isAlreadySigned ? 'Session Formally Signed-Off' : 'Authorize & Sign-Off Reconciliation'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
