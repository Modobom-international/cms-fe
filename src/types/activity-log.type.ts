export interface IActivityLog {
  id: number;
  action: string;
  details: IActivityLogDetails | any;
  user_id: number;
  description: string;
  created_at: string;
  updated_at: string;
  user_email: string;
  user_name?: string;
  action_label?: string;
  group_action?: string;
  formatted_created_at?: string;
}

export interface IActivityLogDetails {
  filters?: IActivityLogFilters | any;
  logged_at: string;
  [key: string]: any;
}

export interface IActivityLogFilters {
  page: string;
  pageSize: string;
  search?: string;
  [key: string]: any;
}

export interface IActivityLogPagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}

export interface IActivityLogData {
  activities: IActivityLog[];
  pagination: IActivityLogPagination;
  filters_applied?: any;
}

export interface IActivityLogResponse {
  success: boolean;
  data: IActivityLogData;
  message: string;
  type: string;
}

export interface ILink {
  url?: string;
  label: string;
  active: boolean;
}
