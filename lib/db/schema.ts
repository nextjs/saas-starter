// lib/db/schema.ts
// File ini sekarang hanya berisi definisi tipe TypeScript
// yang mencerminkan struktur data dari backend Express.js Anda.

// Tipe untuk Pengguna, disesuaikan dengan respons /api/auth/profile dan /api/auth/login
export type User = {
  id: number;
  name: string | null; // Dari 'username' atau 'name' di respons Express.js
  email: string;
  passwordHash: string; // Dummy, tidak akan diisi dari frontend
  createdAt: Date; // Dari 'created_at' di respons Express.js
  updatedAt: Date; // Dari 'last_login' atau 'updated_at' di respons Express.js
  deletedAt: Date | null; // Jika ada di respons Express.js
  emailVerified: boolean; // Dari 'email_verified' di respons /login dan /register
};

// Tipe untuk Tim, disesuaikan dengan respons /api/team (tanpa anggota tim)
// Properti terkait Stripe DIHILANGKAN
// Properti teamMembers DIHILANGKAN
export type Team = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  planName: string | null; // Dari 'plan_name' di respons Express.js
  subscriptionStatus: string | null; // Dari 'subscription_status' di respons Express.js
};

// Tipe untuk Log Aktivitas, disesuaikan dengan respons /v1/usage
export type ActivityLog = {
  id: number;
  teamId: number | null; // Jika ada di log usage Express.js (dibuat opsional)
  userId: number;
  action: string; // Misalnya 'chat_completion', 'auth_check', 'models_list'
  timestamp: Date; // Dari 'created_at' atau 'usage_date' di log usage Express.js
  ipAddress: string | null; // Jika ada di log usage Express.js (dibuat opsional)
  userName: string | null; // Jika log usage Express.js menyertakan nama pengguna (dibuat opsional)
};

// Tipe untuk Kunci API, disesuaikan dengan respons /api/keys
export type ApiKey = {
  id: string; // Ini adalah 'id_key_string' atau 'api_key' dari Express.js
  keyInternalId: number; // Ini adalah 'key_uuid' atau 'id' internal dari Express.js
  name: string | null;
  tier: string; // Nama tier, misalnya 'Free', 'Basic'
  dailyUsage: number;
  monthlyUsage: number;
  dailyLimit: number;
  monthlyLimit: number;
  isActive: boolean;
  createdAt: Date;
  lastUsed: Date | null;
  dailyResetAt: Date;
  monthlyResetAt: Date;
  creator: string;
};

// Tipe untuk TeamDataWithMembers (dibuat kosong karena teamMembers dihilangkan)
export type TeamDataWithMembers = Team;


// Definisi ActivityType (tetap relevan untuk frontend)
export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  // Aksi terkait tim DIHILANGKAN jika tidak ada di backend atau tidak relevan
  // CREATE_TEAM = 'CREATE_TEAM',
  // REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  // INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  // ACCEPT_INVITATION = 'ACCEPT_INVITATION',

  // Aksi yang berasal dari request_type usage_logs Express.js
  CHAT_COMPLETION = 'chat_completion',
  EMBEDDINGS = 'embeddings',
  MODERATION = 'moderation',
  REASONING = 'reasoning',
  AUTH_CHECK = 'auth_check',
  MODELS_LIST = 'models_list',
  USAGE_QUERY = 'usage_query',
  SYSTEM_STATUS_CHECK = 'system_status_check',

  // Aksi kustom untuk frontend jika Express.js tidak mengembalikan string aksi yang tepat
  API_KEY_GENERATED = 'API_KEY_GENERATED',
  API_KEY_DEACTIVATED = 'API_KEY_DEACTIVATED',
  API_KEY_DELETED = 'API_KEY_DELETED',
  UNKNOWN_ACTION = 'unknown_action',
}
