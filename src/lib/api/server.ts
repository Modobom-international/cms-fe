"use server";

import { cookies } from "next/headers";

import { env } from "@/env";

// Function to get the required authentication cookies
const getAuthCookies = async () => {
  const cookieStore = await cookies();
  const xsrfToken = cookieStore.get("XSRF-TOKEN")?.value;
  const accessToken = cookieStore.get("access_token")?.value;

  return { xsrfToken, accessToken };
};

// Base API configuration
const baseConfig = {
  baseURL: env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json",
    "Content-Type": "application/json",
  },
};

/**
 * Server-side API client using native fetch
 */
export const apiServer = {
  /**
   * Make a GET request
   */
  async get<T = any>(url: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>("GET", url, undefined, options);
  },

  /**
   * Make a POST request
   */
  async post<T = any>(
    url: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>("POST", url, data, options);
  },

  /**
   * Make a PUT request
   */
  async put<T = any>(
    url: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>("PUT", url, data, options);
  },

  /**
   * Make a PATCH request
   */
  async patch<T = any>(
    url: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>("PATCH", url, data, options);
  },

  /**
   * Make a DELETE request
   */
  async delete<T = any>(url: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>("DELETE", url, undefined, options);
  },

  /**
   * Core request method with authentication
   */
  async request<T = any>(
    method: string,
    url: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<T> {
    // Get authentication cookies
    const { xsrfToken, accessToken } = await getAuthCookies();

    // Prepare headers with auth tokens
    const headers = new Headers({
      ...baseConfig.headers,
      ...(options.headers || {}),
    });

    // Add authentication headers if available
    if (xsrfToken) {
      headers.set("X-XSRF-TOKEN", xsrfToken);
    }

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    // Build full URL
    const fullUrl = new URL(
      url.startsWith("/") ? url.substring(1) : url,
      baseConfig.baseURL
    );

    // Prepare fetch options
    const fetchOptions: RequestInit = {
      ...options,
      method,
      headers,
      body: data !== undefined ? JSON.stringify(data) : undefined,
    };

    // Make the request
    const response = await fetch(fullUrl.toString(), fetchOptions);

    // Handle response
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    // Return JSON response or empty object if no content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  },
};
