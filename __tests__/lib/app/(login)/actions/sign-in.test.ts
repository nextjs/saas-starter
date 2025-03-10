import '@testing-library/jest-dom';
import { signIn } from '@/app/(login)/actions';
import { createClient } from '@/utils/supabase/server';
import { AuthError } from '@supabase/supabase-js';
import { db } from '@/lib/db/drizzle';
import { users, teams, teamMembers, activityLogs, ActivityType } from '@/lib/db/schema'; // Import your schema
import { eq, and, desc } from 'drizzle-orm';
import { redirect } from 'next/navigation';

// Add type for the signIn response
type SignInResponse = {
  error?: string;
  success?: string;
  email?: string;
} | void;

jest.mock('@/utils/supabase/server'); // Mock the server client
jest.mock('next/navigation', () => ({
    redirect: jest.fn()
}));
jest.mock('@/lib/db/drizzle');

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

describe('signIn Action', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (db.select as jest.Mock).mockClear();
        (db.insert as jest.Mock).mockClear();

        mockCreateClient.mockReturnValue({
            auth: {
                signInWithPassword: jest.fn(),
                signOut: jest.fn(), // Add other auth methods if used
                signUp: jest.fn(),
                 updateUser: jest.fn(),
                  admin: {
                      deleteUser: jest.fn(),
                  },
                  getUser: jest.fn(),
            }
        } as any);
    });


    it('should successfully sign in a user with valid credentials', async () => {
        const mockUserData = { id: 1, email: 'test@example.com', name: 'Test User' };
        const mockTeamData = { id: 1, name: 'Test Team' };
        const mockAuthResponse = {
            data: { user: { id: 'supabase-uid', email: 'test@example.com' } },
            error: null,
        };

        mockCreateClient().auth.signInWithPassword.mockResolvedValue(mockAuthResponse);

        (db.select as jest.Mock).mockResolvedValueOnce([mockUserData]);
        (db.select as jest.Mock).mockResolvedValueOnce([mockTeamData]);

        (db.insert as jest.Mock).mockResolvedValueOnce({ returning: [] }); // For activity log.

        const formData = new FormData();
        formData.append('email', 'test@example.com');
        formData.append('password', 'password123');

        const result = await signIn({}, formData);

        expect(mockCreateClient().auth.signInWithPassword).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'password123',
        });

        expect(db.select).toHaveBeenCalledTimes(2);
        expect(db.insert).toHaveBeenCalledWith(activityLogs);
        expect(redirect).toHaveBeenCalledWith('/dashboard');
        expect(result).toEqual({ success: 'Signed in successfully' });

    });

    it('should redirect to a custom path if redirectTo is provided', async () => {
        const mockUserData = { id: 1, email: 'test@example.com', name: 'Test User' };
        const mockTeamData = { id: 1, name: 'Test Team' };

        const mockAuthResponse = {
            data: { user: { id: 'supabase-uid', email: 'test@example.com' } },
            error: null,
        };
        mockCreateClient().auth.signInWithPassword.mockResolvedValue(mockAuthResponse);
        (db.select as jest.Mock).mockResolvedValueOnce([mockUserData]);
        (db.select as jest.Mock).mockResolvedValueOnce([mockTeamData]);
        (db.insert as jest.Mock).mockResolvedValueOnce({ returning: [] }); // For activity log.

        const formData = new FormData();
        formData.append('email', 'test@example.com');
        formData.append('password', 'password123');
        formData.append('redirectTo', '/custom-path'); // Add the redirectTo

        const result = await signIn({}, formData);
        expect(redirect).toHaveBeenCalledWith('/custom-path'); // Check custom path
    });



    it('should handle Supabase Auth errors', async () => {
      const authError = new AuthError('Invalid credentials');
      mockCreateClient().auth.signInWithPassword.mockResolvedValue({ data: { user: null }, error: authError });

      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'wrongpassword');

      const result = await signIn({}, formData);

      expect(result).toEqual({
        error: 'Invalid credentials',
        email: 'test@example.com', // Check that email is returned
      });
    });


      it('should handle database errors during user retrieval', async () => {
          const mockAuthResponse = {
            data: { user: { id: 'supabase-uid', email: 'test@example.com' } },
            error: null,
          };
        mockCreateClient().auth.signInWithPassword.mockResolvedValue(mockAuthResponse);
        (db.select as jest.Mock).mockRejectedValueOnce(new Error('DB error'));


        const formData = new FormData();
        formData.append('email', 'test@example.com');
        formData.append('password', 'password123');

        // We expect the function to throw
        await expect(signIn({}, formData)).rejects.toThrow('DB error');
        expect(db.select).toHaveBeenCalledTimes(1); // The team query should not be called
      });

      it('should handle database errors during activity log', async () => {
          const mockUserData = { id: 1, email: 'test@example.com', name: 'Test User' };
          const mockTeamData = { id: 1, name: 'Test Team' };
          const mockAuthResponse = {
              data: { user: { id: 'supabase-uid', email: 'test@example.com' } },
              error: null,
          };
          mockCreateClient().auth.signInWithPassword.mockResolvedValue(mockAuthResponse);

          (db.select as jest.Mock).mockResolvedValueOnce([mockUserData]);
          (db.select as jest.Mock).mockResolvedValueOnce([mockTeamData]);

          (db.insert as jest.Mock).mockRejectedValueOnce(new Error('DB error')); // For activity log.

          const formData = new FormData();
          formData.append('email', 'test@example.com');
          formData.append('password', 'password123');

          // We expect the function to throw
            await expect(signIn({}, formData)).rejects.toThrow('DB error');


      });


    it('should handle missing user data from Supabase', async () => {
        mockCreateClient().auth.signInWithPassword.mockResolvedValue({ data: { user: null }, error: null });

        const formData = new FormData();
        formData.append('email', 'test@example.com');
        formData.append('password', 'password123');

        const result = await signIn({}, formData) as SignInResponse;
        expect(result?.error).toBe('Failed to sign in. No user data returned.');
    });


    it('should validate input fields', async () => {
      const formData = new FormData();
      // Missing email
      let result = await signIn({}, formData) as SignInResponse;
      expect(result?.error).toBe('Invalid email');

      formData.append('email', 'invalid-email');
      result = await signIn({}, formData) as SignInResponse;
      expect(result?.error).toBe('Invalid email');


      formData.set('email', 'valid@email.com');
      formData.append('password', 'short');
      result = await signIn({}, formData) as SignInResponse;

      expect(result?.error).toBe('password must be at least 8 characters');
    });
    it('should handle no user returned from db', async () => {
        const mockAuthResponse = {
            data: { user: { id: 'supabase-uid', email: 'test@example.com' } },
            error: null,
        };
        mockCreateClient().auth.signInWithPassword.mockResolvedValue(mockAuthResponse);
        (db.select as jest.Mock).mockResolvedValueOnce([]);


        const formData = new FormData();
        formData.append('email', 'test@example.com');
        formData.append('password', 'password123');
                // We expect the function to throw
        await expect(signIn({}, formData)).rejects.toThrow();
    });

});