import { create } from 'zustand';

interface StorageStoreProps {
    viewMode: 'grid' | 'list';
    setViewMode: (viewMode: 'grid' | 'list') => void;
}

export const useStorageStore = create<StorageStoreProps>((set, get) => ({
    viewMode: 'grid',
    setViewMode: (viewMode: 'grid' | 'list') => set({ viewMode }),
}));

