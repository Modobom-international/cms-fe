"use client";

import { useState } from "react";

import { X } from "lucide-react";

import { Card } from "@/types/board";

interface CardDetailProps {
  card: Card;
  onClose: () => void;
  onUpdate: (updatedCard: Card) => void;
  onDelete: () => void;
}

export default function CardDetail({
  card,
  onClose,
  onUpdate,
  onDelete,
}: CardDetailProps) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onUpdate({
        ...card,
        title: title.trim(),
        description: description.trim(),
      });
      setIsEditing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          {isEditing ? (
            <input
              title="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded border p-2 text-xl font-bold"
              autoFocus
            />
          ) : (
            <h2 className="text-xl font-bold">{card.title}</h2>
          )}
          <button
            title="close"
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <p className="mb-2 text-sm font-medium text-gray-700">Description</p>
          {isEditing ? (
            <textarea
              title="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded border p-2"
              rows={5}
            />
          ) : (
            <p
              className="cursor-pointer rounded p-2 text-gray-600 hover:bg-gray-100"
              onClick={() => setIsEditing(true)}
            >
              {card.description || "Add a more detailed description..."}
            </p>
          )}
        </div>

        <div className="flex justify-between">
          {isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setTitle(card.title);
                  setDescription(card.description);
                  setIsEditing(false);
                }}
                className="rounded px-3 py-1 hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="rounded bg-gray-200 px-3 py-1 hover:bg-gray-300"
            >
              Edit
            </button>
          )}
          <button
            onClick={onDelete}
            className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
