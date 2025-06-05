import { attendanceQueryKeys } from "@/constants/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import qs from "qs";
import { toast } from "sonner";

import {
  IAttendanceComplaint,
  IAttendanceError,
  IAttendanceRecord,
  IAttendanceReportParams,
  IAttendanceReportRecord,
  ICheckInRequest,
  ICheckInResponse,
  ICheckOutRequest,
  ICheckOutResponse,
  IComplaintsParams,
  IComplaintStatistics,
  ICreateComplaintRequest,
  ICustomAttendanceRequest,
  ICustomAttendanceResponse,
  IPaginatedResponse,
  ITodayAttendanceResponse,
  IUpdateComplaintStatusRequest,
} from "@/types/attendance.type";

import apiClient from "@/lib/api/client";
import { formatTimeForDisplay } from "@/lib/utils";

// ============================================================================
// EMPLOYEE ATTENDANCE HOOKS
// ============================================================================

/**
 * Hook for employee check-in
 */
export const useCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ICheckInRequest): Promise<ICheckInResponse> => {
      const { data: response } = await apiClient.post<ICheckInResponse>(
        "/api/attendance/checkin",
        data
      );
      return response;
    },
    onSuccess: (data, variables) => {
      // Invalidate today's attendance query
      queryClient.invalidateQueries({
        queryKey: attendanceQueryKeys.today(variables.employee_id),
      });

      // Show appropriate notification
      if (data.remote_work_info) {
        toast.success("Checked in for remote work", {
          description: `Location: ${data.remote_work_info.location}`,
        });
      } else if (data.leave_info) {
        toast.info("You are on approved leave today", {
          description: data.message,
        });
      } else {
        toast.success("Check-in successful", {
          description: `Time: ${formatTimeForDisplay(data.data.checkin_time!)}`,
        });
      }
    },
    onError: (error: AxiosError<IAttendanceError>) => {
      const message = error.response?.data?.message || "Check-in failed";
      toast.error("Check-in failed", {
        description: message,
      });
    },
  });
};

/**
 * Hook for employee check-out
 */
export const useCheckOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ICheckOutRequest): Promise<ICheckOutResponse> => {
      const { data: response } = await apiClient.post<ICheckOutResponse>(
        "/api/attendance/checkout",
        data
      );
      return response;
    },
    onSuccess: (data, variables) => {
      // Invalidate today's attendance query
      queryClient.invalidateQueries({
        queryKey: attendanceQueryKeys.today(variables.employee_id),
      });

      toast.success("Check-out successful", {
        description: `Total hours: ${data.data.total_work_hours || 0} hours`,
      });
    },
    onError: (error: AxiosError<IAttendanceError>) => {
      const message = error.response?.data?.message || "Check-out failed";
      toast.error("Check-out failed", {
        description: message,
      });
    },
  });
};

/**
 * Hook to get today's attendance for an employee
 */
export const useTodayAttendance = (employeeId: number) => {
  return useQuery({
    queryKey: attendanceQueryKeys.today(employeeId),
    queryFn: async (): Promise<ITodayAttendanceResponse> => {
      try {
        const { data } = await apiClient.get<ITodayAttendanceResponse>(
          `/api/attendance/${employeeId}/today`
        );
        return data;
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 404) {
          return {};
        }
        throw error;
      }
    },
    enabled: !!employeeId,
    refetchInterval: 60000, // Refetch every minute
  });
};

/**
 * Hook to get attendance record by date for an employee
 */
export const useAttendanceByDate = (employeeId: number, date: string) => {
  return useQuery({
    queryKey: [...attendanceQueryKeys.origin, "by-date", employeeId, date],
    queryFn: async (): Promise<ITodayAttendanceResponse> => {
      try {
        const { data } = await apiClient.get<ITodayAttendanceResponse>(
          `/api/attendance/${employeeId}/by-date/${date}`
        );
        return data;
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 404) {
          return {};
        }
        throw error;
      }
    },
    enabled: !!employeeId && !!date,
  });
};

