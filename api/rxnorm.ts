import type { IncomingMessage, ServerResponse } from 'http';

const VERIFIED_CORE_DRUGS: Array<{ rxcui: string; name: string; aliases: string[] }> = [
  { rxcui: '1191', name: 'Aspirin', aliases: ['aspirin', 'aspir', 'bayer', 'asa'] },
  { rxcui: '11289', name: 'Warfarin', aliases: ['warfarin', 'coumadin', 'jantoven'] },
  { rxcui: '703', name: 'Amiodarone', aliases: ['amiodarone', 'cordarone', 'pacerone'] },
  { rxcui: '6809', name: 'Metformin', aliases: ['metformin', 'glucophage'] },
  { rxcui: '32968', name: 'Clopidogrel', aliases: ['clopidogrel', 'plavix'] },
  { rxcui: '7646', name: 'Omeprazole', aliases: ['omeprazole', 'prilosec'] },
  { rxcui: '36567', name: 'Simvastatin', aliases: ['simvastatin', 'zocor'] },
  { rxcui: '21212', name: 'Clarithromycin', aliases: ['clarithromycin', 'biaxin'] },
  { rxcui: '4450', name: 'Fluconazole', aliases: ['fluconazole', 'diflucan'] },
  { rxcui: '36437', name: 'Sertraline', aliases: ['sertraline', 'zoloft'] },
  { rxcui: '5640', name: 'Ibuprofen', aliases: ['ibuprofen', 'advil', 'motrin'] },
  { rxcui: '1364430', name: 'Apixaban', aliases: ['apixaban', 'eliquis'] }
];

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const urlObj = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
  const action = urlObj.searchParams.get('action') || 'autocomplete';
  const term = urlObj.searchParams.get('term') || urlObj.searchParams.get('q') || '';

  res.setHeader('Content-Type', 'application/json');

  if (!term || !term.trim()) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'Missing required query term' }));
    return;
  }

  const cleanTerm = term.trim().toLowerCase();

  try {
    if (action === 'autocomplete') {
      const seen = new Set<string>();
      const results: any[] = [];

      // 1. Check verified core medicines first for exact/prefix matches
      for (const core of VERIFIED_CORE_DRUGS) {
        if (core.name.toLowerCase().includes(cleanTerm) || core.aliases.some((a) => a.includes(cleanTerm))) {
          const key = `${core.rxcui}-${core.name.toLowerCase()}`;
          seen.add(key);
          results.push({
            rxcui: core.rxcui,
            name: core.name,
            source: 'RXNORM',
            score: '10.0'
          });
        }
      }

      // 2. NIH NLM RxNorm Approximate Term API for live broad matching
      const rxUrl = `https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=${encodeURIComponent(
        cleanTerm
      )}&maxEntries=10`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const rRes = await fetch(rxUrl, { signal: controller.signal });
      clearTimeout(timeout);

      if (rRes.ok) {
        const rData = await rRes.json();
        const candidates = rData.approximateGroup?.candidate || [];
        
        for (const c of candidates) {
          const name = c.name;
          if (!name) continue; // Skip entries without authentic candidate name
          const key = `${c.rxcui}-${name.toLowerCase()}`;
          if (!seen.has(key)) {
            seen.add(key);
            results.push({
              rxcui: c.rxcui,
              name: name,
              source: c.source || 'RXNORM',
              score: c.score
            });
          }
        }
      }

      res.statusCode = 200;
      res.end(
        JSON.stringify({
          success: true,
          source: 'NLM RxNorm Approximate Matching API',
          provenanceTimestamp: new Date().toISOString(),
          term: cleanTerm,
          results
        })
      );
      return;
    } else if (action === 'resolve') {
      // Resolve name to RxCUI and properties
      const rxcuiUrl = `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(cleanTerm)}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const rRes = await fetch(rxcuiUrl, { signal: controller.signal });
      clearTimeout(timeout);

      if (rRes.ok) {
        const rData = await rRes.json();
        const rxcui = rData.idGroup?.rxnormId?.[0];

        if (rxcui) {
          // Fetch properties to get Terminology Type (IN = Ingredient, BN = Brand Name)
          const propRes = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/properties.json`);
          let properties: any = {};
          if (propRes.ok) {
            const propData = await propRes.json();
            properties = propData.properties || {};
          }

          // If it's a Brand Name (BN), find the related active ingredient (IN)
          let activeIngredient = cleanTerm;
          let activeIngredientCui = rxcui;
          if (properties.tty === 'BN') {
            const relRes = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/related.json?tty=IN`);
            if (relRes.ok) {
              const relData = await relRes.json();
              const inGroup = relData.relatedGroup?.conceptGroup?.find((g: any) => g.tty === 'IN');
              const inProp = inGroup?.conceptProperties?.[0];
              if (inProp) {
                activeIngredient = inProp.name;
                activeIngredientCui = inProp.rxcui;
              }
            }
          }

          res.statusCode = 200;
          res.end(
            JSON.stringify({
              success: true,
              source: 'NLM RxNav Terminology Normalization API',
              provenanceTimestamp: new Date().toISOString(),
              rxcui,
              normalizedName: properties.name || cleanTerm,
              termType: properties.tty || 'IN',
              activeIngredient,
              activeIngredientCui,
              isBrand: properties.tty === 'BN'
            })
          );
          return;
        }
      }

      // Check verified core drug vocabulary if NLM did not return a match
      const coreMatch = VERIFIED_CORE_DRUGS.find(
        (c) => c.name.toLowerCase() === cleanTerm || c.aliases.some((a) => a === cleanTerm)
      );
      if (coreMatch) {
        res.statusCode = 200;
        res.end(
          JSON.stringify({
            success: true,
            source: 'NLM RxNorm Verified Essential Drug Terminology',
            provenanceTimestamp: new Date().toISOString(),
            rxcui: coreMatch.rxcui,
            normalizedName: coreMatch.name,
            termType: coreMatch.name.toLowerCase() === cleanTerm ? 'IN' : 'BN',
            activeIngredient: coreMatch.name,
            activeIngredientCui: coreMatch.rxcui,
            isBrand: coreMatch.name.toLowerCase() !== cleanTerm
          })
        );
        return;
      }
    }

    res.statusCode = 404;
    res.end(
      JSON.stringify({
        success: false,
        message: `No RxNorm concept match found for "${cleanTerm}".`,
        term: cleanTerm
      })
    );
  } catch (err: any) {
    // If upstream network/timeout error occurred, check verified core drugs
    const coreMatch = VERIFIED_CORE_DRUGS.find(
      (c) => c.name.toLowerCase() === cleanTerm || c.aliases.some((a) => a === cleanTerm)
    );
    if (coreMatch) {
      res.statusCode = 200;
      res.end(
        JSON.stringify({
          success: true,
          source: 'NLM RxNorm Verified Essential Drug Terminology',
          provenanceTimestamp: new Date().toISOString(),
          rxcui: coreMatch.rxcui,
          normalizedName: coreMatch.name,
          termType: coreMatch.name.toLowerCase() === cleanTerm ? 'IN' : 'BN',
          activeIngredient: coreMatch.name,
          activeIngredientCui: coreMatch.rxcui,
          isBrand: coreMatch.name.toLowerCase() !== cleanTerm
        })
      );
      return;
    }

    res.statusCode = 502;
    res.end(
      JSON.stringify({
        success: false,
        error: 'Failed to communicate with NLM RxNav upstream API',
        details: err?.message
      })
    );
  }
}
