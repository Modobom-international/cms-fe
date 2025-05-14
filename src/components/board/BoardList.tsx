"use client";

import { Draggable, Droppable } from "@hello-pangea/dnd";
import { GripVertical } from "lucide-react";

import { Card, List } from "@/types/board";

import { cn } from "@/lib/utils";

import {
  useCreateCard,
  useDeleteCard,
  useGetCards,
  useUpdateCard,
} from "@/hooks/board";

import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardHeader,
  Card as ShadCard,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import BoardCard from "./BoardCard";

interface BoardListProps {
  list: List;
  index: number;
  onDeleteList: () => void;
}

export default function BoardList({
  list,
  index,
  onDeleteList,
}: BoardListProps) {
  const { data: cards = [], isLoading } = useGetCards(String(list.id));
  const { mutate: createCard } = useCreateCard();
  const { mutate: updateCard } = useUpdateCard();
  const { mutate: deleteCard } = useDeleteCard();

  return (
    <Draggable draggableId={`list-${list.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "h-full w-80 shrink-0",
            snapshot.isDragging && "rotate-2"
          )}
        >
          <ShadCard className="bg-muted/50 flex min-h-1/2 flex-col">
            {/* List Header */}
            <CardHeader
              {...provided.dragHandleProps}
              className="flex-none cursor-grab space-y-0 pb-2 active:cursor-grabbing"
            >
              <div className="group/header flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="opacity-0 transition-opacity group-hover/header:opacity-40">
                    <GripVertical className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-medium">{list.title}</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteList();
                  }}
                  className="text-destructive hover:text-destructive/90 h-auto cursor-pointer px-2 py-1 text-xs opacity-0 transition-opacity group-hover/header:opacity-100"
                >
                  Delete
                </Button>
              </div>
            </CardHeader>

            {/* Cards Container */}
            <CardContent className="space-y-2 px-2">
              <Droppable droppableId={`list-${list.id}`} type="card">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "min-h-[50px] space-y-1.5 rounded-md transition-all duration-200",
                      snapshot.isDraggingOver ? "bg-muted/70 p-2" : "p-1"
                    )}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isLoading ? (
                      <div className="space-y-1.5">
                        <div className="bg-muted h-12 animate-pulse rounded-md" />
                        <div className="bg-muted h-12 animate-pulse rounded-md" />
                      </div>
                    ) : (
                      cards.map((card: Card, cardIndex: number) => (
                        <BoardCard
                          key={String(card.id)}
                          card={card}
                          index={cardIndex}
                          onUpdate={(updatedCard) =>
                            updateCard({
                              ...updatedCard,
                              id: updatedCard.id,
                            })
                          }
                          onDelete={(cardId) =>
                            deleteCard({
                              cardId,
                              listId: list.id,
                            })
                          }
                        />
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              {/* Add Card Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const form = e.target as HTMLFormElement;
                  const title = (
                    form.elements.namedItem("title") as HTMLInputElement
                  ).value.trim();
                  const description = (
                    form.elements.namedItem(
                      "description"
                    ) as HTMLTextAreaElement
                  ).value.trim();

                  if (!title) return;

                  createCard({
                    listId: String(list.id),
                    title,
                    description,
                  });

                  form.reset();
                }}
                className="space-y-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                <Input
                  type="text"
                  name="title"
                  placeholder="Card title"
                  className="bg-background/50 focus:bg-background h-7 text-sm transition-colors"
                  required
                  onClick={(e) => e.stopPropagation()}
                />
                <Textarea
                  name="description"
                  placeholder="Card description (optional)"
                  className="bg-background/50 focus:bg-background h-16 resize-none text-sm transition-colors"
                  onClick={(e) => e.stopPropagation()}
                />
                <Button
                  type="submit"
                  className="h-7 w-full"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  Add Card
                </Button>
              </form>
            </CardContent>
          </ShadCard>
        </div>
      )}
    </Draggable>
  );
}
