"use client";

import { Draggable } from "@hello-pangea/dnd";

import { Card } from "@/types/board";

interface BoardCardProps {
  card: Card;
  index: number;
}

export default function BoardCard({ card, index }: BoardCardProps) {
  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          className="mb-2 rounded bg-white p-3 shadow"
        >
          <h3 className="font-medium">{card.title}</h3>
          <p className="text-sm text-gray-600">{card.description}</p>
        </div>
      )}
    </Draggable>
  );
}
