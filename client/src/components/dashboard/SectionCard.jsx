export default function SectionCard({ title, description, action, children, className = '' }) {
  return (
    <section className={`overflow-hidden rounded-2xl border border-[#e6e7df] bg-white shadow-[0_8px_24px_-22px_rgba(35,47,37,0.3)] dark:border-[#303a31] dark:bg-[#1b231c] ${className}`}>
      {(title || action) && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#ecece6] px-4 py-4 sm:px-5 dark:border-[#303a31]">
          <div>
            {title && <h2 className="text-sm font-semibold text-[#354136] dark:text-[#e0e6df]">{title}</h2>}
            {description && <p className="mt-1 text-[11px] leading-5 text-[#858c82] dark:text-[#9ca69c]">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
