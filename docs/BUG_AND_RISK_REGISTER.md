# DRUG SCOPE AI — BUG & RISK REGISTER
**Autonomous Drug–Drug Adverse Interaction & Receptor Conflict Discovery Engine (PS-12)**
*Comprehensive Technical Defect, Scientific Limitation & Security Risk Matrix*

---

## 1. Summary of Identified Defects & Risks

| Severity | Count | Primary Impact Areas |
| :--- | :---: | :--- |
| **Critical** | 3 | Cloud persistence disabled, hardcoded mock authentication, simulated multi-user security |
| **High** | 4 | PubMed synthetic abstracts on live PMIDs, openFDA public rate limits, heuristic interaction fallback, window.print fallback |
| **Medium** | 5 | Procedural 3D coordinates instead of PDB atoms, state-based routing lacks URLs, table overflow on mobile, lack of PK/PD simulation, zero automated tests |
| **Low** | 3 | Missing favicon console notice, non-semantic button labels in 3D controls, unversioned local storage schema |

---

## 2. Detailed Bug & Risk Registry

### ISSUE-001: Supabase Database Cloud Persistence Disabled
- **Component:** `src/services/supabaseClient.ts` / Database
- **Severity:** **Critical**
- **Problem:** All user analyses, saved drugs, and audit logs are saved only to browser `window.localStorage`. Multi-user collaboration, cross-device access, and cloud persistence are completely non-functional.
- **Reproduction Steps:**
  1. Open application in browser A. Run an analysis and save it.
  2. Open application in browser B (or incognito window).
  3. Navigate to "Saved Analyses". The list is empty because records exist solely in browser A's local storage.
- **Root Cause:** `.env.local` contains a placeholder URL (`https://mock-drugscope-project.supabase.co`). `supabaseClient.ts` detects the `mock-` prefix and automatically diverts database queries to local storage fallbacks.
- **Affected Files:**
  - `src/services/supabaseClient.ts`
  - `.env.local`
- **Recommended Fix:** Connect a live Supabase project by provisioning genuine `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` credentials in `.env.local`, and run `supabase/migrations/20241010000000_drug_scope_core_schema.sql` on the remote instance.
- **Estimated Complexity:** Medium (30 minutes setup)
- **Verification Needed:** Perform inserts, updates, and reads across two isolated browser sessions and verify remote row creation in Supabase Studio.
- **Priority:** P0

---

### ISSUE-002: Authentication Bypass & Role Falsification
- **Component:** `src/components/common/AuthModal.tsx` / Security
- **Severity:** **Critical**
- **Problem:** Clicking "Reviewer Access" or any role ("Doctor", "Researcher") immediately logs in the user with hardcoded user ID `usr-simulated-01` without cryptographic token issuance, password validation, or backend authorization.
- **Reproduction Steps:**
  1. Click "Sign In" in top navigation.
  2. Click "Quick Demo Access (Doctor)" or any role button.
  3. Observe immediate login state without network authentication requests.
- **Root Cause:** Authentication is simulated entirely client-side; no Supabase Auth or JWT provider is active.
- **Affected Files:**
  - `src/components/common/AuthModal.tsx`
  - `src/services/supabaseClient.ts`
- **Recommended Fix:** Implement Supabase Auth (`supabase.auth.signInWithPassword`, `signInWithOAuth`) with email confirmation or passwordless magic links, and enforce backend JWT verification on API routes.
- **Estimated Complexity:** High (2 hours)
- **Verification Needed:** Verify that unauthenticated requests to protected endpoints return HTTP 401 Unauthorized.
- **Priority:** P0

---

### ISSUE-003: Zero Automated Test Suite
- **Component:** Codebase Infrastructure / CI/CD
- **Severity:** **Critical**
- **Problem:** There are no automated unit, integration, or end-to-end tests configured in the project. Any refactoring risks introducing silent regressions.
- **Reproduction Steps:**
  1. Check `package.json` scripts: only `"dev"`, `"build"`, and `"preview"` exist.
  2. Run `npm test`: fails with missing script.
- **Root Cause:** Test runners (Vitest, React Testing Library, Playwright) were omitted during initial scaffolding.
- **Affected Files:**
  - `package.json`
