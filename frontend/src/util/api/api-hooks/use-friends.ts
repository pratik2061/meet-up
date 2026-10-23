import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/App";
import axios from "axios";
import toast from "react-hot-toast";
import {
  getFriends,
  getFriendRequests,
  searchUsers,
  sendFriendRequest,
  respondToFriendRequest,
  removeFriend,
} from "@/pages/friends/services/friends.service";

export const useGetFriends = () => {
  return useQuery({
    queryKey: ["friends"],
    queryFn: getFriends,
    staleTime: 1000 * 30,
  });
};

export const useGetFriendRequests = () => {
  return useQuery({
    queryKey: ["friend-requests"],
    queryFn: getFriendRequests,
    staleTime: 1000 * 20,
  });
};

export const useSearchUsers = (query: string, enabled = true) => {
  return useQuery({
    queryKey: ["search-users", query],
    queryFn: () => searchUsers(query),
    enabled,
    staleTime: 1000 * 10,
  });
};

export const useSendFriendRequest = () => {
  return useMutation({
    mutationFn: (payload: { email?: string; recipientId?: string }) =>
      sendFriendRequest(payload),
    onSuccess: (data) => {
      toast.success(data.message || "Friend request sent!");
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
      queryClient.invalidateQueries({ queryKey: ["search-users"] });
      queryClient.invalidateQueries({ queryKey: ["recent-logs"] });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to send friend request");
      } else {
        toast.error("An error occurred");
      }
    },
  });
};

export const useRespondFriendRequest = () => {
  return useMutation({
    mutationFn: ({
      requestId,
      status,
    }: {
      requestId: string;
      status: "ACCEPTED" | "REJECTED";
    }) => respondToFriendRequest(requestId, status),
    onSuccess: (data) => {
      toast.success(data.message || "Request updated!");
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
      queryClient.invalidateQueries({ queryKey: ["search-users"] });
      queryClient.invalidateQueries({ queryKey: ["recent-logs"] });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to respond to request");
      } else {
        toast.error("An error occurred");
      }
    },
  });
};

export const useRemoveFriend = () => {
  return useMutation({
    mutationFn: (targetId: string) => removeFriend(targetId),
    onSuccess: (data) => {
      toast.success(data.message || "Friend removed");
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
      queryClient.invalidateQueries({ queryKey: ["search-users"] });
      queryClient.invalidateQueries({ queryKey: ["recent-logs"] });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to remove friend");
      } else {
        toast.error("An error occurred");
      }
    },
  });
};
