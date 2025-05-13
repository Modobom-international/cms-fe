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
  id: string;
  title: string;
  description: string;
  order?: number;
  listId: string;
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
  cardId: string;
  sourceListId: string;
  destinationListId: string;
  newOrder: number;
}

export interface CardPosition {
  id: string;
  position: number;
  list_id: string;
}

export interface UpdateCardPositionsPayload {
  positions: CardPosition[];
}

