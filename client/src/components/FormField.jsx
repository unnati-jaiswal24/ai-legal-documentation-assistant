export default function FormField({ label, htmlFor, hint, error, children, required = false }) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-xs font-medium text-[#526052] dark:text-[#c2cbc1]">
        {label}{required && <span className="ml-1 text-[#a75f4e]" aria-hidden="true">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] leading-5 text-[#858c82] dark:text-[#9ca69c]">{hint}</p>}
      {error && <p className="text-xs text-[#a14f3d] dark:text-[#e3a18d]" role="alert">{error}</p>}
    </div>
  );
}
