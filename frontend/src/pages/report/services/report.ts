import { axiosInstance } from "@/util/api/axiosInstance";
import type {
  ReportActivityResponse,
  ReportDistributionResponse,
  ReportOverviewResponse,
  ReportQueryParams,
  ReportSummaryResponse,
} from "../types/report-types";

export const getReportOverview = async (
  params?: ReportQueryParams
): Promise<ReportOverviewResponse> => {
  const res = await axiosInstance.get<ReportOverviewResponse>("/report", {
    params,
  });
  return res.data;
};

export const getReportSummary = async (
  params?: ReportQueryParams
): Promise<ReportSummaryResponse> => {
  const res = await axiosInstance.get<ReportSummaryResponse>("/report/summary", {
    params,
  });
  return res.data;
};

export const getReportActivity = async (
  params?: ReportQueryParams
): Promise<ReportActivityResponse> => {
  const res = await axiosInstance.get<ReportActivityResponse>(
    "/report/activity",
    { params }
  );
  return res.data;
};

export const getReportDistribution = async (
  params?: ReportQueryParams
): Promise<ReportDistributionResponse> => {
  const res = await axiosInstance.get<ReportDistributionResponse>(
    "/report/distribution",
    { params }
  );
  return res.data;
};

export const exportReportCsv = async (
  params?: ReportQueryParams
): Promise<Blob> => {
  const res = await axiosInstance.get("/report/export", {
    params: {
      ...params,
      format: "csv",
    },
    responseType: "blob",
  });
  return res.data;
};

export const downloadReportCsvFile = async (
  params?: ReportQueryParams
): Promise<void> => {
  const blob = await exportReportCsv(params);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  const today = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.setAttribute("download", `meeting-report-${today}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
