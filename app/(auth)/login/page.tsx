import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";

const isDev =
  process.env.NODE_ENV === "development" ||
  process.env.VERCEL_ENV === "preview";

export default async function LoginPage(props: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  const searchParams = await props.searchParams;

  if (session?.user) redirect(searchParams.callbackUrl ?? "/");

  const error = searchParams.error;

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#0f1117]"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 50% 0%, rgba(249,115,22,0.08) 0%, transparent 60%)",
      }}
    >
      <div className="bg-[#181c26] border border-[#252c3e] rounded-2xl p-10 w-[380px] flex flex-col gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-orange-500 rounded-[10px] flex items-center justify-center text-xl shrink-0">
            🍂
          </div>
          <div>
            <div className="font-extrabold text-[17px] text-[#eef0f7] leading-tight">
              Orangeleaf CRM
            </div>
            <div className="text-xs text-[#4e5770] mt-0.5">
              Sign in to continue
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3.5 py-2.5 text-sm text-red-400">
            {error === "OAuthAccountNotLinked"
              ? "This email is already linked to a different provider."
              : error === "CredentialsSignin"
                ? "Invalid email or password."
                : "Authentication failed. Please try again."}
          </div>
        )}

        {/* Microsoft SSO button */}
        <form
          action={async () => {
            "use server";
            await signIn("microsoft-entra-id", {
              redirectTo: searchParams.callbackUrl ?? "/",
            });
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-[9px] text-sm font-medium cursor-pointer border border-[#3d4f6a] bg-[#2a3444] text-[#eef0f7] transition-all hover:bg-[#324060] hover:border-[#00a4ef]"
          >
            <svg width="18" height="18" viewBox="0 0 23 23" fill="none">
              <rect x="1" y="1" width="10" height="10" fill="#f35325" />
              <rect x="12" y="1" width="10" height="10" fill="#81bc06" />
              <rect x="1" y="12" width="10" height="10" fill="#05a6f0" />
              <rect x="12" y="12" width="10" height="10" fill="#ffba08" />
            </svg>
            Sign in with Microsoft
          </button>
        </form>

        {/* Dev-only credentials login */}
        {isDev && (
          <>
            <div className="flex items-center gap-3 my-1">
              <div className="h-px flex-1 bg-[#252c3e]" />
              <span className="text-[11px] text-[#4e5770] uppercase tracking-wider">Dev Login</span>
              <div className="h-px flex-1 bg-[#252c3e]" />
            </div>
            <form
              action={async (formData: FormData) => {
                "use server";
                await signIn("credentials", {
                  email: formData.get("email") as string,
                  password: formData.get("password") as string,
                  redirectTo: searchParams.callbackUrl ?? "/",
                });
              }}
              className="flex flex-col gap-3"
            >
              <input
                name="email"
                type="email"
                placeholder="admin@orangeleaf.com"
                defaultValue="admin@orangeleaf.com"
                className="w-full px-3 py-2.5 rounded-lg bg-[#0f1117] border border-[#252c3e] text-sm text-[#eef0f7] placeholder:text-[#4e5770] focus:outline-none focus:border-orange-500/50"
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                defaultValue="admin"
                className="w-full px-3 py-2.5 rounded-lg bg-[#0f1117] border border-[#252c3e] text-sm text-[#eef0f7] placeholder:text-[#4e5770] focus:outline-none focus:border-orange-500/50"
              />
              <button
                type="submit"
                className="w-full px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer bg-orange-500/20 border border-orange-500/30 text-orange-400 hover:bg-orange-500/30 transition-colors"
              >
                Dev Sign In
              </button>
            </form>
          </>
        )}

        <p className="text-[11.5px] text-[#4e5770] text-center mt-1">
          {isDev
            ? "Dev mode: use admin@orangeleaf.com / admin"
            : "Single sign-on only. Contact your admin if you need access."}
        </p>
      </div>
    </div>
  );
}
