"use client";

import { DragDropContext, Droppable } from "@hello-pangea/dnd";

import { cn } from "@/lib/utils";

import {
  useCreateList,
  useDeleteList,
  useGetLists,
  useMoveCard,
  useUpdateListsPositions,
} from "@/hooks/board";

import { Skeleton } from "@/components/ui/skeleton";

import AddList from "@/components/board/AddList";
import BoardList from "@/components/board/BoardList";

export default function BoardPage() {
  const { data: lists = [], isLoading } = useGetLists();
  const { mutate: createList } = useCreateList();
  const { mutate: deleteList } = useDeleteList();
  const { mutate: moveCard } = useMoveCard();
  const { mutate: updateListPosition } = useUpdateListsPositions();

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Handle list reordering
    if (type === "list") {
      const list = lists[source.index];
      updateListPosition({ id: list.id, position: destination.index + 1 });
      return;
    }

    // Handle card movement
    // Extract the actual IDs from the prefixed IDs
    const cardId = Number(draggableId.replace("card-", ""));
    const sourceListId = Number(source.droppableId.replace("list-", ""));
    const destinationListId = Number(
      destination.droppableId.replace("list-", "")
    );

    moveCard({
      cardId,
      sourceListId,
      destinationListId,
      newOrder: destination.index,
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-screen-2xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">My Board</h1>
          <div className="h-8 w-px bg-gray-200" />
        </div>

        <DragDropContext
          onDragEnd={onDragEnd}
          onBeforeDragStart={() => {
            document.body.classList.add("dragging");
          }}
          onDragUpdate={() => {
            document.body.style.cursor = "grabbing";
          }}
        >
          <Droppable droppableId="board" type="list" direction="horizontal">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="flex gap-4 overflow-x-auto pb-4"
              >
                {isLoading ? (
                  <div className="flex gap-4">
                    <Skeleton className="h-[480px] w-72" />
                    <Skeleton className="h-[480px] w-72" />
                    <Skeleton className="h-[480px] w-72" />
                  </div>
                ) : (
                  <>
                    {lists.map((list, index) => (
                      <BoardList
                        key={list.id}
                        list={list}
                        index={index}
                        onDeleteList={() => deleteList(list.id)}
                      />
                    ))}
                    {provided.placeholder}
                    <AddList
                      onAdd={(title) => {
                        createList({ title, position: lists.length + 1 });
                      }}
                    />
                  </>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}
