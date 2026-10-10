import React, { useEffect, useState } from 'react';
import { PROTEIN_STRUCTURES } from '../../data/mockStructures';
import {
  fetchAndParsePdbCoordinates,
  fetchPdbMetadata,
  PdbAtom,
  PdbParsedModel
} from '../../services/rcsbPdbApi';
import { ProteinStructure } from '../../types';
import { MolecularViewer } from '../3d/MolecularViewer';
import {
  Boxes,
  Compass,
  Download,
  ExternalLink,
  Info,
  Layers,
  Loader2,
  RefreshCw,
  Search,
  Sparkles
} from 'lucide-react';

interface MolecularLabProps {
  initialPdbId?: string;
}

export const MolecularLab: React.FC<MolecularLabProps> = ({ initialPdbId }) => {
  const [selectedPdbId, setSelectedPdbId] = useState<string>(initialPdbId || '6WVR');
  const [customPdbInput, setCustomPdbInput] = useState<string>('');
  const [currentStructure, setCurrentStructure] = useState<ProteinStructure>(
    PROTEIN_STRUCTURES[0]
  );
  const [parsedModel, setParsedModel] = useState<PdbParsedModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [inspectedAtom, setInspectedAtom] = useState<PdbAtom | null>(null);

  // Load structure coordinates
  const loadPdbStructure = async (pdbId: string) => {
    setLoading(true);
    setInspectedAtom(null);

    try {
      const [meta, model] = await Promise.all([
        fetchPdbMetadata(pdbId),
        fetchAndParsePdbCoordinates(pdbId)
      ]);
      setCurrentStructure(meta);
      setParsedModel(model);
      setSelectedPdbId(pdbId.toUpperCase());
    } catch (err) {
      console.error('Failed to load PDB', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialPdbId) {
      loadPdbStructure(initialPdbId);
    } else {
      loadPdbStructure('6WVR');
    }
  }, [initialPdbId]);

  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPdbInput.trim().length === 4) {
      loadPdbStructure(customPdbInput.trim().toUpperCase());
      setCustomPdbInput('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Live RCSB PDB Loader */}
      <div className="glass-panel p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <Boxes className="w-5 h-5 text-[#37D6E6]" />
              Advanced 3D Molecular Structure Lab
            </h1>
            <span className="text-[10px] font-mono bg-[#37D6E6]/10 text-[#37D6E6] border border-[#37D6E6]/30 px-2 py-0.5 rounded font-semibold">
              FLAGSHIP VISUAL WORKBENCH
            </span>
          </div>
          <p className="text-xs text-[#A7B5C9] mt-1">
            Real macromolecular coordinates directly retrieved from RCSB Protein Data Bank with interactive WebGL shaders
          </p>
        </div>

        {/* Live RCSB Fetch Input */}
        <form onSubmit={handleCustomSearch} className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              maxLength={4}
              value={customPdbInput}
              onChange={(e) => setCustomPdbInput(e.target.value.toUpperCase())}
              placeholder="e.g. 4HHB, 1BNA, 6LU7"
              className="bg-[#070B14] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-[#64748B] font-mono w-44 uppercase focus:outline-none focus:border-[#37D6E6]/40"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-lg bg-[#37D6E6] text-[#070B14] font-semibold text-xs hover:bg-[#37D6E6]/90 transition-all flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" /> Fetch PDB
          </button>
        </form>
      </div>

      {/* Main Workbench Layout: Left Catalog, Center 3D Viewer, Right Scientific Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (3/12): Experimental PDB Library */}
        <div className="lg:col-span-3 space-y-4">
          <div className="glass-panel p-4 rounded-xl">
            <div className="text-xs font-mono uppercase text-[#64748B] mb-3">
              Validated Drug-Target Complexes
            </div>
            <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1">
              {PROTEIN_STRUCTURES.map((struct) => {
                const isSelected = selectedPdbId === struct.pdbId;
                return (
                  <button
                    key={struct.pdbId}
                    onClick={() => loadPdbStructure(struct.pdbId)}
                    className={`w-full text-left p-3 rounded-lg text-xs transition-all border ${
                      isSelected
                        ? 'bg-[#37D6E6]/15 border-[#37D6E6]/40 text-white shadow-md'
                        : 'bg-[#101827]/40 border-transparent text-[#A7B5C9] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-white text-xs">{struct.pdbId}</span>
                      <span className="text-[10px] text-[#32C8B7]">{struct.targetSymbol}</span>
                    </div>
                    <div className="text-[11px] text-[#A7B5C9] truncate mt-1">
                      {struct.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#64748B] font-mono">
                      <span>{struct.method}</span>
                      {struct.resolution && <span>• {struct.resolution} Å</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center Column (6/12): Interactive WebGL Molecular Viewport */}
        <div className="lg:col-span-6 space-y-4">
          {loading || !parsedModel ? (
            <div className="h-[540px] rounded-xl bg-[#070B14] border border-white/10 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#37D6E6] animate-spin" />
              <div className="text-xs font-mono text-[#A7B5C9]">
                Fetching experimental coordinates for PDB {selectedPdbId} from RCSB...
              </div>
            </div>
          ) : (
            <MolecularViewer
              model={parsedModel}
              title={currentStructure.title}
              resolution={currentStructure.resolution}
              method={currentStructure.method}
              onAtomSelect={(atom) => setInspectedAtom(atom)}
            />
          )}
        </div>

        {/* Right Column (3/12): Scientific Inspector & Atomic Telemetry */}
        <div className="lg:col-span-3 space-y-4">
          {/* Structure Overview */}
          <div className="glass-panel p-4 rounded-xl space-y-3">
            <div className="text-xs font-mono uppercase text-[#37D6E6] font-semibold">
              Structural Telemetry
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                <span className="text-[#64748B]">Resolution:</span>
                <span className="font-mono text-white">
                  {currentStructure.resolution ? `${currentStructure.resolution} Å` : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                <span className="text-[#64748B]">Method:</span>
                <span className="font-mono text-white">{currentStructure.method}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                <span className="text-[#64748B]">Target Entity:</span>
                <span className="font-mono text-[#9079F7] font-bold">
                  {currentStructure.targetSymbol}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                <span className="text-[#64748B]">Chains:</span>
                <span className="font-mono text-white">
                  {currentStructure.chains.join(', ')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Bound Ligands:</span>
                <span className="font-mono text-[#EFB85A] font-bold">
                  {currentStructure.ligandIds.join(', ') || 'None'}
                </span>
              </div>
            </div>
          </div>

          {/* Atomic Inspection Sheet */}
          <div className="glass-panel p-4 rounded-xl space-y-3">
            <div className="text-xs font-mono uppercase text-[#9079F7] font-semibold">
              Atomic Inspector
            </div>
            {inspectedAtom ? (
              <div className="space-y-2 text-xs bg-[#070B14] p-3 rounded-lg border border-white/10 font-mono">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Type:</span>
                  <span className="text-[#37D6E6]">
                    {inspectedAtom.isHetatm ? 'Heteroatom (Ligand)' : 'Standard Amino Acid'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Residue:</span>
                  <span className="text-white">
                    {inspectedAtom.resName} #{inspectedAtom.resSeq}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Element:</span>
                  <span className="text-[#32C8B7]">
                    {inspectedAtom.element} ({inspectedAtom.name})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Chain ID:</span>
                  <span className="text-white">{inspectedAtom.chainID}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Coordinates:</span>
                  <span className="text-[11px] text-[#EFB85A]">
                    [{inspectedAtom.x.toFixed(1)}, {inspectedAtom.y.toFixed(1)}, {inspectedAtom.z.toFixed(1)}]
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-[#64748B] italic p-3 bg-[#070B14]/40 rounded-lg text-center">
                Click any atom in the 3D viewport to inspect its residue coordinate matrix.
              </div>
            )}
          </div>

          {/* Experimental Notes & Limitations */}
          {currentStructure.experimentalNotes && (
            <div className="glass-panel p-4 rounded-xl space-y-2 text-xs">
              <div className="text-xs font-mono uppercase text-[#64748B]">
                Crystallographic Notes
              </div>
              <p className="text-[#A7B5C9] leading-relaxed text-[11px]">
                {currentStructure.experimentalNotes}
              </p>
              <a
                href={currentStructure.rcsbUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[#37D6E6] hover:underline font-mono text-[11px] pt-1"
              >
                <span>Official RCSB Entry</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
