import { axiosInstance } from "@/util/api/axiosInstance";
import type { RecentLogsQuery, RecentLogsResponse } from "../types/recent-log-types";

export const getRecentLogs = async (
  params?: RecentLogsQuery
): Promise<RecentLogsResponse> => {
  const res = await axiosInstance.get<RecentLogsResponse>("/recent-log", {
    params,
  });
  return res.data;
};
