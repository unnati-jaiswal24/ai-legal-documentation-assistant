import { useCallback, useEffect, useRef, useState } from 'react';
import { expertiseAreas, universities } from '../data/mockUsers';
import { dashboardMockStore } from '../data/dashboardMockStore';
import { getAdminAnalytics } from '../services/adminAnalyticsService';
import { listDocuments } from '../services/documentService';
import { listReviewRequests, listReviews } from '../services/reviewService';
import { listNotifications, listUsers } from '../services/userService';
import { mapActivityItems, mapClientRows, mapDocumentRows, mapReviewRequestRows, mapStudentRows } from '../utils/dashboardMappers';

export default function useDashboardData({ analyticsRange = '6m' } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const hasLoaded = useRef(false);

  const reload = useCallback(async () => {
    if (!hasLoaded.current) setLoading(true);
    setError('');
    try {
      const [users, documentResources, reviewRequests, reviews, analytics, clientNotifications, studentNotifications, adminNotifications] = await Promise.all([
        listUsers(),
        listDocuments(),
        listReviewRequests(),
        listReviews(),
        getAdminAnalytics({ range: analyticsRange }),
        listNotifications('user-client-1'),
        listNotifications('user-student-1'),
        listNotifications('user-admin-1'),
      ]);
      const { documents, documentTypes } = documentResources;
      const clients = structuredClone(dashboardMockStore.clients);
      const clientRows = mapClientRows(clients, users);
      const students = structuredClone(dashboardMockStore.students);
      const studentRows = mapStudentRows(students, users, universities, expertiseAreas);
      const documentsWithTypes = mapDocumentRows(documents, documentTypes, clientRows);
      const requestRows = mapReviewRequestRows(reviewRequests, documents, users, clients, students);
      const activity = mapActivityItems(dashboardMockStore.activity, users, documents, requestRows, reviews);
      setData({
        users,
        clients,
        clientRows,
        students,
        studentRows,
        documents,
        documentTypes,
        documentsWithTypes,
        reviewRequests,
        requestRows,
        reviews,
        activity,
        notifications: [...clientNotifications, ...studentNotifications, ...adminNotifications],
        analytics,
        universities,
        expertiseAreas,
      });
      hasLoaded.current = true;
    } catch (requestError) {
      setError(requestError.message || 'Dashboard preview data could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [analyticsRange]);

  useEffect(() => {
    const task = setTimeout(reload, 0);
    return () => clearTimeout(task);
  }, [reload]);

  return { data, loading, error, reload };
}
