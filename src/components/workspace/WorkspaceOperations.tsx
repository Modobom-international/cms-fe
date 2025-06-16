"use client";

import { useState } from "react";

import { MoreHorizontal, Pencil, Plus, Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  visibilityToNumber,
} from "@/types/workspaces.type";

import {
  useCreateWorkspace,
  useDeleteWorkspace,
  useUpdateWorkspace,
} from "@/hooks/workspace";

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

import { WorkspaceForm } from "./WorkspaceForm";

interface WorkspaceOperationsProps {
  workspace?: {
    id: number;
    name: string;
    description: string;
    visibility: "private" | "public";
    owner: {
      id: number;
      name: string;
      email: string;
    };
  };
}

export function WorkspaceOperations({ workspace }: WorkspaceOperationsProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const t = useTranslations("Workspace");

  const createMutation = useCreateWorkspace();
  const updateMutation = useUpdateWorkspace();
  const deleteMutation = useDeleteWorkspace();

  const onSubmit = async (data: CreateWorkspaceDto | UpdateWorkspaceDto) => {
    try {
      if (workspace) {
        updateMutation.mutate(
          { id: workspace.id, data },
          {
            onSuccess: (response) => {
              toast.success(t("operations.updateSuccess"));
              setIsFormOpen(false);
            },
            onError: () => {
              toast.error(t("errors.updateFailed"));
            },
          }
        );
      } else {
        createMutation.mutate(data as CreateWorkspaceDto, {
          onSuccess: (response) => {
            toast.success(t("operations.createSuccess"));
            setIsFormOpen(false);
          },
          onError: () => {
            toast.error(t("errors.createFailed"));
          },
        });
      }
    } catch (error) {
      toast.error(t("errors.generic"));
    }
  };

  const onDelete = async () => {
    if (!workspace) return;

    try {
      deleteMutation.mutate(workspace.id, {
        onSuccess: (response) => {
          toast.success(t("operations.deleteSuccess"));
          setIsDeleteOpen(false);
        },
        onError: () => {
          toast.error(t("errors.deleteFailed"));
        },
      });
    } catch (error) {
      toast.error(t("errors.generic"));
    }
  };

  if (workspace) {
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
              {t("actions.edit")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setIsDeleteOpen(true)}
              className="text-red-600"
            >
              <Trash className="mr-2 h-4 w-4" />
              {t("actions.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("delete.title")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("delete.description")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("delete.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className="bg-red-600"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending
                  ? t("delete.deleting")
                  : t("delete.confirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("edit.title")}</DialogTitle>
            </DialogHeader>
            <WorkspaceForm
              initialData={{
                ...workspace,
                visibility: visibilityToNumber(workspace.visibility),
              }}
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
          {t("create.button")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("create.title")}</DialogTitle>
        </DialogHeader>
        <WorkspaceForm
          onSubmit={onSubmit}
          isLoading={createMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
