export function publicUser(user) {
  const role = user.roleAssignments?.[0]?.role?.code || user.role || null;
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    preferredLanguage: user.preferredLanguage,
    role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

export function pagination(query) {
  const page = Math.max(1, Number.parseInt(query.page || "1", 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(query.pageSize || "20", 10) || 20));
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}
