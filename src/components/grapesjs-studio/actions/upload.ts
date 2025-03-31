import {
  deleteObject,
  getDownloadURL,
  getStorage,
  listAll,
  ref,
  uploadBytes,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

import { app } from "@/lib/firebase";

// Initialize Firebase Storage
const storage = getStorage(app);

// Base folder path for CMS assets
const CMS_FOLDER_PATH = "cms/assets";

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
}

/**
 * Upload assets to Firebase Storage
 */
export const uploadAssets = async ({
  files,
  editor,
}: {
  files: File[];
} & WithEditorProps): Promise<InputAssetProps[]> => {
  if (!files.length) return [];

  try {
    const uploadedAssets: InputAssetProps[] = [];

    for (const file of files) {
      // Generate a unique file name to avoid conflicts
      const fileExtension = file.name.split(".").pop();
      const uniqueFileName = `${uuidv4()}.${fileExtension}`;
      const filePath = `${CMS_FOLDER_PATH}/${uniqueFileName}`;

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
}: WithEditorProps): Promise<InputAssetProps[]> => {
  try {
    // Create a reference to the CMS assets folder
    const cmsFolderRef = ref(storage, CMS_FOLDER_PATH);

    // List all items in the folder
    const result = await listAll(cmsFolderRef);

    // Get download URLs and metadata for all items
    const assets = await Promise.all(
      result.items.map(async (itemRef) => {
        const downloadURL = await getDownloadURL(itemRef);
        const fileName = itemRef.name;

        // Determine file type based on name extension
        const fileExtension = fileName.split(".").pop()?.toLowerCase() || "";

        return {
          src: downloadURL,
          name: fileName,
          metadata: {
            originalName: fileName,
            firebasePath: itemRef.fullPath,
          },
        } as InputAssetProps;
      })
    );

    return assets;
  } catch (error) {
    console.error("Error loading assets from Firebase:", error);
    return []; // Return empty array on error to avoid breaking the UI
  }
};
