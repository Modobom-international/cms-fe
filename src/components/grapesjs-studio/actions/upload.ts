
import { getApiUrl } from "@/lib/s3";

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
 * Upload assets to Cloudflare R2 via API proxy
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
      const key = `${folderPath}/${uniqueFileName}`;

      // Create form data for the API request
      const formData = new FormData();
      formData.append("file", file);
      formData.append("key", key);

      // Upload via API route
      const response = await fetch("/api/r2", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Get the API URL for the asset
      const apiUrl = getApiUrl(key);

      // Prepare asset metadata
      const asset: InputAssetProps = {
        src: apiUrl,
        name: file.name,
        metadata: {
          originalName: file.name,
          size: file.size,
          type: file.type,
          r2Path: key,
          timestamp: timestamp,
        },
      };

      uploadedAssets.push(asset);
    }

    return uploadedAssets;
  } catch (error) {
    console.error("Error uploading assets to R2:", error);
    throw error;
  }
};

/**
 * Delete assets from Cloudflare R2 via API proxy
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
      // Get the R2 storage path from asset metadata
      const r2Path = asset.get("metadata")?.r2Path;

      if (r2Path) {
        // Delete via API route
        const response = await fetch(`/api/r2?key=${encodeURIComponent(r2Path)}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`Delete failed: ${response.statusText}`);
        }
      } else {
        console.warn("Asset doesn't have R2 path metadata:", asset);
      }
    }
  } catch (error) {
    console.error("Error deleting assets from R2:", error);
    throw error;
  }
};

/**
 * Load assets from Cloudflare R2 via API proxy
 */
export const loadAssets = async ({
  editor,
  siteId,
}: WithEditorProps): Promise<InputAssetProps[]> => {
  try {
    // Create a reference to the site-specific CMS assets folder
    const folderPath = getCMSFolderPath(siteId);

    // Use the API proxy to list assets
    const response = await fetch(`/api/r2?prefix=${encodeURIComponent(folderPath)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to load assets: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.items || !Array.isArray(data.items)) {
      console.warn('Invalid response format from assets API:', data);
      return [];
    }
    
    // Define the expected item type from API
    interface AssetItem {
      key: string;
      name: string;
      size?: number;
      lastModified?: Date;
      timestamp?: number;
      url: string;
    }
    
    // Map the API response to the format expected by GrapeJS
    const assets = data.items.map((item: AssetItem) => ({
      src: item.url,
      name: item.name,
      metadata: {
        originalName: item.name,
        r2Path: item.key,
        timestamp: item.timestamp,
        size: item.size,
        lastModified: item.lastModified,
      },
    } as InputAssetProps));
    
    return assets;
  } catch (error) {
    console.error("Error loading assets from R2:", error);
    return []; // Return empty array on error to avoid breaking the UI
  }
};
