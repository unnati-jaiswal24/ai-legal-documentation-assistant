import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';

export default function DataTable({
  columns,
  rows,
  searchPlaceholder = 'Search records',
  filterOptions = [],
  pageSize = 5,
  emptyMessage = 'No records match these filters.',
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState({ key: '', direction: 'asc' });
  const [page, setPage] = useState(0);

  const filteredRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = rows.filter((row) => {
      const matchesSearch = !needle || columns.some((column) => {
        const value = column.searchValue ? column.searchValue(row) : row[column.key];
        return String(value ?? '').toLowerCase().includes(needle);
      });
      const matchesFilter = !filter || String(row.status || '') === filter;
      return matchesSearch && matchesFilter;
    });
    if (!sort.key) return filtered;
    const column = columns.find((item) => item.key === sort.key);
    return [...filtered].sort((a, b) => {
      const left = column?.sortValue ? column.sortValue(a) : a[sort.key];
      const right = column?.sortValue ? column.sortValue(b) : b[sort.key];
      const compared = typeof left === 'number' && typeof right === 'number'
        ? left - right
        : String(left ?? '').localeCompare(String(right ?? ''), undefined, { numeric: true, sensitivity: 'base' });
      return sort.direction === 'asc' ? compared : -compared;
    });
  }, [columns, filter, query, rows, sort]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const visibleRows = filteredRows.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const start = filteredRows.length ? currentPage * pageSize + 1 : 0;
  const end = Math.min((currentPage + 1) * pageSize, filteredRows.length);

  function toggleSort(key) {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
    setPage(0);
  }

  return (
    <div>
      <div className="flex flex-col gap-2 border-b border-[#ecece6] p-3 sm:flex-row sm:items-center dark:border-[#303a31]">
        <label className="relative min-w-0 flex-1">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#92998f]" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => {
              const nextParams = new URLSearchParams(searchParams);
              if (event.target.value) nextParams.set('q', event.target.value);
              else nextParams.delete('q');
              setSearchParams(nextParams, { replace: true });
              setPage(0);
            }}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="h-9 w-full rounded-lg border border-[#e4e6df] bg-[#fff] pl-9 pr-3 text-[11px] text-[#354136] placeholder:text-[#9aa197] focus:border-[#9bb39b] focus:outline-none focus:ring-2 focus:ring-[#dce8da] dark:border-[#39443a] dark:bg-[#1d251e] dark:text-[#e0e6df]"
          />
        </label>
        {filterOptions.length > 0 && (
          <label className="relative flex h-9 items-center gap-2 rounded-lg border border-[#e4e6df] px-2.5 text-[11px] text-[#6d776c] dark:border-[#39443a] dark:text-[#adb6ab]">
            <SlidersHorizontal size={13} aria-hidden="true" />
            <select
              value={filter}
              onChange={(event) => { setFilter(event.target.value); setPage(0); }}
              aria-label="Filter by status"
              className="max-w-40 appearance-none bg-transparent pr-4 outline-none"
            >
              <option value="">All statuses</option>
              {filterOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-2" aria-hidden="true" />
          </label>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-left">
          <thead>
            <tr className="bg-[#fafbf8] dark:bg-[#202820]">
              {columns.map((column) => (
                <th key={column.key} scope="col" className="px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#879084] sm:px-5">
                  {column.sortable === false ? column.label : (
                    <button type="button" onClick={() => toggleSort(column.key)} className="inline-flex items-center gap-1 hover:text-[#45674c]">
                      {column.label}
                      <ChevronDown size={11} className={sort.key === column.key && sort.direction === 'asc' ? 'rotate-180' : ''} aria-hidden="true" />
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eff0eb] dark:divide-[#303a31]">
            {visibleRows.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-[#fbfcfa] dark:hover:bg-[#202820]">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3.5 text-[11px] text-[#5e695e] sm:px-5 dark:text-[#b8c0b6]">
                    {column.render ? column.render(row) : row[column.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {visibleRows.length === 0 && (
          <div className="px-5 py-10 text-center text-xs text-[#879084]">{emptyMessage}</div>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-[#ecece6] px-4 py-3 text-[10px] text-[#879084] dark:border-[#303a31]">
        <span>Showing {start}–{end} of {filteredRows.length}</span>
        <div className="flex items-center gap-1">
          <button type="button" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)} aria-label="Previous page" className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-[#f1f3ee] disabled:opacity-40 dark:hover:bg-[#29332a]"><ChevronLeft size={14} /></button>
          <span className="min-w-10 text-center">{currentPage + 1} / {pageCount}</span>
          <button type="button" disabled={currentPage >= pageCount - 1} onClick={() => setPage(currentPage + 1)} aria-label="Next page" className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-[#f1f3ee] disabled:opacity-40 dark:hover:bg-[#29332a]"><ChevronRight size={14} /></button>
        </div>
      </div>
    </div>
  );
}
