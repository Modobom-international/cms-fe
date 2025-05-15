"use client";

import Link from "next/link";

import { AxiosError } from "axios";
import { format } from "date-fns";
import { AlertCircle, Clock, Globe2, Lock, User } from "lucide-react";

import { useGetBoards } from "@/hooks/board/board";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { BoardOperations } from "./BoardOperations";

interface BoardsClientProps {
  workspaceId: string;
}

export default function BoardsClient({ workspaceId }: BoardsClientProps) {
  const { boards, isLoading, error } = useGetBoards(workspaceId);
  console.log(error);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="hover:bg-accent/5">
            <CardHeader>
              <Skeleton className="h-6 w-[180px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-[250px]" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-4 w-[100px]" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    const axiosError = error as AxiosError;
    const is403Error = axiosError?.response?.status === 403;

    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {is403Error
            ? "You don't have permission to view these boards. Please check your access rights."
            : "Failed to load boards. Please try again later."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <BoardOperations workspaceId={parseInt(workspaceId)} />
      </div>

      {!boards?.length ? (
        <Alert>
          <AlertDescription>
            No boards found. Create your first board to get started.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <Card
              key={board.id}
              className="group hover:bg-accent/5 hover:border-primary/20 relative border-2 transition-colors"
            >
              <Link href={`/workspaces/${workspaceId}/boards/${board.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="line-clamp-2">
                        {board.name}
                      </CardTitle>
                      <Badge
                        variant={
                          board.visibility === "private"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {board.visibility === "private" ? (
                          <Lock className="text-muted-foreground mr-1 h-3 w-3" />
                        ) : (
                          <Globe2 className="text-muted-foreground mr-1 h-3 w-3" />
                        )}
                        {board.visibility}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-2 text-sm">
                    {board.description || "No description"}
                  </p>
                </CardContent>
                <CardFooter className="text-muted-foreground text-xs">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <User className="mr-1 h-3 w-3" />
                      <span>Owner #{board.owner_id}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>
                        Created{" "}
                        {format(new Date(board.created_at), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                </CardFooter>
              </Link>
              <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                <BoardOperations
                  workspaceId={parseInt(workspaceId)}
                  board={{
                    id: board.id,
                    name: board.name,
                    description: board.description || "",
                    visibility: board.visibility,
                  }}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
