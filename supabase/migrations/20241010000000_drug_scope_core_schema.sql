-- ==============================================================================
-- DRUG SCOPE AI 4.0 - POSTGRESQL / SUPABASE CORE SCHEMA MIGRATION
-- PS-12: Autonomous Drug-Drug Adverse Interaction & Receptor Conflict Discovery Engine
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES & ROLES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    organization TEXT,
    role TEXT NOT NULL DEFAULT 'public' CHECK (role IN ('public', 'student', 'researcher', 'pharmacist', 'doctor', 'administrator')),
    license_number TEXT,
    verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. EVIDENCE SOURCES & DATA ADAPTERS
CREATE TABLE IF NOT EXISTS public.evidence_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_code TEXT UNIQUE NOT NULL, -- rxnorm, openfda_label, openfda_faers, rcsb_pdb, pubmed, chembl
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID NOT NULL REFERENCES public.evidence_sources(id) ON DELETE CASCADE,
    job_type TEXT NOT NULL,
    records_processed INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    error_message TEXT,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. DRUGS, IDENTIFIERS & LABELS
CREATE TABLE IF NOT EXISTS public.drugs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    drug_id UUID NOT NULL REFERENCES public.drugs(id) ON DELETE CASCADE,
    id_type TEXT NOT NULL, -- 'UNII', 'CAS', 'PUBCHEM_CID', 'CHEMBL_ID'
    id_value TEXT NOT NULL,
    source_id UUID REFERENCES public.evidence_sources(id),
    UNIQUE(drug_id, id_type, id_value)
);

CREATE TABLE IF NOT EXISTS public.drug_labels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    source_id UUID REFERENCES public.evidence_sources(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. BIOLOGICAL TARGETS & RECEPTORS
CREATE TABLE IF NOT EXISTS public.biological_targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uniprot_id TEXT UNIQUE,
    gene_symbol TEXT NOT NULL,
    target_name TEXT NOT NULL,
    target_type TEXT NOT NULL, -- Receptor, Enzyme, Ion Channel, Transporter
    cellular_location TEXT,
    pathway_name TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. COMPOUNDS & BIOASSAYS
CREATE TABLE IF NOT EXISTS public.compounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    drug_id UUID REFERENCES public.drugs(id) ON DELETE SET NULL,
    chembl_id TEXT UNIQUE,
    smiles TEXT,
    inchi_key TEXT,
    molecular_weight NUMERIC,
    formula TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.compound_target_assays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 6. 3D MACROMOLECULAR STRUCTURES (RCSB PDB)
CREATE TABLE IF NOT EXISTS public.protein_structures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 7. SCIENTIFIC EVIDENCE, CLAIMS & CONFLICTS
CREATE TABLE IF NOT EXISTS public.scientific_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    drug_a_id UUID NOT NULL REFERENCES public.drugs(id) ON DELETE CASCADE,
    drug_b_id UUID REFERENCES public.drugs(id) ON DELETE CASCADE,
    target_id UUID REFERENCES public.biological_targets(id) ON DELETE SET NULL,
    claim_type TEXT NOT NULL, -- 'Enzyme Competition', 'Receptor Antagonism', 'QT Prolongation', 'Synergistic Toxicity'
    severity_level TEXT NOT NULL CHECK (severity_level IN ('Contraindicated', 'Major', 'Moderate', 'Minor', 'Theoretical')),
    evidence_status TEXT NOT NULL DEFAULT 'Documented' CHECK (evidence_status IN ('Documented', 'Predicted', 'Simulated', 'Uncertain', 'Evidence Gap')),
    mechanism_summary TEXT NOT NULL,
    clinical_consequence TEXT NOT NULL,
    management_guidance TEXT,
    source_citation TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.evidence_conflicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_a_id UUID NOT NULL REFERENCES public.scientific_claims(id) ON DELETE CASCADE,
    claim_b_id UUID NOT NULL REFERENCES public.scientific_claims(id) ON DELETE CASCADE,
    discrepancy_type TEXT NOT NULL CHECK (discrepancy_type IN ('Severity Disagreement', 'Mechanism Discrepancy', 'In Vitro vs Clinical Conflict', 'Dose-Dependent Variation')),
    analysis_notes TEXT NOT NULL,
    resolution_status TEXT NOT NULL DEFAULT 'Potential Conflict' CHECK (resolution_status IN ('Potential Conflict', 'Requires Context', 'Reviewed', 'Resolved', 'Inconclusive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. RESEARCH PROJECTS, HYPOTHESES & ANNOTATIONS
CREATE TABLE IF NOT EXISTS public.research_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    dataset_mode TEXT NOT NULL DEFAULT 'RESEARCH' CHECK (dataset_mode IN ('DEMO', 'RESEARCH', 'CLINICAL REVIEW')),
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.research_hypotheses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 9. CLINICAL REVIEWS & AUDIT TRAILS
CREATE TABLE IF NOT EXISTS public.medication_review_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    patient_synthetic_id TEXT NOT NULL,
    clinical_summary TEXT,
    review_status TEXT NOT NULL DEFAULT 'In Review' CHECK (review_status IN ('Pending', 'In Review', 'Signed-Off', 'Escalated')),
    signed_off_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.medication_review_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    ip_hash TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_review_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles read access" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public projects read access" ON public.research_projects FOR SELECT USING (is_public = true);
CREATE POLICY "Owner access to projects" ON public.research_projects FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Reviewer access to clinical sessions" ON public.medication_review_sessions FOR ALL USING (auth.uid() = reviewer_id);

-- 11. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_drugs_generic_name ON public.drugs(generic_name);
CREATE INDEX IF NOT EXISTS idx_drugs_rxcui ON public.drugs(rxnorm_cui);
CREATE INDEX IF NOT EXISTS idx_claims_drugs ON public.scientific_claims(drug_a_id, drug_b_id);
CREATE INDEX IF NOT EXISTS idx_structures_pdb ON public.protein_structures(pdb_id);
CREATE INDEX IF NOT EXISTS idx_targets_uniprot ON public.biological_targets(uniprot_id);
CREATE INDEX IF NOT EXISTS idx_assays_compound_target ON public.compound_target_assays(compound_id, target_id);
