export interface IStorageItem {
    id: string;
    name: string;
    type: 'file' | 'folder';
    size: number;
    modifiedDate: string;
    createdDate: string;
    owner: string;
    shared: boolean;
    mimeType: string;
    thumbnail?: string;
    path: string;
    parentId?: string;
}

export interface IFolderItem extends IStorageItem {
    type: 'folder';
    itemCount: number;
}

export interface IFileItem extends IStorageItem {
    type: 'file';
    downloadUrl: string;
    previewUrl?: string;
}

export interface IBreadcrumbItem {
    id: string;
    name: string;
    path: string;
}

export interface IStorageStats {
    totalItems: number;
    totalSize: number;
    usedSpace: number;
    maxSpace: number;
    folderCount: number;
    fileCount: number;
}

export type IStorageViewMode = 'grid' | 'list';
export type IStorageSortBy = 'name' | 'size' | 'modified' | 'type';
export type IStorageSortOrder = 'asc' | 'desc';