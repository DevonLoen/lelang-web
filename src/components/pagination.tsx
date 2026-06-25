import type { PaginationMeta } from '@/api/utils';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface Props {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function ProductPagination({ meta, onPageChange }: Props) {
  const { page: currentPage, totalPage } = meta;

  const getPageNumbers = () => {
    const pages = [];
    const showMax = 3;

    let start = Math.max(1, currentPage - 1);
    const end = Math.min(totalPage, start + showMax - 1);

    if (end === totalPage) {
      start = Math.max(1, totalPage - showMax + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return { pages, lastPage: totalPage, showEllipsis: end < totalPage };
  };

  const { pages, lastPage, showEllipsis } = getPageNumbers();

  return (
    <Pagination className="justify-start mt-8">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            onClick={(e) => {
              e.preventDefault();
              onPageChange(currentPage - 1);
            }}
          />
        </PaginationItem>

        {pages.map((pageNo) => (
          <PaginationItem key={pageNo}>
            <PaginationLink
              href="#"
              isActive={pageNo === currentPage}
              onClick={(e) => {
                e.preventDefault();
                onPageChange(pageNo);
              }}
            >
              {pageNo}
            </PaginationLink>
          </PaginationItem>
        ))}

        {showEllipsis && (
          <>
            {pages[pages.length - 1] < lastPage - 1 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationLink
                href="#"
                isActive={currentPage === lastPage}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(lastPage);
                }}
              >
                {lastPage}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            className={currentPage === totalPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            onClick={(e) => {
              e.preventDefault();
              onPageChange(currentPage + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
