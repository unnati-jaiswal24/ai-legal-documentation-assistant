import { Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import Sidebar from '../components/Sidebar';

export default function DashboardLayout() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  return (
    <div className="workspace-shell md:flex">
      <Sidebar />
      <main className="workspace-main">
        <div className="workspace-content">
          <motion.div
            key={location.pathname}
            initial={reduceMotion ? false : { opacity: 0, y: 7 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.24, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
