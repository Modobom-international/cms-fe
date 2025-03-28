"use client";

import React from "react";

import { EditorElement, useEditor } from "@/providers/editor/editor-provider";
import clsx from "clsx";
import { Trash } from "lucide-react";

import { Badge } from "@/components/ui/badge";

type Props = {
  element: EditorElement;
};

const TextComponent = (props: Props) => {
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

  const handleDeleteElement = () => {
    dispatch({
      type: "DELETE_ELEMENT",
      payload: { elementDetails: props.element },
    });
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

  //WE ARE NOT ADDING DRAG DROP
  return (
    <div
      style={props.element.styles}
      className={clsx(
        "relative m-[5px] w-full p-[2px] text-[16px] transition-all",
        {
          "!border-blue-500":
            state.editor.selectedElement.id === props.element.id,

          "!border-solid": state.editor.selectedElement.id === props.element.id,
          "border-[1px] border-dashed border-slate-300": !state.editor.liveMode,
        }
      )}
      onClick={handleOnClickBody}
    >
      {state.editor.selectedElement.id === props.element.id &&
        !state.editor.liveMode && (
          <Badge className="absolute -top-[23px] -left-[1px] rounded-none rounded-t-lg">
            {state.editor.selectedElement.name}
          </Badge>
        )}

      {/* Live/Preview Mode */}
      {(state.editor.liveMode || state.editor.previewMode) && (
        <div>
          {!Array.isArray(props.element.content) &&
            props.element.content.innerText}
        </div>
      )}

      {/* Edit Mode */}
      {!state.editor.liveMode && !state.editor.previewMode && (
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

export default TextComponent;
