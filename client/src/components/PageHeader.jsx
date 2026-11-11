export default function PageHeader({ title, description, actions, eyebrow }) {
  return (
    <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#718472] dark:text-[#9eb29e]">
            {eyebrow}
          </p>
        )}
        <h1 className="page-title">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-[#747c73] dark:text-[#adb6ab]">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
