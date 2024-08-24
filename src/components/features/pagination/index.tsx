import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useSearchParams, useRouter } from "next/navigation";
import { MouseEvent } from "react";

type ReusablePaginationProps = {
  currentPage: number;
  totalData: number;
  limit: number;
};

function generatePages(currentPage: number, totalPages: number): number[] {
  const pages: number[] = [];
  const totalVisibleButtons = 4;

  let startPage = Math.max(currentPage - 2, 1);
  let endPage = Math.min(startPage + totalVisibleButtons - 1, totalPages);

  if (endPage - startPage + 1 < totalVisibleButtons) {
    startPage = Math.max(endPage - totalVisibleButtons + 1, 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return pages;
}

export function ReusablePagination({
  currentPage,
  totalData,
  limit,
}: ReusablePaginationProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const totalPages = Math.ceil(totalData / limit);
  const pages = generatePages(currentPage, totalPages);

  const handlePageChange = (page: number, e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams as any);

    params.set("page", page.toString());

    router.push(`${window.location.pathname}?${params.toString()}`, {
      scroll: false,
    });
  };

  // Jika totalData adalah 0, jangan tampilkan pagination apa pun
  if (totalData === 0) {
    return null;
  }

  return (
    <Pagination className="mt-4 flex justify-center">
      <PaginationContent className="flex space-x-2">
        {/* Previous Button */}
        <PaginationItem className="hidden sm:block">
          <PaginationPrevious
            onClick={(e) => handlePageChange(Math.max(currentPage - 1, 1), e)}
          />
        </PaginationItem>

        {/* Jika currentPage > 3, tampilkan awal pagination dan ellipsis */}
        {currentPage > 3 && (
          <>
            <PaginationItem>
              <PaginationLink onClick={(e) => handlePageChange(1, e)}>
                1
              </PaginationLink>
            </PaginationItem>
            {currentPage > 4 && (
              <PaginationEllipsis className="hidden sm:flex" />
            )}
          </>
        )}

        {/* Pagination links */}
        {pages.map((page) => (
          <PaginationItem key={page} className="flex">
            <PaginationLink
              isActive={page === currentPage}
              onClick={(e) => handlePageChange(page, e)}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {/* Jika currentPage < totalPages - 2, tampilkan akhir pagination dan ellipsis */}
        {currentPage < totalPages - 2 && (
          <>
            {currentPage < totalPages - 3 && (
              <PaginationEllipsis className="hidden sm:flex" />
            )}
            <PaginationItem className="hidden sm:block">
              <PaginationLink onClick={(e) => handlePageChange(totalPages, e)}>
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        {/* Next Button */}
        <PaginationItem className="hidden sm:block">
          <PaginationNext
            onClick={(e) =>
              handlePageChange(Math.min(currentPage + 1, totalPages), e)
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
