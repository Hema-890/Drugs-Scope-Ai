# DRUG SCOPE AI 5.0 — MASTER ARCHITECTURAL IMPLEMENTATION PLAN
## PS-12 Autonomous Drug–Drug Adverse Interaction & Receptor Conflict Discovery Engine

**Lead UI/UX Authority:** Impeccable  
**Core Workflow:**
`ENTER MEDICINES → RETRIEVE SCIENTIFIC EVIDENCE → ANALYZE DOCUMENTED RELATIONSHIPS → GENERATE INTERACTIVE 3D REPORT → EXPLAIN FINDINGS → SAVE AND EXPORT`

---

## 1. Current State Assessment & Inventory

### A. Working Features to Preserve
1. **Visual Design Foundation (Impeccable & Tailwind v4)**:
   - Deep Obsidian/Navy background `#070B14`, AppShell `#0B1120`, Sidebar `#0A1323`.
   - Electric cyan `#24D8ED`, scientific violet `#9475FF`, medical teal `#31CAB6`, critical red `#F16D7B`, warning amber `#F2B961`.
   - Inter typography, high-contrast monospace identifiers, and subtle border luminescences.
2. **Flagship 3D Molecular Viewers**:
   - `HeroMolecule.tsx`: ACESFilmic tone-mapped Three.js canvas with alpha-helix ribbons and Nirmatrelvir ligand.
   - `LabMoleculeScene.tsx`: 3-column Flagship 3D Molecular Lab with binding pocket cavity surface, ball-and-stick inhibitor, and 3D screen-projected residue interaction badges (`His41`, `Cys145`, `Glu166`, `His163`, `Gln189`).
   - `DashboardMoleculePreview.tsx`: Real-time rotating molecular preview card.
3. **Existing Scientific Modules & Adapters**:
   - `openFdaApi.ts`: Live openFDA SPL drug label retrieval with structured fallback.
   - `rxnormApi.ts`: Live NIH RxNav RxCUI resolution with synonym parsing.
   - `rcsbPdbApi.ts`: Live RCSB PDB metadata and coordinate parser.
   - `pubmedApi.ts`: PubMed literature search with PMIDs and MeSH indexing.
   - `storageService.ts`: Local storage persistence for audit logging, user profiles, dataset modes, and bookmarks.
   - `supabase/migrations/20241010000000_drug_scope_core_schema.sql`: Full PostgreSQL schema covering drugs, targets, assays, claims, conflicts, and sessions.

### B. Components Requiring Enhancement & Redesign
1. **Medicine Analysis Workflow (`/analyze` route)**:
   - Currently, drug analysis is scattered across multiple individual tools (`MedicineExplorer`, `InteractionReview`).
   - Needs a unified, prominent **Medicine Analysis Workspace** where users can input one, two, or multiple medicines (generic/brand names), resolve RxCUIs, set optional clinical context, and initiate multi-source evidence extraction.
2. **Next-Level Analysis Results Dashboard (`/analysis/:id`)**:
   - Needs a dedicated scientific results command center featuring a **Three-Dimensional Evidence Graph** (connecting compounds, metabolic enzymes, receptor targets, and evidence nodes), side-by-side with an atomic/molecular viewer and synchronized evidence inspector.
3. **3-Audience Explanation System**:
   - Simple Mode (patients/educators: non-jargon, clear 'what this means', questions for doctors).
   - Professional Mode (physicians/pharmacists: enzyme competition, CYP phenotypes, boxed warnings, management guidance).
   - Research Mode (biomedical scientists: Kd/Ki binding affinities, RCSB structures, assay data, evidence gaps).
4. **Interactive 3D Digital Report & PDF Export**:
   - Interactive report viewer with 10 distinct research sections.
   - Professional PDF and print stylesheet (`@media print` pagination, high-contrast typography, graph capture, and source provenance).
5. **Dashboard Primary Action**:
   - Elevate the Command Center with a large, prominent "Analyze Medicines" search & launch banner at the top.

---

## 2. Technical Architecture & Data Flow

