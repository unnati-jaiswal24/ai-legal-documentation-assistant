export default function FeatureCard({ icon: Icon, title, description }) {
  return (
    <article className="group h-full rounded-2xl border border-[#e1e3da] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#cbd7c9] hover:shadow-[0_20px_48px_-34px_rgba(41,63,43,0.4)] dark:border-[#303a31] dark:bg-[#1b231c] dark:hover:border-[#4a5b4b] sm:p-8">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f1f4ef] text-[#527257] transition-colors group-hover:bg-[#e8f0e7] dark:bg-[#283329] dark:text-[#b2d0b6] dark:group-hover:bg-[#344a37]">
        <Icon size={20} strokeWidth={1.7} />
      </span>
      <h3 className="mt-6 text-base font-semibold tracking-tight text-[#29332a] dark:text-[#e8ece6]">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-[#747c73] dark:text-[#adb6ab]">{description}</p>
    </article>
  );
}
