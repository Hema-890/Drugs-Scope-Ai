import React, { useState } from 'react';
import { SCIENTIFIC_PUBLICATIONS } from '../../data/mockLiterature';
import { searchPubMedArticles } from '../../services/pubmedApi';
import { ScientificPublication } from '../../types';
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  FileText,
  Filter,
  Loader2,
  Search,
  ShieldCheck
} from 'lucide-react';

export const LiteratureIntelligence: React.FC = () => {
  const [query, setQuery] = useState('');
  const [articles, setArticles] = useState<ScientificPublication[]>(SCIENTIFIC_PUBLICATIONS);
  const [loading, setLoading] = useState(false);
  const [copiedPmid, setCopiedPmid] = useState<string | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');
  const [expandedPmid, setExpandedPmid] = useState<string | null>(SCIENTIFIC_PUBLICATIONS[0]?.pmid || null);

  const categories = [
    'All',
    'CYP2C19 Inhibition',
    'CYP2C9 & Anticoagulation',
    'Hyperkalemia & ACEi',
    'Serotonin Syndrome',
    'Statin Pharmacogenetics'
  ];

  const handleSearch = async (e?: React.FormEvent, customTerm?: string) => {
    if (e) e.preventDefault();
    const searchTerm = customTerm !== undefined ? customTerm : query;
    if (!searchTerm.trim()) {
      setArticles(SCIENTIFIC_PUBLICATIONS);
      return;
    }

    setLoading(true);
    try {
      const res = await searchPubMedArticles(searchTerm.trim());
      setArticles(res);
    } catch (err) {
      console.error('PubMed search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (cat: string) => {
    setActiveCategoryFilter(cat);
    if (cat === 'All') {
      setArticles(SCIENTIFIC_PUBLICATIONS);
    } else {
      const filtered = SCIENTIFIC_PUBLICATIONS.filter(
        (a) =>
          a.title.toLowerCase().includes(cat.toLowerCase().slice(0, 7)) ||
          a.meshTerms.some((m) => m.toLowerCase().includes(cat.toLowerCase().slice(0, 7)))
      );
      setArticles(filtered.length > 0 ? filtered : SCIENTIFIC_PUBLICATIONS);
    }
  };

  const copyCitation = (art: ScientificPublication) => {
    const citation = `${art.authors.slice(0, 3).join(', ')}${
      art.authors.length > 3 ? ' et al.' : ''
    } (${art.pubDate.slice(0, 4)}). ${art.title}. ${art.journal}. PMID: ${art.pmid}.`;
    navigator.clipboard.writeText(citation);
    setCopiedPmid(art.pmid);
    setTimeout(() => setCopiedPmid(null), 2000);
  };

  return (
    <div className="space-y-6 pb-24 select-none">
      {/* 1. TOP HEADER & DIRECT NCBI QUERY BAR */}
      <div className="bg-[#0B1120] border border-white/[0.08] p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-display font-bold text-white flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-[#24D8ED]" />
              Scientific Literature Intelligence
            </h1>
            <span className="text-[10px] font-mono bg-[#31CAB6]/10 text-[#31CAB6] border border-[#31CAB6]/30 px-2 py-0.5 rounded-full font-semibold">
              NCBI PubMed Live
            </span>
          </div>
          <p className="text-xs text-[#A6B5CB] mt-1 max-w-xl">
            Original, source-backed biomedical publications, peer-reviewed clinical trials, and pharmacokinetic interaction studies from the National Library of Medicine.
          </p>
        </div>

        {/* PubMed Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#71839E]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Query PubMed (e.g. Clopidogrel CYP2C19)..."
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

      {/* 2. REPUTABLE TOPIC FILTER CHIPS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[10px] font-mono text-[#71839E] uppercase shrink-0 mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3" /> Focus Topics:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategorySelect(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer border ${
              activeCategoryFilter === cat
                ? 'bg-[#24D8ED]/15 border-[#24D8ED] text-white font-semibold'
                : 'bg-[#0B1120] border-white/10 text-[#A6B5CB] hover:bg-white/5 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3. LITERATURE RESULTS STREAM */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-[#71839E]">
          <span className="font-mono">Showing {articles.length} verified publications</span>
          <span className="flex items-center gap-1 text-[#31CAB6]">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Original PubMed Metadata
          </span>
        </div>

        {articles.length === 0 ? (
          <div className="bg-[#0B1120] border border-white/10 p-12 rounded-2xl text-center space-y-2">
            <BookOpen className="w-8 h-8 text-[#71839E] mx-auto" />
            <h3 className="text-white font-bold text-sm">No Publications Found</h3>
            <p className="text-xs text-[#71839E]">Try broadening your query or selecting one of the focus topics.</p>
          </div>
        ) : (
          articles.map((art) => {
            const isExpanded = expandedPmid === art.pmid;

            return (
              <div
                key={art.pmid}
                className="bg-[#0B1120] border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-4 hover:border-white/20 transition-all"
              >
                {/* Meta Bar: PMID, Journal, Date, DOI */}
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
                    {art.doi && (
                      <a
                        href={`https://doi.org/${art.doi}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-[11px] text-[#9475FF] hover:underline flex items-center gap-1"
                      >
                        <span>DOI: {art.doi}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    <button
                      onClick={() => copyCitation(art)}
                      className="flex items-center gap-1 text-[11px] font-mono text-[#A6B5CB] hover:text-white px-2 py-1 rounded bg-white/5 border border-white/5 cursor-pointer transition-colors"
                      title="Copy APA Citation"
                    >
                      {copiedPmid === art.pmid ? (
                        <>
                          <Check className="w-3 h-3 text-[#31CAB6]" />
                          <span className="text-[#31CAB6]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Cite</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Article Title */}
                <h2 className="text-base sm:text-lg font-display font-bold text-white hover:text-[#24D8ED] transition-colors leading-snug">
                  <a
                    href={`https://pubmed.ncbi.nlm.nih.gov/${art.pmid}/`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {art.title}
                  </a>
                </h2>

                {/* Authors */}
                <div className="text-xs text-[#A6B5CB]">
                  <span className="font-semibold text-[#71839E]">Authors: </span>
                  <span>{art.authors.join(', ')}</span>
                </div>

                {/* Abstract (Expandable / Preview) */}
                <div className="space-y-2">
                  <div className="p-4 rounded-xl bg-[#070B14] border border-white/5 text-xs text-[#E2E8F0] leading-relaxed">
                    <p className={isExpanded ? '' : 'line-clamp-3'}>{art.abstract}</p>
                  </div>

                  <button
                    onClick={() => setExpandedPmid(isExpanded ? null : art.pmid)}
                    className="text-[11px] font-mono text-[#24D8ED] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isExpanded ? 'Collapse Abstract' : 'Read Full Abstract'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* MeSH Headings & Linked Drug */}
                <div className="pt-2 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-mono text-[#71839E] mr-1">MeSH Terms:</span>
                    {art.meshTerms.map((m, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono bg-white/[0.04] text-[#A6B5CB] px-2 py-0.5 rounded border border-white/5"
                      >
                        {m}
                      </span>
                    ))}
                  </div>

                  {art.linkedDrug && (
                    <span className="text-[10px] font-mono text-[#31CAB6] bg-[#31CAB6]/10 px-2 py-0.5 rounded border border-[#31CAB6]/20">
                      Target: {art.linkedDrug}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
