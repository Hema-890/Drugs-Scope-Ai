import { createClient } from '@supabase/supabase-js';
import { AnalysisSession, UserProfile, Drug, BiologicalTarget } from '../types';

const env: Record<string, string | undefined> =
  typeof import.meta !== 'undefined' && (import.meta as any).env
    ? (import.meta as any).env
    : typeof process !== 'undefined' && process.env
    ? process.env
    : {};

const supabaseUrl = env.VITE_SUPABASE_URL || 'https://kfdntklvvvorbgatyqcg.supabase.co';
const supabasePublishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export const isSupabaseConfigured =
  Boolean(supabaseUrl && !supabaseUrl.includes('mock-')) &&
  Boolean(supabasePublishableKey && !supabasePublishableKey.includes('demo') && supabasePublishableKey.length > 10);

export const supabase = createClient(supabaseUrl, supabasePublishableKey || 'sb_publishable_anon_placeholder', {
  auth: {
    persistSession: typeof window !== 'undefined',
    autoRefreshToken: typeof window !== 'undefined',
    detectSessionInUrl: typeof window !== 'undefined'
  }
});

const LOCAL_STORAGE_SESSIONS_KEY = 'drug_scope_analysis_sessions';

// =========================================================================
// 1. ANALYSIS SESSIONS PERSISTENCE
// =========================================================================

/**
 * Persists an analysis session directly to remote Supabase PostgreSQL.
 * NEVER falsely reports cloud success if the database write did not succeed.
 */
export async function persistAnalysisSession(session: AnalysisSession): Promise<{
  success: boolean;
  persistedTo: 'Supabase PostgreSQL Database' | 'Local Offline Cache Only';
  sessionId: string;
  error?: string;
}> {
  // Always maintain an offline copy in browser cache for local recovery
  try {
    if (typeof localStorage !== 'undefined') {
      const existingRaw = localStorage.getItem(LOCAL_STORAGE_SESSIONS_KEY);
      const existing: AnalysisSession[] = existingRaw ? JSON.parse(existingRaw) : [];
      const filtered = existing.filter((s) => s.id !== session.id);
      filtered.unshift(session);
      localStorage.setItem(LOCAL_STORAGE_SESSIONS_KEY, JSON.stringify(filtered.slice(0, 30)));
    }
  } catch (e) {
    // Local storage warning
  }

  if (!isSupabaseConfigured) {
    return {
      success: false,
      persistedTo: 'Local Offline Cache Only',
      sessionId: session.id,
      error: 'Supabase credentials are not configured in environment.'
    };
  }

  try {
    const { data: authData } = await supabase.auth.getUser();
    const currentUserId = authData?.user?.id || null;

    const riskLevel =
      session.summary?.contraindicatedCount > 0
        ? 'CRITICAL'
        : session.summary?.majorCount > 0
        ? 'MAJOR'
        : 'MODERATE';

    const payload = {
      id: session.id,
      user_id: currentUserId,
      title: session.title,
      dataset_mode: session.datasetMode,
      explanation_mode: session.explanationMode,
      risk_level: riskLevel,
      findings_count: session.findings?.length || 0,
      metadata: session,
      updated_at: new Date().toISOString()
    };

    // Authenticated users can upsert (insert or update their own records)
    // Guest users insert-only to prevent unauthorized overwrite of records
    const { error } = currentUserId
      ? await supabase.from('analysis_sessions').upsert(payload, { onConflict: 'id' })
      : await supabase.from('analysis_sessions').insert(payload);

    if (error) {
      console.error('Remote PostgreSQL write failure:', error.message);
      return {
        success: false,
        persistedTo: 'Local Offline Cache Only',
        sessionId: session.id,
        error: error.message
      };
    }

    return {
      success: true,
      persistedTo: 'Supabase PostgreSQL Database',
      sessionId: session.id
    };
  } catch (err: any) {
    console.error('Supabase network error during save:', err?.message);
    return {
      success: false,
      persistedTo: 'Local Offline Cache Only',
      sessionId: session.id,
      error: err?.message || 'Network exception while connecting to Supabase'
    };
  }
}

/**
 * Loads recent analyses from Supabase database with offline fallback
 */
