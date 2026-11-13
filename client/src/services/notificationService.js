import { dashboardMockStore } from '../data/dashboardMockStore';

export async function markNotificationsRead(notificationIds) {
  const selected = new Set(notificationIds);
  for (const notification of dashboardMockStore.notifications) {
    if (selected.has(notification.id)) notification.read = true;
  }
}
