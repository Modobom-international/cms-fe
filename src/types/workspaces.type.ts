export interface Workspace {
  id: number;
  name: string;
  description: string;
  visibility: "private" | "public";
  owner_id: number;
  created_at: string;
  updated_at: string;
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
  workspace: Workspace[];
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
