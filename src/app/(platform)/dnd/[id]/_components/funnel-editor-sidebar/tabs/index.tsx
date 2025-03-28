import { Database, Plus, SettingsIcon, SquareStackIcon } from "lucide-react";

import { TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {};

const TabList = (props: Props) => {
  return (
    <TabsList className="flex h-fit w-full flex-col items-center justify-evenly gap-4 bg-transparent">
      <TabsTrigger
        value="Settings"
        className="data-[state=active]:bg-muted h-10 w-10 p-0"
      >
        <SettingsIcon />
      </TabsTrigger>
      <TabsTrigger
        value="Components"
        className="data-[state=active]:bg-muted h-10 w-10 p-0"
      >
        <Plus />
      </TabsTrigger>

      <TabsTrigger
        value="Layers"
        className="data-[state=active]:bg-muted h-10 w-10 p-0"
      >
        <SquareStackIcon />
      </TabsTrigger>
      <TabsTrigger
        value="Media"
        className="data-[state=active]:bg-muted h-10 w-10 p-0"
      >
        <Database />
      </TabsTrigger>
    </TabsList>
  );
};

export default TabList;
