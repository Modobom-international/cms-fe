"use client";

import React from "react";

import Link from "next/link";

import {
  EditorBtns,
  EditorElement,
  useEditor,
} from "@/providers/editor/editor-provider";
import clsx from "clsx";
import { Trash } from "lucide-react";

import { Badge } from "@/components/ui/badge";

type Props = {
  element: EditorElement;
};

const LinkComponent = (props: Props) => {
  const { dispatch, state } = useEditor();
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Initialize and update content
  React.useEffect(() => {
    if (contentRef.current && !Array.isArray(props.element.content)) {
      // Only update if content has changed
      if (contentRef.current.textContent !== props.element.content.innerText) {
        contentRef.current.textContent = props.element.content.innerText || "";
      }
    }
  }, [props.element.content]);

  const handleDragStart = (e: React.DragEvent, type: EditorBtns) => {
    if (type === null) return;
    e.dataTransfer.setData("componentType", type);
  };

  const handleOnClickBody = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({
      type: "CHANGE_CLICKED_ELEMENT",
      payload: {
        elementDetails: props.element,
      },
    });
  };

  const styles = props.element.styles;

  const handleDeleteElement = () => {
    dispatch({
      type: "DELETE_ELEMENT",
      payload: { elementDetails: props.element },
    });
  };

  return (
    <div
      style={styles}
      draggable
      onDragStart={(e) => handleDragStart(e, "text")}
      onClick={handleOnClickBody}
      className={clsx(
        "relative m-[5px] w-full p-[2px] text-[16px] transition-all",
        {
          "!border-blue-500":
            state.editor.selectedElement.id === props.element.id,

          "!border-solid": state.editor.selectedElement.id === props.element.id,
          "border-[1px] border-dashed border-slate-300": !state.editor.liveMode,
        }
      )}
    >
      {state.editor.selectedElement.id === props.element.id &&
        !state.editor.liveMode && (
          <Badge className="absolute -top-[23px] -left-[1px] rounded-none rounded-t-lg">
            {state.editor.selectedElement.name}
          </Badge>
        )}
      {!Array.isArray(props.element.content) &&
        (state.editor.previewMode || state.editor.liveMode) && (
          <Link href={props.element.content.href || "#"}>
            <div>{props.element.content.innerText}</div>
          </Link>
        )}
      {!state.editor.previewMode && !state.editor.liveMode && (
        <div
          ref={contentRef}
          contentEditable={true}
          suppressContentEditableWarning={true}
          onBlur={(e) => {
            const content = e.target.textContent || "";
            dispatch({
              type: "UPDATE_ELEMENT",
              payload: {
                elementDetails: {
                  ...props.element,
                  content: {
                    ...(!Array.isArray(props.element.content)
                      ? props.element.content
                      : {}),
                    innerText: content,
                  },
                },
              },
            });
          }}
          className="w-full outline-none"
        />
      )}
      {state.editor.selectedElement.id === props.element.id &&
        !state.editor.liveMode && (
          <div className="bg-primary absolute -top-[25px] -right-[1px] rounded-none rounded-t-lg px-2.5 py-1 text-xs font-bold !text-white">
            <Trash
              className="cursor-pointer"
              size={16}
              onClick={handleDeleteElement}
            />
          </div>
        )}
    </div>
  );
};

export default LinkComponent;
