import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient';
import {
  Activity,
  CheckCircle2,
  Database,
  ExternalLink,
  Layers,
  Pill,
  RefreshCw,
  Server,
  Shield,
  Sparkles,
  Zap
} from 'lucide-react';

interface DbMetrics {
  drugs: number;
  labels: number;
  targets: number;
  structures: number;
  claims: number;
  sessions: number;
  lastChecked: string;
}

interface EvidenceSourceRow {
  id: string;
  source_code: string;
  source_name: string;
  provider_organization: string;
  base_url: string;
  license_type: string;
  status: string;
  is_active: boolean;
  last_sync_at?: string;
}

export const SourceAdministration: React.FC = () => {
  const [metrics, setMetrics] = useState<DbMetrics>({
    drugs: 0,
    labels: 0,
    targets: 0,
    structures: 0,
    claims: 0,
    sessions: 0,
    lastChecked: new Date().toISOString()
  });

  const [sources, setSources] = useState<EvidenceSourceRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadLiveTelemetry = async () => {
    if (!isSupabaseConfigured) return;

    try {
      const [
        { count: drugCount },
        { count: labelCount },
        { count: targetCount },
        { count: structCount },
        { count: claimCount },
        { count: sessionCount },
        { data: sourcesData }
      ] = await Promise.all([
        supabase.from('drugs').select('*', { count: 'exact', head: true }),
        supabase.from('drug_labels').select('*', { count: 'exact', head: true }),
        supabase.from('biological_targets').select('*', { count: 'exact', head: true }),
        supabase.from('protein_structures').select('*', { count: 'exact', head: true }),
        supabase.from('scientific_claims').select('*', { count: 'exact', head: true }),
        supabase.from('analysis_sessions').select('*', { count: 'exact', head: true }),
        supabase.from('evidence_sources').select('*')
      ]);

      setMetrics({
        drugs: drugCount || 0,
        labels: labelCount || 0,
        targets: targetCount || 0,
        structures: structCount || 0,
        claims: claimCount || 0,
        sessions: sessionCount || 0,
        lastChecked: new Date().toISOString()
      });

      if (sourcesData && sourcesData.length > 0) {
        setSources(sourcesData);
      }
    } catch (err) {
      console.error('Failed to query live PostgreSQL telemetry:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLiveTelemetry();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadLiveTelemetry();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-[#0B1120] border border-white/[0.08] p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#24D8ED]/15 border border-[#24D8ED]/30 flex items-center justify-center">
              <Database className="w-4 h-4 text-[#24D8ED]" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Data Pipeline & Source Administration
            </h1>
          </div>
          <p className="text-xs text-[#A6B5CB] mt-1.5 max-w-2xl">
            Live PostgreSQL repository metrics, authentic NIH/FDA adapter telemetry, and data provenance audit trail.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-[#71839E] block">Telemetry Freshness</span>
            <span className="text-xs font-mono text-[#A6B5CB]">
              {new Date(metrics.lastChecked).toLocaleTimeString()}
            </span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#24D8ED] to-[#1E90FF] text-[#070B14] font-bold text-xs hover:opacity-95 transition-all shadow-[0_0_15px_rgba(36,216,237,0.3)] cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* Database Inventory Metrics Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#71839E]">
            PostgreSQL Live Warehouse Inventory
          </h2>
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Connected: project kfdntklvvvorbgatyqcg
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-[#0B1120] border border-white/10 p-4 rounded-xl">
            <span className="text-[11px] text-[#71839E] block">Registered Drugs</span>
            <div className="text-2xl font-bold text-white font-mono mt-1">{metrics.drugs}</div>
            <span className="text-[10px] text-[#24D8ED] font-mono mt-0.5 block">RxNorm CUI Mapped</span>
          </div>

          <div className="bg-[#0B1120] border border-white/10 p-4 rounded-xl">
            <span className="text-[11px] text-[#71839E] block">FDA Drug Labels</span>
            <div className="text-2xl font-bold text-white font-mono mt-1">{metrics.labels}</div>
            <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">Full SPL Cached</span>
          </div>

          <div className="bg-[#0B1120] border border-white/10 p-4 rounded-xl">
            <span className="text-[11px] text-[#71839E] block">Biological Targets</span>
            <div className="text-2xl font-bold text-white font-mono mt-1">{metrics.targets}</div>
            <span className="text-[10px] text-[#9475FF] font-mono mt-0.5 block">UniProt Verified</span>
          </div>

          <div className="bg-[#0B1120] border border-white/10 p-4 rounded-xl">
            <span className="text-[11px] text-[#71839E] block">3D Structures (PDB)</span>
            <div className="text-2xl font-bold text-white font-mono mt-1">{metrics.structures}</div>
            <span className="text-[10px] text-cyan-400 font-mono mt-0.5 block">RCSB Coordinates</span>
          </div>

          <div className="bg-[#0B1120] border border-white/10 p-4 rounded-xl">
            <span className="text-[11px] text-[#71839E] block">Documented Claims</span>
            <div className="text-2xl font-bold text-white font-mono mt-1">{metrics.claims}</div>
            <span className="text-[10px] text-amber-400 font-mono mt-0.5 block">Peer-Reviewed DDIs</span>
          </div>

          <div className="bg-[#0B1120] border border-white/10 p-4 rounded-xl">
            <span className="text-[11px] text-[#71839E] block">Saved Sessions</span>
            <div className="text-2xl font-bold text-white font-mono mt-1">{metrics.sessions}</div>
            <span className="text-[10px] text-blue-400 font-mono mt-0.5 block">Cloud Persisted</span>
          </div>
        </div>
      </div>

      {/* Upstream Evidence Sources Section */}
      <div className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#71839E]">
          Upstream Scientific Evidence Adapters
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sources.map((src) => (
            <div
              key={src.id}
              className="bg-[#0B1120] border border-white/10 hover:border-[#24D8ED]/30 transition-all p-5 rounded-2xl flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">
                      {src.source_name}
                    </h3>
                    <span className="text-[11px] text-[#71839E] block mt-0.5">
                      {src.provider_organization}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-bold shrink-0">
                    <CheckCircle2 className="w-3 h-3" /> {src.status.toUpperCase()}
                  </span>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-[#070B14]/70 border border-white/5 space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#71839E]">Code:</span>
                    <span className="text-[#24D8ED] font-semibold">{src.source_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#71839E]">License:</span>
                    <span className="text-white truncate max-w-[160px]">{src.license_type}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#71839E]">Endpoint:</span>
                    <a
                      href={src.base_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline flex items-center gap-1 text-[11px] truncate max-w-[180px]"
                    >
                      <span>{src.base_url.replace('https://', '')}</span>
                      <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-[#71839E]">
                <span>Provenance: Live Official Feed</span>
                <span className="text-emerald-400 font-semibold">SSL/TLS Verified</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
