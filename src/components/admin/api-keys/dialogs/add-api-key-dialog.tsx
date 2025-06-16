"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AddApiKeyDialogProps {
  trigger: React.ReactNode;
}

export default function AddApiKeyDialog({ trigger }: AddApiKeyDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create API Key</DialogTitle>
          <DialogDescription>
            Create a new API key to access your application programmatically.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
