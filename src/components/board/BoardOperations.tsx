"use client";

import { useState } from "react";

import { MoreHorizontal, Pencil, Plus, Trash } from "lucide-react";
import { toast } from "sonner";

import { Board, CreateBoardDto, UpdateBoardDto } from "@/types/board";

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
  board?: Pick<Board, "id" | "name" | "description" | "visibility">;
}

export function BoardOperations({ workspaceId, board }: BoardOperationsProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const createMutation = useCreateBoard();
  const updateMutation = useUpdateBoard();
  const deleteMutation = useDeleteBoard();

  const onSubmit = async (data: CreateBoardDto | UpdateBoardDto) => {
    try {
      if (board) {
        updateMutation.mutate(
          { boardId: board.id, data },
          {
            onSuccess: (response) => {
              toast.success(response.message);
              setIsFormOpen(false);
            },
            onError: () => {
              toast.error("Failed to update board");
            },
          }
        );
      } else {
        createMutation.mutate(data as CreateBoardDto, {
          onSuccess: (response) => {
            toast.success(response.message);
            setIsFormOpen(false);
          },
          onError: () => {
            toast.error("Failed to create board");
          },
        });
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const onDelete = async () => {
    if (!board) return;

    try {
      deleteMutation.mutate(board.id, {
        onSuccess: (response) => {
          toast.success(response.message);
          setIsDeleteOpen(false);
        },
        onError: () => {
          toast.error("Failed to delete board");
        },
      });
    } catch (error) {
      toast.error("Something went wrong");
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
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setIsDeleteOpen(true)}
              className="text-red-600"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Board</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                board and all its data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className="bg-red-600"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Board</DialogTitle>
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
          Create Board
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Board</DialogTitle>
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
