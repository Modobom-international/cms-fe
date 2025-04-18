export interface IUser {
  id: string;
  name: string;
  email: string;
  team_id?: string;
  team_name?: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
  type_user: string;
  profile_photo_path: string;
  exclude_token: string;
}

export interface IUserResponse {
  success: true;
  data: IPaginationResponse<IUser>;
  message?: string;
  type?: string;
}

export interface IPaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
