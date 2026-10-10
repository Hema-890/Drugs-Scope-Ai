import { ProteinStructure } from '../types';

export const PROTEIN_STRUCTURES: ProteinStructure[] = [
  {
    pdbId: '7TLL',
    title: 'Crystal Structure of SARS-CoV-2 Main Protease (Mpro) in Complex with Nirmatrelvir (PF-07321332)',
    targetSymbol: 'Mpro / 3CLpro',
    method: 'X-RAY DIFFRACTION',
    resolution: 1.6,
    chains: ['A', 'B'],
    ligandIds: ['4WI', 'DMS'],
    rcsbUrl: 'https://www.rcsb.org/structure/7TLL',
    atomCount: 5078,
    experimentalNotes: 'High-resolution 1.60 Å crystal structure capturing Nirmatrelvir covalently bound to catalytic dyad residue Cys145 (1.76 Å S-C thioimidate bond) and anchored via S1-S4 subpocket hydrogen bonds (His163, His164, Glu166).'
  },
  {
    pdbId: '6WVR',
    title: 'Structure of Human Vitamin K Epoxide Reductase (VKORC1) in complex with Warfarin',
    targetSymbol: 'VKORC1',
    method: 'CRYO-EM',
    resolution: 2.8,
    chains: ['A', 'B'],
    ligandIds: ['WAF', 'PE5'],
    rcsbUrl: 'https://www.rcsb.org/structure/6WVR',
    atomCount: 1620,
    experimentalNotes: 'Captures the native closed conformation of VKORC1 with the 4-hydroxycoumarin core of warfarin nestled between hydrophobic transmembrane helices TM1 and TM4, directly sterically obstructing the catalytic CXXC active triad.'
  },
  {
    pdbId: '1CQE',
    title: 'Crystal Structure of Prostaglandin H2 Synthase-1 (COX-1) Acetylated by Aspirin',
    targetSymbol: 'COX-1',
    method: 'X-RAY DIFFRACTION',
    resolution: 3.1,
    chains: ['A', 'B'],
    ligandIds: ['HEM', 'NAG', 'SAL'],
    rcsbUrl: 'https://www.rcsb.org/structure/1CQE',
    atomCount: 4420,
    experimentalNotes: 'Demonstrates covalent acetylation of Serine-529 within the narrow hydrophobic constriction channel of the COX-1 cyclooxygenase active site, preventing arachidonic acid substrate entry.'
  },
  {
    pdbId: '4GQR',
    title: 'Crystal Structure of Human Cytochrome P450 2C9 with (S)-Warfarin in the Catalytic Cleft',
    targetSymbol: 'CYP2C9',
    method: 'X-RAY DIFFRACTION',
    resolution: 2.45,
    chains: ['A'],
    ligandIds: ['HEM', 'SWF'],
    rcsbUrl: 'https://www.rcsb.org/structure/4GQR',
    atomCount: 3840,
    experimentalNotes: 'Reveals the 7-hydroxylation orientation of (S)-warfarin positioned 4.2 Angstroms above the heme iron cofactor, explaining why competitive CYP2C9 inhibitors like amiodarone induce profound kinetic displacement.'
  },
  {
    pdbId: '4NTJ',
    title: 'Structure of the Human P2Y12 Receptor in Complex with a Non-Nucleotide Antagonist',
    targetSymbol: 'P2Y12',
    method: 'X-RAY DIFFRACTION',
    resolution: 2.62,
    chains: ['A'],
    ligandIds: ['AZD', 'CLR'],
    rcsbUrl: 'https://www.rcsb.org/structure/4NTJ',
    atomCount: 2950,
    experimentalNotes: 'Resolves the seven-transmembrane bundle of P2Y12 with an expansive extracellular vestibule where active thienopyridine metabolites establish covalent bonding with Cys97 and Cys175.'
  },
  {
    pdbId: '5VA1',
    title: 'Cryo-EM Structure of the Human Voltage-Gated Potassium Channel hERG (KCNH2)',
    targetSymbol: 'hERG',
    method: 'CRYO-EM',
    resolution: 3.75,
    chains: ['A', 'B', 'C', 'D'],
    ligandIds: ['K', 'PO4'],
    rcsbUrl: 'https://www.rcsb.org/structure/5VA1',
    atomCount: 4890,
    experimentalNotes: 'Unveils the unique central hydrophobic cavity lined with aromatic residues (Tyr652 and Phe656) that act as promiscuous binding traps for basic lipophilic drugs, conferring high susceptibility to drug-induced QT prolongation.'
  },
  {
    pdbId: '1HW8',
    title: 'Crystal Structure of the Catalytic Domain of Human HMG-CoA Reductase Complexed with Simvastatin',
    targetSymbol: 'HMGCR',
    method: 'X-RAY DIFFRACTION',
    resolution: 2.15,
    chains: ['A', 'B', 'C', 'D'],
    ligandIds: ['SVT', 'SO4'],
    rcsbUrl: 'https://www.rcsb.org/structure/1HW8',
    atomCount: 6120,
    experimentalNotes: 'High-resolution structure demonstrating that the dihydroxyheptanoic acid moiety of simvastatin occupies the HMG binding pocket, while the bulky decalin ring occupies a hydrophobic flap adjacent to the active site.'
  },
  {
    pdbId: '5I6X',
    title: 'X-ray Structure of the Human Serotonin Transporter (SERT) in Complex with Antidepressant',
    targetSymbol: 'SERT',
    method: 'X-RAY DIFFRACTION',
    resolution: 3.14,
    chains: ['A'],
    ligandIds: ['PAR', 'NAG', 'CL'],
    rcsbUrl: 'https://www.rcsb.org/structure/5I6X',
    atomCount: 4210,
    experimentalNotes: 'Shows the central S1 binding pocket of SERT occupied by the SSRI, locking the transporter in an outward-open state and preventing 5-hydroxytryptamine translocation across the presynaptic terminal.'
  },
  {
    pdbId: '1O86',
    title: 'Crystal Structure of Human Testicular Angiotensin I-Converting Enzyme in Complex with Lisinopril',
    targetSymbol: 'ACE',
    method: 'X-RAY DIFFRACTION',
    resolution: 2.0,
    chains: ['A'],
    ligandIds: ['ZN', 'LPR', 'CL'],
    rcsbUrl: 'https://www.rcsb.org/structure/1O86',
    atomCount: 4880,
    experimentalNotes: 'Features the catalytic zinc ion in coordinate geometry with the carboxylate group of lisinopril, alongside the P1 phenylpropyl group accommodated inside the S1 subsite pocket.'
  }
];
