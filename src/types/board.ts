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

export interface Card {
  id: string;
  title: string;
  description: string;
  dueDate?: string; // ISO string format
  checklist?: ChecklistItem[];
  attachments?: Attachment[];
}

export interface List {
  id: string;
  title: string;
  cards: Card[];
}
