"use client";

import { memo, useState } from "react";

import { Check, Plus, Trash2, X } from "lucide-react";

import { ChecklistItem } from "@/types/board";

interface ChecklistProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
}

// Use memo to prevent unnecessary re-renders
const Checklist = memo(function Checklist({ items, onChange }: ChecklistProps) {
  const [newItemText, setNewItemText] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);

  const toggleItem = (id: string) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    onChange(updatedItems);
  };

  const deleteItem = (id: string) => {
    const updatedItems = items.filter((item) => item.id !== id);
    onChange(updatedItems);
  };

  const addItem = () => {
    if (newItemText.trim()) {
      const newItem: ChecklistItem = {
        id: String(Date.now()),
        text: newItemText.trim(),
        completed: false,
      };
      onChange([...items, newItem]);
      setNewItemText("");
      setIsAddingItem(false);
    }
  };

  const completedCount = items.filter((item) => item.completed).length;
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-medium">Checklist</h3>
        <div className="text-sm text-gray-500">
          {completedCount}/{items.length}
        </div>
      </div>

      <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full bg-blue-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <ul className="mb-3 space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-2">
            <button
              onClick={() => toggleItem(item.id)}
              className={`flex h-5 w-5 items-center justify-center rounded border ${
                item.completed
                  ? "border-green-500 bg-green-500 text-white"
                  : "border-gray-300"
              }`}
            >
              {item.completed && <Check size={12} />}
            </button>
            <span
              className={`flex-grow ${
                item.completed ? "text-gray-500 line-through" : ""
              }`}
            >
              {item.text}
            </span>
            <button
              onClick={() => deleteItem(item.id)}
              className="text-gray-400 hover:text-red-500"
              title="Delete item"
            >
              <Trash2 size={14} />
            </button>
          </li>
        ))}
      </ul>

      {isAddingItem ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Add an item..."
            className="flex-grow rounded border p-2 text-sm"
            autoFocus
          />
          <button
            onClick={addItem}
            className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
          >
            Add
          </button>
          <button
            title="Close"
            onClick={() => setIsAddingItem(false)}
            className="rounded-full p-1 hover:bg-gray-200"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingItem(true)}
          className="flex items-center gap-1 rounded p-1 text-sm text-gray-600 hover:bg-gray-200"
        >
          <Plus size={14} />
          Add an item
        </button>
      )}
    </div>
  );
});

export default Checklist;
