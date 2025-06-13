import * as React from "react";

import { SearchIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { Input } from "@/components/ui/input";

const SearchInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, type, ...props }, ref) => {
  return (
    <div className="*:not-first:mt-2">
      <div className="relative">
        <Input
          className={cn("peer ps-9", className)}
          placeholder="Search..."
          type="text"
          ref={ref}
          {...props}
        />
        <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
          <SearchIcon size={16} />
        </div>
      </div>
    </div>
  );
});
SearchInput.displayName = "SearchInput";

export { SearchInput };
