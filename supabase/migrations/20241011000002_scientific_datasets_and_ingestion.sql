-- ==============================================================================
-- DRUG SCOPE AI 13.0 — SCIENTIFIC DATASETS & INGESTION PIPELINE SCHEMA
-- Target Project: kfdntklvvvorbgatyqcg (Supabase PostgreSQL)
-- ==============================================================================

-- 1. UNIVERSAL RESEARCH PAPERS (OpenAlex, PubMed, Europe PMC)
CREATE TABLE IF NOT EXISTS public.research_papers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    openalex_id TEXT UNIQUE,
    pubmed_id TEXT,
    doi TEXT,
    title TEXT NOT NULL,
    abstract TEXT,
    journal TEXT,
    publication_year INT,
    publication_date DATE,
    citation_count INT DEFAULT 0,
    open_access_url TEXT,
    authors JSONB DEFAULT '[]'::jsonb,
    concepts JSONB DEFAULT '[]'::jsonb,
    mesh_terms JSONB DEFAULT '[]'::jsonb,
    source_name TEXT NOT NULL DEFAULT 'OpenAlex',
    raw_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_research_papers_doi ON public.research_papers(doi);
CREATE INDEX IF NOT EXISTS idx_research_papers_pubmed_id ON public.research_papers(pubmed_id);
CREATE INDEX IF NOT EXISTS idx_research_papers_year ON public.research_papers(publication_year);
CREATE INDEX IF NOT EXISTS idx_research_papers_title ON public.research_papers USING gin(to_tsvector('english', title));

-- 2. CLINICAL TRIALS (ClinicalTrials.gov Protocol Records)
CREATE TABLE IF NOT EXISTS public.clinical_trials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nct_id TEXT NOT NULL UNIQUE,
    brief_title TEXT NOT NULL,
    official_title TEXT,
    overall_status TEXT NOT NULL,
    phases JSONB DEFAULT '[]'::jsonb,
    study_type TEXT,
    conditions JSONB DEFAULT '[]'::jsonb,
    interventions JSONB DEFAULT '[]'::jsonb,
    lead_sponsor TEXT,
    start_date TEXT,
    completion_date TEXT,
    enrollment_count INT,
    study_url TEXT,
    raw_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_clinical_trials_nct_id ON public.clinical_trials(nct_id);
CREATE INDEX IF NOT EXISTS idx_clinical_trials_status ON public.clinical_trials(overall_status);
CREATE INDEX IF NOT EXISTS idx_clinical_trials_title ON public.clinical_trials USING gin(to_tsvector('english', brief_title));

-- 3. ADVERSE EVENT REPORTS (openFDA FAERS Spontaneous Adverse Reports)
CREATE TABLE IF NOT EXISTS public.adverse_event_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    safety_report_id TEXT NOT NULL UNIQUE,
    receive_date DATE,
    serious INT DEFAULT 0,
    seriousness_death INT DEFAULT 0,
    seriousness_hospitalization INT DEFAULT 0,
    seriousness_life_threatening INT DEFAULT 0,
    patient_onset_age NUMERIC,
    patient_sex INT,
    medicinal_products JSONB DEFAULT '[]'::jsonb,
    reactions JSONB DEFAULT '[]'::jsonb,
    reporter_country TEXT,
    raw_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_adverse_events_safety_id ON public.adverse_event_reports(safety_report_id);
CREATE INDEX IF NOT EXISTS idx_adverse_events_receive_date ON public.adverse_event_reports(receive_date);

-- 4. CHEMICAL COMPOUNDS (PubChem & ChEMBL)
CREATE TABLE IF NOT EXISTS public.chemical_compounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pubchem_cid INT UNIQUE,
    chembl_id TEXT UNIQUE,
    name TEXT NOT NULL,
    iupac_name TEXT,
    molecular_formula TEXT,
    molecular_weight NUMERIC,
    canonical_smiles TEXT,
    inchi_key TEXT,
    pharmacology_summary TEXT,
    properties JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_chemical_compounds_cid ON public.chemical_compounds(pubchem_cid);
CREATE INDEX IF NOT EXISTS idx_chemical_compounds_smiles ON public.chemical_compounds(canonical_smiles);

