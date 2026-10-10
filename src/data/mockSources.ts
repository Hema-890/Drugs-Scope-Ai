import { DataSourceStatus } from '../types';

export const DATA_SOURCES: DataSourceStatus[] = [
  {
    sourceCode: 'rxnorm',
    name: 'RxNorm Clinical Drug Terminology',
    provider: 'U.S. National Library of Medicine (NLM / NIH)',
    status: 'Operational',
    latencyMs: 142,
    lastSync: '2026-10-10T08:00:00Z',
    rateLimitUsed: 840,
    rateLimitMax: 20000,
    license: 'UMLS Metathesaurus Open Access (Free with Attribution)'
  },
  {
    sourceCode: 'openfda_label',
    name: 'openFDA Structured Drug Labeling (SPL)',
    provider: 'U.S. Food and Drug Administration (FDA)',
    status: 'Operational',
    latencyMs: 185,
    lastSync: '2026-10-10T07:30:00Z',
    rateLimitUsed: 1420,
    rateLimitMax: 24000,
    license: 'Public Domain / Open Data'
  },
  {
    sourceCode: 'openfda_faers',
    name: 'openFDA Adverse Event Reporting System (FAERS)',
    provider: 'U.S. Food and Drug Administration (FDA)',
    status: 'Operational',
    latencyMs: 230,
    lastSync: '2026-10-09T23:00:00Z',
    rateLimitUsed: 2190,
    rateLimitMax: 24000,
    license: 'Public Domain / Open Data'
  },
  {
    sourceCode: 'rcsb_pdb',
    name: 'RCSB Protein Data Bank (3D Macromolecules)',
    provider: 'Worldwide Protein Data Bank (wwPDB)',
    status: 'Operational',
    latencyMs: 110,
    lastSync: '2026-10-10T06:45:00Z',
    rateLimitUsed: 620,
    rateLimitMax: 50000,
    license: 'CC0 1.0 Universal Public Domain'
  },
  {
    sourceCode: 'pubmed',
    name: 'PubMed Entrez E-utilities (Biomedical Citations)',
    provider: 'National Center for Biotechnology Information (NCBI / NLM)',
    status: 'Operational',
    latencyMs: 260,
    lastSync: '2026-10-10T09:15:00Z',
    rateLimitUsed: 1800,
    rateLimitMax: 30000,
    license: 'National Library of Medicine Open API'
  },
  {
    sourceCode: 'chembl',
    name: 'ChEMBL Bioactivity & Target Database',
    provider: 'European Bioinformatics Institute (EMBL-EBI)',
    status: 'Operational',
    latencyMs: 310,
    lastSync: '2026-10-08T18:00:00Z',
    rateLimitUsed: 490,
    rateLimitMax: 10000,
    license: 'Creative Commons Attribution-ShareAlike 3.0 Unported'
  }
];
