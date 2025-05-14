"use client";

import { useState } from "react";

import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
      <Button
        variant="outline"
        size="lg"
        className="bg-muted/50 h-fit w-80 justify-start gap-2 border-dashed"
        onClick={() => setIsAdding(true)}
      >
        <Plus className="h-4 w-4" />
        Add another list
      </Button>
    );
  }

  return (
    <Card className="bg-muted/50 w-80">
      <CardHeader className="pb-2">
        <form onSubmit={handleSubmit} className="space-y-2">
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter list title..."
            className="h-8 text-sm"
            autoFocus
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm">
              Add List
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAdding(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardHeader>
    </Card>
  );
}

