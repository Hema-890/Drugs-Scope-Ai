# Drug Scope AI 4.0 — Skills Audit & Orchestration Matrix

**Project:** DRUG SCOPE AI  
**Tagline:** Explore Drugs. Understand Interactions. Discover Molecular Evidence.  
**Version:** 4.0.0 (PS-12 Autonomous Engine)  
**Primary UI/UX Design Authority:** Impeccable  
**Timestamp:** 2026-10-10  

---

## 1. Discovered Skills Inventory & Assigned Responsibilities

| Skill Identifier | Category / Domain | Primary Responsibility in Drug Scope AI | Status |
| :--- | :--- | :--- | :--- |
| **impeccable** | UI/UX & Design Authority | Visual design tokens, micro-interactions, dark aesthetic, typography, information architecture, accessibility audits | **Active & Governing** |
| **ui-ux-pro-max** | Design System & Experience | Scientific workstation ergonomics, multi-pane docking, responsive breakpoints, high-density scientific views | **Active** |
| **frontend-design** | Frontend Engineering | Component hierarchy, modular layouts, clean state machines, smooth transitions | **Active** |
| **threejs-skills** | WebGL & 3D Graphics | 3D molecular viewport rendering, OrbitControls, atom/bond spatial geometry, lighting | **Active** |
| **threejs-interaction** | 3D Raycasting & Picking | Atom/residue picking, camera fit-to-structure animations, selection highlights | **Active** |
| **threejs-materials** | Shader & Visual Quality | High-fidelity scientific materials (PBR, specular shine, ribbon shaders, depth cueing) | **Active** |
| **react-patterns** | Architecture | Component composition, clean hooks, state management without bloat | **Active** |
| **supabase-pro** | Database & Security | PostgreSQL migrations, Row Level Security (RLS), schema integrity, indexes | **Active** |
| **api-integration** | Data Integration | Official adapters for RxNorm, openFDA Drug Labeling, openFDA FAERS, RCSB PDB, PubMed | **Active** |
| **security-auditor** | Governance & Safety | Least privilege, unverified role protection, sanitization, synthetic-data isolation | **Active** |
| **performance-engineer** | Optimization | WebGL context lifecycle, memory disposal, lazy route loading, debounced search | **Active** |
| **test-driven-development**| Verification | Smoke testing, schema consistency, API fallback validation, export integrity | **Active** |

---

## 2. Design Token Governance (Impeccable Principles)

- **Foundation Background:** `#070B14` (Deep scientific navy-black)
- **Primary Surface:** `#101827` (Card and panel backgrounds)
- **Secondary Surface:** `#172134` (Sidebar, toolbars, docked drawers)
- **Elevated Surface:** `#1D2A3E` (Modals, inspector sheets, hover highlights)
- **Borders & Dividers:** `rgba(255, 255, 255, 0.08)` to `rgba(55, 214, 230, 0.2)`
- **Accent Cyan:** `#37D6E6` (Active states, key interaction highlights)
- **Accent Violet:** `#9079F7` (Target/receptor nodes, bioactivity data)
- **Medical Teal:** `#32C8B7` (Pharmacological pathways, verified bonds)
- **Warning Amber:** `#EFB85A` (Potential interactions, caution flags)
- **Critical Red:** `#F16D76` (Adverse contraindications, severe black-box warnings)
- **Text Palette:** High-contrast `#F4F7FB` (headings/data values), `#A7B5C9` (secondary labels), `#6B7D96` (muted/metadata)
- **Typography:**
  - Display: *Outfit*, sans-serif
  - Interface: *Inter*, system-ui, sans-serif
  - Scientific / PDB / RxCUI: *JetBrains Mono*, monospace

---

## 3. Scientific Data Provenance & Ethics
All 18 modules enforce explicit data provenance:
- **DEMO / SYNTHETIC MODE:** Clearly labeled when exploring synthetic patient cases.
- **RESEARCH MODE:** Connected to live or cached openFDA, RxNorm, PDB, and PubMed APIs.
- **NO FABRICATION GUARANTEE:** Unknowns, missing target affinities, and lack of adverse reports are recorded as "Not Documented" or "Evidence Gap", never inferred as guaranteed clinical safety.
