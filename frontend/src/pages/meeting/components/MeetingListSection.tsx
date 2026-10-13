import React, { useMemo, useState, useEffect } from "react";
import {
  FiSearch,
  FiX,
  FiRefreshCw,
  FiGrid,
  FiList,
  FiAlertCircle,
} from "react-icons/fi";
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
import type {
  MeetingDetailsResponse,
  MeetingPagination,
  MeetingStatusCounts,
} from "../types/meeting-types";
import { MeetingCard } from "./MeetingCard";
import { MeetingTableView } from "./MeetingTableView";
import { MeetingEmptyState } from "./MeetingEmptyState";

export type FilterTab = "all" | "ongoing" | "scheduled" | "completed" | "cancelled";
export type ViewMode = "grid" | "table";

export interface MeetingListSectionProps {
  meetings?: MeetingDetailsResponse[];
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  currentUserId?: string;
  onRefresh?: () => void;
  onJoin: (roomId: string) => void;
  isJoining?: boolean;
  onCancel?: (roomId: string) => void;
  isCancelling?: boolean;
  cancellingRoomId?: string | null;
  pagination?: MeetingPagination;
  counts?: MeetingStatusCounts;
  page?: number;
  limit?: number;
  searchQuery?: string;
  activeTab?: FilterTab;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onSearchChange?: (search: string) => void;
  onTabChange?: (tab: FilterTab) => void;
}

const LIMIT_OPTIONS = [5, 10, 50];

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

