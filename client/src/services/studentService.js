import { dashboardMockStore } from '../data/dashboardMockStore';

export async function getStudentProfile(studentId) {
  return structuredClone(dashboardMockStore.students.find((profile) => profile.id === studentId) || null);
}

export async function listStudents() {
  return structuredClone(dashboardMockStore.students);
}

export async function updateStudentProfile(studentId, updates) {
  const profile = dashboardMockStore.students.find((item) => item.id === studentId);
  if (!profile) throw new Error('The mock student profile could not be found.');
  Object.assign(profile, updates);
  return structuredClone(profile);
}
