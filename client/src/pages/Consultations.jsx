import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquareText } from 'lucide-react';
import { consultations as fetchConsultations } from '../api/consultations';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '../components/StatePanel';
import useAsyncData from '../hooks/useAsyncData';

function unwrapConsultations(response) {
  return Array.isArray(response) ? response : response?.consultations || [];
}

export default function Consultations() {
  const loadConsultations = useCallback(() => fetchConsultations().then(unwrapConsultations), []);
  const { data: consultations, loading, error, reload } = useAsyncData(loadConsultations);
  const items = consultations || [];

  return (
    <div>
      <PageHeader eyebrow="Legal support" title="Consultations" description="Follow questions associated with your agreement drafts." />
      {loading ? <LoadingState label="Loading consultations…" />
        : error ? <ErrorState message={error} onRetry={reload} />
          : !items.length ? (
            <EmptyState title="No consultations yet." description="You can ask a question from a draft’s agreement workspace." />
          ) : (
            <div className="space-y-3">
              {items.map((consultation) => (
                <Card key={consultation.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eff3ed] text-[#58765b] dark:bg-[#29352b] dark:text-[#b4c8b1]"><MessageSquareText size={17} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-xs font-medium leading-5 text-[#354136] dark:text-[#e0e6df]">{consultation.query || 'Consultation request'}</p>
                    <p className="mt-1 text-[10px] text-[#858c82] dark:text-[#9ca69c]">{consultation.expert?.name || 'Expert pending'} · Draft {consultation.draftId || consultation.draft_id}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <StatusBadge status={consultation.status} />
                    {(consultation.draftId || consultation.draft_id) && (
                      <Link to={`/drafts/${consultation.draftId || consultation.draft_id}/consult`} aria-label="View consultation details" className="flex h-8 w-8 items-center justify-center rounded-full text-[#718472] hover:bg-[#eff3ed] dark:text-[#b4c8b1] dark:hover:bg-[#29352b]"><ArrowRight size={15} /></Link>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
    </div>
  );
}
