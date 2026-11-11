import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FilePlus2, FileText, Search } from 'lucide-react';
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

const EMPTY_DRAFTS = [];

export default function Drafts() {
  const [query, setQuery] = useState('');
  const loadDrafts = useCallback(() => fetchDrafts().then(unwrapDrafts), []);
  const { data: drafts, loading, error, reload } = useAsyncData(loadDrafts);
  const items = drafts || EMPTY_DRAFTS;
  const filtered = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    if (!search) return items;
    return items.filter((draft) => {
      const title = draft.template?.title || draft.title || '';
      return title.toLocaleLowerCase().includes(search) || String(draft.id).toLocaleLowerCase().includes(search);
    });
  }, [items, query]);

  return (
    <div>
      <PageHeader
        eyebrow="Your workspace"
        title="All drafts"
        description="Find and continue the agreements you have started."
        actions={<Link to="/drafts/new"><Button><FilePlus2 size={15} /> New agreement</Button></Link>}
      />

      <label className="relative mb-5 block max-w-md">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b9389]" />
        <span className="sr-only">Search drafts</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by agreement or draft ID" className="form-control pl-10" />
      </label>

      {loading ? <LoadingState label="Loading your drafts…" />
        : error ? <ErrorState message={error} onRetry={reload} />
          : !filtered.length ? (
            <EmptyState
              title={query ? 'No matching drafts.' : 'No drafts yet.'}
              description={query ? 'Try another agreement title or draft ID.' : 'Choose a template to create your first freelance agreement.'}
              action={!query && <Link to="/drafts/new"><Button><FilePlus2 size={15} /> Choose a template</Button></Link>}
            />
          ) : (
            <Card className="overflow-hidden">
              <div className="hidden grid-cols-[1fr_150px_120px] border-b border-[#e9e9e2] px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#899087] dark:border-[#303a31] sm:grid sm:px-6">
                <span>Agreement</span><span>Status</span><span className="text-right">Draft</span>
              </div>
              <ul className="divide-y divide-[#ecece6] dark:divide-[#303a31]">
                {filtered.map((draft) => (
                  <li key={draft.id} className="grid items-center gap-3 px-5 py-4 transition-colors hover:bg-[#f8f9f6] dark:hover:bg-[#202820] sm:grid-cols-[1fr_150px_120px] sm:px-6">
                    <Link to={`/drafts/${draft.id}/fill`} className="flex min-w-0 items-center gap-3 focus-visible:rounded">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eff3ed] text-[#58765b] dark:bg-[#29352b] dark:text-[#b4c8b1]"><FileText size={16} /></span>
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-semibold text-[#354136] dark:text-[#e0e6df]">{draft.template?.title || draft.title || 'Freelance service agreement'}</span>
                        <span className="mt-1 block truncate text-[10px] text-[#858c82] dark:text-[#9ca69c]">ID · {draft.id}</span>
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
