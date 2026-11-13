import {
  documentCreationTrends,
  documentStatusDistribution,
  documentTypeDistribution,
  platformSummary,
  reviewStatusDistribution,
  userRegistrationTrends,
} from '../data/mockAnalytics';

export async function getAdminAnalytics({ range = '6m' } = {}) {
  const months = range === '30d' ? 1 : range === '90d' ? 3 : range === '12m' ? 12 : 6;
  return {
    summary: structuredClone(platformSummary),
    registrations: structuredClone(userRegistrationTrends.slice(-months)),
    documentCreations: structuredClone(documentCreationTrends.slice(-months)),
    documentTypes: structuredClone(documentTypeDistribution),
    documentStatuses: structuredClone(documentStatusDistribution),
    reviewStatuses: structuredClone(reviewStatusDistribution),
  };
}
