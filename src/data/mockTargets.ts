import { BiologicalTarget } from '../types';

export const BIOLOGICAL_TARGETS: BiologicalTarget[] = [
  {
    id: 'target-vkorc1',
    geneSymbol: 'VKORC1',
    targetName: 'Vitamin K Epoxide Reductase Complex Subunit 1',
    uniprotId: 'Q9BQB6',
    targetType: 'Enzyme',
    cellularLocation: 'Endoplasmic Reticulum Membrane',
    pathwayName: 'Blood Coagulation & Vitamin K Epoxide Cycle',
    associatedPdbId: '6WVR',
    description: 'Key enzyme in the vitamin K cycle responsible for reducing vitamin K 2,3-epoxide to vitamin K hydroquinone, necessary for gamma-carboxylation of clotting factors II, VII, IX, and X.'
  },
  {
    id: 'target-cyp2c9',
    geneSymbol: 'CYP2C9',
    targetName: 'Cytochrome P450 Family 2 Subfamily C Member 9',
    uniprotId: 'P11712',
    targetType: 'Enzyme',
    cellularLocation: 'Endoplasmic Reticulum',
    pathwayName: 'Hepatic Phase I Xenobiotic Metabolism',
    associatedPdbId: '4GQR',
    description: 'Primary hepatic monooxygenase responsible for the metabolic clearance of S-warfarin, phenytoin, tolbutamide, and non-steroidal anti-inflammatory agents.'
  },
  {
    id: 'target-cyp3a4',
    geneSymbol: 'CYP3A4',
    targetName: 'Cytochrome P450 Family 3 Subfamily A Member 4',
    uniprotId: 'P08684',
    targetType: 'Enzyme',
    cellularLocation: 'Endoplasmic Reticulum & Intestinal Enterocytes',
    pathwayName: 'Major Hepatic Drug Metabolism (CYP450)',
    associatedPdbId: '2XU7',
    description: 'The most abundant hepatic cytochrome P450 enzyme in humans, responsible for metabolizing over 50% of clinically prescribed therapeutic compounds.'
  },
  {
    id: 'target-cyp2d6',
    geneSymbol: 'CYP2D6',
    targetName: 'Cytochrome P450 Family 2 Subfamily D Member 6',
    uniprotId: 'P10635',
    targetType: 'Enzyme',
    cellularLocation: 'Endoplasmic Reticulum',
    pathwayName: 'Polymorphic Hepatic Clearance',
    associatedPdbId: '3TDA',
    description: 'Highly polymorphic cytochrome P450 enzyme that metabolizes 20-25% of clinically used drugs, including antidepressants, antipsychotics, and beta-blockers.'
  },
  {
    id: 'target-cox1',
    geneSymbol: 'PTGS1',
    targetName: 'Prostaglandin-Endoperoxide Synthase 1 (COX-1)',
    uniprotId: 'P23219',
    targetType: 'Enzyme',
    cellularLocation: 'Endoplasmic Reticulum & Nuclear Envelope',
    pathwayName: 'Eicosanoid / Prostanoid Biosynthesis',
    associatedPdbId: '1CQE',
    description: 'Constitutively active cyclooxygenase responsible for basal synthesis of thromboxane A2 in platelets and cytoprotective prostaglandins in gastric mucosa.'
  },
  {
    id: 'target-p2y12',
    geneSymbol: 'P2RY12',
    targetName: 'Purinergic Receptor P2Y G-Protein Coupled 12',
    uniprotId: 'Q9H244',
    targetType: 'Receptor',
    cellularLocation: 'Platelet Plasma Membrane',
    pathwayName: 'ADP-Induced Platelet Aggregation',
    associatedPdbId: '4NTJ',
    description: 'Gi-coupled purinergic ADP receptor on blood platelets whose inhibition prevents dense granule release and prevents arterial thrombotic events.'
  },
  {
    id: 'target-herg',
    geneSymbol: 'KCNH2',
    targetName: 'Potassium Voltage-Gated Channel Subfamily H Member 2 (hERG)',
    uniprotId: 'Q12809',
    targetType: 'Ion Channel',
    cellularLocation: 'Cardiomyocyte Plasma Membrane',
    pathwayName: 'Cardiac Action Potential Repolarization (IKr)',
    associatedPdbId: '5VA1',
    description: 'Cardiac potassium channel whose inadvertent pharmacological blockade prolongs the QT interval and triggers life-threatening Torsades de Pointes arrhythmia.'
  },
  {
    id: 'target-sert',
    geneSymbol: 'SLC6A4',
    targetName: 'Sodium-Dependent Serotonin Transporter (SERT)',
    uniprotId: 'P31645',
    targetType: 'Transporter',
    cellularLocation: 'Presynaptic Neuronal Membrane',
    pathwayName: 'Monoamine Neurotransmission Clearance',
    associatedPdbId: '5I6X',
    description: 'High-affinity sodium/chloride-coupled reuptake transporter for serotonin in synaptic clefts; principal molecular target for SSRI pharmacotherapy.'
  },
  {
    id: 'target-hmgcr',
    geneSymbol: 'HMGCR',
    targetName: '3-Hydroxy-3-Methylglutaryl-CoA Reductase',
    uniprotId: 'P04035',
    targetType: 'Enzyme',
    cellularLocation: 'Endoplasmic Reticulum',
    pathwayName: 'Mevalonate / Cholesterol Biosynthesis',
    associatedPdbId: '1HW8',
    description: 'Rate-limiting enzyme of the mevalonate pathway responsible for de novo endogenous cholesterol biosynthesis.'
  },
  {
    id: 'target-ace',
    geneSymbol: 'ACE',
    targetName: 'Angiotensin I Converting Enzyme',
    uniprotId: 'P12821',
    targetType: 'Enzyme',
    cellularLocation: 'Vascular Endothelial Surface',
    pathwayName: 'Renin-Angiotensin-Aldosterone System (RAAS)',
    associatedPdbId: '1O86',
    description: 'Zinc metallopeptidase converting angiotensin I to the potent vasoconstrictor angiotensin II and degrading vasodilator bradykinin.'
  }
];
