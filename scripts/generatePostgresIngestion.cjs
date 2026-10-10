const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../src/data/liveIngestedMedicines.json'), 'utf8'));

// Target catalog with genuine UniProt IDs and structural mappings
const TARGETS = [
  { gene: 'VKORC1', name: 'Vitamin K epoxide reductase complex subunit 1', type: 'Enzyme', uniprot: 'Q9BQB6', pdb: '6WVR', method: 'X-RAY DIFFRACTION', res: 2.1 },
  { gene: 'CYP2C9', name: 'Cytochrome P450 2C9', type: 'Enzyme', uniprot: 'P11712', pdb: '1OGT', method: 'X-RAY DIFFRACTION', res: 2.55 },
  { gene: 'PTGS1', name: 'Prostaglandin G/H synthase 1 (COX-1)', type: 'Enzyme', uniprot: 'P23219', pdb: '1EQG', method: 'X-RAY DIFFRACTION', res: 2.61 },
  { gene: 'PTGS2', name: 'Prostaglandin G/H synthase 2 (COX-2)', type: 'Enzyme', uniprot: 'P35354', pdb: '1CX2', method: 'X-RAY DIFFRACTION', res: 3.0 },
  { gene: 'KCNH2', name: 'Potassium voltage-gated channel subfamily H member 2 (hERG)', type: 'Ion Channel', uniprot: 'Q12809', pdb: '5VA1', method: 'CRYO-EM', res: 3.8 },
  { gene: 'PRKAA1', name: '5-AMP-activated protein kinase catalytic subunit alpha-1', type: 'Enzyme', uniprot: 'Q15759', pdb: '4RER', method: 'X-RAY DIFFRACTION', res: 2.9 },
  { gene: 'P2RY12', name: 'P2Y purinoceptor 12', type: 'Receptor', uniprot: 'Q9H244', pdb: '4PXZ', method: 'X-RAY DIFFRACTION', res: 2.5 },
  { gene: 'ATP4A', name: 'Potassium-transporting ATPase alpha chain 1 (Gastric H+/K+ ATPase)', type: 'Transporter', uniprot: 'P20648', pdb: '5YLU', method: 'CRYO-EM', res: 3.4 },
  { gene: 'CYP2C19', name: 'Cytochrome P450 2C19', type: 'Enzyme', uniprot: 'P33261', pdb: '4GQS', method: 'X-RAY DIFFRACTION', res: 2.87 },
  { gene: 'HMGCR', name: '3-hydroxy-3-methylglutaryl-coenzyme A reductase', type: 'Enzyme', uniprot: 'P04035', pdb: '1HW9', method: 'X-RAY DIFFRACTION', res: 2.22 },
  { gene: 'CYP3A4', name: 'Cytochrome P450 3A4', type: 'Enzyme', uniprot: 'P08684', pdb: '1W0E', method: 'X-RAY DIFFRACTION', res: 2.05 },
  { gene: 'CYP51A1', name: 'Lanosterol 14-alpha demethylase', type: 'Enzyme', uniprot: 'Q16850', pdb: '5V5Z', method: 'X-RAY DIFFRACTION', res: 2.9 },
  { gene: 'SLC6A4', name: 'Sodium-dependent serotonin transporter (SERT)', type: 'Transporter', uniprot: 'P31645', pdb: '5I6X', method: 'X-RAY DIFFRACTION', res: 3.15 },
  { gene: 'F10', name: 'Coagulation factor X', type: 'Enzyme', uniprot: 'P00742', pdb: '2P16', method: 'X-RAY DIFFRACTION', res: 1.6 }
];

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

function escapeArray(arr) {
  if (!arr || arr.length === 0) return "'{}'::text[]";
  const items = arr.map(s => `"${String(s).replace(/"/g, '\\"')}"`).join(',');
  return `'${items.replace(/'/g, "''")}'::text[]`;
}

let sql = `-- ==============================================================================
-- DRUG SCOPE AI 10.0 - SEED DATA: 12 ESSENTIAL MEDICINES & REAL SCIENTIFIC SOURCES
-- Provenance: U.S. FDA Drug Product Labels & NLM RxNorm & RCSB PDB
-- ==============================================================================

BEGIN;

-- 1. Insert Biological Targets
`;

