import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CircleAlert, ClipboardCheck } from 'lucide-react';
import { draft as fetchDraft, validateDraft } from '../api/drafts';
import Button from '../components/Button';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import StepBar from '../components/StepBar';
import { ErrorState, LoadingState } from '../components/StatePanel';
import useAsyncData from '../hooks/useAsyncData';

function unwrapDraft(response) {
  return response.draft || response;
}

function unwrapErrors(result) {
  const errors = result?.errors || result?.validationErrors || result?.validation_errors || [];
  return Array.isArray(errors) ? errors : Object.values(errors);
}

function fieldLabel(field) {
  return field.labelPlain || field.label_plain || field.fieldKey || field.field_key || 'Answer';
}

export default function Review() {
  const { id } = useParams();
  const [validation, setValidation] = useState(null);
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState('');
  const loadDraft = useCallback(() => fetchDraft(id).then(unwrapDraft), [id]);
  const { data: draft, loading, error, reload } = useAsyncData(loadDraft);

  async function runValidation() {
    setValidating(true);
    setValidationError('');
    try {
      setValidation(await validateDraft(id));
    } catch (requestError) {
      setValidationError(requestError.message || 'The agreement could not be validated.');
    } finally {
      setValidating(false);
    }
  }

  if (loading) return <LoadingState label="Loading your agreement…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!draft) return <ErrorState message="This draft could not be found." />;

  const template = draft.template || {};
  const fields = template.fields || template.templateFields || template.template_fields || [];
  const values = draft.values || draft.fieldValues || draft.field_values || [];
  const validationErrors = unwrapErrors(validation);
  const valid = validation && !validationErrors.length && ['validated', 'generated', 'exported'].includes(validation.status);

  return (
    <div>
      <StepBar id={id} active="review" />
      <PageHeader
        eyebrow={template.title || 'Freelance service agreement'}
        title="Review your details."
        description="Check the answers attached to this draft, then ask the existing validation service to check required fields and consistency."
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card className="p-5 sm:p-7">
          <div className="flex items-center gap-3 border-b border-[#ecece6] pb-4 dark:border-[#303a31]">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eff3ed] text-[#58765b] dark:bg-[#29352b] dark:text-[#b4c8b1]"><ClipboardCheck size={17} /></span>
            <div>
              <h2 className="text-sm font-semibold text-[#354136] dark:text-[#e0e6df]">Your answers</h2>
              <p className="mt-1 text-[10px] text-[#858c82] dark:text-[#9ca69c]">{values.length} saved fields</p>
            </div>
          </div>
          {!fields.length ? (
            <p className="py-6 text-sm text-[#747c73] dark:text-[#adb6ab]">No fields were returned for this template.</p>
          ) : (
            <dl className="divide-y divide-[#ecece6] dark:divide-[#303a31]">
              {fields.map((field) => {
                const saved = values.find((item) => (item.fieldId || item.field_id) === field.id);
                const value = saved?.value;
                return (
                  <div key={field.id} className="grid gap-1 py-4 sm:grid-cols-[minmax(150px,0.6fr)_1fr] sm:gap-5">
                    <dt className="text-xs font-medium text-[#788176] dark:text-[#aab3a9]">{fieldLabel(field)}</dt>
                    <dd className="break-words text-xs text-[#354136] dark:text-[#e0e6df]">
                      {value === undefined || value === null || value === '' ? <span className="text-[#9b6555]">Not answered</span> : typeof value === 'boolean' ? value ? 'Yes' : 'No' : String(value)}
                    </dd>
                  </div>
                );
              })}
            </dl>
          )}
          <div className="mt-5 border-t border-[#ecece6] pt-5 dark:border-[#303a31]">
            <Link to={`/drafts/${id}/fill`} className="inline-flex items-center gap-2 text-xs font-semibold text-[#55775d] hover:underline dark:text-[#a9c5a9]"><ArrowLeft size={14} /> Edit answers</Link>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-[#354136] dark:text-[#e0e6df]">Validation</h2>
            <p className="mt-2 text-xs leading-5 text-[#747c73] dark:text-[#adb6ab]">Validation is handled by the server using this draft’s saved answers and template rules.</p>
            {validation && (
              <div className={`mt-4 flex items-start gap-2 rounded-lg p-3 text-xs ${valid ? 'bg-[#edf3ec] text-[#45674c] dark:bg-[#29382b] dark:text-[#c0d3bd]' : 'bg-[#faf5e8] text-[#766a47] dark:bg-[#353124] dark:text-[#d4c697]'}`} role="status">
                {valid ? <Check size={15} className="mt-0.5 shrink-0" /> : <CircleAlert size={15} className="mt-0.5 shrink-0" />}
                <span>{valid ? 'Validation complete. Continue to preview when ready.' : `Status: ${String(validation.status || 'needs review').replaceAll('_', ' ')}`}</span>
              </div>
            )}
            {validationError && <p className="mt-3 text-xs text-[#a14f3d] dark:text-[#e3a18d]" role="alert">{validationError}</p>}
            <Button className="mt-5 w-full" onClick={runValidation} disabled={validating}>
              {validating ? 'Checking…' : 'Validate agreement'}
            </Button>
          </Card>
          {validationErrors.length > 0 && (
            <Card className="border-[#e8d9cb] p-5 dark:border-[#5b4738]">
              <h3 className="text-xs font-semibold text-[#8d4e3e] dark:text-[#e3a18d]">Items to review</h3>
              <ul className="mt-3 space-y-2">
                {validationErrors.map((item, index) => (
                  <li key={`${String(item.fieldId || item.field_id || item)}-${index}`} className="text-xs leading-5 text-[#756f66] dark:text-[#c4bcb0]">
                    {typeof item === 'string' ? item : item.message || item.error || fieldLabel(fields.find((field) => field.id === (item.fieldId || item.field_id)) || {})}
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {valid && <Link to={`/drafts/${id}/preview`} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#31583b] px-5 text-xs font-semibold text-white hover:bg-[#284b32] dark:bg-[#779779] dark:text-[#101a12]">Continue to preview <ArrowRight size={14} /></Link>}
        </div>
      </div>
    </div>
  );
}
