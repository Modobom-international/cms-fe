import {
  deleteObject,
  getDownloadURL,
  getStorage,
  listAll,
  ref,
  uploadBytes,
} from "firebase/storage";

import { app } from "@/lib/firebase";

// Initialize Firebase Storage
const storage = getStorage(app);

// Define InputAssetProps type based on what GrapeJS expects
interface InputAssetProps {
  src: string;
  name: string;
  category?: string;
  width?: number;
  height?: number;
  metadata?: Record<string, any>;
}

// Define Asset interface for use with GrapeJS
interface Asset {
  get: (prop: string) => any;
  set: (prop: string, value: any) => void;
}

// Define WithEditorProps type
interface WithEditorProps {
  editor: any;
  siteId: string;
  slug?: string;
}

/**
 * Get the CMS folder path for a specific site
 */
const getCMSFolderPath = (siteId: string) => {
  return `cms/${siteId}/assets`;
};

/**
 * Upload assets to Firebase Storage
 */
export const uploadAssets = async ({
  files,
  editor,
  siteId,
  slug = "",
}: {
  files: File[];
} & WithEditorProps): Promise<InputAssetProps[]> => {
  if (!files.length) return [];

  try {
    const uploadedAssets: InputAssetProps[] = [];
    const folderPath = getCMSFolderPath(siteId);

    for (const file of files) {
      // Generate a unique timestamp for each file
      const timestamp = Date.now();

      // Generate filename with slug and timestamp
      const fileExtension = file.name.split(".").pop();
      const slugPrefix = slug ? `${slug}-` : "";
      const uniqueFileName = `${slugPrefix}${timestamp}.${fileExtension}`;
      const filePath = `${folderPath}/${uniqueFileName}`;

      // Create a reference to the file location
      const storageRef = ref(storage, filePath);

      // Upload the file
      await uploadBytes(storageRef, file);

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Prepare asset metadata
      const asset: InputAssetProps = {
        src: downloadURL,
        name: file.name,
        metadata: {
          originalName: file.name,
          size: file.size,
          type: file.type,
          firebasePath: filePath,
          timestamp: timestamp,
        },
      };

      uploadedAssets.push(asset);
    }

    return uploadedAssets;
  } catch (error) {
    console.error("Error uploading assets to Firebase:", error);
    throw error;
  }
};

/**
 * Delete assets from Firebase Storage
 */
export const deleteAssets = async ({
  assets,
  editor,
  siteId,
}: {
  assets: Asset[];
} & WithEditorProps): Promise<void> => {
  try {
    for (const asset of assets) {
      // Get the Firebase storage path from asset metadata
      const firebasePath = asset.get("metadata")?.firebasePath;

      if (firebasePath) {
        const assetRef = ref(storage, firebasePath);
        await deleteObject(assetRef);
      } else {
        console.warn("Asset doesn't have Firebase path metadata:", asset);
      }
    }
  } catch (error) {
    console.error("Error deleting assets from Firebase:", error);
    throw error;
  }
};

/**
 * Load assets from Firebase Storage
 */
export const loadAssets = async ({
  editor,
  siteId,
}: WithEditorProps): Promise<InputAssetProps[]> => {
  try {
    // Create a reference to the site-specific CMS assets folder
    const folderPath = getCMSFolderPath(siteId);
    const cmsFolderRef = ref(storage, folderPath);

    // List all items in the folder
    const result = await listAll(cmsFolderRef);

    // Get download URLs and metadata for all items
    const assetsPromises = result.items.map(async (itemRef) => {
      const downloadURL = await getDownloadURL(itemRef);
      const fileName = itemRef.name;

      // Extract timestamp from filename if present
      let timestamp = 0;
      const timestampMatch = fileName.match(/-(\d+)-/);
      if (timestampMatch && timestampMatch[1]) {
        timestamp = parseInt(timestampMatch[1], 10);
      }

      return {
        src: downloadURL,
        name: fileName,
        metadata: {
          originalName: fileName,
          firebasePath: itemRef.fullPath,
          timestamp: timestamp,
        },
      } as InputAssetProps;
    });

    const assets = await Promise.all(assetsPromises);

    // Sort assets by timestamp, newest first
    return assets.sort((a, b) => {
      const timestampA = a.metadata?.timestamp || 0;
      const timestampB = b.metadata?.timestamp || 0;
      return timestampB - timestampA;
    });
  } catch (error) {
    console.error("Error loading assets from Firebase:", error);
    return []; // Return empty array on error to avoid breaking the UI
  }
};
