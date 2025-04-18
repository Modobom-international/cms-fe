"use client";

import { env } from "@/env";
import axios from "axios";
import Cookies from "js-cookie";
import { updateEchoAuthToken } from "@/lib/echo";

const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json",
  },
  withXSRFToken: true,
  withCredentials: true,
});

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

          updateEchoAuthToken(response.data.token);

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
