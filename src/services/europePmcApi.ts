export interface EuropePmcArticle {
  id: string;
  source: string;
  pmid?: string;
  pmcid?: string;
  doi?: string;
  title: string;
  authorString: string;
  journalTitle: string;
  pubYear: string;
  isOpenAccess: boolean;
  citedByCount: number;
  sourceUrl: string;
}

export async function searchEuropePmc(
  query: string,
  pageSize: number = 8
): Promise<{ total: number; articles: EuropePmcArticle[] }> {
  const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(
    query
  )}&format=json&pageSize=${pageSize}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return { total: 0, articles: [] };

    const data = await res.json();
    const rawList = data.resultList?.result || [];

    const articles: EuropePmcArticle[] = rawList.map((item: any) => ({
      id: item.id,
      source: item.source || 'MED',
      pmid: item.pmid,
      pmcid: item.pmcid,
      doi: item.doi,
      title: item.title?.replace(/<[^>]+>/g, '') || 'Untitled Article',
      authorString: item.authorString || 'Authors not listed',
      journalTitle: item.journalTitle || 'Biomedical Journal',
      pubYear: item.pubYear || 'Recent',
      isOpenAccess: item.isOpenAccess === 'Y',
      citedByCount: item.citedByCount || 0,
      sourceUrl: item.doi ? `https://doi.org/${item.doi}` : `https://europepmc.org/article/${item.source}/${item.id}`
    }));

    return {
      total: data.hitCount || articles.length,
      articles
    };
  } catch (err) {
    return { total: 0, articles: [] };
  }
}
