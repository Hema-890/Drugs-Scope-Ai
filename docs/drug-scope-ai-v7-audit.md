# DRUG SCOPE AI 7.0 — COMPREHENSIVE REPOSITORY AUDIT & ACTION PLAN
## PS-12 Autonomous Drug–Drug Adverse Interaction & Receptor Conflict Discovery Engine

**Lead UI/UX Authority:** Impeccable  
**Date:** Current System Timestamp  
**Target:** Clean, uncluttered, production-grade biomedical research workstation with flagship 3D capabilities

---

## 1. Current State Inventory & Assessment

### A. What is Working Well
1. **Design System Tokens (Tailwind v4 & Impeccable)**:
   - Deep obsidian/navy palette (`#070B14`, `#0B1120`, `#111C2E`), electric cyan (`#24D8ED`), scientific violet (`#9475FF`), and medical teal (`#31CAB6`).
   - Clean Inter typography and monospace identifiers.
2. **Core 5.0 Analysis Engine**:
   - `MedicineAnalysisWorkspace.tsx`, `AnalysisResultsDashboard.tsx`, and `ScientificDossierReport.tsx` provide a working workflow from search to 3D evidence graph and printable PDF report.
3. **Data Source Adapters**:
   - Live openFDA SPL API integration with structured fallbacks (`openFdaApi.ts`).
   - NIH RxNav RxCUI resolution (`rxnormApi.ts`).
   - RCSB PDB metadata and coordinate parser (`rcsbPdbApi.ts`).
   - PubMed literature fetcher with PMIDs and MeSH index terms (`pubmedApi.ts`).

### B. What is Cluttered & Confusing
1. **Home / Landing Page (`LandingPage.tsx`)**:
   - Stat pills with arbitrary research counts (`120M+`, `8M+`, etc.) distract from the core value proposition.
   - Below-hero modules duplicate content found inside the workspace preview.
   - The 3D hero molecule, while functional, lacks layered orbital motion, depth-of-field lighting, and responsive tilt.
2. **Dashboard (`CommandCenter.tsx`)**:
   - Contains a commercial "Professional Plan (1,240 / 2,000 searches)" widget that feels out of place in a scientific research platform.
   - Vague AI prompt docks with pre-canned chips clutter the viewport.
   - Multiple redundant graphs (activity wave chart, compound-target network, kpi sparklines) create sensory overload.
3. **Navigation Architecture**:
   - The sidebar has 10+ items visible simultaneously, making first-time navigation confusing.
   - Needs progressive disclosure: 5-6 primary navigation items (`Home`, `Analyze Medicines`, `Interaction Analysis`, `3D Molecular Lab`, `Literature Intelligence`, `Reports`), with secondary tools organized under a clean `Research Tools` menu.
4. **Sign In / Authentication Flow**:
   - Currently, clicking "Sign In" in the navbar simply triggers a route switch or is partially static.
   - Needs a dedicated, elegant, modal or view with email/password inputs, validation, show/hide password, and role selector.
5. **Literature Intelligence (`LiteratureIntelligence.tsx`)**:
   - Contains decorative mockup badges and placeholder filters rather than a crisp, focused PubMed search with original abstracts, DOI links, and direct citation exports.
6. **3D Molecular Lab (`LabMoleculeScene.tsx` & `MolecularLab.tsx`)**:
   - Needs richer lighting, smoother camera damping, cleaner residue highlighting, and high-fidelity representation transitions.

---

## 2. Targeted Action Plan

| Priority | Area | Objectives |
|---|---|---|
| **P0** | **Navigation & Information Architecture** | Consolidate primary navigation into 6 focused routes. Clean up `Sidebar.tsx` and `Navbar.tsx`. |
| **P0** | **Home Page Simplification** | Strip marketing fluff and fake stats. Reorganize into: Hero, Core Capabilities (4 essential cards), Workflow Preview, and Source Trust section. |
| **P0** | **Dashboard De-cluttering** | Remove "Professional Plan" widget and redundant prompt docks. Prioritize Analyze Medicines launch, Recent Analyses, 3D Lab shortcut, and Real Source Status. |
| **P1** | **Authentication & Sign In** | Build dedicated, production-grade Auth Modal with tabs (Sign In / Register), form validation, show/hide password, and role selection. |
| **P1** | **Interaction Analysis & Evidence Review** | Upgrade `InteractionReview.tsx` with a search-integrated compound chooser, 2-level explanation (top summary + detailed expandable evidence), and animated interaction pathways. |
| **P1** | **Literature Intelligence Overhaul** | Rebuild `LiteratureIntelligence.tsx` to feature real PubMed queries, full abstracts, DOIs, PubMed links, and citation copy. Remove decorative filler. |
| **P2** | **3D Hero Upgrade** | Re-engineer `HeroMolecule.tsx` with richer lighting, orbital ligand trajectories, depth fog, smooth rotation controls, and tactile hover feedback. |
| **P2** | **3D Molecular Lab Enhancement** | Elevate `LabMoleculeScene.tsx` with refined materials, smooth camera interpolation, interactive pocket lighting, and residue highlight halos. |
| **P3** | **Performance & Verification** | Ensure build times under 3s, zero console warnings, responsive mobile layouts, and complete test verification. |
