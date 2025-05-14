"use client";

import { Draggable, Droppable } from "@hello-pangea/dnd";

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
          className={cn("w-80 shrink-0", snapshot.isDragging && "rotate-2")}
        >
          <ShadCard className="bg-muted/50">
            {/* List Header */}
            <CardHeader
              {...provided.dragHandleProps}
              className="cursor-grab space-y-0 pb-2 active:cursor-grabbing"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">{list.title}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteList();
                  }}
                  className="text-destructive hover:text-destructive/90 h-auto px-2 py-1 text-xs"
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
                      "min-h-[50px] space-y-2 rounded-md p-1 transition-colors",
                      snapshot.isDraggingOver && "bg-muted"
                    )}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isLoading ? (
                      <div className="space-y-2">
                        <div className="bg-muted h-16 animate-pulse rounded-md" />
                        <div className="bg-muted h-16 animate-pulse rounded-md" />
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
                  ).value;
                  const description = (
                    form.elements.namedItem(
                      "description"
                    ) as HTMLTextAreaElement
                  ).value;

                  createCard({
                    listId: String(list.id),
                    title,
                    description,
                  });

                  form.reset();
                }}
                className="space-y-2"
                onClick={(e) => e.stopPropagation()}
              >
                <Input
                  type="text"
                  name="title"
                  placeholder="Card title"
                  className="h-8 text-sm"
                  required
                  onClick={(e) => e.stopPropagation()}
                />
                <Textarea
                  name="description"
                  placeholder="Card description"
                  className="h-20 resize-none text-sm"
                  required
                  onClick={(e) => e.stopPropagation()}
                />
                <Button
                  type="submit"
                  className="w-full"
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

