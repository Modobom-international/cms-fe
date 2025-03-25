"use client";

import { useState } from "react";

interface AddListProps {
  onAdd: (title: string) => void;
}

export default function AddList({ onAdd }: AddListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim());
      setTitle("");
      setIsAdding(false);
    }
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="h-fit w-72 rounded bg-gray-200 p-2 text-left hover:bg-gray-300"
      >
        + Add another list
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-72">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter list title..."
        className="mb-2 w-full rounded border p-2"
        autoFocus
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
        >
          Add List
        </button>
        <button
          type="button"
          onClick={() => setIsAdding(false)}
          className="rounded px-3 py-1 hover:bg-gray-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