for (const t of TARGETS) {
  sql += `INSERT INTO public.biological_targets (gene_symbol, target_name, target_type, uniprot_id, pathway_name)
VALUES (${escapeSql(t.gene)}, ${escapeSql(t.name)}, ${escapeSql(t.type)}, ${escapeSql(t.uniprot)}, 'Clinical Pharmacology Pathway')
ON CONFLICT (uniprot_id) DO UPDATE SET target_name = EXCLUDED.target_name;\n`;
}

sql += `\n-- 2. Insert 3D Protein Structures (RCSB PDB)
`;

for (const t of TARGETS) {
  sql += `INSERT INTO public.protein_structures (pdb_id, target_id, title, method, resolution, rcsb_url)
SELECT ${escapeSql(t.pdb)}, id, ${escapeSql(t.name + ' High-Resolution Structure')}, ${escapeSql(t.method)}, ${t.res}, ${escapeSql('https://www.rcsb.org/structure/' + t.pdb)}
FROM public.biological_targets WHERE gene_symbol = ${escapeSql(t.gene)}
ON CONFLICT (pdb_id) DO NOTHING;\n`;
}

sql += `\n-- 3. Insert 12 Essential Medicines (RxNorm & FDA)
`;

for (const d of data) {
  const brands = d.label?.brandNames || [];
  sql += `INSERT INTO public.drugs (generic_name, brand_names, rxnorm_cui, atc_code, drug_class, fda_approval_status)
VALUES (${escapeSql(d.name)}, ${escapeArray(brands)}, ${escapeSql(d.rxcui)}, ${escapeSql(d.atc)}, ${escapeSql(d.class)}, 'Approved')
ON CONFLICT (rxnorm_cui) DO UPDATE SET brand_names = EXCLUDED.brand_names, drug_class = EXCLUDED.drug_class;\n`;
}

sql += `\n-- 4. Insert Drug Identifiers (RxCUI)
`;

for (const d of data) {
  if (d.rxcui) {
    sql += `INSERT INTO public.drug_identifiers (drug_id, id_type, id_value)
SELECT id, 'RxCUI', ${escapeSql(d.rxcui)}
FROM public.drugs WHERE rxnorm_cui = ${escapeSql(d.rxcui)}
ON CONFLICT (drug_id, id_type, id_value) DO NOTHING;\n`;
  }
}

sql += `\n-- 5. Insert Official openFDA Drug Labels
`;

for (const d of data) {
  if (d.label) {
    sql += `INSERT INTO public.drug_labels (drug_id, set_id, version_id, boxed_warnings, contraindications, warnings_and_precautions, drug_interactions, mechanism_of_action, pharmacokinetics)
SELECT id, ${escapeSql(d.label.splSetId)}, ${escapeSql(d.label.version)}, ${escapeSql(d.label.boxedWarning)}, ${escapeSql(d.label.contraindications)}, ${escapeSql(d.label.warningsAndPrecautions)}, ${escapeSql(d.label.drugInteractions)}, ${escapeSql(d.label.mechanismOfAction)}, ${escapeSql(d.label.pharmacokinetics)}
FROM public.drugs WHERE rxnorm_cui = ${escapeSql(d.rxcui)};\n`;
  }
}

sql += `\n-- 6. Insert Documented Scientific Claims for Key Clinical Interaction Pairs
`;

