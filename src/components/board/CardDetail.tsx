"use client";

import { useCallback, useEffect, useState } from "react";

import { format } from "date-fns";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
// Import highlight.js CSS for syntax highlighting
import { Calendar, CheckSquare, Clock, X } from "lucide-react";

import { Card, ChecklistItem } from "@/types/board";

import Checklist from "./Checklist";
import RichTextEditor from "./RichTextEditor";

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
  const [description, setDescription] = useState(card.description || "");
  const [dueDate, setDueDate] = useState<string | undefined>(card.dueDate);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    card.checklist || []
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const handleChecklistChange = useCallback(
    (updatedChecklist: ChecklistItem[]) => {
      setChecklist(updatedChecklist);
    },
    []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onUpdate({
        ...card,
        title: title.trim(),
        description,
        dueDate,
        checklist,
      });
      setIsEditing(false);
    }
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDueDate(e.target.value);
  };

  const handleClose = () => {
    if (
      title !== card.title ||
      description !== (card.description || "") ||
      dueDate !== card.dueDate ||
      JSON.stringify(checklist) !== JSON.stringify(card.checklist || [])
    ) {
      onUpdate({
        ...card,
        title,
        description,
        dueDate,
        checklist,
      });
    }
    onClose();
  };

  // Apply syntax highlighting to code blocks when not in edit mode
  useEffect(() => {
    if (!isEditing) {
      document.querySelectorAll("pre code").forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });
    }
  }, [isEditing, description]);

  const formatDueDate = (dateString?: string) => {
    if (!dateString) return "No due date";
    try {
      return format(new Date(dateString), "PPP");
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
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
            onClick={handleClose}
            className="rounded-full p-1 hover:bg-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
          {dueDate ? (
            <div className="flex items-center gap-1 rounded bg-gray-100 px-2 py-1">
              <Clock size={14} />
              <span>Due: {formatDueDate(dueDate)}</span>
            </div>
          ) : null}
        </div>

        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <p className="text-sm font-medium text-gray-700">Description</p>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300"
              >
                Edit
              </button>
            )}
          </div>
          {isEditing ? (
            <RichTextEditor content={description} onChange={setDescription} />
          ) : (
            <div
              className="prose prose-sm max-w-none rounded bg-gray-50 p-3"
              dangerouslySetInnerHTML={{
                __html: description || "<p>No description</p>",
              }}
            />
          )}
        </div>

        {isEditing && (
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Due Date
            </label>
            <div className="flex items-center gap-2">
              <input
                title="due date"
                type="date"
                value={dueDate?.split("T")[0] || ""}
                onChange={handleDueDateChange}
                className="rounded border p-2"
              />
              {dueDate && (
                <button
                  onClick={() => setDueDate(undefined)}
                  className="rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        <div className="mb-6">
          <Checklist items={checklist} onChange={handleChecklistChange} />
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
                  setDescription(card.description || "");
                  setDueDate(card.dueDate);
                  setChecklist(card.checklist || []);
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
