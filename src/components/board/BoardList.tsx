"use client";

import { Draggable, Droppable } from "@hello-pangea/dnd";

import { List } from "@/types/board";

import AddCard from "./AddCard";
import BoardCard from "./BoardCard";

interface BoardListProps {
  list: List;
  index: number;
  onAddCard: (title: string, description: string) => void;
}

export default function BoardList({ list, index, onAddCard }: BoardListProps) {
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
            className="mb-2 rounded bg-gray-200 p-2"
          >
            <h2 className="text-lg font-semibold">{list.title}</h2>
          </div>
          <Droppable droppableId={list.id} type="card">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="rounded bg-gray-200 p-2"
              >
                {list.cards.map((card, index) => (
                  <BoardCard key={card.id} card={card} index={index} />
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
