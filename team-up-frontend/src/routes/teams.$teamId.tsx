import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState, useCallback } from "react";
import { api, ApiError, type Team } from "@/lib/api";
import { getEvent } from "@/lib/events";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Copy, LogOut, Crown, Loader2, AlertCircle, CheckCircle2, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/teams/$teamId")({
  head: () => ({
    meta: [
      { title: "Team Dashboard — TeamForge" },
      {
        name: "description",
        content: "View your team members and share your team code.",
      },
    ],
  }),
  component: TeamPage,
});

function TeamPage() {
  const { teamId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // ===== LOAD TEAM =====
  const load = useCallback(() => {
    setLoading(true);
    api
      .getTeam(teamId)
      .then(setTeam)
      .catch((e) => {
        toast.error(e instanceof ApiError ? e.message : "Couldn't load team");
      })
      .finally(() => setLoading(false));
  }, [teamId]);

  useEffect(() => {
    if (!user) {
      navigate({ to: "/login" });
      return;
    }

    load();
  }, [user, navigate, load]);

  // ===== COPY CODE =====
  const copy = async () => {
    if (!team) return;

    try {
      await navigator.clipboard.writeText(team.code);
      toast.success("Team code copied!");
    } catch {
      toast.error("Failed to copy code");
    }
  };

  // ===== LEAVE TEAM =====
  const leave = async () => {
    if (!team) return;
    if (!confirm("Request to leave this team?")) return;

    setBusy(true);
    try {
      await api.leaveTeam(team.id);
      toast.success("Leave request sent to team leader");
      load();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Could not request to leave");
    } finally {
      setBusy(false);
    }
  };

  // ===== RESOLVE LEAVE REQUEST =====
  const resolveRequest = async (userId: string, action: "approve" | "reject") => {
    if (!team) return;
    setBusy(true);
    try {
      await api.resolveLeave(team.id, userId, action);
      toast.success(`Request ${action}d`);
      load();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : `Could not ${action} request`);
    } finally {
      setBusy(false);
    }
  };

  // ===== TRANSFER LEADERSHIP =====
  const transferLeadership = async (newLeaderId: string) => {
    if (!team) return;
    if (!confirm("Are you sure you want to transfer leadership? You will become a regular member.")) return;

    setBusy(true);
    try {
      await api.transferLeadership(team.id, newLeaderId);
      toast.success("Leadership transferred successfully");
      load();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Could not transfer leadership");
    } finally {
      setBusy(false);
    }
  };

  // ===== LOADING =====
  if (loading) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="container mx-auto px-4 py-20 text-center text-muted-foreground">
          <Loader2 className="animate-spin inline mr-2" />
          Loading team…
        </main>
      </div>
    );
  }

  // ===== TEAM NOT FOUND =====
  if (!team) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-3xl">Team not found</h1>
          <Link to="/dashboard" className="text-primary underline mt-4 inline-block">
            Back to dashboard
          </Link>
        </main>
      </div>
    );
  }

  const ev = getEvent(team.event);
  const size = team.members.length;

  const isLeader = user?.id === team.leader_id;
  const isFull = size >= team.max_size;
  const meetsMin = size >= team.min_size;

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="size-4" /> Dashboard
        </Link>

        {/* TEAM HEADER */}
        <div className="rounded-3xl p-8 bg-gradient-card border border-border shadow-elevated">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <span>{ev?.emoji}</span>
                <span>{ev?.name || team.event}</span>
              </div>

              <h1 className="font-display text-4xl font-bold mt-1">{team.name}</h1>
            </div>

            {/* TEAM CODE */}
            <div className="rounded-2xl p-4 bg-background/50 border border-border min-w-[200px]">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Team Code</p>

              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-2xl font-bold text-gradient">{team.code}</span>

                <Button size="icon" variant="ghost" onClick={copy}>
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* STATS */}
          <div className="mt-6 grid sm:grid-cols-3 gap-3">
            <Stat label="Members" value={`${size} / ${team.max_size}`} />
            <Stat label="Min required" value={`${team.min_size}`} />
            <Stat
              label="Status"
              value={isFull ? "Full" : meetsMin ? "Ready" : "Need more"}
              highlight={meetsMin}
            />
          </div>

          {/* STATUS MESSAGE */}
          <div className="mt-4">
            {meetsMin ? (
              <div className="flex items-center gap-2 text-sm text-emerald-400">
                <CheckCircle2 className="size-4" />
                Team is ready for {ev?.name}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-amber-400">
                <AlertCircle className="size-4" />
                Need {team.min_size - size} more member
                {team.min_size - size > 1 ? "s" : ""}
              </div>
            )}
          </div>
          {/* WHATSAPP GROUP */}
          {team.whatsapp_link && (
            <div className="mt-6 rounded-2xl p-6 bg-emerald-500/10 border border-emerald-500/20 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-emerald-500/20 grid place-items-center text-emerald-400">
                  <MessageCircle className="size-5" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-emerald-500">Join WhatsApp Group</h3>
                  <p className="text-sm text-emerald-500/80">Connect with your team members</p>
                </div>
              </div>
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white border-0">
                <a href={team.whatsapp_link} target="_blank" rel="noreferrer">
                  Join Group
                </a>
              </Button>
            </div>
          )}
        </div>

        {/* PENDING REQUESTS (Leader Only) */}
        {isLeader && team.pending_requests && team.pending_requests.length > 0 && (
          <section className="mt-8">
            <h2 className="font-display text-2xl font-bold mb-4 text-amber-500">Leave Requests</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {team.pending_requests.map((userId) => {
                const member = team.members.find(m => m.id === userId);
                if (!member) return null;
                
                return (
                  <div
                    key={userId}
                    className="rounded-2xl p-4 bg-amber-500/10 border border-amber-500/20 flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-amber-500/20 grid place-items-center text-amber-500 font-semibold">
                        {(member.name || member.email)[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-amber-500">{member.name || member.email}</p>
                        <p className="text-xs text-amber-500/80 truncate">wants to leave the team</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 border-amber-500/30 text-amber-500 hover:bg-amber-500/20" onClick={() => resolveRequest(userId, "reject")} disabled={busy}>Reject</Button>
                      <Button size="sm" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white" onClick={() => resolveRequest(userId, "approve")} disabled={busy}>Approve</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* MEMBERS */}
        <section className="mt-8">
          <h2 className="font-display text-2xl font-bold mb-4">Members</h2>

          <div className="grid sm:grid-cols-2 gap-3">
            {team.members.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl p-4 bg-card border border-border flex items-center gap-3"
              >
                <div className="size-10 rounded-full bg-gradient-primary grid place-items-center text-primary-foreground font-semibold">
                  {(m.name || m.email)[0]?.toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <p className="font-medium truncate">{m.name || m.email}</p>
                      {m.id === team.leader_id && <Crown className="size-3.5 text-amber-400 shrink-0" />}
                    </div>

                    {isLeader && m.id !== team.leader_id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs px-2 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 shrink-0"
                        onClick={() => transferLeadership(m.id)}
                        disabled={busy}
                      >
                        Make Leader
                      </Button>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground truncate">{m.email}</p>

                  {m.college && (
                    <p className="text-xs text-muted-foreground truncate">{m.college}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ACTIONS */}
        <div className="mt-10 flex flex-wrap gap-3">
          <Button variant="outline" onClick={load}>
            Refresh
          </Button>

          {!isLeader && (
            <Button 
              variant="destructive" 
              onClick={leave} 
              disabled={busy || team.pending_requests?.includes(user?.id || "")}
            >
              {busy && <Loader2 className="animate-spin mr-2" />}
              <LogOut className="size-4 mr-2" />
              {team.pending_requests?.includes(user?.id || "") ? "Leave Request Pending" : "Request to Leave"}
            </Button>
          )}

          {isLeader && (
            <p className="text-xs text-muted-foreground self-center">
              Share your team code to invite members
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl p-4 bg-background/40 border border-border">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`font-display text-xl font-bold mt-1 ${highlight ? "text-emerald-400" : ""}`}>
        {value}
      </p>
    </div>
  );
}
