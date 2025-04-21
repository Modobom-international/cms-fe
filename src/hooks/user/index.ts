import { userQueryKeys } from "@/constants/query-keys";
import {
  ICreateUserForm,
  IUpdateUserForm,
} from "@/validations/user.validation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import qs from "qs";
import { toast } from "sonner";

import { IUser, IUserResponse } from "@/types/user.type";

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
        const { data } = await apiClient.get(`/api/users?${params}`);

        // Handle API response which may have different structure
        if (data && data.success === true) {
          // If data is already in the correct format with 'value'
          if (data.value && typeof data.value === "object") {
            return data as IUserResponse;
          }

          // If data uses 'data' property instead of 'value'
          if (data.data && typeof data.data === "object") {
            // Transform the response to match our expected structure
            return {
              success: true,
              message: data.message || "Users fetched successfully",
              value: {
                current_page: data.data.current_page || 1,
                data: data.data.data || [],
                first_page_url: data.data.first_page_url || "",
                from: data.data.from || null,
                last_page: data.data.last_page || 1,
                last_page_url: data.data.last_page_url || "",
                links: data.data.links || [],
                next_page_url: data.data.next_page_url || null,
                path: data.data.path || "",
                per_page: data.data.per_page || 10,
                prev_page_url: data.data.prev_page_url || null,
                to: data.data.to || null,
                total: data.data.total || 0,
              },
              type: data.type || "fetch_users_success",
            } as IUserResponse;
          }
        }

        // Fallback for unexpected response format
        throw new Error("Invalid response format");
      } catch (error) {
        const emptyResponse: IPaginatedResponse<IUser> = {
          current_page: 1,
          data: [],
          first_page_url: "",
          from: null,
          last_page: 1,
          last_page_url: "",
          links: [],
          next_page_url: null,
          path: "",
          per_page: 10,
          prev_page_url: null,
          to: null,
          total: 0,
        };

        return {
          success: true,
          message: "Failed to fetch users",
          value: emptyResponse,
          type: "fetch_users_fail",
        } as IUserResponse;
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
          `/api/users/${id}`
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
    mutationFn: async (userData: ICreateUserForm) => {
      try {
        const response = await apiClient.post<{ data: IUser }>(
          "/api/users",
          userData
        );
        return response.data.data;
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || "Failed to create user";
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
      toast.success("User created successfully", {
        description: `${data.name} has been added to the system`,
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to create user", {
        description: error.message,
      });
    },
  });
};

export const useUpdateUser = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: IUpdateUserForm) => {
      try {
        const response = await apiClient.put<{ data: IUser }>(
          `/api/users/update/${id}`,
          userData
        );
        return response.data.data;
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || "Failed to update user";
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.details(id) });
      toast.success("User updated successfully", {
        description: `${data.name}'s information has been updated`,
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to update user", {
        description: error.message,
      });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await apiClient.delete(`/api/users/delete/${id}`);
        return id;
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || "Failed to delete user";
        throw new Error(errorMessage);
      }
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
      toast.success("User deleted successfully", {
        description: "The user has been removed from the system",
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to delete user", {
        description: error.message,
      });
    },
  });
};