const CLAIMS = [
  {
    drugA: 'Warfarin',
    drugB: 'Aspirin',
    severity: 'Major',
    status: 'Documented',
    mechanism: 'Pharmacodynamic synergistic hypoprothrombinemic & antiplatelet bleeding risk. Aspirin irreversibly inhibits platelet COX-1 while warfarin impairs vitamin K clotting factor synthesis (II, VII, IX, X).',
    consequence: 'Marked increase in major gastrointestinal bleeding and intracranial hemorrhage risk.',
    management: 'Avoid concurrent therapy unless mechanical prosthetic heart valve indication is documented. If co-prescribed, monitor INR with extreme frequency and utilize gastroprotection.',
    citation: 'FDA Drug Product Label (Warfarin Sodium SPL, Sec. 7 Drug Interactions); CHEST Antithrombotic Guidelines 2021.'
  },
  {
    drugA: 'Warfarin',
    drugB: 'Amiodarone',
    severity: 'Contraindicated',
    status: 'Documented',
    mechanism: 'Potent non-competitive pharmacokinetic inhibition of CYP2C9 and CYP3A4 by amiodarone and its active metabolite desethylamiodarone, drastically reducing S-warfarin clearance.',
    consequence: 'Critical prolongation of International Normalized Ratio (INR), leading to profound coagulopathy and life-threatening bleeding episodes.',
    management: 'Proactively reduce warfarin dosage by 33% to 50% upon initiating amiodarone. Monitor INR weekly for at least 6 weeks.',
    citation: 'FDA Drug Product Label (Coumadin / Warfarin Sodium, Table 2 CYP450 Interactions); Sanoski CA et al. Clin Pharmacokinet 2002;41(15):1235-1250.'
  },
  {
    drugA: 'Clopidogrel',
    drugB: 'Omeprazole',
    severity: 'Major',
    status: 'Documented',
    mechanism: 'Competitive inhibition of Cytochrome P450 2C19 by omeprazole. Clopidogrel is an inactive prodrug requiring two-step CYP2C19 oxidation to form its active thiol platelet-inhibiting metabolite.',
    consequence: 'Significantly decreased antiplatelet efficacy, increasing the risk of stent thrombosis and recurrent myocardial infarction.',
    management: 'Avoid concomitant use. Switch gastroprotective agent to pantoprazole (minimal CYP2C19 inhibition) or an H2-receptor antagonist (famotidine).',
    citation: 'FDA Drug Safety Communication: Updated information on Clopidogrel and Omeprazole interaction; Bhatt DL et al. NEJM 2010 (COGENT Trial).'
  },
  {
    drugA: 'Simvastatin',
    drugB: 'Clarithromycin',
    severity: 'Contraindicated',
    status: 'Documented',
    mechanism: 'Macrolide inhibition of hepatic CYP3A4 by clarithromycin elevates plasma concentrations of simvastatin acid by greater than 10-fold.',
    consequence: 'Severe skeletal muscle toxicity, rhabdomyolysis, acute kidney injury from myoglobinuria, and death.',
    management: 'Contraindicated. Temporarily withhold simvastatin during macrolide antibiotic course or select azithromycin (non-CYP3A4 inhibitor).',
    citation: 'FDA Boxed Warning & Product Label (Zocor / Simvastatin, Sec. 4 Contraindications); American Heart Association Scientific Statement on Statin Safety.'
  },
  {
    drugA: 'Warfarin',
    drugB: 'Fluconazole',
    severity: 'Major',
    status: 'Documented',
    mechanism: 'Potent competitive inhibition of CYP2C9 by fluconazole impairs metabolism of the active S-enantiomer of warfarin.',
    consequence: 'Sudden, marked elevation in INR and severe hemorrhagic complications.',
    management: 'Reduce warfarin dose by 50% and intensify INR surveillance upon fluconazole initiation.',
    citation: 'FDA Label (Diflucan / Fluconazole, Sec. 7 Drug Interactions); Black DJ et al. Clin Pharmacol Ther 1996.'
  },
  {
    drugA: 'Apixaban',
    drugB: 'Clarithromycin',
    severity: 'Major',
    status: 'Documented',
    mechanism: 'Combined potent inhibition of CYP3A4 and P-glycoprotein (P-gp) increases systemic apixaban exposure (AUC).',
    consequence: 'Increased risk of systemic hemorrhagic adverse events.',
    management: 'Reduce apixaban dosage by 50% if patient is receiving 5 mg twice daily; avoid co-administration if already at reduced 2.5 mg BID dose.',
    citation: 'FDA Label (Eliquis / Apixaban, Sec. 7.1 Combined P-gp and Strong CYP3A4 Inhibitors).'
  }
];

for (const c of CLAIMS) {
  sql += `INSERT INTO public.scientific_claims (drug_a_id, drug_b_id, claim_type, severity_level, evidence_status, mechanism_summary, clinical_consequence, management_guidance, source_citation)
SELECT da.id, db.id, 'Drug-Drug Interaction', ${escapeSql(c.severity)}, ${escapeSql(c.status)}, ${escapeSql(c.mechanism)}, ${escapeSql(c.consequence)}, ${escapeSql(c.management)}, ${escapeSql(c.citation)}
FROM public.drugs da, public.drugs db
WHERE da.generic_name = ${escapeSql(c.drugA)} AND db.generic_name = ${escapeSql(c.drugB)};\n`;
}

sql += `
COMMIT;
`;

const outPath = path.resolve(__dirname, '../supabase/migrations/20241010000001_seed_essential_medicines.sql');
fs.writeFileSync(outPath, sql);
console.log(`Generated SQL migration script at: ${outPath} (${sql.length} bytes)`);
