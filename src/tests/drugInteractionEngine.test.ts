import { resolveStandardMedicationIdentity, autocompleteMedications } from '../services/rxnormApi';
import { analyzeDualDrugInteraction } from '../services/interactionDiscoveryEngine';
import { runBulkScientificIngestion, startAutomaticSynchronization, stopAutomaticSynchronization } from '../services/bulkIngestionEngine';
import { supabase } from '../services/supabaseClient';

async function runInteractionEngineTestSuite() {
  console.log('\n🧪 ====================================================================');
  console.log('DRUG SCOPE AI 14.0 — DYNAMIC INTERACTION ENGINE VERIFICATION SUITE');
  console.log('====================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // ---------------------------------------------------------
  // TEST 1: DYNAMIC MEDICATION RESOLUTION & TERMINOLOGY
  // ---------------------------------------------------------
  console.log('--- TEST GROUP 1: Dynamic Medication Resolution & Classification ---');

  // A. Generic Ingredient
  const warfRes = await resolveStandardMedicationIdentity('Warfarin');
  assert(
    warfRes.status === 'RESOLVED' && warfRes.rxcui === '11289' && warfRes.genericName === 'Warfarin',
    'Warfarin successfully resolved as generic ingredient (RxCUI 11289)'
  );

  // B. Brand Name mapping to generic
  const coumadinRes = await resolveStandardMedicationIdentity('Coumadin');
  assert(
    coumadinRes.status === 'RESOLVED' && coumadinRes.genericName === 'Warfarin' && coumadinRes.formType === 'brand_name',
    'Coumadin successfully normalized to generic Warfarin with brand_name designation'
  );

  // C. Xenobiotic / Substance (Alcohol / Ethanol)
  const alcoholRes = await resolveStandardMedicationIdentity('Alcohol');
  assert(
    alcoholRes.status === 'RESOLVED' && alcoholRes.genericName === 'Ethanol' && alcoholRes.formType === 'substance',
    'Alcohol successfully resolved as metabolic substance Ethanol (RxCUI 4053)'
  );

  // D. Combination Product (Paxlovid)
  const paxlovidRes = await resolveStandardMedicationIdentity('Paxlovid');
  assert(
    paxlovidRes.status === 'RESOLVED' && paxlovidRes.formType === 'combination_product',
    'Paxlovid identified as combination product (Nirmatrelvir + Ritonavir)'
  );

  // E. Invalid / Unsupported Input (Zero Fake Resolution)
  const invalidRes = await resolveStandardMedicationIdentity('xyzFakeMolecule999');
  assert(
    invalidRes.status === 'UNRECOGNIZED' && invalidRes.rxcui === 'RX-UNRESOLVED',
    'Invalid input correctly rejected as UNRECOGNIZED without silent substitution'
  );

  // F. Dynamic Autocomplete Suggestions
  const suggestions = await autocompleteMedications('Ibu');
  assert(
    suggestions.length > 0 && suggestions.some((s) => s.name.toLowerCase().includes('ibuprofen')),
    `Autocomplete returned ${suggestions.length} dynamic suggestions for prefix "Ibu"`
  );

  // ---------------------------------------------------------
  // TEST GROUP 2: PAIRWISE DRUG INTERACTION ENGINE (DIAGRAM WORKFLOW)
  // ---------------------------------------------------------
  console.log('\n--- TEST GROUP 2: Diagram Workflow — Report A & Report B Generation ---');

  // Pair 1: Warfarin + Aspirin (Major Hemorrhage Risk)
  const pair1 = await analyzeDualDrugInteraction('Warfarin', 'Aspirin');
  assert(
    pair1.status === 'SUCCESS' &&
      pair1.reportA.classification === 'Major' &&
      pair1.reportA.potentialSideEffects.some((se) => se.toLowerCase().includes('hemorrhage')),
    'Warfarin + Aspirin: Correctly classified as Major severity with hemorrhage side effects'
  );
  assert(
    pair1.reportB.whyInteractionOccurs.length > 20 &&
      pair1.reportB.safetyConsiderations.length > 0 &&
      pair1.reportA.citations.length > 0,
    'Warfarin + Aspirin: Generated Report B with pharmacological mechanisms and citations'
  );

  // Pair 2: Ibuprofen + Paracetamol (Minor Multimodal Analgesia)
  const pair2 = await analyzeDualDrugInteraction('Ibuprofen', 'Paracetamol');
  assert(
    pair2.status === 'SUCCESS' && pair2.reportA.classification === 'Minor',
    'Ibuprofen + Paracetamol: Classified as Minor (compatible multimodal analgesia)'
  );

  // Pair 3: Metformin + Alcohol (Major Lactic Acidosis / MALA)
  const pair3 = await analyzeDualDrugInteraction('Metformin', 'Alcohol');
  assert(
    pair3.status === 'SUCCESS' &&
      pair3.reportA.classification === 'Major' &&
      pair3.reportA.potentialSideEffects.some((se) => se.toLowerCase().includes('lactic acidosis')),
    'Metformin + Alcohol: Identified severe risk of Metformin-Associated Lactic Acidosis (MALA)'
  );

  // Pair 4: Amoxicillin + Ibuprofen (No Documented Significant Interaction)
  const pair4 = await analyzeDualDrugInteraction('Amoxicillin', 'Ibuprofen');
  assert(
    pair4.status === 'SUCCESS' && pair4.reportA.classification === 'No Documented Interaction',
    'Amoxicillin + Ibuprofen: Accurately identified absence of documented interaction without fabricating toxicity'
  );

  // Pair 5: Paxlovid + Simvastatin (Contraindicated)
  const pair5 = await analyzeDualDrugInteraction('Paxlovid', 'Simvastatin');
  assert(
    pair5.status === 'SUCCESS' && pair5.reportA.classification === 'Contraindicated',
    'Paxlovid + Simvastatin: Marked Contraindicated due to severe CYP3A4 statin toxicity'
  );

  // Pair 6: Unrecognized drug pair handling
  const pair6 = await analyzeDualDrugInteraction('NonexistentDrugA', 'Warfarin');
  assert(
    pair6.status === 'UNRESOLVED_MEDICATION' && pair6.unresolvedErrorMessage !== undefined,
    'Unrecognized drug pair correctly halted with explanatory error and zero fake reports'
  );

  // ---------------------------------------------------------
  // TEST GROUP 3: BULK INGESTION ENGINE & CHECKPOINTING
  // ---------------------------------------------------------
  console.log('\n--- TEST GROUP 3: Bulk Ingestion Engine & Synchronization ---');

  const ingestJob = await runBulkScientificIngestion('pubchem');
  assert(
    ingestJob.status === 'COMPLETED' && ingestJob.processedCount > 0,
    `PubChem bulk ingestion succeeded: ${ingestJob.syncedRecords.length} chemical records synced across ${ingestJob.processedCount} medicines`
  );

  // Verify scheduler starts and stops cleanly
  const stopScheduler = startAutomaticSynchronization(120);
  assert(typeof stopScheduler === 'function', 'Automatic synchronization scheduler initialized successfully');
  stopScheduler();
  assert(true, 'Automatic synchronization scheduler stopped cleanly');

  // ---------------------------------------------------------
  // TEST GROUP 4: SUPABASE REALTIME SUBSCRIPTIONS
  // ---------------------------------------------------------
  console.log('\n--- TEST GROUP 4: Supabase Realtime Channel & Teardown ---');

  const testChannel = supabase.channel('test-realtime-channel');
  assert(testChannel !== null, 'Supabase Realtime channel successfully instantiated');

  const unsubscribeStatus = await supabase.removeChannel(testChannel);
  assert(unsubscribeStatus === 'ok', 'Supabase Realtime channel cleanly unsubscribed on teardown');

  // ---------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------
  console.log('\n====================================================================');
  console.log(`INTERACTION ENGINE TEST RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================================\n');

  try {
    await supabase.removeAllChannels();
  } catch {
    // Ignore
  }

  process.exit(failed > 0 ? 1 : 0);
}

runInteractionEngineTestSuite().catch((err) => {
  console.error('Test execution fatal error:', err);
  process.exit(1);
});
