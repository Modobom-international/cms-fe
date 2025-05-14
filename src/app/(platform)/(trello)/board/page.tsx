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

import { Button } from "@/components/ui/button";
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
    <div className="absolute inset-0 h-[calc(100vh-var(--header-height)-theme(spacing.20))] bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="h-full p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold tracking-tight text-gray-800">
              My Board
            </h1>
            <div className="h-8 w-px bg-gray-200/80" />
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <span>{lists.length} Lists</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/50 text-xs hover:bg-white"
              onClick={() => {
                document.body.style.cursor = "default";
                document.body.classList.remove("dragging");
              }}
            >
              Reset View
            </Button>
            <div className="h-8 w-px bg-gray-200/80" />
            <Button
              variant="outline"
              size="sm"
              className="bg-white/50 text-xs hover:bg-white"
            >
              Filter
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/50 text-xs hover:bg-white"
            >
              Sort
            </Button>
          </div>
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
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={cn(
                  "flex h-[calc(100%-theme(spacing.16))] min-h-[200px] gap-6 overflow-x-auto px-1 pb-4",
                  snapshot.isDraggingOver && "cursor-grabbing"
                )}
              >
                {isLoading ? (
                  <div className="flex gap-6">
                    <Skeleton className="h-full w-80 rounded-xl" />
                    <Skeleton className="h-full w-80 rounded-xl" />
                    <Skeleton className="h-full w-80 rounded-xl" />
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
