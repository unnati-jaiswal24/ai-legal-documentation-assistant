import FormField from './FormField';

function getOptions(field) {
  const options = field.options || field.selectOptions || field.select_options;
  if (Array.isArray(options)) return options;
  if (typeof options === 'string') {
    try {
      const parsed = JSON.parse(options);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export default function FieldInput({ field, value, onChange, error }) {
  const type = field.dataType || field.data_type;
  const label = field.labelPlain || field.label_plain || field.fieldKey || field.field_key;
  const inputType = { number: 'number', date: 'date', email: 'email', phone: 'tel' }[type] || 'text';
  const required = Boolean(field.isRequired ?? field.is_required);
  const id = `template-field-${field.id}`;
  const controlClass = 'form-control';
  const options = getOptions(field);

  return (
    <FormField htmlFor={id} label={label} required={required} error={error}>
      {type === 'select' && options.length ? (
        <select
          id={id}
          name={field.fieldKey || field.field_key || field.id}
          required={required}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          className={controlClass}
        >
          <option value="">Select an option</option>
          {options.map((option) => {
            const optionValue = typeof option === 'string' ? option : option.value ?? option.id;
            const optionLabel = typeof option === 'string' ? option : option.label ?? option.name ?? optionValue;
            return <option key={optionValue} value={optionValue}>{optionLabel}</option>;
          })}
        </select>
      ) : type === 'boolean' ? (
        <div className="flex min-h-11 items-center gap-3 rounded-lg border border-[#dfe2d9] bg-white px-3 dark:border-[#39443a] dark:bg-[#1d251e]">
          <input
            id={id}
            name={field.fieldKey || field.field_key || field.id}
            type="checkbox"
            required={required}
            checked={Boolean(value)}
            onChange={(event) => onChange(event.target.checked)}
            className="h-4 w-4 rounded border-[#cbd3c9] accent-[#45674c]"
          />
          <span className="text-xs text-[#667067] dark:text-[#b7c0b5]">Yes</span>
        </div>
      ) : (
        <input
          id={id}
          name={field.fieldKey || field.field_key || field.id}
          type={inputType}
          required={required}
          aria-invalid={Boolean(error)}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          className={controlClass}
        />
      )}
    </FormField>
  );
}
