import verifiedData from './verifiedStructure7TLL.json';

export interface VerifiedInteraction {
  id: string;
  proteinResidue: string;
  proteinAtom: string;
  ligandAtom: string;
  type: string;
  distance: number;
  classification: string;
  color: string;
  proteinCoord: [number, number, number];
  ligandCoord: [number, number, number];
  description: string;
}

export interface VerifiedCaAtom {
  serial: number;
  resName: string;
  resSeq: number;
  x: number;
  y: number;
  z: number;
}

export interface VerifiedLigandAtom {
  serial: number;
  name: string;
  elem: string;
  x: number;
  y: number;
  z: number;
}

export interface VerifiedStructureData {
  pdbId: string;
  title: string;
  target: string;
  organism: string;
  method: string;
  resolution: number;
  rValue: number;
  depositionDate: string;
  doi: string;
  ligand: {
    code: string;
    name: string;
    formula: string;
    molecularWeight: number;
    smiles: string;
    role: string;
  };
  helices: { initSeq: number; endSeq: number }[];
  sheets: { initSeq: number; endSeq: number }[];
  caAtoms: VerifiedCaAtom[];
  ligandAtoms: VerifiedLigandAtom[];
  ligandBonds: [number, number][];
  verifiedInteractions: VerifiedInteraction[];
}

export const STRUCTURE_7TLL = verifiedData as unknown as VerifiedStructureData;
