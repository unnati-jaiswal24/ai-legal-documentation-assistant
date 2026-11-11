import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FilePlus2, Files, FileText } from 'lucide-react';
import { drafts as fetchDrafts } from '../api/drafts';
import Button from '../components/Button';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '../components/StatePanel';
import useAsyncData from '../hooks/useAsyncData';

function unwrapDrafts(result) {
  return Array.isArray(result) ? result : result?.drafts || [];
}

function DraftRow({ draft }) {
  const title = draft.template?.title || draft.title || 'Freelance service agreement';
  return (
    <Link
      to={`/drafts/${draft.id}/fill`}
      className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[#f8f9f6] dark:hover:bg-[#202820] sm:px-6"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eff3ed] text-[#58765b] dark:bg-[#29352b] dark:text-[#b4c8b1]">
        <FileText size={17} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-semibold text-[#354136] dark:text-[#e0e6df]">{title}</span>
        <span className="mt-1 block truncate text-[10px] text-[#858c82] dark:text-[#9ca69c]">Draft ID · {draft.id}</span>
      </span>
      <StatusBadge status={draft.status} />
      <ArrowRight size={14} className="hidden text-[#9aa197] sm:block" />
    </Link>
  );
}

export default function Dashboard() {
  const loadDrafts = useCallback(() => fetchDrafts().then(unwrapDrafts), []);
  const { data: drafts, loading, error, reload } = useAsyncData(loadDrafts);
  const items = drafts || [];
  const inProgressCount = items.filter((draft) => draft.status === 'in_progress').length;
  const completedCount = items.filter((draft) => ['generated', 'exported'].includes(draft.status)).length;

  return (
    <div>
      <PageHeader
        eyebrow="Your workspace"
        title="Good to have you back."
        description="Keep your freelance agreements moving, one clear step at a time."
        actions={<Button as={Link} to="/drafts/new"><FilePlus2 size={15} /> New agreement</Button>}
      />

      <section aria-label="Draft summary" className="mb-7 grid gap-3 sm:grid-cols-3">
        {[
          { label: 'All drafts', value: loading ? '—' : items.length, icon: Files },
          { label: 'In progress', value: loading ? '—' : inProgressCount, icon: FileText },
          { label: 'Ready to share', value: loading ? '—' : completedCount, icon: ArrowRight },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="flex items-center gap-4 p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eff3ed] text-[#58765b] dark:bg-[#29352b] dark:text-[#b4c8b1]"><Icon size={17} /></span>
            <span>
              <span className="block text-[10px] font-medium text-[#838b81] dark:text-[#9ca69c]">{label}</span>
              <span className="mt-1 block text-2xl font-medium tracking-tight text-[#354136] dark:text-[#e0e6df]">{value}</span>
            </span>
          </Card>
        ))}
      </section>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-[#e9e9e2] px-5 py-4 dark:border-[#303a31] sm:px-6">
          <div>
            <h2 className="text-sm font-semibold text-[#354136] dark:text-[#e0e6df]">Recent drafts</h2>
            <p className="mt-1 text-[10px] text-[#858c82] dark:text-[#9ca69c]">Your latest agreement work.</p>
          </div>
          <Link to="/drafts" className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#55775d] hover:underline dark:text-[#a9c5a9]">
            View all <ArrowRight size={13} />
          </Link>
        </div>
        {loading ? <div className="p-4"><LoadingState label="Loading your drafts…" /></div>
          : error ? <div className="p-4"><ErrorState message={error} onRetry={reload} /></div>
            : !items.length ? (
              <div className="p-4">
                <EmptyState
                  title="Your workspace is ready."
                  description="Start with a reviewed template to create your first freelance agreement."
                  action={<Button as={Link} to="/drafts/new"><FilePlus2 size={15} /> Choose a template</Button>}
                />
              </div>
            ) : (
              <div className="divide-y divide-[#ecece6] dark:divide-[#303a31]">
                {items.slice(0, 5).map((draft) => <DraftRow key={draft.id} draft={draft} />)}
              </div>
            )}
      </Card>
    </div>
  );
}
