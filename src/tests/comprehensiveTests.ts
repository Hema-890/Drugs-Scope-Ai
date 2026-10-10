import assert from 'node:assert';
import { generateDeterministicProteinModel } from '../services/rcsbPdbApi';
import { VERIFIED_DRUGS } from '../data/mockDrugs';
import { PAIRWISE_INTERACTIONS } from '../data/mockInteractions';
import { BIOLOGICAL_TARGETS } from '../data/mockTargets';
import { PROTEIN_STRUCTURES } from '../data/mockStructures';
import { runMedicineAnalysis } from '../services/analysisEngine';

async function runAllTests() {
  console.log('🧪 Starting Drug Scope AI Comprehensive Automated Test Suite...\n');
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => void | Promise<void>) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err?.message || err}`);
      failed++;
    }
  }

  // ==========================================
  // 1. RCSB PDB Structure Generation & Coordinates
  // ==========================================
  await test('RCSB PDB Fallback Model generates valid coordinates and atoms', () => {
    const model = generateDeterministicProteinModel('7K3N');
    assert.strictEqual(model.pdbId, '7K3N');
    assert.ok(model.atoms.length > 50, 'Must have at least 50 atoms');
    assert.ok(model.chains.length >= 1, 'Must have at least 1 chain');
    assert.ok(model.residueCount > 20, 'Must have residue count > 20');

    // Verify CA atoms exist
    const caAtoms = model.atoms.filter((a) => a.name === 'CA');
    assert.ok(caAtoms.length > 30, 'Must contain alpha carbon (CA) backbone atoms');

    // Verify ligand atoms exist
    const ligAtoms = model.atoms.filter((a) => a.isHetatm);
    assert.ok(ligAtoms.length > 5, 'Must contain ligand / inhibitor atoms');
  });

  await test('RCSB PDB Fallback is deterministic for identical PDB IDs', () => {
    const m1 = generateDeterministicProteinModel('1M17');
    const m2 = generateDeterministicProteinModel('1M17');
    assert.strictEqual(m1.atoms.length, m2.atoms.length);
    assert.strictEqual(m1.atoms[0].x, m2.atoms[0].x);
    assert.strictEqual(m1.atoms[0].y, m2.atoms[0].y);
    assert.strictEqual(m1.atoms[0].z, m2.atoms[0].z);
  });

  // ==========================================
  // 2. Verified Drug Registry Integrity
  // ==========================================
  await test('Verified drugs catalog has valid clinical pharmacology attributes', () => {
    assert.ok(VERIFIED_DRUGS.length >= 8, 'Registry must have at least 8 core drugs');
    for (const drug of VERIFIED_DRUGS) {
      assert.ok(drug.id, 'Drug must have an id');
      assert.ok(drug.genericName, 'Drug must have a generic name');
      assert.ok(drug.brandNames.length > 0, 'Drug must have brand names');
      assert.ok(drug.drugClass, 'Drug must have a drug class');
      assert.ok(Array.isArray(drug.primaryMetabolizingEnzymes), 'Enzymes must be an array');
      assert.ok(Array.isArray(drug.targets), 'Targets must be an array');
      assert.ok(drug.description.length > 10, 'Description must be descriptive');
    }
  });

  // ==========================================
  // 3. Clinical Pairwise Interaction Detection
  // ==========================================
  await test('Pairwise interaction catalog contains severe clinical interactions', () => {
    assert.ok(PAIRWISE_INTERACTIONS.length >= 4, 'Interaction catalog must have entries');

    const warfarinAmiodarone = PAIRWISE_INTERACTIONS.find(
      (i) =>
        (i.drugAId === 'drug-warfarin' && i.drugBId === 'drug-amiodarone') ||
        (i.drugAId === 'drug-amiodarone' && i.drugBId === 'drug-warfarin')
    );
    assert.ok(warfarinAmiodarone, 'Warfarin + Amiodarone interaction must be present in registry');
    assert.strictEqual(warfarinAmiodarone.severity, 'Major', 'Warfarin + Amiodarone must be Major severity');
    assert.ok(warfarinAmiodarone.mechanism.toLowerCase().includes('cyp2c9'), 'Must detail CYP2C9 mechanism');

    const clopidogrelOmeprazole = PAIRWISE_INTERACTIONS.find(
      (i) =>
        (i.drugAId === 'drug-clopidogrel' && i.drugBId === 'drug-omeprazole') ||
        (i.drugAId === 'drug-omeprazole' && i.drugBId === 'drug-clopidogrel')
    );
    assert.ok(clopidogrelOmeprazole, 'Clopidogrel + Omeprazole interaction must be present');
    assert.ok(clopidogrelOmeprazole.mechanism.includes('CYP2C19'), 'Must identify CYP2C19 conflict');
  });

  // ==========================================
  // 4. Biological Targets and Protein Structures
  // ==========================================
  await test('Biological target catalog contains validated gene symbols and UniProt IDs', () => {
    assert.ok(BIOLOGICAL_TARGETS.length >= 4, 'Must have biological targets');
    for (const target of BIOLOGICAL_TARGETS) {
      assert.ok(target.geneSymbol, 'Target must have geneSymbol');
      assert.ok(target.uniprotId, 'Target must have uniprotId');
      assert.ok(target.targetName, 'Target must have targetName');
      assert.ok(target.targetType, 'Target must have targetType');
    }
  });

  await test('Protein structures catalog maps to real RCSB PDB IDs and coordinates', () => {
    assert.ok(PROTEIN_STRUCTURES.length >= 4, 'Must have protein structures');
    const pdb6WVR = PROTEIN_STRUCTURES.find((s) => s.pdbId === '6WVR');
    assert.ok(pdb6WVR, 'Structure 6WVR must exist');
    assert.strictEqual(pdb6WVR.targetSymbol, 'VKORC1');
    assert.ok(pdb6WVR.rcsbUrl.includes('rcsb.org/structure/6WVR'));
  });

  // ==========================================
  // 5. Medicine Analysis Engine Execution
  // ==========================================
  await test('Analysis engine correctly computes multi-tier explanations for Warfarin + Amiodarone', async () => {
    const warf = VERIFIED_DRUGS.find((d) => d.id === 'drug-warfarin')!;
    const amio = VERIFIED_DRUGS.find((d) => d.id === 'drug-amiodarone')!;
    assert.ok(warf && amio, 'Warfarin and Amiodarone must exist in drug list');

    const session = await runMedicineAnalysis([warf, amio], { ageCategory: 'Geriatric (>= 65)' }, 'professional');

    assert.ok(session.id.startsWith('DSA-ANL-'), 'Session ID must be prefixed properly');
    assert.strictEqual(session.medications.length, 2);
    assert.ok(session.findings.length > 0, 'Must produce findings');

    const mainFinding = session.findings[0];
    assert.strictEqual(mainFinding.severity, 'Major');
    assert.ok(mainFinding.simpleExplanation.length > 20, 'Simple explanation must be present');
    assert.ok(mainFinding.professionalExplanation.length > 20, 'Professional explanation must be present');
    assert.ok(mainFinding.researchExplanation.length > 20, 'Research explanation must be present');
    assert.ok(session.summary.majorCount >= 1, 'Major count must be at least 1');
    assert.ok(session.graphData.nodes.length >= 2, 'Graph nodes must contain both drugs');
  });

  // ==========================================
  // Summary
  // ==========================================
  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((e) => {
  console.error('Test execution error:', e);
  process.exit(1);
});
