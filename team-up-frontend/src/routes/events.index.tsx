import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { EVENTS } from "@/lib/events";
import { api, type Team } from "@/lib/api";

export const Route = createFileRoute("/events/")({
  component: EventsPage,
});

function EventsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [mounted, setMounted] = useState(false);
  const [myTeams, setMyTeams] = useState<Team[]>([]);

  // ✅ Fix hydration
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
      .then(setMyTeams)
      .catch(() => {});
  }, [user, navigate, mounted]);

  if (!mounted) return null;
  if (!user) return null;

  const teamForEvent = (eventId: string) => myTeams.find((t) => t.event === eventId);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl">
          <p className="text-sm text-muted-foreground">
            Hi {user.name?.split(" ")[0] || "there"} 👋
          </p>

          <h1 className="font-display text-4xl font-bold mt-1">Pick an event to get started</h1>

          <p className="text-muted-foreground mt-3">Each event has its own team size rules.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
          {EVENTS.map((e) => {
            const joined = teamForEvent(e.id);

            return (
              <Link
                key={e.id}
                to="/events/$eventId"
                params={{ eventId: e.id }}
                className="rounded-2xl p-6 border border-border bg-card hover:border-primary transition"
              >
                <div className="text-4xl">{e.emoji}</div>
                <h3 className="font-semibold text-xl mt-3">{e.name}</h3>
                <p className="text-sm text-muted-foreground">{e.tagline}</p>

                <div className="mt-4 flex justify-between">
                  <span className="text-xs">
                    {e.minSize === e.maxSize ? "Solo" : `${e.minSize}-${e.maxSize}`}
                  </span>

                  {joined && <span className="text-primary">✓ Joined</span>}
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
