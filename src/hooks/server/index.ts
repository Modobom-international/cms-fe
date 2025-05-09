import { serverQueryKeys } from "@/constants/query-keys";
import {
  CreateServerSchema,
  ICreateServerForm,
  IUpdateServerForm,
  UpdateServerSchema,
} from "@/validations/server.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import qs from "qs";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  ICreateServerResponse,
  IGetServerListResponse,
} from "@/types/server.type";

import apiClient from "@/lib/api/client";
import { extractApiError } from "@/lib/api/error-handler";

export const useGetServerList = (
  page: number,
  pageSize: number,
  search: string
) => {
  const queryString = qs.stringify({ page, pageSize, search });
  return useQuery({
    queryKey: serverQueryKeys.list(1, 10, search),
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<IGetServerListResponse>(
          `/api/server?${queryString}`
        );
        return data;
      } catch (error) {
        const errRes = extractApiError(error);
        throw new Error(errRes.type);
      }
    },
  });
};

export const useCreateServer = () => {
  const queryClient = useQueryClient();
  const t = useTranslations("ServerPage");
  const createServerForm = useForm<ICreateServerForm>({
    resolver: zodResolver(CreateServerSchema(t)),
    defaultValues: {
      name: "",
      ip: "",
    },
  });

  const { mutateAsync: createServerMutation, isPending: isCreating } =
    useMutation({
      mutationKey: serverQueryKeys.create(),
      mutationFn: async (formData: ICreateServerForm) => {
        try {
          const { data } = await apiClient.post<ICreateServerResponse>(
            "/api/server/store",
            formData
          );
          return data;
        } catch (error) {
          const errRes = extractApiError(error);
          return {
            success: false,
            ...errRes,
          };
        }
      },
      onSuccess: (resData) => {
        if (resData.success === true) {
          toast.success("Add server successfully");
          queryClient.invalidateQueries({
            queryKey: serverQueryKeys.list(1, 10),
          });
          createServerForm.reset();
        } else {
          toast.error("Add server failed");
        }
      },
    });

  return { createServerForm, createServerMutation, isCreating };
};

export const useUpdateServer = (id: string) => {
  const t = useTranslations("ServerPage");
  const queryClient = useQueryClient();
  const updateServerForm = useForm<IUpdateServerForm>({
    resolver: zodResolver(UpdateServerSchema(t)),
    defaultValues: {
      name: "",
      ip: "",
    },
  });

  const { mutateAsync: updateServerMutation, isPending: isUpdating } =
    useMutation({
      mutationKey: serverQueryKeys.update(id),
      mutationFn: async (formData: IUpdateServerForm) => {
        try {
          const { data } = await apiClient.post(
            `/api/server/update/${id}`,
            formData
          );
          return data;
        } catch (error) {
          const errRes = extractApiError(error);
          return {
            success: false,
            ...errRes,
          };
        }
      },
      onSuccess: (resData) => {
        if (resData.success === true) {
          toast.success("Update server successfully");
          queryClient.invalidateQueries({
            queryKey: serverQueryKeys.list(1, 10),
          });
          updateServerForm.reset();
        } else {
          toast.error("Update server failed");
        }
      },
    });

  return { updateServerForm, updateServerMutation, isUpdating };
};

export const useDeleteServer = (id: string) => {
  const queryClient = useQueryClient();
  const { mutateAsync: deleteServerMutation, isPending: isDeleting } =
    useMutation({
      mutationKey: serverQueryKeys.delete(id),
      mutationFn: async (serverId: string) => {
        try {
          const { data } = await apiClient.delete(
            `/api/server/delete/${serverId}`
          );
          return data;
        } catch (error) {
          const errRes = extractApiError(error);
          return {
            success: false,
            ...errRes,
          };
        }
      },
      onSuccess: (resData) => {
        if (resData.success === true) {
          toast.success("Delete server successfully");
          queryClient.invalidateQueries({
            queryKey: serverQueryKeys.list(1, 10),
          });
        } else {
          toast.error("Delete server failed");
        }
      },
    });

  return { deleteServerMutation, isDeleting };
};
