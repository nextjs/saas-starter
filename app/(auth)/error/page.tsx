import Link from "next/link";

export default async function AuthErrorPage(props: {
  searchParams: Promise<{ error?: string }>;
}) {
  const searchParams = await props.searchParams;
  const error = searchParams.error;

  const errorMessages: Record<string, string> = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "You do not have access to this application.",
    Verification: "The verification link has expired or has already been used.",
    OAuthSignin: "Could not start the sign-in process. Please try again.",
    OAuthCallback: "Sign-in callback failed. Please try again.",
    OAuthAccountNotLinked:
      "This email is already associated with a different sign-in method.",
    Default: "An unexpected authentication error occurred.",
  };

  const message = error
    ? errorMessages[error] ?? errorMessages.Default
    : errorMessages.Default;

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#0f1117]">
      <div className="bg-[#181c26] border border-[#252c3e] rounded-2xl p-10 w-[380px] flex flex-col gap-4 text-center">
        <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
          <svg
            className="w-6 h-6 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h1 className="text-lg font-semibold text-[#eef0f7]">
          Authentication Error
        </h1>
        <p className="text-sm text-[#8a93b0]">{message}</p>
        <Link
          href="/login"
          className="mt-2 inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
