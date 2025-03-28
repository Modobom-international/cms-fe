import React from "react";

import { redirect } from "next/navigation";

import EditorProvider from "@/providers/editor/editor-provider";

import FunnelEditor from "@/app/(platform)/dnd/[id]/_components/funnel-editor";
import FunnelEditorNavigation from "@/app/(platform)/dnd/[id]/_components/funnel-editor-navigation";
import FunnelEditorSidebar from "@/app/(platform)/dnd/[id]/_components/funnel-editor-sidebar";

type Props = {
  params: {
    subaccountId: string;
    funnelId: string;
    funnelPageId: string;
  };
};

const Page = async ({ params }: Props) => {
  // Mock data instead of DB query
  const funnelPageDetails = {
    id: "fpg_01HQ2XYZABC",
    name: "Landing Page",
    pathName: "/landing",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-15"),
    visits: 0,
    content: null,
    order: 1,
    previewImage: null,
    funnelId: "fn_01HQ2XYZDEF",
  };

  if (!funnelPageDetails) {
    return redirect(
      `/subaccount/${params.subaccountId}/funnels/${params.funnelId}`
    );
  }

  return (
    <div className="bg-background fixed top-0 right-0 bottom-0 left-0 z-[20] overflow-hidden">
      <EditorProvider
        subaccountId={"sub_01HQ2XYZABC"}
        funnelId={"fn_01HQ2XYZDEF"}
        pageDetails={funnelPageDetails}
      >
        <FunnelEditorNavigation
          funnelId={"fn_01HQ2XYZDEF"}
          funnelPageDetails={funnelPageDetails}
          subaccountId={"sub_01HQ2XYZABC"}
        />
        <div className="flex h-full justify-center">
          <FunnelEditor funnelPageId={"fpg_01HQ2XYZABC"} />
        </div>

        <FunnelEditorSidebar subaccountId={"sub_01HQ2XYZABC"} />
      </EditorProvider>
    </div>
  );
};

export default Page;
