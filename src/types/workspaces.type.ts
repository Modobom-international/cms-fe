export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  role: string;
  type_user: string;
  profile_photo_path: string | null;
  exclude_token: string | null;
}

export interface Workspace {
  id: number;
  name: string;
  description: string;
  visibility: "private" | "public";
  owner_id: number;
  created_at: string;
  updated_at: string;
  owner: User;
}

export interface WorkspaceMember {
  workspace: Workspace;
  role: "owner" | "member";
  is_member: boolean;
}

export interface CreateWorkspaceDto {
  name: string;
  visibility: number; // 1 for private, 2 for public
  description: string;
}

export interface UpdateWorkspaceDto {
  name?: string;
  visibility?: number;
  description?: string;
}

export interface WorkspaceResponse {
  success: boolean;
  workspaces: WorkspaceMember[];
  message: string;
  type: string;
}

export interface CreateWorkspaceResponse {
  success: boolean;
  message: string;
  type: string;
}

export interface UpdateWorkspaceResponse {
  success: boolean;
  workspace: number;
  message: string;
  type: string;
}

export interface SingleWorkspaceResponse {
  success: boolean;
  workspace: Workspace;
  message: string;
  type: string;
}

export interface DeleteWorkspaceResponse {
  success: boolean;
  message: string;
}

// Helper functions to convert between API and UI visibility formats
export const visibilityToNumber = (
  visibility: "private" | "public"
): number => {
  return visibility === "private" ? 1 : 2;
};

export const numberToVisibility = (num: number): "private" | "public" => {
  return num === 1 ? "private" : "public";
};