export const MeetingListSection: React.FC<MeetingListSectionProps> = ({
  meetings = [],
  isLoading = false,
  isFetching = false,
  isError = false,
  currentUserId,
  onRefresh,
  onJoin,
  isJoining = false,
  onCancel,
  isCancelling = false,
  cancellingRoomId = null,
  pagination,
  counts: serverCounts,
  page = 1,
  limit = 10,
  searchQuery = "",
  activeTab = "all",
  onPageChange,
  onLimitChange,
  onSearchChange,
  onTabChange,
}) => {
  const [searchValue, setSearchValue] = useState(searchQuery);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Sync external search query
  useEffect(() => {
    setSearchValue(searchQuery);
  }, [searchQuery]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== searchQuery) {
        onSearchChange?.(searchValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, searchQuery, onSearchChange]);

  // Fallback counts if backend aggregate isn't loaded yet
  const localCounts = useMemo(() => {
    let ongoing = 0;
    let scheduled = 0;
    let completed = 0;
    let cancelled = 0;

    meetings.forEach((m) => {
      const s = (m.meetingStatus || "scheduled").toLowerCase();
      if (s === "ongoing") ongoing++;
      else if (s === "scheduled") scheduled++;
      else if (s === "completed") completed++;
      else if (s === "cancelled") cancelled++;
    });

    return {
      all: meetings.length,
      ongoing,
      scheduled,
      completed,
      cancelled,
    };
  }, [meetings]);

  const effectiveCounts = serverCounts || localCounts;

  const total = pagination?.total ?? meetings.length;
  const totalPages =
    pagination?.totalPages ?? Math.max(1, Math.ceil(total / limit));
  const hasPrevPage = pagination ? pagination.hasPrevPage : page > 1;
  const hasNextPage = pagination ? pagination.hasNextPage : page < totalPages;

  const startRecord = total > 0 ? (page - 1) * limit + 1 : 0;
  const endRecord = total > 0 ? Math.min(page * limit, total) : 0;

  const paginationItems = getPaginationItems(page, totalPages);

  const handleClearSearch = () => {
    setSearchValue("");
    onSearchChange?.("");
  };

  const handleClearAllFilters = () => {
    setSearchValue("");
    onSearchChange?.("");
    onTabChange?.("all");
  };

  const isFiltered = Boolean(searchQuery.trim() || activeTab !== "all");

  return (
    <section className="w-full max-w-6xl mt-6 mb-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/80">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Your Meetings
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              {total} total
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Browse, search, and jump into your scheduled sessions and recent meetings.
          </p>
        </div>

        {/* View Mode & Refresh */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh meetings list"
            >
              <FiRefreshCw
                className={`w-3.5 h-3.5 ${
                  isFetching ? "animate-spin text-primary" : ""
                }`}
              />
              <span>{isFetching ? "Refreshing..." : "Refresh"}</span>
            </button>
          )}

          <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Grid view"
            >
              <FiGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Table view"
            >
              <FiList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-6 pb-6">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => onTabChange?.("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "all"
                ? "bg-primary text-white shadow-xs"
                : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            All ({effectiveCounts.all})
          </button>

          <button
            onClick={() => onTabChange?.("ongoing")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "ongoing"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live Now ({effectiveCounts.ongoing})
          </button>

          <button
            onClick={() => onTabChange?.("scheduled")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "scheduled"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            Scheduled ({effectiveCounts.scheduled})
          </button>

          <button
            onClick={() => onTabChange?.("completed")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "completed"
                ? "bg-gray-700 text-white shadow-xs"
                : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            Completed ({effectiveCounts.completed})
          </button>

          <button
            onClick={() => onTabChange?.("cancelled")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "cancelled"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            Cancelled ({effectiveCounts.cancelled})
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search room ID or host..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 bg-muted/40 border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
          {searchValue && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground rounded-full cursor-pointer"
              title="Clear search"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      {isError ? (
        <div className="p-8 rounded-2xl border border-destructive/20 bg-destructive/5 text-center flex flex-col items-center">
          <FiAlertCircle className="w-8 h-8 text-destructive mb-2" />
          <h4 className="text-sm font-semibold text-foreground mb-1">
            Failed to load meetings
          </h4>
          <p className="text-xs text-muted-foreground max-w-sm mb-4">
            An error occurred while communicating with the server. Please check
            your connection and try again.
          </p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              Try Again
            </button>
          )}
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: limit > 6 ? 6 : limit }).map((_, i) => (
            <div
              key={`meeting-skeleton-${i}`}
              className="rounded-xl border border-border bg-card p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-10 w-full rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-9 w-full rounded-lg pt-2" />
            </div>
          ))}
        </div>
      ) : meetings.length === 0 ? (
        <MeetingEmptyState
          isFiltered={isFiltered}
          onClearFilters={handleClearAllFilters}
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {meetings.map((meeting) => (
            <MeetingCard
              key={meeting._id || meeting.roomId}
              meeting={meeting}
              currentUserId={currentUserId}
              onJoin={onJoin}
              isJoining={isJoining}
              onCancel={onCancel}
              isCancelling={isCancelling && cancellingRoomId === meeting.roomId}
            />
          ))}
        </div>
      ) : (
        <MeetingTableView
          meetings={meetings}
          currentUserId={currentUserId}
          onJoin={onJoin}
          isJoining={isJoining}
          onCancel={onCancel}
          isCancelling={isCancelling}
          cancellingRoomId={cancellingRoomId}
        />
      )}

      {/* Pagination Controls */}
      <div className="mt-8 pt-4 border-t border-border/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            {total > 0 ? (
              <>
                Showing <span className="font-medium text-foreground">{startRecord}</span> to{" "}
                <span className="font-medium text-foreground">{endRecord}</span> of{" "}
                <span className="font-medium text-foreground">{total}</span> meetings
              </>
            ) : (
              <span>Showing 0 of 0 meetings</span>
            )}
          </div>

          {onLimitChange && (
            <div className="flex items-center gap-1.5 pl-3 border-l border-border/80">
              <span>Show</span>
              <div className="flex items-center bg-muted/40 p-0.5 rounded-lg border border-border">
                {LIMIT_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onLimitChange(opt)}
                    className={`px-2 py-0.5 text-xs rounded font-medium transition-colors cursor-pointer ${
                      limit === opt
                        ? "bg-card text-foreground font-semibold shadow-xs"
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
  </section>
);
};
