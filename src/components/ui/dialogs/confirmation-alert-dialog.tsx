import { CircleAlertIcon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface AlertComponentProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  onConfirm: () => void;
  children: React.ReactNode;
}

export default function ConfirmationAlertDialog({
  title,
  description,
  icon,
  onConfirm,
  children,
}: AlertComponentProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
          {icon && (
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-full border"
              aria-hidden="true"
            >
              {icon ? (
                icon
              ) : (
                <CircleAlertIcon className="opacity-80" size={16} />
              )}
            </div>
          )}
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

