'use client';

import { ReactNode, useState } from 'react';
import { ChevronRight, ChevronLeft, Search, ChevronUp, ChevronDown } from 'lucide-react';
import EmptyState from './EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  actions?: (row: T) => ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  toolbar?: ReactNode;
  keyField?: string;
}

function TableSkeleton({ cols, rows = 5 }: { cols: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-b border-border">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-4 py-3">
              <div className="skeleton h-4 rounded" style={{ width: `${60 + Math.random() * 30}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  loading = false,
  searchable = true,
  searchPlaceholder = 'بحث...',
  pageSize = 10,
  onRowClick,
  actions,
  emptyTitle,
  emptyDescription,
  toolbar,
  keyField = 'id',
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Filter
  const filtered = search
    ? data.filter((row) =>
        Object.values(row).some((val) =>
          String(val ?? '').toLowerCase().includes(search.toLowerCase())
        )
      )
    : data;

  // Sort
  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const av = String(a[sortKey] ?? '');
        const bv = String(b[sortKey] ?? '');
        return sortDir === 'asc' ? av.localeCompare(bv, 'ar') : bv.localeCompare(av, 'ar');
      })
    : filtered;

  // Paginate
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const allCols = actions
    ? [...columns, { key: '__actions', header: 'الإجراءات', className: 'text-center w-32' }]
    : columns;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden card-shadow">
      {/* Toolbar */}
      {(searchable || toolbar) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-border">
          {searchable && (
            <div className="relative flex-1 max-w-xs">
              <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder={searchPlaceholder}
                className="w-full bg-background border border-border rounded-xl pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
              />
            </div>
          )}
          {toolbar && <div className="flex items-center gap-2 mr-auto">{toolbar}</div>}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              {allCols.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-right font-semibold text-muted-foreground select-none
                    ${col.className ?? ''}
                    ${'sortable' in col && col.sortable ? 'cursor-pointer hover:text-foreground' : ''}`}
                  onClick={() => 'sortable' in col && col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {'sortable' in col && col.sortable && (
                      <span className="inline-flex flex-col">
                        <ChevronUp size={10} className={sortKey === col.key && sortDir === 'asc' ? 'text-primary' : 'text-muted-foreground/40'} />
                        <ChevronDown size={10} className={sortKey === col.key && sortDir === 'desc' ? 'text-primary' : 'text-muted-foreground/40'} />
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton cols={allCols.length} />
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={allCols.length}>
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
                <tr
                  key={String(row[keyField] ?? i)}
                  className={`border-b border-border/50 table-row-hover transition-colors
                    ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 ${col.className ?? ''}`}>
                      {col.render ? col.render(row) : String(row[col.key] ?? '-')}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
          <p className="text-xs text-muted-foreground">
            عرض {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, sorted.length)} من {sorted.length} نتيجة
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors
                    ${page === p ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
