import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '@/components/login-form';
import { AuthError } from '@supabase/supabase-js';
import type { AuthResponse } from '@/types/auth.d';

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
  signInWithPassword: jest.fn(),
  signUp: jest.fn()
};

jest.mock('@supabase/ssr', () => ({
  createBrowserClient: () => ({
    auth: mockAuth
  })
}));

describe('LoginForm', () => {
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

      await fireEvent.change(screen.getByRole('textbox', { name: /email/i }), {
        target: { value: 'test@example.com' }
      });
      await fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' }
      });

      await fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

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

      await fireEvent.change(screen.getByRole('textbox', { name: /email/i }), {
        target: { value: 'test@example.com' }
      });
      await fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'wrong-password' }
      });

      await fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

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

      await fireEvent.change(screen.getByRole('textbox', { name: /first name/i }), {
        target: { value: 'John' }
      });
      await fireEvent.change(screen.getByRole('textbox', { name: /last name/i }), {
        target: { value: 'Doe' }
      });
      await fireEvent.change(screen.getByRole('textbox', { name: /email/i }), {
        target: { value: 'test@example.com' }
      });
      await fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' }
      });

      await fireEvent.click(screen.getByRole('button', { name: /create account/i }));

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