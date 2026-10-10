import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface SyncJobRecord {
  id: string;
  source_name: string;
  job_type: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  total_records: number;
  processed_records: number;
  successful_records: number;
  failed_records: number;
  error_summary?: string;
  started_at: string;
  finished_at?: string;
  metadata?: any;
}

export interface RealtimeAnalysisSessionRecord {
  id: string;
  session_id: string;
  title: string;
  drug_names: string[];
  findings_count: number;
  highest_severity: string;
  created_at: string;
}

/**
 * React hook to subscribe to live PostgreSQL sync job changes via Supabase Realtime
 */
export function useRealtimeSyncJobs(initialLimit = 10) {
  const [jobs, setJobs] = useState<SyncJobRecord[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toISOString());

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    // 1. Fetch initial records
    const fetchInitial = async () => {
      try {
        const { data, error } = await supabase
          .from('source_sync_jobs')
          .select('*')
          .order('started_at', { ascending: false })
          .limit(initialLimit);

        if (!error && data) {
          setJobs(data as SyncJobRecord[]);
          if (data.length > 0) {
            setLastSyncTime(data[0].started_at || new Date().toISOString());
          }
        }
      } catch {
        // Fallback to local state if offline
      }
    };

    fetchInitial();

    // 2. Set up Supabase Realtime Channel
    try {
      channel = supabase
        .channel('realtime:source_sync_jobs')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'source_sync_jobs' },
          (payload) => {
            setLastSyncTime(new Date().toISOString());
            if (payload.eventType === 'INSERT') {
              setJobs((prev) => [payload.new as SyncJobRecord, ...prev.slice(0, initialLimit - 1)]);
            } else if (payload.eventType === 'UPDATE') {
              setJobs((prev) =>
                prev.map((job) => (job.id === (payload.new as any).id ? (payload.new as SyncJobRecord) : job))
              );
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
          } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
            setIsConnected(false);
          }
        });
    } catch {
      setIsConnected(false);
    }

    // 3. Cleanup on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [initialLimit]);

  return { jobs, isConnected, lastSyncTime };
}

/**
 * React hook to subscribe to live PostgreSQL analysis sessions via Supabase Realtime
 */
export function useRealtimeAnalysisSessions(initialLimit = 10) {
  const [sessions, setSessions] = useState<RealtimeAnalysisSessionRecord[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    const fetchInitial = async () => {
      try {
        const { data, error } = await supabase
          .from('analysis_sessions')
          .select('id, session_id, title, drug_names, findings_count, highest_severity, created_at')
          .order('created_at', { ascending: false })
          .limit(initialLimit);

        if (!error && data) {
          setSessions(data as RealtimeAnalysisSessionRecord[]);
        }
      } catch {
        // Continue
      }
    };

    fetchInitial();

    try {
      channel = supabase
        .channel('realtime:analysis_sessions')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'analysis_sessions' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setSessions((prev) => [payload.new as RealtimeAnalysisSessionRecord, ...prev.slice(0, initialLimit - 1)]);
            } else if (payload.eventType === 'UPDATE') {
              setSessions((prev) =>
                prev.map((s) => (s.id === (payload.new as any).id ? (payload.new as RealtimeAnalysisSessionRecord) : s))
              );
            }
          }
        )
        .subscribe((status) => {
          setIsConnected(status === 'SUBSCRIBED');
        });
    } catch {
      setIsConnected(false);
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [initialLimit]);

  return { sessions, isConnected };
}
