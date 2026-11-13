import { documents } from './mockDocuments.js';
import { notifications, recentActivity, reviewRequests, reviews } from './mockReviews.js';
import { clientProfiles, commonUsers, studentProfiles } from './mockUsers.js';

export const dashboardMockStore = {
  users: structuredClone(commonUsers),
  clients: structuredClone(clientProfiles),
  students: structuredClone(studentProfiles),
  documents: structuredClone(documents),
  reviewRequests: structuredClone(reviewRequests),
  reviews: structuredClone(reviews),
  notifications: structuredClone(notifications),
  activity: structuredClone(recentActivity),
};
