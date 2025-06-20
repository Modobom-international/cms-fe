"use client";

import Link from "next/link";

import { AxiosError } from "axios";
import { format } from "date-fns";
import { AlertCircle, Clock, User } from "lucide-react";
import { useTranslations } from "next-intl";

import { useGetBoards } from "@/hooks/board/board";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
  const t = useTranslations("Board");
  const { workspace, boards, isLoading, error } = useGetBoards(workspaceId);

  console.log(boards);
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
          {is403Error ? t("error.403") : t("error.failedToLoadBoards")}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {workspace?.is_admin && (
          <BoardOperations workspaceId={parseInt(workspaceId)} />
        )}
      </div>

      {!boards?.length ? (
        <Alert>
          <AlertDescription>{t("errors.noBoards")}</AlertDescription>
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
                      <span>{t("owner", { id: board.owner_id })}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>
                        {t("created", {
                          date: format(
                            new Date(board.created_at),
                            "MMM d, yyyy"
                          ),
                        })}
                      </span>
                    </div>
                    {board.members && board.members.length > 0 && (
                      <div className="flex items-center">
                        <User className="mr-1 h-3 w-3" />
                        <span>
                          {t("currentMembers", { count: board.members.length })}
                        </span>
                      </div>
                    )}
                  </div>
                </CardFooter>
              </Link>
              <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                {workspace?.is_admin && (
                  <BoardOperations
                    workspaceId={parseInt(workspaceId)}
                    board={{
                      id: board.id,
                      name: board.name,
                      description: board.description || "",
                    }}
                  />
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
