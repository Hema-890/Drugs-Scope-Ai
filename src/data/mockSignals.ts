import { PharmacovigilanceSignal } from '../types';

export const PHARMACOVIGILANCE_SIGNALS: PharmacovigilanceSignal[] = [
  {
    id: 'sig-001',
    drugName: 'Warfarin Sodium + Amiodarone',
    reactionTerm: 'International Normalized Ratio Increased / Major Hemorrhage',
    reportCount: 3840,
    proportionalReportingRatio: 4.82,
    reportingOddsRatio: 5.16,
    signalTrend: 'Increasing',
    seriousOutcomeRate: 78.4,
    source: 'openFDA FAERS',
    lastUpdated: '2026-09-30',
    duplicateAwarenessFlag: true
  },
  {
    id: 'sig-002',
    drugName: 'Simvastatin + Amiodarone',
    reactionTerm: 'Rhabdomyolysis & Myopathy',
    reportCount: 1650,
    proportionalReportingRatio: 6.12,
    reportingOddsRatio: 6.89,
    signalTrend: 'Stable',
    seriousOutcomeRate: 84.1,
    source: 'openFDA FAERS',
    lastUpdated: '2026-09-15',
    duplicateAwarenessFlag: true
  },
  {
    id: 'sig-003',
    drugName: 'Fluoxetine + Tramadol',
    reactionTerm: 'Serotonin Syndrome / Neuroleptic Malignant Syndrome-like symptoms',
    reportCount: 920,
    proportionalReportingRatio: 5.40,
    reportingOddsRatio: 5.82,
    signalTrend: 'Increasing',
    seriousOutcomeRate: 81.3,
    source: 'openFDA FAERS',
    lastUpdated: '2026-09-22',
    duplicateAwarenessFlag: true
  },
  {
    id: 'sig-004',
    drugName: 'Clopidogrel + Omeprazole',
    reactionTerm: 'In-Stent Thrombosis / Acute Coronary Syndrome Recurrence',
    reportCount: 2410,
    proportionalReportingRatio: 2.94,
    reportingOddsRatio: 3.10,
    signalTrend: 'Decreasing',
    seriousOutcomeRate: 69.5,
    source: 'openFDA FAERS',
    lastUpdated: '2026-08-30',
    duplicateAwarenessFlag: true
  },
  {
    id: 'sig-005',
    drugName: 'Lisinopril + Spironolactone',
    reactionTerm: 'Hyperkalemia with Cardiac Conduction Abnormality',
    reportCount: 1820,
    proportionalReportingRatio: 3.75,
    reportingOddsRatio: 3.98,
    signalTrend: 'Stable',
    seriousOutcomeRate: 72.8,
    source: 'openFDA FAERS',
    lastUpdated: '2026-09-18',
    duplicateAwarenessFlag: true
  },
  {
    id: 'sig-006',
    drugName: 'Ciprofloxacin + Amiodarone',
    reactionTerm: 'Electrocardiogram QT Prolonged / Torsades de Pointes',
    reportCount: 640,
    proportionalReportingRatio: 7.22,
    reportingOddsRatio: 8.04,
    signalTrend: 'Increasing',
    seriousOutcomeRate: 92.0,
    source: 'openFDA FAERS',
    lastUpdated: '2026-09-25',
    duplicateAwarenessFlag: true
  }
];
