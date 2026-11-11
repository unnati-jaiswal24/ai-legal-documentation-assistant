import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PublicLayout from '../layouts/PublicLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import { LoadingState } from '../components/StatePanel';

const Home = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../pages/Login'));
const Signup = lazy(() => import('../pages/Signup'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Drafts = lazy(() => import('../pages/Drafts'));
const NewDraft = lazy(() => import('../pages/NewDraft'));
const FillQuestions = lazy(() => import('../pages/FillQuestions'));
const Review = lazy(() => import('../pages/Review'));
const Preview = lazy(() => import('../pages/Preview'));
const Documents = lazy(() => import('../pages/Documents'));
const Consult = lazy(() => import('../pages/Consult'));
const Consultations = lazy(() => import('../pages/Consultations'));
const Profile = lazy(() => import('../pages/Profile'));
const Limitations = lazy(() => import('../pages/Limitations'));
const NotFound = lazy(() => import('../pages/NotFound'));

function PageFallback() {
  return <main className="workspace-main"><div className="workspace-content"><LoadingState label="Opening page…" /></div></main>;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="limitations" element={<Limitations />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="drafts" element={<Drafts />} />
            <Route path="drafts/new" element={<NewDraft />} />
            <Route path="drafts/:id/fill" element={<FillQuestions />} />
            <Route path="drafts/:id/review" element={<Review />} />
            <Route path="drafts/:id/preview" element={<Preview />} />
            <Route path="drafts/:id/documents" element={<Documents />} />
            <Route path="drafts/:id/consult" element={<Consult />} />
            <Route path="consultations" element={<Consultations />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