- **Recommended Fix:** Install `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, and `jsdom`. Add smoke tests for drug search, interaction calculations, and API adapters.
- **Estimated Complexity:** Medium (1.5 hours)
- **Verification Needed:** `npm test` runs in CI and verifies key clinical calculations.
- **Priority:** P1

---

### ISSUE-004: PubMed eUtils Synthetic Abstract Fallback
- **Component:** `api/pubmed.ts` / Literature Intelligence
- **Severity:** **High**
- **Problem:** While PubMed search retrieves genuine PMIDs, titles, and authors from NCBI, the abstracts shown for dynamic queries are generated placeholder sentences rather than the actual published MEDLINE abstracts.
- **Reproduction Steps:**
  1. Go to Scientific Literature tab.
  2. Search for any term outside the default list (e.g., `"atorvastatin clarithromycin"`).
  3. Inspect the displayed abstract: it reads `"Abstract indexed in MEDLINE for PMID [pmid]. Full scientific text and clinical trial results available through PubMed Central..."`.
- **Root Cause:** NCBI `esummary.fcgi` only returns metadata (titles, authors, sources), not full abstracts. Retrieving full abstracts requires a secondary call to `efetch.fcgi?retmode=xml`.
- **Affected Files:**
  - `api/pubmed.ts`
  - `src/services/pubmedApi.ts`
- **Recommended Fix:** Update `api/pubmed.ts` to call `efetch.fcgi` with `db=pubmed&id=${pmids.join(',')}&retmode=xml`, parse the `<AbstractText>` nodes with an XML parser, and return true peer-reviewed abstracts.
- **Estimated Complexity:** Medium (1 hour)
- **Verification Needed:** Verify that dynamic queries return verbatim MEDLINE abstracts matching pubmed.ncbi.nlm.nih.gov.
- **Priority:** P1

---

### ISSUE-005: Unbounded openFDA Public Rate Limiting
- **Component:** `api/openfda.ts` / Data Ingestion
- **Severity:** **High**
- **Problem:** The serverless openFDA proxy does not use an `OPENFDA_API_KEY`, causing requests to fall into the public rate limit bucket (240 requests/minute, 1,000 requests/day per IP).
- **Reproduction Steps:**
  1. Check `/api/health`. Observe `"openFda": {"status": "online", "authenticated": false}`.
  2. Perform rapid medicine searches in succession; risk receiving HTTP 429 Too Many Requests from openFDA.
- **Root Cause:** `OPENFDA_API_KEY` in `.env.local` is empty.
- **Affected Files:**
  - `api/openfda.ts`
  - `.env.local`
- **Recommended Fix:** Obtain an openFDA API key from open.fda.gov, place it in `.env.local`, and pass `?api_key=${process.env.OPENFDA_API_KEY}` in outgoing calls.
- **Estimated Complexity:** Low (10 minutes)
- **Verification Needed:** Verify `/api/health` reports `"authenticated": true` and rate limit header margins increase to 120,000 req/day.
- **Priority:** P1

---

### ISSUE-006: Limited Curated Pairwise Database with Heuristic Fallback
- **Component:** `src/data/mockInteractions.ts` & `src/services/interactionEngine.ts`
- **Severity:** **High**
- **Problem:** Accurate, validated interaction mechanisms and mitigation guidance exist for only 12 specific drug pairs. Arbitrary pairs between any of the other 30+ drugs in the catalog fallback to a crude heuristic matching shared CYP enzymes.
- **Reproduction Steps:**
  1. Add `Warfarin` and `Fluconazole` -> High-fidelity clinical report with CYP2C9 inhibition and INR monitoring advice.
  2. Add `Metformin` and `Sertraline` -> Fallback to generic "Potential metabolic conflict" without documented clinical trial citations.
- **Root Cause:** A complete clinical DDI dataset (e.g., DrugBank, Twosides, or parsed FDA Section 7) has not been ingested into a database table.
- **Affected Files:**
  - `src/data/mockInteractions.ts`
  - `src/services/interactionEngine.ts`
- **Recommended Fix:** Ingest the NIH RxNav interaction API (`rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=...`) to dynamically query thousands of real validated interaction pairs directly from NLM.
- **Estimated Complexity:** High (2.5 hours)
- **Verification Needed:** Verify that arbitrary drug combinations (e.g., Lisinopril + Spironolactone) retrieve official NLM hyperkalemia warnings without hardcoded entries.
- **Priority:** P1

---

### ISSUE-007: PDF Export Relies Solely on Browser Print Dialog
- **Component:** `src/components/modules/SavedReports.tsx` / Export
- **Severity:** **High**
- **Problem:** Clicking "Export PDF" simply executes `window.print()`. This depends entirely on the user's browser print capabilities, frequently cuts off 3D WebGL canvases, and fails in automated or headless workflows.
- **Reproduction Steps:**
  1. Navigate to "Clinical Reports" or "Saved Analyses".
  2. Click "Export PDF".
  3. A native system print dialog opens rather than downloading a clean formatted `.pdf` document.
- **Root Cause:** Lack of a dedicated PDF rendering library (such as `@react-pdf/renderer` or `jspdf`).
- **Affected Files:**
  - `src/components/modules/SavedReports.tsx`
  - `src/components/modules/InteractionReview.tsx`
- **Recommended Fix:** Integrate `jspdf` + `html2canvas` or a serverless Puppeteer route to generate downloadable, multi-page vector PDF reports with embedded snapshot images of the molecular scene.
- **Estimated Complexity:** Medium (1.5 hours)
- **Verification Needed:** Verify clicking "Export PDF" downloads a self-contained PDF file directly to disk.
- **Priority:** P2

---

### ISSUE-008: Procedural Mathematical 3D Ribbons Instead of Real Atomic PDB Coordinates
- **Component:** `src/components/3d/LabMoleculeScene.tsx` / 3D Graphics
- **Severity:** **Medium**
- **Problem:** The 3D Molecular Lab claims to visualize complex crystallographic structures (e.g., CYP2C9 [PDB: 1OG5], VKORC1 [PDB: 7K3N]), but the rendering engine draws procedural Catmull-Rom tube curves and geometric spheres rather than loading actual atom coordinates from RCSB PDB files.
- **Reproduction Steps:**
  1. Open 3D Molecular Lab.
  2. Select CYP2C9.
  3. Inspect `LabMoleculeScene.tsx`: it generates ribbons using `new THREE.CatmullRomCurve3(generateProceduralPoints())` instead of parsing coordinates from `https://files.rcsb.org/download/1OG5.pdb`.
