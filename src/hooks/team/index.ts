import { teamQueryKeys } from "@/constants/query-keys";
import { ITeamForm, TeamFormSchema } from "@/validations/team.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import qs from "qs";
import { useForm } from "react-hook-form";

import {
  IErrorResponse,
  ITeam,
  ITeamMember,
  ITeamResponse,
} from "@/types/team.type";

import apiClient from "@/lib/api/client";

export const useGetTeamList = (
  page: number,
  pageSize: number,
  search: string = ""
) => {
  const params = qs.stringify({ page, pageSize, search });
  return useQuery({
    queryKey: teamQueryKeys.list(page, pageSize, search),
    queryFn: async (): Promise<ITeamResponse | IErrorResponse> => {
      try {
        const { data } = await apiClient.get<ITeamResponse>(
          `/api/team?${params}`
        );
        return data;
      } catch {
        return {
          success: false,
          message: "Lấy danh sách phòng ban không thành công",
          type: "list_team_fail",
        };
      }
    },
  });
};

export const useGetTeamById = (id: string) => {
  return useQuery({
    queryKey: teamQueryKeys.details(id),
    queryFn: async (): Promise<ITeam | IErrorResponse> => {
      try {
        const { data } = await apiClient.get<{ data: ITeam }>(
          `/api/team/${id}`
        );
        return data.data;
      } catch {
        return {
          success: false,
          message: "Lấy thông tin phòng ban không thành công",
          type: "get_team_fail",
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

          const response = await apiClient.post<{ data: ITeam }>("/api/team", {
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
        queryClient.invalidateQueries({ queryKey: teamQueryKeys.all });
      },
    }
  );

  return {
    createTeamForm,
    createTeamMutation,
    isCreatingTeam,
  };
};

