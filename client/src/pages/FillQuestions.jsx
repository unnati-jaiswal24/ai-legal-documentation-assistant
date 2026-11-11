import { useCallback, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Check, Save } from 'lucide-react';
import { draft as fetchDraft, saveValues } from '../api/drafts';
import Button from '../components/Button';
import Card from '../components/Card';
import FieldInput from '../components/FieldInput';
import PageHeader from '../components/PageHeader';
import StepBar from '../components/StepBar';
import { ErrorState, LoadingState } from '../components/StatePanel';
import useAsyncData from '../hooks/useAsyncData';

function unwrapDraft(response) {
  return response.draft || response;
}

function valuesByFieldId(draft) {
  const values = draft.values || draft.fieldValues || draft.field_values || [];
  return Object.fromEntries(values.map((item) => [item.fieldId || item.field_id, item.value]));
}

export default function FillQuestions() {
  const { id } = useParams();
  const [edits, setEdits] = useState({ draftId: null, values: {} });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);
  const loadDraft = useCallback(() => fetchDraft(id).then(unwrapDraft), [id]);
  const { data: draft, loading, error, reload } = useAsyncData(loadDraft);
  const answers = draft
    ? { ...valuesByFieldId(draft), ...(edits.draftId === draft.id ? edits.values : {}) }
    : {};

  const fields = useMemo(
    () => [...(draft?.template?.fields || draft?.template?.templateFields || draft?.template?.template_fields || [])]
      .sort((a, b) => (a.displayOrder ?? a.display_order ?? 0) - (b.displayOrder ?? b.display_order ?? 0)),
    [draft],
  );
  const filledCount = fields.filter((field) => {
    const value = answers[field.id];
    return value !== undefined && value !== null && value !== '';
  }).length;

  function update(fieldId, value) {
    setEdits((current) => ({
      draftId: draft.id,
      values: { ...(current.draftId === draft.id ? current.values : {}), [fieldId]: value },
    }));
    setSaveError('');
    setSaved(false);
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setSaveError('');
    setSaved(false);
    try {
      const values = fields
        .filter((field) => answers[field.id] !== undefined)
        .map((field) => ({ fieldId: field.id, value: answers[field.id] }));
      await saveValues(id, values);
      setSaved(true);
    } catch (requestError) {
      setSaveError(requestError.message || 'Your answers could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState label="Loading agreement questions…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!draft) return <ErrorState message="This draft could not be found." />;

  const templateTitle = draft.template?.title || 'Freelance service agreement';
  return (
    <div>
      <StepBar id={id} active="fill" />
      <PageHeader
        eyebrow={templateTitle}
        title="Tell us about the work."
        description="Your answers fill the fields connected to this template. You can come back and edit them later."
      />

      <div className="mb-4 flex items-center justify-between text-[11px] text-[#778075] dark:text-[#aab3a9]">
        <span>{filledCount} of {fields.length} fields completed</span>
        <span>{fields.length ? Math.round((filledCount / fields.length) * 100) : 0}%</span>
      </div>
      <div className="mb-7 h-1.5 overflow-hidden rounded-full bg-[#e8eae3] dark:bg-[#303a31]" role="progressbar" aria-valuemin={0} aria-valuemax={fields.length} aria-valuenow={filledCount}>
        <div className="h-full rounded-full bg-[#78977b] transition-[width] duration-300" style={{ width: fields.length ? `${(filledCount / fields.length) * 100}%` : '0%' }} />
      </div>

      <form onSubmit={save}>
        <Card className="p-5 sm:p-8">
          {!fields.length ? (
            <p className="text-sm text-[#747c73] dark:text-[#adb6ab]">This template has no questionnaire fields.</p>
          ) : (
            <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
              {fields.map((field) => (
                <div key={field.id} className={(field.dataType || field.data_type) === 'boolean' ? 'sm:col-span-2' : ''}>
                  <FieldInput
                    field={field}
                    value={answers[field.id]}
                    onChange={(value) => update(field.id, value)}
                  />
                </div>
              ))}
            </div>
          )}

          {saveError && <div className="mt-6"><ErrorState message={saveError} /></div>}
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#ecece6] pt-5 dark:border-[#303a31] sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-[#778075] dark:text-[#aab3a9]">
              {saved && <span className="inline-flex items-center gap-1.5 text-[#55775d] dark:text-[#a9c5a9]"><Check size={14} /> Answers saved</span>}
            </span>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" variant="outline" disabled={saving}><Save size={14} /> {saving ? 'Saving…' : 'Save progress'}</Button>
              <Link to={`/drafts/${id}/review`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#31583b] px-5 text-xs font-semibold text-white hover:bg-[#284b32] dark:bg-[#779779] dark:text-[#101a12]">
                Continue to review <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
