import { useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { ArrowRight, Bell, Check, CheckCircle2, FilePlus2, FileSearch, GraduationCap, ShieldCheck, Star, X } from 'lucide-react';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import DataTable from '../../components/dashboard/DataTable';
import EmptyState from '../../components/dashboard/EmptyState';
import SectionCard from '../../components/dashboard/SectionCard';
import StatusBadge from '../../components/dashboard/StatusBadge';
import useDashboardData from '../../hooks/useDashboardData';
import { createReviewRequest } from '../../services/reviewService';
import { updateStudentProfile } from '../../services/studentService';
import { updateUserProfile } from '../../services/userService';
import { updateReviewRequest } from '../../services/reviewService';
import { formatDashboardDate, titleCase } from '../../utils/dashboardFormatters';

function InlineNotice({ children }) {
  return <p role="status" className="mb-4 rounded-lg border border-[#dce8da] bg-[#f3f8f2] px-3 py-2 text-[10px] leading-5 text-[#55775d] dark:border-[#354537] dark:bg-[#202820] dark:text-[#b4c8b1]">{children}</p>;
}

function ReviewRequestForm({ person, data, reload, aiPreview = false }) {
  const client = data.clients.find((profile) => profile.userId === person.id) || data.clients[0];
  const documents = data.documentsWithTypes.filter((document) => document.ownerClientId === client?.id);
  const verifiedStudents = data.studentRows.filter((student) => student.verificationStatus === 'verified');
  const [documentId, setDocumentId] = useState(documents[0]?.id || '');
  const [studentId, setStudentId] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [minimumDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setMessage('');
    try {
      if (aiPreview) {
        setSubmitted(true);
        setMessage('Mock review preview is ready. No AI provider or backend was contacted.');
        return;
      }
      await createReviewRequest({
        clientId: client.id,
        documentId,
        studentId: studentId || null,
        description,
        requestedCompletionAt: new Date(`${deadline}T18:00:00`).toISOString(),
      });
      setSubmitted(true);
      setMessage('Review request added to mock dashboard data only. It has not been sent to a reviewer.');
      await reload();
    } catch (error) {
      setMessage(error.message);
    }
  }

  if (!documents.length) return <EmptyState title="Create a document first" description="Your documents will appear here so you can select one for review." action={<Link to="/documents/new" className="text-[10px] font-semibold text-[#55775d] hover:underline">Create document</Link>} />;

  return (
    <div className="p-4 sm:p-5">
      {message && <InlineNotice>{message}</InlineNotice>}
      {submitted && aiPreview ? (
        <div className="rounded-xl border border-[#e6e7df] bg-[#fafbf8] p-4 dark:border-[#303a31] dark:bg-[#202820]">
          <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#55775d]" /><p className="text-xs font-semibold text-[#465147] dark:text-[#d4dbd2]">Sample review preview · {documents.find((document) => document.id === documentId)?.title}</p></div>
          <ul className="mt-3 space-y-2 text-[10px] leading-5 text-[#6d776c] dark:text-[#adb6ab]">
            <li><span className="font-semibold text-[#8b6c35]">Check:</span> Confirm the payment schedule and due dates are stated consistently.</li>
            <li><span className="font-semibold text-[#8b6c35]">Check:</span> Make sure deliverables and acceptance criteria are described clearly.</li>
            <li><span className="font-semibold text-[#55775d]">Note:</span> This is static sample content, not an AI analysis or legal advice.</li>
          </ul>
        </div>
      ) : (
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <label className="text-[10px] font-semibold text-[#657064] dark:text-[#b4bdb2]">
            Document
            <select required value={documentId} onChange={(event) => setDocumentId(event.target.value)} className="form-control mt-1.5 text-[11px]">
              {documents.map((document) => <option key={document.id} value={document.id}>{document.title}</option>)}
            </select>
          </label>
          {!aiPreview && (
            <label className="text-[10px] font-semibold text-[#657064] dark:text-[#b4bdb2]">
              Preferred verified student (optional)
              <select value={studentId} onChange={(event) => setStudentId(event.target.value)} className="form-control mt-1.5 text-[11px]">
                <option value="">Match based on availability</option>
                {verifiedStudents.map((student) => <option key={student.id} value={student.id}>{student.name} · {student.university}</option>)}
              </select>
            </label>
          )}
          {!aiPreview && (
            <>
              <label className="text-[10px] font-semibold text-[#657064] md:col-span-2 dark:text-[#b4bdb2]">
                What would you like the reviewer to focus on?
                <textarea required minLength={10} maxLength={800} rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="For example, payment timing and deliverable acceptance." className="form-control mt-1.5 resize-y text-[11px]" />
              </label>
              <label className="text-[10px] font-semibold text-[#657064] dark:text-[#b4bdb2]">
                Requested completion date
                <input required type="date" min={minimumDate} value={deadline} onChange={(event) => setDeadline(event.target.value)} className="form-control mt-1.5 text-[11px]" />
              </label>
            </>
          )}
          <div className="flex items-end">
            <button type="submit" className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#31583b] px-4 text-[10px] font-semibold text-white hover:bg-[#284b32] dark:bg-[#779779] dark:text-[#101a12]">
              {aiPreview ? <><FileSearch size={14} /> Preview sample review</> : <><ShieldCheck size={14} /> Add mock review request</>}
            </button>
          </div>
          <p className="text-[9px] leading-4 text-[#92998f] md:col-span-2">{aiPreview ? 'Static local preview only. Document content is not sent to an AI service.' : 'Mock interaction only. This will not contact a student or save anything to a backend.'}</p>
        </form>
      )}
    </div>
  );
}

function ClientSection({ section, person, data, reload }) {
  const client = data.clients.find((profile) => profile.userId === person.id) || data.clients[0];
  const documents = data.documentsWithTypes.filter((document) => document.ownerClientId === client?.id);
  const requests = data.requestRows.filter((request) => request.clientId === client?.id);
  const profileUser = data.users.find((user) => user.id === person.id);
  const students = data.studentRows.filter((student) => student.verificationStatus === 'verified');

  if (section === 'create-document') return (
    <SectionCard title="Start a legal document" description="Choose a reviewed template to continue in the existing document workflow.">
      <div className="p-4 sm:p-6">
        <div className="flex items-start gap-3 rounded-xl bg-[#f5f7f3] p-4 dark:bg-[#202820]"><FilePlus2 size={18} className="mt-0.5 text-[#55775d]" /><div><p className="text-xs font-semibold text-[#465147] dark:text-[#d4dbd2]">Freelance agreement workspace</p><p className="mt-1 text-[10px] leading-5 text-[#879084]">Continue with the existing template-based document creation flow. This dashboard does not create backend records.</p><Link to="/documents/new" className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-[#55775d] hover:underline">Open document templates <ArrowRight size={12} /></Link></div></div>
      </div>
    </SectionCard>
  );
  if (section === 'ai-review') return (
    <SectionCard title="AI document review" description="Preview the review experience using static sample feedback. No document text leaves this page.">
      <ReviewRequestForm person={person} data={data} reload={reload} aiPreview />
    </SectionCard>
  );
  if (section === 'review-requests') return <ClientReviewRequests person={person} data={data} requests={requests} reload={reload} />;
  if (section === 'review-history') return <DataTable columns={requestColumns} rows={requests.filter((request) => ['completed', 'rejected'].includes(request.status))} searchPlaceholder="Search review history" pageSize={8} />;
  if (section === 'law-students') return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {students.map((student) => (
        <article key={student.id} className="rounded-2xl border border-[#e6e7df] bg-white p-4 dark:border-[#303a31] dark:bg-[#1b231c]">
          <div className="flex items-start justify-between gap-2"><div className="flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#edf3ec] text-[#527256]"><GraduationCap size={16} /></span><div><h2 className="text-[11px] font-semibold text-[#465147] dark:text-[#d4dbd2]">{student.name}</h2><p className="mt-0.5 text-[9px] text-[#879084]">{student.university}</p></div></div><StatusBadge status="verified" /></div>
          <p className="mt-3 flex items-center gap-1 text-[10px] font-semibold text-[#8d743c]"><Star size={12} className="fill-[#d5b563]" />{student.rating?.toFixed(1) || 'New'} <span className="font-normal text-[#92998f]">· {student.completedReviews} reviews</span></p>
          <div className="mt-3 flex flex-wrap gap-1.5">{student.expertise.map((area) => <span key={area} className="rounded-full bg-[#f0f3ed] px-2 py-1 text-[9px] text-[#607560] dark:bg-[#29352b] dark:text-[#bacbbb]">{area}</span>)}</div>
          <p className="mt-3 text-[9px] leading-4 text-[#92998f]">Verified law student · Educational feedback only</p>
        </article>
      ))}
    </div>
  );
  if (section === 'notifications') return <NotificationList userId={person.id} data={data} />;
  if (section === 'profile') return <ProfileEditor role="client" person={person} user={profileUser} reload={reload} />;
  if (section === 'settings') return <SettingsPanel role="client" />;
  if (section === 'documents') return <DataTable columns={documentColumns} rows={documents} searchPlaceholder="Search your documents" pageSize={8} filterOptions={documentFilters} />;
  return <ReviewRequestForm person={person} data={data} reload={reload} />;
}

function ClientReviewRequests({ person, data, requests, reload }) {
  const [creating, setCreating] = useState(false);
  return (
    <SectionCard title="Review requests" description="Follow your student-review requests and expected completion dates." action={<button type="button" onClick={() => setCreating((value) => !value)} className="rounded-full bg-[#31583b] px-3 py-2 text-[9px] font-semibold text-white hover:bg-[#284b32] dark:bg-[#779779] dark:text-[#101a12]">{creating ? 'Close form' : 'New review request'}</button>}>
      {creating && <div className="border-b border-[#ecece6] dark:border-[#303a31]"><ReviewRequestForm person={person} data={data} reload={reload} /></div>}
      {requests.length ? <DataTable columns={requestColumns} rows={requests} searchPlaceholder="Search review requests" pageSize={8} filterOptions={reviewFilters} /> : <EmptyState title="No review requests yet" description="Create a request to ask an eligible student for feedback." />}
    </SectionCard>
  );
}

function StudentSection({ section, person, data, reload }) {
  const student = data.students.find((profile) => profile.userId === person.id) || data.students[0];
  const assigned = data.requestRows.filter((request) => request.studentId === student?.id);
  const pending = assigned.filter((request) => request.status === 'pending');
  const completed = assigned.filter((request) => request.status === 'completed');
  const user = data.users.find((item) => item.id === student?.userId);
  if (section === 'review-requests') return <StudentRequestsTable rows={pending} verified={student?.verificationStatus === 'verified'} reload={reload} />;
  if (section === 'active-reviews') return <DataTable columns={studentRequestColumns} rows={assigned.filter((request) => request.status === 'accepted')} searchPlaceholder="Search active reviews" pageSize={8} />;
  if (section === 'completed-reviews' || section === 'portfolio') return <DataTable columns={studentRequestColumns} rows={completed} searchPlaceholder="Search completed reviews" pageSize={8} />;
  if (section === 'profile' || section === 'expertise') return <ProfileEditor role="student" person={person} student={student} user={user} data={data} reload={reload} expertiseOnly={section === 'expertise'} />;
  if (section === 'notifications') return <NotificationList userId={person.id} data={data} />;
  if (section === 'settings') return <SettingsPanel role="student" />;
  return <div className="rounded-2xl border border-[#e6e7df] bg-white p-5 text-xs text-[#687267] dark:border-[#303a31] dark:bg-[#1b231c]">Choose a review request or update your student profile to get started.</div>;
}

function StudentRequestsTable({ rows, verified, reload }) {
  const [message, setMessage] = useState('');
  async function respond(requestId, status) {
    setMessage('');
    try {
      await updateReviewRequest(requestId, status);
      setMessage(`Request ${status} in this mock preview.`);
      await reload();
    } catch (error) {
      setMessage(error.message);
    }
  }
  const columns = [
    { key: 'clientName', label: 'Client' },
    { key: 'documentTitle', label: 'Document' },
    { key: 'description', label: 'Focus area' },
    { key: 'requestedCompletionAt', label: 'Due', render: (row) => formatDashboardDate(row.requestedCompletionAt) },
    { key: 'actions', label: 'Respond', sortable: false, render: (row) => <div className="flex items-center gap-1"><button type="button" disabled={!verified} onClick={() => respond(row.id, 'accepted')} className="inline-flex h-7 items-center gap-1 rounded-lg border border-[#d9e7d8] bg-[#f0f6ef] px-2 text-[9px] font-semibold text-[#42694a] disabled:opacity-40"><Check size={11} /> Accept</button><button type="button" onClick={() => respond(row.id, 'rejected')} className="inline-flex h-7 items-center gap-1 rounded-lg border border-[#ead9d4] bg-[#fcf3f0] px-2 text-[9px] font-semibold text-[#9a5648]"><X size={11} /> Decline</button></div> },
  ];
  return (
    <SectionCard title="Incoming review requests" description={verified ? 'Accept or decline requests assigned to you.' : 'You must be verified before accepting review requests.'}>
      {message && <InlineNotice>{message}</InlineNotice>}
      {rows.length ? <DataTable columns={columns} rows={rows} searchPlaceholder="Search incoming requests" pageSize={8} /> : <EmptyState title="No pending requests" description="New review invitations will appear here." />}
    </SectionCard>
  );
}

function AdminSection({ section, data, reload }) {
  const users = data.users.map((user) => ({ ...user, roleLabel: titleCase(user.role) }));
  const pendingStudents = data.studentRows.filter((student) => student.verificationStatus === 'pending');
  if (section === 'users') return <DataTable columns={adminUserColumns} rows={users} searchPlaceholder="Search all users" pageSize={10} filterOptions={[{ value: 'active', label: 'Active' }, { value: 'suspended', label: 'Suspended' }]} />;
  if (section === 'clients') {
    const clientUsers = users.filter((user) => user.role === 'CLIENT').map((user) => ({ ...user, organization: data.clients.find((client) => client.userId === user.id)?.organizationName || '—' }));
    return <DataTable columns={clientColumns} rows={clientUsers} searchPlaceholder="Search clients" pageSize={8} filterOptions={[{ value: 'active', label: 'Active' }, { value: 'suspended', label: 'Suspended' }]} />;
  }
  if (section === 'students') return <DataTable columns={adminStudentColumns} rows={data.studentRows} searchPlaceholder="Search law students" pageSize={8} filterOptions={[{ value: 'verified', label: 'Verified' }, { value: 'pending', label: 'Pending verification' }]} />;
  if (section === 'verification') return <DataTable columns={verificationColumns(reload)} rows={pendingStudents} searchPlaceholder="Search pending verification queue" pageSize={8} filterOptions={[{ value: 'pending', label: 'Pending' }]} />;
  if (section === 'documents') return <DataTable columns={documentColumns} rows={data.documentsWithTypes} searchPlaceholder="Search platform documents" pageSize={8} filterOptions={documentFilters} />;
  if (section === 'reviews') return <DataTable columns={adminRequestColumns} rows={data.requestRows} searchPlaceholder="Search platform review requests" pageSize={8} filterOptions={reviewFilters} />;
  if (section === 'analytics') return <div className="rounded-2xl border border-[#e6e7df] bg-white p-5 text-xs text-[#687267] dark:border-[#303a31] dark:bg-[#1b231c]">The analytics overview is available on the administrator dashboard.</div>;
  if (section === 'notifications') return <NotificationList userId="user-admin-1" data={data} />;
  if (section === 'settings') return <SettingsPanel role="admin" />;
  return null;
}

export default function DashboardSection() {
  const { role, person } = useOutletContext();
  const { section } = useParams();
  const { data, loading, error, reload } = useDashboardData();
  const title = sectionTitle[role]?.[section] || 'Workspace';

  if (loading) return <div className="rounded-2xl border border-[#e6e7df] bg-white p-8 text-center text-xs text-[#879084] dark:border-[#303a31] dark:bg-[#1b231c]">Loading your workspace preview…</div>;
  if (error || !data) return <div role="alert" className="rounded-2xl border border-[#ead5cf] bg-white p-5 text-xs text-[#8d4e3e] dark:border-[#68463d] dark:bg-[#1b231c]">{error || 'Workspace preview is unavailable.'}</div>;
  return (
    <div>
      <DashboardHeader eyebrow={`${title} · ${titleCase(role)}`} title={title} description={sectionDescription[role]?.[section] || 'Manage this part of your SaralDocs workspace.'} actions={<Link to={`/dashboard/${role}`} className="text-[10px] font-semibold text-[#55775d] hover:underline">Back to dashboard</Link>} />
      {role === 'client' && <ClientSection section={section} person={person} data={data} reload={reload} />}
      {role === 'student' && <StudentSection section={section} person={person} data={data} reload={reload} />}
      {role === 'admin' && <AdminSection section={section} data={data} reload={reload} />}
      <p className="mt-4 text-[9px] text-[#92998f]">This area uses frontend-only mock data. Changes are temporary and do not reach a backend.</p>
    </div>
  );
}

function ProfileEditor({ role, person, user, student, data, reload, expertiseOnly = false }) {
  const [name, setName] = useState(user?.fullName || person.fullName);
  const [degree, setDegree] = useState(student?.degree || '');
  const [year, setYear] = useState(student?.academicYear || 1);
  const [selectedExpertise, setSelectedExpertise] = useState(student?.expertiseIds || []);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const studentView = role === 'student';

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      if (!expertiseOnly) await updateUserProfile(user?.id || person.id, { fullName: name });
      if (studentView) await updateStudentProfile(student.id, { degree, academicYear: Number(year), expertiseIds: selectedExpertise });
      setMessage('Profile preview updated in local mock state.');
      await reload();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  function toggleExpertise(id) {
    setSelectedExpertise((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  }

  return (
    <SectionCard title={expertiseOnly ? 'My expertise' : 'Profile details'} description="Edit sample profile information in this browser preview.">
      <form onSubmit={submit} className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
        {!expertiseOnly && (
          <label className="text-[10px] font-semibold text-[#657064] dark:text-[#b4bdb2]">Full name<input value={name} onChange={(event) => setName(event.target.value)} required className="form-control mt-1.5 text-[11px]" /></label>
        )}
        {studentView && (
          <>
            <label className="text-[10px] font-semibold text-[#657064] dark:text-[#b4bdb2]">Degree<input value={degree} onChange={(event) => setDegree(event.target.value)} required className="form-control mt-1.5 text-[11px]" /></label>
            <label className="text-[10px] font-semibold text-[#657064] dark:text-[#b4bdb2]">Current academic year<input type="number" min="1" max="6" value={year} onChange={(event) => setYear(event.target.value)} required className="form-control mt-1.5 text-[11px]" /></label>
            <div className="sm:col-span-2">
              <p className="text-[10px] font-semibold text-[#657064] dark:text-[#b4bdb2]">Areas of expertise</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(data?.expertiseAreas || []).map((area) => (
                  <label key={area.id} className={`cursor-pointer rounded-full border px-3 py-1.5 text-[9px] ${selectedExpertise.includes(area.id) ? 'border-[#9ab39a] bg-[#edf3ec] text-[#45674c]' : 'border-[#e4e6df] text-[#788176] dark:border-[#39443a] dark:text-[#adb6ab]'}`}>
                    <input type="checkbox" checked={selectedExpertise.includes(area.id)} onChange={() => toggleExpertise(area.id)} className="sr-only" />{area.name}
                  </label>
                ))}
              </div>
            </div>
          </>
        )}
        {message && <p role="status" className="text-[10px] text-[#55775d] sm:col-span-2">{message}</p>}
        <div className="sm:col-span-2"><button type="submit" disabled={saving} className="inline-flex min-h-9 items-center rounded-full bg-[#31583b] px-4 text-[10px] font-semibold text-white hover:bg-[#284b32] disabled:opacity-50 dark:bg-[#779779] dark:text-[#101a12]">{saving ? 'Saving…' : 'Save mock profile'}</button></div>
        {studentView && <div className="flex items-center gap-2 text-[9px] text-[#879084] sm:col-span-2"><ShieldCheck size={13} />Verification status remains controlled by the platform and cannot be changed here.</div>}
      </form>
    </SectionCard>
  );
}

function NotificationList({ userId, data }) {
  const items = data.notifications?.filter((item) => item.userId === userId) || [];
  return (
    <SectionCard title="Notifications" description="Updates from your mock workspace.">
      {items.length ? <ul className="divide-y divide-[#eff0eb] dark:divide-[#303a31]">{items.map((item) => <li key={item.id} className="flex gap-3 px-4 py-4"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf3ec] text-[#58765b]"><Bell size={14} /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-[11px] font-semibold text-[#465147] dark:text-[#d4dbd2]">{item.title}</p><StatusBadge status={item.read ? 'completed' : 'pending'} /></div><p className="mt-1 text-[10px] leading-4 text-[#7b857a]">{item.message}</p><p className="mt-1 text-[9px] text-[#9aa197]">{formatDashboardDate(item.createdAt)}</p></div></li>)}</ul> : <EmptyState title="No notifications" description="You’re up to date." />}
    </SectionCard>
  );
}

function SettingsPanel({ role }) {
  const [preferences, setPreferences] = useState({ email: true, updates: true, digest: false });
  return (
    <SectionCard title="Workspace settings" description="These preference toggles are stored only in this page preview.">
      <div className="divide-y divide-[#eff0eb] dark:divide-[#303a31]">
        {[
          ['email', 'Email notifications', 'Receive updates when a request or document changes.'],
          ['updates', 'Product updates', 'See product improvements in your workspace.'],
          ['digest', 'Weekly summary', 'Get a weekly activity summary.'],
        ].map(([key, title, description]) => (
          <label key={key} className="flex cursor-pointer items-center justify-between gap-4 px-4 py-4">
            <span><span className="block text-[11px] font-semibold text-[#465147] dark:text-[#d4dbd2]">{title}</span><span className="mt-1 block text-[9px] text-[#879084]">{description}</span></span>
            <input type="checkbox" checked={preferences[key]} onChange={(event) => setPreferences((current) => ({ ...current, [key]: event.target.checked }))} aria-label={`${title} preference`} className="h-4 w-4 accent-[#55775d]" />
          </label>
        ))}
      </div>
      <p className="px-4 pb-4 text-[9px] text-[#92998f]">Role: {titleCase(role)} · Settings have not been saved to an account.</p>
    </SectionCard>
  );
}

const reviewFilters = [
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
];
const documentFilters = [
  { value: 'draft', label: 'Draft' },
  { value: 'in_review', label: 'In review' },
  { value: 'completed', label: 'Completed' },
];
const documentColumns = [
  { key: 'title', label: 'Document', render: (row) => <span className="font-semibold text-[#465147] dark:text-[#d4dbd2]">{row.title}</span> },
  { key: 'documentType', label: 'Type' },
  { key: 'createdAt', label: 'Created', render: (row) => formatDashboardDate(row.createdAt), sortValue: (row) => row.createdAt },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
];
const requestColumns = [
  { key: 'studentName', label: 'Reviewer' },
  { key: 'documentTitle', label: 'Document' },
  { key: 'requestedAt', label: 'Requested', render: (row) => formatDashboardDate(row.requestedAt), sortValue: (row) => row.requestedAt },
  { key: 'requestedCompletionAt', label: 'Due', render: (row) => formatDashboardDate(row.requestedCompletionAt), sortValue: (row) => row.requestedCompletionAt },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
];
const studentRequestColumns = [
  { key: 'clientName', label: 'Client' },
  { key: 'documentTitle', label: 'Document' },
  { key: 'description', label: 'Focus area' },
  { key: 'requestedCompletionAt', label: 'Due', render: (row) => formatDashboardDate(row.requestedCompletionAt) },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
];
const adminUserColumns = [
  { key: 'fullName', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'roleLabel', label: 'Role' },
  { key: 'createdAt', label: 'Joined', render: (row) => formatDashboardDate(row.createdAt) },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
];
const clientColumns = [
  { key: 'fullName', label: 'Client' },
  { key: 'email', label: 'Email' },
  { key: 'organization', label: 'Organization' },
  { key: 'createdAt', label: 'Joined', render: (row) => formatDashboardDate(row.createdAt) },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
];
const adminStudentColumns = [
  { key: 'name', label: 'Student' },
  { key: 'university', label: 'University' },
  { key: 'expertise', label: 'Expertise', render: (row) => row.expertise.join(', ') },
  { key: 'completedReviews', label: 'Reviews' },
  { key: 'verificationStatus', label: 'Verification', render: (row) => <StatusBadge status={row.verificationStatus} /> },
];
const adminRequestColumns = [
  { key: 'clientName', label: 'Client' },
  { key: 'studentName', label: 'Student' },
  { key: 'documentTitle', label: 'Document' },
  { key: 'requestedAt', label: 'Requested', render: (row) => formatDashboardDate(row.requestedAt) },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
];
function verificationColumns(reload) {
  return [
    { key: 'name', label: 'Student' },
    { key: 'university', label: 'University' },
    { key: 'degree', label: 'Degree' },
    { key: 'verificationStatus', label: 'Status', render: (row) => <StatusBadge status={row.verificationStatus} /> },
    { key: 'actions', label: 'Action', sortable: false, render: (row) => <VerificationButton student={row} reload={reload} /> },
  ];
}
function VerificationButton({ student, reload }) {
  const [done, setDone] = useState(false);
  async function verify() {
    await updateStudentProfile(student.id, { verificationStatus: 'verified' });
    setDone(true);
    await reload();
  }
  return <button type="button" onClick={verify} disabled={done} className="inline-flex items-center gap-1 rounded-lg border border-[#d9e7d8] bg-[#f0f6ef] px-2.5 py-1.5 text-[9px] font-semibold text-[#42694a] disabled:opacity-50">{done ? 'Verified' : 'Verify'}<CheckCircle2 size={11} /></button>;
}

const sectionTitle = {
  client: { documents: 'My documents', 'create-document': 'Create document', 'ai-review': 'AI document review', 'law-students': 'Find law students', 'review-requests': 'Review requests', 'review-history': 'Review history', notifications: 'Notifications', profile: 'My profile', settings: 'Settings' },
  student: { profile: 'My profile', 'review-requests': 'Review requests', 'active-reviews': 'Active reviews', 'completed-reviews': 'Completed reviews', expertise: 'My expertise', portfolio: 'Portfolio', notifications: 'Notifications', settings: 'Settings' },
  admin: { users: 'User management', clients: 'Client management', students: 'Law student management', verification: 'Student verification', documents: 'Document management', reviews: 'Review management', analytics: 'Analytics & reports', notifications: 'Notifications', settings: 'Settings' },
};
const sectionDescription = {
  client: { documents: 'Review the documents and drafts in your workspace.', 'create-document': 'Start a document from a reviewed template.', 'ai-review': 'Preview a safe, static example of the document review experience.', 'law-students': 'Browse verified law students who may be available to review a document.', 'review-requests': 'Follow review requests and expected completion dates.', 'review-history': 'Look back at completed or declined requests.', notifications: 'Updates about your documents and requests.', profile: 'Manage the account details shown in your client workspace.', settings: 'Adjust local preview preferences.' },
  student: { profile: 'Manage your academic information and reviewer profile.', 'review-requests': 'Review invitations assigned to you.', 'active-reviews': 'Track work you have accepted.', 'completed-reviews': 'Your previously completed review requests.', expertise: 'Choose the subjects shown on your profile.', portfolio: 'A record of completed review work.', notifications: 'Updates about review requests and deadlines.', settings: 'Adjust local preview preferences.' },
  admin: { users: 'Search and filter member accounts across the platform.', clients: 'Review client accounts and their organization profiles.', students: 'Review student profiles, activity, and eligibility.', verification: 'Review pending student verification records.', documents: 'Search documents and their current workflow statuses.', reviews: 'Monitor submitted review requests and outcomes.', analytics: 'Platform-level trends and service health.', notifications: 'Platform administration updates.', settings: 'Adjust local preview preferences.' },
};
