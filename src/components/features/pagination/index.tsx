import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { MouseEvent, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ReusablePaginationProps = {
  currentPage: number;
  totalData: number;
  limit: number;
};

export function ReusablePagination({
  currentPage,
  totalData,
  limit,
}: ReusablePaginationProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const totalPages = Math.ceil(totalData / limit);
  const [jumpPage, setJumpPage] = useState("");

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    const params = new URLSearchParams(searchParams as any);
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleLimitChange = (newLimit: string) => {
    const params = new URLSearchParams(searchParams as any);
    params.set("limit", newLimit);
    params.set("page", "1"); // Reset to first page
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleJump = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const pageNum = parseInt(jumpPage);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        handlePageChange(pageNum);
        setJumpPage("");
      }
    }
  };

  if (totalData === 0) return null;

  // Logic for showing page numbers like the image
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "ellipsis", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, "ellipsis", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-row items-center justify-between gap-6 py-4 px-2 w-full">
      <div className="text-base text-slate-500 dark:text-slate-400 whitespace-nowrap">
        <span className="font-bold text-slate-900 dark:text-white">{totalData}</span> in total
      </div>

      <div className="flex flex-row items-center gap-4">
        <Pagination className="mx-0 w-auto">
          <PaginationContent className="gap-2">
            <PaginationItem>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-all hover:border-primary hover:text-primary disabled:opacity-30 dark:border-slate-800 dark:bg-slate-950"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </PaginationItem>

            {getPageNumbers().map((page, idx) => (
              <PaginationItem key={idx}>
                {page === "ellipsis" ? (
                  <PaginationEllipsis className="h-9 w-9" />
                ) : (
                  <button
                    onClick={() => handlePageChange(page as number)}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-all",
                      currentPage === page
                        ? "border-primary bg-primary text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-primary hover:text-primary dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-800"
                    )}
                  >
                    {page}
                  </button>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-all hover:border-primary hover:text-primary disabled:opacity-30 dark:border-slate-800 dark:bg-slate-950"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2" />

        <div className="flex items-center gap-4">
          <Select value={limit.toString()} onValueChange={handleLimitChange}>
            <SelectTrigger className="h-9 w-[130px] text-sm border-slate-200 dark:border-slate-800">
              <SelectValue placeholder={`${limit} / page`} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {[5, 10, 20, 50, 100].map((val) => (
                  <SelectItem key={val} value={val.toString()} className="text-sm">
                    {val} / page
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
            Go to
            <Input
              value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value)}
              onKeyDown={handleJump}
              className="h-9 w-16 border-slate-200 px-2 text-center text-sm dark:border-slate-800 focus-visible:ring-primary shadow-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
