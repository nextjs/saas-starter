import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn (className utility)', () => {
  it('merges multiple class names', () => {
    const result = cn('class1', 'class2');
    expect(result).toBe('class1 class2');
  });

  it('handles conditional classes', () => {
    const result = cn('base', true && 'included', false && 'excluded');
    expect(result).toBe('base included');
  });

  it('handles undefined and null values', () => {
    const result = cn('base', undefined, null, 'end');
    expect(result).toBe('base end');
  });

  it('resolves Tailwind conflicts (last wins)', () => {
    // tailwind-merge should resolve px-2 and px-4 to px-4
    const result = cn('px-2', 'px-4');
    expect(result).toBe('px-4');
  });

  it('handles array of classes', () => {
    const result = cn(['class1', 'class2']);
    expect(result).toBe('class1 class2');
  });

  it('handles object notation for conditional classes', () => {
    const result = cn({
      'always-on': true,
      'always-off': false,
    });
    expect(result).toBe('always-on');
  });

  it('handles complex Tailwind conflict resolution', () => {
    // bg-red-500 should be overwritten by bg-blue-500
    const result = cn('bg-red-500', 'bg-blue-500');
    expect(result).toBe('bg-blue-500');
  });

  it('preserves non-conflicting classes', () => {
    const result = cn('text-red-500', 'bg-blue-500', 'p-4');
    expect(result).toBe('text-red-500 bg-blue-500 p-4');
  });

  it('returns empty string for empty inputs', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('handles mixed input types', () => {
    const result = cn(
      'base',
      ['array-class'],
      { 'object-class': true },
      undefined,
      'final'
    );
    expect(result).toBe('base array-class object-class final');
  });
});
