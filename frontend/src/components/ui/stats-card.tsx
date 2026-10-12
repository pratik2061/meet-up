import type React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export interface statsCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  change: string;
  positive: boolean;
  isLoading?: boolean;
}

export const StatsCardSkeleton = () => {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs transition-all">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4.5 w-28 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>

      <div className="mt-4 space-y-2.5">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-4 w-36 rounded-md" />
      </div>
    </div>
  );
};

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  change,
  positive,
  isLoading = false,
}: statsCardProps) => {
  if (isLoading) {
    return <StatsCardSkeleton />;
  }

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {title}
        </span>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
      </div>

      <div className="mt-4 min-h-[60px] flex flex-col justify-center">
        <h3 className="text-3xl font-bold">{value}</h3>

        {change && (
          <p
            className={`mt-2 text-sm font-medium ${
              positive ? "text-green-600" : "text-red-600"
            }`}
          >
            {change}
          </p>
        )}
      </div>
    </div>
  );
};
