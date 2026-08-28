export type Crop = { x: number; y: number; width: number; height: number };
export type PageOrder = 'forward' | 'reverse';
export type BindingSide = 'left' | 'right';

export const FRAME_OPTIONS = [12, 24, 36, 48, 60] as const;

export function normalizeCrop(crop: Crop): Crop {
  const x = clamp(crop.x, 0, 80);
  const y = clamp(crop.y, 0, 80);
  return {
    x,
    y,
    width: clamp(crop.width, 20, 100 - x),
    height: clamp(crop.height, 20, 100 - y),
  };
}

export function frameTimes(start: number, end: number, count: number): number[] {
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start || count < 2) return [];
  const step = (end - start) / (count - 1);
  return Array.from({ length: count }, (_, index) => Number((start + step * index).toFixed(4)));
}

export function pageNumbers(count: number, order: PageOrder): number[] {
  const pages = Array.from({ length: count }, (_, index) => index + 1);
  return order === 'reverse' ? pages.reverse() : pages;
}

export function frameLabel(index: number, count: number): string {
  return `Frame ${index + 1} of ${count}`;
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

export function safeFilename(name: string): string {
  const base = name.replace(/\.[^.]+$/, '').normalize('NFKD').replace(/[^a-zA-Z0-9-_]+/g, '-');
  return (base.replace(/^-+|-+$/g, '').toLowerCase() || 'flipbook-project').slice(0, 64);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
