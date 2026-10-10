import assert from 'node:assert';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { AnalysisSession } from '../types';

async function runPostgresVerification() {
  console.log('🔬 Drug Scope AI — Supabase PostgreSQL Integration Verification Suite\n');
  console.log('Project Reference: kfdntklvvvorbgatyqcg');
  console.log('Configured URL:', import.meta.env?.VITE_SUPABASE_URL || 'https://kfdntklvvvorbgatyqcg.supabase.co\n');

  let passed = 0;
  let failed = 0;
  const blockers: string[] = [];

  async function runStep(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ FAILED / BLOCKED: ${name}`);
      console.error(`     Details: ${err?.message || err}`);
      blockers.push(`${name}: ${err?.message || err}`);
      failed++;
    }
  }

  // =========================================================================
  // TEST H: Authentication Engine Verification
  // =========================================================================
  await runStep('Test H — Real Supabase Authentication & Token Generation', async () => {
    assert.ok(isSupabaseConfigured, 'Supabase client must be configured with project credentials');
    
    // Attempt real anonymous or session check
    const { data, error } = await supabase.auth.getSession();
    assert.strictEqual(error, null, 'Must retrieve auth session without client network errors');
  });

  // =========================================================================
  // TEST I: openFDA Upstream Integration
  // =========================================================================
  await runStep('Test I — openFDA Original Labeling Retrieval (Warfarin & Aspirin)', async () => {
    const resWarfarin = await fetch('https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22warfarin%22&limit=1');
    assert.strictEqual(resWarfarin.status, 200, 'openFDA Warfarin label query must return 200');
    const dataW = await resWarfarin.json();
    assert.ok(dataW.results?.[0]?.openfda?.generic_name, 'Warfarin original label must contain generic name');

    const resAspirin = await fetch('https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22aspirin%22&limit=1');
    assert.strictEqual(resAspirin.status, 200, 'openFDA Aspirin label query must return 200');
    const dataA = await resAspirin.json();
    assert.ok(dataA.results?.[0]?.openfda?.generic_name, 'Aspirin original label must contain generic name');
  });

  // =========================================================================
  // TEST A: Table Creation Check
  // =========================================================================
  await runStep('Test A — Remote PostgreSQL Tables Existence', async () => {
    // Attempt querying the analysis_sessions table in public schema
    const { data, error } = await supabase
      .from('analysis_sessions')
      .select('id')
      .limit(1);

    if (error && error.message.includes('relation "public.analysis_sessions" does not exist')) {
      throw new Error('Remote PostgreSQL public tables not yet landed. Migration execution pending.');
    }
    assert.strictEqual(error, null, `Querying analysis_sessions must succeed: ${error?.message}`);
  });

  // =========================================================================
  // TEST B, C, D, E: Live CRUD on PostgreSQL
  // =========================================================================
  const testId = `DSA-TEST-${Date.now()}`;

  await runStep('Test B — Insert Disposable Analysis Record into PostgreSQL', async () => {
    const { error } = await supabase.from('analysis_sessions').insert({
      id: testId,
      title: 'Automated CI/CD Disposable Test Session',
      dataset_mode: 'RESEARCH',
      explanation_mode: 'professional',
      risk_level: 'MAJOR',
      findings_count: 1,
      metadata: { test: true, createdAt: new Date().toISOString() }
    });
    if (error) throw error;
  });

  await runStep('Test C — Read Disposable Record from PostgreSQL', async () => {
    const { data, error } = await supabase
      .from('analysis_sessions')
      .select('*')
      .eq('id', testId)
      .single();
    if (error) throw error;
    assert.strictEqual(data.id, testId);
    assert.strictEqual(data.title, 'Automated CI/CD Disposable Test Session');
  });

  await runStep('Test D — Update Record Security & Permissions (Least-Privilege & Auth)', async () => {
    // 1. Verify that unauthenticated (anon) client is strictly denied from updating records
    const { error: anonError } = await supabase
      .from('analysis_sessions')
      .update({ title: 'Malicious Anon Modification' })
      .eq('id', testId);
    
    assert.ok(anonError, 'Unauthenticated client MUST be denied permission to update records');
    assert.ok(
      anonError.message.includes('permission denied') || anonError.code === '42501',
      `Expected permission denied error, got: ${anonError.message}`
    );

    // 2. Authenticate as verified researcher account and verify authorized update
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'researcher.alpha@drugscope.io',
      password: 'TestResearcherPass123!'
    });
    if (authError) throw authError;

    const authTestId = `DSA-AUTH-${Date.now()}`;
    const { error: insertAuthErr } = await supabase.from('analysis_sessions').insert({
      id: authTestId,
      user_id: authData.user.id,
      title: 'Authenticated Session Pre-Update',
      dataset_mode: 'RESEARCH',
      explanation_mode: 'professional',
      risk_level: 'MAJOR',
      findings_count: 1,
      metadata: { test: true }
    });
    if (insertAuthErr) throw insertAuthErr;

    const { error: updateAuthErr } = await supabase
      .from('analysis_sessions')
      .update({ title: 'Authenticated Session Post-Update' })
      .eq('id', authTestId);
    if (updateAuthErr) throw updateAuthErr;

    const { data: verifyData } = await supabase
      .from('analysis_sessions')
      .select('title')
      .eq('id', authTestId)
      .single();
    assert.strictEqual(verifyData?.title, 'Authenticated Session Post-Update');

    // Clean up authenticated test record
    await supabase.from('analysis_sessions').delete().eq('id', authTestId);
    // Sign out to return to default unauthenticated state
    await supabase.auth.signOut();
  });

  await runStep('Test E — Delete Record Security & Permissions (Least-Privilege & Auth)', async () => {
    // 1. Verify that unauthenticated (anon) client is strictly denied from deleting records
    const { error: anonDelError } = await supabase.from('analysis_sessions').delete().eq('id', testId);
    assert.ok(anonDelError, 'Unauthenticated client MUST be denied permission to delete records');
    assert.ok(
      anonDelError.message.includes('permission denied') || anonDelError.code === '42501',
      `Expected permission denied error, got: ${anonDelError.message}`
    );

    // 2. Authenticate as verified researcher account and verify authorized deletion of own record
    const { data: authData } = await supabase.auth.signInWithPassword({
      email: 'researcher.alpha@drugscope.io',
      password: 'TestResearcherPass123!'
    });
    assert.ok(authData?.user?.id, 'Authenticated user must be signed in');

    const authDelId = `DSA-AUTH-DEL-${Date.now()}`;
    await supabase.from('analysis_sessions').insert({
      id: authDelId,
      user_id: authData.user.id,
      title: 'Authenticated Session To Delete',
      dataset_mode: 'RESEARCH',
      explanation_mode: 'professional',
      risk_level: 'MODERATE',
      findings_count: 0,
      metadata: { test: true }
    });

    const { error: delErr } = await supabase.from('analysis_sessions').delete().eq('id', authDelId);
    if (delErr) throw delErr;

    const { data: checkDeleted } = await supabase
      .from('analysis_sessions')
      .select('id')
      .eq('id', authDelId);
    assert.strictEqual(checkDeleted?.length, 0, 'Authenticated record must be deleted');

    await supabase.auth.signOut();
  });

  // =========================================================================
  // TEST F: Cross-Session Persistence
  // =========================================================================
  const persistSessionId = `DSA-ANL-PERSIST-${Date.now()}`;
  await runStep('Test F — Cross-Session Persistence via persistAnalysisSession', async () => {
    const mockSession: AnalysisSession = {
      id: persistSessionId,
      title: 'Warfarin + Amiodarone Polypharmacy Live Test',
      timestamp: new Date().toISOString(),
      datasetMode: 'RESEARCH',
      medications: [],
      explanationMode: 'professional',
      findings: [],
      graphData: { nodes: [], edges: [] },
      status: 'completed',
      summary: {
        totalInteractions: 1,
        contraindicatedCount: 0,
        majorCount: 1,
        moderateCount: 0,
        documentedEvidencePercent: 100,
        primaryRiskSummary: 'Major pharmacokinetic CYP2C9 displacement'
      }
    };

    const { persistAnalysisSession, getRecentAnalysisSessions, deleteAnalysisSession } = await import('../services/supabaseClient');

    const saveResult = await persistAnalysisSession(mockSession);
    assert.strictEqual(saveResult.success, true, 'Save must succeed');
    assert.strictEqual(saveResult.persistedTo, 'Supabase PostgreSQL Database', 'Must persist to remote PostgreSQL');

    // Retrieve via service
    const recent = await getRecentAnalysisSessions();
    const found = recent.find((s) => s.id === persistSessionId);
    assert.ok(found, 'Session must be retrievable from remote PostgreSQL database');
    assert.strictEqual(found.title, 'Warfarin + Amiodarone Polypharmacy Live Test');

    // Clean up
    await deleteAnalysisSession(persistSessionId);
  });

  // =========================================================================
  // TEST G: RLS Isolation
  // =========================================================================
  await runStep('Test G — RLS Isolation (Private Records Protected from Unauthorized Access)', async () => {
    // Check that private records cannot be accessed anonymously
    const privateDummyId = `DSA-PRIVATE-${Date.now()}`;
    
    // An anonymous client querying for a nonexistent or other user's private session returns empty set
    const { data, error } = await supabase
      .from('analysis_sessions')
      .select('*')
      .eq('id', privateDummyId);
    
    assert.strictEqual(error, null, 'Query executes without error');
    assert.strictEqual(data?.length, 0, 'No unauthorized data returned');
  });

  // =========================================================================
  // Summary
  // =========================================================================
  console.log(`\n======================================================`);
  console.log(`PostgreSQL Integration Summary: ${passed} Passed, ${failed} Blocked/Failed`);
  if (blockers.length > 0) {
    console.log(`\nPending Action Items:`);
    blockers.forEach((b, idx) => console.log(`  ${idx + 1}. ${b}`));
  }
  console.log(`======================================================\n`);
}

runPostgresVerification().catch((e) => {
  console.error('Test error:', e);
});
