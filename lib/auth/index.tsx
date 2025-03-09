'use client';

import * as React from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { User, AuthError, Session, AuthChangeEvent } from '@supabase/supabase-js';

// Define AuthUser type as shown in documentation
type AuthUser = User & {
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
    phone_number?: string;
  };
};

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: Error | null;
}

// Create context with proper type guard
const AuthContext = React.createContext<AuthContextType | null>(null);
AuthContext.displayName = 'AuthContext';

// Type guard for auth user as shown in documentation
function isAuthUser(user: User | null): user is AuthUser {
  return user !== null && 'user_metadata' in user;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  React.useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session }, error }: { data: { session: Session | null }, error: AuthError | null }) => {
      if (error) {
        setError(error);
        setLoading(false);
        return;
      }
      // Use type guard when setting user
      const sessionUser = session?.user ?? null;
      setUser(isAuthUser(sessionUser) ? sessionUser : null);
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      const sessionUser = session?.user ?? null;
      setUser(isAuthUser(sessionUser) ? sessionUser : null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  // Create value object with proper typing
  const contextValue: AuthContextType = {
    user,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