// ============================================================================
// ADMIN ATTENDANCE HOOKS
// ============================================================================

/**
 * Hook to get attendance report (Admin)
 */
export const useAttendanceReport = (params: IAttendanceReportParams) => {
  const queryString = qs.stringify(params);

  return useQuery({
    queryKey: attendanceQueryKeys.report(params.date, params),
    queryFn: async (): Promise<IAttendanceReportRecord[]> => {
      const { data } = await apiClient.get<IAttendanceReportRecord[]>(
        `/api/admin/attendances?${queryString}`
      );
      return data;
    },
    enabled: !!params.date,
  });
};

/**
 * Hook to create custom attendance (Admin)
 */
export const useCreateCustomAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: ICustomAttendanceRequest
    ): Promise<ICustomAttendanceResponse> => {
      const { data: response } =
        await apiClient.post<ICustomAttendanceResponse>(
          "/api/admin/attendances/custom",
          data
        );
      return response;
    },
    onSuccess: (data) => {
      // Invalidate attendance reports
      queryClient.invalidateQueries({
        queryKey: attendanceQueryKeys.origin,
      });

      if (data.warning) {
        toast.warning("Custom attendance added with warning", {
          description: data.warning,
        });
      } else {
        toast.success("Custom attendance added successfully", {
          description: data.message,
        });
      }
    },
    onError: (error: AxiosError<IAttendanceError>) => {
      const message =
        error.response?.data?.message || "Failed to add custom attendance";
      toast.error("Failed to add attendance", {
        description: message,
      });
    },
  });
};

/**
 * Hook to update custom attendance (Admin)
 */
export const useUpdateCustomAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<ICustomAttendanceRequest>;
    }): Promise<ICustomAttendanceResponse> => {
      const { data: response } = await apiClient.put<ICustomAttendanceResponse>(
        `/api/admin/attendances/custom/${id}`,
        data
      );
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: attendanceQueryKeys.origin,
      });

      toast.success("Attendance updated successfully", {
        description: data.message,
      });
    },
    onError: (error: AxiosError<IAttendanceError>) => {
      const message =
        error.response?.data?.message || "Failed to update attendance";
      toast.error("Failed to update attendance", {
        description: message,
      });
    },
  });
};

// ============================================================================
// ATTENDANCE COMPLAINTS HOOKS
// ============================================================================

/**
 * Hook to get attendance complaints
 */
export const useAttendanceComplaints = (params?: IComplaintsParams) => {
  const queryString = qs.stringify(params || {});

  return useQuery({
    queryKey: attendanceQueryKeys.complaints(params),
    queryFn: async (): Promise<IPaginatedResponse<IAttendanceComplaint>> => {
      const { data } = await apiClient.get<
        IPaginatedResponse<IAttendanceComplaint>
      >(`/api/attendance-complaints?${queryString}`);
      return data;
    },
  });
};

/**
 * Hook to get admin attendance complaints (Admin)
 */
export const useAdminAttendanceComplaints = (params?: IComplaintsParams) => {
  const queryString = qs.stringify(params || {});

  return useQuery({
    queryKey: attendanceQueryKeys.complaints(params),
    queryFn: async (): Promise<IPaginatedResponse<IAttendanceComplaint>> => {
      const { data } = await apiClient.get<
        IPaginatedResponse<IAttendanceComplaint>
      >(`/api/admin/attendance-complaints?${queryString}`);
      return data;
    },
  });
};

/**
 * Hook to get specific complaint details
 */
export const useComplaintDetails = (id: number, isAdmin = false) => {
  return useQuery({
    queryKey: attendanceQueryKeys.complaintDetails(id),
    queryFn: async (): Promise<IAttendanceComplaint> => {
      const endpoint = isAdmin
        ? `/api/admin/attendance-complaints/${id}`
        : `/api/attendance-complaints/${id}`;
      const { data } = await apiClient.get<{ data: IAttendanceComplaint }>(
        endpoint
      );
      return data.data;
    },
    enabled: !!id,
  });
};

