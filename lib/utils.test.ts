import { cn } from './utils';
import { describe, it, expect } from '@jest/globals';

describe('cn function', () => {
  it('merges class names correctly', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
    expect(cn('px-2', { 'py-1': true })).toBe('px-2 py-1');
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
    expect(cn('text-sm', 'text-lg')).toBe('text-lg');
    expect(cn('w-[72px]', 'w-16')).toBe('w-16');
    expect(cn('dark:hover:bg-gray-800', 'dark:hover:bg-gray-700')).toBe('dark:hover:bg-gray-700');
    expect(cn('foo', { bar: true, baz: false }, ['qux', { quux: true }])).toBe('foo bar qux quux');
  });
}); 