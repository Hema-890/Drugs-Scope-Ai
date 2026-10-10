import type { IncomingMessage, ServerResponse } from 'http';

interface OpenAlexWork {
  id: string;
  doi?: string;
  title: string;
  display_name?: string;
  publication_year?: number;
  publication_date?: string;
  cited_by_count?: number;
  primary_location?: {
    source?: {
      display_name?: string;
      issn_l?: string;
      type?: string;
    };
    landing_page_url?: string;
    pdf_url?: string;
    is_oa?: boolean;
  };
  open_access?: {
    is_oa?: boolean;
    oa_status?: string;
    oa_url?: string;
  };
  authorships?: Array<{
    author?: {
      id?: string;
      display_name?: string;
      orcid?: string;
    };
    institutions?: Array<{
      id?: string;
      display_name?: string;
      country_code?: string;
    }>;
  }>;
  abstract_inverted_index?: Record<string, number[]>;
  concepts?: Array<{
    id?: string;
    display_name?: string;
    score?: number;
    level?: number;
  }>;
}

function reconstructAbstract(invertedIndex?: Record<string, number[]>): string | null {
  if (!invertedIndex || typeof invertedIndex !== 'object') return null;
  const entries: [string, number][] = [];
  for (const [word, positions] of Object.entries(invertedIndex)) {
    if (Array.isArray(positions)) {
      for (const pos of positions) {
        entries.push([word, pos]);
      }
    }
  }
  if (entries.length === 0) return null;
  entries.sort((a, b) => a[1] - b[1]);
  return entries.map((e) => e[0]).join(' ');
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const urlObj = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
  const query = urlObj.searchParams.get('q') || urlObj.searchParams.get('search') || '';
  const filter = urlObj.searchParams.get('filter') || '';
  const sort = urlObj.searchParams.get('sort') || 'cited_by_count:desc';
  const page = Math.max(1, parseInt(urlObj.searchParams.get('page') || '1', 10));
  const perPage = Math.min(25, Math.max(1, parseInt(urlObj.searchParams.get('per_page') || '10', 10)));
  const workId = urlObj.searchParams.get('id') || '';

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const apiKey = process.env.OPENALEX_API_KEY?.trim();
  const mailto = 'research@drugscope.ai';

  try {
    let targetUrl = '';

    if (workId) {
      // Single work lookup
      const cleanId = workId.replace(/^https?:\/\/openalex\.org\//, '');
      targetUrl = `https://api.openalex.org/works/${encodeURIComponent(cleanId)}?`;
    } else {
      // Multi-work search
      const params = new URLSearchParams();
      if (query.trim()) params.append('search', query.trim());
      if (filter.trim()) params.append('filter', filter.trim());
      params.append('sort', sort);
      params.append('page', String(page));
      params.append('per_page', String(perPage));
      targetUrl = `https://api.openalex.org/works?${params.toString()}&`;
    }

    if (apiKey) {
      targetUrl += `api_key=${encodeURIComponent(apiKey)}`;
    } else {
      targetUrl += `mailto=${encodeURIComponent(mailto)}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const apiRes = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'DrugScopeAI/4.0 (Universal Biomedical Research Engine; mailto:research@drugscope.ai)'
      }
    });
    clearTimeout(timeout);

    if (!apiRes.ok) {
      res.statusCode = apiRes.status;
      res.end(
        JSON.stringify({
          error: `OpenAlex API responded with status ${apiRes.status}`,
          status: apiRes.status
        })
      );
      return;
    }

    const rawData = await apiRes.json();

    if (workId) {
      // Single record transformation
      const work: OpenAlexWork = rawData;
      const transformed = {
        id: work.id,
        openalexId: work.id?.replace('https://openalex.org/', ''),
        doi: work.doi || null,
        title: work.title || work.display_name || 'Untitled Research Record',
        abstract: reconstructAbstract(work.abstract_inverted_index),
        journal: work.primary_location?.source?.display_name || 'Academic Journal',
        publicationYear: work.publication_year || null,
        publicationDate: work.publication_date || null,
        citationCount: work.cited_by_count || 0,
        isOpenAccess: work.open_access?.is_oa || false,
        openAccessUrl: work.open_access?.oa_url || work.primary_location?.pdf_url || work.primary_location?.landing_page_url || null,
        authors: (work.authorships || []).map((a) => ({
          name: a.author?.display_name || 'Unknown Author',
          orcid: a.author?.orcid || null,
          institution: a.institutions?.[0]?.display_name || null,
          country: a.institutions?.[0]?.country_code || null
        })),
        concepts: (work.concepts || []).slice(0, 8).map((c) => ({
          name: c.display_name,
          score: c.score,
          level: c.level
        })),
        source: 'OpenAlex Universal Scientific Repository'
      };

      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, work: transformed }));
      return;
    }

    // List results transformation
    const works: OpenAlexWork[] = rawData.results || [];
    const formattedWorks = works.map((w) => ({
      id: w.id,
      openalexId: w.id?.replace('https://openalex.org/', ''),
      doi: w.doi || null,
      title: w.title || w.display_name || 'Untitled Research Record',
      abstract: reconstructAbstract(w.abstract_inverted_index),
      journal: w.primary_location?.source?.display_name || 'Peer-reviewed Journal',
      publicationYear: w.publication_year || null,
      publicationDate: w.publication_date || null,
      citationCount: w.cited_by_count || 0,
      isOpenAccess: w.open_access?.is_oa || false,
      openAccessUrl: w.open_access?.oa_url || w.primary_location?.pdf_url || w.primary_location?.landing_page_url || null,
      authors: (w.authorships || []).map((a) => ({
        name: a.author?.display_name || 'Unknown Author',
        orcid: a.author?.orcid || null,
        institution: a.institutions?.[0]?.display_name || null,
        country: a.institutions?.[0]?.country_code || null
      })),
      concepts: (w.concepts || []).slice(0, 6).map((c) => ({
        name: c.display_name,
        score: c.score
      })),
      sourceUrl: w.doi ? `https://doi.org/${w.doi.replace('https://doi.org/', '')}` : w.id
    }));

    res.statusCode = 200;
    res.end(
      JSON.stringify({
        success: true,
        source: 'OpenAlex (Universal Scientific Literature)',
        total: rawData.meta?.count || formattedWorks.length,
        page,
        perPage,
        hasApiKey: Boolean(apiKey),
        results: formattedWorks
      })
    );
  } catch (err: any) {
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        error: 'Failed to communicate with OpenAlex upstream API',
        message: err.message
      })
    );
  }
}
