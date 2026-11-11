import { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, FilePlus2, Files, FileText, FileStack, Clock3 } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import Button from '../components/Button';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '../components/StatePanel';
import useAsyncData from '../hooks/useAsyncData';

const EMPTY_DRAFTS = [];

function unwrapDrafts(result) {
  return Array.isArray(result) ? result : result?.drafts || [];
}

function modifiedAt(draft) {
  const value = draft.updatedAt || draft.updated_at || draft.modifiedAt || draft.modified_at;
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function createdAt(draft) {
  const value = draft.createdAt || draft.created_at;
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(value);
}

function DraftRow({ draft, activity = false }) {
  const title = draft.template?.title || draft.title || 'Freelance service agreement';
  const updated = modifiedAt(draft);
  const date = updated || createdAt(draft);
  const dateLabel = updated ? 'Updated' : 'Created';
  return (
    <Link
      to={`/documents/${draft.id}`}
      className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[#f8f9f6] focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#55775d] dark:hover:bg-[#202820] sm:px-6"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eff3ed] text-[#58765b] dark:bg-[#29352b] dark:text-[#b4c8b1]">
        <FileText size={17} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-semibold text-[#354136] dark:text-[#e0e6df]">{title}</span>
        <span className="mt-1 block truncate text-[10px] text-[#858c82] dark:text-[#9ca69c]">
          {activity ? `${dateLabel} · ${date ? formatDate(date) : 'Date unavailable'}` : `Draft ID · ${draft.id}`}
        </span>
      </span>
      <StatusBadge status={draft.status} />
      <ArrowRight size={14} className="hidden text-[#9aa197] sm:block" />
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const loadDrafts = useCallback(() => api.drafts().then(unwrapDrafts), []);
  const { data: drafts, loading, error, reload } = useAsyncData(loadDrafts);
  const items = drafts || EMPTY_DRAFTS;
  const inProgressCount = items.filter((draft) => draft.status === 'in_progress').length;
  const completedCount = items.filter((draft) => ['generated', 'exported'].includes(draft.status)).length;
  const activityItems = useMemo(
    () => [...items]
      .filter((draft) => modifiedAt(draft) || createdAt(draft))
      .sort((a, b) => (modifiedAt(b) || createdAt(b)) - (modifiedAt(a) || createdAt(a)))
      .slice(0, 5),
    [items],
  );
  const editedItems = useMemo(
    () => [...items]
      .filter((draft) => modifiedAt(draft))
      .sort((a, b) => modifiedAt(b) - modifiedAt(a))
      .slice(0, 5),
    [items],
  );
  const name = user?.fullName || user?.full_name || user?.name || user?.email?.split('@')[0];

  return (
    <div>
      <PageHeader
        eyebrow="Your workspace"
        title={name ? `Welcome back, ${name}.` : 'Welcome to your workspace.'}
        description={user?.email ? `${user.email} · Keep your freelance agreements moving, one clear step at a time.` : 'Keep your freelance agreements moving, one clear step at a time.'}
        actions={
          <>
            <Button as={Link} to="/assistant" variant="outline"><Bot size={15} /> Open AI assistant</Button>
            <Button as={Link} to="/documents/new"><FilePlus2 size={15} /> Create document</Button>
          </>
        }
      />

      <section aria-label="Document summary" className="mb-7 grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Total documents', value: loading || error ? '—' : items.length, icon: Files },
          { label: 'In progress', value: loading || error ? '—' : inProgressCount, icon: FileText },
          { label: 'Completed', value: loading || error ? '—' : completedCount, icon: ArrowRight },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="flex items-center gap-4 p-5 sm:p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eff3ed] text-[#58765b] dark:bg-[#29352b] dark:text-[#b4c8b1]"><Icon size={17} /></span>
            <span>
              <span className="block text-[10px] font-medium text-[#838b81] dark:text-[#9ca69c]">{label}</span>
              <span className="mt-1 block text-2xl font-medium tracking-tight text-[#354136] dark:text-[#e0e6df]">{value}</span>
            </span>
          </Card>
        ))}
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-[#e9e9e2] px-5 py-4 dark:border-[#303a31] sm:px-6">
            <div>
              <h2 className="text-sm font-semibold text-[#354136] dark:text-[#e0e6df]">Recent document activity</h2>
              <p className="mt-1 text-xs text-[#858c82] dark:text-[#9ca69c]">Activity from your saved agreements.</p>
            </div>
            <Link to="/documents" className="inline-flex items-center gap-1 text-xs font-semibold text-[#55775d] hover:underline dark:text-[#a9c5a9]">
              All documents <ArrowRight size={13} />
            </Link>
          </div>
          {loading ? <div className="p-4"><LoadingState label="Loading your documents…" /></div>
            : error ? <div className="p-4"><ErrorState message={error} onRetry={reload} /></div>
            : !items.length ? (
              <div className="p-4">
                <EmptyState
                  title="Your workspace is ready."
                  description="No documents were returned for your account yet. Start by choosing an available template."
                  action={<Button as={Link} to="/documents/new"><FilePlus2 size={15} /> Choose a template</Button>}
                />
              </div>
            ) : (
              activityItems.length ? (
                <div className="divide-y divide-[#ecece6] dark:divide-[#303a31]">
                  {activityItems.map((draft) => <DraftRow key={draft.id} draft={draft} activity />)}
                </div>
              ) : (
                <div className="p-4">
                  <EmptyState title="Activity dates are not available." description="The drafts API response does not include creation or update dates, so recent activity cannot be ordered yet." />
                </div>
              )
            )}
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-[#e9e9e2] px-5 py-4 dark:border-[#303a31] sm:px-6">
            <div>
              <h2 className="text-sm font-semibold text-[#354136] dark:text-[#e0e6df]">Recently edited</h2>
              <p className="mt-1 text-xs text-[#858c82] dark:text-[#9ca69c]">Documents with an update date from the service.</p>
            </div>
            <Clock3 size={16} className="text-[#829181]" aria-hidden="true" />
          </div>
          {loading ? <div className="p-4"><LoadingState label="Checking update dates…" /></div>
            : error ? <div className="p-4"><ErrorState message={error} onRetry={reload} /></div>
              : editedItems.length ? (
                <div className="divide-y divide-[#ecece6] dark:divide-[#303a31]">
                  {editedItems.map((draft) => <DraftRow key={draft.id} draft={draft} activity />)}
                </div>
              ) : (
                <div className="p-4">
                  <EmptyState title="No edit dates available." description="The current drafts API contract does not include an update timestamp for sorting edited documents." />
                </div>
              )}
        </Card>
      </div>

      <section aria-label="Quick actions" className="mt-5 grid gap-3 sm:grid-cols-2">
        <Link to="/assistant" className="group flex items-center gap-4 rounded-2xl border border-[#e6e7df] bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[#cbd7c9] hover:shadow-sm dark:border-[#303a31] dark:bg-[#181f19] dark:hover:border-[#4a5b4b]">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0edf5] text-[#77698e] dark:bg-[#302a3a] dark:text-[#c7badb]"><Bot size={18} /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-[#354136] dark:text-[#e0e6df]">AI Assistant</span>
            <span className="mt-1 block text-xs text-[#747c73] dark:text-[#adb6ab]">Open the assistant availability and connection status.</span>
          </span>
          <ArrowRight size={15} className="text-[#8b9389] transition-transform group-hover:translate-x-1" />
        </Link>
        <Link to="/templates" className="group flex items-center gap-4 rounded-2xl border border-[#e6e7df] bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[#cbd7c9] hover:shadow-sm dark:border-[#303a31] dark:bg-[#181f19] dark:hover:border-[#4a5b4b]">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eff3ed] text-[#58765b] dark:bg-[#29352b] dark:text-[#b4c8b1]"><FileStack size={18} /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-[#354136] dark:text-[#e0e6df]">Browse templates</span>
            <span className="mt-1 block text-xs text-[#747c73] dark:text-[#adb6ab]">Choose a template supplied by the platform.</span>
          </span>
          <ArrowRight size={15} className="text-[#8b9389] transition-transform group-hover:translate-x-1" />
        </Link>
      </section>
    </div>
  );
}
