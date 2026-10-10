import { EvidenceConflict, ResearchHypothesis } from '../types';

export const EVIDENCE_CONFLICTS: EvidenceConflict[] = [
  {
    id: 'conf-001',
    drugPair: ['Clopidogrel Bisulfate', 'Omeprazole'],
    sourceA: {
      name: 'FDA Drug Safety Communication (2009)',
      claim: 'Concomitant use diminishes antiplatelet efficacy by ~47% via CYP2C19 inhibition; co-prescription should be strictly avoided due to thrombotic recurrence risk.',
      severity: 'Major',
      date: '2009-11-17'
    },
    sourceB: {
      name: 'COGENT Randomized Trial (N Engl J Med 2010)',
      claim: 'No apparent difference in major adverse cardiovascular events (HR 0.99) observed with prophylactic omeprazole, while gastrointestinal ulcer bleeding was reduced significantly (HR 0.55).',
      severity: 'Moderate',
      date: '2010-11-11'
    },
    discrepancyType: 'In Vitro vs Clinical Conflict',
    status: 'Requires Context',
    analystNotes: 'Pharmacodynamic surrogate endpoints (VASP platelet reactivity index) demonstrate clear enzymatic inhibition, but clinical endpoint trials (COGENT) were underpowered for cardiac outcomes due to premature termination. Consensus recommends safer PPI alternatives (pantoprazole) to avoid mechanistic controversy.'
  },
  {
    id: 'conf-002',
    drugPair: ['Warfarin Sodium', 'Aspirin'],
    sourceA: {
      name: 'Coumadin FDA Labeling (Package Insert)',
      claim: 'Concomitant administration is classified as a Major Black Box interaction requiring dosage modification due to heightened mucosal hemorrhage.',
      severity: 'Major',
      date: '2023-04-12'
    },
    sourceB: {
      name: 'AHA/ACC Secondary Prevention Guideline',
      claim: 'Low-dose aspirin (81mg) co-administration is indicated for specific mechanical valve patients with concurrent acute coronary syndrome despite elevated bleeding hazard.',
      severity: 'Moderate',
      date: '2022-08-01'
    },
    discrepancyType: 'Severity Disagreement',
    status: 'Reviewed',
    analystNotes: 'Indication-specific risk-benefit divergence: while bleeding risk is undeniably doubled, thromboembolic risk in mechanical prosthetic heart valves mandates controlled dual antithrombotic coverage under rigorous INR calibration.'
  }
];

export const RESEARCH_HYPOTHESES: ResearchHypothesis[] = [
  {
    id: 'hypo-001',
    title: 'Allosteric CYP2C9 Displacement by Desethylamiodarone',
    hypothesisText: 'Desethylamiodarone occupies a peripheral allosteric hydrophobic groove adjacent to Phe476 in CYP2C9, creating steric constriction of the catalytic heme pocket that reduces S-warfarin access without completely altering substrate binding affinity.',
    compoundName: 'Desethylamiodarone / S-Warfarin',
    targetName: 'CYP2C9 (P11712)',
    uncertaintyScore: 0.35,
    supportingEvidenceCount: 8,
    contradictoryEvidenceCount: 1,
    proposedValidation: 'Cryo-EM structural resolution of CYP2C9 ternary complex in the presence of both S-warfarin and desethylamiodarone at <2.5 Angstrom resolution; stopped-flow kinetics measuring ferric-heme reduction rates.',
    status: 'Active',
    createdAt: '2026-09-12',
    updatedAt: '2026-10-02'
  },
  {
    id: 'hypo-002',
    title: 'hERG Cavity Promiscuity via Tyr652 Pi-Stacking',
    hypothesisText: 'Basic nitrogen centers in fluoroquinolones and iodinated benzofurans engage in concurrent cation-pi and pi-pi stacking with aromatic rings of Tyr652 and Phe656 within the central hERG vestibule, generating non-additive, supralinear IKr current suppression.',
    compoundName: 'Ciprofloxacin + Amiodarone',
    targetName: 'KCNH2 (hERG) (Q12809)',
    uncertaintyScore: 0.42,
    supportingEvidenceCount: 12,
    contradictoryEvidenceCount: 2,
    proposedValidation: 'Automated patch-clamp electrophysiology on HEK293 cells expressing Y652A and F656A hERG mutants; molecular dynamics free energy perturbation (FEP) simulations.',
    status: 'Supported',
    createdAt: '2026-08-20',
    updatedAt: '2026-09-28'
  }
];
