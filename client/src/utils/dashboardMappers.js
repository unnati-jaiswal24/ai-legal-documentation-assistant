export function mapDocumentRows(documents, types, clients = []) {
  const typeById = new Map(types.map((type) => [type.id, type]));
  const clientById = new Map(clients.map((client) => [client.id, client]));
  return documents.map((document) => ({
    ...document,
    documentType: typeById.get(document.typeId)?.name || 'Legal document',
    clientName: clientById.get(document.ownerClientId)?.name || 'Client',
  }));
}

export function mapClientRows(clients, users) {
  const usersById = new Map(users.map((user) => [user.id, user]));
  return clients.map((client) => ({
    ...client,
    name: usersById.get(client.userId)?.fullName || 'Client',
    email: usersById.get(client.userId)?.email || '',
    status: usersById.get(client.userId)?.status || 'active',
  }));
}

export function mapReviewRequestRows(requests, documents, users, clients, students) {
  const documentsById = new Map(documents.map((document) => [document.id, document]));
  const usersById = new Map(users.map((user) => [user.id, user]));
  const clientsById = new Map(clients.map((client) => [client.id, client]));
  const studentsById = new Map(students.map((student) => [student.id, student]));
  return requests.map((request) => {
    const client = clientsById.get(request.clientId);
    const student = studentsById.get(request.studentId);
    return {
      ...request,
      documentTitle: documentsById.get(request.documentId)?.title || 'Document',
      clientName: usersById.get(client?.userId)?.fullName || 'Client',
      studentName: usersById.get(student?.userId)?.fullName || (request.studentId ? 'Law student' : 'Unassigned'),
    };
  });
}

export function mapStudentRows(students, users, universities, expertiseAreas) {
  const usersById = new Map(users.map((user) => [user.id, user]));
  const universitiesById = new Map(universities.map((university) => [university.id, university]));
  const expertiseById = new Map(expertiseAreas.map((expertise) => [expertise.id, expertise]));
  return students.map((student) => ({
    ...student,
    name: usersById.get(student.userId)?.fullName || 'Law student',
    email: usersById.get(student.userId)?.email || '',
    university: universitiesById.get(student.universityId)?.name || 'University',
    expertise: student.expertiseIds.map((id) => expertiseById.get(id)?.name).filter(Boolean),
  }));
}

export function mapActivityItems(activity, users, documents, requests, reviews) {
  const usersById = new Map(users.map((user) => [user.id, user]));
  const docsById = new Map(documents.map((document) => [document.id, document]));
  const requestsById = new Map(requests.map((request) => [request.id, request]));
  const reviewsById = new Map(reviews.map((review) => [review.id, review]));
  const labels = {
    document_created: 'created a document',
    review_requested: 'requested a review',
    review_accepted: 'accepted a review request',
    review_completed: 'completed a review',
  };
  return activity.map((item) => {
    const related = item.type === 'document_created'
      ? docsById.get(item.entityId)
      : item.type === 'review_completed'
        ? reviewsById.get(item.entityId)
        : requestsById.get(item.entityId);
    return {
      ...item,
      actorName: usersById.get(item.actorId)?.fullName || 'A member',
      action: labels[item.type] || 'updated an item',
      entityTitle: related?.title || related?.documentTitle || docsById.get(related?.documentId)?.title || 'workspace item',
    };
  });
}
