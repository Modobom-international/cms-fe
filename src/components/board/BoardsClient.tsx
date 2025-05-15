"use client";

import Link from "next/link";

import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Board {
  id: number;
  title: string;
  description: string;
}

interface BoardsClientProps {
  workspaceId: string;
  boards: Board[];
}

export default function BoardsClient({
  workspaceId,
  boards,
}: BoardsClientProps) {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Boards</h2>
        <Button size="sm">
          <PlusIcon className="mr-2 h-4 w-4" />
          Create Board
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {boards.map((board) => (
          <Link
            key={board.id}
            href={`/workspaces/${workspaceId}/boards/${board.id}`}
          >
            <Card className="hover:bg-accent/5">
              <CardHeader>
                <CardTitle>{board.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  {board.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
