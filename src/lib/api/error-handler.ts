"use client";

import { errorMessage } from "@/constants/error-message";
import { AxiosError } from "axios";

/**
 * Extracts error details from an API error
 * @param error The error object from the API call
 * @returns An object containing the error message, status code, and details
 */
export function extractApiError(error: unknown) {
  if (error instanceof AxiosError) {
    const errRes = error.response?.data as IBackendErrorRes;

    return {
      message: errRes?.message ?? errorMessage.unknown,
      type: errRes?.type ?? "unknown",
      error: errRes.error,
    };
  }

  return {
    message: errorMessage.unknown,
    type: "unknown",
    error: errorMessage.unknown,
  };
}
