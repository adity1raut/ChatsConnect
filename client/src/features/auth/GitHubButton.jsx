import { useState } from "react";
import { Github } from "lucide-react";
import { API_URL } from "../../config/api.js";
import { Button } from "../../components/ui";

export default function GitHubButton({ label = "Continue with GitHub" }) {
  const [redirecting, setRedirecting] = useState(false);
  return (
    <Button
      variant="outline"
      icon={Github}
      fullWidth
      loading={redirecting}
      onClick={() => {
        setRedirecting(true);
        window.location.href = `${API_URL}/auth/github`;
      }}
    >
      {label}
    </Button>
  );
}

export function OrDivider() {
  return (
    <div className="my-5 flex items-center gap-3 text-xs text-faint" role="separator">
      <span className="h-px flex-1 bg-border" />
      or
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