```
User Input (Generic / Brand / Active Ingredient)
        │
        ▼
[MedicineSearchService / RxNorm API] ──► Resolve RxCUI & Standardized Identifiers
        │
        ▼
[EvidenceRetrievalService]
        ├──► openFDA SPL (Structured Product Labels, Contraindications, Warnings)
        ├──► Verified Interaction Registry (CYP450 competition, QT prolongation, pharmacodynamics)
        ├──► RCSB PDB (Experimental macromolecular structures & coordinates)
        └──► PubMed (Peer-reviewed citations & MeSH indices)
        │
        ▼
[AnalysisEngine] ──► Constructs Graph Topology & Multi-Tier Evidence Matrix
        │
        ├──► Interactive 3D Evidence Graph (Compounds ⟷ Enzymes ⟷ Receptors ⟷ Citations)
        ├──► 3-Audience Explanation Generator (Simple / Professional / Research)
        ├──► Synchronized Evidence Table & Inspector
        └──► Reproducible Scientific Dossier & PDF Export
```

---

## 3. Database Schema Extensions (Supabase / PostgreSQL)

To support persistent, shareable, and historical multi-drug analysis sessions:
- `analysis_sessions`: Stores `id`, `user_id`, `title`, `mode`, `selected_drugs` (JSONB), `clinical_context` (JSONB), `summary`, `created_at`.
- `analysis_findings`: Stores pairwise findings, severity levels, mechanisms, evidence statuses, and citations.
- `analysis_graph_snapshots`: Stores node/edge JSON topology for instant replay.

---

## 4. Implementation Steps & Milestones

1. **Step 1 — Analysis Engine & Types**: Define `AnalysisSession`, `AnalysisFinding`, `GraphNode`, `GraphEdge`, and explanation modes in `src/types/index.ts`.
2. **Step 2 — Unified Medicine Analysis Workspace (`src/components/modules/MedicineAnalysisWorkspace.tsx`)**:
   - Autocomplete medicine search with debounced RxNorm and openFDA resolution.
   - Removable drug chips with active ingredient badges.
   - Optional research parameters (dose, route, age group, renal/hepatic context).
   - Real-time progress pipeline during multi-source evidence synthesis.
3. **Step 3 — Interactive 3D Evidence Graph (`src/components/3d/EvidenceGraph3D.tsx`)**:
   - Three.js WebGL graph renderer with force-directed 3D layout.
   - Drug nodes (Cyan `#24D8ED`), Enzyme nodes (Orange `#F2B961`), Receptor nodes (Violet `#9475FF`), Evidence nodes (Blue `#4D96FF`).
   - Orbit controls, node click-to-explain, 2D/3D projection toggle, search, and category filters.
4. **Step 4 — Next-Level Analysis Results Dashboard (`src/components/modules/AnalysisResultsDashboard.tsx`)**:
   - 3-column workstation layout: Left (medication summary & filters), Center (3D Graph & Molecular view), Right (Evidence Inspector & Explanation).
   - Mode switcher (`Simple` | `Professional` | `Research`).
   - Bottom synchronized evidence matrix.
5. **Step 5 — Interactive Scientific Report & PDF Generator (`src/components/reports/ScientificDossierReport.tsx`)**:
   - 10-section publication-grade report dossier.
   - Direct PDF print styling, JSON export, and CSV download.
6. **Step 6 — Dashboard UX Enhancement (`CommandCenter.tsx`)**:
   - Primary top section featuring the "Analyze Medicines" search & launch banner.
   - Recent analysis sessions list with direct load/reopen capabilities.
7. **Step 7 — Full Integration in `App.tsx` & `Navbar.tsx`**:
   - Register `/analyze` and active session state in the application router.
   - Ensure seamless cross-module state transitions (e.g. from Analysis to 3D Molecular Lab).
8. **Step 8 — Testing & Visual Browser Validation**:
   - Execute unit compilation (`npm run build`).
   - Run browser automation tests for full end-to-end user journeys (Search → Analyze → 3D Graph → Explain → Export).
