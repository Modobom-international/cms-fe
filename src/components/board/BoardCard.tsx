"use client";

import { useState } from "react";

import { Draggable } from "@hello-pangea/dnd";
import { format } from "date-fns";
import {
  CheckSquare,
  Clock,
  GripVertical,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Card } from "@/types/board.type";

import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CardContent, Card as ShadCard } from "@/components/ui/card";

import CardDetail from "./CardDetail";
import CardLabels from "./CardLabels";

interface BoardCardProps {
  card: Card;
  index: number;
  boardId: number;
  onUpdate: (card: Card) => void;
  onDelete: (cardId: number) => void;
}

export default function BoardCard({
  card,
  index,
  boardId,
  onUpdate,
  onDelete,
}: BoardCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const t = useTranslations("Board.card");

  // Format due date for display
  const formattedDueDate = card.dueDate
    ? format(new Date(card.dueDate), "MMM d")
    : null;

  // Check if card has a checklist with items
  const hasChecklist = card.checklist && card.checklist.length > 0;

  // Calculate checklist progress if it exists
  const checklistProgress = hasChecklist
    ? Math.round(
        (card.checklist!.filter((item) => item.is_completed === 1).length /
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
                "group relative mb-2 rounded-md border bg-white p-2 shadow-sm transition-shadow hover:shadow-md",
                snapshot.isDragging && "shadow-lg"
              )}
            >
              <div
                {...provided.dragHandleProps}
                className="absolute top-1/2 left-1 -translate-y-1/2 cursor-grab opacity-0 transition-opacity group-hover:opacity-100"
              >
                <GripVertical className="h-4 w-4 text-gray-400" />
              </div>

              <CardContent className="space-y-2 p-2.5 pl-8">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm leading-none font-medium tracking-tight">
                      {card.title}
                    </h3>
                    {/* {card.description && (
                      <p className="text-muted-foreground/80 mt-1.5 line-clamp-2 text-xs">
                        {card.description || t("detail.description")}
                      </p>
                    )} */}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {/* <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsDetailOpen(true)}
                      className="h-7"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button> */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(card.id)}
                      className="h-7 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Card badges */}
                <div className="flex flex-wrap gap-1.5">
                  {formattedDueDate && (
                    <div
                      className={cn(
                        "bg-secondary/30 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium transition-colors",
                        new Date(card.dueDate!) < new Date()
                          ? "text-destructive bg-destructive/10"
                          : "text-secondary-foreground"
                      )}
                    >
                      <Clock className="h-2.5 w-2.5" />
                      <span>
                        {t("detail.dueDate.due", {
                          date: formattedDueDate,
                        })}
                      </span>
                    </div>
                  )}

                  {hasChecklist && (
                    <div className="bg-secondary/30 text-secondary-foreground flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium">
                      <CheckSquare className="h-2.5 w-2.5" />
                      <span>{checklistProgress}%</span>
                    </div>
                  )}

                  <CardLabels labels={card.labels || []} />
                </div>

                {/* Member avatars */}
                {card.members && card.members.length > 0 && (
                  <div className="flex items-center justify-end gap-1">
                    <div className="flex -space-x-2">
                      {card.members.slice(0, 3).map((member) => (
                        <Avatar
                          key={member.id}
                          className="border-background h-8 w-8 border-2"
                        >
                          <AvatarImage
                            src={member.profile_photo_path || undefined}
                            alt={member.name}
                          />
                          <AvatarFallback className="text-[10px]">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    {card.members.length > 3 && (
                      <div className="bg-secondary/30 text-secondary-foreground flex h-6 items-center rounded-full px-1.5 text-[10px] font-medium">
                        +{card.members.length - 3}
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
          boardId={boardId}
          onClose={() => setIsDetailOpen(false)}
          onUpdate={onUpdate}
          onDelete={() => {
            onDelete(card.id);
            setIsDetailOpen(false);
          }}
        />
      )}
    </>
  );
}
