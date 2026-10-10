import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient';
import {
  runBulkScientificIngestion,
  subscribeToIngestionProgress,
  fetchIngestionHistory,
  IngestionJob
} from '../../services/bulkIngestionEngine';
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
  Zap,
  Play,
  Loader2,
  Check,
  AlertCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

interface DbMetrics {
  drugs: number;
  labels: number;
  targets: number;
  structures: number;
  claims: number;
  sessions: number;
  compounds: number;
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
    compounds: 0,
    lastChecked: new Date().toISOString()
  });

  const [sources, setSources] = useState<EvidenceSourceRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Ingestion state
  const [activeJob, setActiveJob] = useState<IngestionJob | null>(null);
  const [isIngesting, setIsIngesting] = useState<boolean>(false);
  const [selectedSourceToSync, setSelectedSourceToSync] = useState<'all' | 'openalex' | 'openfda' | 'pubchem' | 'pubmed'>('all');
  const [syncHistory, setSyncHistory] = useState<Array<{ id: string; sourceCode: string; recordsProcessed: number; status: string; executedAt: string }>>([]);

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
        { count: compoundCount },
        { data: sourcesData },
        historyData
      ] = await Promise.all([
        supabase.from('drugs').select('*', { count: 'exact', head: true }),
        supabase.from('drug_labels').select('*', { count: 'exact', head: true }),
        supabase.from('biological_targets').select('*', { count: 'exact', head: true }),
        supabase.from('protein_structures').select('*', { count: 'exact', head: true }),
        supabase.from('scientific_claims').select('*', { count: 'exact', head: true }),
        supabase.from('analysis_sessions').select('*', { count: 'exact', head: true }),
        supabase.from('compounds').select('*', { count: 'exact', head: true }),
        supabase.from('evidence_sources').select('*'),
        fetchIngestionHistory()
      ]);

      setMetrics({
        drugs: drugCount || 0,
        labels: labelCount || 0,
        targets: targetCount || 0,
        structures: structCount || 0,
        claims: claimCount || 0,
        sessions: sessionCount || 0,
        compounds: compoundCount || 0,
        lastChecked: new Date().toISOString()
      });

      if (sourcesData && sourcesData.length > 0) {
        setSources(sourcesData);
      }
      setSyncHistory(historyData);
    } catch (err) {
      console.error('Failed to query live PostgreSQL telemetry:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLiveTelemetry();

    // Subscribe to in-memory ingestion progress updates
    const unsubscribeProgress = subscribeToIngestionProgress((job) => {
      setActiveJob(job);
      if (job.status === 'IN_PROGRESS') {
        setIsIngesting(true);
      } else {
        setIsIngesting(false);
        loadLiveTelemetry();
      }
    });

    // Supabase Realtime channel subscription on source_sync_jobs
    const channel = supabase
      .channel('source-sync-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'source_sync_jobs' }, () => {
        loadLiveTelemetry();
      })
      .subscribe();

    return () => {
      unsubscribeProgress();
      supabase.removeChannel(channel);
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadLiveTelemetry();
  };

  const handleTriggerIngestion = async () => {
    if (isIngesting) return;
    setIsIngesting(true);
    try {
      await runBulkScientificIngestion(selectedSourceToSync);
    } catch (e) {
      console.error('Ingestion failed:', e);
    } finally {
      setIsIngesting(false);
      loadLiveTelemetry();
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-24 select-none">
      {/* 1. Header & Live Telemetry Controls */}
      <div className="bg-[#0B1120] border border-white/[0.08] p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#24D8ED]/15 border border-[#24D8ED]/30 flex items-center justify-center">
              <Database className="w-4 h-4 text-[#24D8ED]" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Data Pipeline & Source Administration
            </h1>
          </div>
          <p className="text-xs text-[#A6B5CB] mt-1.5 max-w-2xl leading-relaxed">
            Live PostgreSQL repository metrics, authentic NIH/FDA/OpenAlex adapter telemetry, bulk ingestion engine, and data provenance audit trail.
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

      {/* 2. LIVE BULK INGESTION CONTROLLER (Phase 4 requirement) */}
      <div className="bg-[#0B1120] border border-white/[0.08] p-6 rounded-2xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
          <div>
            <h2 className="text-sm font-display font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#24D8ED]" />
              <span>Real-Time Bulk Ingestion Engine</span>
            </h2>
            <p className="text-xs text-[#71839E] mt-0.5">
              Streams verified scientific records from upstream APIs and writes deduplicated rows directly to PostgreSQL
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedSourceToSync}
              onChange={(e) => setSelectedSourceToSync(e.target.value as any)}
              disabled={isIngesting}
              className="bg-[#070B14] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#24D8ED]"
            >
              <option value="all">All Repositories (Unified)</option>
              <option value="openalex">OpenAlex (Research Works)</option>
              <option value="openfda">openFDA (Labels & FAERS)</option>
              <option value="pubchem">PubChem (Chemical Compounds)</option>
              <option value="pubmed">NIH PubMed (Clinical DDIs)</option>
            </select>

            <button
              onClick={handleTriggerIngestion}
              disabled={isIngesting}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#24D8ED] to-[#31CAB6] text-[#070B14] font-bold text-xs hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-[0_0_15px_rgba(36,216,237,0.25)]"
            >
              {isIngesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isIngesting ? 'Ingesting...' : 'Trigger Ingestion'}</span>
            </button>
          </div>
        </div>

        {/* Active Ingestion Progress Tracker */}
        {activeJob && (
          <div className="p-4 rounded-xl bg-[#070B14] border border-white/5 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#24D8ED] font-bold flex items-center gap-1.5">
                {activeJob.status === 'IN_PROGRESS' && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#24D8ED]" />}
                {activeJob.status === 'COMPLETED' && <CheckCircle2 className="w-3.5 h-3.5 text-[#31CAB6]" />}
                {activeJob.status === 'FAILED' && <AlertCircle className="w-3.5 h-3.5 text-[#F16D7B]" />}
                <span>{activeJob.sourceName} — Status: {activeJob.status}</span>
              </span>
              <span className="text-[#71839E]">
                {activeJob.processedCount} of {activeJob.totalExpected} regiments processed
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#24D8ED] to-[#31CAB6] transition-all duration-300 rounded-full"
                style={{
                  width: `${Math.min(100, (activeJob.processedCount / (activeJob.totalExpected || 1)) * 100)}%`
                }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#A6B5CB]">
              <span>{activeJob.currentStep}</span>
              <span className="text-emerald-400 font-bold">{activeJob.syncedRecords.length} records written to DB</span>
            </div>

            {/* Ingested Records Sample List */}
            {activeJob.syncedRecords.length > 0 && (
              <div className="max-h-32 overflow-y-auto space-y-1 pt-1 border-t border-white/5 text-[10px]">
                {activeJob.syncedRecords.slice(-5).map((rec, i) => (
                  <div key={i} className="flex items-center justify-between text-[#71839E]">
                    <span className="text-white truncate max-w-md">• {rec.title}</span>
                    <span className="text-[#24D8ED] shrink-0 font-bold">{rec.type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Database Inventory Metrics Grid */}
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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
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
            <span className="text-[11px] text-[#71839E] block">Chemical Compounds</span>
            <div className="text-2xl font-bold text-white font-mono mt-1">{metrics.compounds}</div>
            <span className="text-[10px] text-[#31CAB6] font-mono mt-0.5 block">PubChem Synced</span>
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

      {/* 4. Upstream Scientific Evidence Adapters */}
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
                    <span className="text-[#24D8ED]">{src.source_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#71839E]">License:</span>
                    <span className="text-white">{src.license_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#71839E]">Base URL:</span>
                    <span className="text-[#A6B5CB] truncate max-w-[160px]">{src.base_url}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono text-[#71839E]">
                  Last Synced: {src.last_sync_at ? new Date(src.last_sync_at).toLocaleDateString() : 'Active API'}
                </span>
                <a
                  href={src.base_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#24D8ED] hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>Docs</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Recent Ingestion Jobs History (PostgreSQL source_sync_jobs table) */}
      <div className="bg-[#0B1120] border border-white/[0.08] p-6 rounded-2xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-display font-bold text-white uppercase tracking-wider font-mono">
            Recent Synchronization Executions
          </h2>
          <span className="text-[11px] font-mono text-[#71839E]">source_sync_jobs audit log</span>
        </div>

        {syncHistory.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#71839E]">
            No previous ingestion executions recorded in database. Trigger your first sync above.
          </div>
        ) : (
          <div className="divide-y divide-white/5 text-xs font-mono">
            {syncHistory.map((job) => (
              <div key={job.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#24D8ED]" />
                  <span className="text-white font-bold">{job.sourceCode}</span>
                </div>
                <div className="flex items-center gap-4 text-[#A6B5CB]">
                  <span>{job.recordsProcessed} records</span>
                  <span className="text-emerald-400 font-semibold">{job.status}</span>
                  <span className="text-[#71839E]">{new Date(job.executedAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
