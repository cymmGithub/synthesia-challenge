import { describe, expect, it } from 'bun:test';
import {
  DEFAULTS,
  getColumnCount,
  calculateSpan,
  buildImageUrl,
  buildApiUrl,
  getSkeletonHeights,
} from '../modules/gallery-utils.js';

describe('getColumnCount', () => {
  it('returns 4 columns for desktop (> 991px)', () => {
    expect(getColumnCount(1200)).toBe(4);
    expect(getColumnCount(992)).toBe(4);
  });

  it('returns 3 columns for tablet (768–991px)', () => {
    expect(getColumnCount(991)).toBe(3);
    expect(getColumnCount(768)).toBe(3);
  });

  it('returns 2 columns for mobile (< 768px)', () => {
    expect(getColumnCount(767)).toBe(2);
    expect(getColumnCount(375)).toBe(2);
    expect(getColumnCount(320)).toBe(2);
  });
});

describe('calculateSpan', () => {
  it('calculates correct span for a square image', () => {
    // 4 columns, 1200px grid, 16px gap
    // columnWidth = (1200 - 16 * 3) / 4 = 288
    // aspectRatio = 1, itemHeight = 288
    // span = ceil((288 + 16) / (1 + 16)) = ceil(304 / 17) = 18
    const span = calculateSpan(500, 500, 1200, 4, 16);
    expect(span).toBe(18);
  });

  it('calculates taller span for portrait images', () => {
    const square = calculateSpan(500, 500, 1200, 4, 16);
    const portrait = calculateSpan(500, 750, 1200, 4, 16);
    expect(portrait).toBeGreaterThan(square);
  });

  it('calculates shorter span for landscape images', () => {
    const square = calculateSpan(500, 500, 1200, 4, 16);
    const landscape = calculateSpan(750, 500, 1200, 4, 16);
    expect(landscape).toBeLessThan(square);
  });

  it('adjusts span when column count changes', () => {
    // Fewer columns = wider columns = taller cards
    const fourCol = calculateSpan(500, 500, 1200, 4, 16);
    const twoCol = calculateSpan(500, 500, 1200, 2, 16);
    expect(twoCol).toBeGreaterThan(fourCol);
  });

  it('uses default gap when not specified', () => {
    const withDefault = calculateSpan(500, 500, 1200, 4);
    const withExplicit = calculateSpan(500, 500, 1200, 4, DEFAULTS.GAP);
    expect(withDefault).toBe(withExplicit);
  });
});

describe('buildImageUrl', () => {
  it('builds a correctly formatted picsum URL', () => {
    const url = buildImageUrl('237', 4000, 3000, 600);
    expect(url).toBe('https://picsum.photos/id/237/600/450');
  });

  it('preserves aspect ratio in target dimensions', () => {
    // Original: 5000x2500 (2:1 landscape)
    const url = buildImageUrl('10', 5000, 2500, 800);
    expect(url).toBe('https://picsum.photos/id/10/800/400');
  });

  it('rounds height to nearest integer', () => {
    // 3:2 ratio at width 20 → height = 13.33 → 13
    const url = buildImageUrl('5', 300, 200, 20);
    expect(url).toBe('https://picsum.photos/id/5/20/13');
  });

  it('works for tiny thumbnail sizes', () => {
    const url = buildImageUrl('100', 4000, 3000, 20);
    expect(url).toBe('https://picsum.photos/id/100/20/15');
  });
});

describe('buildApiUrl', () => {
  it('builds correct API URL with defaults', () => {
    const url = buildApiUrl(1);
    expect(url).toBe('https://picsum.photos/v2/list?page=1&limit=12');
  });

  it('respects custom page and limit', () => {
    const url = buildApiUrl(3, 24);
    expect(url).toBe('https://picsum.photos/v2/list?page=3&limit=24');
  });

  it('supports custom base URL', () => {
    const url = buildApiUrl(1, 10, 'https://example.com/api');
    expect(url).toBe('https://example.com/api?page=1&limit=10');
  });
});

describe('getSkeletonHeights', () => {
  it('returns the requested number of heights', () => {
    expect(getSkeletonHeights(6)).toHaveLength(6);
    expect(getSkeletonHeights(12)).toHaveLength(12);
  });

  it('cycles through heights when count exceeds pool size', () => {
    const heights = getSkeletonHeights(15);
    expect(heights).toHaveLength(15);
    // 13th element should equal 1st (pool size is 12)
    expect(heights[12]).toBe(heights[0]);
  });

  it('returns positive integer heights', () => {
    const heights = getSkeletonHeights(12);
    heights.forEach((h) => {
      expect(h).toBeGreaterThan(0);
      expect(Number.isInteger(h)).toBe(true);
    });
  });
});
