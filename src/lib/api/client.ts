"use client";

import { env } from "@/env";
import axios from "axios";
import Cookies from "js-cookie";

const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json",
  },
  withXSRFToken: true,
  withCredentials: true,
});

let isRefreshing = false;
//TODO: Implement token expiration check when BE is set expires_in
// const isTokenExpiringSoon = () => {
//   const expiresAt = Cookies.get("token_expires_at");
//   if (!expiresAt) return true;
//   const expiryDate = new Date(expiresAt);
//   if (isNaN(expiryDate.getTime())) return true;
//   const now = new Date();
//   const timeLeft = expiryDate.getTime() - now.getTime();
//   return timeLeft <= 0 || timeLeft < 5 * 60 * 1000;
// };

const refreshCsrfToken = async () => {
  try {
    await axios.get(`${env.NEXT_PUBLIC_BACKEND_URL}/sanctum/csrf-cookie`, {
      headers: {
        Accept: "application/json",
      },
      withXSRFToken: true,
      withCredentials: true,
    });
  } catch (error) {
    console.error("Failed to refresh CSRF token:", error);
  }
};

apiClient.interceptors.request.use(async (config) => {
  const token = Cookies.get("access_token");
  const csrfToken = Cookies.get("XSRF-TOKEN");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // if (token && isTokenExpiringSoon() && !isRefreshing) {
  //   isRefreshing = true;
  //   try {
  //     const response = await apiClient.post("/api/refresh-token");
  //     Cookies.set("access_token", response.data.token, { secure: true, sameSite: "strict" });
  //     if (response.data.expires_in) {
  //       const expiresAt = new Date(Date.now() + response.data.expires_in * 1000);
  //       Cookies.set("token_expires_at", expiresAt.toISOString(), { secure: true, sameSite: "strict" });
  //     }
  //     config.headers.Authorization = `Bearer ${response.data.token}`;
  //   } catch (error) {
  //     console.error("Failed to refresh token:", error);
  //     Cookies.remove("access_token");
  //     Cookies.remove("token_expires_at");
  //     window.location.href = "/login";
  //   } finally {
  //     isRefreshing = false;
  //   }
  // }

  const methodsRequiringCsrf = ["POST", "PUT", "DELETE"];
  if (
    token &&
    config.method &&
    methodsRequiringCsrf.includes(config.method.toUpperCase()) &&
    !csrfToken
  ) {
    await refreshCsrfToken();
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      const token = Cookies.get("access_token");
      if (token) {
        try {
          const response = await apiClient.post("/api/refresh-token");
          Cookies.set("access_token", response.data.token, {
            secure: true,
            sameSite: "strict",
          });
          error.config.headers.Authorization = `Bearer ${response.data.token}`;
          return apiClient(error.config);
        } catch (refreshError) {
          console.error("Failed to refresh token:", refreshError);
          Cookies.remove("access_token");
          Cookies.remove("token_expires_at");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
