import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { format } from "date-fns";
import { Search, X, History } from "lucide-react";
import type {
  RecentLogItem,
  RecentLogPagination,
} from "../types/recent-log-types";

export interface DashboardRecentTableProps {
  logs?: RecentLogItem[];
  isLoading?: boolean;
  pagination?: RecentLogPagination;
  page?: number;
  limit?: number;
  searchTerm?: string;
  actionFilter?: string;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onSearchChange?: (search: string) => void;
  onActionFilterChange?: (action: string) => void;
}

const ACTION_FILTERS = [
  { label: "All", value: "" },
  { label: "Created", value: "Created Meeting" },
  { label: "Joined", value: "Joined Meeting" },
  { label: "Ended", value: "Ended Meeting" },
];

const LIMIT_OPTIONS = [10, 20, 50];

const getActionBadge = (action: string) => {
  const lower = action.toLowerCase();
  if (lower.includes("created")) {
    return (
      <Badge className="bg-primary/15 text-primary border border-primary/30 font-medium px-3 py-1 text-xs">
        {action}
      </Badge>
    );
  }
  if (lower.includes("joined")) {
    return (
      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-medium px-3 py-1 text-xs">
        {action}
      </Badge>
    );
  }
  if (lower.includes("ended")) {
    return (
      <Badge variant="secondary" className="font-medium px-3 py-1 text-xs">
        {action}
      </Badge>
    );
  }
  if (lower.includes("logout") || lower.includes("cancelled")) {
    return (
      <Badge variant="destructive" className="font-medium px-3 py-1 text-xs">
        {action}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="font-medium px-3 py-1 text-xs">
      {action}
    </Badge>
  );
};

const formatDateSafe = (dateString?: string) => {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return format(d, "MMM d, yyyy · h:mm a");
  } catch {
    return dateString;
  }
};

const getPaginationItems = (currentPage: number, totalPages: number) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: (number | "ellipsis-start" | "ellipsis-end")[] = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) {
    items.push("ellipsis-start");
  }

  for (let i = start; i <= end; i++) {
    items.push(i);
  }

  if (end < totalPages - 1) {
    items.push("ellipsis-end");
  }

  items.push(totalPages);
  return items;
};

