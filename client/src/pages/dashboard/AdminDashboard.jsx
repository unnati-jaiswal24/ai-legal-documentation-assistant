import { useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Activity, Check, Clock3, FileText, GraduationCap, ShieldCheck, Users } from 'lucide-react';
import AnalyticsChart, { DonutChart } from '../../components/dashboard/AnalyticsChart';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import DataTable from '../../components/dashboard/DataTable';
import SectionCard from '../../components/dashboard/SectionCard';
import StatCard from '../../components/dashboard/StatCard';
import StatusBadge from '../../components/dashboard/StatusBadge';
import useDashboardData from '../../hooks/useDashboardData';
import { updateStudentProfile } from '../../services/studentService';
import { formatDashboardDate, titleCase } from '../../utils/dashboardFormatters';

const rangeOptions = [
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '6m', label: 'Last 6 months' },
  { value: '12m', label: 'Last 12 months' },
];

const managementTabs = [
  { id: 'users', label: 'Recently registered users' },
  { id: 'verification', label: 'Student verification' },
  { id: 'documents', label: 'Recent documents' },
  { id: 'reviews', label: 'Review requests' },
];

export default function AdminDashboard() {
  const { person } = useOutletContext();
  const [range, setRange] = useState('6m');
  const [activeTab, setActiveTab] = useState('users');
  const [message, setMessage] = useState('');
  const { data, reload } = useDashboardData({ analyticsRange: range });
  const summary = data?.analytics.summary;
  const sortedUsers = [...(data?.users || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const userRows = sortedUsers.map((user) => ({ ...user, roleLabel: titleCase(user.role), status: user.status }));
  const pendingStudents = (data?.studentRows || []).filter((student) => student.verificationStatus === 'pending');
  const sortedDocuments = [...(data?.documentsWithTypes || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const sortedRequests = [...(data?.requestRows || [])].sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));
  const eligibleStudents = [...(data?.studentRows || [])].filter((student) => student.verificationStatus === 'verified');
  const activeStudents = [...eligibleStudents].sort((a, b) => b.completedReviews - a.completedReviews).slice(0, 5);
  const expertiseCounts = useMemo(() => (data?.expertiseAreas || []).map((area) => ({
    ...area,
    count: (data?.students || []).filter((student) => student.expertiseIds.includes(area.id)).length,
  })), [data?.expertiseAreas, data?.students]);
  const maximumExpertise = Math.max(...expertiseCounts.map((item) => item.count), 1);
  const typeNames = data?.documentTypes.map((type) => type.name) || [];
  const userRange = (
    <select value={range} onChange={(event) => setRange(event.target.value)} aria-label="Select analytics date range" className="h-8 rounded-lg border border-[#e1e4dc] bg-white px-2.5 text-[10px] text-[#657064] outline-none focus:border-[#9bb39b] dark:border-[#39443a] dark:bg-[#1d251e] dark:text-[#d4dbd2]">
      {rangeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  );

  async function verifyStudent(studentId) {
    setMessage('');
    try {
      await updateStudentProfile(studentId, { verificationStatus: 'verified' });
      setMessage('Student marked verified in this mock preview.');
      await reload();
    } catch (error) {
      setMessage(error.message);
    }
  }

  const userColumns = [
    { key: 'fullName', label: 'Name', render: (row) => <span className="font-semibold text-[#465147] dark:text-[#d4dbd2]">{row.fullName}</span> },
    { key: 'email', label: 'Email' },
    { key: 'roleLabel', label: 'Role' },
    { key: 'createdAt', label: 'Joined', render: (row) => formatDashboardDate(row.createdAt), sortValue: (row) => row.createdAt },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];
  const verificationColumns = [
    { key: 'name', label: 'Student', render: (row) => <span className="font-semibold text-[#465147] dark:text-[#d4dbd2]">{row.name}</span> },
    { key: 'university', label: 'University' },
    { key: 'degree', label: 'Degree' },
    { key: 'verificationStatus', label: 'Status', render: (row) => <StatusBadge status={row.verificationStatus} /> },
    { key: 'actions', label: 'Action', sortable: false, render: (row) => <button type="button" onClick={() => verifyStudent(row.id)} className="rounded-lg border border-[#d9e7d8] bg-[#f0f6ef] px-2.5 py-1.5 text-[9px] font-semibold text-[#42694a] hover:bg-[#e6f0e5]">Verify</button> },
  ];
  const documentColumns = [
    { key: 'title', label: 'Document', render: (row) => <span className="font-semibold text-[#465147] dark:text-[#d4dbd2]">{row.title}</span> },
    { key: 'clientName', label: 'Owner', searchValue: (row) => row.clientName },
    { key: 'documentType', label: 'Type' },
    { key: 'createdAt', label: 'Created', render: (row) => formatDashboardDate(row.createdAt), sortValue: (row) => row.createdAt },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];
  const requestColumns = [
    { key: 'clientName', label: 'Client' },
    { key: 'studentName', label: 'Reviewer' },
    { key: 'documentTitle', label: 'Document' },
    { key: 'requestedAt', label: 'Requested', render: (row) => formatDashboardDate(row.requestedAt), sortValue: (row) => row.requestedAt },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div>
      <DashboardHeader
        eyebrow="Platform administration"
        title={`Good morning, ${person.fullName.split(' ')[0]}.`}
        description="A real-time style overview of community growth, document activity, reviewer health, and platform operations."
        actions={userRange}
      />

      <section aria-label="Platform statistics" className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total users" value={summary?.totalUsers.toLocaleString('en-IN') ?? '—'} icon={Users} trend={`+${summary?.periodGrowth ?? 0}%`} helper="vs. previous period" />
        <StatCard label="Total clients" value={summary?.totalClients.toLocaleString('en-IN') ?? '—'} icon={Users} tone="blue" helper="Registered client accounts" />
        <StatCard label="Law students" value={summary?.totalLawStudents ?? '—'} icon={GraduationCap} tone="purple" helper={`${summary?.verifiedStudents ?? 0} verified`} />
        <StatCard label="Pending verifications" value={summary?.pendingVerifications ?? '—'} icon={ShieldCheck} tone="amber" helper="Student profiles in queue" />
        <StatCard label="Total documents" value={summary?.totalDocuments.toLocaleString('en-IN') ?? '—'} icon={FileText} tone="blue" helper="All document types" />
        <StatCard label="Review requests" value={summary?.totalReviewRequests.toLocaleString('en-IN') ?? '—'} icon={Activity} tone="purple" helper={`${summary?.reviewCompletionRate ?? 0}% completion rate`} />
        <StatCard label="Completed reviews" value={summary?.completedReviews.toLocaleString('en-IN') ?? '—'} icon={Check} helper="Feedback delivered" />
        <StatCard label="Avg. turnaround" value={`${summary?.averageTurnaroundHours ?? '—'}h`} icon={Clock3} tone="amber" helper="Request to completion" />
      </section>

      {message && <p role="status" className="mb-4 rounded-lg border border-[#dce8da] bg-[#f3f8f2] px-3 py-2 text-[10px] text-[#55775d] dark:border-[#354537] dark:bg-[#202820] dark:text-[#b4c8b1]">{message}</p>}

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
        <AnalyticsChart
          title="User registration trends"
          description="New client and student accounts by month"
          data={data?.analytics.registrations || []}
          series={[
            { key: 'clients', label: 'Clients', color: '#31583b' },
            { key: 'students', label: 'Law students', color: '#c58b68' },
          ]}
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <DonutChart title="User distribution" totalLabel="users" data={[
            { label: 'Clients', count: summary?.totalClients || 0, color: '#31583b' },
            { label: 'Law students', count: summary?.totalLawStudents || 0, color: '#c58b68' },
          ]} />
          <DonutChart title="Student verification" totalLabel="students" data={[
            { label: 'Verified', count: summary?.verifiedStudents || 0, color: '#78977b' },
            { label: 'Pending', count: summary?.pendingVerifications || 0, color: '#d8c88c' },
          ]} />
          <DonutChart title="Account status" totalLabel="accounts" data={[
            { label: 'Active', count: summary?.activeAccounts || 0, color: '#78977b' },
            { label: 'Suspended', count: summary?.suspendedAccounts || 0, color: '#c58b68' },
          ]} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <AnalyticsChart
          title="Documents created"
          description="Document creation volume by month"
          data={data?.analytics.documentCreations || []}
          series={[{ key: 'count', label: 'Documents', color: '#54718d' }]}
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <DonutChart title="Documents by type" totalLabel="documents" data={(data?.analytics.documentTypes || []).map((item) => ({
            ...item,
            label: data?.documentTypes.find((type) => type.id === item.typeId)?.name || 'Other',
          }))} legendLabels={typeNames} />
          <DonutChart title="Documents by status" totalLabel="documents" data={(data?.analytics.documentStatuses || []).map((item, index) => ({
            ...item,
            label: titleCase(item.status),
            color: ['#d8c88c', '#54718d', '#78977b'][index],
          }))} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <SectionCard title="Review health" description="Request outcomes and reviewer performance.">
          <div className="grid gap-4 p-4 sm:grid-cols-2">
            <DonutChart title="Request status" totalLabel="requests" data={(data?.analytics.reviewStatuses || []).map((item, index) => ({
              ...item,
              color: ['#d8c88c', '#54718d', '#78977b', '#c58b68'][index],
            }))} />
            <div className="space-y-3">
              <div className="rounded-xl bg-[#f7f8f4] p-3 dark:bg-[#202820]"><p className="text-[9px] text-[#879084]">Review completion</p><p className="mt-1 text-xl font-semibold text-[#354136] dark:text-[#e0e6df]">{summary?.reviewCompletionRate}%</p><div className="mt-2 h-1.5 rounded-full bg-[#e8ece5] dark:bg-[#303a31]"><span className="block h-full rounded-full bg-[#78977b]" style={{ width: `${summary?.reviewCompletionRate || 0}%` }} /></div></div>
              <div className="rounded-xl bg-[#f7f8f4] p-3 dark:bg-[#202820]"><p className="text-[9px] text-[#879084]">Average turnaround</p><p className="mt-1 text-xl font-semibold text-[#354136] dark:text-[#e0e6df]">{summary?.averageTurnaroundHours} <span className="text-xs font-medium">hours</span></p></div>
              <div className="rounded-xl bg-[#f7f8f4] p-3 dark:bg-[#202820]"><p className="text-[9px] text-[#879084]">Verified students</p><p className="mt-1 text-xl font-semibold text-[#354136] dark:text-[#e0e6df]">{summary?.verifiedStudents} <span className="text-xs font-medium text-[#879084]">of {summary?.totalLawStudents}</span></p></div>
            </div>
          </div>
        </SectionCard>
        <SectionCard title="Law student analytics" description="Verified reviewers, activity, and areas of expertise." action={<Link to="/dashboard/admin/students" className="text-[10px] font-semibold text-[#55775d] hover:underline">Manage students</Link>}>
          <div className="grid gap-4 p-4 sm:grid-cols-2">
            <div>
              <p className="mb-3 text-[10px] font-semibold text-[#6d776c] dark:text-[#b4bdb2]">Most active students</p>
              <ol className="space-y-3">
                {activeStudents.map((student, index) => (
                  <li key={student.id} className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#edf3ec] text-[9px] font-semibold text-[#55775d] dark:bg-[#29352b] dark:text-[#b4c8b1]">{index + 1}</span>
                    <span className="min-w-0 flex-1"><span className="block truncate text-[10px] font-medium text-[#465147] dark:text-[#d4dbd2]">{student.name}</span><span className="text-[9px] text-[#92998f]">{student.completedReviews} reviews</span></span>
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-[#8d743c]">★ {student.rating?.toFixed(1) || '—'}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <p className="mb-3 text-[10px] font-semibold text-[#6d776c] dark:text-[#b4bdb2]">Expertise distribution</p>
              <ul className="space-y-3">
                {expertiseCounts.map((item) => (
                  <li key={item.id}>
                    <div className="mb-1 flex justify-between text-[9px]"><span className="text-[#687267] dark:text-[#b4bdb2]">{item.name}</span><span className="font-semibold text-[#687267] dark:text-[#b4bdb2]">{item.count}</span></div>
                    <div className="h-1.5 rounded-full bg-[#edf0e9] dark:bg-[#303a31]"><span className="block h-full rounded-full bg-[#78977b]" style={{ width: `${(item.count / maximumExpertise) * 100}%` }} /></div>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[9px] text-[#879084]">{pendingStudents.length} students awaiting verification</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Management overview" description="Search, filter, sort, and page through current platform records." className="mt-4">
        <div role="tablist" aria-label="Management data tables" className="flex gap-1 overflow-x-auto border-b border-[#ecece6] px-3 pt-2 dark:border-[#303a31]">
          {managementTabs.map((tab) => (
            <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} className={`shrink-0 rounded-t-lg px-3 py-2.5 text-[9px] font-semibold transition-colors ${activeTab === tab.id ? 'border-b-2 border-[#55775d] text-[#45674c] dark:text-[#b4c8b1]' : 'text-[#879084] hover:text-[#536052] dark:hover:text-[#d4dbd2]'}`}>{tab.label}</button>
          ))}
        </div>
        {activeTab === 'users' && <DataTable columns={userColumns} rows={userRows} searchPlaceholder="Search registered users" pageSize={6} filterOptions={[{ value: 'active', label: 'Active' }, { value: 'suspended', label: 'Suspended' }]} />}
        {activeTab === 'verification' && <DataTable columns={verificationColumns} rows={pendingStudents} searchPlaceholder="Search students awaiting verification" pageSize={6} filterOptions={[{ value: 'pending', label: 'Pending' }]} />}
        {activeTab === 'documents' && <DataTable columns={documentColumns} rows={sortedDocuments} searchPlaceholder="Search recent documents" pageSize={6} filterOptions={[{ value: 'draft', label: 'Draft' }, { value: 'in_review', label: 'In review' }, { value: 'completed', label: 'Completed' }]} />}
        {activeTab === 'reviews' && <DataTable columns={requestColumns} rows={sortedRequests} searchPlaceholder="Search review requests" pageSize={6} filterOptions={[{ value: 'pending', label: 'Pending' }, { value: 'accepted', label: 'Accepted' }, { value: 'completed', label: 'Completed' }, { value: 'rejected', label: 'Rejected' }]} />}
      </SectionCard>
      <p className="mt-4 text-[9px] leading-4 text-[#92998f]">All analytics and management records shown here are frontend mock data for interface preview only.</p>
    </div>
  );
}
