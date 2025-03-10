import '@testing-library/jest-dom';
import { signUp } from '@/app/(login)/actions';
import { createClient } from '@/utils/supabase/server'; // Import the server client
import { AuthError } from '@supabase/supabase-js';
import { db } from '@/lib/db/drizzle';
import { teams, teamMembers, users, invitations, ActivityType, organizations, activityLogs } from '@/lib/db/schema'; // Import schema
import { eq, sql, and, desc } from 'drizzle-orm';

// Mock Next.js redirect
jest.mock('next/navigation', () => ({
  redirect: jest.fn().mockImplementation((url) => {
    throw new Error('NEXT_REDIRECT');
  }),
}));

// Mock Stripe module
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    customers: {
      create: jest.fn().mockResolvedValue({ id: 'mock_customer_id' }),
    },
    subscriptions: {
      create: jest.fn().mockResolvedValue({ id: 'mock_subscription_id' }),
    },
  }));
});

jest.mock('@/utils/supabase/server'); // Mock the server client, not the browser client

// Mock Drizzle
jest.mock('@/lib/db/drizzle', () => {
  const mockDb = {
    insert: jest.fn().mockImplementation(() => ({
      values: jest.fn().mockImplementation((data) => ({
        returning: jest.fn().mockResolvedValue([data])
      }))
    })),
    select: jest.fn().mockImplementation(() => ({
      from: jest.fn().mockImplementation(() => ({
        where: jest.fn().mockImplementation(() => ({
          limit: jest.fn().mockImplementation(() => []),
          orderBy: jest.fn().mockImplementation(() => ({
            limit: jest.fn().mockImplementation(() => [])
          }))
        })),
        orderBy: jest.fn().mockImplementation(() => ({
          limit: jest.fn().mockImplementation(() => [])
        }))
      }))
    })),
    update: jest.fn().mockImplementation(() => ({
      set: jest.fn().mockImplementation(() => ({
        where: jest.fn().mockImplementation(() => ({
          returning: jest.fn().mockResolvedValue([])
        }))
      }))
    })),
    delete: jest.fn(),
    query: {
      users: {
        findFirst: jest.fn()
      }
    }
  };
  return { db: mockDb };
});

// Add type for the signUp response
type SignUpResponse = {
  error?: any;
  success?: string;
  email?: string;
  password?: string;
} | void;

// Add more specific types for mocked responses
type MockAuthResponse = {
  data: {
    user: { id: string; email: string } | null;
  };
  error: AuthError | null;
};

type MockDbResponse<T> = {
  returning: T[];
};

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

