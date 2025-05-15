export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string; // mime type
  size: number; // in bytes
  createdAt: string; // ISO string format
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Card {
  id: number;
  title: string;
  description: string;
  order?: number;
  listId: number;
  dueDate?: string; // ISO string format
  checklist?: ChecklistItem[];
  attachments?: Attachment[];
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
}

export interface CreateBoardDto {
  name: string;
  description: string;
  visibility: number; // 1 for private, 2 for public
  workspace_id: number;
}

export interface UpdateBoardDto {
  name?: string;
  description?: string;
  visibility?: number;
}

export interface BoardsResponse {
  success: boolean;
  boards: Board[];
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
