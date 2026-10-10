import React, { useState } from 'react';
import { DATA_SOURCES } from '../../data/mockSources';
import { DataSourceStatus } from '../../types';
import { CheckCircle2, Database, RefreshCw, Server, Shield, Zap } from 'lucide-react';

export const SourceAdministration: React.FC = () => {
  const [sources, setSources] = useState<DataSourceStatus[]>(DATA_SOURCES);
  const [refreshing, setRefreshing] = useState(false);

  const handlePingAll = () => {
    setRefreshing(true);
    setTimeout(() => {
      setSources(
        sources.map((s) => ({
          ...s,
          latencyMs: Math.round(s.latencyMs * (0.9 + Math.random() * 0.2)),
          lastSync: new Date().toISOString()
        }))
      );
      setRefreshing(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-[#32C8B7]" />
            Scientific Data Source Administration
          </h1>
          <p className="text-xs text-[#A7B5C9] mt-1">
            Real-time status monitoring, SLA latency telemetry, and rate-limit governance for biomedical data adapters
          </p>
        </div>

        <button
          onClick={handlePingAll}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#37D6E6] text-[#070B14] font-semibold text-xs hover:bg-[#37D6E6]/90 transition-all shadow-md shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Ping All Data Adapters
        </button>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sources.map((src) => (
          <div
            key={src.sourceCode}
            className="glass-panel p-5 rounded-xl border border-white/10 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-sm font-display font-bold text-white leading-tight">
                  {src.name}
                </h2>
                <span className="text-[10px] text-[#64748B] block mt-0.5">
                  {src.provider}
                </span>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-mono text-[#32C8B7] bg-[#32C8B7]/15 px-2 py-0.5 rounded font-bold">
                <CheckCircle2 className="w-3 h-3" /> {src.status}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#070B14]/80 border border-white/5 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Latency:</span>
                <span className="text-[#37D6E6] font-bold">{src.latencyMs} ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Hourly Quota:</span>
                <span className="text-white">
                  {src.rateLimitUsed} / {src.rateLimitMax} reqs
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Last Handshake:</span>
                <span className="text-[#A7B5C9] text-[10px]">
                  {new Date(src.lastSync).toLocaleTimeString()}
                </span>
              </div>
            </div>

            <div className="text-[10px] text-[#64748B] font-mono border-t border-white/5 pt-2">
              License: {src.license}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
