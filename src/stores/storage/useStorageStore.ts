import { IStorageSortBy, IStorageSortOrder, IStorageViewMode } from '@/types/storage.type';
import { create } from 'zustand';

interface StorageStoreProps {
    viewMode: IStorageViewMode;
    setViewMode: (viewMode: IStorageViewMode) => void;
    sortBy: IStorageSortBy;
    setSortBy: (sortBy: IStorageSortBy) => void;
    sortOrder: IStorageSortOrder;
    setSortOrder: (sortOrder: IStorageSortOrder) => void;
    selectedItems: string[];
    setSelectedItems: (items: string[]) => void;
    toggleSelection: (itemId: string, isMultiSelect?: boolean) => void;
    clearSelection: () => void;
    currentPath: string;
    setCurrentPath: (path: string) => void;
}

export const useStorageStore = create<StorageStoreProps>((set, get) => ({
    viewMode: 'grid',
    setViewMode: (viewMode: IStorageViewMode) => set({ viewMode }),
    sortBy: 'name',
    setSortBy: (sortBy: IStorageSortBy) => set({ sortBy }),
    sortOrder: 'asc',
    setSortOrder: (sortOrder: IStorageSortOrder) => set({ sortOrder }),
    selectedItems: [],
    setSelectedItems: (items: string[]) => set({ selectedItems: items }),
    toggleSelection: (itemId: string, isMultiSelect = false) => {
        const { selectedItems } = get();
        if (isMultiSelect) {
            if (selectedItems.includes(itemId)) {
                set({ selectedItems: selectedItems.filter(id => id !== itemId) });
            } else {
                set({ selectedItems: [...selectedItems, itemId] });
            }
        } else {
            set({ selectedItems: selectedItems.includes(itemId) ? [] : [itemId] });
        }
    },
    clearSelection: () => set({ selectedItems: [] }),
    currentPath: '/',
    setCurrentPath: (path: string) => set({ currentPath: path }),
}));

