import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock drizzle database
vi.mock('@/lib/db/drizzle', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }
}));

// Mock auth functions
vi.mock('@/lib/auth/session', () => ({
  hashPassword: vi.fn(),
  comparePasswords: vi.fn(),
  setSession: vi.fn()
}));

// Mock database queries
vi.mock('@/lib/db/queries', () => ({
  getUser: vi.fn(),
  getUserWithTeam: vi.fn()
}));

// Mock stripe
vi.mock('@/lib/payments/stripe', () => ({
  createCheckoutSession: vi.fn()
}));

import { db } from '@/lib/db/drizzle';
import { hashPassword, comparePasswords, setSession } from '@/lib/auth/session';
import { getUser, getUserWithTeam } from '@/lib/db/queries';

// Helper to create FormData
function createFormData(data: Record<string, string>): FormData {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
}

describe('Authentication Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signIn validation', () => {
    it('rejects invalid email format', async () => {
      // Import action dynamically to ensure mocks are in place
      const { signIn } = await import('./actions');

      const formData = createFormData({
        email: 'not-an-email',
        password: 'password123'
      });

      const result = await signIn({}, formData);
      expect(result).toHaveProperty('error');
    });

    it('rejects short password', async () => {
      const { signIn } = await import('./actions');

      const formData = createFormData({
        email: 'test@example.com',
        password: 'short'
      });

      const result = await signIn({}, formData);
      expect(result).toHaveProperty('error');
    });

    it('returns error for non-existent user', async () => {
      const { signIn } = await import('./actions');

      // Mock database returning empty result
      const mockLimit = vi.fn().mockResolvedValue([]);
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockLeftJoin2 = vi.fn().mockReturnValue({ where: mockWhere });
      const mockLeftJoin1 = vi.fn().mockReturnValue({ leftJoin: mockLeftJoin2 });
      const mockFrom = vi.fn().mockReturnValue({ leftJoin: mockLeftJoin1 });
      vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

      const formData = createFormData({
        email: 'nonexistent@example.com',
        password: 'password123'
      });

      const result = await signIn({}, formData);
      expect(result).toHaveProperty('error');
      expect(result.error).toContain('Invalid email or password');
    });

    it('returns error for wrong password', async () => {
      const { signIn } = await import('./actions');

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        passwordHash: 'hashed_password'
      };

      // Mock database returning user
      const mockLimit = vi.fn().mockResolvedValue([{ user: mockUser, team: null }]);
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockLeftJoin2 = vi.fn().mockReturnValue({ where: mockWhere });
      const mockLeftJoin1 = vi.fn().mockReturnValue({ leftJoin: mockLeftJoin2 });
      const mockFrom = vi.fn().mockReturnValue({ leftJoin: mockLeftJoin1 });
      vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

      // Mock password comparison to return false
      vi.mocked(comparePasswords).mockResolvedValue(false);

      const formData = createFormData({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

      const result = await signIn({}, formData);
      expect(result).toHaveProperty('error');
      expect(result.error).toContain('Invalid email or password');
    });
  });

  describe('signUp validation', () => {
    it('rejects invalid email format', async () => {
      const { signUp } = await import('./actions');

      const formData = createFormData({
        email: 'not-an-email',
        password: 'password123'
      });

      const result = await signUp({}, formData);
      expect(result).toHaveProperty('error');
    });

    it('rejects short password', async () => {
      const { signUp } = await import('./actions');

      const formData = createFormData({
        email: 'test@example.com',
        password: 'short'
      });

      const result = await signUp({}, formData);
      expect(result).toHaveProperty('error');
    });

    it('returns error when email already exists', async () => {
      const { signUp } = await import('./actions');

      // Mock database returning existing user
      const mockLimit = vi.fn().mockResolvedValue([{ id: 1, email: 'test@example.com' }]);
      const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

      const formData = createFormData({
        email: 'test@example.com',
        password: 'password123'
      });

      const result = await signUp({}, formData);
      expect(result).toHaveProperty('error');
      expect(result.error).toContain('Failed to create user');
    });
  });

  describe('updatePassword', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: 'hashed_password',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    };

    beforeEach(() => {
      vi.mocked(getUser).mockResolvedValue(mockUser);
      vi.mocked(getUserWithTeam).mockResolvedValue({ user: mockUser, teamId: 1 });
    });

    it('rejects when current password is incorrect', async () => {
      const { updatePassword } = await import('./actions');

      vi.mocked(comparePasswords).mockResolvedValue(false);

      const formData = createFormData({
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123'
      });

      const result = await updatePassword({}, formData);
      expect(result).toHaveProperty('error');
      expect(result.error).toContain('Current password is incorrect');
    });

    it('rejects when new password matches current password', async () => {
      const { updatePassword } = await import('./actions');

      vi.mocked(comparePasswords).mockResolvedValue(true);

      const formData = createFormData({
        currentPassword: 'samepassword',
        newPassword: 'samepassword',
        confirmPassword: 'samepassword'
      });

      const result = await updatePassword({}, formData);
      expect(result).toHaveProperty('error');
      expect(result.error).toContain('New password must be different');
    });

    it('rejects when confirm password does not match', async () => {
      const { updatePassword } = await import('./actions');

      vi.mocked(comparePasswords).mockResolvedValue(true);

      const formData = createFormData({
        currentPassword: 'currentpassword',
        newPassword: 'newpassword123',
        confirmPassword: 'differentpassword'
      });

      const result = await updatePassword({}, formData);
      expect(result).toHaveProperty('error');
      expect(result.error).toContain('do not match');
    });

    it('updates password successfully', async () => {
      const { updatePassword } = await import('./actions');

      vi.mocked(comparePasswords).mockResolvedValue(true);
      vi.mocked(hashPassword).mockResolvedValue('new_hashed_password');

      // Mock update
      const mockWhere = vi.fn().mockResolvedValue(undefined);
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      vi.mocked(db.update).mockReturnValue({ set: mockSet } as any);

      // Mock insert for activity log
      const mockValues = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

      const formData = createFormData({
        currentPassword: 'currentpassword',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123'
      });

      const result = await updatePassword({}, formData);
      expect(result).toHaveProperty('success');
      expect(result.success).toContain('Password updated successfully');
    });
  });

  describe('updateAccount', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: 'hashed_password',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    };

    beforeEach(() => {
      vi.mocked(getUser).mockResolvedValue(mockUser);
      vi.mocked(getUserWithTeam).mockResolvedValue({ user: mockUser, teamId: 1 });
    });

    it('rejects empty name', async () => {
      const { updateAccount } = await import('./actions');

      const formData = createFormData({
        name: '',
        email: 'test@example.com'
      });

      const result = await updateAccount({}, formData);
      expect(result).toHaveProperty('error');
    });

    it('rejects invalid email', async () => {
      const { updateAccount } = await import('./actions');

      const formData = createFormData({
        name: 'Test User',
        email: 'not-an-email'
      });

      const result = await updateAccount({}, formData);
      expect(result).toHaveProperty('error');
    });

    it('updates account successfully', async () => {
      const { updateAccount } = await import('./actions');

      // Mock update
      const mockWhere = vi.fn().mockResolvedValue(undefined);
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      vi.mocked(db.update).mockReturnValue({ set: mockSet } as any);

      // Mock insert for activity log
      const mockValues = vi.fn().mockResolvedValue(undefined);
      vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

      const formData = createFormData({
        name: 'New Name',
        email: 'newemail@example.com'
      });

      const result = await updateAccount({}, formData);
      expect(result).toHaveProperty('success');
      expect(result.success).toContain('Account updated successfully');
    });
  });

  describe('inviteTeamMember', () => {
    const mockUser = {
      id: 1,
      email: 'owner@example.com',
      name: 'Owner',
      passwordHash: 'hashed_password',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    };

    beforeEach(() => {
      vi.mocked(getUser).mockResolvedValue(mockUser);
    });

    it('rejects invalid email', async () => {
      const { inviteTeamMember } = await import('./actions');

      vi.mocked(getUserWithTeam).mockResolvedValue({ user: mockUser, teamId: 1 });

      const formData = createFormData({
        email: 'not-an-email',
        role: 'member'
      });

      const result = await inviteTeamMember({}, formData);
      expect(result).toHaveProperty('error');
    });

    it('rejects invalid role', async () => {
      const { inviteTeamMember } = await import('./actions');

      vi.mocked(getUserWithTeam).mockResolvedValue({ user: mockUser, teamId: 1 });

      const formData = createFormData({
        email: 'test@example.com',
        role: 'admin' // Invalid role
      });

      const result = await inviteTeamMember({}, formData);
      expect(result).toHaveProperty('error');
    });

    it('returns error when user is not part of a team', async () => {
      const { inviteTeamMember } = await import('./actions');

      vi.mocked(getUserWithTeam).mockResolvedValue({ user: mockUser, teamId: null });

      const formData = createFormData({
        email: 'newmember@example.com',
        role: 'member'
      });

      const result = await inviteTeamMember({}, formData);
      expect(result).toHaveProperty('error');
      expect(result.error).toContain('not part of a team');
    });
  });

  describe('removeTeamMember', () => {
    const mockUser = {
      id: 1,
      email: 'owner@example.com',
      name: 'Owner',
      passwordHash: 'hashed_password',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    };

    beforeEach(() => {
      vi.mocked(getUser).mockResolvedValue(mockUser);
    });

    it('returns validation error for string memberId (schema expects number)', async () => {
      // Note: The schema uses z.number() which doesn't coerce strings
      // FormData always returns strings, so this will fail validation
      // This test documents the actual behavior
      const { removeTeamMember } = await import('./actions');

      vi.mocked(getUserWithTeam).mockResolvedValue({ user: mockUser, teamId: 1 });

      const formData = new FormData();
      formData.append('memberId', '2');

      const result = await removeTeamMember({}, formData);
      // This will return a validation error because FormData returns strings
      // but the schema expects a number
      expect(result).toHaveProperty('error');
    });
  });
});
