"use client";

import { useState } from "react";

import { Draggable } from "@hello-pangea/dnd";

import { Card } from "@/types/board";

import CardDetail from "./CardDetail";

interface BoardCardProps {
  card: Card;
  index: number;
  onUpdate: (updatedCard: Card) => void;
  onDelete: (cardId: string) => void;
}

export default function BoardCard({
  card,
  index,
  onUpdate,
  onDelete,
}: BoardCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  return (
    <>
      <Draggable draggableId={card.id} index={index}>
        {(provided) => (
          <div
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            className="mb-2 cursor-pointer rounded bg-white p-3 shadow hover:bg-gray-50"
            onClick={() => setIsDetailOpen(true)}
          >
            <h3 className="font-medium">{card.title}</h3>
            {card.description && (
              <p className="mt-1 truncate text-sm text-gray-600">
                {card.description}
              </p>
            )}
          </div>
        )}
      </Draggable>

      {isDetailOpen && (
        <CardDetail
          card={card}
          onClose={() => setIsDetailOpen(false)}
          onUpdate={(updatedCard) => {
            onUpdate(updatedCard);
            setIsDetailOpen(false);
          }}
          onDelete={() => {
            onDelete(card.id);
            setIsDetailOpen(false);
          }}
        />
      )}
    </>
  );
}
