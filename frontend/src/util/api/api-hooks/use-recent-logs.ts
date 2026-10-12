import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/App";
import { getRecentLogs } from "@/pages/dashboard/services/recent-log";
import type { RecentLogsQuery } from "@/pages/dashboard/types/recent-log-types";

export const useGetRecentLogs = (params?: RecentLogsQuery) => {
  return useQuery({
    queryKey: ["recent-logs", params],
    queryFn: () => getRecentLogs(params),
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    staleTime: 0,
    retry: 2,
  });
};

export const invalidateRecentLogs = () => {
  return queryClient.invalidateQueries({
    queryKey: ["recent-logs"],
  });
};
