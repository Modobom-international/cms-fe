// Attendance Types
export interface IAttendanceRecord {
  id: number;
  employee_id: number;
  date: string;
  type: AttendanceType;
  checkin_time: string | null;
  checkout_time: string | null;
  total_work_hours: number | null;
  status: AttendanceStatus;
  description: string | null;
  branch_name: string | null;
  created_at: string;
  updated_at: string;
}

export type AttendanceStatus =
  | "incomplete"
  | "completed"
  | "on_leave"
  | "remote_work";
export type AttendanceType = "full_day" | "half_day";

// Check-in Request
export interface ICheckInRequest {
  employee_id: number;
  type: AttendanceType;
}

// Check-out Request
export interface ICheckOutRequest {
  employee_id: number;
}

// Check-in Response
export interface ICheckInResponse {
  message: string;
  data: IAttendanceRecord;
  remote_work_info?: {
    location: string;
    reason: string;
    approved_by: string;
  };
  leave_info?: ILeaveInfo;
}

// Check-out Response
export interface ICheckOutResponse {
  message: string;
  data: IAttendanceRecord;
}

// Today's Attendance Response
export interface ITodayAttendanceResponse {
  data?: IAttendanceRecord;
  message?: string;
  leave_info?: ILeaveInfo;
}

// Admin Report Response
export interface IAttendanceReportRecord {
  employee_id: number;
  employee_name: string;
  checkin_time: string | null;
  checkout_time: string | null;
  total_work_hours: number | null;
  status: AttendanceStatus;
  status_display: string;
  branch_name: string | null;
  leave_info?: ILeaveInfo;
}

// Admin Custom Attendance
export interface ICustomAttendanceRequest {
  employee_id: number;
  date: string;
  type: AttendanceType;
  checkin_time: string;
  checkout_time: string;
  branch_name: string;
  description?: string;
}

export interface ICustomAttendanceResponse {
  message: string;
  data: IAttendanceRecord;
  warning?: string;
  leave_info?: ILeaveInfo;
}

// Leave Info (from leave management system)
export interface ILeaveInfo {
  leave_type: string;
  request_type: string;
  reason: string;
  approved_by?: string;
  start_date?: string;
  end_date?: string;
  remote_work_details?: {
    location: string;
    equipment_needed: string[];
    contact_method?: string;
  };
}

// Attendance Complaints
export interface IAttendanceComplaint {
  id: number;
  attendance_id: number;
  employee_id: number;
  complaint_type: ComplaintType;
  description: string;
  proposed_changes: Record<string, any>;
  status: ComplaintStatus;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
  employee?: {
    id: number;
    name: string;
    email: string;
  };
  attendance?: IAttendanceRecord;
}

export type ComplaintType =
  | "incorrect_time"
  | "missing_record"
  | "technical_issue"
  | "other";
export type ComplaintStatus =
  | "pending"
  | "under_review"
  | "resolved"
  | "rejected";

// Create Complaint Request
export interface ICreateComplaintRequest {
  attendance_id: number;
  complaint_type: ComplaintType;
  description: string;
  proposed_changes: Record<string, any>;
}

// Update Complaint Status Request (Admin)
export interface IUpdateComplaintStatusRequest {
  status: ComplaintStatus;
  admin_response?: string;
}

// Complaint Statistics (Admin)
export interface IComplaintStatistics {
  total: number;
  pending: number;
  under_review: number;
  resolved: number;
  rejected: number;
  by_type: {
    incorrect_time: number;
    missing_record: number;
    technical_issue: number;
    other: number;
  };
}

// Generic API Response Types
export interface IAttendanceResponse<T = any> {
  message: string;
  data?: T;
  success?: boolean;
}

export interface IPaginatedResponse<T> {
  current_page: number;
  data: T[];
  total: number;
  per_page: number;
  last_page: number;
}

// Query Parameters
export interface IAttendanceReportParams {
  date: string;
  type?: AttendanceType;
  branch_name?: string;
  include_leave?: boolean;
}

export interface IComplaintsParams {
  status?: ComplaintStatus;
  employee_id?: number;
  complaint_type?: ComplaintType;
  per_page?: number;
  page?: number;
}

// Error Response
export interface IAttendanceError {
  message: string;
  errors?: Record<string, string[]>;
}
