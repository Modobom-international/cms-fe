import { teamQueryKeys, teamPermissionQueryKeys } from "@/constants/query-keys";
import { ITeamForm, TeamFormSchema } from "@/validations/team.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import qs from "qs";
import { useForm } from "react-hook-form";

import { ITeam, ITeamResponse } from "@/types/team.type";
import { TeamPermissionResponse, Permission } from "@/types/team-permission.type";

import apiClient from "@/lib/api/client";
import { extractApiError } from "@/lib/api/error-handler";

export const useGetTeamList = (
  page: number,
  pageSize: number,
  search: string = ""
) => {
  const params = qs.stringify({ page, pageSize, search });
  return useQuery({
    queryKey: teamQueryKeys.list(page, pageSize, search),
    queryFn: async (): Promise<ITeamResponse | IBackendErrorRes> => {
      try {
        const { data } = await apiClient.get<ITeamResponse>(
          `/api/team?${params}`
        );
        return data;
      } catch (error) {
        const errRes = extractApiError(error);
        return {
          success: false,
          message: "Lấy danh sách phòng ban không thành công",
          type: "list_team_fail",
          error: errRes.error,
        };
      }
    },
  });
};

export const useGetTeamPermissionList = () => {
  return useQuery({
    queryKey: teamPermissionQueryKeys.list(),
    queryFn: async (): Promise<TeamPermissionResponse> => {
      try {
        const { data } = await apiClient.get<TeamPermissionResponse>(
          "/api/team/list-with-permission"
        );
        return data;
      } catch (error) {
        const errRes =
          error instanceof AxiosError
            ? (error.response?.data as IBackendErrorRes)
            : null;

        return {
          success: false,
          data: { teams: [], permissions: [] },
          message: errRes?.message ?? "Failed to fetch teams and permissions",
          type: errRes?.type ?? "list_team_no_filter_fail",
          error: errRes?.error ?? "Unknown error",
        };
      }
    },
    select: (data) => {
      if (!data.success) {
        return {
          ...data,
          transformedPermissions: {} as Permission,
        };
      }

      const transformedPermissions = data.data.permissions.reduce(
        (acc, perm) => {
          const section = perm.prefix;
          acc[section] = acc[section] || [];
          acc[section].push({
            id: perm.id,
            name: perm.name,
            prefix: perm.prefix,
          });
          return acc;
        },
        {} as Permission
      );

      return {
        ...data,
        transformedPermissions,
      };
    },
  });
};

export const useGetTeamById = (id: string) => {
  return useQuery({
    queryKey: teamQueryKeys.details(id),
    queryFn: async (): Promise<ITeam | IBackendErrorRes> => {
      try {
        const { data } = await apiClient.get<{ data: ITeam }>(
          `/api/team/${id}`
        );
        return data.data;
      } catch (error) {
        const errRes = extractApiError(error);
        return {
          success: false,
          message: "Lấy thông tin phòng ban không thành công",
          type: "get_team_fail",
          error: errRes.error,
        };
      }
    },
    enabled: !!id,
  });
};

export const useCreateTeam = () => {
  const createTeamForm = useForm<ITeamForm>({
    resolver: zodResolver(TeamFormSchema),
    defaultValues: {
      name: "",
      permissions: {},
    },
  });

  const queryClient = useQueryClient();

  const { mutate: createTeamMutation, isPending: isCreatingTeam } = useMutation(
    {
      mutationFn: async (data: ITeamForm) => {
        try {
          const permissionArray = Object.entries(data.permissions)
            .filter(([_, isChecked]) => isChecked)
            .map(([key]) => key);

          const response = await apiClient.post<{ data: ITeam }>("/api/team/store", {
            name: data.name,
            permissions: permissionArray,
          });

          return response.data.data;
        } catch (error) {
          return {
            success: false,
            message: "Tạo phòng ban không thành công",
            type: "create_team_fail",
          };
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: teamQueryKeys.all() });
      },
    }
  );

  return {
    createTeamForm,
    createTeamMutation,
    isCreatingTeam,
  };
};