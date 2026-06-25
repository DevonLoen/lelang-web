import type { PaginationMeta } from '@/api/utils';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppPaginationProps {
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  className?: string;
}

interface ProductPaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  className?: string;
}

const getPageItems = (page: number, totalPages: number) => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);

  const items: Array<number | 'ellipsis-left' | 'ellipsis-right'> = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) items.push('ellipsis-left');
  for (let nextPage = start; nextPage <= end; nextPage += 1) items.push(nextPage);
  if (end < totalPages - 1) items.push('ellipsis-right');
  items.push(totalPages);

  return items;
};

export function AppPagination({ page, total, limit, onPageChange, className = '' }: AppPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);
  const pageItems = getPageItems(page, totalPages);

  return (
    <nav
      className={`mt-8 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between ${className}`}
      aria-label="Pagination"
    >
      <p className="text-center text-sm text-slate-500 sm:text-left">
        Showing <strong className="font-semibold text-slate-900">{startItem}-{endItem}</strong> of{' '}
        <strong className="font-semibold text-slate-900">{total}</strong>
      </p>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="h-9 px-3"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Prev</span>
        </Button>

        {pageItems.map((item) =>
          typeof item === 'number' ? (
            <button
              key={item}
              type="button"
              aria-current={item === page ? 'page' : undefined}
              onClick={() => onPageChange(item)}
              className={`h-9 min-w-9 rounded px-3 text-sm font-semibold transition-colors ${
                item === page ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              {item}
            </button>
          ) : (
            <span key={item} className="flex h-9 w-9 items-center justify-center text-slate-400">
              <MoreHorizontal className="h-4 w-4" />
            </span>
          ),
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="h-9 px-3"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}

export function ProductPagination({ meta, onPageChange, className }: ProductPaginationProps) {
  return (
    <AppPagination
      page={meta.page}
      total={meta.totalData}
      limit={meta.size}
      onPageChange={onPageChange}
      className={className}
    />
  );
}
