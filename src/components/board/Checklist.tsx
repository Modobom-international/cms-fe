"use client";

import { memo, useState } from "react";

import { Check, Plus, Trash2, X } from "lucide-react";

import { ChecklistItem } from "@/types/board.type";

interface ChecklistProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
  onToggle: (itemId: number) => void;
}

// Use memo to prevent unnecessary re-renders
const Checklist = memo(function Checklist({
  items,
  onChange,
  onToggle,
}: ChecklistProps) {
  const [newItemText, setNewItemText] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);

  const toggleItem = (id: number) => {
    onToggle(id);
  };

  const deleteItem = (id: number) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, isDeleted: true } : item
    );
    onChange(updatedItems);
  };

  const addItem = () => {
    if (newItemText.trim()) {
      const newItem: ChecklistItem = {
        id: Date.now(),
        checklist_id: items[0]?.checklist_id || 0,
        content: newItemText.trim(),
        is_completed: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        isNew: true,
      };
      onChange([...items, newItem]);
      setNewItemText("");
      setIsAddingItem(false);
    }
  };

  const updateItem = (id: number, content: string) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, content, isModified: true } : item
    );
    onChange(updatedItems);
  };

  const completedCount = items.filter(
    (item) => item.is_completed === 1 && !item.isDeleted
  ).length;
  const totalCount = items.filter((item) => !item.isDeleted).length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-medium">Checklist</h3>
        <div className="text-sm text-gray-500">
          {completedCount}/{totalCount}
        </div>
      </div>

      <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full bg-blue-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <ul className="mb-3 space-y-2">
        {items
          .filter((item) => !item.isDeleted)
          .map((item) => (
            <li key={item.id} className="flex items-center gap-2">
              <button
                onClick={() => toggleItem(item.id)}
                className={`flex h-5 w-5 items-center justify-center rounded border ${
                  item.is_completed === 1
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-gray-300"
                }`}
              >
                {item.is_completed === 1 && <Check size={12} />}
              </button>
              <input
                type="text"
                value={item.content}
                onChange={(e) => updateItem(item.id, e.target.value)}
                className={`flex-grow bg-transparent ${
                  item.is_completed === 1 ? "text-gray-500 line-through" : ""
                }`}
                title={`Edit checklist item: ${item.content}`}
              />
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
