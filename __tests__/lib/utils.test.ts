import { cn } from '@/lib/utils';
import { describe, it, expect } from '@jest/globals';

describe('cn function', () => {
  // 1. Group related test cases
  describe('basic class merging', () => {
    it('merges simple class names', () => {
      expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
    });

    it('handles conditional classes', () => {
      expect(cn('px-2', { 'py-1': true, 'mt-2': false })).toBe('px-2 py-1');
    });
  });

  describe('conflict resolution', () => {
    it('resolves conflicting utility classes', () => {
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
      expect(cn('text-sm', 'text-lg')).toBe('text-lg');
    });

    it('handles arbitrary value conflicts', () => {
      expect(cn('w-[72px]', 'w-16')).toBe('w-16');
    });
  });

  describe('complex scenarios', () => {
    it('handles variant combinations', () => {
      expect(cn('dark:hover:bg-gray-800', 'dark:hover:bg-gray-700'))
        .toBe('dark:hover:bg-gray-700');
    });

    it('processes mixed input types', () => {
      expect(cn(
        'foo', 
        { bar: true, baz: false }, 
        ['qux', { quux: true }]
      )).toBe('foo bar qux quux');
    });
  });
}); 