export const userRegistrationTrends = [
  { month: 'Dec', clients: 23, students: 12 },
  { month: 'Jan', clients: 26, students: 14 },
  { month: 'Feb', clients: 29, students: 16 },
  { month: 'Mar', clients: 31, students: 17 },
  { month: 'Apr', clients: 32, students: 17 },
  { month: 'May', clients: 34, students: 18 },
  { month: 'Jun', clients: 34, students: 18 },
  { month: 'Jul', clients: 42, students: 24 },
  { month: 'Aug', clients: 51, students: 29 },
  { month: 'Sep', clients: 63, students: 37 },
  { month: 'Oct', clients: 72, students: 43 },
  { month: 'Nov', clients: 86, students: 51 },
];

export const documentCreationTrends = [
  { month: 'Dec', count: 32 },
  { month: 'Jan', count: 36 },
  { month: 'Feb', count: 39 },
  { month: 'Mar', count: 42 },
  { month: 'Apr', count: 44 },
  { month: 'May', count: 47 },
  { month: 'Jun', count: 48 },
  { month: 'Jul', count: 62 },
  { month: 'Aug', count: 75 },
  { month: 'Sep', count: 81 },
  { month: 'Oct', count: 104 },
  { month: 'Nov', count: 129 },
];

export const documentTypeDistribution = [
  { typeId: 'type-freelance', count: 724, color: '#31583b' },
  { typeId: 'type-nda', count: 468, color: '#78977b' },
  { typeId: 'type-consulting', count: 328, color: '#c58b68' },
  { typeId: 'type-ip', count: 216, color: '#d8c88c' },
];

export const documentStatusDistribution = [
  { status: 'draft', count: 318 },
  { status: 'in_review', count: 144 },
  { status: 'completed', count: 1274 },
];

export const reviewStatusDistribution = [
  { status: 'pending', count: 62 },
  { status: 'accepted', count: 35 },
  { status: 'completed', count: 518 },
  { status: 'rejected', count: 9 },
];

export const platformSummary = {
  totalUsers: 1248,
  totalClients: 918,
  totalLawStudents: 330,
  verifiedStudents: 248,
  pendingVerifications: 82,
  totalDocuments: 1736,
  totalReviewRequests: 624,
  completedReviews: 518,
  averageTurnaroundHours: 42,
  reviewCompletionRate: 83,
  activeAccounts: 1189,
  suspendedAccounts: 59,
  periodGrowth: 12.8,
};
