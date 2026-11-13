function chartPoints(values, width, height, padding, max) {
  return values.map((value, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(values.length - 1, 1);
    const y = height - padding - (value / max) * (height - padding * 2);
    return [x, y];
  });
}

export default function AnalyticsChart({ title, description, data, series, rangeControl }) {
  const width = 620;
  const height = 220;
  const padding = 22;
  const allValues = data.flatMap((item) => series.map((line) => item[line.key] || 0));
  const max = Math.max(...allValues, 1);
  const gridValues = [0, 0.33, 0.66, 1];

  return (
    <section className="rounded-2xl border border-[#e6e7df] bg-white p-4 shadow-[0_8px_24px_-22px_rgba(35,47,37,0.3)] sm:p-5 dark:border-[#303a31] dark:bg-[#1b231c]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[#354136] dark:text-[#e0e6df]">{title}</h2>
          {description && <p className="mt-1 text-[11px] text-[#858c82] dark:text-[#9ca69c]">{description}</p>}
        </div>
        {rangeControl}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
        {series.map((line) => (
          <span key={line.key} className="inline-flex items-center gap-1.5 text-[10px] text-[#7b857a] dark:text-[#aab3a9]">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: line.color }} />
            {line.label}
          </span>
        ))}
      </div>
      <div className="mt-2 overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title} className="h-[190px] w-full overflow-visible">
          {gridValues.map((fraction) => {
            const y = height - padding - fraction * (height - padding * 2);
            return (
              <g key={fraction}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="currentColor" className="text-[#edf0e9] dark:text-[#303a31]" strokeDasharray="3 5" />
                <text x="0" y={y + 3} fontSize="9" fill="#92998f">{Math.round(max * fraction)}</text>
              </g>
            );
          })}
          {series.map((line) => {
            const points = chartPoints(data.map((item) => item[line.key] || 0), width, height, padding, max);
            return (
              <g key={line.key}>
                <polyline points={points.map(([x, y]) => `${x},${y}`).join(' ')} fill="none" stroke={line.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {points.map(([x, y], index) => <circle key={`${line.key}-${index}`} cx={x} cy={y} r="3.5" fill="#fff" stroke={line.color} strokeWidth="2" />)}
              </g>
            );
          })}
          {data.map((item, index) => {
            const x = padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
            return <text key={item.month || index} x={x} y={height - 3} textAnchor="middle" fontSize="9" fill="#92998f">{item.month}</text>;
          })}
        </svg>
      </div>
    </section>
  );
}

export function DonutChart({ title, data, totalLabel = 'documents', legendLabels }) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const stops = data.map((item, index) => {
    const preceding = data.slice(0, index).reduce((sum, entry) => sum + entry.count, 0);
    const from = (preceding / total) * 100;
    return `${item.color || '#78977b'} ${from}% ${((preceding + item.count) / total) * 100}%`;
  }).join(', ');

  return (
    <section className="rounded-2xl border border-[#e6e7df] bg-white p-4 shadow-[0_8px_24px_-22px_rgba(35,47,37,0.3)] sm:p-5 dark:border-[#303a31] dark:bg-[#1b231c]">
      <h2 className="text-sm font-semibold text-[#354136] dark:text-[#e0e6df]">{title}</h2>
      <div className="mt-4 flex flex-col items-center gap-5 sm:flex-row sm:justify-between">
        <div className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full" style={{ background: total ? `conic-gradient(${stops})` : '#edf0e9' }}>
          <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white dark:bg-[#1b231c]">
            <span className="text-xl font-semibold text-[#354136] dark:text-[#e0e6df]">{total}</span>
            <span className="text-[9px] text-[#879084]">{totalLabel}</span>
          </div>
        </div>
        <ul className="w-full space-y-3">
          {data.map((item, index) => (
            <li key={item.typeId || item.status || index} className="flex items-center justify-between gap-3 text-[10px]">
              <span className="flex min-w-0 items-center gap-2 text-[#6d776c] dark:text-[#adb6ab]">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color || ['#31583b', '#78977b', '#c58b68', '#d8c88c'][index % 4] }} />
                <span className="truncate">{legendLabels?.[index] || item.label || item.status || item.typeId}</span>
              </span>
              <span className="font-semibold text-[#354136] dark:text-[#e0e6df]">{item.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
