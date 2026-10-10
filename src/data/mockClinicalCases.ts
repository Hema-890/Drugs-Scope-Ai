import { ClinicalPatientCase } from '../types';

export const SYNTHETIC_PATIENT_CASES: ClinicalPatientCase[] = [
  {
    patientId: 'SYN-PT-9041',
    age: 72,
    gender: 'Male',
    diagnoses: [
      'Non-valvular Atrial Fibrillation (CHA2DS2-VASc = 4)',
      'Paroxysmal Ventricular Tachycardia s/p Cardioversion',
      'Hypertension (Stage 2)',
      'Coronary Artery Disease with DES to LAD (2023)'
    ],
    medications: [
      {
        drugId: 'drug-warfarin',
        drugName: 'Warfarin Sodium',
        dosage: '5 mg',
        frequency: 'Once daily at bedtime',
        route: 'Oral',
        startDate: '2024-01-10',
        prescriber: 'Dr. Evelyn Reed (Cardiology)'
      },
      {
        drugId: 'drug-amiodarone',
        drugName: 'Amiodarone Hydrochloride',
        dosage: '200 mg',
        frequency: 'Once daily',
        route: 'Oral',
        startDate: '2024-09-18',
        prescriber: 'Dr. Marcus Vance (Electrophysiology)'
      },
      {
        drugId: 'drug-aspirin',
        drugName: 'Aspirin (Enteric Coated)',
        dosage: '81 mg',
        frequency: 'Once daily in morning',
        route: 'Oral',
        startDate: '2023-05-12',
        prescriber: 'Dr. Evelyn Reed (Cardiology)'
      },
      {
        drugId: 'drug-simvastatin',
        drugName: 'Simvastatin',
        dosage: '40 mg',
        frequency: 'Once daily at bedtime',
        route: 'Oral',
        startDate: '2023-06-01',
        prescriber: 'Dr. Sarah Lin (Internal Medicine)'
      }
    ],
    allergies: ['Penicillins (Anaphylactoid urticaria)', 'Sulfa antibiotics (Cutaneous rash)'],
    renalFunction: {
      egfr: 54,
      serumCreatinine: 1.4,
      stage: 'CKD Stage 3a (Mild-to-moderate reduction)'
    },
    hepaticFunction: 'Normal',
    reviewStatus: 'In Review',
    reviewerNotes: 'CRITICAL ALERT: Amiodarone initiation on 2024-09-18 without documented warfarin dose reduction. Current INR has escalated to 4.8. Triple antiplatelet/anticoagulant exposure (Warfarin + Aspirin) severely elevates bleeding risk. Concurrent 40mg simvastatin exceeds FDA 20mg ceiling with amiodarone.'
  },
  {
    patientId: 'SYN-PT-4822',
    age: 64,
    gender: 'Female',
    diagnoses: [
      'Major Depressive Disorder (Recurrent, Severe)',
      'Chronic Diabetic Peripheral Neuropathy',
      'Osteoarthritis of Bilateral Knees',
      'GERD / Erosive Esophagitis'
    ],
    medications: [
      {
        drugId: 'drug-fluoxetine',
        drugName: 'Fluoxetine Hydrochloride',
        dosage: '40 mg',
        frequency: 'Once daily in morning',
        route: 'Oral',
        startDate: '2024-02-15',
        prescriber: 'Dr. Keith Sterling (Psychiatry)'
      },
      {
        drugId: 'drug-tramadol',
        drugName: 'Tramadol Hydrochloride',
        dosage: '50 mg',
        frequency: 'Every 6 hours as needed for joint pain',
        route: 'Oral',
        startDate: '2024-08-01',
        prescriber: 'Dr. Alan Ross (Orthopedics)'
      },
      {
        drugId: 'drug-omeprazole',
        drugName: 'Omeprazole Delayed-Release',
        dosage: '20 mg',
        frequency: 'Once daily 30 min before breakfast',
        route: 'Oral',
        startDate: '2023-11-20',
        prescriber: 'Dr. Lisa Cho (Gastroenterology)'
      }
    ],
    allergies: ['Codeine (Severe nausea & emesis)'],
    renalFunction: {
      egfr: 78,
      serumCreatinine: 0.9,
      stage: 'Normal to mildly reduced renal clearance'
    },
    hepaticFunction: 'Normal',
    reviewStatus: 'Pending',
    reviewerNotes: 'HIGH RISK CONFLICT: Fluoxetine + Tramadol combination poses acute risk of Serotonin Syndrome and blunts tramadol analgesia via CYP2D6 inhibition.'
  },
  {
    patientId: 'SYN-PT-3108',
    age: 58,
    gender: 'Male',
    diagnoses: [
      'Heart Failure with Reduced Ejection Fraction (HFrEF, EF 32%)',
      'Post-Myocardial Infarction Status Post PCI (Stent to Circumflex)',
      'Essential Hypertension'
    ],
    medications: [
      {
        drugId: 'drug-clopidogrel',
        drugName: 'Clopidogrel Bisulfate',
        dosage: '75 mg',
        frequency: 'Once daily',
        route: 'Oral',
        startDate: '2024-03-04',
        prescriber: 'Dr. Evelyn Reed (Cardiology)'
      },
      {
        drugId: 'drug-omeprazole',
        drugName: 'Omeprazole',
        dosage: '40 mg',
        frequency: 'Once daily',
        route: 'Oral',
        startDate: '2024-03-05',
        prescriber: 'Dr. Evelyn Reed (Cardiology)'
      },
      {
        drugId: 'drug-lisinopril',
        drugName: 'Lisinopril',
        dosage: '20 mg',
        frequency: 'Once daily',
        route: 'Oral',
        startDate: '2024-03-04',
        prescriber: 'Dr. Evelyn Reed (Cardiology)'
      },
      {
        drugId: 'drug-spironolactone',
        drugName: 'Spironolactone',
        dosage: '25 mg',
        frequency: 'Once daily',
        route: 'Oral',
        startDate: '2024-04-10',
        prescriber: 'Dr. Evelyn Reed (Cardiology)'
      }
    ],
    allergies: ['NKDA (No Known Drug Allergies)'],
    renalFunction: {
      egfr: 48,
      serumCreatinine: 1.6,
      stage: 'CKD Stage 3a'
    },
    hepaticFunction: 'Normal',
    reviewStatus: 'Signed-Off',
    reviewerNotes: 'MEDICATION RECONCILIATION COMPLETED: (1) Replaced Omeprazole with Pantoprazole 40mg to prevent CYP2C19 competitive inhibition with Clopidogrel. (2) Scheduled renal panel and potassium check at day 7 for Lisinopril + Spironolactone dual RAAS therapy.',
    signedOffBy: 'Dr. Jonathan Hayes, PharmD, BCPS',
    signedOffAt: '2024-09-30T14:22:00Z'
  }
];
