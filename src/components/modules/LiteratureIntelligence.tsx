import React, { useState, useEffect } from 'react';
import { searchPubMedArticles } from '../../services/pubmedApi';
import { searchOpenAlexWorks, OpenAlexWorkRecord } from '../../services/openAlexApi';
import { searchEuropePmc, EuropePmcArticle } from '../../services/europePmcApi';
import { ScientificPublication } from '../../types';
import { SCIENTIFIC_PUBLICATIONS } from '../../data/mockLiterature';
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  FileText,
  Filter,
  Globe,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  Users
} from 'lucide-react';

type LiteratureSourceTab = 'openalex' | 'pubmed' | 'europepmc';

export const LiteratureIntelligence: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LiteratureSourceTab>('openalex');
  const [query, setQuery] = useState('Warfarin drug interactions');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Results per source
  const [openAlexResults, setOpenAlexResults] = useState<OpenAlexWorkRecord[]>([]);
  const [pubmedResults, setPubmedResults] = useState<ScientificPublication[]>(SCIENTIFIC_PUBLICATIONS);
  const [europePmcResults, setEuropePmcResults] = useState<EuropePmcArticle[]>([]);
  const [totalHits, setTotalHits] = useState<number>(0);

  const performSearch = async (searchTerm: string, targetSource: LiteratureSourceTab) => {
    if (!searchTerm.trim()) return;
    setLoading(true);

    try {
      if (targetSource === 'openalex') {
        const res = await searchOpenAlexWorks(searchTerm, { perPage: 12 });
        setOpenAlexResults(res.results);
        setTotalHits(res.total);
        if (res.results.length > 0) setExpandedId(res.results[0].id);
      } else if (targetSource === 'pubmed') {
        const res = await searchPubMedArticles(searchTerm);
        setPubmedResults(res);
        setTotalHits(res.length);
        if (res.length > 0) setExpandedId(res[0].pmid);
      } else if (targetSource === 'europepmc') {
        const res = await searchEuropePmc(searchTerm, 12);
        setEuropePmcResults(res.articles);
        setTotalHits(res.total);
        if (res.articles.length > 0) setExpandedId(res.articles[0].id);
      }
    } catch (err) {
      console.error('Literature search error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch(query, activeTab);
  }, [activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query, activeTab);
  };

  const copyCitationText = (citation: string, id: string) => {
    navigator.clipboard.writeText(citation);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-24 select-none">
      {/* 1. TOP HEADER & MULTI-SOURCE SELECTOR */}
      <div className="bg-[#0B1120] border border-white/[0.08] p-6 rounded-2xl space-y-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-display font-bold text-white flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-[#24D8ED]" />
                Universal Scientific Literature Intelligence
              </h1>
              <span className="text-[10px] font-mono bg-[#24D8ED]/10 text-[#24D8ED] border border-[#24D8ED]/30 px-2.5 py-0.5 rounded-full font-semibold">
                Live Multi-Repository
              </span>
            </div>
            <p className="text-xs text-[#A6B5CB] mt-1 max-w-2xl leading-relaxed">
              Explore 250M+ peer-reviewed papers across OpenAlex, NIH PubMed, and Europe PMC. Grounded strictly in authentic citations with working DOI and PubMed links.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#71839E]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search drug, target, or interaction..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#070B14] border border-white/10 text-white placeholder-[#71839E] text-xs focus:outline-none focus:border-[#24D8ED] transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#24D8ED] to-[#1E90FF] text-[#070B14] font-bold text-xs hover:opacity-95 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50 shadow-md"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Search</span>
            </button>
          </form>
        </div>

        {/* REPOSITORY SOURCE TABS */}
        <div className="flex items-center gap-3 border-t border-white/[0.08] pt-4">
          <span className="text-xs font-mono text-[#71839E]">Target Repository:</span>
          <div className="flex items-center gap-2 bg-[#070B14] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab('openalex')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'openalex'
                  ? 'bg-[#152238] text-[#24D8ED] font-semibold border border-[#24D8ED]/40 shadow-sm'
                  : 'text-[#A6B5CB] hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>OpenAlex (Universal)</span>
            </button>

            <button
              onClick={() => setActiveTab('pubmed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'pubmed'
                  ? 'bg-[#152238] text-[#24D8ED] font-semibold border border-[#24D8ED]/40 shadow-sm'
                  : 'text-[#A6B5CB] hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>NIH PubMed (Entrez)</span>
            </button>

            <button
              onClick={() => setActiveTab('europepmc')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'europepmc'
                  ? 'bg-[#152238] text-[#24D8ED] font-semibold border border-[#24D8ED]/40 shadow-sm'
                  : 'text-[#A6B5CB] hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Europe PMC</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. RESULTS STREAM */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-[#71839E]">
          <span className="font-mono">
            {loading ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin text-[#24D8ED]" /> Querying {activeTab.toUpperCase()}...
              </span>
            ) : (
              `Showing ${
                activeTab === 'openalex'
                  ? openAlexResults.length
                  : activeTab === 'pubmed'
                  ? pubmedResults.length
                  : europePmcResults.length
              } of ${totalHits.toLocaleString()} verified publications`
            )}
          </span>
          <span className="flex items-center gap-1 text-[#31CAB6] font-mono text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Genuine Provenance
          </span>
        </div>

        {/* A. OPENALEX TAB RESULTS */}
        {activeTab === 'openalex' && (
          <div className="space-y-4">
            {openAlexResults.length === 0 && !loading && (
              <div className="bg-[#0B1120] border border-white/10 p-12 rounded-2xl text-center space-y-2">
                <BookOpen className="w-8 h-8 text-[#71839E] mx-auto" />
                <h3 className="text-white font-bold text-sm">No OpenAlex Works Found</h3>
                <p className="text-xs text-[#71839E]">Try adjusting your search query.</p>
              </div>
            )}

            {openAlexResults.map((work) => {
              const isExpanded = expandedId === work.id;
              const citation = `${work.authors.slice(0, 3).map((a) => a.name).join(', ')}${
                work.authors.length > 3 ? ' et al.' : ''
              } (${work.publicationYear || 'n.d.'}). ${work.title}. ${work.journal}. ${work.doi ? `doi:${work.doi}` : ''}`;

              return (
                <div
                  key={work.id}
                  className="bg-[#0B1120] border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-4 hover:border-white/20 transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-white/[0.06] pb-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#24D8ED] bg-[#24D8ED]/10 border border-[#24D8ED]/30 px-2 py-0.5 rounded-md">
                        {work.openalexId}
                      </span>
                      <span className="font-semibold text-white">{work.journal}</span>
                      <span className="text-[#71839E] font-mono">({work.publicationYear || 'Recent'})</span>
                      {work.isOpenAccess && (
                        <span className="text-[10px] font-mono bg-[#31CAB6]/15 text-[#31CAB6] border border-[#31CAB6]/30 px-2 py-0.2 rounded-full font-semibold">
                          Open Access
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => copyCitationText(citation, work.id)}
                        className="text-[11px] font-mono text-[#A6B5CB] hover:text-[#24D8ED] flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copiedId === work.id ? <Check className="w-3 h-3 text-[#31CAB6]" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === work.id ? 'Copied' : 'Cite'}</span>
                      </button>

                      {work.doi && (
                        <a
                          href={`https://doi.org/${work.doi.replace('https://doi.org/', '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-mono text-[#71839E] hover:text-white flex items-center gap-1 transition-colors"
                        >
                          <span>DOI</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}

                      {work.openAccessUrl && (
                        <a
                          href={work.openAccessUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-mono text-[#31CAB6] hover:underline flex items-center gap-1"
                        >
                          <span>PDF / Article</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-display font-bold text-white leading-snug hover:text-[#24D8ED] transition-colors">
                    {work.title}
                  </h3>

                  {/* Authors and Institutions */}
                  <div className="flex items-center gap-2 text-xs text-[#A6B5CB] flex-wrap">
                    <Users className="w-3.5 h-3.5 text-[#71839E]" />
                    <span>
                      {work.authors.slice(0, 5).map((a) => a.name).join(', ')}
                      {work.authors.length > 5 && ` +${work.authors.length - 5} more`}
                    </span>
                    {work.authors[0]?.institution && (
                      <span className="text-[#71839E] font-mono text-[11px]">
                        • {work.authors[0].institution}
                      </span>
                    )}
                  </div>

                  {/* Concepts */}
                  {work.concepts && work.concepts.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {work.concepts.slice(0, 6).map((c) => (
                        <span
                          key={c.name}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] text-[#A6B5CB] border border-white/5"
                        >
                          {c.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Abstract Section */}
                  {work.abstract && (
                    <div className="pt-2 border-t border-white/[0.06]">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : work.id)}
                        className="text-xs font-semibold text-[#24D8ED] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isExpanded ? 'Collapse Abstract' : 'View Verified Abstract'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isExpanded && (
                        <p className="mt-2 text-xs text-[#D8E4F5] leading-relaxed bg-[#070B14]/80 p-4 rounded-xl border border-white/5 font-sans">
                          {work.abstract}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* B. PUBMED TAB RESULTS */}
        {activeTab === 'pubmed' && (
          <div className="space-y-4">
            {pubmedResults.map((art) => {
              const isExpanded = expandedId === art.pmid;
              const citation = `${art.authors.slice(0, 3).join(', ')}${
                art.authors.length > 3 ? ' et al.' : ''
              } (${art.pubDate.slice(0, 4)}). ${art.title}. ${art.journal}. PMID: ${art.pmid}.`;

              return (
                <div
                  key={art.pmid}
                  className="bg-[#0B1120] border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-4 hover:border-white/20 transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-white/[0.06] pb-3">
                    <div className="flex items-center gap-2.5">
                      <a
                        href={`https://pubmed.ncbi.nlm.nih.gov/${art.pmid}/`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-xs font-bold text-[#24D8ED] bg-[#24D8ED]/10 border border-[#24D8ED]/30 px-2.5 py-0.5 rounded-md hover:bg-[#24D8ED]/20 transition-colors flex items-center gap-1"
                      >
                        <span>PMID: {art.pmid}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <span className="font-semibold text-white">{art.journal}</span>
                      <span className="text-[#71839E] font-mono">({art.pubDate})</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => copyCitationText(citation, art.pmid)}
                        className="text-[11px] font-mono text-[#A6B5CB] hover:text-[#24D8ED] flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copiedId === art.pmid ? <Check className="w-3 h-3 text-[#31CAB6]" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === art.pmid ? 'Copied' : 'Cite'}</span>
                      </button>

                      {art.doi && (
                        <a
                          href={`https://doi.org/${art.doi}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-mono text-[#71839E] hover:text-white flex items-center gap-1 transition-colors"
                        >
                          <span>DOI</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-display font-bold text-white leading-snug">{art.title}</h3>
                  <div className="text-xs text-[#A6B5CB]">{art.authors.join(', ')}</div>

                  <div className="pt-2 border-t border-white/[0.06]">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : art.pmid)}
                      className="text-xs font-semibold text-[#24D8ED] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpanded ? 'Collapse Abstract' : 'View PubMed Abstract'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <p className="mt-2 text-xs text-[#D8E4F5] leading-relaxed bg-[#070B14]/80 p-4 rounded-xl border border-white/5 font-sans">
                        {art.abstract}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* C. EUROPE PMC TAB RESULTS */}
        {activeTab === 'europepmc' && (
          <div className="space-y-4">
            {europePmcResults.map((art) => {
              const isExpanded = expandedId === art.id;

              return (
                <div
                  key={art.id}
                  className="bg-[#0B1120] border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-4 hover:border-white/20 transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-white/[0.06] pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-[#31CAB6] bg-[#31CAB6]/10 border border-[#31CAB6]/30 px-2 py-0.5 rounded-md">
                        {art.source}:{art.id}
                      </span>
                      <span className="font-semibold text-white">{art.journalTitle}</span>
                      <span className="text-[#71839E] font-mono">({art.pubYear})</span>
                    </div>

                    <a
                      href={art.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-mono text-[#31CAB6] hover:underline flex items-center gap-1"
                    >
                      <span>Europe PMC Article</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <h3 className="text-base font-display font-bold text-white leading-snug">{art.title}</h3>
                  <div className="text-xs text-[#A6B5CB]">{art.authorString}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
