import { Workspace } from "./workspaces.type";

export interface Label {
  id: number;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
  pivot?: {
    card_id: number;
    label_id: number;
    created_at: string;
    updated_at: string;
  };
}

export interface ChecklistItem {
  id: number;
  checklist_id: number;
  content: string;
  is_completed: number;
  created_at: string;
  updated_at: string;
  isNew?: boolean;
  isDeleted?: boolean;
  isModified?: boolean;
  card_id?: number;
}

export interface Checklist {
  id: number;
  title: string;
  items: ChecklistItem[];
  position: number;
}

export interface Attachment {
  id: number;
  title: string;
  file_path: string;
  url: string;
  created_at: string;
  updated_at: string;
  card_id: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CardMember {
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
  pivot: {
    card_id: number;
    user_id: number;
  };
}

export interface Card {
  id: number;
  title: string;
  description?: string;
  list_id: number;
  position: number;
  dueDate?: string;
  checklist?: ChecklistItem[];
  attachments?: Attachment[];
  labels?: Label[];
  members?: CardMember[];
  created_at: string;
  updated_at: string;
}

export interface List {
  id: number;
  title: string;
  board_id: number;
  position: string;
  created_at: string;
  updated_at: string;
  cards?: Card[];
}

export interface Board {
  id: number;
  name: string;
  description: string | null;
  visibility: "private" | "public";
  owner_id: number;
  workspace_id: number;
  created_at: string;
  updated_at: string;
  lists?: List[];
  members?: {
    id: number;
    user_id: number;
    board_id: number;
    role: string;
    created_at: string;
    users: {
      id: number;
      name: string;
      email: string;
      profile_photo_path: string | null;
    };
  }[];
}

export interface BoardMember {
  id: number;
  user_id: number;
  board_id: number;
  role: string;
  created_at: string;
  users: {
    id: number;
    name: string;
    email: string;
    profile_photo_path: string | null;
  };
}

export interface BoardMembersResponse {
  success: boolean;
  members: BoardMember[];
  message: string;
  type: string;
}

export interface CreateBoardDto {
  name: string;
  description: string;
  workspace_id: number;
}

export interface UpdateBoardDto {
  name?: string;
  description?: string;
}

export interface BoardsResponse {
  success: boolean;
  boards: Board[];
  workspace: Workspace;
  message: string;
  type: string;
}

export interface SingleBoardResponse {
  success: boolean;
  board: Board;
  message: string;
  type: string;
}

export interface CreateBoardResponse {
  success: boolean;
  message: string;
  type: string;
}

export interface UpdateBoardResponse {
  success: boolean;
  board: number;
  message: string;
  type: string;
}

export interface DeleteBoardResponse {
  success: boolean;
  message: string;
}

export interface MoveCardPayload {
  cardId: number;
  sourceListId: number;
  destinationListId: number;
  newOrder: number;
}

export interface CardPosition {
  id: number;
  position: number;
  list_id: number;
}

export interface UpdateCardPositionsPayload {
  positions: CardPosition[];
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

export interface CardResponse {
  success: boolean;
  message: string;
  data: Card[] | Card | number;
}

export interface CreateCardPayload {
  list_id: string;
  title: string;
  description: string;
}

export interface UpdateCardPayload {
  id: number;
  title: string;
  description: string;
  list_id: number;
}
