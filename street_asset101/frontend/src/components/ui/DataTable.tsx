'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Download } from 'lucide-react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  meta?: { total: number; page: number; limit: number; totalPages: number };
  onPageChange?: (page: number) => void;
  onSort?: (key: string) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  searchValue?: string;
  onSearch?: (value: string) => void;
  loading?: boolean;
  onExport?: () => void;
  onRowClick?: (item: T) => void;
}

export default function DataTable<T extends Record<string, any>>({
  columns, data, meta, onPageChange, onSearch, searchValue, loading, onExport, onRowClick,
}: DataTableProps<T>) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {onSearch && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text" placeholder="Search..." value={searchValue || ''}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
        {onExport && (
          <button onClick={onExport} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
            <Download className="h-4 w-4" /> Export
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-950 divide-y divide-gray-200 dark:divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-gray-500">
                  No data found
                </td>
              </tr>
            ) : data.map((item, idx) => (
              <tr key={item.id || idx} className={onRowClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900' : ''} onClick={() => onRowClick?.(item)}>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm whitespace-nowrap">
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => onPageChange?.(1)} disabled={meta.page === 1} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50">
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button onClick={() => onPageChange?.(meta.page - 1)} disabled={meta.page === 1} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 py-1 text-sm">{meta.page} / {meta.totalPages}</span>
            <button onClick={() => onPageChange?.(meta.page + 1)} disabled={meta.page === meta.totalPages} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50">
              <ChevronRight className="h-4 w-4" />
            </button>
            <button onClick={() => onPageChange?.(meta.totalPages)} disabled={meta.page === meta.totalPages} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50">
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
