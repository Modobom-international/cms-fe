"use client";

import { useState } from "react";

import { Pencil, Plus, Trash2, X } from "lucide-react";

import { Label } from "@/types/board.type";

import {
  useCreateLabel,
  useDeleteLabel,
  useGetLabels,
  useUpdateLabel,
} from "@/hooks/board/label";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface LabelManagerProps {
  onSelectLabel?: (label: Label) => void;
  selectedLabels?: Label[];
}

export default function LabelManager({
  onSelectLabel,
  selectedLabels = [],
}: LabelManagerProps) {
  const { data: labels = [] } = useGetLabels();
  const { mutate: createLabel } = useCreateLabel();
  const { mutate: updateLabel } = useUpdateLabel();
  const { mutate: deleteLabel } = useDeleteLabel();

  const [isCreating, setIsCreating] = useState(false);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#000000");

  const handleCreateLabel = () => {
    if (newLabelName.trim()) {
      createLabel(
        {
          name: newLabelName.trim(),
          color: newLabelColor,
        },
        {
          onSuccess: () => {
            setNewLabelName("");
            setNewLabelColor("#000000");
            setIsCreating(false);
          },
        }
      );
    }
  };

  const handleUpdateLabel = () => {
    if (editingLabel && newLabelName.trim()) {
      updateLabel(
        {
          id: editingLabel.id,
          name: newLabelName.trim(),
          color: newLabelColor,
        },
        {
          onSuccess: () => {
            setNewLabelName("");
            setNewLabelColor("#000000");
            setEditingLabel(null);
          },
        }
      );
    }
  };

  const handleDeleteLabel = (id: number) => {
    if (window.confirm("Are you sure you want to delete this label?")) {
      deleteLabel(id);
    }
  };

  const startEditing = (label: Label) => {
    setEditingLabel(label);
    setNewLabelName(label.name);
    setNewLabelColor(label.color);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">Labels</h4>
          <p className="text-xs text-gray-500">Manage your labels</p>
        </div>
        {!isCreating && !editingLabel && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreating(true)}
            className="h-7"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Label
          </Button>
        )}
      </div>

      {(isCreating || editingLabel) && (
        <div className="space-y-3 rounded-md border bg-gray-50/50 p-3">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">
              Label Name
            </label>
            <Input
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              placeholder="Enter label name"
              className="h-8"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={newLabelColor}
                onChange={(e) => setNewLabelColor(e.target.value)}
                className="h-8 w-8 rounded border bg-white"
                title="Label color"
              />
              <div className="flex-1 rounded border bg-white p-1.5 text-xs">
                {newLabelColor}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={isCreating ? handleCreateLabel : handleUpdateLabel}
              className="h-8 flex-1"
            >
              {isCreating ? "Create" : "Update"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsCreating(false);
                setEditingLabel(null);
                setNewLabelName("");
                setNewLabelColor("#000000");
              }}
              className="h-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Separator />

      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-2">
          {labels.length === 0 ? (
            <div className="rounded-md border border-dashed p-4 text-center text-sm text-gray-500">
              No labels created yet
            </div>
          ) : (
            labels.map((label) => (
              <div
                key={label.id}
                className="group flex items-center justify-between rounded-md border bg-white p-2 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-5 w-5 rounded-full border shadow-sm"
                    style={{ backgroundColor: label.color }}
                  />
                  <span className="text-sm font-medium">{label.name}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  {onSelectLabel && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelectLabel(label)}
                      className="h-7"
                      title={
                        selectedLabels.some((l) => l.id === label.id)
                          ? "Remove label"
                          : "Add label"
                      }
                    >
                      {selectedLabels.some((l) => l.id === label.id) ? (
                        <X className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEditing(label)}
                    className="h-7"
                    title="Edit label"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteLabel(label.id)}
                    className="h-7 text-red-500 hover:text-red-600"
                    title="Delete label"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
