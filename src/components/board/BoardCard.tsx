"use client";

import { useState } from "react";

import { Draggable } from "@hello-pangea/dnd";
import { format } from "date-fns";
import { Calendar, CheckSquare, Clock } from "lucide-react";

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

  // Function to strip HTML tags but preserve basic formatting
  const formatDescription = (html: string) => {
    if (!html) return "";
    // Remove all HTML tags except line breaks
    const text = html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]*>/g, "")
      .trim();
    // Limit to 100 characters
    return text.length > 100 ? text.substring(0, 97) + "..." : text;
  };

  // Check if card has a checklist with items
  const hasChecklist = card.checklist && card.checklist.length > 0;

  // Calculate checklist progress if it exists
  const checklistProgress = hasChecklist
    ? Math.round(
        (card.checklist!.filter((item) => item.completed).length /
          card.checklist!.length) *
          100
      )
    : 0;

  // Format due date for display
  const formattedDueDate = card.dueDate
    ? format(new Date(card.dueDate), "MMM d")
    : null;

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

            {/* {card.description && (
              <div className="mt-2 text-sm text-gray-600">
                <p className="line-clamp-2 whitespace-pre-line">
                  {formatDescription(card.description)}
                </p>
              </div>
            )} */}

            {/* Card badges */}
            <div className="mt-2 flex flex-wrap gap-2">
              {formattedDueDate && (
                <div
                  className={`flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-xs ${
                    new Date(card.dueDate!) < new Date()
                      ? "text-red-500"
                      : "text-gray-600"
                  }`}
                >
                  <Clock size={12} />
                  <span>{formattedDueDate}</span>
                </div>
              )}

              {hasChecklist && (
                <div className="flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                  <CheckSquare size={12} />
                  <span>
                    {card.checklist!.filter((item) => item.completed).length}/
                    {card.checklist!.length}
                  </span>
                </div>
              )}
            </div>
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
