import { teamPermissionQueryKeys, teamQueryKeys } from "@/constants/query-keys";
import { ITeamForm, TeamFormSchema } from "@/validations/team.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import qs from "qs";
import { useForm } from "react-hook-form";

import {
  Permission,
  TeamPermissionResponse,
} from "@/types/team-permission.type";
import {
  CreateTeamResponse,
  GetTeamByIdResponse,
  ITeamResponse,
} from "@/types/team.type";

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
          "/api/team/list/list-with-permission"
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
  return useQuery<GetTeamByIdResponse, Error>({
    queryKey: teamQueryKeys.details(id),
    queryFn: async () => {
      const response = await apiClient.get(`/api/team/${id}`);
      return response.data;
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

  const { mutate: createTeamMutation, isPending: isCreatingTeam } = useMutation<
    CreateTeamResponse,
    Error,
    ITeamForm
  >({
    mutationFn: async (data: ITeamForm): Promise<CreateTeamResponse> => {
      try {
        const permissionArray = Object.entries(data.permissions)
          .filter(([_, isChecked]) => isChecked)
          .map(([key]) => key);

        const response = await apiClient.post<CreateTeamResponse>(
          "/api/team/store",
          {
            name: data.name,
            permissions: permissionArray,
          }
        );

        return response.data;
      } catch (error) {
        const errRes =
          error instanceof AxiosError ? error.response?.data : null;
        return {
          success: false,
          message: errRes?.message ?? "Tạo phòng ban không thành công",
          type: errRes?.type ?? "create_team_fail",
        };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.all() });
    },
  });

  return {
    createTeamForm,
    createTeamMutation,
    isCreatingTeam,
  };
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  const { mutate: deleteTeam, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/api/team/delete?id=${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.all() });
    },
  });

  return { deleteTeam, isDeleting };
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  const { mutate: updateTeam, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ITeamForm }) => {
      const permissionArray = Object.entries(data.permissions)
        .filter(([_, isChecked]) => isChecked)
        .map(([key]) => key);

      const response = await apiClient.put(`/api/team/update?id=${id}`, {
        name: data.name,
        permissions: permissionArray,
      });

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.all() });
    },
  });

  return { updateTeam, isUpdating };
};
