export interface OpenAlexAuthor {
  name: string;
  orcid?: string | null;
  institution?: string | null;
  country?: string | null;
}

export interface OpenAlexConcept {
  name: string;
  score?: number;
}

export interface OpenAlexWorkRecord {
  id: string;
  openalexId: string;
  doi?: string | null;
  title: string;
  abstract?: string | null;
  journal: string;
  publicationYear?: number | null;
  publicationDate?: string | null;
  citationCount: number;
  isOpenAccess: boolean;
  openAccessUrl?: string | null;
  authors: OpenAlexAuthor[];
  concepts: OpenAlexConcept[];
  sourceUrl: string;
}

export interface OpenAlexSearchResponse {
  success: boolean;
  source: string;
  total: number;
  page: number;
  perPage: number;
  hasApiKey: boolean;
  results: OpenAlexWorkRecord[];
}

export async function searchOpenAlexWorks(
  query: string,
  options?: {
    filter?: string;
    sort?: string;
    page?: number;
    perPage?: number;
  }
): Promise<OpenAlexSearchResponse> {
  const params = new URLSearchParams();
  if (query.trim()) params.append('q', query.trim());
  if (options?.filter) params.append('filter', options.filter);
  if (options?.sort) params.append('sort', options.sort);
  if (options?.page) params.append('page', String(options.page));
  if (options?.perPage) params.append('per_page', String(options.perPage));

  const res = await fetch(`/api/openalex?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`OpenAlex query failed with status ${res.status}`);
  }
  return res.json();
}

export async function getOpenAlexWorkById(workId: string): Promise<OpenAlexWorkRecord | null> {
  const res = await fetch(`/api/openalex?id=${encodeURIComponent(workId)}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.work || null;
}
