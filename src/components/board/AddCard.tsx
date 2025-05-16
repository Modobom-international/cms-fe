"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";

interface AddCardProps {
  listId: string;
  onAdd: (title: string, description: string) => void;
}

export default function AddCard({ listId, onAdd }: AddCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const t = useTranslations("Board.list.addCard");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim(), description.trim());
      setTitle("");
      setDescription("");
      setIsAdding(false);
    }
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="mt-2 w-full rounded p-2 text-left hover:bg-gray-300"
      >
        + {t("button")}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t("title")}
        className="mb-2 w-full rounded border p-2"
        autoFocus
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={t("description")}
        className="mb-2 w-full rounded border p-2"
        rows={3}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
        >
          {t("button")}
        </button>
        <button
          type="button"
          onClick={() => setIsAdding(false)}
          className="rounded px-3 py-1 hover:bg-gray-200"
        >
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}
