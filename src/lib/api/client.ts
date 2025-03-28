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
});

apiClient.interceptors.request.use(async (config) => {
  const token = Cookies.get("access_token");
  const csrfToken = Cookies.get("XSRF-TOKEN");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (!csrfToken) {
    await refreshCsrfToken();
  }
  return config;
});

const refreshCsrfToken = async () => {
  try {
    await axios.get(`${env.NEXT_PUBLIC_BACKEND_URL}/sanctum/csrf-cookie`, {
      withCredentials: true,
    });
  } catch (error) {
    console.error("Failed to refresh CSRF token:", error);
  }
};

export default apiClient;
