import React, { useState } from 'react';
import { SCIENTIFIC_PUBLICATIONS } from '../../data/mockLiterature';
import { searchPubMedArticles } from '../../services/pubmedApi';
import { ScientificPublication } from '../../types';
import { BookOpen, ExternalLink, Loader2, Search, Sparkles } from 'lucide-react';

export const LiteratureIntelligence: React.FC = () => {
  const [query, setQuery] = useState('');
  const [articles, setArticles] = useState<ScientificPublication[]>(SCIENTIFIC_PUBLICATIONS);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await searchPubMedArticles(query.trim());
      setArticles(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#37D6E6]" />
            Scientific Literature Intelligence
          </h1>
          <p className="text-xs text-[#A7B5C9] mt-1">
            Real-time NCBI PubMed citations, peer-reviewed clinical trials, and pharmacokinetic mechanistic papers
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search PubMed (e.g. Warfarin CYP2C9)..."
            className="bg-[#070B14] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-[#64748B] w-64 focus:outline-none focus:border-[#37D6E6]/40"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-3.5 py-1.5 rounded-lg bg-[#37D6E6] text-[#070B14] font-semibold text-xs hover:bg-[#37D6E6]/90 transition-all flex items-center gap-1.5"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            Query PubMed
          </button>
        </form>
      </div>

      {/* Publications Stream */}
      <div className="space-y-4">
        {articles.map((art) => (
          <div
            key={art.pmid}
            className="glass-panel p-6 rounded-xl border border-white/10 space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#37D6E6] bg-[#37D6E6]/10 px-2 py-0.5 rounded">
                  PMID: {art.pmid}
                </span>
                <span className="text-xs text-[#32C8B7] font-medium">{art.journal}</span>
                <span className="text-xs text-[#64748B] font-mono">({art.pubDate})</span>
              </div>

              {art.doi && (
                <a
                  href={`https://doi.org/${art.doi}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-[#9079F7] hover:underline"
                >
                  <span>DOI: {art.doi}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <h2 className="text-base font-display font-bold text-white hover:text-[#37D6E6] transition-colors cursor-pointer">
              {art.title}
            </h2>

            <div className="text-xs text-[#A7B5C9] font-medium">
              Authors: {art.authors.join(', ')}
            </div>

            <p className="text-xs text-[#F4F7FB] leading-relaxed bg-[#070B14]/60 p-3.5 rounded-lg border border-white/5 font-mono">
              {art.abstract}
            </p>

            {/* MeSH Headings */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {art.meshTerms.map((m, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-mono bg-white/5 text-[#A7B5C9] px-2 py-0.5 rounded border border-white/5"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
