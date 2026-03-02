// src/app/auth/login/page.tsx
// Login page — Microsoft SSO primary, Google secondary

import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth/config";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; error?: string };
}) {
  const session = await auth();
  if (session?.user) redirect(searchParams.callbackUrl ?? "/");

  const error = searchParams.error;

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-mark">🍂</div>
          <div className="logo-text">
            Orangeleaf CRM
            <span>Sign in to continue</span>
          </div>
        </div>

        {error && (
          <div className="login-error">
            {error === "OAuthAccountNotLinked"
              ? "This email is already linked to a different provider."
              : "Authentication failed. Please try again."}
          </div>
        )}

        {/* Microsoft — Primary SSO */}
        <form
          action={async () => {
            "use server";
            await signIn("microsoft-entra-id", {
              redirectTo: searchParams.callbackUrl ?? "/",
            });
          }}
        >
          <button type="submit" className="sso-btn sso-microsoft">
            <MicrosoftIcon />
            Sign in with Microsoft
          </button>
        </form>

        {/* Google — Secondary */}
        <form
          action={async () => {
            "use server";
            await signIn("google", {
              redirectTo: searchParams.callbackUrl ?? "/",
            });
          }}
        >
          <button type="submit" className="sso-btn sso-google">
            <GoogleIcon />
            Sign in with Google
          </button>
        </form>

        <p className="login-footer">
          Single sign-on only. Contact your admin if you need access.
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0f1117; font-family: 'DM Sans', sans-serif; }

        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0f1117;
          background-image: radial-gradient(ellipse at 50% 0%, rgba(249,115,22,0.08) 0%, transparent 60%);
        }

        .login-card {
          background: #181c26;
          border: 1px solid #252c3e;
          border-radius: 16px;
          padding: 40px 36px;
          width: 380px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .login-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
        }

        .logo-mark {
          width: 40px;
          height: 40px;
          background: #f97316;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        .logo-text {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 17px;
          color: #eef0f7;
          line-height: 1.15;
        }

        .logo-text span {
          display: block;
          font-family: 'DM Sans', sans-serif;
          font-weight: 400;
          font-size: 12px;
          color: #4e5770;
          margin-top: 1px;
        }

        .login-error {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px;
          color: #ef4444;
        }

        .sso-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 11px 16px;
          border-radius: 9px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid #2e3650;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s;
        }

        .sso-microsoft {
          background: #2a3444;
          color: #eef0f7;
          border-color: #3d4f6a;
        }

        .sso-microsoft:hover {
          background: #324060;
          border-color: #00a4ef;
        }

        .sso-google {
          background: transparent;
          color: #8a93b0;
        }

        .sso-google:hover {
          background: #1e2333;
          color: #eef0f7;
        }

        .login-footer {
          font-size: 11.5px;
          color: #4e5770;
          text-align: center;
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 23 23" fill="none">
      <rect x="1"  y="1"  width="10" height="10" fill="#f35325"/>
      <rect x="12" y="1"  width="10" height="10" fill="#81bc06"/>
      <rect x="1"  y="12" width="10" height="10" fill="#05a6f0"/>
      <rect x="12" y="12" width="10" height="10" fill="#ffba08"/>
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
