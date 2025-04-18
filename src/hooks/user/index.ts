import { userQueryKeys } from "@/constants/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import qs from "qs";

import { IPaginationResponse, IUser, IUserResponse } from "@/types/user.type";

import apiClient from "@/lib/api/client";

export const useGetUserList = (
  page: number,
  pageSize: number,
  search: string = ""
) => {
  const params = qs.stringify({ page, pageSize, search });
  return useQuery({
    queryKey: userQueryKeys.list(page, pageSize, search),
    queryFn: async (): Promise<IUserResponse> => {
      try {
        const { data } = await apiClient.get<IUserResponse>(
          `/api/users?${params}`
        );
        return data;
      } catch (error) {
        const emptyResponse: IPaginationResponse<IUser> = {
          data: [],
          total: 0,
          page: 1,
          pageSize: 10,
          totalPages: 1,
        };

        return {
          success: true,
          data: emptyResponse,
          message: "Failed to fetch users",
          type: "fetch_users_fail",
        };
      }
    },
  });
};

export const useGetUserById = (id: string) => {
  return useQuery({
    queryKey: userQueryKeys.details(id),
    queryFn: async (): Promise<IUser | null> => {
      try {
        const { data } = await apiClient.get<{ data: IUser }>(
          `/api/user/${id}`
        );
        return data.data;
      } catch {
        return null;
      }
    },
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: Partial<IUser>) => {
      try {
        const response = await apiClient.post<{ data: IUser }>(
          "/api/user",
          userData
        );
        return response.data.data;
      } catch (error) {
        throw new Error("Failed to create user");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
  });
};

export const useUpdateUser = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: Partial<IUser>) => {
      try {
        const response = await apiClient.put<{ data: IUser }>(
          `/api/user/${id}`,
          userData
        );
        return response.data.data;
      } catch (error) {
        throw new Error("Failed to update user");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.details(id) });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await apiClient.delete(`/api/user/${id}`);
        return id;
      } catch (error) {
        throw new Error("Failed to delete user");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
  });
};
