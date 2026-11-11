import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FilePlus2, FileText, Search } from 'lucide-react';
import { api } from '../api/client';
import Button from '../components/Button';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '../components/StatePanel';
import useAsyncData from '../hooks/useAsyncData';

function unwrapDrafts(result) {
  return Array.isArray(result) ? result : result?.drafts || [];
}

const EMPTY_DRAFTS = [];

function updatedAt(draft) {
  const value = draft.updatedAt || draft.updated_at || draft.modifiedAt || draft.modified_at;
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatUpdatedAt(draft) {
  const date = updatedAt(draft);
  return date ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(date) : null;
}

export default function Drafts({ documentsMode = false }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const loadDrafts = useCallback(() => api.drafts().then(unwrapDrafts), []);
  const { data: drafts, loading, error, reload } = useAsyncData(loadDrafts);
  const items = drafts || EMPTY_DRAFTS;
  const hasUpdateDates = items.some((draft) => updatedAt(draft));
  const filtered = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    const result = items.filter((draft) => {
      const title = draft.template?.title || draft.title || '';
      const matchesSearch = !search || title.toLocaleLowerCase().includes(search) || String(draft.id).toLocaleLowerCase().includes(search);
      const completed = ['generated', 'exported'].includes(draft.status);
      const matchesStatus = statusFilter === 'all'
        || (statusFilter === 'completed' && completed)
        || (statusFilter === 'in_progress' && !completed);
      return matchesSearch && matchesStatus;
    });
    return result.sort((a, b) => {
      const aDate = updatedAt(a);
      const bDate = updatedAt(b);
      if (!aDate || !bDate) return 0;
      return sortOrder === 'oldest' ? aDate - bDate : bDate - aDate;
    });
  }, [items, query, sortOrder, statusFilter]);
  const createPath = documentsMode ? '/documents/new' : '/drafts/new';
  const title = documentsMode ? 'My documents' : 'All drafts';

  return (
    <div>
      <PageHeader
        eyebrow="Your workspace"
        title={title}
        description={documentsMode ? 'Find and continue agreements returned for your account.' : 'Find and continue the agreements you have started.'}
        actions={<Button as={Link} to={createPath}><FilePlus2 size={15} /> New agreement</Button>}
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(240px,1fr)_180px_180px]">
        <label className="relative block">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b9389]" />
          <span className="sr-only">Search documents</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by agreement or ID" className="form-control pl-10" />
        </label>
        <label className="sr-only" htmlFor="document-status-filter">Filter by status</label>
        <select id="document-status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="form-control">
          <option value="all">All statuses</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
        <label className="sr-only" htmlFor="document-sort-order">Sort documents</label>
        <select id="document-sort-order" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className="form-control" disabled={!hasUpdateDates}>
          <option value="newest">{hasUpdateDates ? 'Recently updated' : 'Sort unavailable (no dates)'}</option>
          <option value="oldest">Oldest updated</option>
        </select>
      </div>
      {items.length > 0 && !hasUpdateDates && (
        <p className="-mt-2 mb-4 text-xs text-[#858c82] dark:text-[#9ca69c]">
          Update dates are not included in the service response, so documents cannot be sorted by date.
        </p>
      )}

      {loading ? <LoadingState label="Loading your drafts…" />
        : error ? <ErrorState message={error} onRetry={reload} />
          : !filtered.length ? (
            <EmptyState
              title={query || statusFilter !== 'all' ? 'No matching documents.' : 'No documents yet.'}
              description={error ? undefined : (query || statusFilter !== 'all' ? 'Adjust the search or status filter and try again.' : 'Choose a template to create your first freelance agreement.')}
              action={statusFilter === 'all' && !query && <Button as={Link} to={createPath}><FilePlus2 size={15} /> Choose a template</Button>}
            />
          ) : (
            <Card className="overflow-hidden">
              <div className="hidden grid-cols-[1fr_150px_120px] border-b border-[#e9e9e2] px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#899087] dark:border-[#303a31] sm:grid sm:px-6">
                <span>Agreement</span><span>Status</span><span className="text-right">Open</span>
              </div>
              <ul className="divide-y divide-[#ecece6] dark:divide-[#303a31]">
                {filtered.map((draft) => (
                  <li key={draft.id} className="grid items-center gap-3 px-5 py-4 transition-colors hover:bg-[#f8f9f6] dark:hover:bg-[#202820] sm:grid-cols-[1fr_150px_120px] sm:px-6">
                    <Link to={documentsMode ? `/documents/${draft.id}` : `/drafts/${draft.id}/fill`} className="flex min-w-0 items-center gap-3 focus-visible:rounded">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eff3ed] text-[#58765b] dark:bg-[#29352b] dark:text-[#b4c8b1]"><FileText size={16} /></span>
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-semibold text-[#354136] dark:text-[#e0e6df]">{draft.template?.title || draft.title || 'Freelance service agreement'}</span>
                        <span className="mt-1 block truncate text-[10px] text-[#858c82] dark:text-[#9ca69c]">ID · {draft.id}</span>
                        <span className="mt-1 block truncate text-[10px] text-[#858c82] dark:text-[#9ca69c]">
                          {formatUpdatedAt(draft) ? `Updated ${formatUpdatedAt(draft)}` : 'Update date unavailable'}
                        </span>
                      </span>
                    </Link>
                    <span><StatusBadge status={draft.status} /></span>
                    <span className="text-right text-[10px] text-[#8b9389] dark:text-[#9ca69c]">Continue <span aria-hidden="true">→</span></span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
    </div>
  );
}
