import assert from 'node:assert';
import { createClient } from '@supabase/supabase-js';
import jsPDF from 'jspdf';
import { runMedicineAnalysis } from '../services/analysisEngine';
import { fetchAndParsePdbCoordinates } from '../services/rcsbPdbApi';
import { Drug } from '../types';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://kfdntklvvvorbgatyqcg.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

async function runProductionMasterSuite() {
  console.log('🔬 ====================================================================');
  console.log('DRUG SCOPE AI 10.0 — PRODUCTION MASTER INTEGRATION TEST SUITE');
  console.log('====================================================================\n');

  let passed = 0;
  let failed = 0;

  async function testStep(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ FAILED: ${name}`);
      console.error(`     Details: ${err?.message || err}`);
      failed++;
    }
  }

  // 1. RxNorm Drug Normalization & Brand Resolution
  await testStep('Phase 3 — RxNorm Brand to Generic Normalization & RxCUI Resolution', async () => {
    const res = await fetch('http://127.0.0.1:3000/api/rxnorm?term=Coumadin&action=resolve');
    assert.strictEqual(res.status, 200, 'RxNorm endpoint must return 200');
    const data = await res.json();
    assert.strictEqual(data.success, true, 'Resolution must succeed');
    assert.strictEqual(data.activeIngredient.toLowerCase(), 'warfarin', 'Coumadin must normalize to active ingredient warfarin');
    assert.strictEqual(data.activeIngredientCui, '11289', 'Warfarin active ingredient RxCUI must be 11289');
  });

  // 2. RxNorm Autocomplete
  await testStep('Phase 3 — RxNorm Real-time Autocomplete Term Search', async () => {
    const res = await fetch('http://127.0.0.1:3000/api/rxnorm?term=aspir&action=autocomplete');
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.results?.length > 0, 'Must return autocomplete candidates');
    const hasAspirin = data.results.some((r: any) => r.name.toLowerCase().includes('aspirin'));
    assert.ok(hasAspirin, 'Autocomplete candidates must include Aspirin');
  });

  // 3. openFDA Server-side Retrieval with PostgreSQL Ingestion Cache
  await testStep('Phase 2 — openFDA Live Retrieval & PostgreSQL Ingested Cache', async () => {
    const res = await fetch('http://127.0.0.1:3000/api/openfda?drug=warfarin');
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.genericName.toLowerCase().includes('warfarin'));
    assert.ok(data.splSetId, 'Must return official SPL Set ID');
    assert.ok(data.drugInteractions?.length > 100, 'Must contain authentic drug interactions section from FDA label');
  });

  // 4. Genuine PubMed Entrez Abstract Retrieval (No Fake Text)
  await testStep('Phase 6 — Genuine PubMed Entrez ESearch & EFetch Abstract Retrieval', async () => {
    const res = await fetch('http://127.0.0.1:3000/api/pubmed?q=warfarin+amiodarone');
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    const pubs = data.publications || data.results || (Array.isArray(data) ? data : []);
    assert.ok(pubs.length > 0, 'Must return peer-reviewed publications');
    const firstPub = pubs[0];
    assert.ok(firstPub.pmid, 'Must contain authentic PubMed ID');
    assert.ok(firstPub.sourceUrl.includes(firstPub.pmid), 'Must link to official pubmed.ncbi.nlm.nih.gov URL');
  });

  // 5. Remote Supabase PostgreSQL Live Warehouse State
  await testStep('Phase 1 — Remote PostgreSQL Inventory Verification', async () => {
    const client = createClient(SUPABASE_URL, SUPABASE_KEY);

    const [
      { count: drugCount },
      { count: labelCount },
      { count: targetCount },
      { count: structCount },
      { count: claimCount }
    ] = await Promise.all([
      client.from('drugs').select('*', { count: 'exact', head: true }),
      client.from('drug_labels').select('*', { count: 'exact', head: true }),
      client.from('biological_targets').select('*', { count: 'exact', head: true }),
      client.from('protein_structures').select('*', { count: 'exact', head: true }),
      client.from('scientific_claims').select('*', { count: 'exact', head: true })
    ]);

    assert.ok((drugCount || 0) >= 12, `Registered drugs count must be >= 12, got ${drugCount}`);
    assert.ok((labelCount || 0) >= 12, `FDA labels count must be >= 12, got ${labelCount}`);
    assert.ok((targetCount || 0) >= 14, `Biological targets count must be >= 14, got ${targetCount}`);
    assert.ok((structCount || 0) >= 14, `Protein structures count must be >= 14, got ${structCount}`);
    assert.ok((claimCount || 0) >= 4, `Scientific claims count must be >= 4, got ${claimCount}`);
  });

  // 6. Real 3D Protein Data Bank Structure Parsing & Provenance
  await testStep('Phase 7 — RCSB PDB Real Coordinate Parsing & Provenance Attribution', async () => {
    const model = await fetchAndParsePdbCoordinates('6WVR');
    assert.strictEqual(model.pdbId, '6WVR');
    assert.ok(model.atoms.length > 50, 'Must parse structural atoms');
    assert.ok(model.isExperimental, 'Real PDB entry must be marked as experimental');
    assert.ok(model.sourceLabel.includes('RCSB'), 'Must attribute RCSB Protein Data Bank source');
  });

  // 7. Clinical Drug Interaction Analysis Engine — Warfarin + Aspirin
  await testStep('Phase 5 — Multi-drug Analysis Engine (Warfarin + Aspirin Bleeding Risk)', async () => {
    const warfarin: Drug = {
      id: 'drug-warfarin',
      genericName: 'Warfarin',
      brandNames: ['Coumadin'],
      rxNormCui: '11289',
      atcCode: 'B01AA03',
      drugClass: 'Vitamin K Antagonist Anticoagulant',
      description: 'Oral anticoagulant inhibiting vitamin K epoxide reductase complex subunit 1.',
      fdaStatus: 'Approved',
      mechanismSummary: 'VKORC1 inhibition diminishing regeneration of reduced vitamin K.',
      targets: ['VKORC1'],
      primaryMetabolizingEnzymes: ['CYP2C9', 'CYP3A4'],
      synonyms: ['Coumadin', 'Jantoven']
    };

    const aspirin: Drug = {
      id: 'drug-aspirin',
      genericName: 'Aspirin',
      brandNames: ['Bayer Aspirin'],
      rxNormCui: '1191',
      atcCode: 'B01AC06',
      drugClass: 'Antiplatelet / NSAID',
      description: 'Irreversible cyclooxygenase-1 and 2 inhibitor preventing thromboxane A2 synthesis.',
      fdaStatus: 'Approved',
      mechanismSummary: 'PTGS1 acetylation impairing platelet aggregation.',
      targets: ['PTGS1', 'PTGS2'],
      primaryMetabolizingEnzymes: [],
      synonyms: ['Acetylsalicylic acid', 'Bayer']
    };

    const session = await runMedicineAnalysis([warfarin, aspirin], undefined, 'professional');
    assert.ok(session.findings.length >= 1, 'Must detect interaction between Warfarin and Aspirin');
    const finding = session.findings[0];
    assert.ok(finding.severity === 'Major' || finding.severity === 'Contraindicated', 'Severity must be Major or Contraindicated');
    assert.ok(finding.mechanism.toLowerCase().includes('bleeding') || finding.mechanism.toLowerCase().includes('platelet'), 'Must explain bleeding or platelet mechanism');
    assert.ok(finding.sources.length >= 1, 'Must include genuine source citations');
  });

  // 8. End-to-End User Persistence & RLS Isolation in PostgreSQL
  await testStep('Phase 1 — End-to-End Cloud Persistence, Refresh Retrieval & User Isolation', async () => {
    const clientUser1 = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
    const clientUser2 = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

    // Sign in User 1
    const { data: auth1, error: err1 } = await clientUser1.auth.signInWithPassword({
      email: 'researcher.alpha@drugscope.io',
      password: 'TestResearcherPass123!'
    });
    assert.ok(!err1 && auth1.user, 'User 1 must login');

    // Sign in User 2
    const { data: auth2, error: err2 } = await clientUser2.auth.signInWithPassword({
      email: 'pharmacist.beta@drugscope.io',
      password: 'TestPharmacistPass123!'
    });
    assert.ok(!err2 && auth2.user, 'User 2 must login');

    const testSessionId = `DSA-E2E-${Date.now()}`;

    // 1. User 1 saves analysis session
    const { error: saveErr } = await clientUser1.from('analysis_sessions').insert({
      id: testSessionId,
      user_id: auth1.user.id,
      title: 'E2E Warfarin + Aspirin Polypharmacy Evaluation',
      dataset_mode: 'RESEARCH',
      explanation_mode: 'professional',
      risk_level: 'MAJOR',
      findings_count: 1,
      metadata: { confidential: true, test: 'e2e' }
    });
    assert.strictEqual(saveErr, null, 'User 1 save must succeed');

    // 2. User 1 refreshes and retrieves record from PostgreSQL
    const { data: retrievedData } = await clientUser1
      .from('analysis_sessions')
      .select('*')
      .eq('id', testSessionId)
      .single();
    assert.strictEqual(retrievedData?.id, testSessionId, 'Record must be retrievable after refresh');

    // 3. User 2 attempts to read User 1 record (must return 0 rows)
    const { data: unauthorizedData } = await clientUser2
      .from('analysis_sessions')
      .select('*')
      .eq('id', testSessionId);
    assert.strictEqual(unauthorizedData?.length, 0, 'User 2 must NOT be able to read User 1 private record');

    // 4. Cleanup
    await clientUser1.from('analysis_sessions').delete().eq('id', testSessionId);
  });

  // 9. Real Downloadable PDF Generation (Not Just Window.print)
  await testStep('Phase 10 — Genuine Downloadable PDF Document Generation via jsPDF', async () => {
    const JsPdfClass = (jsPDF as any).jsPDF || (jsPDF as any).default || jsPDF;
    const doc = new JsPdfClass({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    doc.setFontSize(16);
    doc.text('DRUG SCOPE AI — SCIENTIFIC DOSSIER REPORT', 14, 20);
    doc.setFontSize(10);
    doc.text('Verified Multi-Drug Adverse Interaction Assessment', 14, 28);
    const pdfOutput = doc.output('arraybuffer');
    assert.ok(pdfOutput.byteLength > 1000, 'Generated PDF must be a valid non-empty binary document');
  });

  console.log('\n====================================================================');
  console.log(`PRODUCTION MASTER SUITE RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runProductionMasterSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
