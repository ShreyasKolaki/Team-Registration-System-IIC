import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState, type FormEvent } from "react";
import { getEvent } from "@/lib/events";
import { api, ApiError, type Team } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Users, Plus, Hash, QrCode, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/events/$eventId")({
  head: ({ params }) => {
    const ev = getEvent(params.eventId);
    return {
      meta: [
        { title: `${ev?.name ?? "Event"} — TeamForge` },
        {
          name: "description",
          content: ev ? `Form your ${ev.name} team` : "Create or join a team",
        },
      ],
    };
  },
  component: EventDetail,
});

function EventDetail() {
  const { eventId } = Route.useParams();
  const ev = getEvent(eventId);

  const { user } = useAuth();
  const navigate = useNavigate();

  const [existing, setExisting] = useState<Team | null>(null);
  const [loadingState, setLoadingState] = useState(true);

  const [mode, setMode] = useState<"choose" | "create" | "payment" | "join">("choose");
  const [teamName, setTeamName] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  // 🔥 Check if user already has team
  useEffect(() => {
    if (!user) {
      navigate({ to: "/login" });
      return;
    }

    setLoadingState(true);

    api
      .myTeams()
      .then((teams) => {
        const found = teams.find((t) => t.event === eventId);
        setExisting(found || null);
      })
      .catch(() => {
        toast.error("Failed to load teams");
      })
      .finally(() => setLoadingState(false));
  }, [user, eventId, navigate]);

  if (!user) {
    return null; // Don't flash content while redirecting
  }

  if (!ev) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-3xl">Event not found</h1>
          <Link to="/events" className="text-primary underline mt-4 inline-block">
            Back to events
          </Link>
        </main>
      </div>
    );
  }

  // ===== CREATE TEAM =====
  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();

    if (!teamName.trim()) {
      toast.error("Team name is required");
      return;
    }
    setMode("payment");
  };

  const handlePayment = async (e: FormEvent) => {
    e.preventDefault();

    if (!transactionId.trim()) {
      toast.error("Please enter the transaction ID");
      return;
    }

    setBusy(true);
    try {
      const team = await api.createTeam({
        name: teamName.trim(),
        event: eventId,
        transaction_id: transactionId.trim(),
      });

      toast.success(`Team created! Code: ${team.code}`);

      navigate({
        to: "/teams/$teamId",
        params: { teamId: team.id },
      });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not create team");
    } finally {
      setBusy(false);
    }
  };

  // ===== JOIN TEAM =====
  const handleJoin = async (e: FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      toast.error("Enter team code");
      return;
    }

    setBusy(true);
    try {
      const team = await api.joinTeam({
        code: code.trim().toUpperCase(),
      });

      toast.success(`Joined ${team.name}!`);

      navigate({
        to: "/teams/$teamId",
        params: { teamId: team.id },
      });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not join team");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Link
          to="/events"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="size-4" /> All events
        </Link>

        {/* EVENT HEADER */}
        <div className={`rounded-3xl p-8 border border-border bg-gradient-to-br ${ev.accent}`}>
          <div className="text-5xl">{ev.emoji}</div>
          <h1 className="font-display text-4xl font-bold mt-3">{ev.name}</h1>
          <p className="text-muted-foreground mt-1 text-lg">{ev.tagline}</p>
          <p className="text-muted-foreground/80 mt-3 max-w-2xl">{ev.description}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-md bg-background/50 border border-border">
              Team size:{" "}
              {ev.minSize === ev.maxSize ? `${ev.minSize} (solo)` : `${ev.minSize}–${ev.maxSize}`}
            </div>
            
            {ev.contactName && (
              <div className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-md bg-background/50 border border-border text-primary">
                Coordinator: {ev.contactName} ({ev.contactPhone})
              </div>
            )}
          </div>
        </div>

        {/* LOADING */}
        {loadingState ? (
          <div className="mt-10 text-center text-muted-foreground">
            <Loader2 className="animate-spin inline mr-2" />
            Checking your registration…
          </div>
        ) : existing ? (
          // ===== ALREADY IN TEAM =====
          <div className="mt-8 rounded-2xl p-6 border border-primary/40 bg-primary/5">
            <p className="text-sm text-muted-foreground">
              You're already in a team for this event.
            </p>
            <h2 className="font-display text-2xl font-bold mt-1">{existing.name}</h2>
            <p className="font-mono text-sm text-primary mt-1">Code: {existing.code}</p>

            <Button asChild className="mt-4" variant="hero">
              <Link to="/teams/$teamId" params={{ teamId: existing.id }}>
                Open team dashboard
              </Link>
            </Button>
          </div>
        ) : (
          // ===== CREATE / JOIN FLOW =====
          <div className="mt-8">
            {mode === "choose" && (
              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setMode("create")}
                  className="text-left rounded-2xl p-6 border border-border hover:border-primary/60 transition-all"
                >
                  <Plus className="mb-3 text-primary" />
                  <h3 className="font-semibold">Create a team</h3>
                  <p className="text-sm text-muted-foreground">Become leader and share code</p>
                </button>

                <button
                  onClick={() => setMode("join")}
                  className="text-left rounded-2xl p-6 border border-border hover:border-primary/60 transition-all"
                >
                  <Hash className="mb-3 text-primary" />
                  <h3 className="font-semibold">Join a team</h3>
                  <p className="text-sm text-muted-foreground">Enter team code</p>
                </button>
              </div>
            )}

            {/* CREATE */}
            {mode === "create" && (
              <form onSubmit={handleCreate} className="space-y-4 mt-4">
                <Input
                  placeholder="Team name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                />

                <div className="flex gap-2">
                  <Button type="button" onClick={() => setMode("choose")}>
                    Back
                  </Button>

                  <Button type="submit" disabled={!teamName.trim()}>
                    Next: Payment
                  </Button>
                </div>
              </form>
            )}

            {/* PAYMENT */}
            {mode === "payment" && (
              <form onSubmit={handlePayment} className="space-y-6 mt-4 max-w-md">
                <div className="rounded-2xl border border-border p-6 bg-surface-elevated text-center">
                  <div className="mx-auto size-40 bg-white rounded-xl p-2 mb-4 grid place-items-center">
                    <QrCode className="size-full text-black/80" />
                  </div>
                  <h3 className="font-bold font-display text-xl mb-1">Scan to Pay</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Please pay ₹250 to complete your registration.
                  </p>
                  
                  <div className="space-y-2 text-left">
                    <Label>Transaction ID</Label>
                    <Input
                      placeholder="e.g. UPI123456789"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setMode("create")} disabled={busy}>
                    Back
                  </Button>

                  <Button type="submit" className="flex-1" disabled={busy || !transactionId.trim()}>
                    {busy ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="mr-2 size-4" />}
                    Verify Payment & Create
                  </Button>
                </div>
              </form>
            )}

            {/* JOIN */}
            {mode === "join" && (
              <form onSubmit={handleJoin} className="space-y-4 mt-4">
                <Input
                  placeholder="Team Code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                />

                <div className="flex gap-2">
                  <Button type="button" onClick={() => setMode("choose")}>
                    Back
                  </Button>

                  <Button type="submit" disabled={busy}>
                    {busy && <Loader2 className="animate-spin mr-2" />}
                    Join Team
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
