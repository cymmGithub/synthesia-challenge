/* ── Gallery Utilities ─────────────────────────
   Pure functions extracted from the gallery module
   for testability. No DOM dependencies.
   ──────────────────────────────────────────── */

export const DEFAULTS = {
  API_BASE: 'https://picsum.photos/v2/list',
  PER_PAGE: 12,
  THUMB_WIDTH: 20,
  FULL_WIDTH: 600,
  GAP: 16,
};

/**
 * Determine the number of masonry columns based on viewport width.
 */
export function getColumnCount(viewportWidth) {
  if (viewportWidth > 991) return 4;
  if (viewportWidth > 767) return 3;
  return 2;
}

/**
 * Calculate the CSS grid-row-end span value for a card
 * based on the image's native dimensions.
 */
export function calculateSpan(imageWidth, imageHeight, gridWidth, columns, gap = DEFAULTS.GAP) {
  const columnWidth = (gridWidth - gap * (columns - 1)) / columns;
  const aspectRatio = imageHeight / imageWidth;
  const itemHeight = columnWidth * aspectRatio;
  // Each grid row = 1px; gap between rows = `gap`px.
  // Total height for span N = N * 1 + (N - 1) * gap = N * (1 + gap) - gap
  // Solve for N: N = (itemHeight + gap) / (1 + gap)
  return Math.ceil((itemHeight + gap) / (1 + gap));
}

/**
 * Build the picsum.photos URL for a given image ID and target width.
 * Maintains the original aspect ratio.
 */
export function buildImageUrl(id, originalWidth, originalHeight, targetWidth) {
  const aspect = originalHeight / originalWidth;
  const targetHeight = Math.round(targetWidth * aspect);
  return `https://picsum.photos/id/${id}/${targetWidth}/${targetHeight}`;
}

/**
 * Build the API URL for a given page number.
 */
export function buildApiUrl(page, limit = DEFAULTS.PER_PAGE, base = DEFAULTS.API_BASE) {
  return `${base}?page=${page}&limit=${limit}`;
}

/**
 * Generate an array of randomized skeleton heights
 * for a more natural masonry placeholder appearance.
 */
export function getSkeletonHeights(count) {
  const pool = [200, 280, 240, 320, 180, 260, 300, 220, 350, 190, 270, 230];
  return Array.from({ length: count }, (_, i) => pool[i % pool.length]);
}
