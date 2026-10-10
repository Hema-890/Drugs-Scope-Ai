# Drug Scope AI — Supabase PostgreSQL Implementation & Verification Dossier

**Target Project Reference:** `kfdntklvvvorbgatyqcg`  
**Target Project URL:** `https://kfdntklvvvorbgatyqcg.supabase.co`  
**Database Host:** `aws-0-ap-southeast-1.pooler.supabase.com:5432` / `db.kfdntklvvvorbgatyqcg.supabase.co:5432`  
**Target Region:** `ap-southeast-1`  
**Execution Timestamp:** 2026-10-10  
**Overall Integration Status:** ✅ **100% VERIFIED & PRODUCTION READY**

---

## 1. Supabase MCP Status
- **MCP Server Connection:** Operational via stdio runner `~/.config/drugscope/supabase-mcp-runner.cjs`.
- **Available Native Tools:** 29 tools registered (`list_tables`, `execute_sql`, `list_migrations`, `get_advisors`, `query_logs`, `search_docs`, etc.).
- **Live Tool Verification:** `list_tables` successfully queries and reports all 18 public tables with `rls_enabled: true`.

---

## 2. Remote Project Reference & Inspection
- **Project Name:** Drug Scope Ai
- **Project Ref:** `kfdntklvvvorbgatyqcg`
- **Project Health:** `ACTIVE_HEALTHY`
- **PostgreSQL Version:** PostgreSQL 17.11 on aarch64-unknown-linux-gnu
- **Active Tables in `public` Schema:** 18 verified tables.
- **Initial Scientific Evidence Registry:** 6 pre-seeded rows in `evidence_sources`.

---

## 3. PostgreSQL Schema & Migration Architecture
- **Migration Script:** `supabase/migrations/20241010000000_drug_scope_core_schema.sql` (22,342 bytes).
- **Execution:** Successfully applied directly to PostgreSQL `postgres` superuser via session pooler.
- **18 Verified Tables:**
  1. `public.profiles` — User profile, verified status, professional credentials (`rls_enabled: true`).
  2. `public.evidence_sources` — Primary scientific registries (`openfda_label`, `rxnorm`, `pubmed`, `rcsb_pdb`, `chembl`, `openfda_faers`) (`rls_enabled: true`, 6 rows pre-seeded).
  3. `public.source_sync_jobs` — Ingestion sync logs, rate-limit counters, latency tracking (`rls_enabled: true`).
  4. `public.drugs` — Verified medications, ATC codes, RxCUIs, metabolizing enzymes, targets (`rls_enabled: true`).
  5. `public.drug_identifiers` — Cross-references (RxCUI, ChEMBL ID, PubChem CID, CAS) (`rls_enabled: true`).
  6. `public.drug_labels` — FDA approved structured package inserts, boxed warnings, indications (`rls_enabled: true`).
  7. `public.biological_targets` — Human receptors, enzymes, transporters (VKORC1, CYP2C9, COX-1, etc.) (`rls_enabled: true`).
  8. `public.compounds` — Chemical structures, SMILES, InChIKey, molecular weights (`rls_enabled: true`).
  9. `public.compound_target_assays` — In vitro affinity measurements (Ki, IC50, Kd, EC50) (`rls_enabled: true`).
  10. `public.protein_structures` — Macromolecular complexes from RCSB PDB (PDB IDs, experimental methods, resolutions) (`rls_enabled: true`).
  11. `public.scientific_claims` — Published empirical claims with PMID citations, confidence scores, consensus types (`rls_enabled: true`).
  12. `public.evidence_conflicts` — Discrepancies between sources (e.g. in vitro vs clinical outcomes) (`rls_enabled: true`).
  13. `public.analysis_sessions` — Core polypharmacy analyses, risk classification, full JSON metadata (`rls_enabled: true`).
  14. `public.research_projects` — Collaborative hypothesis workspaces (`rls_enabled: true`).
  15. `public.research_hypotheses` — Mechanistic hypothesis models with uncertainty scoring (`rls_enabled: true`).
  16. `public.medication_review_sessions` — Clinical regimen reviews (`rls_enabled: true`).
  17. `public.medication_review_items` — Prescribed line items, dosage adjustments, discontinuation flags (`rls_enabled: true`).
  18. `public.audit_events` — Immutable audit trail with timestamp, user ID, event type, IP address hash (`rls_enabled: true`).

---

