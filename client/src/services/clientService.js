import { dashboardMockStore } from '../data/dashboardMockStore';

export async function getClientProfile(clientId) {
  return structuredClone(dashboardMockStore.clients.find((profile) => profile.id === clientId) || null);
}

export async function listClients() {
  return structuredClone(dashboardMockStore.clients);
}
