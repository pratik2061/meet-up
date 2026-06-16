import type React from "react";

export interface statsCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  change: string;
  positive: boolean;
}

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  change,
  positive,
}: statsCardProps) => {
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

      <div className="mt-4">
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
