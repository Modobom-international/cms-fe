"use client";

import { useState } from "react";

import { Draggable } from "@hello-pangea/dnd";
import { format } from "date-fns";
import { CheckSquare, Clock, GripVertical } from "lucide-react";

import { Card } from "@/types/board";

import CardDetail from "./CardDetail";

interface BoardCardProps {
  card: Card;
  index: number;
  onUpdate: (updatedCard: Card) => void;
  onDelete: (cardId: number) => void;
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

  // Format due date for display
  const formattedDueDate = card.dueDate
    ? format(new Date(card.dueDate), "MMM d")
    : null;

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

  return (
    <>
      <Draggable draggableId={`card-${card.id}`} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`group relative mb-2 cursor-pointer rounded bg-white p-3 shadow transition-all duration-200 ${
              snapshot.isDragging
                ? "scale-105 rotate-2 bg-gray-50 opacity-90 shadow-xl"
                : "hover:-translate-y-0.5 hover:shadow-md"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setIsDetailOpen(true);
            }}
          >
            {/* Drag Handle */}
            <div
              {...provided.dragHandleProps}
              className="absolute top-0 bottom-0 left-0 flex w-6 cursor-grab items-center justify-center rounded-l bg-transparent opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>

            {/* Card Content */}
            <div className="pl-4">
              <h3 className="font-medium">{card.title}</h3>

              {card.description && (
                <div className="mt-2 text-sm text-gray-600">
                  <p className="line-clamp-2 whitespace-pre-line">
                    {card.description}
                  </p>
                </div>
              )}

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