export async function getRecentAnalysisSessions(): Promise<AnalysisSession[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('analysis_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(15);

      if (!error && data && data.length > 0) {
        return data.map((row: any) => row.metadata as AnalysisSession);
      }
    } catch (e) {
      // Fall through to offline cache
    }
  }

  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(LOCAL_STORAGE_SESSIONS_KEY);
      return raw ? JSON.parse(raw) : [];
    }
    return [];
  } catch (e) {
    return [];
  }
}

/**
 * Delete an analysis session from PostgreSQL
 */
export async function deleteAnalysisSession(sessionId: string): Promise<boolean> {
  try {
    if (typeof localStorage !== 'undefined') {
      const existingRaw = localStorage.getItem(LOCAL_STORAGE_SESSIONS_KEY);
      if (existingRaw) {
        const existing: AnalysisSession[] = JSON.parse(existingRaw);
        const filtered = existing.filter((s) => s.id !== sessionId);
        localStorage.setItem(LOCAL_STORAGE_SESSIONS_KEY, JSON.stringify(filtered));
      }
    }
  } catch (e) {}

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('analysis_sessions').delete().eq('id', sessionId);
      if (error) throw error;
    } catch (e) {
      console.warn('Could not delete from remote database:', e);
    }
  }

  return true;
}

// =========================================================================
// 2. USER PROFILE & AUTHENTICATION
// =========================================================================

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.full_name || 'Researcher',
    role: data.role || 'researcher',
    organization: data.organization || 'Clinical Pharmacology Lab',
    verified: Boolean(data.verified)
  };
}

export async function upsertUserProfile(profile: Partial<UserProfile> & { id: string }): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const { error } = await supabase.from('profiles').upsert({
    id: profile.id,
    full_name: profile.name,
    organization: profile.organization,
    role: profile.role || 'researcher',
    updated_at: new Date().toISOString()
  });
  return !error;
}

export async function signUpUser(email: string, password: string, fullName: string, role = 'researcher') {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase client is not configured with project credentials.');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role
      }
    }
  });

  if (error) throw error;

  // Attempt creating profile in PostgreSQL if user was created
  if (data.user) {
    try {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        organization: 'Clinical Pharmacology Lab',
        role: role
      });
    } catch {
      // Profile trigger or policy will handle if restricted
    }
  }

  return data;
}

export async function signInUser(email: string, password: string) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase client is not configured with project credentials.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
}

export async function signOutUser() {
  if (isSupabaseConfigured) {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
  return true;
}

export async function getCurrentUser() {
  if (isSupabaseConfigured) {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }
  return null;
}

// =========================================================================
// 3. RESEARCH PROJECTS & AUDIT OPERATIONS
// =========================================================================

export async function fetchRemoteResearchProjects(): Promise<any[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from('research_projects')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

export async function createRemoteResearchProject(title: string, description: string): Promise<any> {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) throw new Error('Authentication required to create a research project.');

  const { data, error } = await supabase.from('research_projects').insert({
    user_id: userId,
    title,
    description,
    status: 'Active'
  }).select().single();

  if (error) throw error;
  return data;
}

export async function logRemoteAuditEvent(eventType: string, targetType: string, description: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    const { data: userData } = await supabase.auth.getUser();
    await supabase.from('audit_events').insert({
      user_id: userData?.user?.id || null,
      event_type: eventType,
      target_type: targetType,
      description
    });
  } catch {
    // Non-blocking telemetry
  }
}

export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  mode: 'Live Supabase Cloud' | 'Local Client Storage';
  latencyMs: number;
}> {
  const start = performance.now();
  if (!isSupabaseConfigured) {
    return {
      connected: false,
      mode: 'Local Client Storage',
      latencyMs: 1
    };
  }

  try {
    const { data, error } = await supabase.auth.getSession();
    const latency = Math.round(performance.now() - start);
    return {
      connected: !error,
      mode: !error ? 'Live Supabase Cloud' : 'Local Client Storage',
      latencyMs: latency
    };
  } catch {
    return {
      connected: false,
      mode: 'Local Client Storage',
      latencyMs: Math.round(performance.now() - start)
    };
  }
}
