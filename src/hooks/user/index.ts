import { userQueryKeys } from "@/constants/query-keys";
import {
  ICreateUserForm,
  IUpdateUserForm,
} from "@/validations/user.validation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import qs from "qs";
import { toast } from "sonner";

import {
  ICreateUserResponse,
  IGetAllUserResponse,
  IUpdateUserResponse,
  IUser,
} from "@/types/user.type";

import apiClient from "@/lib/api/client";

export const useGetUserList = (
  page: number,
  pageSize: number,
  search: string = ""
) => {
  const params = qs.stringify({ page, pageSize, search });
  return useQuery({
    queryKey: userQueryKeys.list(page, pageSize, search),
    queryFn: async (): Promise<IGetAllUserResponse> => {
      try {
        const { data } = await apiClient.get<IGetAllUserResponse>(
          `/api/users?${params}`
        );

        return data;
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
        } as IGetAllUserResponse;
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
    mutationFn: async (
      userData: ICreateUserForm
    ): Promise<ICreateUserResponse | IBackendErrorRes> => {
      try {
        const { data } = await apiClient.post<ICreateUserResponse>(
          "/api/users",
          userData
        );
        return data;
      } catch (error) {
        const errRes =
          error instanceof AxiosError
            ? (error.response?.data as IBackendErrorRes)
            : null;

        return {
          success: false,
          message: errRes?.message ?? "Failed to create user",
          type: errRes?.type ?? "create_user_fail",
        };
      }
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
        toast.success("User created successfully", {
          description: `${data.data.name} has been added to the system`,
        });
      } else {
        toast.error("Failed to create user", {
          description: data.message,
        });
      }
    },
  });
};

export const useUpdateUser = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      userData: IUpdateUserForm
    ): Promise<IUpdateUserResponse | IBackendErrorRes> => {
      try {
        const { data } = await apiClient.put<IUpdateUserResponse>(
          `/api/users/update/${id}`,
          userData
        );
        return data;
      } catch (error) {
        const errRes =
          error instanceof AxiosError
            ? (error.response?.data as IBackendErrorRes)
            : null;

        return {
          success: false,
          message: errRes?.message ?? "Failed to update user",
          type: errRes?.type ?? "update_user_fail",
        };
      }
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
        queryClient.invalidateQueries({ queryKey: userQueryKeys.details(id) });
        toast.success("User updated successfully", {
          description: `${data.data.name}'s information has been updated`,
        });
      } else {
        toast.error("Failed to update user", {
          description: data.message,
        });
      }
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      id: string
    ): Promise<{
      success: boolean;
      message: string;
      id?: string;
      type?: string;
    }> => {
      try {
        const { data } = await apiClient.delete(`/api/users/delete/${id}`);
        return {
          success: true,
          message: "User deleted successfully",
          id,
        };
      } catch (error) {
        const errRes =
          error instanceof AxiosError
            ? (error.response?.data as IBackendErrorRes)
            : null;

        return {
          success: false,
          message: errRes?.message ?? "Failed to delete user",
          type: errRes?.type ?? "delete_user_fail",
        };
      }
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
        toast.success("User deleted successfully", {
          description: "The user has been removed from the system",
        });
      } else {
        toast.error("Failed to delete user", {
          description: data.message,
        });
      }
    },
  });
};

