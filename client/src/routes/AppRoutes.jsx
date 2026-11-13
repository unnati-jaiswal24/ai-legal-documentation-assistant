import { lazy, Suspense, useLayoutEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PublicLayout from '../layouts/PublicLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import SaralDocsHero from '../components/SaralDocsHero';
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
const DocumentDetails = lazy(() => import('../pages/DocumentDetails'));
const LegalReview = lazy(() => import('../pages/LegalReview'));
const AssistantUnavailable = lazy(() => import('../pages/AssistantUnavailable'));
const Settings = lazy(() => import('../pages/Settings'));
const Consult = lazy(() => import('../pages/Consult'));
const Consultations = lazy(() => import('../pages/Consultations'));
const Profile = lazy(() => import('../pages/Profile'));
const Limitations = lazy(() => import('../pages/Limitations'));
const NotFound = lazy(() => import('../pages/NotFound'));
const RoleDashboardLayout = lazy(() => import('../components/dashboard/DashboardLayout'));
const RoleDashboardHome = lazy(() => import('../pages/dashboard/RoleDashboardHome'));
const DashboardSection = lazy(() => import('../pages/dashboard/DashboardSection'));

function PageFallback() {
  return <main className="workspace-main"><div className="workspace-content"><LoadingState label="Opening page…" /></div></main>;
}

export default function AppRoutes() {
  const location = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {!location.pathname.startsWith('/dashboard/') && <SaralDocsHero />}
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
              <Route path="assistant" element={<AssistantUnavailable />} />
              <Route path="documents" element={<Drafts documentsMode />} />
              <Route path="documents/new" element={<NewDraft />} />
              <Route path="documents/:id" element={<DocumentDetails />} />
              <Route path="documents/:id/edit" element={<FillQuestions />} />
              <Route path="documents/:id/questions" element={<FillQuestions />} />
              <Route path="documents/:id/review" element={<Review />} />
              <Route path="documents/:id/preview" element={<Preview />} />
              <Route path="documents/:id/versions" element={<Documents />} />
              <Route path="templates" element={<NewDraft />} />
              <Route path="legal-review" element={<LegalReview />} />
              <Route path="drafts" element={<Drafts />} />
              <Route path="drafts/new" element={<NewDraft />} />
              <Route path="drafts/:id/fill" element={<FillQuestions />} />
              <Route path="drafts/:id/intake" element={<FillQuestions />} />
              <Route path="drafts/:id/review" element={<Review />} />
              <Route path="drafts/:id/preview" element={<Preview />} />
              <Route path="drafts/:id/documents" element={<Documents />} />
              <Route path="drafts/:id/consult" element={<Consult />} />
              <Route path="consultations" element={<Consultations />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>

          <Route path="dashboard/:role" element={<RoleDashboardLayout />}>
            <Route index element={<RoleDashboardHome />} />
            <Route path=":section" element={<DashboardSection />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}
