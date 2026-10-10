export interface UniProtTargetInfo {
  accession: string;
  id: string;
  proteinName: string;
  geneName: string;
  organism: string;
  functionSummary?: string;
  sequenceLength?: number;
  sourceUrl: string;
}

export async function fetchUniProtTarget(geneSymbolOrTarget: string): Promise<UniProtTargetInfo | null> {
  const query = encodeURIComponent(`gene:${geneSymbolOrTarget.trim()} AND organism_id:9606`);
  const url = `https://rest.uniprot.org/uniprotkb/search?query=${query}&size=1&format=json`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const data = await res.json();
    const entry = data.results?.[0];
    if (!entry) return null;

    const proteinName =
      entry.proteinDescription?.recommendedName?.fullName?.value ||
      entry.proteinDescription?.submissionNames?.[0]?.fullName?.value ||
      geneSymbolOrTarget;

    const geneName = entry.genes?.[0]?.geneName?.value || geneSymbolOrTarget;
    const organism = entry.organism?.scientificName || 'Homo sapiens';
    const functionComment = entry.comments?.find((c: any) => c.commentType === 'FUNCTION');
    const functionSummary = functionComment?.texts?.[0]?.value || undefined;
    const sequenceLength = entry.sequence?.length || undefined;

    return {
      accession: entry.primaryAccession,
      id: entry.uniProtkbId,
      proteinName,
      geneName,
      organism,
      functionSummary,
      sequenceLength,
      sourceUrl: `https://www.uniprot.org/uniprotkb/${entry.primaryAccession}/entry`
    };
  } catch (err) {
    return null;
  }
}
