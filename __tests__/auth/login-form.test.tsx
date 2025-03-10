import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { LoginForm } from '@/components/login-form';
import { AuthError } from '@supabase/supabase-js';
import type { AuthResponse } from '@/types/auth.d';
import userEvent from '@testing-library/user-event';

// Mock next-themes
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn()
  })
}));

// Mock Supabase client
const mockAuth = {
  signInWithPassword: jest.fn<Promise<AuthResponse>, [any]>(),
  signUp: jest.fn<Promise<AuthResponse>, [any]>()
};

jest.mock('@supabase/ssr', () => ({
  createBrowserClient: () => ({
    auth: mockAuth
  })
}));

describe('LoginForm', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Sign In Mode', () => {
    const mockSignInSuccess: AuthResponse = {
      data: { user: { id: '1' } },
      error: null
    };

    const mockSignInError: AuthResponse = {
      data: { user: null },
      error: new AuthError('Invalid credentials')
    };

    it('renders sign in form with all elements', () => {
      render(<LoginForm mode="signin" />);

      // Using role-based queries where possible
      expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    });

    it('handles successful sign in', async () => {
      mockAuth.signInWithPassword.mockResolvedValueOnce(mockSignInSuccess);
      render(<LoginForm mode="signin" />);

      await user.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123'
        });
      });
    });

    it('displays error message on failed sign in', async () => {
      mockAuth.signInWithPassword.mockResolvedValueOnce(mockSignInError);

      render(<LoginForm mode="signin" />);

      await user.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'wrong-password');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/invalid credentials/i);
      });
    });
  });

  describe('Sign Up Mode', () => {
    const mockSignUpSuccess: AuthResponse = {
      data: { user: { id: '1' } },
      error: null
    };

    it('renders sign up form with all elements', () => {
      render(<LoginForm mode="signup" />);

      expect(screen.getByRole('textbox', { name: /first name/i })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /last name/i })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('handles successful sign up', async () => {
      mockAuth.signUp.mockResolvedValueOnce(mockSignUpSuccess);

      render(<LoginForm mode="signup" />);

      await user.type(screen.getByRole('textbox', { name: /first name/i }), 'John');
      await user.type(screen.getByRole('textbox', { name: /last name/i }), 'Doe');
      await user.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');

      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(mockAuth.signUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          options: {
            data: {
              first_name: 'John',
              last_name: 'Doe'
            }
          }
        });
      });
    });
  });
}); 