"use client";

import { FocusEventHandler, useEffect } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  DeviceTypes,
  FunnelPage,
  useEditor,
} from "@/providers/editor/editor-provider";
import clsx from "clsx";
import {
  ArrowLeftCircle,
  EyeIcon,
  Laptop,
  Redo2,
  Smartphone,
  Tablet,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  funnelId: string;
  funnelPageDetails: FunnelPage;
  subaccountId: string;
};

const FunnelEditorNavigation = ({
  funnelId,
  funnelPageDetails,
  subaccountId,
}: Props) => {
  const router = useRouter();
  const { state, dispatch } = useEditor();

  useEffect(() => {
    dispatch({
      type: "SET_FUNNELPAGE_ID",
      payload: { funnelPageId: funnelPageDetails.id },
    });
  }, [funnelPageDetails]);

  const handleOnBlurTitleChange: FocusEventHandler<HTMLInputElement> = async (
    event
  ) => {
    if (event.target.value === funnelPageDetails.name) return;
    if (event.target.value) {
      console.log("Updating funnel page:", {
        id: funnelPageDetails.id,
        name: event.target.value,
        order: funnelPageDetails.order,
      });

      toast("Success", {
        description: "Saved Funnel Page title",
      });
      router.refresh();
    } else {
      toast("Oppse!", {
        description: "You need to have a title!",
      });
      event.target.value = funnelPageDetails.name;
    }
  };

  const handlePreviewClick = () => {
    dispatch({ type: "TOGGLE_PREVIEW_MODE" });
    dispatch({ type: "TOGGLE_LIVE_MODE" });
  };

  const handleUndo = () => {
    dispatch({ type: "UNDO" });
  };

  const handleRedo = () => {
    dispatch({ type: "REDO" });
  };

  const handleOnSave = async () => {
    const content = JSON.stringify(state.editor.elements);
    try {
      console.log("Saving funnel page:", {
        ...funnelPageDetails,
        content,
      });
      console.log("Activity log:", {
        description: `Updated a funnel page | ${funnelPageDetails.name}`,
        subaccountId: subaccountId,
      });

      toast("Success", {
        description: "Saved Editor",
      });
    } catch (error) {
      toast("Oppse!", {
        description: "Could not save editor",
      });
    }
  };

  return (
    <TooltipProvider>
      <nav
        className={clsx(
          "flex items-center justify-between gap-2 border-b-[1px] p-6 transition-all",
          { "!h-0 !overflow-hidden !p-0": state.editor.previewMode }
        )}
      >
        <aside className="flex w-[300px] max-w-[260px] items-center gap-4">
          <Link href={`/subaccount/${subaccountId}/funnels/${funnelId}`}>
            <ArrowLeftCircle />
          </Link>
          <div className="flex w-full flex-col">
            <Input
              defaultValue={funnelPageDetails.name}
              className="m-0 h-5 border-none p-0 text-lg"
              onBlur={handleOnBlurTitleChange}
            />
            <span className="text-muted-foreground text-sm">
              Path: /{funnelPageDetails.pathName}
            </span>
          </div>
        </aside>
        <aside>
          <Tabs
            defaultValue="Desktop"
            className="w-fit"
            value={state.editor.device}
            onValueChange={(value) => {
              dispatch({
                type: "CHANGE_DEVICE",
                payload: { device: value as DeviceTypes },
              });
            }}
          >
            <TabsList className="grid h-fit w-full grid-cols-3 bg-transparent">
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value="Desktop"
                    className="data-[state=active]:bg-muted h-10 w-10 p-0"
                  >
                    <Laptop />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Desktop</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value="Tablet"
                    className="data-[state=active]:bg-muted h-10 w-10 p-0"
                  >
                    <Tablet />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Tablet</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value="Mobile"
                    className="data-[state=active]:bg-muted h-10 w-10 p-0"
                  >
                    <Smartphone />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mobile</p>
                </TooltipContent>
              </Tooltip>
            </TabsList>
          </Tabs>
        </aside>
        <aside className="flex items-center gap-2">
          <Button
            variant={"ghost"}
            size={"icon"}
            className="hover:bg-slate-800"
            onClick={handlePreviewClick}
          >
            <EyeIcon />
          </Button>
          <Button
            disabled={!(state.history.currentIndex > 0)}
            onClick={handleUndo}
            variant={"ghost"}
            size={"icon"}
            className="hover:bg-slate-800"
          >
            <Undo2 />
          </Button>
          <Button
            disabled={
              !(state.history.currentIndex < state.history.history.length - 1)
            }
            onClick={handleRedo}
            variant={"ghost"}
            size={"icon"}
            className="mr-4 hover:bg-slate-800"
          >
            <Redo2 />
          </Button>
          <div className="item-center mr-4 flex flex-col">
            <div className="flex flex-row items-center gap-4">
              Draft
              <Switch disabled defaultChecked={true} />
              Publish
            </div>
            <span className="text-muted-foreground text-sm">
              Last updated {funnelPageDetails.updatedAt.toLocaleDateString()}
            </span>
          </div>
          <Button onClick={handleOnSave}>Save</Button>
        </aside>
      </nav>
    </TooltipProvider>
  );
};

export default FunnelEditorNavigation;
