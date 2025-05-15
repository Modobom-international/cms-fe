export interface Card {
  id: number;
  list_id: number;
  title: string;
  description: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface CardResponse {
  success: boolean;
  message: string;
  type: string;
  data: Card[] | Card;
}

export interface CreateCardPayload {
  title: string;
  description: string;
}

export interface UpdateCardPayload extends Partial<CreateCardPayload> {
  position?: number;
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
