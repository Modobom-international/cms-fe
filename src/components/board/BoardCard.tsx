"use client";

import { useState } from "react";

import { Draggable } from "@hello-pangea/dnd";
import { format } from "date-fns";
import { CheckSquare, Clock, GripVertical } from "lucide-react";

import { Card } from "@/types/board";

import { cn } from "@/lib/utils";

import {
  CardContent,
  CardDescription,
  CardHeader,
  Card as ShadCard,
} from "@/components/ui/card";

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
            className="group"
            onClick={(e) => {
              e.stopPropagation();
              setIsDetailOpen(true);
            }}
          >
            <ShadCard
              className={cn(
                "relative mb-2 cursor-pointer transition-all duration-200",
                snapshot.isDragging
                  ? "scale-105 rotate-2 opacity-90 shadow-xl"
                  : "hover:-translate-y-0.5 hover:shadow-md"
              )}
            >
              {/* Drag Handle */}
              <div
                {...provided.dragHandleProps}
                className="absolute top-0 bottom-0 left-0 flex w-6 cursor-grab items-center justify-center rounded-l bg-transparent opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="text-muted-foreground h-4 w-4" />
              </div>

              {/* Card Content */}
              <CardHeader className="pt-3 pb-2 pl-8">
                <h3 className="text-sm leading-none font-medium">
                  {card.title}
                </h3>
                {card.description && (
                  <CardDescription className="mt-2 line-clamp-2 text-xs whitespace-pre-line">
                    {card.description}
                  </CardDescription>
                )}
              </CardHeader>

              {/* Card badges */}
              {(formattedDueDate || hasChecklist) && (
                <CardContent className="flex flex-wrap gap-2 pt-0 pb-3">
                  {formattedDueDate && (
                    <div
                      className={cn(
                        "bg-secondary flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs",
                        new Date(card.dueDate!) < new Date()
                          ? "text-destructive"
                          : "text-secondary-foreground"
                      )}
                    >
                      <Clock size={12} />
                      <span>{formattedDueDate}</span>
                    </div>
                  )}

                  {hasChecklist && (
                    <div className="bg-secondary text-secondary-foreground flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs">
                      <CheckSquare size={12} />
                      <span>
                        {
                          card.checklist!.filter((item) => item.completed)
                            .length
                        }
                        /{card.checklist!.length}
                      </span>
                    </div>
                  )}
                </CardContent>
              )}
            </ShadCard>
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

