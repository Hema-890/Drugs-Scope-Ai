export type DatasetMode = 'DEMO' | 'RESEARCH' | 'CLINICAL REVIEW';

export type UserRole = 'public' | 'student' | 'researcher' | 'pharmacist' | 'doctor' | 'administrator';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  organization: string;
  verified: boolean;
  licenseNumber?: string;
}

export interface Drug {
  id: string;
  genericName: string;
  brandNames: string[];
  rxNormCui: string;
  atcCode: string;
  drugClass: string;
  description: string;
  fdaStatus: 'Approved' | 'Investigational' | 'Withdrawn';
  blackBoxWarning?: string;
  mechanismSummary: string;
  targets: string[]; // target IDs
  primaryMetabolizingEnzymes: string[];
  synonyms: string[];
  structurePdbId?: string;
  chemblId?: string;
}

export interface BiologicalTarget {
  id: string;
  geneSymbol: string;
  targetName: string;
  uniprotId: string;
  targetType: 'Receptor' | 'Enzyme' | 'Ion Channel' | 'Transporter' | 'Nuclear Receptor';
  cellularLocation: string;
  pathwayName: string;
  associatedPdbId?: string;
  description: string;
}

export interface PairwiseInteraction {
  id: string;
  drugAId: string;
  drugAName: string;
  drugBId: string;
  drugBName: string;
  severity: 'Contraindicated' | 'Major' | 'Moderate' | 'Minor' | 'Potential mechanism' | 'Insufficient evidence' | 'Theoretical';
  evidenceStatus: 'Documented' | 'Predicted' | 'Simulated' | 'Uncertain' | 'Evidence Gap';
  interactionType: 'Pharmacokinetic (CYP Competition)' | 'Pharmacodynamic (Additive Toxicity)' | 'Transporter Inhibition' | 'Receptor Antagonism' | 'QT Prolongation';
  mechanism: string;
  clinicalConsequence: string;
  managementGuidance: string;
  primarySources: Array<{
    name: string;
    type: 'openFDA Label' | 'RxNav' | 'DailyMed' | 'PubMed' | 'Clinical Pharmacology';
    url?: string;
    citation: string;
  }>;
  targetOverlap: string[];
  enzymeConflicts: string[];
}

export interface ProteinStructure {
  pdbId: string;
  title: string;
  targetSymbol: string;
  method: 'X-RAY DIFFRACTION' | 'CRYO-EM' | 'NMR';
  resolution?: number; // Angstroms
  chains: string[];
  ligandIds: string[];
  rcsbUrl: string;
  atomCount?: number;
  experimentalNotes?: string;
}

export interface PharmacovigilanceSignal {
  id: string;
  drugName: string;
  reactionTerm: string;
  reportCount: number;
  proportionalReportingRatio: number; // PRR
  reportingOddsRatio: number; // ROR
  signalTrend: 'Increasing' | 'Stable' | 'Decreasing';
  seriousOutcomeRate: number; // percentage
  source: 'openFDA FAERS' | 'VigiBase Reference' | 'Synthetic Simulation';
  lastUpdated: string;
  duplicateAwarenessFlag: boolean;
}

export interface ScientificPublication {
  pmid: string;
  title: string;
  authors: string[];
  journal: string;
  pubDate: string;
  doi?: string;
  abstract: string;
  meshTerms: string[];
  relevanceScore: number;
  linkedDrug?: string;
  linkedTarget?: string;
}

export interface EvidenceConflict {
  id: string;
  drugPair: [string, string];
  sourceA: { name: string; claim: string; severity: string; date: string };
  sourceB: { name: string; claim: string; severity: string; date: string };
  discrepancyType: 'Severity Disagreement' | 'Mechanism Discrepancy' | 'In Vitro vs Clinical Conflict' | 'Dose-Dependent Variation';
  status: 'Potential Conflict' | 'Requires Context' | 'Reviewed' | 'Resolved' | 'Inconclusive';
  analystNotes?: string;
}

export interface ResearchHypothesis {
  id: string;
  title: string;
  hypothesisText: string;
  compoundName: string;
  targetName: string;
  uncertaintyScore: number; // 0.0 to 1.0
  supportingEvidenceCount: number;
  contradictoryEvidenceCount: number;
  proposedValidation: string;
  status: 'Draft' | 'Active' | 'Validating' | 'Supported' | 'Refuted';
  createdAt: string;
  updatedAt: string;
}

export interface ClinicalPatientCase {
  patientId: string;
  age: number;
  gender: string;
  diagnoses: string[];
  medications: Array<{
    drugId: string;
    drugName: string;
    dosage: string;
    frequency: string;
    route: string;
    startDate: string;
    stopDate?: string;
    prescriber: string;
  }>;
  allergies: string[];
  renalFunction: { egfr: number; serumCreatinine: number; stage: string };
  hepaticFunction: 'Normal' | 'Mild Impairment' | 'Moderate Impairment' | 'Severe';
  reviewStatus: 'Pending' | 'In Review' | 'Signed-Off' | 'Escalated';
  reviewerNotes?: string;
  signedOffBy?: string;
  signedOffAt?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  resource: string;
  datasetMode: DatasetMode;
  details: string;
}

export interface DataSourceStatus {
  sourceCode: string;
  name: string;
  provider: string;
  status: 'Operational' | 'Degraded' | 'Offline' | 'Rate Limited';
  latencyMs: number;
  lastSync: string;
  rateLimitUsed: number;
  rateLimitMax: number;
  license: string;
}

export type ExplanationMode = 'simple' | 'professional' | 'research';

export interface AnalysisFinding {
  id: string;
  drugAId: string;
  drugAName: string;
  drugBId: string;
  drugBName: string;
  severity: 'Contraindicated' | 'Major' | 'Moderate' | 'Minor' | 'Potential mechanism' | 'Insufficient evidence' | 'Theoretical';
  provenanceStatus?: string;
  sourceRecordId?: string;
  evidenceStatus: 'Documented' | 'Predicted' | 'Simulated' | 'Uncertain' | 'Evidence Gap';
  interactionType: string;
  mechanism: string;
  clinicalConsequence: string;
  managementGuidance: string;
  simpleExplanation: string;
  professionalExplanation: string;
  researchExplanation: string;
  sources: Array<{
    name: string;
    type: string;
    citation: string;
    url?: string;
  }>;
  cypEnzymes: string[];
  receptors: string[];
  targetOverlap: string[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'drug' | 'enzyme' | 'receptor' | 'pathway' | 'evidence';
  color: string;
  size: number;
  sublabel?: string;
  metadata?: any;
  position?: [number, number, number];
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type: 'inhibits' | 'metabolizes' | 'binds' | 'conflicts' | 'supports';
  color: string;
  dashed?: boolean;
}

export interface AnalysisSession {
  id: string;
  title: string;
  timestamp: string;
  datasetMode: DatasetMode;
  medications: Drug[];
  clinicalContext?: {
    dose?: string;
    route?: string;
    ageCategory?: string;
    renalFunction?: string;
    hepaticFunction?: string;
  };
  explanationMode: ExplanationMode;
  findings: AnalysisFinding[];
  graphData: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
  status: 'completed' | 'analyzing' | 'error';
  summary: {
    totalInteractions: number;
    contraindicatedCount: number;
    majorCount: number;
    moderateCount: number;
    documentedEvidencePercent: number;
    primaryRiskSummary: string;
  };
}
