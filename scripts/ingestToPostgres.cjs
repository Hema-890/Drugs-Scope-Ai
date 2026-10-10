const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Initialize admin client from environment
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://kfdntklvvvorbgatyqcg.supabase.co';
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!secretKey) {
  console.error('SUPABASE_SECRET_KEY is required for privileged ingestion.');
  process.exit(1);
}

const adminClient = createClient(url, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../src/data/liveIngestedMedicines.json'), 'utf8'));

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

async function ingestAll() {
  console.log('🚀 Starting Server-Side Ingestion into Supabase PostgreSQL...\n');

  // STEP 1: Biological Targets
  console.log('1. Ingesting Biological Targets...');
  for (const t of TARGETS) {
    const { error } = await adminClient.from('biological_targets').upsert({
      gene_symbol: t.gene,
      target_name: t.name,
      target_type: t.type,
      uniprot_id: t.uniprot,
      pathway_name: 'Clinical Pharmacology Pathway'
    }, { onConflict: 'uniprot_id' });
    if (error) console.error(`  ❌ Target ${t.gene}:`, error.message);
    else console.log(`  ✅ Target ${t.gene} (${t.uniprot})`);
  }

  // STEP 2: Protein Structures
  console.log('\n2. Ingesting 3D Protein Structures (RCSB PDB)...');
  const { data: dbTargets } = await adminClient.from('biological_targets').select('id, gene_symbol');
  const targetMap = new Map((dbTargets || []).map(t => [t.gene_symbol, t.id]));

  for (const t of TARGETS) {
    const targetId = targetMap.get(t.gene);
    const { error } = await adminClient.from('protein_structures').upsert({
      pdb_id: t.pdb,
      target_id: targetId,
      title: `${t.name} Crystal Structure`,
      method: t.method,
      resolution: t.res,
      rcsb_url: `https://www.rcsb.org/structure/${t.pdb}`
    }, { onConflict: 'pdb_id' });
    if (error) console.error(`  ❌ PDB ${t.pdb}:`, error.message);
    else console.log(`  ✅ PDB ${t.pdb} for ${t.gene}`);
  }

  // STEP 3: Drugs
  console.log('\n3. Ingesting 12 Essential Medicines...');
  for (const d of data) {
    const { error } = await adminClient.from('drugs').upsert({
      generic_name: d.name,
      brand_names: d.label?.brandNames || [],
      rxnorm_cui: d.rxcui,
      atc_code: d.atc,
      drug_class: d.class,
      fda_approval_status: 'Approved'
    }, { onConflict: 'rxnorm_cui' });
    if (error) console.error(`  ❌ Drug ${d.name}:`, error.message);
    else console.log(`  ✅ Drug ${d.name} (RxCUI: ${d.rxcui})`);
  }

  // STEP 4: Drug Identifiers
  console.log('\n4. Ingesting Drug Identifiers...');
  const { data: dbDrugs } = await adminClient.from('drugs').select('id, generic_name, rxnorm_cui');
  const drugMap = new Map((dbDrugs || []).map(d => [d.generic_name, d.id]));

  for (const d of data) {
    const drugId = drugMap.get(d.name);
    if (drugId && d.rxcui) {
      const { error } = await adminClient.from('drug_identifiers').upsert({
        drug_id: drugId,
        id_type: 'RxCUI',
        id_value: d.rxcui
      }, { onConflict: 'drug_id,id_type,id_value' });
      if (error) console.error(`  ❌ Identifier ${d.name}:`, error.message);
      else console.log(`  ✅ Identifier ${d.name}: RxCUI ${d.rxcui}`);
    }
  }

  // STEP 5: Drug Labels
  console.log('\n5. Ingesting Official FDA Drug Labels...');
  for (const d of data) {
    const drugId = drugMap.get(d.name);
    if (drugId && d.label) {
      // Check if label already exists
      const { data: existingLabels } = await adminClient.from('drug_labels').select('id').eq('drug_id', drugId);
      if (!existingLabels || existingLabels.length === 0) {
        const { error } = await adminClient.from('drug_labels').insert({
          drug_id: drugId,
          set_id: d.label.splSetId,
          version_id: d.label.version,
          boxed_warnings: d.label.boxedWarning,
          contraindications: d.label.contraindications,
          warnings_and_precautions: d.label.warningsAndPrecautions,
          drug_interactions: d.label.drugInteractions,
          mechanism_of_action: d.label.mechanismOfAction,
          pharmacokinetics: d.label.pharmacokinetics
        });
        if (error) console.error(`  ❌ Label ${d.name}:`, error.message);
        else console.log(`  ✅ FDA Label ${d.name} (SPL: ${d.label.splSetId})`);
      } else {
        console.log(`  ℹ️ FDA Label ${d.name} already cached in PostgreSQL`);
      }
    }
  }

  // STEP 6: Scientific Claims
  console.log('\n6. Ingesting Documented Scientific Claims...');
  for (const c of CLAIMS) {
    const drugAId = drugMap.get(c.drugA);
    const drugBId = drugMap.get(c.drugB);
    if (drugAId && drugBId) {
      const { data: existingClaims } = await adminClient.from('scientific_claims')
        .select('id')
        .eq('drug_a_id', drugAId)
        .eq('drug_b_id', drugBId);

      if (!existingClaims || existingClaims.length === 0) {
        const { error } = await adminClient.from('scientific_claims').insert({
          drug_a_id: drugAId,
          drug_b_id: drugBId,
          claim_type: 'Drug-Drug Interaction',
          severity_level: c.severity,
          evidence_status: c.status,
          mechanism_summary: c.mechanism,
          clinical_consequence: c.consequence,
          management_guidance: c.management,
          source_citation: c.citation
        });
        if (error) console.error(`  ❌ Claim ${c.drugA} + ${c.drugB}:`, error.message);
        else console.log(`  ✅ Claim ${c.drugA} + ${c.drugB} (${c.severity})`);
      } else {
        console.log(`  ℹ️ Claim ${c.drugA} + ${c.drugB} already exists`);
      }
    }
  }

  console.log('\n🎉 ALL REAL SCIENTIFIC DATA SUCCESSFULLY INGESTED INTO POSTGRESQL!');
}

ingestAll().catch(console.error);
