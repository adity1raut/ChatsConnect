import { Link } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";

// Full-screen card for auth hand-off pages: a spinner while working, or an error with a way back
export default function AuthStatusCard({ title, error }) {
  return (
    <div
      className="flex min-h-dvh items-center justify-center bg-bg p-4 text-fg"
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-line bg-surface p-8 text-center shadow-xl"
      >
        {error ? (
          <>
            <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-500" />
            <h1 className="mb-2 text-lg font-bold">Sign-in failed</h1>
            <p
              className="mb-6 text-sm text-muted"
            >
              {error}
            </p>
            <Link
              to="/login"
              replace
              className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500"
            >
              Back to login
            </Link>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-violet-500" />
            <h1 className="text-lg font-bold">{title}</h1>
          </>
        )}
      </div>
    </div>
  );
}
