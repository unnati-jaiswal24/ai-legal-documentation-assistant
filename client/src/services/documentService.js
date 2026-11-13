import { dashboardMockStore } from '../data/dashboardMockStore';
import { documentTypes } from '../data/mockDocuments';

export async function listDocuments() {
  return {
    documents: structuredClone(dashboardMockStore.documents),
    documentTypes: structuredClone(documentTypes),
  };
}

export async function listClientDocuments(clientId) {
  return {
    documents: structuredClone(dashboardMockStore.documents.filter((document) => document.ownerClientId === clientId)),
    documentTypes: structuredClone(documentTypes),
  };
}
