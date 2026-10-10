export interface ClinicalTrialStudy {
  nctId: string;
  briefTitle: string;
  officialTitle?: string;
  overallStatus: string;
  phases: string[];
  conditions: string[];
  interventions: string[];
  leadSponsor?: string;
  startDate?: string;
  completionDate?: string;
  studyUrl: string;
}

export async function searchClinicalTrials(
  term: string,
  options?: { pageSize?: number; status?: string }
): Promise<{ total: number; studies: ClinicalTrialStudy[] }> {
  const pageSize = options?.pageSize || 8;
  const params = new URLSearchParams();
  params.append('query.term', term.trim());
  params.append('pageSize', String(pageSize));
  if (options?.status) {
    params.append('filter.overallStatus', options.status);
  }

  const url = `https://clinicaltrials.gov/api/v2/studies?${params.toString()}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      return { total: 0, studies: [] };
    }

    const data = await res.json();
    const rawStudies = data.studies || [];

    const studies: ClinicalTrialStudy[] = rawStudies.map((s: any) => {
      const proto = s.protocolSection || {};
      const idMod = proto.identificationModule || {};
      const statusMod = proto.statusModule || {};
      const designMod = proto.designModule || {};
      const condMod = proto.conditionsModule || {};
      const armsMod = proto.armsInterventionsModule || {};
      const sponsorMod = proto.sponsorCollaboratorsModule || {};

      const nctId = idMod.nctId || 'NCT00000000';
      return {
        nctId,
        briefTitle: idMod.briefTitle || 'Untitled Clinical Study',
        officialTitle: idMod.officialTitle || undefined,
        overallStatus: statusMod.overallStatus || 'UNKNOWN',
        phases: designMod.phases || ['Not Applicable'],
        conditions: condMod.conditions || [],
        interventions: (armsMod.interventions || []).map((i: any) => `${i.type}: ${i.name}`),
        leadSponsor: sponsorMod.leadSponsor?.name || undefined,
        startDate: statusMod.startDateStruct?.date || undefined,
        completionDate: statusMod.completionDateStruct?.date || undefined,
        studyUrl: `https://clinicaltrials.gov/study/${nctId}`
      };
    });

    return {
      total: data.totalCount || studies.length,
      studies
    };
  } catch (err) {
    return { total: 0, studies: [] };
  }
}
