"use server";

import { DEFAULT_LOGIN_REDIRECT } from "@/configs/route.config";
import { UserRoleEnum } from "@/enums/user-role";

import { IMeRes } from "@/types/auth.type";
import { IUser } from "@/types/user.type";

import { apiServer } from "@/lib/api/server";

// Define role-based routes with proper typing using the enum
export const ROLE_REDIRECTS: Record<UserRoleEnum, string> = {
  [UserRoleEnum.ADMIN]: "/admin",
  [UserRoleEnum.USER]: "/",
};

/**
 * Get the redirect URL for a user based on their role
 * @param role The user's role
 * @returns The appropriate redirect URL for the role
 */
export function getRoleRedirect(role: UserRoleEnum): string {
  return ROLE_REDIRECTS[role] || DEFAULT_LOGIN_REDIRECT;
}

/**
 * Check if a user can access a specific path based on their role
 * @param path The path to check
 * @param roleValue The user's role value as a string
 * @returns Whether the user has access to the path
 */
export function canAccessPath(path: string, roleValue: string): boolean {
  // Admin can access everything
  if (roleValue === UserRoleEnum.ADMIN) {
    return true;
  }

  // Check route-specific permissions
  const normalizedPath = path.toLowerCase();

  if (normalizedPath.startsWith("/admin")) {
    return roleValue === UserRoleEnum.ADMIN;
  }

  // For other paths, allow access
  return true;
}

/**
 * Fetch the current user from the API
 * @param accessToken The access token from cookies
 * @returns The user data or null if authentication fails
 */
export async function getCurrentUser(
  accessToken: string
): Promise<IUser | null> {
  if (!accessToken) return null;

  try {
    const data = await apiServer.get<IMeRes>("/api/me");
    return data.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}
