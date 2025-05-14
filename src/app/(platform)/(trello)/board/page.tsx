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
    <div className="min-h-screen bg-gradient-to-br from-sky-400/20 to-blue-800/20 p-6">
      <div className="mx-auto max-w-[1400px]">
        <h1 className="text-foreground/80 mb-8 text-2xl font-semibold">
          My Board
        </h1>
        <DragDropContext
          onDragEnd={onDragEnd}
          onBeforeDragStart={() => {
            // Disable pointer events on other cards during drag
            document.body.classList.add("dragging");
          }}
          onDragUpdate={(update) => {
            // Update the UI during drag
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
                    <Skeleton className="h-[480px] w-80" />
                    <Skeleton className="h-[480px] w-80" />
                    <Skeleton className="h-[480px] w-80" />
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

