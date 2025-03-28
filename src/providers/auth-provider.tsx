// "use client";

// import React, { useContext } from "react";

// import { useRouter } from "next/navigation";

// import { errorMessage } from "@/constant/error-message";
// import { authQueryKeys } from "@/constant/react-query";
// import { UserRoleEnum } from "@/enums/user-role";
// import { ILoginForm, LoginFormSchema } from "@/validations/auth.validation";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { AxiosError } from "axios";
// import Cookies from "js-cookie";
// import { useForm, UseFormReturn } from "react-hook-form";
// import { toast } from "sonner";

// import { ILoginRes } from "@/types/auth.type";
// import { IUser } from "@/types/user.type";

// import apiClient from "@/lib/api/client";

// import LogoutDialog from "@/components/dialogs/logout-dialog";

// type AuthProviderProps = {
//   children: React.ReactNode;
// };

// type AuthContextType = {
//   user: IUser | null;
//   isLoadingUser: boolean;
//   logout: () => void;
//   isLoggingOut: boolean;
//   login: (data: ILoginForm, callbackUrl?: string | null) => void;
//   isLoggingIn: boolean;
//   loginForm: UseFormReturn<ILoginForm>;
// };

// export const AuthContext = React.createContext<AuthContextType | null>(null);

// export default function AuthProvider({ children }: AuthProviderProps) {
//   const queryClient = useQueryClient();
//   const router = useRouter();

//   const { data: userData, isLoading: isLoadingUser } = useQuery({
//     queryKey: authQueryKeys.me(),
//     queryFn: async () => {
//       try {
//         const { data } = await apiClient.get<IBackendRes<IUser>>(
//           "/api/affiliate-network/users/me"
//         );
//         return data.value;
//       } catch {
//         return null;
//       }
//     },

//     enabled: !!Cookies.get("access_token"),
//   });

//   const { mutateAsync: logout, isPending: isLoggingOut } = useMutation({
//     mutationKey: authQueryKeys.logout(),
//     mutationFn: async () => {
//       try {
//         const data = await apiClient.post<IBackendRes<void>>("/auth/logout");
//         return data;
//       } catch (error) {
//         const errRes =
//           error instanceof AxiosError
//             ? (error.response?.data as IBackendErrorRes)
//             : null;
//         return {
//           success: false,
//           message: errRes?.message ?? errorMessage.unknown,
//         };
//       }
//     },
//     onSuccess: () => {
//       queryClient.clear();
//       Cookies.remove("access_token");
//       router.push("/auth/login");
//     },
//   });

//   const loginForm = useForm<ILoginForm>({
//     resolver: zodResolver(LoginFormSchema),
//     defaultValues: {
//       email: "",
//       password: "",
//     },
//   });

//   const { mutateAsync: loginMutation, isPending: isLoggingIn } = useMutation({
//     mutationKey: authQueryKeys.login(),
//     mutationFn: async (
//       formData: ILoginForm
//     ): Promise<ILoginRes | IBackendErrorRes> => {
//       try {
//         const { data } = await apiClient.post<ILoginRes>(
//           "/api/affiliate-network/users/login",
//           formData
//         );
//         return data;
//       } catch (error) {
//         const errRes =
//           error instanceof AxiosError
//             ? (error.response?.data as IBackendErrorRes)
//             : null;

//         return {
//           isSuccess: false,
//           message: errRes?.message ?? errorMessage.unknown,
//           statusCode: errRes?.statusCode ?? 500,
//           details: errRes?.details ?? errorMessage.unknown,
//         };
//       }
//     },
//     onSuccess: async (res) => {
//       if (res.isSuccess === true) {
//         const { accessToken } = res.value;
//         await Cookies.set("access_token", accessToken);

//         queryClient.setQueryData(["me"], res.value);

//         loginForm.reset();

//         toast.success("Login successful");
//       } else {
//         toast.error(res.details);
//       }
//     },
//   });

//   // Custom login function that handles redirection with callbackUrl
//   const login = async (formData: ILoginForm, callbackUrl?: string | null) => {
//     const res = await loginMutation(formData);

//     if (res.isSuccess === true) {
//       if (callbackUrl) {
//         router.push(callbackUrl);
//       } else {
//         const { role } = res.value;
//         if (role === UserRoleEnum.ADMIN) {
//           router.push("/admin");
//         }
//       }
//     }
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user: userData ?? null,
//         isLoadingUser,
//         logout,
//         isLoggingOut,
//         login,
//         isLoggingIn,
//         loginForm,
//       }}
//     >
//       {children}
//       <LogoutDialog isOpen={isLoggingOut} />
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = (): AuthContextType => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };
