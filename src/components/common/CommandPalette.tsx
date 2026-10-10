import React, { useEffect, useState } from 'react';
import { VERIFIED_DRUGS } from '../../data/mockDrugs';
import { BIOLOGICAL_TARGETS } from '../../data/mockTargets';
import { PROTEIN_STRUCTURES } from '../../data/mockStructures';
import { Activity, Boxes, Compass, FileText, GitCompare, Search, X } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (moduleId: string, itemData?: any) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const filteredDrugs = VERIFIED_DRUGS.filter(
    (d) =>
      d.genericName.toLowerCase().includes(q) ||
      d.brandNames.some((b) => b.toLowerCase().includes(q)) ||
      d.drugClass.toLowerCase().includes(q)
  );

  const filteredTargets = BIOLOGICAL_TARGETS.filter(
    (t) =>
      t.geneSymbol.toLowerCase().includes(q) ||
      t.targetName.toLowerCase().includes(q) ||
      t.uniprotId.toLowerCase().includes(q)
  );

  const filteredPdb = PROTEIN_STRUCTURES.filter(
    (p) =>
      p.pdbId.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      p.targetSymbol.toLowerCase().includes(q)
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-2xl bg-[#101827] border border-white/20 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-white/10 gap-3">
          <Search className="w-5 h-5 text-[#37D6E6]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search drugs, targets (CYP2C9, VKORC1), PDBs (6WVR), or modules..."
            className="flex-1 bg-transparent border-none text-white text-sm focus:outline-none placeholder:text-[#64748B]"
            autoFocus
          />
          <button onClick={onClose} className="text-[#A7B5C9] hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {/* Quick Module Jump */}
          <div>
            <div className="text-[10px] font-mono uppercase text-[#64748B] px-2 mb-1">
              Quick Workspaces
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  onNavigate('molecular-lab');
                  onClose();
                }}
                className="flex items-center gap-2 p-2 rounded-lg bg-[#172134]/60 hover:bg-[#37D6E6]/15 hover:border-[#37D6E6]/40 border border-white/5 text-left text-xs transition-colors"
              >
                <Boxes className="w-4 h-4 text-[#9079F7]" />
                <span className="text-[#F4F7FB] font-medium">3D Molecular Lab</span>
              </button>
              <button
                onClick={() => {
                  onNavigate('interaction-review');
                  onClose();
                }}
                className="flex items-center gap-2 p-2 rounded-lg bg-[#172134]/60 hover:bg-[#37D6E6]/15 hover:border-[#37D6E6]/40 border border-white/5 text-left text-xs transition-colors"
              >
                <GitCompare className="w-4 h-4 text-[#37D6E6]" />
                <span className="text-[#F4F7FB] font-medium">Interaction Review</span>
              </button>
            </div>
          </div>

          {/* Drugs */}
          {filteredDrugs.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase text-[#64748B] px-2 mb-1">
                Verified Medicines ({filteredDrugs.length})
              </div>
              <div className="space-y-1">
                {filteredDrugs.slice(0, 4).map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      onNavigate('medicine-explorer', d);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 text-left text-xs transition-colors"
                  >
                    <div>
                      <span className="font-semibold text-white">{d.genericName}</span>
                      <span className="text-[11px] text-[#A7B5C9] ml-2">
                        ({d.brandNames.join(', ')})
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#37D6E6] bg-[#37D6E6]/10 px-2 py-0.5 rounded">
                      RxCUI {d.rxNormCui}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Biological Targets */}
          {filteredTargets.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase text-[#64748B] px-2 mb-1">
                Biological Targets & Enzymes ({filteredTargets.length})
              </div>
              <div className="space-y-1">
                {filteredTargets.slice(0, 3).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onNavigate('pathway-network', t);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 text-left text-xs transition-colors"
                  >
                    <div>
                      <span className="font-semibold text-[#9079F7]">{t.geneSymbol}</span>
                      <span className="text-[11px] text-[#A7B5C9] ml-2">{t.targetName}</span>
                    </div>
                    <span className="font-mono text-[10px] text-[#32C8B7] bg-[#32C8B7]/10 px-2 py-0.5 rounded">
                      UniProt {t.uniprotId}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3D Macromolecular Structures */}
          {filteredPdb.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase text-[#64748B] px-2 mb-1">
                RCSB 3D Macromolecules ({filteredPdb.length})
              </div>
              <div className="space-y-1">
                {filteredPdb.slice(0, 3).map((p) => (
                  <button
                    key={p.pdbId}
                    onClick={() => {
                      onNavigate('molecular-lab', p);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 text-left text-xs transition-colors"
                  >
                    <div>
                      <span className="font-mono font-bold text-[#37D6E6]">PDB {p.pdbId}</span>
                      <span className="text-[11px] text-[#A7B5C9] ml-2 truncate max-w-sm inline-block">
                        {p.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/60 font-mono">{p.method}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-2.5 bg-[#070B14] border-t border-white/10 flex items-center justify-between text-[11px] text-[#64748B]">
          <span>Use ⇅ to navigate, Enter to select</span>
          <span className="font-mono">ESC to dismiss</span>
        </div>
      </div>
    </div>
  );
};
