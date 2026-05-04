import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { api, type Team, ApiError } from "@/lib/api";
import { getEvent } from "@/lib/events";
import { Button } from "@/components/ui/button";
import { Crown, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [mounted, setMounted] = useState(false);
  const [teams, setTeams] = useState<Team[] | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!user) {
      navigate({ to: "/login" });
      return;
    }

    if (user.role === "admin") {
      navigate({ to: "/admin" });
      return;
    }

    api
      .myTeams()
      .then(setTeams)
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : "Failed to load teams");
        setTeams([]);
      });
  }, [user, navigate, mounted]);

  if (!mounted) return null;
  if (!user) return null;

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold">My Teams</h1>
            <p className="text-muted-foreground">All your event registrations</p>
          </div>

          <Button asChild>
            <Link to="/events">
              <Plus className="mr-2" />
              Register
            </Link>
          </Button>
        </div>

        {!teams ? (
          <div className="mt-10 text-center">
            <Loader2 className="animate-spin inline mr-2" />
            Loading...
          </div>
        ) : teams.length === 0 ? (
          <div className="mt-10 text-center">
            No teams yet
            <br />
            <Link to="/events">Browse events</Link>
          </div>
        ) : (
          <div className="grid gap-4 mt-8">
            {teams.map((t) => {
              const ev = getEvent(t.event);
              const isLeader = t.leader_id === user.id;

              return (
                <Link
                  key={t.id}
                  to="/teams/$teamId"
                  params={{ teamId: t.id }}
                  className="p-6 border rounded-xl"
                >
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <span>{ev?.emoji}</span>
                      <span>{ev?.name || t.event}</span>
                    </span>
                    {isLeader && (
                      <span className="text-yellow-400 flex gap-1">
                        <Crown size={14} /> Leader
                      </span>
                    )}
                  </div>

                  <h3 className="mt-2 text-xl font-semibold">{t.name}</h3>

                  <div className="flex justify-between mt-3">
                    <span>{t.code}</span>
                    <span>
                      {t.members.length}/{t.max_size}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
