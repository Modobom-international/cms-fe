"use client";

import { useState } from "react";

import { DragDropContext, Droppable } from "@hello-pangea/dnd";

import { Card, List } from "@/types/board";

import AddList from "@/components/board/AddList";
import BoardList from "@/components/board/BoardList";

export default function BoardPage() {
  const [lists, setLists] = useState<List[]>([
    {
      id: "1",
      title: "To Do",
      cards: [
        { id: "1", title: "Task 1", description: "Description 1" },
        { id: "2", title: "Task 2", description: "Description 2" },
      ],
    },
    {
      id: "2",
      title: "In Progress",
      cards: [],
    },
    {
      id: "3",
      title: "Done",
      cards: [],
    },
  ]);

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
      const newLists = Array.from(lists);
      const [removed] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, removed);
      setLists(newLists);
      return;
    }

    // Handle card movement
    const sourceList = lists.find((list) => list.id === source.droppableId);
    const destList = lists.find((list) => list.id === destination.droppableId);

    if (!sourceList || !destList) return;

    // Moving within the same list
    if (source.droppableId === destination.droppableId) {
      const newCards = Array.from(sourceList.cards);
      const [removed] = newCards.splice(source.index, 1);
      newCards.splice(destination.index, 0, removed);

      const newLists = lists.map((list) =>
        list.id === sourceList.id ? { ...list, cards: newCards } : list
      );
      setLists(newLists);
    } else {
      // Moving to different list
      const sourceCards = Array.from(sourceList.cards);
      const [removed] = sourceCards.splice(source.index, 1);
      const destinationCards = Array.from(destList.cards);
      destinationCards.splice(destination.index, 0, removed);

      const newLists = lists.map((list) => {
        if (list.id === source.droppableId) {
          return { ...list, cards: sourceCards };
        }
        if (list.id === destination.droppableId) {
          return { ...list, cards: destinationCards };
        }
        return list;
      });
      setLists(newLists);
    }
  };

  const handleAddCard = (
    listId: string,
    title: string,
    description: string
  ) => {
    const newLists = lists.map((list) => {
      if (list.id === listId) {
        return {
          ...list,
          cards: [
            ...list.cards,
            {
              id: String(Date.now()),
              title,
              description,
            },
          ],
        };
      }
      return list;
    });
    setLists(newLists);
  };

  const handleUpdateCard = (listId: string, updatedCard: Card) => {
    const newLists = lists.map((list) => {
      if (list.id === listId) {
        return {
          ...list,
          cards: list.cards.map((card) =>
            card.id === updatedCard.id ? updatedCard : card
          ),
        };
      }
      return list;
    });
    setLists(newLists);
  };

  const handleDeleteCard = (listId: string, cardId: string) => {
    const newLists = lists.map((list) => {
      if (list.id === listId) {
        return {
          ...list,
          cards: list.cards.filter((card) => card.id !== cardId),
        };
      }
      return list;
    });
    setLists(newLists);
  };

  const handleDeleteList = (listId: string) => {
    setLists(lists.filter((list) => list.id !== listId));
  };

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
                  onAddCard={(title, description) =>
                    handleAddCard(list.id, title, description)
                  }
                  onUpdateCard={handleUpdateCard}
                  onDeleteCard={handleDeleteCard}
                  onDeleteList={handleDeleteList}
                />
              ))}
              {provided.placeholder}
              <AddList
                onAdd={(title) => {
                  setLists([
                    ...lists,
                    {
                      id: String(Date.now()),
                      title,
                      cards: [],
                    },
                  ]);
                }}
              />
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
