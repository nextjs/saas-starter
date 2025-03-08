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
      // Add other tables as needed
    }
  }
} 