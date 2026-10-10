import React from 'react';
import { VERIFIED_DRUGS } from '../../data/mockDrugs';
import { BIOLOGICAL_TARGETS } from '../../data/mockTargets';
import { AlertCircle, Check, GitCompare, Info, X } from 'lucide-react';

export const EvidenceGapAtlas: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-[#9079F7]" />
            Evidence Gap Atlas: Multi-Dimensional Completeness Matrix
          </h1>
          <p className="text-xs text-[#A7B5C9] mt-1">
            Expose dark spots in biomedical research: where structural, in vitro, and clinical post-marketing records are missing
          </p>
        </div>

        <span className="text-xs font-mono text-[#EFB85A] bg-[#EFB85A]/10 border border-[#EFB85A]/30 px-3 py-1 rounded-full font-semibold">
          EVIDENCE AUDIT • SAFETY NON-INFERENCE
        </span>
      </div>

      <div className="glass-panel p-6 rounded-xl border border-white/10 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[#64748B] font-mono text-[10px] uppercase">
                <th className="pb-3">Compound</th>
                <th className="pb-3 text-center">RxNorm CUI</th>
                <th className="pb-3 text-center">ChEMBL Target Affinity</th>
                <th className="pb-3 text-center">RCSB 3D Structure</th>
                <th className="pb-3 text-center">FDA Boxed Warning</th>
                <th className="pb-3 text-center">FAERS Disproportionality</th>
                <th className="pb-3 text-right">Completeness Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {VERIFIED_DRUGS.map((d) => {
                const hasPdb = Boolean(d.structurePdbId);
                const hasBoxed = Boolean(d.blackBoxWarning);
                const score = 60 + (hasPdb ? 20 : 0) + (hasBoxed ? 20 : 10);

                return (
                  <tr key={d.id} className="text-[#A7B5C9] hover:bg-white/5 transition-colors">
                    <td className="py-3 font-semibold text-white">{d.genericName}</td>
                    <td className="py-3 text-center font-mono text-[#37D6E6]">
                      <Check className="w-4 h-4 text-[#32C8B7] mx-auto" />
                    </td>
                    <td className="py-3 text-center">
                      <Check className="w-4 h-4 text-[#32C8B7] mx-auto" />
                    </td>
                    <td className="py-3 text-center">
                      {hasPdb ? (
                        <span className="font-mono text-[10px] text-[#37D6E6] bg-[#37D6E6]/10 px-2 py-0.5 rounded">
                          {d.structurePdbId}
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#EFB85A] font-mono">Gap Identified</span>
                      )}
                    </td>
                    <td className="py-3 text-center">
                      {hasBoxed ? (
                        <Check className="w-4 h-4 text-[#F16D76] mx-auto" />
                      ) : (
                        <span className="text-[10px] text-[#64748B] font-mono">Standard Label</span>
                      )}
                    </td>
                    <td className="py-3 text-center">
                      <Check className="w-4 h-4 text-[#32C8B7] mx-auto" />
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-white">
                      <span className={score >= 90 ? 'text-[#32C8B7]' : 'text-[#EFB85A]'}>
                        {score}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[#070B14] border border-white/10 text-xs text-[#64748B] flex items-center gap-3">
        <Info className="w-4 h-4 text-[#37D6E6] shrink-0" />
        <div>
          <strong className="text-[#A7B5C9]">Critical Axiom:</strong> The absence of an experimental 3D crystal structure or adverse FAERS alert for a compound does not represent evidence of safety or lack of clinical receptor interaction.
        </div>
      </div>
    </div>
  );
};
