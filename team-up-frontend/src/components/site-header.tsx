import { Link, useRouter, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { LogOut, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export function SiteHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const location = useLocation();

  // ✅ Prevent hydration mismatch
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // ⛔ wait for client

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border/40">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="size-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
            <Sparkles className="size-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">AURA</span>
        </Link>

          {user && (
            <nav className="flex items-center gap-2">
              <span className="hidden sm:inline text-sm text-muted-foreground mr-2">
                {user.name || user.email}
                {user.role === "admin" && <span className="ml-1 text-primary">• admin</span>}
              </span>

              {user.role === "participant" && (
                <Button asChild variant="ghost" size="sm">
                  <Link to="/events">Events</Link>
                </Button>
              )}

              <Button asChild variant="ghost" size="sm">
                <Link to={user.role === "admin" ? "/admin" : "/dashboard"}>Dashboard</Link>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  logout();
                  router.navigate({ to: "/" });
                }}
              >
                <LogOut className="size-4 mr-1" />
                Logout
              </Button>
            </nav>
          )}
      </div>
    </header>
  );
}
