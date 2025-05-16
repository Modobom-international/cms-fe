"use client";

import { useState } from "react";

import { MoreHorizontal, Pencil, Plus, Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Board, CreateBoardDto, UpdateBoardDto } from "@/types/board.type";

import {
  useCreateBoard,
  useDeleteBoard,
  useUpdateBoard,
} from "@/hooks/board/board";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { BoardForm } from "./BoardForm";

interface BoardOperationsProps {
  workspaceId: number;
  board?: Pick<Board, "id" | "name" | "description">;
}

export function BoardOperations({ workspaceId, board }: BoardOperationsProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const t = useTranslations("Board");

  const createMutation = useCreateBoard();
  const updateMutation = useUpdateBoard();
  const deleteMutation = useDeleteBoard();

  const onSubmit = async (data: CreateBoardDto | UpdateBoardDto) => {
    try {
      if (board) {
        updateMutation.mutate(
          { boardId: board.id, data },
          {
            onSuccess: () => {
              toast.success(t("operations.updateSuccess"));
              setIsFormOpen(false);
            },
            onError: () => {
              toast.error(t("operations.updateError"));
            },
          }
        );
      } else {
        createMutation.mutate(data as CreateBoardDto, {
          onSuccess: () => {
            toast.success(t("operations.createSuccess"));
            setIsFormOpen(false);
          },
          onError: () => {
            toast.error(t("operations.createError"));
          },
        });
      }
    } catch (error) {
      toast.error(t("operations.genericError"));
    }
  };

  const onDelete = async () => {
    if (!board) return;

    try {
      deleteMutation.mutate(board.id, {
        onSuccess: () => {
          toast.success(t("operations.deleteSuccess"));
          setIsDeleteOpen(false);
        },
        onError: () => {
          toast.error(t("operations.deleteError"));
        },
      });
    } catch (error) {
      toast.error(t("operations.genericError"));
    }
  };

  if (board) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsFormOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              {t("operations.edit")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setIsDeleteOpen(true)}
              className="text-red-600"
            >
              <Trash className="mr-2 h-4 w-4" />
              {t("operations.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("operations.deleteTitle")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("operations.deleteDescription")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("operations.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className="bg-red-600"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending
                  ? t("operations.deleting")
                  : t("operations.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("operations.editTitle")}</DialogTitle>
            </DialogHeader>
            <BoardForm
              initialData={board}
              workspaceId={workspaceId}
              onSubmit={onSubmit}
              isLoading={updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t("operations.createBoard")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("operations.createTitle")}</DialogTitle>
        </DialogHeader>
        <BoardForm
          workspaceId={workspaceId}
          onSubmit={onSubmit}
          isLoading={createMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
