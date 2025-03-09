import { User as SupabaseUser } from '@supabase/supabase-js';
import { Database } from './supabase';
import type { ReactNode } from 'react';

declare global {
  // Enhanced AuthUser type with proper metadata typing
  type AuthUser = SupabaseUser & {
    user_metadata: {
      full_name?: string;
      avatar_url?: string;
      phone_number?: string;
      telegram_username?: string;
      organization_id?: number;
      role_id?: number;
      team_id?: number;
    };
  };

  type UserMetadata = AuthUser['user_metadata'];

  // Database types with proper typing
  type DbUser = Database['public']['Tables']['users']['Row'];
  type DbUserInsert = Database['public']['Tables']['users']['Insert'];
  type DbUserUpdate = Database['public']['Tables']['users']['Update'];

  // Type guard for AuthUser
  function isAuthUser(user: SupabaseUser | null): user is AuthUser;
}

declare module '@/lib/auth' {
  import type { User, AuthError } from '@supabase/supabase-js';
  
  export interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: AuthError | null;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
  }

  export function useAuth(): AuthContextType;
  
  export interface AuthProviderProps {
    children: ReactNode;
  }
  
  export const AuthProvider: React.FC<AuthProviderProps>;

  // Add proper action state types
  export interface ActionState {
    error?: string;
    success?: string;
    email?: string;
    password?: string;
  }
}

export {}; 