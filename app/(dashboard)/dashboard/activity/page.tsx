import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Settings,
  LogOut,
  UserPlus,
  Lock,
  UserCog,
  AlertCircle,
  UserMinus,
  Mail,
  CheckCircle,
  MessageSquare, // Untuk chat_completion
  DatabaseZap, // Untuk embeddings
  ShieldAlert, // Untuk moderation
  Brain, // Untuk reasoning
  Key, // Untuk API Key
  List, // Untuk models_list
  BarChart, // Untuk usage_query
  Server, // Untuk system_status_check
  type LucideIcon,
} from 'lucide-react';
import { ActivityType } from '@/lib/db/schema'; // Menggunakan tipe ActivityType yang disesuaikan
import { getActivityLogs } from '@/lib/db/queries'; // Menggunakan fungsi yang dimodifikasi

// Sesuaikan pemetaan ikon dengan `action` string yang dikembalikan oleh backend Express.js
const iconMap: Record<ActivityType | string, LucideIcon> = {
  [ActivityType.SIGN_UP]: UserPlus,
  [ActivityType.SIGN_IN]: UserCog,
  [ActivityType.SIGN_OUT]: LogOut,
  [ActivityType.UPDATE_PASSWORD]: Lock,
  [ActivityType.DELETE_ACCOUNT]: UserMinus,
  [ActivityType.UPDATE_ACCOUNT]: Settings,
  [ActivityType.CREATE_TEAM]: UserPlus, // Jika masih ada konsep ini
  [ActivityType.REMOVE_TEAM_MEMBER]: UserMinus, // Jika masih ada konsep ini
  [ActivityType.INVITE_TEAM_MEMBER]: Mail, // Jika masih ada konsep ini
  [ActivityType.ACCEPT_INVITATION]: CheckCircle, // Jika masih ada konsep ini
  [ActivityType.CHAT_COMPLETION]: MessageSquare,
  [ActivityType.EMBEDDINGS]: DatabaseZap,
  [ActivityType.MODERATION]: ShieldAlert,
  [ActivityType.REASONING]: Brain,
  [ActivityType.API_KEY_GENERATED]: Key,
  [ActivityType.API_KEY_DEACTIVATED]: Key,
  [ActivityType.API_KEY_DELETED]: Key,
  [ActivityType.AUTH_CHECK]: UserCog, // Atau ikon lain untuk pemeriksaan otentikasi
  [ActivityType.MODELS_LIST]: List,
  [ActivityType.USAGE_QUERY]: BarChart,
  [ActivityType.SYSTEM_STATUS_CHECK]: Server,
  // Default jika tidak ada yang cocok
  'unknown_action': AlertCircle,
};

function getRelativeTime(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'baru saja';
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;
  return date.toLocaleDateString();
}

function formatAction(action: string): string {
  switch (action) {
    case ActivityType.SIGN_UP: return 'Anda mendaftar';
    case ActivityType.SIGN_IN: return 'Anda masuk';
    case ActivityType.SIGN_OUT: return 'Anda keluar';
    case ActivityType.UPDATE_PASSWORD: return 'Anda mengubah kata sandi';
    case ActivityType.DELETE_ACCOUNT: return 'Anda menghapus akun Anda';
    case ActivityType.UPDATE_ACCOUNT: return 'Anda memperbarui akun Anda';
    case ActivityType.CREATE_TEAM: return 'Anda membuat tim baru';
    case ActivityType.REMOVE_TEAM_MEMBER: return 'Anda menghapus anggota tim';
    case ActivityType.INVITE_TEAM_MEMBER: return 'Anda mengundang anggota tim';
    case ActivityType.ACCEPT_INVITATION: return 'Anda menerima undangan';
    case ActivityType.CHAT_COMPLETION: return 'Menjalankan penyelesaian obrolan';
    case ActivityType.EMBEDDINGS: return 'Menghasilkan embeddings';
    case ActivityType.MODERATION: return 'Melakukan moderasi konten';
    case ActivityType.REASONING: return 'Melakukan proses penalaran AI';
    case ActivityType.API_KEY_GENERATED: return 'Menghasilkan kunci API baru';
    case ActivityType.API_KEY_DEACTIVATED: return 'Menonaktifkan kunci API';
    case ActivityType.API_KEY_DELETED: return 'Menghapus kunci API secara permanen';
    case ActivityType.AUTH_CHECK: return 'Melakukan pemeriksaan otentikasi API';
    case ActivityType.MODELS_LIST: return 'Mengambil daftar model AI';
    case ActivityType.USAGE_QUERY: return 'Mengambil data penggunaan API';
    case ActivityType.SYSTEM_STATUS_CHECK: return 'Memeriksa status sistem';
    default: return `Aksi tidak dikenal: ${action}`;
  }
}

export default async function ActivityPage() {
  // Mengambil log aktivitas dari API Route Next.js, yang kemudian memanggil backend Express.js
  const logs = await getActivityLogs();

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        Log Aktivitas
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length > 0 ? (
            <ul className="space-y-4">
              {logs.map((log) => {
                // Pastikan `log.action` sesuai dengan kunci di `iconMap`
                const Icon = iconMap[log.action] || iconMap['unknown_action'];
                const formattedAction = formatAction(log.action);

                return (
                  <li key={log.id} className="flex items-center space-x-4">
                    <div className="bg-orange-100 rounded-full p-2">
                      <Icon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {formattedAction}
                        {log.ipAddress && ` dari IP ${log.ipAddress}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getRelativeTime(new Date(log.timestamp))}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <AlertCircle className="h-12 w-12 text-orange-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Belum ada aktivitas
              </h3>
              <p className="text-sm text-gray-500 max-w-sm">
                Ketika Anda melakukan tindakan seperti masuk atau memperbarui akun Anda, mereka akan muncul di sini.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
