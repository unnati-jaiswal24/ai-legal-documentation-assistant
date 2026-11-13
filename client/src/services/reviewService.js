import { dashboardMockStore } from '../data/dashboardMockStore.js';

export async function listReviewRequests() {
  return structuredClone(dashboardMockStore.reviewRequests);
}

export async function listReviews() {
  return structuredClone(dashboardMockStore.reviews);
}

export async function updateReviewRequest(requestId, status) {
  if (!['accepted', 'rejected'].includes(status)) {
    throw new Error('Mock review actions can only accept or reject a request.');
  }
  const request = dashboardMockStore.reviewRequests.find((item) => item.id === requestId);
  if (!request) throw new Error('The mock review request could not be found.');
  if (request.status !== 'pending') throw new Error('This mock request is no longer pending.');
  request.status = status;
  if (status === 'accepted' && !request.studentId) request.studentId = 'student-1';
  return structuredClone(request);
}

export async function createReviewRequest({ clientId, documentId, studentId = null, description, requestedCompletionAt }) {
  const document = dashboardMockStore.documents.find((item) => item.id === documentId && item.ownerClientId === clientId);
  if (!document) throw new Error('Choose one of your documents before requesting a review.');
  if (studentId && !dashboardMockStore.students.some((student) => student.id === studentId && student.verificationStatus === 'verified')) {
    throw new Error('Only verified students can be selected as reviewers.');
  }
  const request = {
    id: `request-${Date.now()}`,
    clientId,
    documentId,
    studentId,
    status: 'pending',
    requestedAt: new Date().toISOString(),
    requestedCompletionAt,
    description,
  };
  dashboardMockStore.reviewRequests.unshift(request);
  document.status = 'in_review';
  document.updatedAt = request.requestedAt;
  return structuredClone(request);
}
