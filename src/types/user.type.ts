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
  phone_number?: string;
  address?: string;
}

export interface IGetAllUserResponse extends IPaginationResponse<IUser> {
  type?: string;
}

export interface ICreateUserResponse {
  success: true;
  message: string;
  data: IUser;
  type: string;
}

export interface IUpdateUserResponse {
  success: true;
  message: string;
  data: IUser;
  type: string;
}

