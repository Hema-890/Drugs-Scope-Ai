# DRUG SCOPE AI 4.0
### Autonomous Drug–Drug Adverse Interaction & Receptor Conflict Discovery Engine
**Tagline:** *Explore Drugs. Understand Interactions. Discover Molecular Evidence.*  
**PS-12 Master Implementation**

---

## Overview
**Drug Scope AI 4.0** is a full-stack computational pharmacology and molecular evidence research platform. Designed under the **Impeccable** design authority, the engine integrates official biomedical databases to correlate FDA package inserts, RxNorm clinical concepts, and RCSB 3D macromolecular structures, uncovering polypharmacy conflicts and receptor competition with full source provenance.

---

## Core Capabilities & 18 Integrated Modules

1. **Scientific Intelligence Command Center:** Real-time telemetry, conflict severity distributions, and biomedical adapter SLAs.
2. **Verified Medicine Knowledge Explorer:** 3-region clinical workstation with RxNorm CUI mapping, ATC classification, and live openFDA labeling queries.
3. **Evidence-Based Interaction Review:** Combinatorial multi-drug evaluation matrix detailing CYP450 competition, black-box warnings, and guidance.
4. **Advanced 3D Molecular Structure Lab (Flagship):** Interactive WebGL macromolecular viewer powered by Three.js with PDB coordinate parsing, ribbon/ball-and-stick/space-filling modes, raycasting atom picking, and live RCSB PDB downloads.
5. **Receptor & Pathway Intelligence Network:** Topological relationship graph connecting compounds to targets, cellular localizations, and biochemical pathways.
6. **Clinical Medication Review Workspace:** Synthetic polypharmacy patient case reconciliation, eGFR/renal clearance assessments, and interventional workflows.
7. **Research Hypothesis Workbench:** Quantitative uncertainty scoring, mechanistically formulated hypotheses, and experimental validation protocols.
8. **Pharmacovigilance Signal Explorer:** Post-marketing surveillance analyzing millions of openFDA FAERS reports using Proportional Reporting Ratios (PRR) and Reporting Odds Ratios (ROR).
9. **Scientific Literature Intelligence:** Real-time NCBI Entrez E-utilities PubMed search, structured abstracts, and MeSH indexing.
10. **Evidence Contradiction Radar:** Adjudication radar comparing clinical trial outcomes against regulatory label warnings.
11. **Medication Timeline & Exposure Explorer:** Temporal polypharmacy Gantt view identifying active drug exposure windows and delayed interaction risks.
12. **Doctor & Pharmacist Review Workflow:** Formal reconciliation sign-off with verified credential entry and SHA-256 audit trails.
13. **Research Collaboration Workspace:** Multi-investigator team boards, shared annotations, and project versioning.
14. **Professional Scientific Report Studio:** Printable and downloadable clinical dossiers in PDF, CSV, and JSON formats.
15. **Patient Education Mode:** Plain-language medication literacy, layman mechanism descriptions, and questions to ask clinicians.
16. **Scientific Data Source Administration:** Live endpoint health checks, latency monitoring, and rate-limit governance across NIH RxNav, openFDA, RCSB PDB, and PubMed.
17. **Explainable AI Research Assistant:** RAG-grounded conversational agent providing verified citations for every asserted claim.
18. **Research Audit & Provenance:** Immutable chronological event log tracking dataset modes, queries, and sign-offs.

### Innovation Differentiators
- **7.1 Evidence Time Machine:** Historical before/after comparative analysis of drug labeling across regulatory revision cycles.
- **7.2 Evidence Gap Atlas:** Multi-dimensional matrix mapping where structural or post-marketing records are missing.
- **7.3 Molecular Evidence Storyboard:** Guided 5-step presentation narrative connecting compound ingestion to 3D active site occlusion.
- **7.7 Voice-Assisted Navigation:** Web Speech API integration for hands-free query navigation.

---

## Technical Stack & Architecture

- **Frontend:** React 18, TypeScript, Vite, Tailwind tokens, Lucide Icons
- **3D Graphics:** Three.js WebGL canvas, PDB atomic coordinate parser, Orbit controls, Raycasting, ACESFilmic tone mapping
- **Backend & Database:** Supabase PostgreSQL with Row Level Security (RLS), typed schema migrations (`supabase/migrations/`)
- **Data Integrations:** Live NIH NLM RxNav API, openFDA SPL API, openFDA FAERS, RCSB PDB REST API, NCBI PubMed E-utilities

---

## Getting Started

### Prerequisites
- Node.js >= 18.x (tested on Node v22 LTS)
- npm >= 9.x

### Installation & Environment Setup

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd "Drugs adverse intercation"
npm install
```

2. **Configure Environment Variables:**
Copy the template to your local environment file:
```bash
cp .env.example .env.local
```

Edit `.env.local` to configure your credentials:
```bash
# Server-only Credentials (never exposed to browser JS)
OPENFDA_API_KEY=your_openfda_api_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your_supabase_secret_service_role_key

# Browser-safe Public Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_anon_key
VITE_API_BASE_URL=/api
```

> **Security Guarantee:** Server-only variables (`OPENFDA_API_KEY`, `SUPABASE_SECRET_KEY`) are accessed strictly on the server-side proxy (`/api/openfda`, `/api/health`) and are never bundled into client JavaScript.

3. **Database Setup (Supabase PostgreSQL):**
Execute the migration located at `supabase/migrations/20241010000000_drug_scope_core_schema.sql` in your Supabase SQL editor to create all required tables (`profiles`, `drugs`, `drug_labels`, `pairwise_interactions`, `analysis_sessions`) with Row Level Security (RLS) policies.

4. **Development Server:**
```bash
npm run dev
# Server running with serverless /api/* proxy at http://127.0.0.1:3000/
```

5. **Production Build:**
```bash
npm run build
```

---

## Scientific Data Governance
- **DEMO / SYNTHETIC MODE:** Synthetic patient records are isolated and clearly labeled.
- **RESEARCH MODE:** Live or cached openFDA, RxNorm, PDB, and PubMed APIs are actively queried with graceful offline fallbacks.
- **NO FABRICATION GUARANTEE:** Unknown affinities and missing reports are documented as evidence gaps, never inferred as clinical safety.
