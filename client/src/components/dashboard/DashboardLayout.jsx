import { useEffect, useMemo, useState } from 'react';
import { Outlet, Navigate, useParams } from 'react-router-dom';
import { dashboardMockStore } from '../../data/dashboardMockStore';
import { listNotifications } from '../../services/userService';
import DashboardNavbar from './DashboardNavbar';
import DashboardSidebar from './DashboardSidebar';
import { rolePresentation } from './dashboardNavigation';

const demoAccountIds = {
  client: 'user-client-1',
  student: 'user-student-1',
  admin: 'user-admin-1',
};

export default function DashboardLayout() {
  const { role } = useParams();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const activeRole = ['client', 'student', 'admin'].includes(role) ? role : null;
  const demoUserId = activeRole ? demoAccountIds[activeRole] : null;
  const demoUser = dashboardMockStore.users.find((item) => item.id === demoUserId);
  const person = useMemo(() => ({
    id: demoUser?.id || 'demo-user',
    fullName: demoUser?.fullName || 'SaralDocs member',
    email: demoUser?.email || 'member@example.in',
  }), [demoUser]);

  useEffect(() => {
    if (!demoUserId) return;
    let active = true;
    listNotifications(demoUserId).then((items) => {
      if (active) setNotifications(items);
    });
    return () => { active = false; };
  }, [demoUserId]);

  if (!activeRole) return <Navigate to="/dashboard/client" replace />;
  const presentation = rolePresentation[activeRole];

  return (
    <div className="min-h-screen bg-[#f7f7f3] text-[#29332a] md:flex dark:bg-[#121813] dark:text-[#e8ece6]">
      <DashboardSidebar
        role={activeRole}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className="min-w-0 flex-1">
        <DashboardNavbar role={activeRole} person={person} notifications={notifications} onMobileMenu={() => setMobileOpen(true)} />
        <main className="min-w-0 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1440px]">
            <Outlet context={{ role: activeRole, person, presentation }} />
          </div>
        </main>
      </div>
    </div>
  );
}
