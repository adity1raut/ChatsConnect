import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Button, Card, Corners, Spinner } from "../../components/ui";

// Full-screen panel for auth hand-off pages: a spinner while working, or an error with a way back
export default function AuthStatusCard({ title, error }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background bg-grid p-4 text-foreground">
      <Card className="w-full max-w-sm p-8 text-center">
        <Corners />
        {error ? (
          <>
            <AlertCircle className="mx-auto mb-4 size-9 text-destructive" aria-hidden="true" />
            <h1 className="text-sm font-bold tracking-[0.14em] uppercase">Sign-in failed</h1>
            <p className="mt-3 mb-6 text-xs leading-relaxed text-muted-foreground">{error}</p>
            <Button asChild>
              <Link to="/login" replace>
                Back to sign in
              </Link>
            </Button>
          </>
        ) : (
          <>
            <Spinner label={title} className="mx-auto mb-5 size-8" />
            <h1 className="text-sm font-bold tracking-[0.14em] uppercase">{title}</h1>
          </>
        )}
      </Card>
    </div>
  );
}