-- 5. BULK INGESTION JOBS & PROGRESS TRACKING
CREATE TABLE IF NOT EXISTS public.ingestion_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_name TEXT NOT NULL,
    job_type TEXT NOT NULL DEFAULT 'BULK_IMPORT',
    status TEXT NOT NULL DEFAULT 'RUNNING',
    total_records INT DEFAULT 0,
    processed_records INT DEFAULT 0,
    successful_records INT DEFAULT 0,
    failed_records INT DEFAULT 0,
    error_summary TEXT,
    cursor_state JSONB DEFAULT '{}'::jsonb,
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    finished_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_source ON public.ingestion_jobs(source_name);
CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_status ON public.ingestion_jobs(status);
CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_started_at ON public.ingestion_jobs(started_at DESC);

-- 6. INGESTION ERRORS TABLE
CREATE TABLE IF NOT EXISTS public.ingestion_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.ingestion_jobs(id) ON DELETE CASCADE,
    source_name TEXT NOT NULL,
    record_identifier TEXT,
    error_message TEXT NOT NULL,
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_ingestion_errors_job_id ON public.ingestion_errors(job_id);

-- 7. SYNC CURSORS FOR INCREMENTAL CHECKPOINTS
CREATE TABLE IF NOT EXISTS public.sync_cursors (
    source_name TEXT PRIMARY KEY,
    cursor_value TEXT NOT NULL,
    last_sync_time TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    records_synced INT DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.research_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adverse_event_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chemical_compounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingestion_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingestion_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_cursors ENABLE ROW LEVEL SECURITY;

-- Public read access for scientific evidence tables
DROP POLICY IF EXISTS "Public read access for research papers" ON public.research_papers;
CREATE POLICY "Public read access for research papers"
    ON public.research_papers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access for clinical trials" ON public.clinical_trials;
CREATE POLICY "Public read access for clinical trials"
    ON public.clinical_trials FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access for adverse event reports" ON public.adverse_event_reports;
CREATE POLICY "Public read access for adverse event reports"
    ON public.adverse_event_reports FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access for chemical compounds" ON public.chemical_compounds;
CREATE POLICY "Public read access for chemical compounds"
    ON public.chemical_compounds FOR SELECT USING (true);

-- Read access for ingestion jobs & status dashboard
DROP POLICY IF EXISTS "Read access for ingestion jobs" ON public.ingestion_jobs;
CREATE POLICY "Read access for ingestion jobs"
    ON public.ingestion_jobs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Read access for ingestion errors" ON public.ingestion_errors;
CREATE POLICY "Read access for ingestion errors"
    ON public.ingestion_errors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Read access for sync cursors" ON public.sync_cursors;
CREATE POLICY "Read access for sync cursors"
    ON public.sync_cursors FOR SELECT USING (true);

-- Authenticated & Service Role mutation access
DROP POLICY IF EXISTS "Service role write access for research papers" ON public.research_papers;
CREATE POLICY "Service role write access for research papers"
    ON public.research_papers FOR ALL TO authenticated, service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role write access for clinical trials" ON public.clinical_trials;
CREATE POLICY "Service role write access for clinical trials"
    ON public.clinical_trials FOR ALL TO authenticated, service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role write access for adverse events" ON public.adverse_event_reports;
CREATE POLICY "Service role write access for adverse events"
    ON public.adverse_event_reports FOR ALL TO authenticated, service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role write access for chemical compounds" ON public.chemical_compounds;
CREATE POLICY "Service role write access for chemical compounds"
    ON public.chemical_compounds FOR ALL TO authenticated, service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role write access for ingestion jobs" ON public.ingestion_jobs;
CREATE POLICY "Service role write access for ingestion jobs"
    ON public.ingestion_jobs FOR ALL TO authenticated, service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role write access for ingestion errors" ON public.ingestion_errors;
CREATE POLICY "Service role write access for ingestion errors"
    ON public.ingestion_errors FOR ALL TO authenticated, service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role write access for sync cursors" ON public.sync_cursors;
CREATE POLICY "Service role write access for sync cursors"
    ON public.sync_cursors FOR ALL TO authenticated, service_role USING (true) WITH CHECK (true);

-- Enable Supabase Realtime publication on ingestion jobs and research papers
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ingestion_jobs;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.research_papers;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_object THEN NULL;
END $$;
