import assert from 'node:assert';
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || 'https://kfdntklvvvorbgatyqcg.supabase.co';
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

async function runMultiUserSecurityAudit() {
  console.log('🛡️ Drug Scope AI — Multi-User RLS & Access Security Audit\n');

  // Client 1: User 1 (Researcher)
  const client1 = createClient(url, key, { auth: { persistSession: false } });
  const login1 = await client1.auth.signInWithPassword({
    email: 'researcher.alpha@drugscope.io',
    password: 'TestResearcherPass123!'
  });
  assert.ok(!login1.error && login1.data.user, 'User 1 must login successfully');
  const user1 = login1.data.user;
  console.log('  ✅ 1. Authenticated User 1 logged in:', user1.email, `(${user1.id})`);

  // Client 2: User 2 (Pharmacist)
  const client2 = createClient(url, key, { auth: { persistSession: false } });
  const login2 = await client2.auth.signInWithPassword({
    email: 'pharmacist.beta@drugscope.io',
    password: 'TestPharmacistPass123!'
  });
  assert.ok(!login2.error && login2.data.user, 'User 2 must login successfully');
  const user2 = login2.data.user;
  console.log('  ✅ 2. Authenticated User 2 logged in:', user2.email, `(${user2.id})`);

  // Client 3: Unauthenticated Public Client (Anon)
  const clientAnon = createClient(url, key, { auth: { persistSession: false } });
  console.log('  ✅ 3. Unauthenticated client initialized');

  const privateSessionId = `DSA-PRIV-${Date.now()}`;

  // STEP 1: User 1 creates private session
  const { error: insertErr } = await client1.from('analysis_sessions').insert({
    id: privateSessionId,
    user_id: user1.id,
    title: 'Dr. Alpha Confidential Cancer Regimen Analysis',
    dataset_mode: 'RESEARCH',
    explanation_mode: 'research',
    risk_level: 'CRITICAL',
    findings_count: 3,
    metadata: { confidential: true, doctor: user1.email }
  });
  assert.strictEqual(insertErr, null, 'User 1 insert must succeed');
  console.log('  ✅ 4. User 1 successfully created private analysis session');

  // STEP 2: User 1 reads own session
  const { data: user1Read } = await client1
    .from('analysis_sessions')
    .select('id, title')
    .eq('id', privateSessionId)
    .single();
  assert.strictEqual(user1Read?.id, privateSessionId, 'User 1 can read own private session');
  console.log('  ✅ 5. User 1 verified read access to own session');

  // STEP 3: User 1 updates own session
  const { error: user1UpdateErr } = await client1
    .from('analysis_sessions')
    .update({ title: 'Dr. Alpha Confidential Cancer Regimen Analysis (Reviewed)' })
    .eq('id', privateSessionId);
  assert.strictEqual(user1UpdateErr, null, 'User 1 update must succeed');
  console.log('  ✅ 6. User 1 verified update access to own session');

  // STEP 4: User 2 attempts to READ User 1's private session
  const { data: user2Read } = await client2
    .from('analysis_sessions')
    .select('id, title')
    .eq('id', privateSessionId);
  assert.strictEqual(user2Read?.length, 0, 'User 2 MUST NOT be able to read User 1 private session');
  console.log('  ✅ 7. User 2 read isolation confirmed (returned 0 rows)');

  // STEP 5: User 2 attempts to UPDATE User 1's private session
  const { data: user2UpdateData } = await client2
    .from('analysis_sessions')
    .update({ title: 'TAMPERED BY USER 2' })
    .eq('id', privateSessionId)
    .select();
  assert.strictEqual(user2UpdateData?.length || 0, 0, 'User 2 MUST NOT be able to update User 1 private session');
  console.log('  ✅ 8. User 2 update protection confirmed (0 rows modified)');

  // STEP 6: User 2 attempts to DELETE User 1's private session
  const { data: user2DeleteData } = await client2
    .from('analysis_sessions')
    .delete()
    .eq('id', privateSessionId)
    .select();
  assert.strictEqual(user2DeleteData?.length || 0, 0, 'User 2 MUST NOT be able to delete User 1 private session');
  console.log('  ✅ 9. User 2 delete protection confirmed (0 rows deleted)');

  // STEP 7: Anon client attempts to READ User 1's private session
  const { data: anonRead } = await clientAnon
    .from('analysis_sessions')
    .select('id, title')
    .eq('id', privateSessionId);
  assert.strictEqual(anonRead?.length, 0, 'Anon client MUST NOT be able to read User 1 private session');
  console.log('  ✅ 10. Anon read isolation confirmed (returned 0 rows)');

  // STEP 8: Anon client attempts to UPDATE User 1's private session
  const { data: anonUpdateData } = await clientAnon
    .from('analysis_sessions')
    .update({ title: 'TAMPERED BY ANON' })
    .eq('id', privateSessionId)
    .select();
  assert.strictEqual(anonUpdateData?.length || 0, 0, 'Anon client MUST NOT be able to update User 1 private session');
  console.log('  ✅ 11. Anon update protection confirmed (0 rows modified)');

  // STEP 9: Anon client attempts to DELETE User 1's private session
  const { data: anonDeleteData } = await clientAnon
    .from('analysis_sessions')
    .delete()
    .eq('id', privateSessionId)
    .select();
  assert.strictEqual(anonDeleteData?.length || 0, 0, 'Anon client MUST NOT be able to delete User 1 private session');
  console.log('  ✅ 12. Anon delete protection confirmed (0 rows deleted)');

  // STEP 10: User 1 cleans up own record
  const { error: user1DeleteErr } = await client1
    .from('analysis_sessions')
    .delete()
    .eq('id', privateSessionId);
  assert.strictEqual(user1DeleteErr, null, 'User 1 cleanup must succeed');
  console.log('  ✅ 13. User 1 successfully deleted own session');

  console.log('\n🎉 ALL 13 MULTI-USER RLS & ISOLATION CHECKS PASSED PERFECTLY!\n');
}

runMultiUserSecurityAudit().catch(err => {
  console.error('Security Audit Failure:', err);
  process.exit(1);
});
