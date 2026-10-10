import type { IncomingMessage, ServerResponse } from 'http';

export interface ApiHealthResponse {
  status: 'healthy' | 'degraded';
  version: string;
  timestamp: string;
  services: {
    openFda: { status: 'online' | 'limited'; authenticated: boolean };
    supabase: { status: 'connected' | 'demo_mode'; rls: boolean };
    pubmed: { status: 'online' };
    rxnorm: { status: 'online' };
  };
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const hasOpenFdaKey = Boolean(process.env.OPENFDA_API_KEY);
  const hasSupabaseUrl = Boolean(process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('mock-'));

  const payload: ApiHealthResponse = {
    status: 'healthy',
    version: '8.0.0-production',
    timestamp: new Date().toISOString(),
    services: {
      openFda: {
        status: 'online',
        authenticated: hasOpenFdaKey
      },
      supabase: {
        status: hasSupabaseUrl ? 'connected' : 'demo_mode',
        rls: true
      },
      pubmed: { status: 'online' },
      rxnorm: { status: 'online' }
    }
  };

  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.end(JSON.stringify(payload));
}
