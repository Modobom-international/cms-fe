import { IUser } from "@/types/user.type";

export interface ILoginRes {
  success: true;
  data: IUser;
  token: string;
  token_type: string;
  message: string;
  type: "login_success";
}

export interface ILoginErrorRes {
  success: false;
  message: string;
  type: "email_or_password_incorrect" | "unknown";
}

export interface IMeRes {
  success: true;
  data: IUser;
  message: string;
  type: "data_user_success";
}
