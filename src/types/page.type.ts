import { z } from "zod";

import { Site } from "./site.type";

export interface IPage {
  id: number;
  name: string;
  slug: string;
  content: string;
  site_id: number;
  provider: number;
  created_at: string;
  updated_at: string;
  tracking_script?: string | null;
}

export interface IPageExtended extends IPage {
  site: Site;
}

export interface IPageResponse {
  success: boolean;
  message: string;
  data: IPage;
  site: Site;
}

export interface IPageListResponse {
  success: boolean;
  data: IPageExtended[];
  message: string;
}

export interface IPageDetailResponse {
  success: boolean;
  data: IPage;
  site: Site;
  message: string;
}

// Zod Schemas
export const CreatePageSchema = z.object({
  site_id: z.string(),
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string(),
});

export const UpdatePageSchema = z.object({
  pageId: z.string().min(1, "Page ID is required"),
  content: z.string(),
});

export const UpdateTrackingScriptSchema = z.object({
  tracking_script: z.string(),
});

// Schema Types
export type ICreatePageData = z.infer<typeof CreatePageSchema>;
export type IUpdatePageData = z.infer<typeof UpdatePageSchema>;
export type IUpdateTrackingScriptData = z.infer<
  typeof UpdateTrackingScriptSchema
>;

// API Response Types
export interface ICreatePageResponse {
  success: boolean;
  message: string;
  data: IPage;
}

export interface IUpdatePageResponse {
  success: boolean;
  message: string;
  data: IPage;
}

export interface IDeletePageResponse {
  success: boolean;
  message: string;
}

export interface ITrackingScriptResponse {
  success: boolean;
  message: string;
  data: {
    tracking_script: string;
  } | null;
}
