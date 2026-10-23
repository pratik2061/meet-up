import { axiosInstance } from "@/util/api/axiosInstance";
import type {
  FriendItem,
  FriendRequestsData,
  SearchFriendUser,
} from "../types/friends.types";

export const getFriends = async (): Promise<FriendItem[]> => {
  const response = await axiosInstance.get<{
    status: boolean;
    message: string;
    data: FriendItem[];
    total: number;
  }>("/friends");
  return response.data.data;
};

export const getFriendRequests = async (): Promise<FriendRequestsData> => {
  const response = await axiosInstance.get<{
    status: boolean;
    message: string;
    data: FriendRequestsData;
  }>("/friends/requests");
  return response.data.data;
};

export const searchUsers = async (query: string): Promise<SearchFriendUser[]> => {
  const response = await axiosInstance.get<{
    status: boolean;
    message: string;
    data: SearchFriendUser[];
  }>("/friends/search", {
    params: { q: query },
  });
  return response.data.data;
};

export const sendFriendRequest = async (payload: {
  email?: string;
  recipientId?: string;
}) => {
  const response = await axiosInstance.post<{
    status: boolean;
    message: string;
    data: any;
  }>("/friends/request", payload);
  return response.data;
};

export const respondToFriendRequest = async (
  requestId: string,
  status: "ACCEPTED" | "REJECTED"
) => {
  const response = await axiosInstance.patch<{
    status: boolean;
    message: string;
    data: any;
  }>(`/friends/request/${requestId}`, { status });
  return response.data;
};

export const removeFriend = async (targetId: string) => {
  const response = await axiosInstance.delete<{
    status: boolean;
    message: string;
  }>(`/friends/${targetId}`);
  return response.data;
};
