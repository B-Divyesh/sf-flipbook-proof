import { describe, expect, it } from 'vitest';
import { formatDuration, frameTimes, normalizeCrop, pageNumbers, safeFilename } from '../src/proof';

describe('proof planning helpers', () => {
  it('samples the first and last chosen moments evenly', () => {
    expect(frameTimes(1, 3, 3)).toEqual([1, 2, 3]);
    expect(frameTimes(2, 2, 24)).toEqual([]);
  });

  it('keeps crop bounds inside the source', () => {
    expect(normalizeCrop({ x: 90, y: -1, width: 90, height: 4 })).toEqual({ x: 80, y: 0, width: 20, height: 20 });
  });

  it('provides physical stack order and safe names', () => {
    expect(pageNumbers(3, 'reverse')).toEqual([3, 2, 1]);
    expect(safeFilename('My jump!.MOV')).toBe('my-jump');
  });

  it('formats duration for people', () => {
    expect(formatDuration(65.9)).toBe('1:05');
  });
});
