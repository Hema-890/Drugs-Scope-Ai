# DRUG SCOPE AI — MISSING FEATURES & ROADMAP GAPS
**Autonomous Drug–Drug Adverse Interaction & Receptor Conflict Discovery Engine (PS-12)**
*Comprehensive Gap Analysis Against Production Biomedical & Clinical Research Standards*

---

## 1. Executive Summary

While **Drug Scope AI** provides an exceptionally polished user interface and high-performance WebGL graphics, the system currently functions as an advanced interactive prototype. Several foundational capabilities required for technical production deployment, clinical research validity, and multi-user security remain incomplete or missing.

---

## 2. Inventory of Missing Features by Domain

### 2.1 Backend & Persistence Gaps
1. **Live Supabase PostgreSQL Database Connection:**
   - *Status:* Missing in active runtime (schema exists, but config points to mock URL).
   - *Requirement:* Live Supabase instance running migrations, persisting analysis runs, storing saved drug regimens, and recording audit logs across user devices.
2. **Cryptographic Authentication & Authorization:**
   - *Status:* Missing (presently uses simulated client-side mock login).
   - *Requirement:* Supabase Auth with OAuth / email magic links, JWT token verification on API endpoints, and Row Level Security (RLS) enforcement.
3. **Server-Side Clinical Analysis Engine:**
   - *Status:* Missing (analysis runs in browser thread).
   - *Requirement:* Dedicated `/api/analyze` endpoint capable of processing large multi-drug regimens without blocking the browser UI thread.

### 2.2 Scientific & Data Integration Gaps
4. **NIH RxNav Dynamic Pairwise Interaction API Integration:**
   - *Status:* Missing (currently limited to 12 hardcoded pairs with basic heuristic fallback).
   - *Requirement:* Integration with NLM RxNav (`/REST/interaction/list.json?rxcuis=...`) to dynamically look up clinically validated interactions between any arbitrary pair of FDA-approved drugs.
5. **NCBI eFetch XML Abstract Parser for PubMed:**
   - *Status:* Missing (currently returns synthetic template sentences for dynamic queries).
   - *Requirement:* Multi-stage NCBI pipeline calling `esearch.fcgi` -> `efetch.fcgi?retmode=xml`, parsing `<AbstractText>` to display genuine published literature abstracts.
6. **Live FDA Adverse Event Reporting System (FAERS) Integration:**
   - *Status:* Partial / Static (displays simulated signal trends).
   - *Requirement:* Dynamic queries to `api.fda.gov/drug/event.json?search=patient.drug.medicinalproduct:...&count=patient.reaction.reactionmeddrapt.exact` to display live real-world adverse event report counts.
7. **Personalized Pharmacogenomic (PGx) Variant Modeling:**
   - *Status:* Missing.
   - *Requirement:* Ability to input patient CYP genotype (e.g., CYP2C9 *2/*3, CYP2D6 Poor Metabolizer) and compute personalized clearance reductions and AUC elevation curves.

### 2.3 3D Molecular Graphics Gaps
8. **Real Atomic PDB Coordinate Parsing & Mol\* Integration:**
   - *Status:* Missing (renders procedural Catmull-Rom ribbons).
   - *Requirement:* Ability to parse standard `.pdb` or `.cif` files from RCSB PDB, render exact atomic coordinates, display crystallographic ligands in their true binding pockets, and calculate hydrogen bonding or steric clashes.
9. **Dynamic Small-Molecule 3D Conformer Loading (PubChem 3D):**
   - *Status:* Missing.
   - *Requirement:* Dynamic retrieval of SDF/MOL 3D conformers from PubChem (`pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/.../SDF?record_type=3d`) for drugs without macro-protein PDB complexes.

### 2.4 User Experience & Reporting Gaps
10. **History-Backed URL Routing (`react-router-dom`):**
    - *Status:* Missing (uses single-state enum router).
    - *Requirement:* Deep-linking URLs (e.g., `/analyze?drugs=warfarin,fluconazole`, `/lab?pdb=1OG5`) allowing researchers to bookmark, share, and navigate via browser history.
11. **Server-Side / Client-Side Binary PDF Generation:**
    - *Status:* Missing (delegates to browser `window.print()`).
    - *Requirement:* High-fidelity PDF compilation (`@react-pdf/renderer` or `jspdf`) generating standardized multi-page clinical dossier reports with embedded high-resolution 3D canvas snapshots.
12. **Automated Verification Test Suite:**
    - *Status:* Missing (0 test runner packages).
    - *Requirement:* Unit tests for calculation engines (`vitest`), integration tests for federal API proxies, and end-to-end user journey tests (`playwright`).

---

## 3. Prioritized Implementation Roadmap

| Priority | Missing Feature | Impact | Effort Estimate |
| :---: | :--- | :--- | :---: |
| **P0** | Live Supabase Instance & PostgreSQL Migrations | Enables real persistent accounts & data security | 1–2 hours |
| **P0** | Genuine Supabase Auth (Replacing Demo Login) | Eliminates critical security vulnerabilities | 2–3 hours |
| **P1** | NIH RxNav Dynamic Multi-Drug Interaction API | Expands interaction coverage from 12 to 10,000+ drugs | 2–3 hours |
| **P1** | NCBI eFetch Full MEDLINE Abstract Parser | Replaces synthetic abstracts with true peer review | 1–2 hours |
| **P1** | Automated Unit & Integration Test Suite (`vitest`) | Prevents clinical calculation regressions | 2 hours |
| **P2** | React Router Deep Linking (`react-router-dom`) | Enables shareable analysis URLs and browser history | 1.5 hours |
| **P2** | Downloadable Vector PDF Report Generator | Delivers professional clinical export without print dialog | 2 hours |
| **P2** | Real PDB Atomic Coordinate Parser (RCSB / Mol\*) | Replaces procedural 3D ribbons with real structural biology | 3–4 hours |
| **P3** | Live FAERS Adverse Event Signal Gateway | Real-time pharmacovigilance from openFDA | 2 hours |
| **P3** | Pharmacogenomic (PGx) CYP Variant Simulator | Personalized dosing and clearance curves | 4 hours |
