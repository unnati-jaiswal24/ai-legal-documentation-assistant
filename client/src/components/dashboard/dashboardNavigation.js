import {
  Activity, Bell, BriefcaseBusiness, ChartNoAxesCombined, ClipboardCheck,
  FileCheck2, FilePlus2, FileSearch, Files, GraduationCap, LayoutDashboard,
  Settings, ShieldCheck, UserRound, Users,
} from 'lucide-react';

export const roleOptions = [
  { id: 'client', label: 'Client', role: 'CLIENT', path: '/dashboard/client' },
  { id: 'student', label: 'Law student', role: 'LAW_STUDENT', path: '/dashboard/student' },
  { id: 'admin', label: 'Admin', role: 'ADMIN', path: '/dashboard/admin' },
];

export const dashboardNavigation = {
  client: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '' },
    { label: 'My Documents', icon: Files, path: 'documents' },
    { label: 'Create Document', icon: FilePlus2, path: 'create-document' },
    { label: 'AI Document Review', icon: FileSearch, path: 'ai-review' },
    { label: 'Find Law Students', icon: GraduationCap, path: 'law-students' },
    { label: 'Review Requests', icon: ClipboardCheck, path: 'review-requests' },
    { label: 'Review History', icon: Activity, path: 'review-history' },
    { label: 'Notifications', icon: Bell, path: 'notifications' },
    { label: 'My Profile', icon: UserRound, path: 'profile' },
    { label: 'Settings', icon: Settings, path: 'settings' },
  ],
  student: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '' },
    { label: 'My Profile', icon: UserRound, path: 'profile' },
    { label: 'Review Requests', icon: ClipboardCheck, path: 'review-requests' },
    { label: 'Active Reviews', icon: FileCheck2, path: 'active-reviews' },
    { label: 'Completed Reviews', icon: ShieldCheck, path: 'completed-reviews' },
    { label: 'My Expertise', icon: GraduationCap, path: 'expertise' },
    { label: 'Portfolio', icon: BriefcaseBusiness, path: 'portfolio' },
    { label: 'Notifications', icon: Bell, path: 'notifications' },
    { label: 'Settings', icon: Settings, path: 'settings' },
  ],
  admin: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '' },
    { label: 'User Management', icon: Users, path: 'users' },
    { label: 'Client Management', icon: UserRound, path: 'clients' },
    { label: 'Law Student Management', icon: GraduationCap, path: 'students' },
    { label: 'Student Verification', icon: ShieldCheck, path: 'verification' },
    { label: 'Document Management', icon: Files, path: 'documents' },
    { label: 'Review Management', icon: ClipboardCheck, path: 'reviews' },
    { label: 'Analytics & Reports', icon: ChartNoAxesCombined, path: 'analytics' },
    { label: 'Notifications', icon: Bell, path: 'notifications' },
    { label: 'Settings', icon: Settings, path: 'settings' },
  ],
};

export const rolePresentation = {
  client: { title: 'Client workspace', label: 'Client', accent: 'Your agreements, reviews, and next steps.' },
  student: { title: 'Student workspace', label: 'Law student', accent: 'Build your profile and support thoughtful document reviews.' },
  admin: { title: 'Platform overview', label: 'Administrator', accent: 'Monitor platform health and manage community activity.' },
};

export function dashboardPath(role, section = '') {
  const base = `/dashboard/${role}`;
  return section ? `${base}/${section}` : base;
}
