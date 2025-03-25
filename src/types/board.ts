export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  dueDate?: string; // ISO string format
  checklist?: ChecklistItem[];
}

export interface List {
  id: string;
  title: string;
  cards: Card[];
}
