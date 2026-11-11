import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, FileText } from 'lucide-react';
import { createDraft, templates } from '../api/drafts';
import Button from '../components/Button';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import { EmptyState, ErrorState, LoadingState } from '../components/StatePanel';
import useAsyncData from '../hooks/useAsyncData';

function unwrapTemplates(result) {
  return Array.isArray(result) ? result : result?.templates || [];
}

function TemplateCard({ template, onCreate, disabled }) {
  return (
    <Card className="card-hover flex h-full flex-col p-5 hover:-translate-y-0.5 hover:border-[#cbd7c9] hover:shadow-[0_20px_48px_-34px_rgba(41,63,43,0.4)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eff3ed] text-[#58765b] dark:bg-[#29352b] dark:text-[#b4c8b1]"><FileText size={18} /></span>
        <span className="rounded-full bg-[#eff3ed] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide text-[#55775d] dark:bg-[#29352b] dark:text-[#b4c8b1]">Template</span>
      </div>
      <h2 className="mt-5 text-sm font-semibold text-[#354136] dark:text-[#e0e6df]">{template.title}</h2>
      {template.description && <p className="mt-2 text-xs leading-5 text-[#747c73] dark:text-[#adb6ab]">{template.description}</p>}
      <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-[#858c82] dark:text-[#9ca69c]">
        {template.version && <span>Version {template.version}</span>}
        {template.documentType?.name && <span>· {template.documentType.name}</span>}
      </div>
      <Button className="mt-auto w-full" disabled={disabled} onClick={() => onCreate(template.id)}>
        Use this template <ArrowRight size={14} />
      </Button>
    </Card>
  );
}

export default function NewDraft() {
  const navigate = useNavigate();
  const [creatingId, setCreatingId] = useState(null);
  const [createError, setCreateError] = useState('');
  const loadTemplates = useCallback(() => templates().then(unwrapTemplates), []);
  const { data: templatesList, loading, error, reload } = useAsyncData(loadTemplates);
  const activeTemplates = (templatesList || []).filter((template) => template.isActive ?? template.is_active);

  async function create(templateId) {
    setCreatingId(templateId);
    setCreateError('');
    try {
      const response = await createDraft(templateId);
      const draft = response.draft || response;
      navigate(`/drafts/${draft.id}/fill`);
    } catch (requestError) {
      setCreateError(requestError.message || 'Unable to start a draft. Please try again.');
    } finally {
      setCreatingId(null);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="New agreement"
        title="Start with a template."
        description="Choose an active template to create a draft. The template’s fields and clauses will guide the next steps."
      />
      {createError && <div className="mb-5"><ErrorState message={createError} /></div>}
      {loading ? <LoadingState label="Loading available templates…" />
        : error ? <ErrorState message={error} onRetry={reload} />
          : !activeTemplates.length ? (
            <EmptyState title="No active templates are available." description="Please check back later or contact support if you think this is unexpected." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {activeTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onCreate={create}
                  disabled={Boolean(creatingId)}
                />
              ))}
            </div>
          )}
    </div>
  );
}
