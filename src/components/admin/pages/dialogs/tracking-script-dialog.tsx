"use client";

import { useState } from "react";

import Editor from "@monaco-editor/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  useDeleteTrackingScript,
  useGetTrackingScript,
  useUpdateTrackingScript,
} from "@/hooks/pages";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import { Spinner } from "@/components/global/spinner";

interface TrackingScriptDialogProps {
  pageId: string;
  pageName: string;
}

export default function TrackingScriptDialog({
  pageId,
  pageName,
}: TrackingScriptDialogProps) {
  const t = useTranslations("Studio.Sites.Pages");
  const [open, setOpen] = useState(false);
  const [script, setScript] = useState("");

  const { data: trackingScript } = useGetTrackingScript(pageId);
  const updateTrackingScript = useUpdateTrackingScript();
  const deleteTrackingScript = useDeleteTrackingScript();

  const handleSave = async () => {
    try {
      await toast.promise(
        updateTrackingScript.mutateAsync({
          pageId,
          data: { tracking_script: script },
        }),
        {
          loading: t("TrackingScript.Toast.Loading"),
          success: t("TrackingScript.Toast.Success"),
          error: t("TrackingScript.Toast.Error"),
        }
      );
      setOpen(false);
    } catch (err) {
      console.error("Error updating tracking script:", err);
    }
  };

  const handleDelete = async () => {
    try {
      await toast.promise(deleteTrackingScript.mutateAsync(pageId), {
        loading: t("TrackingScript.Delete.Toast.Loading"),
        success: t("TrackingScript.Delete.Toast.Success"),
        error: t("TrackingScript.Delete.Toast.Error"),
      });
      setScript("");
      setOpen(false);
    } catch (err) {
      console.error("Error deleting tracking script:", err);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    setScript(value || "");
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setScript(trackingScript?.data?.tracking_script || "");
    }
    setOpen(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="cursor-pointer">
          {t("List.Table.TrackingScript")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {t("TrackingScript.Dialog.Title", { pageName })}
          </DialogTitle>
          <DialogDescription>
            {t("TrackingScript.Dialog.Description")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="tracking-script">
              {t("TrackingScript.Dialog.Label")}
            </Label>
            <div className="overflow-hidden rounded-md border">
              <Editor
                height="300px"
                defaultLanguage="javascript"
                value={script}
                onChange={handleEditorChange}
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                  lineNumbers: "on",
                  wordWrap: "on",
                  automaticLayout: true,
                }}
                theme="vs-light"
              />
            </div>
            <p className="text-muted-foreground text-xs">
              {t("TrackingScript.Dialog.Help")}
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2 space-x-2 sm:gap-0">
          {trackingScript && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteTrackingScript.isPending}
              className="w-full sm:w-auto"
            >
              {deleteTrackingScript.isPending ? (
                <>
                  <Spinner />
                  {t("TrackingScript.Delete.Dialog.Deleting")}
                </>
              ) : (
                t("TrackingScript.Delete.Dialog.Confirm")
              )}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="w-full sm:w-auto"
          >
            {t("TrackingScript.Dialog.Cancel")}
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateTrackingScript.isPending}
            className="w-full sm:w-auto"
          >
            {updateTrackingScript.isPending ? (
              <>
                <Spinner />
                {t("TrackingScript.Dialog.Saving")}
              </>
            ) : (
              t("TrackingScript.Dialog.Save")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