- **Root Cause:** Complete Mol* or PDB parsing pipeline was deferred in favor of a fast procedural Three.js demonstration scene.
- **Affected Files:**
  - `src/components/3d/LabMoleculeScene.tsx`
  - `src/services/rcsbPdbApi.ts`
- **Recommended Fix:** Connect `rcsbPdbApi.ts` to `files.rcsb.org/download/{pdbId}.pdb`, parse real `ATOM` and `HETATM` records into Three.js BufferGeometries, or embed Mol* Viewer (`pdbe-molstar`).
- **Estimated Complexity:** High (3 hours)
- **Verification Needed:** Verify that atomic coordinates match crystallographic structures verified by RCSB PDB.
- **Priority:** P2

---

### ISSUE-009: SPA State Routing Prevents Direct Deep Linking
- **Component:** `src/App.tsx` / Navigation
- **Severity:** **Medium**
- **Problem:** Screen switching is controlled via `const [currentModule, setCurrentModule] = useState<AppModule>('home')`. The browser URL remains `http://127.0.0.1:3000/` on all screens. Users cannot bookmark a specific analysis, share a link to a drug review, or use the browser back/forward buttons.
- **Reproduction Steps:**
  1. Navigate from Home -> Clinical Workspace -> 3D Molecular Lab.
  2. Check URL bar: remains `http://127.0.0.1:3000/`.
  3. Click browser "Back" button: exits the entire application or does nothing.
- **Root Cause:** Scaffolding omitted `react-router-dom` in favor of single-state enum navigation.
- **Affected Files:**
  - `src/App.tsx`
  - `src/components/common/Navbar.tsx`
- **Recommended Fix:** Migrate navigation to `react-router-dom` with explicit paths (`/`, `/analyze`, `/review`, `/lab`, `/literature`, `/reports`).
- **Estimated Complexity:** Medium (1.5 hours)
- **Verification Needed:** Verify deep linking to `/lab?pdb=1OG5` directly opens the 3D lab with CYP2C9 preloaded.
- **Priority:** P2

---

### ISSUE-010: Absence of Dynamic Pharmacokinetic (PK/PD) Simulation
- **Component:** `src/services/interactionEngine.ts` / Scientific Engine
- **Severity:** **Medium**
- **Problem:** Risk scores (e.g., "94% Critical Risk", "AUC Increased 250%") are static percentages defined in data tables rather than computed from patient parameters (weight, renal function, CYP genotype) or differential kinetic equations.
- **Reproduction Steps:**
  1. Inspect the "Metabolic Bottleneck" calculation: risk score is read directly from static object properties (`pair.riskScore`).
- **Root Cause:** Advanced clinical simulation modeling was not integrated into the prototype.
- **Affected Files:**
  - `src/services/interactionEngine.ts`
  - `src/types/interaction.ts`
- **Recommended Fix:** Add disclaimers clarifying that percentages represent literature-reported mean estimates rather than personalized real-time pharmacokinetic simulations, or implement an open-source PK model.
- **Estimated Complexity:** High (4 hours)
- **Verification Needed:** Ensure all risk percentages display evidence citations and standard deviation bounds.
- **Priority:** P3
