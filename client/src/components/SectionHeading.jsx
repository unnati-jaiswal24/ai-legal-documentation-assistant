export default function SectionHeading({ title, badge, description, centered = true }) {
  return (
    <div className={`mx-auto mb-12 max-w-2xl ${centered ? 'text-center' : ''} sm:mb-14`}>
      {badge && (
        <span className="inline-flex rounded-full border border-[#e1e4dc] bg-white/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#607361] dark:border-[#39443a] dark:bg-[#1b231c] dark:text-[#b2c8b2]">
          {badge}
        </span>
      )}
      <h2 className="mt-4 font-serif text-3xl leading-tight tracking-[-0.035em] text-[#29332a] dark:text-[#e8ece6] sm:text-4xl md:text-[2.75rem]">
        {title}
      </h2>
      {description && (
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#747c73] dark:text-[#adb6ab] sm:text-base sm:leading-7">
          {description}
        </p>
      )}
    </div>
  );
}