describe('signUp Action', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockCreateClient.mockReturnValue({
      auth: {
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
        signOut: jest.fn(),
        updateUser: jest.fn(),
        admin: {
          deleteUser: jest.fn()
        }
      }
    } as any);
  });

  it('should create a user and team on successful sign-up with no invitation', async () => {
    const mockAuthData = {
      data: { user: { id: 'supabase-user-id', email: 'test@example.com' } },
      error: null,
    };
    mockCreateClient().auth.signUp.mockResolvedValue(mockAuthData);

    const mockCreatedUser = { id: 1, email: 'test@example.com' };
    const mockCreatedTeam = { id: 2, name: "test@example.com's Team" };
    const mockCreatedOrg = { id: 'org-1', name: 'Test Organization' };

    // Mock the database calls
    (db.insert as jest.Mock).mockImplementation((table) => ({
      values: jest.fn().mockImplementation((data) => ({
        returning: jest.fn().mockResolvedValue(
          table === teams ? [mockCreatedTeam] :
          table === users ? [mockCreatedUser] :
          table === organizations ? [mockCreatedOrg] :
          []
        )
      }))
    }));

    (db.select as jest.Mock).mockImplementation(() => ({
      from: jest.fn().mockImplementation(() => ({
        where: jest.fn().mockImplementation(() => ({
          orderBy: jest.fn().mockImplementation(() => ({
            limit: jest.fn().mockResolvedValue([mockCreatedUser])
          }))
        }))
      }))
    }));

    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'password123');
    formData.append('first_name', 'Test');
    formData.append('last_name', 'User');
    formData.append('organization', 'Test Organization');

    try {
      await signUp({}, formData);
    } catch (error: any) {
      expect(error.message).toBe('NEXT_REDIRECT');
    }

    expect(mockCreateClient().auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User',
          full_name: 'Test User'
        },
      }
    });

    // Verify organization creation
    expect(db.insert).toHaveBeenCalledWith(teams);
    expect(db.insert).toHaveBeenCalledWith(users);
    expect(db.insert).toHaveBeenCalledWith(teamMembers);
  });

  it('should use invite id', async () => {
    const mockAuthData = {
      data: { user: { id: 'supabase-user-id', email: 'test@example.com' } },
      error: null,
    };
    mockCreateClient().auth.signUp.mockResolvedValue(mockAuthData);
    const mockCreatedUser = { id: 1, email: 'test@example.com', role: 'member' };
    const mockInvitation = { id: 123, teamId: 2, email: 'test@example.com', role: 'member', status: 'pending' };

    // Mock the database calls
    (db.select as jest.Mock).mockImplementation(() => ({
      from: jest.fn().mockImplementation(() => ({
        where: jest.fn().mockImplementation(() => ({
          limit: jest.fn().mockResolvedValue([mockInvitation]),
          orderBy: jest.fn().mockImplementation(() => ({
            limit: jest.fn().mockResolvedValue([mockCreatedUser])
          }))
        }))
      }))
    }));

    (db.insert as jest.Mock).mockImplementation((table) => ({
      values: jest.fn().mockImplementation((data) => ({
        returning: jest.fn().mockResolvedValue(
          table === users ? [mockCreatedUser] :
          []
        )
      }))
    }));

    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'password123');
    formData.append('first_name', 'Test');
    formData.append('last_name', 'User');
    formData.append('organization', 'Test Organization');
    formData.append('inviteId', '123');

    try {
      await signUp({}, formData);
    } catch (error: any) {
      expect(error.message).toBe('NEXT_REDIRECT');
    }

    expect(mockCreateClient().auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User',
          full_name: 'Test User'
        },
      }
    });
  });

  it('should reject invalid invitation', async () => {
    const mockAuthData = {
      data: { user: { id: 'supabase-user-id', email: 'test@example.com' } },
      error: null,
    };
    mockCreateClient().auth.signUp.mockResolvedValue(mockAuthData);

    // Mock empty invitation result
    (db.select as jest.Mock).mockImplementation(() => ({
      from: jest.fn().mockImplementation(() => ({
        where: jest.fn().mockImplementation(() => ({
          limit: jest.fn().mockResolvedValue([])
        }))
      }))
    }));

    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'password123');
    formData.append('first_name', 'Test');
    formData.append('last_name', 'User');
    formData.append('organization', 'Test Organization');
    formData.append('inviteId', 'invalid-id');

    const result = await signUp({}, formData) as SignUpResponse;
    expect(result?.error).toEqual("Invalid or expired invitation.");
  });

  it('should handle Supabase Auth errors', async () => {
    const authError = new AuthError('Test error');
    mockCreateClient().auth.signUp.mockResolvedValue({ data: { user: null }, error: authError });

    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'password123');
    formData.append('first_name', 'Test');
    formData.append('last_name', 'User');
    formData.append('organization', 'Test Organization');

    const result = await signUp({}, formData) as SignUpResponse;
    expect(result?.error).toBe(authError.message);
  });

  it('should handle missing user data', async () => {
    mockCreateClient().auth.signUp.mockResolvedValue({ data: { user: null }, error: null });

    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'password123');
    formData.append('first_name', 'Test');
    formData.append('last_name', 'User');
    formData.append('organization', 'Test Organization');

    const result = await signUp({}, formData) as SignUpResponse;
    expect(result?.error).toBe('Failed to create user. Please try again.');
  });

  it('should validate input fields', async () => {
    const formData = new FormData();
    // Missing email and password
    let result = await signUp({}, formData) as SignUpResponse;
    expect(result?.error).toBeDefined();

    formData.append('email', 'invalid-email');
    formData.append('password', 'short');
    result = await signUp({}, formData) as SignUpResponse;
    expect(result?.error).toBeDefined();
  });

  it('should validate required fields', async () => {
    const mockAuthData = {
      data: { user: { id: 'supabase-user-id', email: 'test@example.com' } },
      error: null,
    };
    mockCreateClient().auth.signUp.mockResolvedValue(mockAuthData);

    // Test missing email
    const formData1 = new FormData();
    formData1.append('password', 'password123');
    formData1.append('first_name', 'Test');
    formData1.append('last_name', 'User');

    const result1 = await signUp({}, formData1) as SignUpResponse;
    expect(result1?.error).toBe('Required');

    // Test missing password
    const formData2 = new FormData();
    formData2.append('email', 'test@example.com');
    formData2.append('first_name', 'Test');
    formData2.append('last_name', 'User');

    const result2 = await signUp({}, formData2) as SignUpResponse;
    expect(result2?.error).toBe('Required');
  });

  it('should handle team creation failure', async () => {
    const mockAuthData = {
      data: { user: { id: 'supabase-user-id', email: 'test@example.com' } },
      error: null,
    };
    mockCreateClient().auth.signUp.mockResolvedValue(mockAuthData);

    // Mock team creation failure
    (db.insert as jest.Mock).mockImplementation((table) => {
      if (table === teams) {
        return {
          values: jest.fn().mockImplementation(() => ({
            returning: jest.fn().mockResolvedValue([])
          }))
        };
      }
      return {
        values: jest.fn().mockImplementation(() => ({
          returning: jest.fn().mockResolvedValue([{ id: 1 }])
        }))
      };
    });

    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'password123');
    formData.append('first_name', 'Test');
    formData.append('last_name', 'User');

    const result = await signUp({}, formData) as SignUpResponse;
    expect(result?.error).toBe('Failed to create team. Please try again.');
  });

  it('should create activity log on successful sign-up', async () => {
    const mockAuthData = {
      data: { user: { id: 'supabase-user-id', email: 'test@example.com' } },
      error: null,
    } as MockAuthResponse;
    mockCreateClient().auth.signUp.mockResolvedValue(mockAuthData);

    const mockCreatedUser = { id: 1, email: 'test@example.com' };
    const mockCreatedTeam = { id: 2, name: "test@example.com's Team" };
    const mockCreatedOrg = { id: 'org-1', name: 'Test Organization' };

    // Update mock implementation for select
    (db.select as jest.Mock).mockImplementation(() => ({
      from: jest.fn().mockImplementation(() => ({
        where: jest.fn().mockImplementation(() => ({
          orderBy: jest.fn().mockImplementation(() => ({
            limit: jest.fn().mockResolvedValue([mockCreatedUser])
          }))
        }))
      }))
    }));

    (db.insert as jest.Mock).mockImplementation((table) => ({
      values: jest.fn().mockImplementation((data) => ({
        returning: jest.fn().mockResolvedValue(
          table === teams ? [mockCreatedTeam] :
          table === users ? [mockCreatedUser] :
          table === organizations ? [mockCreatedOrg] :
          []
        )
      }))
    }));

    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'password123');
    formData.append('first_name', 'Test');
    formData.append('last_name', 'User');
    formData.append('organization', 'Test Organization');

    try {
      await signUp({}, formData);
    } catch (error: any) {
      expect(error.message).toBe('NEXT_REDIRECT');
    }

    // Verify activity log creation
    expect(db.insert).toHaveBeenCalledWith(activityLogs);
    const activityLogCall = (db.insert as jest.Mock).mock.calls.find(
      call => call[0] === activityLogs
    );
    expect(activityLogCall).toBeDefined();
  });

  it('should handle organization creation failure', async () => {
    const mockAuthData = {
      data: { user: { id: 'supabase-user-id', email: 'test@example.com' } },
      error: null,
    } as MockAuthResponse;
    mockCreateClient().auth.signUp.mockResolvedValue(mockAuthData);

    // Update mock implementation for select
    (db.select as jest.Mock).mockImplementation(() => ({
      from: jest.fn().mockImplementation(() => ({
        where: jest.fn().mockImplementation(() => ({
          orderBy: jest.fn().mockImplementation(() => ({
            limit: jest.fn().mockResolvedValue([{ id: 1 }])
          }))
        }))
      }))
    }));

    // Mock organization creation failure
    (db.insert as jest.Mock).mockImplementation((table) => {
      if (table === organizations) {
        return {
          values: jest.fn().mockImplementation(() => ({
            returning: jest.fn().mockResolvedValue([])
          }))
        };
      }
      return {
        values: jest.fn().mockImplementation(() => ({
          returning: jest.fn().mockResolvedValue([{ id: 1 }])
        }))
      };
    });

    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'password123');
    formData.append('first_name', 'Test');
    formData.append('last_name', 'User');
    formData.append('organization', 'Test Organization');

    const result = await signUp({}, formData) as SignUpResponse;
    expect(result?.error).toBe('Failed to create organization. Please try again.');
  });

  it('should handle activity log creation failure', async () => {
    const mockAuthData = {
      data: { user: { id: 'supabase-user-id', email: 'test@example.com' } },
      error: null,
    } as MockAuthResponse;
    mockCreateClient().auth.signUp.mockResolvedValue(mockAuthData);

    const mockCreatedUser = { id: 1, email: 'test@example.com' };
    const mockCreatedTeam = { id: 2, name: "test@example.com's Team" };
    const mockCreatedOrg = { id: 'org-1', name: 'Test Organization' };

    // Update mock implementation for select
    (db.select as jest.Mock).mockImplementation(() => ({
      from: jest.fn().mockImplementation(() => ({
        where: jest.fn().mockImplementation(() => ({
          orderBy: jest.fn().mockImplementation(() => ({
            limit: jest.fn().mockResolvedValue([mockCreatedUser])
          }))
        }))
      }))
    }));

    // Mock successful user and team creation but failed activity log
    let insertCallCount = 0;
    (db.insert as jest.Mock).mockImplementation((table) => {
      insertCallCount++;
      if (insertCallCount === 4) { // Activity log is the last insert
        return {
          values: jest.fn().mockImplementation(() => {
            throw new Error('Failed to create activity log');
          })
        };
      }
      return {
        values: jest.fn().mockImplementation(() => ({
          returning: jest.fn().mockResolvedValue(
            table === teams ? [mockCreatedTeam] :
            table === users ? [mockCreatedUser] :
            table === organizations ? [mockCreatedOrg] :
            []
          )
        }))
      };
    });

    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'password123');
    formData.append('first_name', 'Test');
    formData.append('last_name', 'User');
    formData.append('organization', 'Test Organization');

    await expect(signUp({}, formData)).rejects.toThrow('Failed to create activity log');
  });
});