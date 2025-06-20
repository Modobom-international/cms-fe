import { StorageContent } from "@/components/storage/storage-content";

export default function StoragePage() {
  return (
    <div className="flex flex-col py-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              File Storage
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage your files and folders with cloud storage capabilities
            </p>
          </div>
        </div>
      </div>

      {/* Storage Content */}
      <div className="h-full">
        <StorageContent />
      </div>
    </div>
  );
}

