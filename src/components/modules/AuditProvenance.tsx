import React, { useState } from 'react';
import { getStoredAuditLog } from '../../services/storageService';
import { AuditEvent } from '../../types';
import { CheckCircle2, Clock, Download, FileCheck, Shield, Terminal } from 'lucide-react';

export const AuditProvenance: React.FC = () => {
  const [logs] = useState<AuditEvent[]>(getStoredAuditLog());

  const handleExportAudit = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `DrugScope_Audit_Trail_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-[#32C8B7]" />
            Research Audit & Provenance Trail
          </h1>
          <p className="text-xs text-[#A7B5C9] mt-1">
            Tamper-evident record of data syncs, model resolutions, clinical reviews, and user inquiries
          </p>
        </div>

        <button
          onClick={handleExportAudit}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#172134] text-xs text-[#37D6E6] border border-[#37D6E6]/30 hover:bg-[#37D6E6]/10 transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Export Audit Log
        </button>
      </div>

      {/* Log Feed */}
      <div className="glass-panel p-6 rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="text-xs font-mono uppercase text-[#64748B] font-semibold">
            Chronological Audit Entries ({logs.length})
          </div>
          <span className="text-[10px] font-mono text-[#32C8B7] bg-[#32C8B7]/10 px-2 py-0.5 rounded">
            SHA-256 Provenance Active
          </span>
        </div>

        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-xl bg-[#070B14]/80 border border-white/5 space-y-2 hover:border-[#37D6E6]/30 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-bold text-white">{log.actor}</span>
                  <span className="text-[10px] text-[#A7B5C9] bg-white/5 px-2 py-0.5 rounded">
                    {log.role}
                  </span>
                  <span className="text-[#37D6E6] font-semibold">[{log.action}]</span>
                </div>

                <div className="flex items-center gap-2 font-mono text-[11px] text-[#64748B]">
                  <span>Mode: {log.datasetMode}</span>
                  <span>•</span>
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              </div>

              <div className="text-xs font-mono text-[#32C8B7]">
                Resource: {log.resource}
              </div>

              <p className="text-xs text-[#A7B5C9] font-mono leading-relaxed bg-[#101827]/60 p-2.5 rounded border border-white/5">
                {log.details}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
