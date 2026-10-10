import type { IncomingMessage, ServerResponse } from 'http';
import { createClient } from '@supabase/supabase-js';

// Lazy initialized server-side Supabase client for on-demand caching
function getAdminClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const urlObj = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
  const drug = urlObj.searchParams.get('drug') || urlObj.searchParams.get('q');

  res.setHeader('Content-Type', 'application/json');

  if (!drug || !drug.trim()) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'Missing required drug query parameter' }));
    return;
  }

  const cleanDrug = drug.trim().toLowerCase();
  const adminClient = getAdminClient();

  // 1. Check local PostgreSQL cache first
  if (adminClient) {
    try {
      const { data: dbDrug } = await adminClient
        .from('drugs')
        .select('id, generic_name, brand_names, rxnorm_cui, drug_class')
        .ilike('generic_name', `%${cleanDrug}%`)
        .limit(1)
        .maybeSingle();

      if (dbDrug) {
        const { data: dbLabel } = await adminClient
          .from('drug_labels')
          .select('*')
          .eq('drug_id', dbDrug.id)
          .single();

        if (dbLabel) {
          res.statusCode = 200;
          res.end(
            JSON.stringify({
              success: true,
              source: 'Supabase PostgreSQL Cache (Official openFDA SPL)',
              cachedInPostgres: true,
              provenanceTimestamp: dbLabel.created_at || new Date().toISOString(),
              genericName: dbDrug.generic_name,
              brandName: dbDrug.brand_names?.[0] || undefined,
              allBrandNames: dbDrug.brand_names,
              rxnormCui: dbDrug.rxnorm_cui,
              drugClass: dbDrug.drug_class,
              splSetId: dbLabel.set_id,
              version: dbLabel.version_id,
              boxedWarning: dbLabel.boxed_warnings,
              contraindications: dbLabel.contraindications,
              warningsAndPrecautions: dbLabel.warnings_and_precautions,
              drugInteractions: dbLabel.drug_interactions,
              mechanismOfAction: dbLabel.mechanism_of_action,
              pharmacokinetics: dbLabel.pharmacokinetics
            })
          );
          return;
        }
      }
    } catch (e) {
      // Proceed to live API retrieval
    }
  }

  // 2. Query upstream official openFDA API
  const apiKey = process.env.OPENFDA_API_KEY;
  const keyParam = apiKey ? `&api_key=${encodeURIComponent(apiKey)}` : '';

  try {
    const searchQuery = `(openfda.generic_name:"${cleanDrug}"+openfda.brand_name:"${cleanDrug}"+openfda.substance_name:"${cleanDrug}")`;
    const fdaUrl = `https://api.fda.gov/drug/label.json?search=${encodeURIComponent(
      searchQuery
    )}&limit=1${keyParam}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const fdaRes = await fetch(fdaUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (fdaRes.ok) {
      const data = await fdaRes.json();
      const item = data?.results?.[0];

      if (item) {
        const genericName = item.openfda?.generic_name?.[0] || drug;
        const brandNames = item.openfda?.brand_name || [];
        const splSetId = item.openfda?.spl_set_id?.[0] || item.id;
        const versionId = item.openfda?.version?.[0] || '1';
        const boxedWarning = item.boxed_warning?.[0];
        const contraindications = item.contraindications?.[0];
        const warningsAndPrecautions = item.warnings_and_precautions?.[0] || item.warnings?.[0];
        const drugInteractions = item.drug_interactions?.[0];
        const mechanismOfAction = item.mechanism_of_action?.[0] || item.clinical_pharmacology?.[0];
        const pharmacokinetics = item.pharmacokinetics?.[0];

        // 3. Persist into PostgreSQL on-demand using privileged server-side admin client
        if (adminClient) {
          try {
            const { data: newDrug } = await adminClient
              .from('drugs')
              .upsert({
                generic_name: genericName,
                brand_names: brandNames,
                fda_approval_status: 'Approved'
              }, { onConflict: 'generic_name' })
              .select('id')
              .single();

            if (newDrug?.id) {
              await adminClient.from('drug_labels').insert({
                drug_id: newDrug.id,
                set_id: splSetId,
                version_id: versionId,
                boxed_warnings: boxedWarning,
                contraindications: contraindications,
                warnings_and_precautions: warningsAndPrecautions,
                drug_interactions: drugInteractions,
                mechanism_of_action: mechanismOfAction,
                pharmacokinetics: pharmacokinetics
              });
            }
          } catch (writeErr) {
            console.warn('PostgreSQL on-demand caching note:', (writeErr as any)?.message);
          }
        }

        res.statusCode = 200;
        res.end(
          JSON.stringify({
            success: true,
            source: apiKey ? 'openFDA Authenticated Production API' : 'openFDA Public Tier API',
            cachedInPostgres: false,
            provenanceTimestamp: new Date().toISOString(),
            genericName,
            brandName: brandNames[0],
            allBrandNames: brandNames,
            splSetId,
            version: versionId,
            boxedWarning,
            contraindications,
            warningsAndPrecautions,
            drugInteractions,
            mechanismOfAction,
            pharmacokinetics
          })
        );
        return;
      }
    }

    res.statusCode = 404;
    res.end(
      JSON.stringify({
        success: false,
        message: `No official FDA drug label match found for "${drug}".`,
        drug: cleanDrug
      })
    );
  } catch (err: any) {
    res.statusCode = 502;
    res.end(
      JSON.stringify({
        success: false,
        error: 'Failed to communicate with openFDA upstream API',
        details: err?.message
      })
    );
  }
}
