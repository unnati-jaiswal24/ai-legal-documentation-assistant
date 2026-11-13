export const commonUsers = [
  { id: 'user-client-1', fullName: 'Aarav Mehta', email: 'aarav.mehta@example.in', role: 'CLIENT', status: 'active', createdAt: '2026-10-12T09:30:00.000Z' },
  { id: 'user-client-2', fullName: 'Riya Shah', email: 'riya.shah@example.in', role: 'CLIENT', status: 'active', createdAt: '2026-10-22T11:00:00.000Z' },
  { id: 'user-client-3', fullName: 'Kabir Nair', email: 'kabir.nair@example.in', role: 'CLIENT', status: 'active', createdAt: '2026-11-02T08:15:00.000Z' },
  { id: 'user-client-4', fullName: 'Ananya Bose', email: 'ananya.bose@example.in', role: 'CLIENT', status: 'suspended', createdAt: '2026-11-05T14:10:00.000Z' },
  { id: 'user-client-5', fullName: 'Devika Rao', email: 'devika.rao@example.in', role: 'CLIENT', status: 'active', createdAt: '2026-11-10T10:45:00.000Z' },
  { id: 'user-student-1', fullName: 'Ishita Kapoor', email: 'ishita.kapoor@lawschool.edu.in', role: 'LAW_STUDENT', status: 'active', createdAt: '2026-09-18T07:45:00.000Z' },
  { id: 'user-student-2', fullName: 'Rohan Iyer', email: 'rohan.iyer@lawschool.edu.in', role: 'LAW_STUDENT', status: 'active', createdAt: '2026-09-26T09:20:00.000Z' },
  { id: 'user-student-3', fullName: 'Meera Das', email: 'meera.das@lawschool.edu.in', role: 'LAW_STUDENT', status: 'active', createdAt: '2026-10-03T12:05:00.000Z' },
  { id: 'user-student-4', fullName: 'Arjun Menon', email: 'arjun.menon@lawschool.edu.in', role: 'LAW_STUDENT', status: 'active', createdAt: '2026-10-19T13:40:00.000Z' },
  { id: 'user-student-5', fullName: 'Sara Fernandes', email: 'sara.fernandes@lawschool.edu.in', role: 'LAW_STUDENT', status: 'active', createdAt: '2026-11-01T10:30:00.000Z' },
  { id: 'user-student-6', fullName: 'Nikhil Verma', email: 'nikhil.verma@lawschool.edu.in', role: 'LAW_STUDENT', status: 'active', createdAt: '2026-11-08T15:00:00.000Z' },
  { id: 'user-admin-1', fullName: 'Priya Nair', email: 'priya.nair@saraldocs.in', role: 'ADMIN', status: 'active', createdAt: '2026-08-01T08:00:00.000Z' },
];

export const clientProfiles = [
  { id: 'client-1', userId: 'user-client-1', organizationName: 'Mehta Design Studio', preferredLanguage: 'en' },
  { id: 'client-2', userId: 'user-client-2', organizationName: 'Shah Creative Co.', preferredLanguage: 'en' },
  { id: 'client-3', userId: 'user-client-3', organizationName: 'Nair Digital', preferredLanguage: 'en' },
  { id: 'client-4', userId: 'user-client-4', organizationName: 'Bose Consulting', preferredLanguage: 'en' },
  { id: 'client-5', userId: 'user-client-5', organizationName: 'Rao Studio', preferredLanguage: 'en' },
];

export const studentProfiles = [
  { id: 'student-1', userId: 'user-student-1', universityId: 'university-nlsiu', degree: 'B.A. LL.B. (Hons.)', academicYear: 4, graduationYear: 2027, expertiseIds: ['expertise-contracts', 'expertise-ip'], verificationStatus: 'verified', completedReviews: 24, rating: 4.9, completionRate: 96 },
  { id: 'student-2', userId: 'user-student-2', universityId: 'university-nalsar', degree: 'B.A. LL.B. (Hons.)', academicYear: 3, graduationYear: 2028, expertiseIds: ['expertise-contracts', 'expertise-startups'], verificationStatus: 'verified', completedReviews: 18, rating: 4.8, completionRate: 94 },
  { id: 'student-3', userId: 'user-student-3', universityId: 'university-nlud', degree: 'B.A. LL.B. (Hons.)', academicYear: 4, graduationYear: 2027, expertiseIds: ['expertise-ip', 'expertise-privacy'], verificationStatus: 'verified', completedReviews: 31, rating: 5.0, completionRate: 98 },
  { id: 'student-4', userId: 'user-student-4', universityId: 'university-sls', degree: 'B.B.A. LL.B.', academicYear: 2, graduationYear: 2029, expertiseIds: ['expertise-contracts'], verificationStatus: 'pending', completedReviews: 0, rating: null, completionRate: null },
  { id: 'student-5', userId: 'user-student-5', universityId: 'university-nlsiu', degree: 'B.A. LL.B. (Hons.)', academicYear: 5, graduationYear: 2026, expertiseIds: ['expertise-startups', 'expertise-privacy'], verificationStatus: 'verified', completedReviews: 15, rating: 4.7, completionRate: 91 },
  { id: 'student-6', userId: 'user-student-6', universityId: 'university-nalsar', degree: 'B.A. LL.B. (Hons.)', academicYear: 3, graduationYear: 2028, expertiseIds: ['expertise-contracts', 'expertise-ip'], verificationStatus: 'pending', completedReviews: 0, rating: null, completionRate: null },
];

export const universities = [
  { id: 'university-nlsiu', name: 'National Law School of India University', shortName: 'NLSIU' },
  { id: 'university-nalsar', name: 'NALSAR University of Law', shortName: 'NALSAR' },
  { id: 'university-nlud', name: 'National Law University, Delhi', shortName: 'NLUD' },
  { id: 'university-sls', name: 'Symbiosis Law School', shortName: 'SLS' },
];

export const expertiseAreas = [
  { id: 'expertise-contracts', name: 'Contract law' },
  { id: 'expertise-ip', name: 'Intellectual property' },
  { id: 'expertise-startups', name: 'Startup agreements' },
  { id: 'expertise-privacy', name: 'Privacy & technology' },
];

export const adminProfiles = [
  { id: 'admin-1', userId: 'user-admin-1', title: 'Platform administrator' },
];

export function getUserById(userId) {
  return commonUsers.find((user) => user.id === userId) || null;
}

export function getStudentProfile(studentId) {
  return studentProfiles.find((profile) => profile.id === studentId) || null;
}
