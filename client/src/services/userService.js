import { dashboardMockStore } from '../data/dashboardMockStore';

export async function listNotifications(userId) {
  return structuredClone(dashboardMockStore.notifications.filter((item) => item.userId === userId));
}

export async function listUsers() {
  return structuredClone(dashboardMockStore.users);
}

export async function getUser(userId) {
  return structuredClone(dashboardMockStore.users.find((user) => user.id === userId) || null);
}

export async function updateUserProfile(userId, updates) {
  const user = dashboardMockStore.users.find((item) => item.id === userId);
  if (!user) throw new Error('The mock profile could not be found.');
  Object.assign(user, updates);
  return structuredClone(user);
}
