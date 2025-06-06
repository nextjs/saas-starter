'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { useActionState } from 'react';
import { Team, User, ApiKey } from '@/lib/db/schema'; // Menggunakan tipe yang disesuaikan
import useSWR from 'swr';
import { Suspense } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, PlusCircle, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { requestSubscriptionEmail } from '@/app/(dashboard)/pricing/actions'; // Menggunakan aksi permintaan email
import { generateUserApiKey, deactivateUserApiKey, deleteUserApiKeyPermanent } from '@/app/actions/api-key-actions'; // Import aksi API Key baru

type ActionState = {
  error?: string;
  success?: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function SubscriptionInfoSkeleton() {
  return (
    <Card className="mb-8 h-[140px]">
      <CardHeader>
        <CardTitle>Informasi Langganan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
          <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
          <div className="h-9 w-1/3 bg-gray-200 rounded-full"></div>
        </div>
      </CardContent>
    </Card>
  );
}

function SubscriptionInfo() {
  // Mengambil data pengguna dari API Route Next.js
  const { data: user } = useSWR<User>('/api/user', fetcher);
  // Mengambil data tim dari API Route Next.js (jika ada konsep tim di backend Anda)
  const { data: teamData } = useSWR<Team>('/api/team', fetcher);

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    requestSubscriptionEmail,
    {}
  );

  // Data dummy untuk plan (sesuaikan jika Anda memiliki endpoint di Express.js untuk daftar plan)
  const DUMMY_PRICING_PLANS = {
    'basic-plan': 'Dasar',
    'pro-plan': 'Pro',
    'Free': 'Gratis', // Tambahkan tier gratis
  };

  const currentPlanName = teamData?.planName || 'Free'; // Asumsi 'Free' jika tidak ada plan
  const currentSubscriptionStatus = teamData?.subscriptionStatus;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Informasi Langganan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="mb-4 sm:mb-0">
              <p className="font-medium">
                Paket Saat Ini: {DUMMY_PRICING_PLANS[currentPlanName as keyof typeof DUMMY_PRICING_PLANS] || currentPlanName}
              </p>
              <p className="text-sm text-muted-foreground">
                {currentSubscriptionStatus === 'active'
                  ? 'Aktif, ditagih bulanan.'
                  : currentSubscriptionStatus === 'trialing'
                  ? 'Periode uji coba aktif.'
                  : 'Tidak ada langganan aktif.'}
              </p>
            </div>
            {/* Tombol untuk meminta perubahan langganan via email */}
            <form action={formAction}>
              <input type="hidden" name="planId" value={currentPlanName} />
              <input type="hidden" name="planName" value={DUMMY_PRICING_PLANS[currentPlanName as keyof typeof DUMMY_PRICING_PLANS] || currentPlanName} />
              <Button type="submit" variant="outline" disabled={pending}>
                {pending ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Mengirim...
                  </>
                ) : (
                  'Ubah Langganan'
                )}
              </Button>
            </form>
          </div>
          {state.error && <p className="text-red-500 mt-4">{state.error}</p>}
          {state.success && <p className="text-green-500 mt-4">{state.success}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function ApiKeysSkeleton() {
  return (
    <Card className="mb-8 h-[200px]">
      <CardHeader>
        <CardTitle>Kunci API Anda</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
            <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
          </div>
          <div className="flex items-center justify-between">
            <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
            <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ApiKeyManagement() {
  // Mengambil kunci API dari API Route Next.js, yang kemudian memanggil backend Express.js
  const { data: apiKeysData, mutate: mutateApiKeys } = useSWR<{ status: boolean; keys: ApiKey[] }>('/api/keys', fetcher);
  const apiKeys = apiKeysData?.keys || [];

  const [generateState, generateAction, isGeneratePending] = useActionState<ActionState & { apiKey?: ApiKey }, FormData>(generateUserApiKey, {});
  const [deactivateState, deactivateAction, isDeactivatePending] = useActionState<ActionState, FormData>(deactivateUserApiKey, {});
  const [deleteState, deleteAction, isDeletePending] = useActionState<ActionState, FormData>(deleteUserApiKeyPermanent, {});

  // Menggunakan useEffect untuk memuat ulang data setelah aksi berhasil
  React.useEffect(() => {
    if (generateState.success || deactivateState.success || deleteState.success) {
      mutateApiKeys(); // Memuat ulang data kunci API
    }
  }, [generateState.success, deactivateState.success, deleteState.success, mutateApiKeys]);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Kunci API Anda</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {apiKeys.length === 0 ? (
            <p className="text-muted-foreground">Anda belum memiliki kunci API.</p>
          ) : (
            <ul className="space-y-4">
              {apiKeys.map((key) => (
                <li key={key.id} className="border p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-lg">{key.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${key.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {key.isActive ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 break-all mb-2">
                    Kunci: <span className="font-mono text-xs select-all">{key.id}</span>
                  </p>
                  <p className="text-sm text-gray-500">Tier: {key.tier}</p>
                  <p className="text-sm text-gray-500">
                    Digunakan (Harian): {key.dailyUsage} / {key.dailyLimit} (Sisa: {key.dailyLimit - key.dailyUsage})
                  </p>
                  <p className="text-sm text-gray-500">
                    Digunakan (Bulanan): {key.monthlyUsage} / {key.monthlyLimit} (Sisa: {key.monthlyLimit - key.monthlyUsage})
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Dibuat: {key.createdAt.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    Terakhir Digunakan: {key.lastUsed ? key.lastUsed.toLocaleString() : 'Tidak pernah'}
                  </p>
                  <div className="mt-4 flex gap-2">
                    {key.isActive ? (
                      <form action={deactivateAction}>
                        <input type="hidden" name="apiKeyString" value={key.id} />
                        <Button type="submit" variant="outline" size="sm" disabled={isDeactivatePending}>
                          {isDeactivatePending ? 'Menonaktifkan...' : 'Nonaktifkan'}
                        </Button>
                      </form>
                    ) : (
                      <form action={deleteAction}>
                        <input type="hidden" name="apiKeyString" value={key.id} />
                        <Button type="submit" variant="destructive" size="sm" disabled={isDeletePending}>
                          {isDeletePending ? 'Menghapus...' : 'Hapus Permanen'}
                        </Button>
                      </form>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {generateState.error && <p className="text-red-500 mt-4">{generateState.error}</p>}
          {generateState.success && (
            <div className="mt-4 text-green-500">
              <p>{generateState.success}</p>
              {generateState.apiKey && (
                <p className="font-mono text-sm break-all">Kunci Baru: {generateState.apiKey.id}</p>
              )}
              <p className="text-sm text-gray-600">{generateState.note}</p>
            </div>
          )}
          {deactivateState.error && <p className="text-red-500 mt-4">{deactivateState.error}</p>}
          {deactivateState.success && <p className="text-green-500 mt-4">{deactivateState.success}</p>}
          {deleteState.error && <p className="text-red-500 mt-4">{deleteState.error}</p>}
          {deleteState.success && <p className="text-green-500 mt-4">{deleteState.success}</p>}
        </div>
      </CardContent>
      <CardFooter>
        <form action={generateAction} className="w-full">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              name="name"
              placeholder="Nama Kunci (Opsional)"
              maxLength={100}
              className="flex-1"
              disabled={isGeneratePending}
            />
            <Input
              name="tier"
              placeholder="Tier (e.g., Free, Basic)"
              defaultValue="Free"
              maxLength={50}
              className="flex-1"
              disabled={isGeneratePending}
            />
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white" disabled={isGeneratePending}>
              {isGeneratePending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Membuat...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Buat Kunci API Baru
                </>
              )}
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">Pengaturan Akun</h1>
      <Suspense fallback={<SubscriptionInfoSkeleton />}>
        <SubscriptionInfo />
      </Suspense>
      <Suspense fallback={<ApiKeysSkeleton />}>
        <ApiKeyManagement />
      </Suspense>
      {/* Bagian terkait Team Members DIHILANGKAN */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Manajemen Tim</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Fungsionalitas manajemen tim (anggota tim, undangan) dikelola sepenuhnya di backend Express.js Anda.
            Silakan gunakan antarmuka administrasi backend Anda untuk fitur-fitur ini.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
