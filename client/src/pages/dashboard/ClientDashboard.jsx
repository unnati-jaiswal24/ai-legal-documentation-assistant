import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FilePlus2, FileSearch, Files, GraduationCap, MessageSquareText, Sparkles } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import DataTable from '../../components/dashboard/DataTable';
import EmptyState from '../../components/dashboard/EmptyState';
import RecentActivity from '../../components/dashboard/RecentActivity';
import SectionCard from '../../components/dashboard/SectionCard';
import StatCard from '../../components/dashboard/StatCard';
import StatusBadge from '../../components/dashboard/StatusBadge';
import useDashboardData from '../../hooks/useDashboardData';
import { formatDashboardDate } from '../../utils/dashboardFormatters';

function ActionCard({ to, icon: Icon, title, description, tone = 'green' }) {
  const tones = {
    green: 'bg-[#edf3ec] text-[#527256]',
    amber: 'bg-[#fbf2df] text-[#9a7433]',
    blue: 'bg-[#edf2f7] text-[#54718d]',
  };
  return (
    <Link to={to} className="group rounded-xl border border-[#e7e9e2] p-4 transition hover:-translate-y-0.5 hover:border-[#cbd7c9] hover:shadow-md dark:border-[#303a31] dark:hover:border-[#4a5d4b]">
      <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tones[tone]}`}><Icon size={16} /></span>
      <p className="mt-3 flex items-center justify-between gap-2 text-[11px] font-semibold text-[#465147] dark:text-[#d4dbd2]">{title}<ArrowRight size={13} className="text-[#8f9a8d] transition-transform group-hover:translate-x-0.5" /></p>
      <p className="mt-1 text-[9px] leading-4 text-[#899187]">{description}</p>
    </Link>
  );
}

export default function ClientDashboard() {
  const { person } = useOutletContext();
  const { data, loading } = useDashboardData();
  const client = data?.clients.find((profile) => profile.userId === person.id) || data?.clients[0];
  const docs = useMemo(() => (data?.documentsWithTypes || [])
    .filter((document) => document.ownerClientId === client?.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [client?.id, data?.documentsWithTypes]);
  const requests = useMemo(() => (data?.requestRows || [])
    .filter((request) => request.clientId === client?.id)
    .sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt)), [client?.id, data?.requestRows]);
  const openReviews = requests.filter((request) => ['pending', 'accepted'].includes(request.status)).length;
  const completedReviews = requests.filter((request) => request.status === 'completed').length;
  const drafts = docs.filter((document) => document.status === 'draft').length;
  const user = data?.users.find((item) => item.id === person.id);
  const activity = (data?.activity || []).filter((item) => item.actorId === person.id
    || (['review_accepted', 'review_requested'].includes(item.type) && requests.some((request) => request.id === item.entityId))
    || (item.type === 'review_completed' && data?.reviews.some((review) => review.id === item.entityId && review.clientId === client?.id)));

  const documentColumns = [
    { key: 'title', label: 'Document', render: (row) => <span className="font-semibold text-[#465147] dark:text-[#d4dbd2]">{row.title}</span> },
    { key: 'documentType', label: 'Type' },
    { key: 'createdAt', label: 'Created', render: (row) => formatDashboardDate(row.createdAt), sortValue: (row) => row.createdAt },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];
  const reviewColumns = [
    { key: 'studentName', label: 'Reviewer' },
    { key: 'documentTitle', label: 'Document', render: (row) => <span className="font-medium text-[#465147] dark:text-[#d4dbd2]">{row.documentTitle}</span> },
    { key: 'requestedAt', label: 'Requested', render: (row) => formatDashboardDate(row.requestedAt), sortValue: (row) => row.requestedAt },
    { key: 'requestedCompletionAt', label: 'Due', render: (row) => formatDashboardDate(row.requestedCompletionAt), sortValue: (row) => row.requestedCompletionAt },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div>
      <DashboardHeader
        eyebrow="Your workspace"
        title={`Good morning, ${person.fullName.split(' ')[0]}.`}
        description="A clear view of your legal documents, review progress, and what to do next."
        actions={<Link to="/documents/new" className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#31583b] px-4 text-[11px] font-semibold text-white transition hover:bg-[#284b32] dark:bg-[#779779] dark:text-[#101a12]"><FilePlus2 size={14} /> Create document</Link>}
      />

      <section aria-label="Document and review summary" className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Total documents" value={loading ? '—' : docs.length} icon={Files} helper="Across your workspace" />
        <StatCard label="Draft documents" value={loading ? '—' : drafts} icon={FilePlus2} tone="blue" helper="Ready to continue" />
        <StatCard label="Pending reviews" value={loading ? '—' : openReviews} icon={FileSearch} tone="amber" helper="Waiting or in progress" />
        <StatCard label="Completed reviews" value={loading ? '—' : completedReviews} icon={Sparkles} tone="green" helper="Feedback received" />
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
        <SectionCard title="Your documents" description="Recently created agreements and their current status." action={<Link to="/dashboard/client/documents" className="text-[10px] font-semibold text-[#55775d] hover:underline dark:text-[#a9c5a9]">View all</Link>}>
          {docs.length ? <DataTable columns={documentColumns} rows={docs.slice(0, 5)} searchPlaceholder="Search your documents" pageSize={5} /> : <EmptyState title="No documents yet" description="Choose a reviewed template to create your first document." action={<Link to="/documents/new" className="text-[10px] font-semibold text-[#55775d] hover:underline">Create document</Link>} />}
        </SectionCard>
        <SectionCard title="Recent activity" description="A short timeline of your workspace updates.">
          <RecentActivity items={activity.slice(0, 5)} />
        </SectionCard>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
        <SectionCard title="Review requests" description="Track the students reviewing your documents." action={<Link to="/dashboard/client/review-requests" className="text-[10px] font-semibold text-[#55775d] hover:underline dark:text-[#a9c5a9]">All requests</Link>}>
          {requests.length ? <DataTable columns={reviewColumns} rows={requests.slice(0, 5)} searchPlaceholder="Search review requests" pageSize={5} filterOptions={[
            { value: 'pending', label: 'Pending' },
            { value: 'accepted', label: 'Accepted' },
            { value: 'completed', label: 'Completed' },
            { value: 'rejected', label: 'Rejected' },
          ]} /> : <EmptyState title="No review requests" description="Request a student review when you want a second set of eyes." />}
        </SectionCard>
        <SectionCard title="Quick actions" description="Pick up the next step that works for you.">
          <div className="grid gap-2 p-3 sm:grid-cols-3 xl:grid-cols-1">
            <ActionCard to="/documents/new" icon={FilePlus2} title="Create a document" description="Start from a reviewed template." />
            <ActionCard to="/dashboard/client/review-requests" icon={Sparkles} title="Request a review" description="Invite a verified law student." tone="amber" />
            <ActionCard to="/dashboard/client/law-students" icon={GraduationCap} title="Browse students" description="Explore verified reviewer profiles." tone="blue" />
          </div>
        </SectionCard>
      </div>

      <p className="mt-5 flex items-start gap-2 rounded-xl border border-[#e9e9e2] bg-[#fbfcfa] p-3 text-[9px] leading-4 text-[#899187] dark:border-[#303a31] dark:bg-[#1b231c]">
        <MessageSquareText size={13} className="mt-0.5 shrink-0 text-[#78977b]" />
        Student feedback is educational information only. It is not professional legal advice or a substitute for review by a qualified advocate.
      </p>
      {user?.email && <span className="sr-only">Signed in as {user.email}</span>}
    </div>
  );
}