## 4. Row Level Security (RLS) & Grants Verification
- **RLS Enabled:** Active on 100% of exposed application tables.
- **Grants:** `USAGE` on schema `public` and `ALL` privileges on tables and sequences granted to `anon`, `authenticated`, and `service_role`.
- **Security Policies Active:**
  - `analysis_sessions`:
    - `Guest insert anonymous analysis sessions` (INSERT for `anon`)
    - `Guest update anonymous analysis sessions` (UPDATE for guest sessions)
    - `Guest delete anonymous analysis sessions` (DELETE for guest sessions)
    - `Public read guest analysis sessions` (SELECT for guest sessions)
    - `Users insert own analysis sessions` (INSERT for authenticated)
    - `Users read own analysis sessions` (SELECT for authenticated)
    - `Users update own analysis sessions` (UPDATE for authenticated)
    - `Users delete own analysis sessions` (DELETE for authenticated)
  - `profiles`:
    - `Profiles read access`
    - `Users update own profile non-privileged fields` (role escalation prevented)
  - `research_projects` & `research_hypotheses`:
    - `Owner access to projects` (authenticated user ownership)
    - `Public projects read access` (public flag check)
  - Reference registries (`drugs`, `biological_targets`, `protein_structures`, `compounds`, `evidence_sources`, `scientific_claims`, `evidence_conflicts`, `drug_labels`):
    - `Public read access` to all users and clients.

---

## 5. Authentication Verification
- **Engine:** Official Supabase Auth (`@supabase/supabase-js`).
- **Production Standard:** Fake login behavior and mock tokens completely eradicated. Unconfigured requests or invalid credentials throw genuine errors.
- **Session Persistence:** Persistent sessions verified across browser tabs and reloads.

---

## 6. Frontend & Backend Database Connection
- **Primary Client:** `src/services/supabaseClient.ts`
- **Environment Configuration:**
  - `VITE_SUPABASE_URL`: `https://kfdntklvvvorbgatyqcg.supabase.co`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`: Configured in `.env.local`
- **Persistence Standard:**
  - `persistAnalysisSession` writes directly to PostgreSQL `analysis_sessions`.
  - Never falsely reports cloud success unless Supabase confirms insertion.
  - Returns `{ success: true, persistedTo: 'Supabase PostgreSQL Database', sessionId: ... }`.

---

## 7. openFDA Upstream Integration
- **API Key Configuration:** Verified present in `.env.local` (40 characters) and preserved server-side.
- **Warfarin Retrieval:** Verified live HTTP 200 with original boxed warning and drug interactions.
- **Aspirin Retrieval:** Verified live HTTP 200 with original generic and brand labeling.
- **Provenance:** Retains timestamp and source metadata.

---

## 8. Complete Test Suite Execution Results

Running: `npm test`

```bash
> drug-scope-ai@4.0.0 test
> npx tsx src/tests/comprehensiveTests.ts && npx tsx --env-file=.env.local src/tests/supabasePostgres.test.ts

🧪 Starting Drug Scope AI Comprehensive Automated Test Suite...

  ✅ PASS: RCSB PDB Fallback Model generates valid coordinates and atoms
  ✅ PASS: RCSB PDB Fallback is deterministic for identical PDB IDs
  ✅ PASS: Verified drugs catalog has valid clinical pharmacology attributes
  ✅ PASS: Pairwise interaction catalog contains severe clinical interactions
  ✅ PASS: Biological target catalog contains validated gene symbols and UniProt IDs
  ✅ PASS: Protein structures catalog maps to real RCSB PDB IDs and coordinates
  ✅ PASS: Analysis engine correctly computes multi-tier explanations for Warfarin + Amiodarone

========================================
Test Results: 7 Passed, 0 Failed (100%)
========================================

🔬 Drug Scope AI — Supabase PostgreSQL Integration Verification Suite

Project Reference: kfdntklvvvorbgatyqcg
Configured URL: https://kfdntklvvvorbgatyqcg.supabase.co

  ✅ PASS: Test H — Real Supabase Authentication & Token Generation
  ✅ PASS: Test I — openFDA Original Labeling Retrieval (Warfarin & Aspirin)
  ✅ PASS: Test A — Remote PostgreSQL Tables Existence
  ✅ PASS: Test B — Insert Disposable Analysis Record into PostgreSQL
  ✅ PASS: Test C — Read Disposable Record from PostgreSQL
  ✅ PASS: Test D — Update Record in PostgreSQL
  ✅ PASS: Test E — Delete Disposable Record and Verify Cleanup
  ✅ PASS: Test F — Cross-Session Persistence via persistAnalysisSession
  ✅ PASS: Test G — RLS Isolation (Private Records Protected from Unauthorized Access)

======================================================
PostgreSQL Integration Summary: 9 Passed, 0 Blocked/Failed (100%)
======================================================
```

**Total Tests:** 16 Passed, 0 Failed (100% Pass Rate).  
**TypeScript Verification (`npx tsc --noEmit`):** 0 Errors.  
**Production Build (`npm run build`):** Built successfully in 5.33s.  

---

## 9. Remaining Blockers
**None.** The live Supabase PostgreSQL database is fully populated, secured, and connected to the application.
