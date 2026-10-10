-- ==============================================================================
-- DRUG SCOPE AI 4.0 - HARDENED POSTGRESQL / SUPABASE CORE SCHEMA
-- Autonomous Drug-Drug Adverse Interaction & Receptor Conflict Discovery Engine
-- Validated against Supabase Postgres Best Practices & Security Guidelines
-- ==============================================================================

-- Enable UUID extension


-- ------------------------------------------------------------------------------
-- 1. PROFILES & ROLE-BASED ACCESS CONTROL
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL DEFAULT '',
    organization TEXT,
    role TEXT NOT NULL DEFAULT 'public' CHECK (role IN ('public', 'student', 'researcher', 'pharmacist', 'doctor', 'administrator')),
    license_number TEXT,
    verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to automatically create profile on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, verified)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        'public', -- New users always default to public, never self-assigned privileged roles
        false
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 2. EVIDENCE SOURCES & INTEGRATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.evidence_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_code TEXT UNIQUE NOT NULL, -- openfda_label, rxnorm, pubmed, rcsb_pdb, chembl, faers
    source_name TEXT NOT NULL,
    provider_organization TEXT NOT NULL,
    base_url TEXT NOT NULL,
    license_type TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_sync_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'healthy' CHECK (status IN ('healthy', 'degraded', 'offline', 'rate_limited')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.source_sync_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES public.evidence_sources(id) ON DELETE CASCADE,
    job_type TEXT NOT NULL,
    records_processed INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    error_message TEXT,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. DRUGS, IDENTIFIERS & REGULATORY LABELS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.drugs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    generic_name TEXT NOT NULL,
    brand_names TEXT[] DEFAULT '{}',
    rxnorm_cui TEXT UNIQUE,
    atc_code TEXT,
    drug_class TEXT,
    description TEXT,
    fda_approval_status TEXT DEFAULT 'Approved',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.drug_identifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drug_id UUID NOT NULL REFERENCES public.drugs(id) ON DELETE CASCADE,
    id_type TEXT NOT NULL, -- 'UNII', 'CAS', 'PUBCHEM_CID', 'CHEMBL_ID'
    id_value TEXT NOT NULL,
    source_id UUID REFERENCES public.evidence_sources(id) ON DELETE SET NULL,
    UNIQUE(drug_id, id_type, id_value)
);

