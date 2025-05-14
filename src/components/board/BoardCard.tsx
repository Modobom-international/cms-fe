"use client";

import { useState } from "react";

import { Draggable } from "@hello-pangea/dnd";
import { format } from "date-fns";
import { CheckSquare, Clock, GripVertical } from "lucide-react";

import { Card } from "@/types/board";

import { cn } from "@/lib/utils";

import { CardContent, Card as ShadCard } from "@/components/ui/card";

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
                "relative mb-1.5 cursor-pointer border-none bg-white/80 shadow-sm transition-all duration-200 hover:bg-white",
                snapshot.isDragging && "scale-105 rotate-2 bg-white shadow-lg"
              )}
            >
              {/* Drag Handle */}
              <div
                {...provided.dragHandleProps}
                className="absolute top-0 bottom-0 left-0 flex w-6 cursor-grab items-center justify-center rounded-l bg-transparent opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="text-muted-foreground/50 h-4 w-4" />
              </div>

              {/* Card Content */}
              <CardContent className="space-y-2 p-2.5 pl-8">
                <div>
                  <h3 className="truncate text-sm leading-none font-medium">
                    {card.title}
                  </h3>
                  {card.description && (
                    <p className="text-muted-foreground mt-1.5 line-clamp-2 text-xs">
                      {card.description}
                    </p>
                  )}
                </div>

                {/* Card badges */}
                {(formattedDueDate || hasChecklist) && (
                  <div className="flex flex-wrap gap-1.5">
                    {formattedDueDate && (
                      <div
                        className={cn(
                          "bg-secondary/50 flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10px] font-medium",
                          new Date(card.dueDate!) < new Date()
                            ? "text-destructive"
                            : "text-secondary-foreground"
                        )}
                      >
                        <Clock className="h-2.5 w-2.5" />
                        <span>{formattedDueDate}</span>
                      </div>
                    )}

                    {hasChecklist && (
                      <div className="bg-secondary/50 text-secondary-foreground flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10px] font-medium">
                        <CheckSquare className="h-2.5 w-2.5" />
                        <span>
                          {
                            card.checklist!.filter((item) => item.completed)
                              .length
                          }
                          /{card.checklist!.length}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
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
