"use client";

import React, { useContext } from "react";

import { useRouter } from "next/navigation";

import { errorMessage } from "@/constants/error-message";
import { authQueryKeys } from "@/constants/query-keys";
import { UserRoleEnum } from "@/enums/user-role";
import { ILoginForm, LoginFormSchema } from "@/validations/auth.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Cookies from "js-cookie";
import { useTranslations } from "next-intl";
import { useForm, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

import { ILoginErrorRes, ILoginRes } from "@/types/auth.type";
import { IUser } from "@/types/user.type";

import apiClient from "@/lib/api/client";

import LogoutDialog from "@/components/dialogs/logout-dialog";

type AuthProviderProps = {
  children: React.ReactNode;
};

type AuthContextType = {
  user: IUser | null;
  isLoadingUser: boolean;
  logout: () => void;
  isLoggingOut: boolean;
  login: (data: ILoginForm, callbackUrl?: string | null) => void;
  isLoggingIn: boolean;
  loginForm: UseFormReturn<ILoginForm>;
};

export const AuthContext = React.createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const t = useTranslations("LoginPage");

  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: authQueryKeys.me(),
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<IBackendRes<IUser>>(
          "/api/affiliate-network/users/me"
        );
        return data.value;
      } catch {
        return null;
      }
    },

    enabled: !!Cookies.get("access_token"),
  });

  const { mutateAsync: logout, isPending: isLoggingOut } = useMutation({
    mutationKey: authQueryKeys.logout(),
    mutationFn: async () => {
      try {
        const data = await apiClient.post<IBackendRes<void>>("/auth/logout");
        return data;
      } catch (error) {
        const errRes =
          error instanceof AxiosError
            ? (error.response?.data as IBackendErrorRes)
            : null;
        return {
          success: false,
          message: errRes?.message ?? errorMessage.unknown,
        };
      }
    },
    onSuccess: () => {
      queryClient.clear();
      Cookies.remove("access_token");
      router.push("/auth/login");
    },
  });

  const loginForm = useForm<ILoginForm>({
    resolver: zodResolver(LoginFormSchema(t)),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutateAsync: loginMutation, isPending: isLoggingIn } = useMutation({
    mutationKey: authQueryKeys.login(),
    mutationFn: async (
      formData: ILoginForm
    ): Promise<ILoginRes | ILoginErrorRes> => {
      try {
        const { data } = await apiClient.post<ILoginRes>(
          "/api/login",
          formData
        );
        return data;
      } catch (error) {
        const errRes = (error as AxiosError<ILoginErrorRes>)?.response?.data;

        return {
          success: false,
          message: errRes?.message ?? errorMessage.unknown,
          type: errRes?.type ?? "unknown",
        };
      }
    },
    onSuccess: async (res) => {
      if (res.success === true) {
        const { data, token } = res;
        await Cookies.set("access_token", token);

        queryClient.setQueryData(authQueryKeys.me(), data);

        loginForm.reset();

        toast.success("Success", {
          description: "Login  ",
        });
      } else {
        toast.error("Failed", {
          description: res.message,
        });
      }
    },
  });

  // Custom login function that handles redirection with callbackUrl
  const login = async (formData: ILoginForm, callbackUrl?: string | null) => {
    const res = await loginMutation(formData);

    if (res.success === true) {
      if (callbackUrl) {
        router.push(callbackUrl);
      } else {
        const { role } = res.data;
        if (role === UserRoleEnum.ADMIN) {
          router.push("/admin");
        }
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: userData ?? null,
        isLoadingUser,
        logout,
        isLoggingOut,
        login,
        isLoggingIn,
        loginForm,
      }}
    >
      {children}
      <LogoutDialog isOpen={isLoggingOut} />
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
