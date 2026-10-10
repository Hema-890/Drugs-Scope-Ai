const fs = require('fs');
const path = require('path');

// Read OPENFDA_API_KEY from .env.local
let openfdaKey = '';
try {
  const envContent = fs.readFileSync(path.resolve(__dirname, '../.env.local'), 'utf8');
  const match = envContent.match(/OPENFDA_API_KEY=(.*)/);
  if (match) openfdaKey = match[1].trim();
} catch (e) {}

const ESSENTIAL_DRUGS = [
  { name: 'Warfarin', class: 'Vitamin K Antagonist Anticoagulant', atc: 'B01AA03', targets: ['VKORC1', 'CYP2C9'] },
  { name: 'Aspirin', class: 'Cyclooxygenase Inhibitor Antiplatelet / NSAID', atc: 'B01AC06', targets: ['PTGS1', 'PTGS2'] },
  { name: 'Amiodarone', class: 'Class III Antiarrhythmic & CYP2C9 Inhibitor', atc: 'C01BD01', targets: ['KCNH2', 'CYP2C9'] },
  { name: 'Metformin', class: 'Biguanide Antihyperglycemic', atc: 'A10BA02', targets: ['PRKAA1'] },
  { name: 'Clopidogrel', class: 'P2Y12 Platelet Inhibitor Prodrug', atc: 'B01AC04', targets: ['P2RY12', 'CYP2C19'] },
  { name: 'Omeprazole', class: 'Proton Pump Inhibitor (CYP2C19 Inhibitor)', atc: 'A02BC01', targets: ['ATP4A', 'CYP2C19'] },
  { name: 'Simvastatin', class: 'HMG-CoA Reductase Inhibitor (CYP3A4 Substrate)', atc: 'C10AA01', targets: ['HMGCR', 'CYP3A4'] },
  { name: 'Clarithromycin', class: 'Macrolide Antibiotic & Potent CYP3A4 Inhibitor', atc: 'J01FA09', targets: ['CYP3A4'] },
  { name: 'Fluconazole', class: 'Triazole Antifungal & Potent CYP2C9 Inhibitor', atc: 'J02AC01', targets: ['CYP51A1', 'CYP2C9'] },
  { name: 'Sertraline', class: 'Selective Serotonin Reuptake Inhibitor (SSRI)', atc: 'N06AB06', targets: ['SLC6A4'] },
  { name: 'Ibuprofen', class: 'Nonsteroidal Anti-inflammatory Drug (NSAID)', atc: 'M01AE01', targets: ['PTGS1', 'PTGS2'] },
  { name: 'Apixaban', class: 'Direct Oral Factor Xa Inhibitor Anticoagulant', atc: 'B01AF02', targets: ['F10'] }
];

async function fetchRxNorm(name) {
  try {
    const res = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(name)}`);
    const data = await res.json();
    const rxcui = data.idGroup?.rxnormId?.[0] || null;
    return rxcui;
  } catch (e) {
    return null;
  }
}

async function fetchOpenFdaLabel(name) {
  try {
    const keyParam = openfdaKey ? `&api_key=${encodeURIComponent(openfdaKey)}` : '';
    const res = await fetch(`https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encodeURIComponent(name.toLowerCase())}"&limit=1${keyParam}`);
    if (!res.ok) return null;
    const data = await res.json();
    const item = data.results?.[0];
    if (!item) return null;

    return {
      brandNames: item.openfda?.brand_name || [],
      splSetId: item.openfda?.spl_set_id?.[0] || item.id || null,
      version: item.openfda?.version?.[0] || '1',
      effectiveTime: item.effective_time || null,
      boxedWarning: item.boxed_warning?.[0] || null,
      contraindications: item.contraindications?.[0] || null,
      warningsAndPrecautions: item.warnings_and_precautions?.[0] || item.warnings?.[0] || null,
      drugInteractions: item.drug_interactions?.[0] || null,
      mechanismOfAction: item.mechanism_of_action?.[0] || item.clinical_pharmacology?.[0] || null,
      pharmacokinetics: item.pharmacokinetics?.[0] || null
    };
  } catch (e) {
    return null;
  }
}

async function main() {
  console.log('Fetching live scientific data for 12 Essential Medicines...');
  const results = [];

  for (const drug of ESSENTIAL_DRUGS) {
    process.stdout.write(`Fetching ${drug.name}... `);
    const rxcui = await fetchRxNorm(drug.name);
    const label = await fetchOpenFdaLabel(drug.name);
    
    console.log(`RxCUI: ${rxcui || 'N/A'}, FDA Label: ${label ? 'YES (' + (label.drugInteractions ? 'Interactions ' + label.drugInteractions.length + ' chars' : 'No interactions section') + ')' : 'NO'}`);

    results.push({
      ...drug,
      rxcui,
      label
    });
  }

  const outPath = path.resolve(__dirname, '../src/data/liveIngestedMedicines.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\nSaved live fetched data to ${outPath}`);
}

main().catch(console.error);
