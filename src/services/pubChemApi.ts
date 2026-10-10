export interface PubChemCompoundProperties {
  cid: number;
  name: string;
  molecularFormula: string;
  molecularWeight: number;
  canonicalSmiles: string;
  iupacName?: string;
  inchiKey?: string;
  sourceUrl: string;
}

export async function fetchPubChemProperties(compoundName: string): Promise<PubChemCompoundProperties | null> {
  const cleanName = encodeURIComponent(compoundName.trim());
  const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${cleanName}/property/MolecularWeight,MolecularFormula,CanonicalSMILES,IUPACName,InChIKey/JSON`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const data = await res.json();
    const prop = data?.PropertyTable?.Properties?.[0];
    if (!prop) return null;

    return {
      cid: prop.CID,
      name: compoundName,
      molecularFormula: prop.MolecularFormula || '',
      molecularWeight: parseFloat(prop.MolecularWeight) || 0,
      canonicalSmiles: prop.CanonicalSMILES || '',
      iupacName: prop.IUPACName || undefined,
      inchiKey: prop.InChIKey || undefined,
      sourceUrl: `https://pubchem.ncbi.nlm.nih.gov/compound/${prop.CID}`
    };
  } catch (err) {
    return null;
  }
}

export function getPubChem2DImageUrl(cid: number): string {
  return `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/CID/${cid}/PNG?image_size=300x300`;
}
