export interface IActivityLog {
  id: number;
  action: string;
  details: IActivityLogDetails;
  user_id: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface IActivityLogDetails {
  filters: IActivityLogFilters;
  logged_at: string;
}

export interface IActivityLogFilters {
  page: string;
  pageSize: string;
  search?: string;
}

export interface IActivityLogResponse {
  success: boolean;
  data: IPaginatedResponse<IActivityLog>;
  message: string;
  type: string;
}

export interface ILink {
  url?: string;
  label: string;
  active: boolean;
}
