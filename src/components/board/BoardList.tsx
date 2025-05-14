"use client";

import { Draggable, Droppable } from "@hello-pangea/dnd";

import { Card, List } from "@/types/board";

import {
  useCreateCard,
  useDeleteCard,
  useGetCards,
  useUpdateCard,
} from "@/hooks/board";

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
    <Draggable draggableId={String(list.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`w-72 shrink-0 rounded-lg bg-gray-200 p-4 transition-all duration-200 ${
            snapshot.isDragging ? "rotate-2 shadow-xl" : ""
          }`}
        >
          {/* List Header - Only this part should be draggable for the list */}
          <div
            {...provided.dragHandleProps}
            className="mb-4 flex cursor-grab items-center justify-between rounded bg-gray-200 px-2 py-1 active:cursor-grabbing"
          >
            <h3 className="text-lg font-semibold select-none">{list.title}</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteList();
              }}
              className="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-100"
            >
              Delete
            </button>
          </div>

          {/* Cards Container - This should be droppable for cards */}
          <Droppable droppableId={String(list.id)} type="card">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`min-h-[50px] space-y-2 transition-colors ${
                  snapshot.isDraggingOver ? "rounded bg-gray-300/50 p-2" : "p-2"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {isLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-16 rounded bg-gray-300"></div>
                    <div className="h-16 rounded bg-gray-300"></div>
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
                form.elements.namedItem("description") as HTMLTextAreaElement
              ).value;

              createCard({
                listId: String(list.id),
                title,
                description,
              });

              form.reset();
            }}
            className="mt-4"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              name="title"
              placeholder="Card title"
              className="mb-2 w-full rounded border p-2"
              required
              onClick={(e) => e.stopPropagation()}
            />
            <textarea
              name="description"
              placeholder="Card description"
              className="mb-2 w-full rounded border p-2"
              required
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="submit"
              className="w-full rounded bg-blue-500 py-2 text-white hover:bg-blue-600"
              onClick={(e) => e.stopPropagation()}
            >
              Add Card
            </button>
          </form>
        </div>
      )}
    </Draggable>
  );
}
