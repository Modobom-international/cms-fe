"use client";

import { useState } from "react";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface AddListProps {
  onAdd: (title: string) => void;
}

export default function AddList({ onAdd }: AddListProps) {
  const t = useTranslations("Board.addList");
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
        size="sm"
        className="h-10 w-72 justify-start gap-2 border-2 border-dashed border-gray-300/50 bg-white/40 hover:border-gray-300/80 hover:bg-white/60"
        onClick={() => setIsAdding(true)}
      >
        <Plus className="h-4 w-4" />
        {t("button")}
      </Button>
    );
  }

  return (
    <Card className="w-72 bg-gray-100/80 backdrop-blur-sm">
      <CardHeader className="space-y-2 p-3">
        <form onSubmit={handleSubmit} className="space-y-2">
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("title")}
            className="h-7 bg-white/80 text-sm"
            autoFocus
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" className="h-7 text-xs">
              <Plus className="mr-1 h-3.5 w-3.5" />
              {t("submit")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAdding(false)}
              className="h-7 text-xs"
            >
              {t("cancel")}
            </Button>
          </div>
        </form>
      </CardHeader>
    </Card>
  );
}
