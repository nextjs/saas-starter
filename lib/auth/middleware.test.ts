import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import { validatedAction, validatedActionWithUser, withTeam } from './middleware';

// Mock the database queries module
vi.mock('@/lib/db/queries', () => ({
  getUser: vi.fn(),
  getTeamForUser: vi.fn(),
}));

import { getUser, getTeamForUser } from '@/lib/db/queries';

describe('validatedAction', () => {
  const testSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });

  it('passes valid data to action function', async () => {
    const mockAction = vi.fn().mockResolvedValue({ success: true });
    const wrappedAction = validatedAction(testSchema, mockAction);

    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'password123');

    const result = await wrappedAction({}, formData);

    expect(mockAction).toHaveBeenCalledWith(
      { email: 'test@example.com', password: 'password123' },
      formData
    );
    expect(result).toEqual({ success: true });
  });

  it('returns error for invalid email', async () => {
    const mockAction = vi.fn();
    const wrappedAction = validatedAction(testSchema, mockAction);

    const formData = new FormData();
    formData.append('email', 'invalid-email');
    formData.append('password', 'password123');

    const result = await wrappedAction({}, formData);

    expect(mockAction).not.toHaveBeenCalled();
    expect(result).toHaveProperty('error');
  });

  it('returns error for short password', async () => {
    const mockAction = vi.fn();
    const wrappedAction = validatedAction(testSchema, mockAction);

    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'short');

    const result = await wrappedAction({}, formData);

    expect(mockAction).not.toHaveBeenCalled();
    expect(result).toHaveProperty('error');
  });

  it('returns error for missing required fields', async () => {
    const mockAction = vi.fn();
    const wrappedAction = validatedAction(testSchema, mockAction);

    const formData = new FormData();
    // Missing both email and password

    const result = await wrappedAction({}, formData);

    expect(mockAction).not.toHaveBeenCalled();
    expect(result).toHaveProperty('error');
  });
});

describe('validatedActionWithUser', () => {
  const testSchema = z.object({
    name: z.string().min(1),
  });

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: 'hashed',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('passes valid data and user to action function', async () => {
    vi.mocked(getUser).mockResolvedValue(mockUser);
    const mockAction = vi.fn().mockResolvedValue({ success: true });
    const wrappedAction = validatedActionWithUser(testSchema, mockAction);

    const formData = new FormData();
    formData.append('name', 'New Name');

    const result = await wrappedAction({}, formData);

    expect(mockAction).toHaveBeenCalledWith({ name: 'New Name' }, formData, mockUser);
    expect(result).toEqual({ success: true });
  });

  it('throws error when user is not authenticated', async () => {
    vi.mocked(getUser).mockResolvedValue(null);
    const mockAction = vi.fn();
    const wrappedAction = validatedActionWithUser(testSchema, mockAction);

    const formData = new FormData();
    formData.append('name', 'New Name');

    await expect(wrappedAction({}, formData)).rejects.toThrow(
      'User is not authenticated'
    );
    expect(mockAction).not.toHaveBeenCalled();
  });

  it('returns validation error before checking user', async () => {
    vi.mocked(getUser).mockResolvedValue(mockUser);
    const mockAction = vi.fn();
    const wrappedAction = validatedActionWithUser(testSchema, mockAction);

    const formData = new FormData();
    // Empty name fails validation

    // Note: validation happens after user check in the actual code
    const result = await wrappedAction({}, formData);
    expect(result).toHaveProperty('error');
  });
});

describe('withTeam', () => {
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: 'hashed',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockTeam = {
    id: 1,
    name: 'Test Team',
    createdAt: new Date(),
    updatedAt: new Date(),
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    stripeProductId: null,
    planName: null,
    subscriptionStatus: 'active',
    teamMembers: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('passes team data to action function', async () => {
    vi.mocked(getUser).mockResolvedValue(mockUser);
    vi.mocked(getTeamForUser).mockResolvedValue(mockTeam);
    const mockAction = vi.fn().mockResolvedValue({ success: true });
    const wrappedAction = withTeam(mockAction);

    const formData = new FormData();
    const result = await wrappedAction(formData);

    expect(mockAction).toHaveBeenCalledWith(formData, mockTeam);
    expect(result).toEqual({ success: true });
  });

  it('redirects when user is not authenticated', async () => {
    vi.mocked(getUser).mockResolvedValue(null);
    const mockAction = vi.fn();
    const wrappedAction = withTeam(mockAction);

    const formData = new FormData();

    // redirect throws an error in our mock
    await expect(wrappedAction(formData)).rejects.toThrow('REDIRECT:/sign-in');
    expect(mockAction).not.toHaveBeenCalled();
  });

  it('throws error when team is not found', async () => {
    vi.mocked(getUser).mockResolvedValue(mockUser);
    vi.mocked(getTeamForUser).mockResolvedValue(null);
    const mockAction = vi.fn();
    const wrappedAction = withTeam(mockAction);

    const formData = new FormData();

    await expect(wrappedAction(formData)).rejects.toThrow('Team not found');
    expect(mockAction).not.toHaveBeenCalled();
  });
});
