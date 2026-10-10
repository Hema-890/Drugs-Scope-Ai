import React, { useState } from 'react';
import { BIOLOGICAL_TARGETS } from '../../data/mockTargets';
import { VERIFIED_DRUGS } from '../../data/mockDrugs';
import { BiologicalTarget, Drug } from '../../types';
import { Boxes, Info, Layers, Network, Search, Sparkles } from 'lucide-react';

interface PathwayNetworkProps {
  initialTarget?: BiologicalTarget | null;
  onNavigateToDrug: (drug: Drug) => void;
}

export const PathwayNetwork: React.FC<PathwayNetworkProps> = ({
  initialTarget,
  onNavigateToDrug
}) => {
  const [selectedTarget, setSelectedTarget] = useState<BiologicalTarget>(
    initialTarget || BIOLOGICAL_TARGETS[0]
  );
  const [filterPathway, setFilterPathway] = useState<string>('all');

  const pathways = Array.from(new Set(BIOLOGICAL_TARGETS.map((t) => t.pathwayName)));

  const filteredTargets = BIOLOGICAL_TARGETS.filter((t) =>
    filterPathway === 'all' ? true : t.pathwayName === filterPathway
  );

  // Drugs that hit this target
  const connectedDrugs = VERIFIED_DRUGS.filter((d) => d.targets.includes(selectedTarget.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <Network className="w-5 h-5 text-[#9079F7]" />
            Receptor & Pathway Intelligence Network
          </h1>
          <p className="text-xs text-[#A7B5C9] mt-1">
            Topological mapping of compound affinities, metabolic enzyme saturation, and receptor competition
          </p>
        </div>

        {/* Pathway Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#64748B]">Filter Pathway:</span>
          <select
            value={filterPathway}
            onChange={(e) => setFilterPathway(e.target.value)}
            className="bg-[#070B14] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#9079F7]/40 font-mono"
          >
            <option value="all">All Pathways ({BIOLOGICAL_TARGETS.length})</option>
            {pathways.map((p, idx) => (
              <option key={idx} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Interactive Network Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4/12): Target Node Registry */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel p-4 rounded-xl">
            <div className="text-xs font-mono uppercase text-[#64748B] mb-2">
              Biological Target Nodes ({filteredTargets.length})
            </div>
            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {filteredTargets.map((target) => {
                const isSelected = selectedTarget.id === target.id;
                return (
                  <button
                    key={target.id}
                    onClick={() => setSelectedTarget(target)}
                    className={`w-full text-left p-3.5 rounded-xl text-xs transition-all border ${
                      isSelected
                        ? 'bg-[#9079F7]/20 border-[#9079F7] text-white shadow-lg'
                        : 'bg-[#101827]/40 border-white/5 text-[#A7B5C9] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold font-mono text-sm text-white">
                        {target.geneSymbol}
                      </span>
                      <span className="text-[10px] font-mono bg-[#32C8B7]/10 text-[#32C8B7] border border-[#32C8B7]/30 px-2 py-0.5 rounded">
                        {target.targetType}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#A7B5C9] mt-1 line-clamp-1">
                      {target.targetName}
                    </div>
                    <div className="text-[10px] text-[#64748B] font-mono mt-1">
                      {target.pathwayName}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center & Right Column (8/12): Visual Network Canvas & Active Connections */}
        <div className="lg:col-span-8 space-y-5">
          {/* Visual Interactive Graph Node Stage */}
          <div className="glass-panel p-6 rounded-xl border border-white/10 relative overflow-hidden">
            <div className="text-xs font-mono uppercase text-[#37D6E6] mb-4 flex items-center justify-between">
              <span>Interactive Relationship Graph Canvas</span>
              <span className="text-[#64748B]">UniProt: {selectedTarget.uniprotId}</span>
            </div>

            {/* Simulated 2D/3D Node Graph visualization */}
            <div className="relative h-[340px] rounded-xl bg-[#070B14] border border-white/10 flex items-center justify-center p-6 overflow-hidden">
              {/* Background grid lines */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1D2A3E]/40 via-[#070B14] to-[#070B14] pointer-events-none" />

              {/* Central Target Node */}
              <div className="relative z-10 p-5 rounded-2xl bg-gradient-to-br from-[#101827] to-[#1D2A3E] border-2 border-[#9079F7] shadow-2xl text-center glow-violet max-w-[200px]">
                <div className="w-3 h-3 rounded-full bg-[#9079F7] mx-auto mb-2 animate-ping" />
                <div className="font-mono font-extrabold text-base text-white">
                  {selectedTarget.geneSymbol}
                </div>
                <div className="text-[10px] text-[#A7B5C9] mt-0.5 line-clamp-1">
                  {selectedTarget.targetName}
                </div>
                <div className="text-[9px] font-mono text-[#32C8B7] mt-1 bg-white/5 px-2 py-0.5 rounded">
                  {selectedTarget.targetType}
                </div>
              </div>

              {/* Connected Drug Satellites positioned in orbit */}
              {connectedDrugs.map((drug, idx) => {
                const total = connectedDrugs.length || 1;
                const angle = (idx / total) * Math.PI * 2;
                const radius = 135;
                const left = 50 + (Math.cos(angle) * radius * 100) / 360;
                const top = 50 + (Math.sin(angle) * radius * 100) / 360;

                return (
                  <button
                    key={drug.id}
                    onClick={() => onNavigateToDrug(drug)}
                    style={{ left: `${left}%`, top: `${top}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 p-2.5 rounded-xl bg-[#101827] border border-[#37D6E6]/60 shadow-lg hover:scale-110 hover:border-[#37D6E6] transition-all text-center group cursor-pointer"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#37D6E6] mx-auto mb-1" />
                    <div className="font-semibold text-[11px] text-white group-hover:text-[#37D6E6]">
                      {drug.genericName}
                    </div>
                    <div className="text-[9px] font-mono text-[#A7B5C9]">
                      RxCUI {drug.rxNormCui}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Target Description & Cellular Localization */}
            <div className="mt-5 space-y-3">
              <div>
                <div className="text-xs font-mono uppercase text-[#64748B] mb-1">
                  Biological Function & Pathway Role
                </div>
                <p className="text-xs text-[#F4F7FB] leading-relaxed">
                  {selectedTarget.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-[#070B14]/60 border border-white/5 text-xs">
                  <span className="text-[#64748B] block text-[10px] font-mono uppercase">
                    Cellular Localization
                  </span>
                  <span className="text-white font-medium">{selectedTarget.cellularLocation}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#070B14]/60 border border-white/5 text-xs">
                  <span className="text-[#64748B] block text-[10px] font-mono uppercase">
                    Canonical Pathway
                  </span>
                  <span className="text-[#32C8B7] font-medium">{selectedTarget.pathwayName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
