# Drug Scope AI — Reference Design Analysis & Visual Specification
**Application:** PS-12 Autonomous Drug–Drug Adverse Interaction & Receptor Conflict Discovery Engine  
**Design Authority:** Impeccable  
**Date:** 2026-10-10  

---

## 1. Visual Source of Truth Analysis

### Reference Image 1: The Landing Page (Hero + Feature Cards + Workspace Preview)
* **Overall Composition:**
  - Dark, rich space-navy foundation (`#070B14` to `#0B1120`).
  - High-impact split-screen hero: Left 55% dedicated to brand typography, narrative value proposition, CTAs, and factual metrics (`120M+`, `8M+`, `2.5M+`, `50K+`).
  - Right 45% dedicated to an interactive 3D molecular protein-ligand complex embedded within a glowing card container.
  - Floating 3D card HUD:
    - Top-left badge: `Paxlovid (Nirmatrelvir) ↗` (`SARS-CoV-2 Mpro inhibitor`) with color-coded interaction legend (Protein, Ligand, Hydrogen bond, Hydrophobic, Electrostatic) and `Show Interactions >`.
    - Right vertical tool palette: `3D View`, `Surface`, `Ribbons`, `Ligand`, `Interactions`, `Fullscreen`.
    - Bottom dock: `Cartoon`, `Surface`, `Ball & Stick`, `Space Fill`, and Expand.
  - Lower section: 4 feature cards in a row (`Real Drug Evidence`, `Interaction Analysis`, `3D Molecular Lab`, `Scientific Reports`) with rich micro-visual previews.
  - Bottom-most section: `A Unified Research Workspace for Modern Science` with dark dashboard preview.
* **Top Header:**
  - Height: ~68px.
  - Left: Glowing connected molecular cube glyph in cyan/violet + bold wordmark `Drug Scope AI`.
  - Center: Nav pills: `Home` (blue dot active), `Drug Intelligence`, `Interaction Analysis`, `3D Molecular Lab`, `Research Hub`, `Pricing`.
  - Right: Search input with `⌘K` badge, subtle `Sign In` button, vibrant cyan-to-blue `Get Started` button.

---

### Reference Image 2: Research Command Center (The Dashboard)
* **Layout Geometry (Desktop 1440px):**
  - Left Sidebar: Width 250px, fixed navigation hierarchy (`#0A1323` to `#0B1120`).
  - Top Global Header: Height 68px, spanning full width with a wide, centered global search bar `Search drugs, targets, diseases, pathways, or ask a research question... ⌘K`.
  - Right Header: `Saved`, `Notifications` (with counter badge), User avatar with `Dr. Sarah Chen, Principal Investigator`.
  - Main Canvas: Flexible width filling remaining space (~1190px), 24px padding, 16-20px card gap.
* **Dashboard Hero:**
  - Breadcrumb: `RESEARCH COMMAND CENTER`.
  - Headline: `Welcome back, Dr. Sarah Chen` (32px font-display).
  - Subtitle: `Transforming molecular data into real-world medical breakthroughs.`
  - Top-Right Highlight: `AI Insight: Based on your recent searches, 3 new high-confidence drug repurposing opportunities were identified.`
  - Background: Shimmering 3D protein ribbons woven behind the greeting.
* **4 Metric KPI Cards with Sparklines:**
  - Card 1: `120M+` Drug & bioactive compounds (Cyan icon & trendline).
  - Card 2: `8M+` Peer-reviewed studies (Purple icon & trendline).
  - Card 3: `2.5M+` Drug interaction records (Teal icon & trendline).
  - Card 4: `50K+` 3D molecular structures (Violet icon & trendline).
* **Middle Section Grid (3 Columns):**
  - Col 1: `Data Sources Status` (PubMed, ChEMBL, ClinicalTrials.gov, Open Targets, BindingDB, UniProt with live indicators).
  - Col 2: `Research Activity` (1,248 Searches ↑42%, 386 Unique targets, 142 Compounds, multi-line activity wave chart).
  - Col 3: `3D Molecular Preview` (Interactive Nirmatrelvir ball-and-stick ligand, molecular formula `C23H32F3N5O4`, weight `499.5 g/mol`, affinity `-9.2 kcal/mol`, bottom display pills).
