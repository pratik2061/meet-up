import React from "react";
import { FiSearch, FiCalendar, FiPlus } from "react-icons/fi";
import { Link } from "react-router-dom";

interface MeetingEmptyStateProps {
  isFiltered?: boolean;
  onClearFilters?: () => void;
}

export const MeetingEmptyState: React.FC<MeetingEmptyStateProps> = ({
  isFiltered = false,
  onClearFilters,
}) => {
  if (isFiltered) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border bg-card/50">
        <div className="size-14 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-4">
          <FiSearch className="size-6" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">
          No matching meetings found
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-5">
          We couldn't find any meetings that match your search query or selected
          filter.
        </p>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="px-4 py-2 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border bg-linear-to-b from-card to-muted/20">
      <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 ring-8 ring-primary/5">
        <FiCalendar className="size-7" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">
        No meetings scheduled yet
      </h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        When you create, schedule, or join meetings, they will appear here so you
        can easily track and re-join them at any time.
      </p>
      <Link
        to="/meeting/new"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
      >
        <FiPlus className="w-4 h-4" />
        <span>Create Instant Meeting</span>
      </Link>
    </div>
  );
};
