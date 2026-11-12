import React from 'react';
import { cn } from '@/src/lib/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  label?: string;
}

/** Page numbers to show: first, last, and the current page with one neighbour each side. */
function pageItems(page: number, totalPages: number): (number | 'gap-start' | 'gap-end')[] {
  const wanted = new Set([1, totalPages, page - 1, page, page + 1]);
  const pages = [...wanted].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const items: (number | 'gap-start' | 'gap-end')[] = [];
  pages.forEach((p, index) => {
    if (index > 0 && p - pages[index - 1] > 1) items.push(index === 1 ? 'gap-start' : 'gap-end');
    items.push(p);
  });
  return items;
}

const buttonBase =
  'min-h-11 min-w-11 px-3 rounded-lg text-sm font-semibold tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

export default function Pagination({ page, totalPages, onPageChange, label = 'Pages' }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label={label} className="mt-6">
      <ul className="flex flex-wrap items-center justify-center gap-1">
        {page > 1 && (
          <li>
            <button type="button" onClick={() => onPageChange(page - 1)} className={cn(buttonBase, 'text-primary hover:bg-surface-container')}>
              Previous
            </button>
          </li>
        )}
        {pageItems(page, totalPages).map((item) =>
          typeof item === 'number' ? (
            <li key={item}>
              <button
                type="button"
                onClick={() => onPageChange(item)}
                aria-current={item === page ? 'page' : undefined}
                aria-label={`Page ${item}`}
                className={cn(
                  buttonBase,
                  item === page ? 'bg-primary text-on-primary' : 'text-on-surface hover:bg-surface-container',
                )}
              >
                {item}
              </button>
            </li>
          ) : (
            <li key={item} aria-hidden="true" className="px-1 text-on-surface-variant">…</li>
          ),
        )}
        {page < totalPages && (
          <li>
            <button type="button" onClick={() => onPageChange(page + 1)} className={cn(buttonBase, 'text-primary hover:bg-surface-container')}>
              Next
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