/**
 * Hook to create attendance complaint
 */
export const useCreateComplaint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: ICreateComplaintRequest
    ): Promise<IAttendanceComplaint> => {
      const { data: response } = await apiClient.post<{
        data: IAttendanceComplaint;
      }>("/api/attendance-complaints", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: attendanceQueryKeys.complaints(),
      });

      toast.success("Complaint submitted successfully", {
        description: "Your complaint has been submitted for review",
      });
    },
    onError: (error: AxiosError<IAttendanceError>) => {
      const message =
        error.response?.data?.message || "Failed to submit complaint";
      toast.error("Failed to submit complaint", {
        description: message,
      });
    },
  });
};

/**
 * Hook to update complaint
 */
export const useUpdateComplaint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<ICreateComplaintRequest>;
    }): Promise<IAttendanceComplaint> => {
      const { data: response } = await apiClient.put<{
        data: IAttendanceComplaint;
      }>(`/api/attendance-complaints/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: attendanceQueryKeys.complaints(),
      });
      queryClient.invalidateQueries({
        queryKey: attendanceQueryKeys.complaintDetails(data.id),
      });

      toast.success("Complaint updated successfully");
    },
    onError: (error: AxiosError<IAttendanceError>) => {
      const message =
        error.response?.data?.message || "Failed to update complaint";
      toast.error("Failed to update complaint", {
        description: message,
      });
    },
  });
};

/**
 * Hook to update complaint status (Admin)
 */
export const useUpdateComplaintStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: IUpdateComplaintStatusRequest;
    }): Promise<IAttendanceComplaint> => {
      const { data: response } = await apiClient.put<{
        data: IAttendanceComplaint;
      }>(`/api/admin/attendance-complaints/${id}/status`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: attendanceQueryKeys.complaints(),
      });
      queryClient.invalidateQueries({
        queryKey: attendanceQueryKeys.complaintDetails(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: attendanceQueryKeys.complaintStatistics(),
      });

      toast.success("Complaint status updated successfully");
    },
    onError: (error: AxiosError<IAttendanceError>) => {
      const message =
        error.response?.data?.message || "Failed to update complaint status";
      toast.error("Failed to update status", {
        description: message,
      });
    },
  });
};

/**
 * Hook to respond to complaint (Admin)
 */
export const useRespondToComplaint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      complaintId,
      ...data
    }: {
      complaintId: number;
      response_type: "approve" | "reject";
      admin_response: string;
      attendance_updates?: {
        checkin_time?: string;
        checkout_time?: string;
        type?: "full_day" | "half_day";
        description?: string;
      };
    }): Promise<IAttendanceComplaint> => {
      const { data: response } = await apiClient.post<{
        data: IAttendanceComplaint;
      }>(`/api/admin/attendance-complaints/${complaintId}/respond`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: attendanceQueryKeys.complaints(),
      });
      queryClient.invalidateQueries({
        queryKey: attendanceQueryKeys.complaintDetails(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: attendanceQueryKeys.complaintStatistics(),
      });

      toast.success("Complaint response submitted successfully");
    },
    onError: (error: AxiosError<IAttendanceError>) => {
      const message =
        error.response?.data?.message || "Failed to respond to complaint";
      toast.error("Failed to respond", {
        description: message,
      });
    },
  });
};

/**
 * Hook to get complaint statistics (Admin)
 */
export const useComplaintStatistics = () => {
  return useQuery({
    queryKey: attendanceQueryKeys.complaintStatistics(),
    queryFn: async (): Promise<IComplaintStatistics> => {
      const { data } = await apiClient.get<IComplaintStatistics>(
        "/api/admin/attendance-complaints/statistics"
      );
      return data;
    },
  });
};
