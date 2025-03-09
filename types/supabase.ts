export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: number
          email: string
          name: string | null
          role: string
          passwordHash: string
          createdAt: Date
          updatedAt: Date
          deletedAt: Date | null
          firstName: string | null
          lastName: string | null
          avatarUrl: string | null
          phoneNumber: string | null
          telegramUsername: string | null
          organizationId: string | null
          roleId: string | null
          teamId: number | null
        }
        Insert: {
          id?: number
          email: string
          name?: string | null
          role: string
          passwordHash: string
          createdAt?: Date
          updatedAt?: Date
          deletedAt?: Date | null
          firstName?: string | null
          lastName?: string | null
          avatarUrl?: string | null
          phoneNumber?: string | null
          telegramUsername?: string | null
          organizationId?: string | null
          roleId?: string | null
          teamId?: number | null
        }
        Update: {
          id?: number
          email?: string
          name?: string | null
          role?: string
          passwordHash?: string
          createdAt?: Date
          updatedAt?: Date
          deletedAt?: Date | null
          firstName?: string | null
          lastName?: string | null
          avatarUrl?: string | null
          phoneNumber?: string | null
          telegramUsername?: string | null
          organizationId?: string | null
          roleId?: string | null
          teamId?: number | null
        }
      }
      teams: {
        Row: {
          id: number
          name: string
          ownerId: number
          createdAt: Date
          updatedAt: Date
          stripeCustomerId: string | null
          stripeSubscriptionId: string | null
          stripeProductId: string | null
          planName: string | null
          subscriptionStatus: string | null
        }
        Insert: {
          id?: number
          name: string
          ownerId: number
          createdAt?: Date
          updatedAt?: Date
          stripeCustomerId?: string | null
          stripeSubscriptionId?: string | null
          stripeProductId?: string | null
          planName?: string | null
          subscriptionStatus?: string | null
        }
        Update: {
          id?: number
          name?: string
          ownerId?: number
          createdAt?: Date
          updatedAt?: Date
          stripeCustomerId?: string | null
          stripeSubscriptionId?: string | null
          stripeProductId?: string | null
          planName?: string | null
          subscriptionStatus?: string | null
        }
      }
      team_members: {
        Row: {
          id: number
          teamId: number
          userId: number
          role: string
          createdAt: Date
          updatedAt: Date
        }
        Insert: {
          id?: number
          teamId: number
          userId: number
          role: string
          createdAt?: Date
          updatedAt?: Date
        }
        Update: {
          id?: number
          teamId?: number
          userId?: number
          role?: string
          createdAt?: Date
          updatedAt?: Date
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          createdAt: Date
          updatedAt: Date
          ownerId: number
          settings: Record<string, any>
        }
        Insert: {
          id?: string
          name: string
          createdAt?: Date
          updatedAt?: Date
          ownerId: number
          settings?: Record<string, any>
        }
        Update: {
          id?: string
          name?: string
          createdAt?: Date
          updatedAt?: Date
          ownerId?: number
          settings?: Record<string, any>
        }
      }
      roles: {
        Row: {
          id: string
          name: string
          permissions: string[]
          createdAt: Date
          updatedAt: Date
        }
        Insert: {
          id?: string
          name: string
          permissions: string[]
          createdAt?: Date
          updatedAt?: Date
        }
        Update: {
          id?: string
          name?: string
          permissions?: string[]
          createdAt?: Date
          updatedAt?: Date
        }
      }
      activity_logs: {
        Row: {
          id: number
          userId: number
          action: string
          details: Record<string, any>
          createdAt: Date
          teamId: number | null
          organizationId: string | null
        }
        Insert: {
          id?: number
          userId: number
          action: string
          details: Record<string, any>
          createdAt?: Date
          teamId?: number | null
          organizationId?: string | null
        }
        Update: {
          id?: number
          userId?: number
          action?: string
          details?: Record<string, any>
          createdAt?: Date
          teamId?: number | null
          organizationId?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 