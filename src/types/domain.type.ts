export interface IDomain {
  id: number;
  action: string;
  details: IDetails;
  user_id: number;
  description: any;
  created_at: string;
  updated_at: string;
}

export interface ISite {
  id: number;
  branch: string;
  name: string;
  status: string;
  cloudflare_domain_status: string;
  cloudflare_project_name: number;
  created_at: string;
  updated_at: string;
  description: string;
  user_id: number;
  domain: string;
  users: IUser[];
}

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

export interface IDomainActual {
  id: number;
  domain: string;
  time_expired: string;
  registrar: string;
  created_at: string;
  updated_at: string;
  is_locked: number;
  renewable: number;
  status: string;
  name_servers: string;
  renew_deadline: string;
  registrar_created_at: string;
  activeUsers?: number;
  sites: ISite;
}

export interface IDomainForTracking {
  id: number;
  branch: string;
  cloudflare_domain_status: string;
  cloudflare_project_name: string;
  created_at: string;
  description: string | null;
  domain: string;
  name: string;
  status: string;
  updated_at: string;
  user_id: number;
}

export interface IDomainResponseTracking {
  success: boolean;
  data: IDomainForTracking[];
  message: string;
  type: string;
}

export interface IDomainResponse {
  success: boolean;
  data: IPaginatedResponse<IDomainActual>;
  message: string;
  type: string;
}

export interface IDetails {
  id: number;
  attributes?: IAttributes;
  logged_at: string;
  changes?: IChanges;
  original?: IOriginal;
}

export interface IAttributes {
  slugs: string;
  result_path: string;
  status: string;
  site_id: number;
  updated_at: string;
  created_at: string;
  id: number;
}

export interface IChanges {
  updated_at: string;
  content: string;
}

export interface IOriginal {
  updated_at: string;
  content: string;
}

export interface IDomainPathResponse {
  success: boolean;
  data: IDomainPath;
  message: string;
  type: string;
}

export interface IDomainPath {
  id: number;
  site_id: number;
  name: string;
  slug: string;
  provider: number;
  created_at: string;
  updated_at: string;
  content: string;
}
