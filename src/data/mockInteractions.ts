import { PairwiseInteraction } from '../types';

export const PAIRWISE_INTERACTIONS: PairwiseInteraction[] = [
  {
    id: 'int-warf-amio',
    drugAId: 'drug-warfarin',
    drugAName: 'Warfarin Sodium',
    drugBId: 'drug-amiodarone',
    drugBName: 'Amiodarone Hydrochloride',
    severity: 'Major',
    evidenceStatus: 'Documented',
    interactionType: 'Pharmacokinetic (CYP Competition)',
    mechanism: 'Amiodarone and its primary metabolite desethylamiodarone are potent non-competitive inhibitors of hepatic Cytochrome P450 2C9 (CYP2C9), the primary metabolic clearance pathway for the pharmacologically active S-warfarin enantiomer. Additionally, amiodarone inhibits CYP3A4 and P-glycoprotein, reducing R-warfarin clearance.',
    clinicalConsequence: 'Marked increase in circulating S-warfarin plasma concentrations, leading to steep escalation of International Normalized Ratio (INR), excessive anticoagulation, and severe life-threatening internal or intracranial hemorrhage.',
    managementGuidance: 'Reduce baseline warfarin maintenance dosage by 33% to 50% upon initiating amiodarone. Measure INR 2-3 times weekly for the first 4 weeks, with long-term vigilance due to amiodarone\'s prolonged elimination half-life (40-55 days).',
    primarySources: [
      {
        name: 'openFDA Drug Label (Coumadin / Amiodarone)',
        type: 'openFDA Label',
        citation: 'FDA Coumadin Package Insert, Section 7.1 "CYP450 Inhibitors"'
      },
      {
        name: 'DailyMed Official Monograph',
        type: 'DailyMed',
        citation: 'DailyMed Drug Interaction Entry: Warfarin / Amiodarone Hydrochloride'
      },
      {
        name: 'PubMed Central Comparative Pharmacokinetics',
        type: 'PubMed',
        citation: 'Sanoski CA, Bauman JL. Clinical pharmacokinetics of amiodarone and warfarin interactions. Clin Pharmacokinet. 2002;41(13):989-1002.'
      }
    ],
    targetOverlap: ['target-cyp2c9', 'target-cyp3a4'],
    enzymeConflicts: ['CYP2C9 substrate vs inhibitor', 'CYP3A4 substrate vs inhibitor']
  },
  {
    id: 'int-clop-omep',
    drugAId: 'drug-clopidogrel',
    drugAName: 'Clopidogrel Bisulfate',
    drugBId: 'drug-omeprazole',
    drugBName: 'Omeprazole',
    severity: 'Major',
    evidenceStatus: 'Documented',
    interactionType: 'Pharmacokinetic (CYP Competition)',
    mechanism: 'Clopidogrel is an inactive prodrug requiring two-step hepatic oxidation, predominantly mediated by CYP2C19 (with CYP3A4 and CYP1A2 contribution), to form its active thiol metabolite. Omeprazole competitively inhibits CYP2C19, significantly reducing the generation of active clopidogrel thiol metabolite.',
    clinicalConsequence: 'Up to 47% reduction in clopidogrel active metabolite AUC, diminished platelet P2Y12 inhibition, increased platelet reactivity index, and significantly elevated risk of secondary ischemic events, recurrent myocardial infarction, and stent thrombosis.',
    managementGuidance: 'Avoid concomitant administration. If gastroprotective therapy is necessary in patients taking clopidogrel, substitute with pantoprazole (minimal CYP2C19 inhibitory affinity) or an H2-receptor antagonist (famotidine), or stagger dosing separated by at least 12 hours.',
    primarySources: [
      {
        name: 'FDA Drug Safety Communication',
        type: 'openFDA Label',
        citation: 'FDA Public Health Advisory: Updated safety review on clopidogrel and omeprazole interaction (Nov 2009)'
      },
      {
        name: 'RxNav RxNorm Clinical Formulation Record',
        type: 'RxNav',
        citation: 'NLM RxNav Clinical Table: Clopidogrel 75mg Oral Tablet'
      },
      {
        name: 'New England Journal of Medicine (COGENT Trial)',
        type: 'PubMed',
        citation: 'Bhatt DL, et al. Clopidogrel with or without omeprazole in coronary artery disease. N Engl J Med. 2010;363(20):1909-1917.'
      }
    ],
    targetOverlap: ['target-p2y12'],
    enzymeConflicts: ['CYP2C19 prodrug bioactivation pathway blockade']
  },
  {
    id: 'int-warf-asp',
    drugAId: 'drug-warfarin',
    drugAName: 'Warfarin Sodium',
    drugBId: 'drug-aspirin',
    drugBName: 'Aspirin',
    severity: 'Major',
    evidenceStatus: 'Documented',
    interactionType: 'Pharmacodynamic (Additive Toxicity)',
    mechanism: 'Warfarin depletes functional vitamin K-dependent procoagulant factors (II, VII, IX, X), dampening secondary fibrin clot generation. Aspirin irreversibly acetylates platelet COX-1, suppressing thromboxane A2 and disrupting primary platelet plug formation. Aspirin also induces direct gastric mucosal topical erosion.',
    clinicalConsequence: 'Synergistic disruption of both primary hemostasis and secondary coagulation cascade. Exponentially increased incidence of major gastrointestinal hemorrhage, epistaxis, hematuria, and fatal intracranial hemorrhage.',
    managementGuidance: 'Reserve combination therapy strictly for validated indications (e.g., mechanical heart valves with acute coronary syndrome). Maintain target INR at lowest effective threshold (2.0-2.5) and co-prescribe gastric mucosal protection (pantoprazole) where clinically indicated.',
    primarySources: [
      {
        name: 'American College of Chest Physicians (CHEST Guidelines)',
        type: 'Clinical Pharmacology',
        citation: 'Guyatt GH, et al. Antithrombotic Therapy and Prevention of Thrombosis, 9th ed. Chest. 2012;141(2 Suppl):7S-47S.'
      },
      {
        name: 'openFDA Drug Labeling (Aspirin & Warfarin)',
        type: 'openFDA Label',
        citation: 'Coumadin Boxed Warning & Interaction with Nonsteroidal Anti-inflammatory Drugs'
      }
    ],
    targetOverlap: ['target-vkorc1', 'target-cox1'],
    enzymeConflicts: ['Synergistic hemostatic pathway disruption']
  },
  {
    id: 'int-simv-amio',
    drugAId: 'drug-simvastatin',
    drugAName: 'Simvastatin',
    drugBId: 'drug-amiodarone',
    drugBName: 'Amiodarone Hydrochloride',
    severity: 'Contraindicated',
    evidenceStatus: 'Documented',
    interactionType: 'Pharmacokinetic (CYP Competition)',
    mechanism: 'Simvastatin undergoes extensive first-pass metabolism primarily via Cytochrome P450 3A4 (CYP3A4). Amiodarone is a moderate-to-potent CYP3A4 inhibitor, decreasing hepatic clearance and dramatically elevating circulating simvastatin lactone and active acid levels.',
    clinicalConsequence: 'Greater than 2- to 3-fold elevation in simvastatin exposure. Marked risk of skeletal muscle toxicity, myopathy, creatine kinase (CK) elevation, and life-threatening rhabdomyolysis accompanied by acute tubular necrosis and renal failure.',
    managementGuidance: 'FDA label limits simvastatin dosage to a maximum of 20 mg daily in patients receiving amiodarone. Prefer switching to a statin independent of CYP3A4 metabolism, such as rosuvastatin or pravastatin.',
    primarySources: [
      {
        name: 'FDA Safety Alert',
        type: 'openFDA Label',
        citation: 'FDA Warning: Simvastatin 80-mg dose and combination with amiodarone (June 2011)'
      },
      {
        name: 'Circulation Pharmacovigilance Analysis',
        type: 'PubMed',
        citation: 'SEARCH Study Collaborative Group. SLCO1B1 variants and statin-induced myopathy. N Engl J Med. 2008;359(8):789-799.'
      }
    ],
    targetOverlap: ['target-cyp3a4', 'target-hmgcr'],
    enzymeConflicts: ['CYP3A4 substrate clearance impairment']
  },
  {
    id: 'int-fluox-tram',
    drugAId: 'drug-fluoxetine',
    drugAName: 'Fluoxetine Hydrochloride',
    drugBId: 'drug-tramadol',
    drugBName: 'Tramadol Hydrochloride',
    severity: 'Contraindicated',
    evidenceStatus: 'Documented',
    interactionType: 'Pharmacodynamic (Additive Toxicity)',
    mechanism: 'Dual pharmacokinetic and pharmacodynamic conflict: (1) Fluoxetine is a potent CYP2D6 inhibitor, blocking the enzymatic conversion of tramadol to its active M1 metabolite (O-desmethyltramadol), causing analgesic failure. (2) Concurrently, both agents independently inhibit presynaptic serotonin reuptake (SERT/SLC6A4), causing synergistic accumulation of intrasynaptic serotonin.',
    clinicalConsequence: 'High risk of Serotonin Syndrome manifested by hyperreflexia, clonus, autonomic instability, diaphoresis, hyperthermia, seizures, and cardiovascular collapse; paradoxical loss of opioid analgesia.',
    managementGuidance: 'Contraindicated or strictly avoided. Avoid concurrent administration. If analgesia is required in patients on fluoxetine, select non-serotonergic analgesics (acetaminophen, short-course NSAID, or morphine/hydromorphone with close monitoring).',
    primarySources: [
      {
        name: 'FDA Alert on Serotonin Syndrome',
        type: 'openFDA Label',
        citation: 'FDA Drug Safety Communication: Concomitant use of serotonergic agents and opioids'
      },
      {
        name: 'British Journal of Clinical Pharmacology',
        type: 'PubMed',
        citation: 'Boyer EW, Shannon M. The serotonin syndrome. N Engl J Med. 2005;352(11):1112-1120.'
      }
    ],
    targetOverlap: ['target-sert', 'target-cyp2d6'],
    enzymeConflicts: ['CYP2D6 inhibition & SERT dual reuptake blockade']
  },
  {
    id: 'int-lisin-spiro',
    drugAId: 'drug-lisinopril',
    drugAName: 'Lisinopril',
    drugBId: 'drug-spironolactone',
    drugBName: 'Spironolactone',
    severity: 'Major',
    evidenceStatus: 'Documented',
    interactionType: 'Pharmacodynamic (Additive Toxicity)',
    mechanism: 'Lisinopril suppresses angiotensin II-stimulated aldosterone synthesis from the adrenal cortex. Spironolactone directly blocks mineralocorticoid receptors in the distal renal nephron. Both pharmacological actions synergistically impair distal tubular sodium-potassium exchange, decreasing urinary potassium excretion.',
    clinicalConsequence: 'Severe life-threatening hyperkalemia (serum potassium > 6.0 mEq/L), electrocardiographic changes (peaked T waves, PR prolongation, widened QRS), cardiac arrest, and refractory ventricular arrhythmias.',
    managementGuidance: 'Carefully evaluate baseline renal function and baseline serum potassium. If combined in heart failure (RALES protocol), cap spironolactone at 25 mg daily, recheck serum potassium and creatinine at day 3, day 7, monthly for 3 months, and every 3 months thereafter.',
    primarySources: [
      {
        name: 'New England Journal of Medicine (RALES Trial Analysis)',
        type: 'PubMed',
        citation: 'Juurlink DN, et al. Rates of hyperkalemia after publication of the Randomized Aldactone Evaluation Study. N Engl J Med. 2004;351(6):543-551.'
      },
      {
        name: 'openFDA Labeling (Prinivil & Aldactone)',
        type: 'openFDA Label',
        citation: 'FDA Prinivil Prescribing Information Section 7: Potassium-sparing diuretics'
      }
    ],
    targetOverlap: ['target-ace'],
    enzymeConflicts: ['Distal nephron mineralocorticoid and RAAS synergistic suppression']
  },
  {
    id: 'int-cipro-amio',
    drugAId: 'drug-ciprofloxacin',
    drugAName: 'Ciprofloxacin Hydrochloride',
    drugBId: 'drug-amiodarone',
    drugBName: 'Amiodarone Hydrochloride',
    severity: 'Contraindicated',
    evidenceStatus: 'Documented',
    interactionType: 'QT Prolongation',
    mechanism: 'Both ciprofloxacin and amiodarone cause voltage-dependent blockade of the rapid delayed rectifier potassium current (IKr) conducted through the cardiac hERG (KCNH2) channel. Concomitant administration exerts additive electrophysiological inhibition on myocardial ventricular repolarization.',
    clinicalConsequence: 'Profound QTc interval prolongation (>500 ms or >60 ms increase from baseline), triggering polymorphic ventricular tachycardia (Torsades de Pointes), syncope, and sudden arrhythmic cardiac arrest.',
    managementGuidance: 'Contraindicated. Avoid concomitant use of fluoroquinolones in patients receiving Class III antiarrhythmics like amiodarone. Choose alternative antibiotic classes (e.g., penicillins, cephalosporins, or carbapenems) that lack cardiac IKr channel affinity.',
    primarySources: [
      {
        name: 'CredibleMeds QTDrugs Database',
        type: 'Clinical Pharmacology',
        citation: 'Woosley RL, et al. QTdrugs List: Known Risk of Torsades de Pointes Category'
      },
      {
        name: 'Circulation Electrophysiology Guidelines',
        type: 'PubMed',
        citation: 'Drew BJ, et al. Prevention of Torsades de Pointes in hospital settings: a scientific statement. Circulation. 2010;121(8):1047-1060.'
      }
    ],
    targetOverlap: ['target-herg'],
    enzymeConflicts: ['Additive cardiomyocyte KCNH2 / IKr channel blockade']
  }
];
