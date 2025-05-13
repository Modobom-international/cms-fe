"use client";

import { Draggable, Droppable } from "@hello-pangea/dnd";

import { List } from "@/types/board";

import { useCreateCard, useDeleteCard, useUpdateCard } from "@/hooks/board";

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
  const { mutate: createCard } = useCreateCard();
  const { mutate: updateCard } = useUpdateCard();
  const { mutate: deleteCard } = useDeleteCard();

  return (
    <Draggable draggableId={String(list.id)} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="w-72 shrink-0 rounded-lg bg-gray-200 p-4"
        >
          <div
            {...provided.dragHandleProps}
            className="mb-4 flex items-center justify-between"
          >
            <h3 className="text-lg font-semibold">{list.title}</h3>
            <button
              onClick={onDeleteList}
              className="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-100"
            >
              Delete
            </button>
          </div>

          {/* Cards */}
          <Droppable droppableId={String(list.id)} type="card">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-2"
              >
                {list.cards?.map((card, cardIndex) => (
                  <BoardCard
                    key={String(card.id)}
                    card={{
                      ...card,
                      id: String(card.id),
                      listId: String(card.listId),
                    }}
                    index={cardIndex}
                    onUpdate={updateCard}
                    onDelete={(cardId) =>
                      deleteCard({
                        cardId: String(cardId),
                        listId: String(list.id),
                      })
                    }
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Add Card Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
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
          >
            <input
              type="text"
              name="title"
              placeholder="Card title"
              className="mb-2 w-full rounded border p-2"
              required
            />
            <textarea
              name="description"
              placeholder="Card description"
              className="mb-2 w-full rounded border p-2"
              required
            />
            <button
              type="submit"
              className="w-full rounded bg-blue-500 py-2 text-white hover:bg-blue-600"
            >
              Add Card
            </button>
          </form>
        </div>
      )}
    </Draggable>
  );
}

