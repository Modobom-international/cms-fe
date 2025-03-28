"use client";

import { Draggable, Droppable } from "@hello-pangea/dnd";
import { Trash2 } from "lucide-react";

import { Card, List } from "@/types/board";

import AddCard from "./AddCard";
import BoardCard from "./BoardCard";

interface BoardListProps {
  list: List;
  index: number;
  onAddCard: (title: string, description: string) => void;
  onUpdateCard: (listId: string, updatedCard: Card) => void;
  onDeleteCard: (listId: string, cardId: string) => void;
  onDeleteList: (listId: string) => void;
}

export default function BoardList({
  list,
  index,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onDeleteList,
}: BoardListProps) {
  return (
    <Draggable draggableId={list.id} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          ref={provided.innerRef}
          className="w-72 shrink-0"
        >
          <div
            {...provided.dragHandleProps}
            className="mb-2 flex items-center justify-between rounded bg-gray-200 p-2"
          >
            <h2 className="text-lg font-semibold">{list.title}</h2>
            <button
              onClick={() => onDeleteList(list.id)}
              className="rounded p-1 text-gray-500 hover:bg-gray-300 hover:text-red-500"
              title="Delete list"
            >
              <Trash2 size={16} />
            </button>
          </div>
          <Droppable droppableId={list.id} type="card">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="rounded bg-gray-200 p-2"
              >
                {list.cards.map((card, index) => (
                  <BoardCard
                    key={card.id}
                    card={card}
                    index={index}
                    onUpdate={(updatedCard) =>
                      onUpdateCard(list.id, updatedCard)
                    }
                    onDelete={(cardId) => onDeleteCard(list.id, cardId)}
                  />
                ))}
                {provided.placeholder}
                <AddCard listId={list.id} onAdd={onAddCard} />
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
}
