/**
 * Asset Resolver Utility
 *
 * Resolves asset IDs to file paths and provides asset information.
 * Used for reusable multimedia assets across lessons.
 * Supports CDN-based delivery via assetService.
 */

// Import registry from scripts (will be copied to lib/data in build)
import registry from '../data/asset-registry.json';
import { getImageUrl, isCdnEnabled } from '$lib/services/assetService';

export interface AssetUsage {
  lessonId: string;
  stepId: string;
  taskId: string;
  context: string;
}

export interface AssetSpecs {
  dimensions?: string;
  format?: string;
  style?: string;
  duration?: string;
  resolution?: string;
  audio?: string;
}

export interface Asset {
  id: string;
  type: 'image' | 'video';
  category: string;
  path: string;
  description: string;
  tags: string[];
  specs: AssetSpecs;
  usedIn: AssetUsage[];
  originalTaskFile: string;
  createdAt: string;
  status: 'pending' | 'in_progress' | 'complete' | 'blocked';
}

export interface AssetRegistry {
  version: string;
  lastUpdated: string;
  assets: Record<string, Asset>;
  categories: Record<string, string[]>;
}

const typedRegistry = registry as AssetRegistry;

/**
 * Resolve an asset ID to its file path or CDN URL
 * @param assetId - The unique asset identifier
 * @returns The asset path/URL or null if not found
 */
export function resolveAsset(assetId: string): string | null {
  const asset = typedRegistry.assets[assetId];
  if (!asset?.path) return null;

  // Use CDN URL if available
  if (isCdnEnabled()) {
    return getImageUrl(assetId);
  }

  return asset.path;
}

/**
 * Get full asset information by ID
 * @param assetId - The unique asset identifier
 * @returns The full asset object or null if not found
 */
export function getAssetInfo(assetId: string): Asset | null {
  return typedRegistry.assets[assetId] ?? null;
}

/**
 * Get all assets in a category
 * @param category - The category name (e.g., 'transport', 'food')
 * @returns Array of asset IDs in that category
 */
export function getAssetsByCategory(category: string): string[] {
  return typedRegistry.categories[category] ?? [];
}

/**
 * Get all assets used in a specific lesson
 * @param lessonId - The lesson ID (e.g., 'A1-1-M01-L01')
 * @returns Array of assets used in that lesson
 */
export function getAssetsForLesson(lessonId: string): Asset[] {
  return Object.values(typedRegistry.assets).filter(asset =>
    asset.usedIn.some(usage => usage.lessonId === lessonId)
  );
}

/**
 * Check if an asset is used in multiple lessons (reusable)
 * @param assetId - The unique asset identifier
 * @returns True if used in more than one lesson
 */
export function isReusableAsset(assetId: string): boolean {
  const asset = typedRegistry.assets[assetId];
  if (!asset) return false;

  const uniqueLessons = new Set(asset.usedIn.map(u => u.lessonId));
  return uniqueLessons.size > 1;
}

/**
 * Get all categories in the registry
 * @returns Array of category names
 */
export function getAllCategories(): string[] {
  return Object.keys(typedRegistry.categories);
}

/**
 * Search assets by tag
 * @param tag - The tag to search for
 * @returns Array of matching assets
 */
export function searchByTag(tag: string): Asset[] {
  const lowerTag = tag.toLowerCase();
  return Object.values(typedRegistry.assets).filter(asset =>
    asset.tags.some(t => t.toLowerCase().includes(lowerTag))
  );
}

/**
 * Get registry stats
 */
export function getRegistryStats(): {
  totalAssets: number;
  images: number;
  videos: number;
  categories: number;
  pending: number;
  complete: number;
} {
  const assets = Object.values(typedRegistry.assets);
  return {
    totalAssets: assets.length,
    images: assets.filter(a => a.type === 'image').length,
    videos: assets.filter(a => a.type === 'video').length,
    categories: Object.keys(typedRegistry.categories).length,
    pending: assets.filter(a => a.status === 'pending').length,
    complete: assets.filter(a => a.status === 'complete').length
  };
}

/**
 * Resolve image/video with fallback
 * Tries assetId first, then falls back to direct path.
 * Uses CDN URLs when available.
 * @param assetIdOrPath - Either an asset ID or a direct path
 * @returns The resolved path/URL
 */
export function resolveMedia(assetIdOrPath: string | undefined): string | null {
  if (!assetIdOrPath) return null;

  // If it starts with /, it's already a path
  if (assetIdOrPath.startsWith('/')) {
    // Even for direct paths, use CDN if enabled
    if (isCdnEnabled() && assetIdOrPath.startsWith('/images/')) {
      // Extract asset-like ID from path for CDN lookup
      // This is a fallback for direct paths
      return getImageUrl(assetIdOrPath);
    }
    return assetIdOrPath;
  }

  // Otherwise, try to resolve as asset ID
  return resolveAsset(assetIdOrPath);
}

export { typedRegistry as registry };
