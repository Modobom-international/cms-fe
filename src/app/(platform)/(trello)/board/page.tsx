"use client";

import { DragDropContext, Droppable } from "@hello-pangea/dnd";

import {
  useCreateList,
  useDeleteList,
  useGetLists,
  useMoveCard,
  useUpdateListsPositions,
} from "@/hooks/board";

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
    moveCard({
      cardId: draggableId,
      sourceListId: source.droppableId,
      destinationListId: destination.droppableId,
      newOrder: destination.index,
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="mb-8 text-3xl font-bold">My Board</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board" type="list" direction="horizontal">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex gap-4 overflow-x-auto pb-4"
            >
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
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

