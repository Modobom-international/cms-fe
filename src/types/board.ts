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
  title: string;
  lists: List[];
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
