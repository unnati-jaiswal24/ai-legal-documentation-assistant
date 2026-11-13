import assert from 'node:assert/strict';
import test from 'node:test';
import { dashboardNavigation, dashboardPath } from '../components/dashboard/dashboardNavigation.js';
import { documents } from '../data/mockDocuments.js';
import { reviewRequests } from '../data/mockReviews.js';
import { clientProfiles, commonUsers, studentProfiles } from '../data/mockUsers.js';
import { createReviewRequest } from '../services/reviewService.js';
import { mapReviewRequestRows, mapStudentRows } from '../utils/dashboardMappers.js';

test('role dashboards expose exactly the three requested roles and working section paths', () => {
  assert.deepEqual(Object.keys(dashboardNavigation).sort(), ['admin', 'client', 'student']);
  assert.equal(dashboardPath('client', 'review-requests'), '/dashboard/client/review-requests');
  assert.equal(dashboardPath('student', 'active-reviews'), '/dashboard/student/active-reviews');
  assert.equal(dashboardPath('admin', 'verification'), '/dashboard/admin/verification');
  for (const role of Object.keys(dashboardNavigation)) {
    assert.equal(dashboardNavigation[role][0].label, 'Dashboard');
  }
});

test('mock document and review resources reference existing normalized entities', () => {
  const clientIds = new Set(clientProfiles.map((client) => client.id));
  const documentIds = new Set(documents.map((document) => document.id));
  const studentIds = new Set(studentProfiles.map((student) => student.id));

  for (const document of documents) assert.ok(clientIds.has(document.ownerClientId));
  for (const request of reviewRequests) {
    assert.ok(documentIds.has(request.documentId));
    assert.ok(clientIds.has(request.clientId));
    assert.equal(documents.find((document) => document.id === request.documentId).ownerClientId, request.clientId);
    if (request.studentId) assert.ok(studentIds.has(request.studentId));
  }
});

test('dashboard mappers resolve display fields from related resources', () => {
  const students = mapStudentRows(studentProfiles, commonUsers, [
    { id: 'university-nlsiu', name: 'National Law School of India University', shortName: 'NLSIU' },
    { id: 'university-nalsar', name: 'NALSAR University of Law', shortName: 'NALSAR' },
    { id: 'university-nlud', name: 'National Law University, Delhi', shortName: 'NLUD' },
    { id: 'university-sls', name: 'Symbiosis Law School', shortName: 'SLS' },
  ], [
    { id: 'expertise-contracts', name: 'Contract law' },
    { id: 'expertise-ip', name: 'Intellectual property' },
    { id: 'expertise-startups', name: 'Startup agreements' },
    { id: 'expertise-privacy', name: 'Privacy & technology' },
  ]);
  assert.equal(students.find((student) => student.id === 'student-1').name, 'Ishita Kapoor');
  assert.equal(students.find((student) => student.id === 'student-1').university, 'National Law School of India University');

  const rows = mapReviewRequestRows(
    reviewRequests,
    documents,
    commonUsers,
    clientProfiles,
    studentProfiles,
  );
  assert.equal(rows.find((request) => request.id === 'request-1').documentTitle, 'Website redesign agreement');
  assert.equal(rows.find((request) => request.id === 'request-1').studentName, 'Ishita Kapoor');
});

test('mock review service refuses to assign an unverified student', async () => {
  await assert.rejects(
    createReviewRequest({
      clientId: 'client-4',
      documentId: 'document-7',
      studentId: 'student-4',
      description: 'Please review this agreement before it is sent.',
      requestedCompletionAt: '2026-11-25T18:00:00.000Z',
    }),
    /Only verified students can be selected as reviewers/,
  );
});
