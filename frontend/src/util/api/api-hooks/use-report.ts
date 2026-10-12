import { queryClient } from "@/App";
import {
  downloadReportCsvFile,
  getReportActivity,
  getReportDistribution,
  getReportOverview,
  getReportSummary,
} from "@/pages/report/services/report";
import type { ReportQueryParams } from "@/pages/report/types/report-types";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

export const useGetReportOverview = (params?: ReportQueryParams) => {
  return useQuery({
    queryKey: ["report", "overview", params?.startDate, params?.endDate, params?.scope],
    queryFn: () => getReportOverview(params),
    staleTime: 60 * 1000,
    retry: 2,
  });
};

export const useGetReportSummary = (params?: ReportQueryParams) => {
  return useQuery({
    queryKey: ["report", "summary", params?.startDate, params?.endDate, params?.scope],
    queryFn: () => getReportSummary(params),
    staleTime: 60 * 1000,
    retry: 2,
  });
};

export const useGetReportActivity = (params?: ReportQueryParams) => {
  return useQuery({
    queryKey: ["report", "activity", params?.startDate, params?.endDate, params?.scope],
    queryFn: () => getReportActivity(params),
    staleTime: 60 * 1000,
    retry: 2,
  });
};

export const useGetReportDistribution = (params?: ReportQueryParams) => {
  return useQuery({
    queryKey: ["report", "distribution", params?.startDate, params?.endDate, params?.scope],
    queryFn: () => getReportDistribution(params),
    staleTime: 60 * 1000,
    retry: 2,
  });
};

export const useExportReportCsv = () => {
  return useMutation({
    mutationFn: (params?: ReportQueryParams) => downloadReportCsvFile(params),
    onSuccess: () => {
      toast.success("Report CSV exported successfully");
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to export report");
      } else {
        toast.error("Failed to export report");
      }
    },
  });
};

export const invalidateReportQueries = () => {
  return queryClient.invalidateQueries({
    queryKey: ["report"],
  });
};