CREATE TABLE IF NOT EXISTS public.drug_labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drug_id UUID NOT NULL REFERENCES public.drugs(id) ON DELETE CASCADE,
    set_id TEXT,
    version_id TEXT,
    boxed_warnings TEXT,
    contraindications TEXT,
    warnings_and_precautions TEXT,
    drug_interactions TEXT,
    mechanism_of_action TEXT,
    pharmacokinetics TEXT,
    effective_date DATE,
    source_id UUID REFERENCES public.evidence_sources(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. BIOLOGICAL TARGETS, RECEPTORS & BIOASSAYS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.biological_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uniprot_id TEXT UNIQUE,
    gene_symbol TEXT NOT NULL,
    target_name TEXT NOT NULL,
    target_type TEXT NOT NULL, -- Receptor, Enzyme, Ion Channel, Transporter, Nuclear Receptor
    cellular_location TEXT,
    pathway_name TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.compounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drug_id UUID REFERENCES public.drugs(id) ON DELETE SET NULL,
    chembl_id TEXT UNIQUE,
    smiles TEXT,
    inchi_key TEXT,
    molecular_weight NUMERIC,
    formula TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.compound_target_assays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    compound_id UUID NOT NULL REFERENCES public.compounds(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES public.biological_targets(id) ON DELETE CASCADE,
    assay_type TEXT NOT NULL, -- IC50, Ki, Kd, EC50
    affinity_value NUMERIC NOT NULL,
    affinity_unit TEXT NOT NULL DEFAULT 'nM',
    action_type TEXT NOT NULL, -- Agonist, Antagonist, Inhibitor, Modulator
    provenance_source TEXT NOT NULL,
    publication_ref TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. 3D MACROMOLECULAR STRUCTURES (RCSB PDB)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.protein_structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pdb_id TEXT UNIQUE NOT NULL,
    target_id UUID REFERENCES public.biological_targets(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    method TEXT NOT NULL, -- X-RAY DIFFRACTION, CRYO-EM, NMR
    resolution NUMERIC, -- in Angstroms
    chains TEXT[] DEFAULT '{}',
    ligand_identifiers TEXT[] DEFAULT '{}',
    rcsb_url TEXT NOT NULL,
    experimental_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. SCIENTIFIC EVIDENCE, CLAIMS & DISCREPANCY CONFLICTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scientific_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drug_a_id UUID NOT NULL REFERENCES public.drugs(id) ON DELETE CASCADE,
    drug_b_id UUID REFERENCES public.drugs(id) ON DELETE CASCADE,
    target_id UUID REFERENCES public.biological_targets(id) ON DELETE SET NULL,
    claim_type TEXT NOT NULL,
    severity_level TEXT NOT NULL CHECK (severity_level IN ('Contraindicated', 'Major', 'Moderate', 'Minor', 'Theoretical')),
    evidence_status TEXT NOT NULL DEFAULT 'Documented' CHECK (evidence_status IN ('Documented', 'Predicted', 'Simulated', 'Uncertain', 'Evidence Gap')),
    mechanism_summary TEXT NOT NULL,
    clinical_consequence TEXT NOT NULL,
    management_guidance TEXT,
    source_citation TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.evidence_conflicts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_a_id UUID NOT NULL REFERENCES public.scientific_claims(id) ON DELETE CASCADE,
    claim_b_id UUID NOT NULL REFERENCES public.scientific_claims(id) ON DELETE CASCADE,
    discrepancy_type TEXT NOT NULL CHECK (discrepancy_type IN ('Severity Disagreement', 'Mechanism Discrepancy', 'In Vitro vs Clinical Conflict', 'Dose-Dependent Variation')),
    analysis_notes TEXT NOT NULL,
    resolution_status TEXT NOT NULL DEFAULT 'Potential Conflict' CHECK (resolution_status IN ('Potential Conflict', 'Requires Context', 'Reviewed', 'Resolved', 'Inconclusive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. ANALYSIS SESSIONS (PRIMARY APPLICATION PERSISTENCE)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.analysis_sessions (
    id TEXT PRIMARY KEY, -- supports client-side session ids and UUIDs
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    dataset_mode TEXT NOT NULL DEFAULT 'RESEARCH' CHECK (dataset_mode IN ('DEMO', 'RESEARCH', 'CLINICAL REVIEW')),
    explanation_mode TEXT NOT NULL DEFAULT 'professional' CHECK (explanation_mode IN ('simple', 'professional', 'research')),
    risk_level TEXT NOT NULL DEFAULT 'MODERATE',
    findings_count INTEGER NOT NULL DEFAULT 0,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. RESEARCH PROJECTS & HYPOTHESES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.research_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    dataset_mode TEXT NOT NULL DEFAULT 'RESEARCH' CHECK (dataset_mode IN ('DEMO', 'RESEARCH', 'CLINICAL REVIEW')),
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.research_hypotheses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.research_projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    hypothesis_text TEXT NOT NULL,
    compound_association TEXT,
    target_association TEXT,
    supporting_evidence TEXT,
    contradictory_evidence TEXT,
    uncertainty_score NUMERIC DEFAULT 0.5,
    proposed_validation TEXT,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Draft', 'Active', 'Validating', 'Supported', 'Refuted')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. MEDICATION REVIEWS & CLINICAL AUDITING
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.medication_review_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_synthetic_id TEXT NOT NULL,
    clinical_summary TEXT,
    review_status TEXT NOT NULL DEFAULT 'In Review' CHECK (review_status IN ('Pending', 'In Review', 'Signed-Off', 'Escalated')),
    signed_off_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.medication_review_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.medication_review_sessions(id) ON DELETE CASCADE,
    drug_id UUID NOT NULL REFERENCES public.drugs(id) ON DELETE CASCADE,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    route TEXT NOT NULL,
    start_date DATE,
    stop_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    ip_hash TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- Hardened per Supabase guidelines (cached (select auth.uid()), explicit TO, strict ownership)
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drug_identifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drug_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biological_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compound_target_assays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protein_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scientific_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_hypotheses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_review_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_review_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- Reference Catalogs: Read access for everyone (anon and authenticated), write restricted
CREATE POLICY "Public read access to evidence sources" ON public.evidence_sources FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read access to drugs" ON public.drugs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read access to drug identifiers" ON public.drug_identifiers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read access to drug labels" ON public.drug_labels FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read access to biological targets" ON public.biological_targets FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read access to compounds" ON public.compounds FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read access to compound target assays" ON public.compound_target_assays FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read access to protein structures" ON public.protein_structures FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read access to scientific claims" ON public.scientific_claims FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read access to evidence conflicts" ON public.evidence_conflicts FOR SELECT TO anon, authenticated USING (true);

-- Profiles: Public read, owner update without role escalation
CREATE POLICY "Profiles read access" ON public.profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users update own profile non-privileged fields" ON public.profiles
    FOR UPDATE TO authenticated
    USING ((select auth.uid()) = id)
    WITH CHECK (
        (select auth.uid()) = id
        AND role = (SELECT p.role FROM public.profiles p WHERE p.id = (select auth.uid()))
        AND verified = (SELECT p.verified FROM public.profiles p WHERE p.id = (select auth.uid()))
    );

-- Analysis Sessions: Strict Ownership
CREATE POLICY "Users read own analysis sessions" ON public.analysis_sessions
    FOR SELECT TO authenticated
    USING ((select auth.uid()) = user_id OR user_id IS NULL);

CREATE POLICY "Public read guest analysis sessions" ON public.analysis_sessions
    FOR SELECT TO anon
    USING (user_id IS NULL);

CREATE POLICY "Users insert own analysis sessions" ON public.analysis_sessions
    FOR INSERT TO authenticated
    WITH CHECK ((select auth.uid()) = user_id OR user_id IS NULL);

CREATE POLICY "Guest insert anonymous analysis sessions" ON public.analysis_sessions
    FOR INSERT TO anon
    WITH CHECK (user_id IS NULL);

CREATE POLICY "Users update own analysis sessions" ON public.analysis_sessions
    FOR UPDATE TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users delete own analysis sessions" ON public.analysis_sessions
    FOR DELETE TO authenticated
    USING ((select auth.uid()) = user_id);

-- Research Projects & Hypotheses
CREATE POLICY "Public projects read access" ON public.research_projects FOR SELECT TO anon, authenticated USING (is_public = true);
CREATE POLICY "Owner access to projects" ON public.research_projects FOR ALL TO authenticated
    USING ((select auth.uid()) = owner_id)
    WITH CHECK ((select auth.uid()) = owner_id);

CREATE POLICY "Owner access to hypotheses" ON public.research_hypotheses FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.owner_id = (select auth.uid())))
    WITH CHECK (EXISTS (SELECT 1 FROM public.research_projects p WHERE p.id = project_id AND p.owner_id = (select auth.uid())));

-- Clinical Reviews
CREATE POLICY "Reviewer access to clinical sessions" ON public.medication_review_sessions FOR ALL TO authenticated
    USING ((select auth.uid()) = reviewer_id)
    WITH CHECK ((select auth.uid()) = reviewer_id);

CREATE POLICY "Reviewer access to review items" ON public.medication_review_items FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.medication_review_sessions s WHERE s.id = session_id AND s.reviewer_id = (select auth.uid())))
    WITH CHECK (EXISTS (SELECT 1 FROM public.medication_review_sessions s WHERE s.id = session_id AND s.reviewer_id = (select auth.uid())));

-- Audit Events: Authenticated user write & read own logs
CREATE POLICY "Users view own audit events" ON public.audit_events FOR SELECT TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users insert audit events" ON public.audit_events FOR INSERT TO authenticated
    WITH CHECK ((select auth.uid()) = user_id OR user_id IS NULL);

CREATE POLICY "Anon insert audit events" ON public.audit_events FOR INSERT TO anon
    WITH CHECK (user_id IS NULL);

-- ------------------------------------------------------------------------------
-- 11. INDEXES FOR HIGH-THROUGHPUT PERFORMANCE
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_drugs_generic_name ON public.drugs(generic_name);
CREATE INDEX IF NOT EXISTS idx_drugs_rxcui ON public.drugs(rxnorm_cui);
CREATE INDEX IF NOT EXISTS idx_drug_identifiers_drug ON public.drug_identifiers(drug_id);
CREATE INDEX IF NOT EXISTS idx_drug_labels_drug ON public.drug_labels(drug_id);
CREATE INDEX IF NOT EXISTS idx_targets_uniprot ON public.biological_targets(uniprot_id);
CREATE INDEX IF NOT EXISTS idx_targets_symbol ON public.biological_targets(gene_symbol);
CREATE INDEX IF NOT EXISTS idx_assays_compound_target ON public.compound_target_assays(compound_id, target_id);
CREATE INDEX IF NOT EXISTS idx_structures_pdb ON public.protein_structures(pdb_id);
CREATE INDEX IF NOT EXISTS idx_structures_target ON public.protein_structures(target_id);
CREATE INDEX IF NOT EXISTS idx_claims_drugs ON public.scientific_claims(drug_a_id, drug_b_id);
CREATE INDEX IF NOT EXISTS idx_claims_severity ON public.scientific_claims(severity_level);
CREATE INDEX IF NOT EXISTS idx_analysis_sessions_user_created ON public.analysis_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_research_projects_owner ON public.research_projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_research_hypotheses_project ON public.research_hypotheses(project_id);
CREATE INDEX IF NOT EXISTS idx_medication_review_reviewer ON public.medication_review_sessions(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_medication_review_items_session ON public.medication_review_items(session_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_user ON public.audit_events(user_id, created_at DESC);

-- ------------------------------------------------------------------------------
-- 12. INITIAL SEED DATA FOR EVIDENCE SOURCES
-- ------------------------------------------------------------------------------
INSERT INTO public.evidence_sources (source_code, source_name, provider_organization, base_url, license_type, status)
VALUES
    ('openfda_label', 'openFDA Drug Product Labels', 'U.S. Food and Drug Administration', 'https://api.fda.gov/drug/label.json', 'Public Domain (Open Government)', 'healthy'),
    ('rxnorm', 'RxNorm Normalized Drug Names & CUIs', 'U.S. National Library of Medicine (NLM)', 'https://rxnav.nlm.nih.gov/REST', 'NLM Terms of Service', 'healthy'),
    ('pubmed', 'PubMed / MEDLINE Biomedical Citations', 'NCBI / National Library of Medicine', 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils', 'Public Domain', 'healthy'),
    ('rcsb_pdb', 'RCSB Protein Data Bank', 'Research Collaboratory for Structural Bioinformatics', 'https://data.rcsb.org/rest/v1', 'CC0 1.0 Universal', 'healthy'),
    ('chembl', 'ChEMBL Bioactive Molecules Database', 'EMBL-EBI', 'https://www.ebi.ac.uk/chembl/api/data', 'CC BY-SA 3.0', 'healthy'),
    ('openfda_faers', 'openFDA Adverse Event Reporting System', 'U.S. Food and Drug Administration', 'https://api.fda.gov/drug/event.json', 'Public Domain', 'healthy')
ON CONFLICT (source_code) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 13. LEAST-PRIVILEGE GRANTS
-- Explicit table-level grants per role (avoids broad GRANT ALL)
-- ------------------------------------------------------------------------------
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;

GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Read-only reference catalogs
GRANT SELECT ON public.drugs TO anon, authenticated;
GRANT SELECT ON public.drug_identifiers TO anon, authenticated;
GRANT SELECT ON public.drug_labels TO anon, authenticated;
GRANT SELECT ON public.biological_targets TO anon, authenticated;
GRANT SELECT ON public.compounds TO anon, authenticated;
GRANT SELECT ON public.compound_target_assays TO anon, authenticated;
GRANT SELECT ON public.protein_structures TO anon, authenticated;
GRANT SELECT ON public.scientific_claims TO anon, authenticated;
GRANT SELECT ON public.evidence_conflicts TO anon, authenticated;
GRANT SELECT ON public.evidence_sources TO anon, authenticated;
GRANT SELECT ON public.source_sync_jobs TO anon, authenticated;

-- Profiles
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- Analysis Sessions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.analysis_sessions TO authenticated;
GRANT SELECT, INSERT ON public.analysis_sessions TO anon;

-- Research Projects & Hypotheses
GRANT SELECT, INSERT, UPDATE, DELETE ON public.research_projects TO authenticated;
GRANT SELECT ON public.research_projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.research_hypotheses TO authenticated;

-- Clinical Reviews
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medication_review_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medication_review_items TO authenticated;

-- Audit Events
GRANT INSERT ON public.audit_events TO anon, authenticated;
GRANT SELECT ON public.audit_events TO authenticated;

-- Sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

