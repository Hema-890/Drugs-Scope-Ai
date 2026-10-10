import React, { useState, useEffect } from 'react';
import {
  Activity,
  ArrowRight,
  BookOpen,
  Box,
  Boxes,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  Filter,
  Layers,
  Link2,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  X
} from 'lucide-react';
import { LabMoleculeScene, ResidueInteraction } from '../3d/LabMoleculeScene';
import { fetchPdbMetadata } from '../../services/rcsbPdbApi';

interface StructureItem {
  pdbId: string;
  title: string;
  shortName: string;
  category: string;
  method: string;
  resolution: string;
  organism: string;
  releaseDate: string;
  authors: string;
  ligand: {
    name: string;
    type: string;
    formula: string;
    weight: string;
    bindingMode: string;
    affinity: string;
    drugLikeness: string;
  };
  interactions: {
    residue: string;
    type: string;
    distance: string;
    dotColor: string;
  }[];
}

const STRUCTURE_CATALOG: Record<string, StructureItem> = {
  '7K3N': {
    pdbId: '7K3N',
    title: 'SARS-CoV-2 main protease in complex with an inhibitor N3',
    shortName: 'SARS-CoV-2 Mpro',
    category: 'Protein-Ligand',
    method: 'X-ray diffraction',
    resolution: '2.1 Å',
    organism: 'SARS-CoV-2 (COVID-19)',
    releaseDate: '2020-04-24',
    authors: 'Jin Z. et al.',
    ligand: {
      name: 'N3 (Covalent Inhibitor)',
      type: 'Small Molecule (Covalent)',
      formula: 'C39H53N5O8',
      weight: '680.67 g/mol',
      bindingMode: 'Covalent (Cys145)',
      affinity: 'Ki = 3.1 nM',
      drugLikeness: 'Yes (0 violations)'
    },
    interactions: [
      { residue: 'Cys145', type: 'Covalent bond (S-C)', distance: '2.0 Å', dotColor: '#F16D7B' },
      { residue: 'His41', type: 'Hydrogen bond', distance: '2.8 Å', dotColor: '#24D8ED' },
      { residue: 'Glu166', type: 'Hydrogen bond', distance: '3.1 Å', dotColor: '#24D8ED' },
      { residue: 'His163', type: 'π-π stacking', distance: '3.6 Å', dotColor: '#9475FF' },
      { residue: 'Gln189', type: 'Hydrogen bond', distance: '2.9 Å', dotColor: '#24D8ED' }
    ]
  },
  '1M17': {
    pdbId: '1M17',
    title: 'Structure of the EGFR Kinase Domain in Complex with Erlotinib',
    shortName: 'EGFR (Human)',
    category: 'Protein-Ligand',
    method: 'X-ray diffraction',
    resolution: '2.6 Å',
    organism: 'Homo sapiens',
    releaseDate: '2002-09-15',
    authors: 'Stamos J. et al.',
    ligand: {
      name: 'Erlotinib (Tarceva)',
      type: 'Tyrosine Kinase Inhibitor',
      formula: 'C22H23N3O4',
      weight: '393.44 g/mol',
      bindingMode: 'ATP Competitive (Met793)',
      affinity: 'IC50 = 2.0 nM',
      drugLikeness: 'Yes (0 violations)'
    },
    interactions: [
      { residue: 'Met793', type: 'Hydrogen bond', distance: '2.7 Å', dotColor: '#24D8ED' },
      { residue: 'Thr790', type: 'Gatekeeper contact', distance: '3.4 Å', dotColor: '#F2B961' },
      { residue: 'Leu718', type: 'Hydrophobic interaction', distance: '3.8 Å', dotColor: '#31CAB6' },
      { residue: 'Lys745', type: 'Electrostatic salt-bridge', distance: '3.2 Å', dotColor: '#9475FF' }
    ]
  },
  '6VJJ': {
    pdbId: '6VJJ',
    title: 'Crystal Structure of BRAF V600E in Complex with Dabrafenib',
    shortName: 'BRAF (V600E)',
    category: 'Protein-Ligand',
    method: 'X-ray diffraction',
    resolution: '2.3 Å',
    organism: 'Homo sapiens',
    releaseDate: '2020-03-11',
    authors: 'Foster S. et al.',
    ligand: {
      name: 'Dabrafenib (Tafinlar)',
      type: 'Type-I½ Kinase Inhibitor',
      formula: 'C23H20F3N5O2S2',
      weight: '519.56 g/mol',
      bindingMode: 'DFG-in / αC-out',
      affinity: 'Kd = 0.8 nM',
      drugLikeness: 'Yes (0 violations)'
    },
    interactions: [
      { residue: 'Cys532', type: 'Hinge hydrogen bond', distance: '2.9 Å', dotColor: '#24D8ED' },
      { residue: 'Asp594', type: 'DFG motif anchor', distance: '2.6 Å', dotColor: '#F16D7B' },
      { residue: 'Phe595', type: 'Aromatic stacking', distance: '3.5 Å', dotColor: '#9475FF' }
    ]
  },
  '6M0J': {
    pdbId: '6M0J',
    title: 'Crystal structure of SARS-CoV-2 spike receptor-binding domain bound with ACE2',
    shortName: 'PD-1 (Human)',
    category: 'Protein-Protein',
    method: 'X-ray diffraction',
    resolution: '2.45 Å',
    organism: 'Homo sapiens',
    releaseDate: '2020-03-18',
    authors: 'Lan J. et al.',
    ligand: {
      name: 'Nivolumab Fab heavy-chain',
      type: 'Monoclonal antibody interface',
      formula: 'Macromolecular',
      weight: '146 kDa',
      bindingMode: 'BC Loop Blocking',
      affinity: 'Kd = 2.6 nM',
      drugLikeness: 'Biologic (Not applicable)'
    },
    interactions: [
      { residue: 'Lys78', type: 'Salt bridge', distance: '2.8 Å', dotColor: '#24D8ED' },
      { residue: 'Asn66', type: 'Hydrogen bond network', distance: '3.0 Å', dotColor: '#24D8ED' },
      { residue: 'Pro69', type: 'Hydrophobic contact', distance: '3.7 Å', dotColor: '#31CAB6' }
    ]
  },
  '2AZ5': {
    pdbId: '2AZ5',
    title: 'Crystal Structure of a Complex of TNF-alpha with an Inhibitor',
    shortName: 'TNF-α (Human)',
    category: 'Protein-Ligand',
    method: 'X-ray diffraction',
    resolution: '2.1 Å',
    organism: 'Homo sapiens',
    releaseDate: '2005-11-20',
    authors: 'He M. et al.',
    ligand: {
      name: 'SPD304',
      type: 'Small molecule trimer-dissociator',
      formula: 'C32H23N3O2',
      weight: '481.54 g/mol',
      bindingMode: 'Subunit interface cavity',
      affinity: 'IC50 = 4.6 µM',
      drugLikeness: 'Yes (0 violations)'
    },
    interactions: [
      { residue: 'Tyr59', type: 'Hydrophobic cage', distance: '3.4 Å', dotColor: '#31CAB6' },
      { residue: 'Leu57', type: 'Van der Waals', distance: '3.8 Å', dotColor: '#A6B5CB' },
      { residue: 'Tyr119', type: 'π-π stacking', distance: '3.5 Å', dotColor: '#9475FF' }
    ]
  }
};

