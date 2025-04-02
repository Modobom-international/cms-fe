"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Spinner } from "@/components/global/spinner";

export default function LogoutDialog({ isOpen }: { isOpen: boolean }) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="flex w-72 flex-col items-center justify-center">
        <AlertDialogTitle hidden></AlertDialogTitle>
        <Spinner noPadding />
        <p className="text-muted-foreground text-base">Signing out...</p>
      </AlertDialogContent>
    </AlertDialog>
  );
}
