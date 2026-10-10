import React, { useState } from 'react';
import { getStoredHypotheses, saveStoredHypothesis } from '../../services/storageService';
import { ResearchHypothesis } from '../../types';
import { AlertCircle, CheckCircle2, Layers, Plus, Sparkles, TrendingUp } from 'lucide-react';

export const HypothesisWorkbench: React.FC = () => {
  const [hypotheses, setHypotheses] = useState<ResearchHypothesis[]>(getStoredHypotheses());
  const [showNewModal, setShowNewModal] = useState(false);

  // New Hypothesis Form State
  const [title, setTitle] = useState('');
  const [hypothesisText, setHypothesisText] = useState('');
  const [compoundName, setCompoundName] = useState('');
  const [targetName, setTargetName] = useState('');
  const [proposedValidation, setProposedValidation] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !hypothesisText) return;

    const newHypo: ResearchHypothesis = {
      id: `hypo-${Date.now()}`,
      title,
      hypothesisText,
      compoundName: compoundName || 'Novel Compound Interaction',
      targetName: targetName || 'CYP450 / Allosteric Target',
      uncertaintyScore: 0.5,
      supportingEvidenceCount: 1,
      contradictoryEvidenceCount: 0,
      proposedValidation: proposedValidation || 'Stopped-flow kinetic assay and SPR binding titration.',
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    const updated = saveStoredHypothesis(newHypo);
    setHypotheses(updated);
    setShowNewModal(false);
    setTitle('');
    setHypothesisText('');
    setCompoundName('');
    setTargetName('');
    setProposedValidation('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#37D6E6]" />
            Research Hypothesis Workbench
          </h1>
          <p className="text-xs text-[#A7B5C9] mt-1">
            Formulate, quantify uncertainty, and track mechanistic validation protocols for predicted molecular conflicts
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#37D6E6] text-[#070B14] font-semibold text-xs hover:bg-[#37D6E6]/90 transition-all shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" /> New Hypothesis
        </button>
      </div>

      {/* Hypotheses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {hypotheses.map((item) => (
          <div
            key={item.id}
            className="glass-panel p-6 rounded-xl border border-white/10 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#37D6E6] bg-[#37D6E6]/10 px-2 py-0.5 rounded font-bold">
                  {item.status}
                </span>
                <span className="text-[10px] text-[#64748B] font-mono">
                  Updated: {item.updatedAt}
                </span>
              </div>

              <h2 className="text-base font-display font-bold text-white leading-snug">
                {item.title}
              </h2>

              <p className="text-xs text-[#A7B5C9] leading-relaxed font-mono bg-[#070B14]/60 p-3 rounded-lg border border-white/5">
                {item.hypothesisText}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-white/5">
                  <span className="text-[10px] text-[#64748B] block font-mono">Compound:</span>
                  <span className="font-semibold text-white truncate block">{item.compoundName}</span>
                </div>
                <div className="p-2 rounded bg-white/5">
                  <span className="text-[10px] text-[#64748B] block font-mono">Target:</span>
                  <span className="font-semibold text-[#9079F7] truncate block">{item.targetName}</span>
                </div>
              </div>
            </div>

            {/* Uncertainty Meter & Experimental Validation Plan */}
            <div className="border-t border-white/10 pt-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#64748B]">Uncertainty Level:</span>
                <span className="text-[#EFB85A] font-bold">
                  {(item.uncertaintyScore * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-[#070B14] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#32C8B7] via-[#EFB85A] to-[#F16D76] h-full rounded-full"
                  style={{ width: `${item.uncertaintyScore * 100}%` }}
                />
              </div>

              <div className="text-[11px] text-[#32C8B7] pt-1">
                <span className="font-semibold">Validation Plan:</span> {item.proposedValidation}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Hypothesis Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#101827] border border-white/20 rounded-xl p-6 shadow-2xl space-y-4">
            <h3 className="font-display font-bold text-lg text-white">Create Research Hypothesis</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#A7B5C9] mb-1 font-mono">Hypothesis Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Stereoselective CYP2C9 inhibition by..."
                  className="w-full bg-[#070B14] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#37D6E6]/40"
                />
              </div>

              <div>
                <label className="block text-[#A7B5C9] mb-1 font-mono">Mechanistic Hypothesis</label>
                <textarea
                  required
                  rows={3}
                  value={hypothesisText}
                  onChange={(e) => setHypothesisText(e.target.value)}
                  placeholder="Describe proposed biochemical mechanism, active site residue interactions..."
                  className="w-full bg-[#070B14] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#37D6E6]/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A7B5C9] mb-1 font-mono">Associated Compound</label>
                  <input
                    type="text"
                    value={compoundName}
                    onChange={(e) => setCompoundName(e.target.value)}
                    placeholder="e.g. Amiodarone"
                    className="w-full bg-[#070B14] border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#A7B5C9] mb-1 font-mono">Associated Target</label>
                  <input
                    type="text"
                    value={targetName}
                    onChange={(e) => setTargetName(e.target.value)}
                    placeholder="e.g. CYP2C9 / VKORC1"
                    className="w-full bg-[#070B14] border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A7B5C9] mb-1 font-mono">Proposed Validation Protocol</label>
                <input
                  type="text"
                  value={proposedValidation}
                  onChange={(e) => setProposedValidation(e.target.value)}
                  placeholder="e.g. Cryo-EM ternary complex reconstruction, enzyme assay"
                  className="w-full bg-[#070B14] border border-white/10 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3 py-1.5 rounded-lg text-[#A7B5C9] hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#37D6E6] text-[#070B14] font-semibold hover:bg-[#37D6E6]/90"
                >
                  Save Hypothesis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