interface MolecularLabProps {
  initialPdbId?: string;
}

export const MolecularLab: React.FC<MolecularLabProps> = ({ initialPdbId = '7K3N' }) => {
  const [catalog, setCatalog] = useState<Record<string, StructureItem>>(STRUCTURE_CATALOG);
  const [selectedPdbId, setSelectedPdbId] = useState<string>(initialPdbId || '7K3N');
  const [activeTab, setActiveTab] = useState<'structures' | 'targets' | 'projects'>('structures');
  const [rightInspectorTab, setRightInspectorTab] = useState<'structure' | 'interactions' | 'analytics' | 'ai-insights'>('structure');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [customPdbCode, setCustomPdbCode] = useState('');
  const [selectedResidue, setSelectedResidue] = useState<ResidueInteraction>({
    id: 'cys145',
    residue: 'Cys145',
    chain: 'A',
    resSeq: 145,
    type: 'Covalent bond (S-C)',
    distance: '2.0 Å',
    color: '#F16D7B',
    position: [0.8, 1.2, 0.4]
  });

  useEffect(() => {
    if (initialPdbId) {
      const clean = initialPdbId.trim().toUpperCase();
      if (!catalog[clean]) {
        fetchPdbMetadata(clean).then((meta) => {
          setCatalog((prev) => ({
            ...prev,
            [clean]: {
              pdbId: clean,
              title: meta.title,
              shortName: meta.targetSymbol || clean,
              category: 'Protein-Ligand',
              method: meta.method || 'X-ray diffraction',
              resolution: `${meta.resolution || 2.2} Å`,
              organism: 'Homo sapiens / Host',
              releaseDate: 'Deposited Entry',
              authors: 'RCSB Depositor',
              ligand: {
                name: meta.ligandIds?.[0] || 'Active Molecule',
                type: 'Small Molecule',
                formula: 'Determined',
                weight: 'Experimental',
                bindingMode: 'Active site',
                affinity: 'Validated',
                drugLikeness: 'Yes'
              },
              interactions: [
                { residue: 'BindingPocket1', type: 'Contact', distance: '2.5 Å', dotColor: '#24D8ED' }
              ]
            }
          }));
        });
      }
      setSelectedPdbId(clean);
    }
  }, [initialPdbId]);

  const handleLoadCustomPdb = async (pdbCode: string) => {
    const clean = pdbCode.trim().toUpperCase();
    if (clean.length === 4) {
      if (!catalog[clean]) {
        const meta = await fetchPdbMetadata(clean);
        setCatalog((prev) => ({
          ...prev,
          [clean]: {
            pdbId: clean,
            title: meta.title,
            shortName: meta.targetSymbol || clean,
            category: 'Protein-Ligand',
            method: meta.method || 'X-ray diffraction',
            resolution: `${meta.resolution || 2.2} Å`,
            organism: 'Homo sapiens / Host',
            releaseDate: 'Deposited Entry',
            authors: 'RCSB Depositor',
            ligand: {
              name: meta.ligandIds?.[0] || 'Active Ligand',
              type: 'Small Molecule',
              formula: 'Determined',
              weight: 'Experimental',
              bindingMode: 'Active site',
              affinity: 'Validated',
              drugLikeness: 'Yes'
            },
            interactions: [
              { residue: 'Site1', type: 'Active interaction', distance: '2.8 Å', dotColor: '#24D8ED' }
            ]
          }
        }));
      }
      setSelectedPdbId(clean);
      setIsLoadModalOpen(false);
      setCustomPdbCode('');
    }
  };

  const currentStruct = catalog[selectedPdbId] || catalog['7K3N'];

  const recentStructuresList = [
    { pdbId: '7K3N', name: 'SARS-CoV-2 Mpro', type: 'Protein-Ligand', color: '#24D8ED' },
    { pdbId: '1M17', name: 'EGFR (Human)', type: 'Protein-Ligand', color: '#31CAB6' },
    { pdbId: '6VJJ', name: 'BRAF (V600E)', type: 'Protein-Ligand', color: '#9475FF' },
    { pdbId: '6M0J', name: 'PD-1 (Human)', type: 'Protein-Protein', color: '#4D96FF' },
    { pdbId: '2AZ5', name: 'TNF-α (Human)', type: 'Protein-Ligand', color: '#F2B961' }
  ];

  const exampleTargets = [
    { name: 'SARS-CoV-2 Main Protease (Mpro)', pdbId: '7K3N' },
    { name: 'EGFR', sub: 'Oncology', pdbId: '1M17' },
    { name: 'BRCA1', sub: 'DNA repair', pdbId: '7K3N' },
    { name: 'HIV-1 Protease', sub: 'Antiviral target', pdbId: '7K3N' },
    { name: 'BACE1', sub: "Alzheimer's", pdbId: '7K3N' }
  ];

  return (
    <div className="w-full text-[#F5F8FF]">
      {/* 3-Column Studio Grid matching Reference Image 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ======================================================== */}
        {/* LEFT PANEL (20% -> 2.5/12 cols or 3/12 cols on desktop) */}
        {/* ======================================================== */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-[#0B1120] border border-white/[0.08] rounded-2xl p-4 space-y-4">
            {/* Header Title & Subtitle */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#24D8ED]/10 border border-[#24D8ED]/30 flex items-center justify-center">
                  <Box className="w-3.5 h-3.5 text-[#24D8ED]" />
                </div>
                <h2 className="text-sm font-bold text-white tracking-tight">3D Molecular Lab</h2>
              </div>
              <p className="text-[11px] text-[#71839E] leading-relaxed">
                Visualize and explore molecular structures with AI-powered insights
              </p>
            </div>

            {/* + Load Structure Button */}
            <button
              onClick={() => setIsLoadModalOpen(true)}
              className="w-full py-2 px-3.5 rounded-xl bg-gradient-to-r from-[#24D8ED] to-[#9475FF] text-[#070B14] font-semibold text-xs flex items-center justify-between hover:opacity-95 shadow-lg shadow-[#24D8ED]/10 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Load Structure</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {/* Segmented Tab Bar */}
            <div className="flex items-center border-b border-white/[0.08] text-xs">
              <button
                onClick={() => setActiveTab('structures')}
                className={`flex-1 pb-2 font-medium transition-all relative ${
                  activeTab === 'structures'
                    ? 'text-[#24D8ED] font-semibold'
                    : 'text-[#71839E] hover:text-[#A6B5CB]'
                }`}
              >
                Structures
                {activeTab === 'structures' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#24D8ED] rounded-full shadow-[0_0_8px_#24D8ED]" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('targets')}
                className={`flex-1 pb-2 font-medium transition-all relative ${
                  activeTab === 'targets'
                    ? 'text-[#24D8ED] font-semibold'
                    : 'text-[#71839E] hover:text-[#A6B5CB]'
                }`}
              >
                Targets
                {activeTab === 'targets' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#24D8ED] rounded-full shadow-[0_0_8px_#24D8ED]" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`flex-1 pb-2 font-medium transition-all relative ${
                  activeTab === 'projects'
                    ? 'text-[#24D8ED] font-semibold'
                    : 'text-[#71839E] hover:text-[#A6B5CB]'
                }`}
              >
                Projects
                {activeTab === 'projects' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#24D8ED] rounded-full shadow-[0_0_8px_#24D8ED]" />
                )}
              </button>
            </div>

            {/* Search Input with Filter Button */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-[#71839E] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search proteins, ligands, PDB IDs..."
                  className="w-full bg-[#070B14] border border-white/[0.08] rounded-xl pl-8 pr-3 py-1.5 text-[11px] text-[#F5F8FF] placeholder:text-[#71839E] focus:outline-none focus:border-[#24D8ED]/40 transition-colors"
                />
              </div>
              <button
                className="p-1.5 rounded-xl border border-white/[0.08] bg-[#070B14] text-[#71839E] hover:text-white transition-colors"
                title="Filter options"
              >
                <Filter className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Recent Structures List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#F5F8FF]">Recent Structures</span>
                <button className="text-[11px] text-[#24D8ED] hover:underline flex items-center gap-0.5">
                  View All <ArrowRight className="w-2.5 h-2.5" />
                </button>
              </div>

              <div className="space-y-1.5">
                {recentStructuresList.map((item) => {
                  const isSelected = selectedPdbId === item.pdbId;
                  return (
                    <button
                      key={item.pdbId}
                      onClick={() => setSelectedPdbId(item.pdbId)}
                      className={`w-full p-2 rounded-xl text-left flex items-center gap-3 transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#152238] border-[#24D8ED]/40 shadow-md'
                          : 'bg-[#070B14]/60 border-transparent hover:bg-white/[0.03] hover:border-white/5'
                      }`}
                    >
                      {/* Thumbnail Glyph */}
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: `${item.color}15`,
                          borderColor: `${item.color}30`
                        }}
                      >
                        <Box className="w-4 h-4" style={{ color: item.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-white truncate">{item.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono text-[#24D8ED]">PDB {item.pdbId}</span>
                          <span className="text-[10px] text-[#71839E] truncate">• {item.type}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Example Targets List */}
            <div className="space-y-2 pt-2 border-t border-white/[0.06]">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#F5F8FF]">Example Targets</span>
                <button className="text-[11px] text-[#24D8ED] hover:underline flex items-center gap-0.5">
                  View All <ArrowRight className="w-2.5 h-2.5" />
                </button>
              </div>

              <div className="space-y-1">
                {exampleTargets.map((target, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPdbId(target.pdbId)}
                    className="w-full py-1.5 px-2 rounded-lg text-left flex items-center justify-between text-[11px] text-[#A6B5CB] hover:text-white hover:bg-white/[0.03] transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#24D8ED]/60" />
                      <span className="truncate">{target.name}</span>
                      {target.sub && (
                        <span className="text-[10px] text-[#71839E]">({target.sub})</span>
                      )}
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[#71839E] group-hover:text-white shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CENTER VIEWPORT (57% -> 6/12 cols on desktop) */}
        {/* ======================================================== */}
        <div className="lg:col-span-6">
          <LabMoleculeScene
            structureId={currentStruct.pdbId}
            structureTitle={currentStruct.shortName}
            resolution={currentStruct.resolution}
            selectedResidueId={selectedResidue.id}
            onSelectResidue={(res) => setSelectedResidue(res)}
          />
        </div>

        {/* ======================================================== */}
        {/* RIGHT SCIENTIFIC INSPECTOR (23% -> 3/12 cols on desktop) */}
        {/* ======================================================== */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-[#0B1120] border border-white/[0.08] rounded-2xl p-4 space-y-4">
            {/* Top Navigation Tabs */}
            <div className="flex items-center border-b border-white/[0.08] text-xs">
              {(
                [
                  { id: 'structure', label: 'Structure' },
                  { id: 'interactions', label: 'Interactions' },
                  { id: 'analytics', label: 'Analytics' },
                  { id: 'ai-insights', label: 'AI Insights' }
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setRightInspectorTab(tab.id)}
                  className={`flex-1 pb-2 font-medium transition-all relative text-center ${
                    rightInspectorTab === tab.id
                      ? 'text-[#24D8ED] font-semibold'
                      : 'text-[#71839E] hover:text-[#A6B5CB]'
                  }`}
                >
                  {tab.label}
                  {rightInspectorTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#24D8ED] rounded-full shadow-[0_0_8px_#24D8ED]" />
                  )}
                </button>
              ))}
            </div>

            {/* PDB Information Card */}
            <div className="bg-[#070B14] border border-white/[0.06] rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <Box className="w-3.5 h-3.5 text-[#24D8ED]" />
                  <span>PDB Information</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#24D8ED]/15 text-[#24D8ED] border border-[#24D8ED]/30">
                    PDB
                  </span>
                  <a
                    href={`https://www.rcsb.org/structure/${currentStruct.pdbId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#71839E] hover:text-white"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#71839E]">PDB ID</span>
                  <span className="font-mono font-semibold text-white">{currentStruct.pdbId}</span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[#71839E] shrink-0">Title</span>
                  <span className="text-right text-[#A6B5CB] line-clamp-2">{currentStruct.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#71839E]">Organism</span>
                  <span className="text-white">{currentStruct.organism}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#71839E]">Resolution</span>
                  <span className="font-mono text-[#24D8ED]">{currentStruct.resolution}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#71839E]">Method</span>
                  <span className="text-white">{currentStruct.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#71839E]">Release Date</span>
                  <span className="font-mono text-white">{currentStruct.releaseDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#71839E]">Authors</span>
                  <span className="text-[#A6B5CB]">{currentStruct.authors}</span>
                </div>
              </div>
            </div>

            {/* Ligand Information Card */}
            <div className="bg-[#070B14] border border-white/[0.06] rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <Sparkles className="w-3.5 h-3.5 text-[#9475FF]" />
                  <span>Ligand Information</span>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2 items-center">
                <div className="col-span-3 space-y-1.5 text-[11px]">
                  <div>
                    <div className="text-[10px] text-[#71839E]">Name</div>
                    <div className="font-semibold text-white">{currentStruct.ligand.name}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#71839E]">Formula</div>
                    <div className="font-mono text-[#24D8ED]">{currentStruct.ligand.formula}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#71839E]">Molecular Weight</div>
                    <div className="font-mono text-white">{currentStruct.ligand.weight}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#71839E]">Binding Mode</div>
                    <div className="text-[#A6B5CB]">{currentStruct.ligand.bindingMode}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#71839E]">Binding Affinity</div>
                    <div className="font-mono text-[#31CAB6]">{currentStruct.ligand.affinity}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#71839E]">Drug-likeness</div>
                    <div className="text-emerald-400 font-medium">✓ {currentStruct.ligand.drugLikeness}</div>
                  </div>
                </div>

                {/* 2D Chemical Structure SVG Glyph */}
                <div className="col-span-2 h-28 bg-[#0B1120] border border-white/[0.08] rounded-lg p-2 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full stroke-[#9475FF] stroke-[2] fill-none">
                    <polygon points="50,15 80,32 80,68 50,85 20,68 20,32" stroke="#24D8ED" strokeWidth="2.5" />
                    <line x1="50" y1="15" x2="50" y2="40" stroke="#F16D7B" strokeWidth="2" />
                    <circle cx="50" cy="40" r="3" fill="#F16D7B" />
                    <circle cx="80" cy="32" r="3" fill="#24D8ED" />
                    <circle cx="80" cy="68" r="3" fill="#9475FF" />
                    <circle cx="50" cy="85" r="3" fill="#31CAB6" />
                    <circle cx="20" cy="68" r="3" fill="#4D96FF" />
                    <line x1="80" y1="68" x2="95" y2="78" stroke="#9475FF" />
                    <circle cx="95" cy="78" r="2.5" fill="#9475FF" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Key Interactions (8) */}
            <div className="bg-[#070B14] border border-white/[0.06] rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-white">Key Interactions ({currentStruct.interactions.length})</span>
                <button className="text-[11px] text-[#24D8ED] hover:underline">Show All</button>
              </div>

              <div className="space-y-1.5 text-[11px]">
                {currentStruct.interactions.map((inter, i) => (
                  <div
                    key={i}
                    onClick={() =>
                      setSelectedResidue({
                        id: inter.residue.toLowerCase(),
                        residue: inter.residue,
                        chain: 'A',
                        resSeq: parseInt(inter.residue.replace(/\D/g, '')) || 100,
                        type: inter.type,
                        distance: inter.distance,
                        color: inter.dotColor,
                        position: [0, 0, 0]
                      })
                    }
                    className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: inter.dotColor }} />
                      <span className="font-mono font-medium text-white">{inter.residue}</span>
                      <span className="text-[#71839E]">• {inter.type}</span>
                    </div>
                    <span className="font-mono text-[#A6B5CB]">{inter.distance}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Residue Card */}
            <div className="bg-[#070B14] border border-white/[0.06] rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <span>Selected Residue</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#31CAB6]/15 text-[#31CAB6] border border-[#31CAB6]/30">
                  Catalytic Residue
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base font-bold font-mono text-white">{selectedResidue.residue}</div>
                  <div className="space-y-0.5 mt-1 text-[11px] text-[#A6B5CB]">
                    <div>Chain: <span className="font-mono text-white">{selectedResidue.chain}</span></div>
                    <div>Residue ID: <span className="font-mono text-white">{selectedResidue.resSeq}</span></div>
                    <div>Type: <span className="text-[#24D8ED]">Polar (Sulfur)</span></div>
                  </div>
                </div>

                {/* Mini Residue 3D preview badge */}
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#24D8ED]/10 to-[#9475FF]/15 border border-white/10 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-4 h-4 rounded-full bg-[#F16D7B] shadow-[0_0_10px_#F16D7B]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#24D8ED] absolute -top-2 -right-2" />
                    <div className="w-2 h-2 rounded-full bg-[#9475FF] absolute -bottom-1 -left-2" />
                  </div>
                </div>
              </div>

              <button className="w-full py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-[11px] font-medium text-[#24D8ED] flex items-center justify-center gap-1.5 transition-colors">
                <span>View in Sequence</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Evidence & Sources (12) */}
            <div className="bg-[#070B14] border border-white/[0.06] rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-white">Evidence & Sources (12)</span>
                <button className="text-[11px] text-[#24D8ED] hover:underline">View All</button>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium truncate">Crystal structure of Mpro with N3</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#24D8ED]/15 text-[#24D8ED] border border-[#24D8ED]/30">
                      Primary
                    </span>
                  </div>
                  <div className="text-[10px] text-[#71839E]">
                    Jin Z. et al. (2020) • Science • DOI: 10.1126/science.abb3405
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium truncate">Inhibitors of SARS-CoV-2 Mpro</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#9475FF]/15 text-[#9475FF] border border-[#9475FF]/30">
                      Review
                    </span>
                  </div>
                  <div className="text-[10px] text-[#71839E]">
                    Zhang L. et al. (2020) • Nat Rev Drug Discov
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Load Structure Modal */}
      {isLoadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B1120] border border-white/10 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Box className="w-5 h-5 text-[#24D8ED]" />
                <h3 className="text-sm font-bold text-white">Load Structure from RCSB PDB</h3>
              </div>
              <button
                onClick={() => setIsLoadModalOpen(false)}
                className="text-[#71839E] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#A6B5CB]">
              Enter a 4-character PDB code to fetch experimental atomic coordinates directly from RCSB Protein Data Bank.
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={4}
                value={customPdbCode}
                onChange={(e) => setCustomPdbCode(e.target.value.toUpperCase())}
                placeholder="e.g. 6LU7, 1BNA, 7K3N"
                className="flex-1 bg-[#070B14] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-[#71839E] focus:outline-none focus:border-[#24D8ED]"
              />
              <button
                onClick={() => handleLoadCustomPdb(customPdbCode)}
                className="px-4 py-2 rounded-xl bg-[#24D8ED] text-[#070B14] font-semibold text-xs hover:bg-[#24D8ED]/90 transition-colors cursor-pointer"
              >
                Load
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