* **Bottom Section Grid (3 Columns):**
  - Col 1: `Compound-Target Interaction Network` (Interactive node graph: Paxlovid connected to Mpro, ACE2, TMPRSS2, COVID-19, inflammation).
  - Col 2: `Evidence Summary` (Filtered scientific evidence table with status badges and source count links).
  - Col 3: `Recent Scientific Reports` (Cards for GLP-1, JAK Inhibitors, SARS-CoV-2 with mini molecular previews and journal badges).
* **Bottom Floating AI Prompt Dock:**
  - Floating pill bar across bottom center: `Ask Drug Scope AI` with sparkle icon, input prompt, purple send button, and quick-action chips (`Analyze compound`, `Find drug repurposing opportunities`, `Compare targets`, `Summarize recent literature`).

---

### Reference Image 3: 3D Molecular Lab (Flagship Interactive Lab)
* **Workspace Proportions:**
  - Left Structure Browser: 20% (~280px).
  - Center 3D Viewport: 57% (~820px).
  - Right Scientific Inspector: 23% (~340px).
* **Left Structure Browser:**
  - Header: `3D Molecular Lab` + description.
  - Primary CTA: `+ Load Structure` (vibrant purple/blue gradient button with dropdown).
  - Tabs: `Structures` (active), `Targets`, `Projects`.
  - Search: `Search proteins, ligands, PDB IDs...` with filter icon.
  - `Recent Structures` list with rich miniature molecular icons: `SARS-CoV-2 Mpro` (7K3N), `EGFR` (1M17), `BRAF` (6VJJ), `PD-1` (6M0J), `TNF-alpha` (2AZ5).
  - `Example Targets`: SARS-CoV-2, EGFR, BRCA1, HIV-1 Protease, BACE1.
* **Center 3D Viewport:**
  - Top-Left Badge: `SARS-CoV-2 Main Protease (Mpro)`, `PDB: 7K3N | 2.1 Å Resolution`, tags `Protein-Ligand Complex`, `Viral Target`.
  - Top-Right Floating Controls: Selection arrow, Pan, Zoom, Center/Fit, Camera/Screenshot, 3D Toggle.
  - 3D Scene: Shimmering cyan-purple alpha-helix and beta-sheet ribbons, active site pocket surface, ball-and-stick inhibitor with labeled binding residues: `His41`, `Cys145`, `Glu166`, `His163`, `Gln189`, and distance measurements (`2.8 Å`).
  - Bottom Dock: Rotation toggle, `Cartoon`, `Surface`, `Ball & Stick`, `Licorice`, `Space Fill`, and component visibility dropdowns (`Protein`, `Ligand`, `Interactions`, `Surface`).
* **Right Scientific Inspector:**
  - Tabs: `Structure`, `Interactions`, `Analytics`, `AI Insights`.
  - Card 1: `PDB Information` (PDB 7K3N, title, organism, resolution 2.1 Å, method X-ray, date, authors).
  - Card 2: `Ligand Information` (N3 Covalent Inhibitor, small molecule, formula `C34H33N5O5`, weight 680.67 g/mol, affinity Ki = 3.1 nM, 2D structure diagram).
  - Card 3: `Key Interactions (8)` (Residue bond list with colored dots and distances).
  - Card 4: `Selected Residue` (Cys145 catalytic residue with 3D atomic preview).
  - Card 5: `Evidence & Sources (12)` (Science citations, reviews).

---

## 2. Color System & Design Tokens
- Canvas Foundation: `#070B14`
- Surface Shell: `#0B1120`
- Sidebar Surface: `#0A1323`
- Primary Card: `#111C2E`
- Secondary Card: `#152238`
- Elevated / Toolbars: `#1A2942`
- Borders: `rgba(255, 255, 255, 0.08)` to `rgba(36, 216, 237, 0.25)`
- Electric Cyan: `#24D8ED` (or `#37D6E6`)
- Scientific Violet: `#9475FF` (or `#9079F7`)
- Medical Teal: `#31CAB6` (or `#32C8B7`)
- Warning Amber: `#F2B961`
- Critical Red: `#F16D7B`
- Primary Text: `#F5F8FF`
- Secondary Text: `#A6B5CB`
- Muted Text: `#71839E`