export function DashboardRecentTable({
  logs = [],
  isLoading = false,
  pagination,
  page = 1,
  limit = 10,
  searchTerm = "",
  actionFilter = "",
  onPageChange,
  onLimitChange,
  onSearchChange,
  onActionFilterChange,
}: DashboardRecentTableProps) {
  const [searchValue, setSearchValue] = useState(searchTerm);

  // Sync external search term changes
  useEffect(() => {
    setSearchValue(searchTerm);
  }, [searchTerm]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== searchTerm) {
        onSearchChange?.(searchValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, searchTerm, onSearchChange]);

  const total = pagination?.total ?? logs.length;
  const totalPages = pagination?.totalPages ?? Math.max(1, Math.ceil(total / limit));
  const hasPrevPage = pagination ? pagination.hasPrevPage : page > 1;
  const hasNextPage = pagination ? pagination.hasNextPage : page < totalPages;

  const startRecord = total > 0 ? (page - 1) * limit + 1 : 0;
  const endRecord = total > 0 ? Math.min(page * limit, total) : 0;

  const paginationItems = getPaginationItems(page, totalPages);

  const handleClearSearch = () => {
    setSearchValue("");
    onSearchChange?.("");
  };

  const hasActiveFilters = Boolean(searchTerm.trim() || actionFilter);

  const handleResetFilters = () => {
    setSearchValue("");
    onSearchChange?.("");
    onActionFilterChange?.("");
  };

  return (
    <div className="rounded-xl border border-border/80 bg-card text-card-foreground shadow-xs overflow-hidden flex flex-col">
      {/* Controls Toolbar: Search & Action Filters */}
      <div className="p-4 border-b border-border/80 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search logs by action or description..."
            className="pl-9 pr-8 h-9 text-sm bg-background border-border"
          />
          {searchValue && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action filter pills */}
        <div className="flex items-center gap-1 bg-background/80 p-1 rounded-lg border border-border">
          {ACTION_FILTERS.map((filter) => {
            const isSelected = actionFilter === filter.value;
            return (
              <button
                key={filter.label}
                type="button"
                onClick={() => onActionFilterChange?.(filter.value)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-border/80">
            <TableHead className="w-[200px] h-12 px-6 font-semibold text-sm">Action</TableHead>
            <TableHead className="h-12 px-6 font-semibold text-sm">Description</TableHead>
            <TableHead className="text-right w-[220px] h-12 px-6 font-semibold text-sm">Date & Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: limit > 5 ? 5 : limit }).map((_, i) => (
              <TableRow key={i} className="border-b border-border/40">
                <TableCell className="w-[200px] px-6 py-4.5">
                  <Skeleton className="h-6 w-28 rounded-full" />
                </TableCell>
                <TableCell className="px-6 py-4.5">
                  <Skeleton className="h-5 w-3/4" />
                </TableCell>
                <TableCell className="text-right w-[220px] px-6 py-4.5">
                  <Skeleton className="h-5 w-32 ml-auto" />
                </TableCell>
              </TableRow>
            ))
          ) : logs.length > 0 ? (
            logs.map((log) => (
              <TableRow
                key={log._id}
                className="transition-colors hover:bg-muted/40 border-b border-border/40"
              >
                <TableCell className="px-6 py-4.5 font-medium whitespace-nowrap">
                  {getActionBadge(log.action)}
                </TableCell>
                <TableCell className="px-6 py-4.5 text-muted-foreground text-sm leading-relaxed">
                  {log.description || "—"}
                </TableCell>
                <TableCell className="px-6 py-4.5 text-right text-xs text-muted-foreground whitespace-nowrap">
                  {formatDateSafe(log.createdAt)}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={3}
                className="text-center py-12 text-muted-foreground text-sm"
              >
                <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto text-center">
                  <History className="w-8 h-8 text-muted-foreground/60" />
                  <p className="font-medium text-foreground">
                    {hasActiveFilters
                      ? "No matching logs found"
                      : "No recent activity logs found"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {hasActiveFilters
                      ? "Try refining your search term or clearing the active filters."
                      : "Your meeting sessions, joined rooms, and activity logs will appear here."}
                  </p>
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetFilters}
                      className="mt-2 text-xs"
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination Footer */}
      <div className="px-6 py-3 border-t border-border/80 bg-muted/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            {total > 0 ? (
              <>
                Showing <span className="font-medium text-foreground">{startRecord}</span> to{" "}
                <span className="font-medium text-foreground">{endRecord}</span> of{" "}
                <span className="font-medium text-foreground">{total}</span> logs
              </>
            ) : (
              <span>Showing 0 of 0 logs</span>
            )}
          </div>

          {onLimitChange && (
            <div className="flex items-center gap-1.5 pl-3 border-l border-border/80">
              <span>Show</span>
              <div className="flex items-center bg-background/80 p-0.5 rounded-lg border border-border">
                {LIMIT_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onLimitChange(opt)}
                    className={`px-2 py-0.5 text-xs rounded font-medium transition-colors cursor-pointer ${
                      limit === opt
                        ? "bg-muted text-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <span>per page</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs">
            Page <strong className="text-foreground">{Math.min(page, Math.max(1, totalPages))}</strong> of{" "}
            <strong className="text-foreground">{Math.max(1, totalPages)}</strong>
          </span>

          <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent className="gap-1">
            <PaginationItem>
              <PaginationPrevious
                onClick={() => {
                  if (hasPrevPage && onPageChange && totalPages > 1) {
                    onPageChange(page - 1);
                  }
                }}
                disabled={!hasPrevPage || isLoading || totalPages <= 1}
                className={!hasPrevPage || totalPages <= 1 ? "pointer-events-none opacity-40" : ""}
              />
            </PaginationItem>

            {paginationItems.map((item, idx) => {
              if (item === "ellipsis-start" || item === "ellipsis-end") {
                return (
                  <PaginationItem key={`ellipsis-${idx}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }

              return (
                <PaginationItem key={`page-${item}`}>
                  <PaginationLink
                    isActive={item === page}
                    onClick={() => {
                      if (item !== page && onPageChange && totalPages > 1) {
                        onPageChange(item);
                      }
                    }}
                    disabled={isLoading || totalPages <= 1}
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                onClick={() => {
                  if (hasNextPage && onPageChange && totalPages > 1) {
                    onPageChange(page + 1);
                  }
                }}
                disabled={!hasNextPage || isLoading || totalPages <= 1}
                className={!hasNextPage || totalPages <= 1 ? "pointer-events-none opacity-40" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  </div>
);
}
