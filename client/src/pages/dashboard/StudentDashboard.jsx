import { useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { ArrowRight, Check, GraduationCap, ShieldCheck, Star, X } from 'lucide-react';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import DataTable from '../../components/dashboard/DataTable';
import EmptyState from '../../components/dashboard/EmptyState';
import SectionCard from '../../components/dashboard/SectionCard';
import StatCard from '../../components/dashboard/StatCard';
import StatusBadge from '../../components/dashboard/StatusBadge';
import useDashboardData from '../../hooks/useDashboardData';
import { updateReviewRequest } from '../../services/reviewService';
import { formatDashboardDate } from '../../utils/dashboardFormatters';

function ActionButton({ label, icon: Icon, onClick, variant = 'accept', disabled }) {
  const classes = variant === 'accept'
    ? 'border-[#d9e7d8] bg-[#f0f6ef] text-[#42694a] hover:bg-[#e6f0e5]'
    : 'border-[#ead9d4] bg-[#fcf3f0] text-[#9a5648] hover:bg-[#f8e9e4]';
  return <button type="button" disabled={disabled} onClick={onClick} className={`inline-flex h-7 items-center gap-1 rounded-lg border px-2 text-[9px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${classes}`}><Icon size={11} />{label}</button>;
}

export default function StudentDashboard() {
  const { person } = useOutletContext();
  const { data, loading, reload } = useDashboardData();
  const [actionMessage, setActionMessage] = useState('');
  const student = data?.students.find((profile) => profile.userId === person.id) || data?.students[0];
  const studentRow = data?.studentRows.find((profile) => profile.id === student?.id);
  const incoming = useMemo(() => (data?.requestRows || []).filter((request) => request.studentId === student?.id && request.status === 'pending'), [data?.requestRows, student?.id]);
  const active = useMemo(() => (data?.requestRows || []).filter((request) => request.studentId === student?.id && request.status === 'accepted'), [data?.requestRows, student?.id]);
  const completed = useMemo(() => (data?.requestRows || []).filter((request) => request.studentId === student?.id && request.status === 'completed'), [data?.requestRows, student?.id]);
  const assignedRequests = (data?.requestRows || []).filter((request) => request.studentId === student?.id);
  const verified = student?.verificationStatus === 'verified';
  const profileCompletion = student ? Math.min(100, 54 + student.expertiseIds.length * 12 + (student.completedReviews > 0 ? 10 : 0)) : 0;
  const incomingColumns = [
    { key: 'clientName', label: 'Client' },
    { key: 'documentTitle', label: 'Document', render: (row) => <span className="font-semibold text-[#465147] dark:text-[#d4dbd2]">{row.documentTitle}</span> },
    { key: 'requestedAt', label: 'Requested', render: (row) => formatDashboardDate(row.requestedAt), sortValue: (row) => row.requestedAt },
    { key: 'requestedCompletionAt', label: 'Requested due', render: (row) => formatDashboardDate(row.requestedCompletionAt), sortValue: (row) => row.requestedCompletionAt },
    { key: 'status', label: 'Respond', sortable: false, render: (row) => (
      <div className="flex items-center gap-1.5">
        <ActionButton label="Accept" icon={Check} disabled={!verified} onClick={() => handleRequest(row.id, 'accepted')} />
        <ActionButton label="Decline" icon={X} variant="reject" onClick={() => handleRequest(row.id, 'rejected')} />
      </div>
    ) },
  ];

  async function handleRequest(requestId, status) {
    setActionMessage('');
    try {
      await updateReviewRequest(requestId, status);
      setActionMessage(status === 'accepted' ? 'Request accepted in this mock preview.' : 'Request declined in this mock preview.');
      await reload();
    } catch (error) {
      setActionMessage(error.message);
    }
  }

  return (
    <div>
      <DashboardHeader
        eyebrow="Law student workspace"
        title={`Welcome, ${person.fullName.split(' ')[0]}.`}
        description="Manage incoming requests, keep reviews moving, and build your academic profile."
        badge={verified ? 'Verified reviewer' : 'Verification pending'}
        actions={<a href="#incoming-requests" className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[#dfe2d9] bg-white px-3 text-[10px] font-semibold text-[#536052] hover:bg-[#f8f9f6] dark:border-[#39443a] dark:bg-[#1b231c] dark:text-[#d4dbd2]"><GraduationCap size={14} /> View requests</a>}
      />
      {!verified && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#efdcb3] bg-[#fff9eb] p-3 text-[10px] leading-5 text-[#82692f] dark:border-[#594b2d] dark:bg-[#2b271a] dark:text-[#d8c697]">
          <ShieldCheck size={15} className="mt-0.5 shrink-0" />
          Your student profile is awaiting verification. You are not eligible to accept review requests until verification is complete.
        </div>
      )}
      <div className="mb-4 rounded-xl border border-[#e7e9e2] bg-white p-3 text-[10px] leading-5 text-[#778075] dark:border-[#303a31] dark:bg-[#1b231c]">
        Student feedback is educational and does not constitute professional legal advice. Clients should consult a qualified advocate for legal advice.
      </div>

      <section aria-label="Review performance summary" className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Total requests" value={loading ? '—' : (student?.completedReviews || 0) + assignedRequests.filter((request) => request.status !== 'completed').length} icon={GraduationCap} />
        <StatCard label="Pending requests" value={loading ? '—' : incoming.length} icon={ShieldCheck} tone="amber" />
        <StatCard label="Active reviews" value={loading ? '—' : active.length} icon={Check} tone="blue" />
        <StatCard label="Completed reviews" value={student?.completedReviews ?? '—'} icon={Check} tone="green" />
        <StatCard label="Average rating" value={student?.rating ? `${student.rating.toFixed(1)} / 5` : 'New'} icon={Star} tone="purple" helper={student?.rating ? 'Based on client feedback' : 'Ratings appear after reviews'} />
      </section>

      <div className="grid gap-4 xl:grid-cols-[1fr_0.68fr]">
        <SectionCard title="Incoming review requests" description="Accept only requests that fit your expertise and availability." action={<span className="rounded-full bg-[#f1f3ee] px-2.5 py-1 text-[9px] font-semibold text-[#697568] dark:bg-[#29332a] dark:text-[#c0c8bf]">{incoming.length} awaiting response</span>}>
          {actionMessage && <p role="status" className="border-b border-[#ecece6] bg-[#f8faf6] px-4 py-2.5 text-[10px] text-[#55775d] dark:border-[#303a31] dark:bg-[#202820] dark:text-[#b4c8b1]">{actionMessage}</p>}
          {incoming.length ? <DataTable columns={incomingColumns} rows={incoming} pageSize={4} searchPlaceholder="Search requests by client or document" filterOptions={[
            { value: 'pending', label: 'Pending' },
          ]} /> : <EmptyState title="You're all caught up" description="New review invitations will appear here." />}
        </SectionCard>
        <SectionCard title="Academic profile" description="Your student profile and reviewer eligibility.">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf3ec] text-[#527256]"><GraduationCap size={18} /></span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#354136] dark:text-[#e0e6df]">{person.fullName}</p>
                <p className="mt-1 text-[10px] text-[#879084]">{studentRow?.university || 'University not listed'}</p>
              </div>
              <StatusBadge status={verified ? 'verified' : 'pending'} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-[#ecece6] pt-4 text-[10px] dark:border-[#303a31]">
              <div><dt className="text-[#92998f]">Degree</dt><dd className="mt-1 font-medium text-[#536052] dark:text-[#c0c8bf]">{student?.degree}</dd></div>
              <div><dt className="text-[#92998f]">Academic year</dt><dd className="mt-1 font-medium text-[#536052] dark:text-[#c0c8bf]">Year {student?.academicYear}</dd></div>
              <div><dt className="text-[#92998f]">Graduation</dt><dd className="mt-1 font-medium text-[#536052] dark:text-[#c0c8bf]">{student?.graduationYear}</dd></div>
              <div><dt className="text-[#92998f]">Profile complete</dt><dd className="mt-1 font-medium text-[#536052] dark:text-[#c0c8bf]">{profileCompletion}%</dd></div>
            </dl>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#edf0e9] dark:bg-[#303a31]"><span className="block h-full rounded-full bg-[#78977b]" style={{ width: `${profileCompletion}%` }} /></div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {(studentRow?.expertise || []).map((area) => <span key={area} className="rounded-full bg-[#f0f3ed] px-2.5 py-1 text-[9px] font-medium text-[#607560] dark:bg-[#29352b] dark:text-[#bacbbb]">{area}</span>)}
            </div>
          </div>
        </SectionCard>
      </div>

      <div id="incoming-requests" className="mt-4 grid gap-4 xl:grid-cols-[1fr_0.68fr]">
        <SectionCard title="Active reviews" description="Accepted assignments and their upcoming deadlines." action={<Link to="/dashboard/student/active-reviews" className="text-[10px] font-semibold text-[#55775d] hover:underline">View all</Link>}>
          {active.length ? (
            <div className="divide-y divide-[#eff0eb] dark:divide-[#303a31]">
              {active.map((item) => (
                <article key={item.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#edf2f7] text-[#54718d]"><Check size={15} /></span>
                  <div className="min-w-0 flex-1"><p className="truncate text-[11px] font-semibold text-[#465147] dark:text-[#d4dbd2]">{item.documentTitle}</p><p className="mt-1 text-[9px] text-[#92998f]">Client · {item.clientName} · Due {formatDashboardDate(item.requestedCompletionAt)}</p></div>
                  <StatusBadge status={item.status} />
                  <button type="button" onClick={() => setActionMessage(`Review workspace opened for “${item.documentTitle}” in this mock preview.`)} className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#dfe2d9] px-2.5 text-[9px] font-semibold text-[#536052] hover:bg-[#f6f7f3] dark:border-[#39443a] dark:text-[#d4dbd2] dark:hover:bg-[#202820]">Continue <ArrowRight size={11} /></button>
                </article>
              ))}
            </div>
          ) : <EmptyState title="No active assignments" description="Accepted reviews will show up here." />}
        </SectionCard>
        <SectionCard title="Performance overview" description="Your contribution and client feedback.">
          <div className="grid grid-cols-2 gap-3 p-4">
            <div className="rounded-xl bg-[#f7f8f4] p-3 dark:bg-[#202820]"><p className="text-[9px] text-[#879084]">Completed reviews</p><p className="mt-1 text-xl font-semibold text-[#354136] dark:text-[#e0e6df]">{student?.completedReviews ?? 0}</p></div>
            <div className="rounded-xl bg-[#f7f8f4] p-3 dark:bg-[#202820]"><p className="text-[9px] text-[#879084]">Average rating</p><p className="mt-1 flex items-center gap-1 text-xl font-semibold text-[#354136] dark:text-[#e0e6df]">{student?.rating ? student.rating.toFixed(1) : '—'}<Star size={13} className="fill-[#d5b563] text-[#d5b563]" /></p></div>
            <div className="col-span-2 rounded-xl bg-[#f7f8f4] p-3 dark:bg-[#202820]"><div className="flex justify-between text-[9px] text-[#879084]"><span>On-time completion</span><span className="font-semibold text-[#527256]">{student?.completionRate ?? 0}%</span></div><div className="mt-2 h-1.5 rounded-full bg-[#e8ece5] dark:bg-[#303a31]"><span className="block h-full rounded-full bg-[#78977b]" style={{ width: `${student?.completionRate ?? 0}%` }} /></div></div>
          </div>
          <div className="border-t border-[#ecece6] px-4 py-3 text-[9px] leading-4 text-[#879084] dark:border-[#303a31]">Your rating and completion metrics are sample preview data.</div>
        </SectionCard>
      </div>

      <div className="mt-4">
        <SectionCard title="Recently completed" description="A snapshot of completed client requests.">
          {completed.length ? (
            <DataTable columns={[
              { key: 'clientName', label: 'Client' },
              { key: 'documentTitle', label: 'Document' },
              { key: 'requestedAt', label: 'Requested', render: (row) => formatDashboardDate(row.requestedAt) },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
            ]} rows={completed} searchPlaceholder="Search completed reviews" pageSize={4} />
          ) : <EmptyState title="Completed reviews will appear here" />}
        </SectionCard>
      </div>
    </div>
  );
}
