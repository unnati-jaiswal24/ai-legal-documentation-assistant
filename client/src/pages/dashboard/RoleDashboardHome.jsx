import { lazy, Suspense } from 'react';
import { Navigate, useParams } from 'react-router-dom';

const dashboards = {
  client: lazy(() => import('./ClientDashboard')),
  student: lazy(() => import('./StudentDashboard')),
  admin: lazy(() => import('./AdminDashboard')),
};

export default function RoleDashboardHome() {
  const { role } = useParams();
  const Dashboard = dashboards[role];
  return Dashboard ? <Suspense fallback={<div className="rounded-2xl border border-[#e6e7df] bg-white p-8 text-center text-xs text-[#879084] dark:border-[#303a31] dark:bg-[#1b231c]">Opening your dashboard…</div>}><Dashboard /></Suspense> : <Navigate to="/dashboard/client" replace />;
}
