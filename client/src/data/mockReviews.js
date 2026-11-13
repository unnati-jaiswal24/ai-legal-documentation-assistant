export const reviewRequests = [
  { id: 'request-1', clientId: 'client-1', documentId: 'document-1', studentId: 'student-1', status: 'accepted', requestedAt: '2026-11-10T11:15:00.000Z', requestedCompletionAt: '2026-11-16T18:00:00.000Z', description: 'Please check the delivery milestones and ownership terms.' },
  { id: 'request-2', clientId: 'client-1', documentId: 'document-2', studentId: null, status: 'pending', requestedAt: '2026-11-12T09:45:00.000Z', requestedCompletionAt: '2026-11-19T18:00:00.000Z', description: 'Looking for a clear review of mutual confidentiality obligations.' },
  { id: 'request-3', clientId: 'client-2', documentId: 'document-4', studentId: 'student-2', status: 'accepted', requestedAt: '2026-11-11T08:10:00.000Z', requestedCompletionAt: '2026-11-17T18:00:00.000Z', description: 'Could you review the project scope and payment schedule?' },
  { id: 'request-4', clientId: 'client-1', documentId: 'document-3', studentId: 'student-3', status: 'completed', requestedAt: '2026-10-25T09:00:00.000Z', requestedCompletionAt: '2026-11-02T18:00:00.000Z', description: 'Review the service scope and termination language.' },
  { id: 'request-5', clientId: 'client-3', documentId: 'document-6', studentId: 'student-1', status: 'completed', requestedAt: '2026-10-29T08:00:00.000Z', requestedCompletionAt: '2026-11-05T18:00:00.000Z', description: 'Please flag any missing terms in this advisory agreement.' },
  { id: 'request-6', clientId: 'client-5', documentId: 'document-8', studentId: null, status: 'pending', requestedAt: '2026-11-12T10:00:00.000Z', requestedCompletionAt: '2026-11-20T18:00:00.000Z', description: 'Review the confidentiality scope and permitted disclosures.' },
  { id: 'request-7', clientId: 'client-4', documentId: 'document-7', studentId: null, status: 'pending', requestedAt: '2026-11-12T12:30:00.000Z', requestedCompletionAt: '2026-11-22T18:00:00.000Z', description: 'Please review the payment terms before we share this agreement.' },
  { id: 'request-8', clientId: 'client-2', documentId: 'document-5', studentId: 'student-3', status: 'completed', requestedAt: '2026-10-30T12:15:00.000Z', requestedCompletionAt: '2026-11-08T18:00:00.000Z', description: 'Check the rights transfer and pre-existing materials terms.' },
  { id: 'request-9', clientId: 'client-3', documentId: 'document-9', studentId: 'student-2', status: 'rejected', requestedAt: '2026-11-04T08:30:00.000Z', requestedCompletionAt: '2026-11-11T18:00:00.000Z', description: 'Review this development agreement for clarity.' },
  { id: 'request-10', clientId: 'client-5', documentId: 'document-10', studentId: 'student-5', status: 'accepted', requestedAt: '2026-11-11T14:10:00.000Z', requestedCompletionAt: '2026-11-18T18:00:00.000Z', description: 'Please review responsibilities and how changes are approved.' },
  { id: 'request-11', clientId: 'client-2', documentId: 'document-5', studentId: 'student-1', status: 'pending', requestedAt: '2026-11-12T13:20:00.000Z', requestedCompletionAt: '2026-11-19T18:00:00.000Z', description: 'Please review the rights transfer and identify any questions we should clarify.' },
];

export const reviews = [
  { id: 'review-1', requestId: 'request-4', documentId: 'document-3', studentId: 'student-3', clientId: 'client-1', completedAt: '2026-11-01T13:15:00.000Z', rating: 5, turnaroundHours: 34, summary: 'The scope and termination sections are clear. Consider adding an acceptance window for deliverables.' },
  { id: 'review-2', requestId: 'request-5', documentId: 'document-6', studentId: 'student-1', clientId: 'client-3', completedAt: '2026-11-04T15:45:00.000Z', rating: 5, turnaroundHours: 29, summary: 'The agreement is well structured. Clarify how approved expenses are reimbursed.' },
  { id: 'review-3', requestId: 'request-8', documentId: 'document-5', studentId: 'student-3', clientId: 'client-2', completedAt: '2026-11-07T10:30:00.000Z', rating: 4, turnaroundHours: 41, summary: 'The transfer language is present. Identify any pre-existing assets excluded from the transfer.' },
];

export const notifications = [
  { id: 'notification-1', userId: 'user-client-1', title: 'Review accepted', message: 'Ishita Kapoor accepted your website redesign review.', createdAt: '2026-11-12T08:10:00.000Z', read: false },
  { id: 'notification-2', userId: 'user-client-1', title: 'Draft updated', message: 'Your product strategy NDA was updated.', createdAt: '2026-11-11T09:40:00.000Z', read: false },
  { id: 'notification-3', userId: 'user-client-1', title: 'Review completed', message: 'Meera Das completed your consulting agreement review.', createdAt: '2026-11-01T13:20:00.000Z', read: true },
  { id: 'notification-4', userId: 'user-student-1', title: 'New review request', message: 'Aarav Mehta requested a review of a freelance agreement.', createdAt: '2026-11-12T09:45:00.000Z', read: false },
  { id: 'notification-5', userId: 'user-student-1', title: 'Review deadline approaching', message: 'Website redesign agreement is due in four days.', createdAt: '2026-11-12T08:30:00.000Z', read: false },
  { id: 'notification-6', userId: 'user-admin-1', title: 'Verification queue updated', message: 'Two student profiles are awaiting review.', createdAt: '2026-11-12T07:15:00.000Z', read: false },
];

export const recentActivity = [
  { id: 'activity-1', type: 'document_created', actorId: 'user-client-1', entityId: 'document-1', createdAt: '2026-11-10T10:20:00.000Z' },
  { id: 'activity-2', type: 'review_requested', actorId: 'user-client-1', entityId: 'request-2', createdAt: '2026-11-12T09:45:00.000Z' },
  { id: 'activity-3', type: 'review_accepted', actorId: 'user-student-1', entityId: 'request-1', createdAt: '2026-11-12T08:10:00.000Z' },
  { id: 'activity-4', type: 'review_completed', actorId: 'user-student-3', entityId: 'review-1', createdAt: '2026-11-01T13:15:00.000Z' },
];
