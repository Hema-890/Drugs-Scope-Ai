import { AuditEvent, DatasetMode, ResearchHypothesis, UserProfile, UserRole } from '../types';
import { RESEARCH_HYPOTHESES } from '../data/mockConflicts';

const STORAGE_KEYS = {
  MODE: 'drug_scope_mode',
  USER: 'drug_scope_user',
  BOOKMARKS: 'drug_scope_bookmarks',
  HYPOTHESES: 'drug_scope_hypotheses',
  AUDIT_LOG: 'drug_scope_audit_log'
};

export const INITIAL_USER: UserProfile = {
  id: 'usr-lead-01',
  name: 'Dr. Evelyn Reed, PharmD, PhD',
  role: 'researcher',
  organization: 'Institute for Computational Pharmacology & Structural Biology',
  verified: true,
  licenseNumber: 'RPH-CA-892401'
};

export const INITIAL_AUDIT_LOG: AuditEvent[] = [
  {
    id: 'aud-001',
    timestamp: '2026-10-10T10:15:00Z',
    actor: 'Dr. Evelyn Reed',
    role: 'researcher',
    action: 'SESSION_INITIALIZED',
    resource: 'Drug Scope AI 4.0 Engine',
    datasetMode: 'RESEARCH',
    details: 'System loaded with 12 verified chemical monographs, 10 biological targets, and 8 3D macromolecular structures.'
  },
  {
    id: 'aud-002',
    timestamp: '2026-10-10T10:20:00Z',
    actor: 'Dr. Evelyn Reed',
    role: 'researcher',
    action: 'INTERACTION_QUERY',
    resource: 'Warfarin Sodium <-> Amiodarone',
    datasetMode: 'RESEARCH',
    details: 'Verified CYP2C9 competitive clearance inhibition and INR escalation risks.'
  }
];

export function getStoredMode(): DatasetMode {
  const mode = localStorage.getItem(STORAGE_KEYS.MODE);
  return (mode as DatasetMode) || 'RESEARCH';
}

export function setStoredMode(mode: DatasetMode): void {
  localStorage.setItem(STORAGE_KEYS.MODE, mode);
}

export function getStoredUser(): UserProfile {
  const user = localStorage.getItem(STORAGE_KEYS.USER);
  return user ? JSON.parse(user) : INITIAL_USER;
}

export function setStoredUser(user: UserProfile): void {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export function getStoredBookmarks(): string[] {
  const b = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
  return b ? JSON.parse(b) : ['drug-warfarin', 'drug-amiodarone', 'drug-clopidogrel'];
}

export function toggleStoredBookmark(drugId: string): string[] {
  const current = getStoredBookmarks();
  const exists = current.includes(drugId);
  const updated = exists ? current.filter((id) => id !== drugId) : [...current, drugId];
  localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updated));
  return updated;
}

export function getStoredHypotheses(): ResearchHypothesis[] {
  const h = localStorage.getItem(STORAGE_KEYS.HYPOTHESES);
  return h ? JSON.parse(h) : RESEARCH_HYPOTHESES;
}

export function saveStoredHypothesis(hypothesis: ResearchHypothesis): ResearchHypothesis[] {
  const current = getStoredHypotheses();
  const index = current.findIndex((item) => item.id === hypothesis.id);
  let updated: ResearchHypothesis[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = hypothesis;
  } else {
    updated = [hypothesis, ...current];
  }
  localStorage.setItem(STORAGE_KEYS.HYPOTHESES, JSON.stringify(updated));
  return updated;
}

export function getStoredAuditLog(): AuditEvent[] {
  const logs = localStorage.getItem(STORAGE_KEYS.AUDIT_LOG);
  return logs ? JSON.parse(logs) : INITIAL_AUDIT_LOG;
}

export function recordAuditEvent(action: string, resource: string, details: string): void {
  const current = getStoredAuditLog();
  const user = getStoredUser();
  const mode = getStoredMode();
  const newEvent: AuditEvent = {
    id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    actor: user.name,
    role: user.role,
    action,
    resource,
    datasetMode: mode,
    details
  };
  const updated = [newEvent, ...current].slice(0, 50);
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOG, JSON.stringify(updated));
}
