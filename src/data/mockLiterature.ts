import { ScientificPublication } from '../types';

export const SCIENTIFIC_PUBLICATIONS: ScientificPublication[] = [
  {
    pmid: '20925534',
    title: 'Clopidogrel with or without omeprazole in coronary artery disease (COGENT trial)',
    authors: ['Bhatt DL', 'Cryer BL', 'Contant CF', 'Cohen M', 'Lanas A', 'Schnitzer TJ'],
    journal: 'New England Journal of Medicine',
    pubDate: '2010-11-11',
    doi: '10.1056/NEJMoa1007964',
    abstract: 'In patients receiving dual antiplatelet therapy with aspirin and clopidogrel, the prophylactic use of a proton-pump inhibitor (omeprazole) reduced the rate of upper gastrointestinal bleeding without a demonstrable increase in the risk of cardiovascular events, although competitive CYP2C19 inhibition was chemically confirmed.',
    meshTerms: ['Platelet Aggregation Inhibitors', 'Proton Pump Inhibitors', 'Cytochrome P-450 CYP2C19', 'Hemorrhage Prevention'],
    relevanceScore: 98,
    linkedDrug: 'Clopidogrel Bisulfate'
  },
  {
    pmid: '12358572',
    title: 'Clinical pharmacokinetics of amiodarone and warfarin interactions: a quantitative review',
    authors: ['Sanoski CA', 'Bauman JL'],
    journal: 'Clinical Pharmacokinetics',
    pubDate: '2002-10-01',
    doi: '10.2165/00003088-200241130-00003',
    abstract: 'Amiodarone inhibits the metabolic clearance of both S- and R-warfarin via Cytochrome P450 2C9 and 3A4. A dosage reduction of warfarin by 35% to 50% is required to prevent profound hypoprothrombinemia, with peak potentiation observed within 1 to 2 weeks and persistence for months following amiodarone discontinuation.',
    meshTerms: ['Amiodarone / adverse effects', 'Warfarin / pharmacokinetics', 'Cytochrome P-450 Enzyme System', 'Drug Interactions'],
    relevanceScore: 95,
    linkedDrug: 'Warfarin Sodium'
  },
  {
    pmid: '15295048',
    title: 'Rates of hyperkalemia after publication of the Randomized Aldactone Evaluation Study',
    authors: ['Juurlink DN', 'Mamdani MM', 'Lee DS', 'Kopp A', 'Austin PC', 'Laupacis A'],
    journal: 'New England Journal of Medicine',
    pubDate: '2004-08-05',
    doi: '10.1056/NEJMoa040135',
    abstract: 'Publication of the RALES trial was associated with an abrupt increase in spironolactone prescribing for older heart failure patients concurrently receiving ACE inhibitors (lisinopril), accompanied by a dramatic, statistically significant increase in hyperkalemia-associated hospital admissions and associated in-hospital deaths.',
    meshTerms: ['Spironolactone / adverse effects', 'Angiotensin-Converting Enzyme Inhibitors', 'Hyperkalemia / epidemiology', 'Heart Failure'],
    relevanceScore: 94,
    linkedDrug: 'Lisinopril'
  },
  {
    pmid: '15784664',
    title: 'The Serotonin Syndrome: Etiology, Clinical Presentation, and Mechanistic Review',
    authors: ['Boyer EW', 'Shannon M'],
    journal: 'New England Journal of Medicine',
    pubDate: '2005-03-17',
    doi: '10.1056/NEJMra041867',
    abstract: 'Serotonin syndrome is a potentially life-threatening condition caused by excessive serotonergic agonism in central and peripheral nervous system receptors. The co-prescription of selective serotonin reuptake inhibitors with non-monoamine reuptake inhibitors such as tramadol precipitates acute hyperthermia, hyperreflexia, and autonomic instability.',
    meshTerms: ['Serotonin Syndrome / diagnosis', 'Serotonin Uptake Inhibitors', 'Tramadol', 'Fluoxetine'],
    relevanceScore: 92,
    linkedDrug: 'Fluoxetine Hydrochloride'
  },
  {
    pmid: '18650507',
    title: 'SLCO1B1 variants and statin-induced myopathy: a genomewide study',
    authors: ['SEARCH Collaborative Group', 'Link E', 'Parish S', 'Armitage J', 'Bowman L'],
    journal: 'New England Journal of Medicine',
    pubDate: '2008-08-21',
    doi: '10.1056/NEJMoa0801536',
    abstract: 'Genomewide association demonstrated common variants in the SLCO1B1 gene are strongly associated with an increased risk of simvastatin-induced myopathy. Concomitant administration of potent CYP3A4 inhibitors (amiodarone, clarithromycin) exacerbates this genetic susceptibility by compounding intracellular drug accumulation.',
    meshTerms: ['Simvastatin / toxicity', 'Organic Anion Transporters', 'Pharmacogenetics', 'Rhabdomyolysis'],
    relevanceScore: 91,
    linkedDrug: 'Simvastatin'
  }
];
