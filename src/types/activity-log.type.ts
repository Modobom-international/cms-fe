export interface IActivityLog {
  id: number;
  action: string;
  action_label?: string;
  group_action?: string;
  description: string;
  user_id: number;
  user_email: string;
  user_name?: string;
  formatted_created_at: string;
  formatted_details?: any;
  // Legacy fields for backward compatibility
  details?: any;
  created_at?: string;
  updated_at?: string;
}

export interface IActivityLogDetails {
  filters?: IActivityLogFilters | any;
  logged_at?: string;
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
  has_more_pages?: boolean;
  on_first_page?: boolean;
}

export interface IActivityLogData {
  activities: IActivityLog[];
  pagination: IActivityLogPagination;
  filters_applied?: {
    date?: string;
    date_from?: string;
    date_to?: string;
    user_id?: string;
    group_action?: string[];
    search?: string;
  };
  sort?: {
    field: string;
    direction: string;
  };
}

export interface IActivityLogResponse {
  success: boolean;
  data: IActivityLogData;
  message: string;
  type: string;
}

export interface IActivityLogStats {
  total_activities: number;
  actions_by_group: Record<string, number>;
  top_users: Array<{
    user_id: number;
    email: string;
    name: string;
    count: number;
  }>;
  daily_activities: Array<{
    date: string;
    count: number;
  }>;
  filters_applied?: any;
}

export interface IActivityLogStatsResponse {
  success: boolean;
  data: IActivityLogStats;
  message: string;
  type: string;
}

export interface IActivityLogFilter {
  value: string;
  label: string;
  description?: string;
}

export interface IActivityLogFiltersData {
  group_actions: IActivityLogFilter[];
  date_filters: Array<{
    value: string;
    label: string;
    date?: string;
    date_from?: string;
    date_to?: string;
  }>;
  sort_options: Array<{
    value: string;
    label: string;
    field: string;
    direction: string;
  }>;
  filter_options: {
    page_sizes: number[];
    max_page_size: number;
    default_page_size: number;
  };
}

export interface IActivityLogFiltersResponse {
  success: boolean;
  data: IActivityLogFiltersData;
  message: string;
  type: string;
}

export interface IActivityLogExportData {
  export_data: IActivityLog[];
  total_records: number;
  export_format: string;
  export_limit: number;
  generated_at: string;
  filters_applied?: any;
}

export interface IActivityLogExportResponse {
  success: boolean;
  data: IActivityLogExportData;
  message: string;
  type: string;
}

export interface ILink {
  url?: string;
  label: string;
  active: boolean;
}
