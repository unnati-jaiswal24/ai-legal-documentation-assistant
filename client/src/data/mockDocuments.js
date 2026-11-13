export const documentTypes = [
  { id: 'type-freelance', name: 'Freelance Service Agreement', category: 'Services' },
  { id: 'type-nda', name: 'Non-Disclosure Agreement', category: 'Confidentiality' },
  { id: 'type-consulting', name: 'Consulting Agreement', category: 'Services' },
  { id: 'type-ip', name: 'IP Assignment Agreement', category: 'Intellectual property' },
];

export const documents = [
  { id: 'document-1', ownerClientId: 'client-1', typeId: 'type-freelance', title: 'Website redesign agreement', status: 'in_review', createdAt: '2026-11-10T10:20:00.000Z', updatedAt: '2026-11-12T08:00:00.000Z' },
  { id: 'document-2', ownerClientId: 'client-1', typeId: 'type-nda', title: 'Product strategy NDA', status: 'draft', createdAt: '2026-11-08T14:15:00.000Z', updatedAt: '2026-11-11T09:40:00.000Z' },
  { id: 'document-3', ownerClientId: 'client-1', typeId: 'type-consulting', title: 'Brand consulting engagement', status: 'completed', createdAt: '2026-10-24T11:00:00.000Z', updatedAt: '2026-11-06T15:30:00.000Z' },
  { id: 'document-4', ownerClientId: 'client-2', typeId: 'type-freelance', title: 'Illustration services agreement', status: 'in_review', createdAt: '2026-11-11T07:30:00.000Z', updatedAt: '2026-11-12T10:00:00.000Z' },
  { id: 'document-5', ownerClientId: 'client-2', typeId: 'type-ip', title: 'Digital artwork rights', status: 'draft', createdAt: '2026-11-06T09:15:00.000Z', updatedAt: '2026-11-10T11:15:00.000Z' },
  { id: 'document-6', ownerClientId: 'client-3', typeId: 'type-consulting', title: 'Growth advisory terms', status: 'completed', createdAt: '2026-10-28T13:45:00.000Z', updatedAt: '2026-11-09T12:25:00.000Z' },
  { id: 'document-7', ownerClientId: 'client-4', typeId: 'type-freelance', title: 'Content production contract', status: 'draft', createdAt: '2026-11-12T12:10:00.000Z', updatedAt: '2026-11-12T12:10:00.000Z' },
  { id: 'document-8', ownerClientId: 'client-5', typeId: 'type-nda', title: 'Mutual confidentiality terms', status: 'in_review', createdAt: '2026-11-09T10:00:00.000Z', updatedAt: '2026-11-12T09:25:00.000Z' },
  { id: 'document-9', ownerClientId: 'client-3', typeId: 'type-freelance', title: 'Mobile app development agreement', status: 'completed', createdAt: '2026-10-18T08:45:00.000Z', updatedAt: '2026-11-03T16:20:00.000Z' },
  { id: 'document-10', ownerClientId: 'client-5', typeId: 'type-consulting', title: 'Operations advisory agreement', status: 'draft', createdAt: '2026-11-07T08:10:00.000Z', updatedAt: '2026-11-11T13:20:00.000Z' },
];

export function getDocumentType(typeId) {
  return documentTypes.find((type) => type.id === typeId) || null;
}
