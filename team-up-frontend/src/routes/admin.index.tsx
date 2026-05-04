import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { api, type AppUser, type Team } from "@/lib/api";
import { EVENTS, getEvent } from "@/lib/events";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users, UserCheck, Trophy, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Console — TeamForge" },
      { name: "description", content: "Organizer console: view all teams and participants." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [users, setUsers] = useState<AppUser[] | null>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [refreshing, setRefreshing] = useState(false);

  const loadData = () => {
    setRefreshing(true);
    Promise.all([
      api.adminListTeams().then(setTeams).catch(() => setTeams([])),
      api.adminListUsers().then(setUsers).catch(() => setUsers([])),
    ]).finally(() => setRefreshing(false));
  };

  useEffect(() => {
    if (!user) {
      navigate({ to: "/admin/login" });
      return;
    }
    if (user.role !== "admin") {
      navigate({ to: "/dashboard" });
      return;
    }
    
    loadData();
  }, [user, navigate]);

  if (!mounted || !user || user.role !== "admin") return null;

  const totalTeams = teams?.length ?? 0;
  const totalUsers = users?.length ?? 0;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="font-display text-4xl md:text-5xl font-bold">Organizer Console</h1>
            <p className="text-muted-foreground mt-2">Live overview of registrations.</p>
          </div>
          
          <button 
            onClick={loadData}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-elevated hover:bg-surface-elevated/80 border border-border text-sm font-medium transition-colors"
          >
            <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh Data
          </button>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mt-8">
          <KPI icon={Users} label="Total participants" value={totalUsers} />
          <KPI icon={UserCheck} label="Total teams" value={totalTeams} />
          <KPI icon={Trophy} label="Events" value={EVENTS.length} />
        </div>

        <Tabs defaultValue="teams" className="mt-10">
          <TabsList>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="users">Participants</TabsTrigger>
            <TabsTrigger value="events">By event</TabsTrigger>
          </TabsList>

          <TabsContent value="teams" className="mt-6">
            {teams === null ? (
              <Spin />
            ) : (
              <div className="rounded-2xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-surface-elevated/60 text-left text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="p-3">Team</th>
                      <th className="p-3">Event</th>
                      <th className="p-3">Code</th>
                      <th className="p-3">Members</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((t) => (
                      <tr key={t.id} className="border-t border-border">
                        <td className="p-3 font-medium">{t.name}</td>
                        <td className="p-3">{getEvent(t.event)?.name}</td>
                        <td className="p-3 font-mono text-primary">{t.code}</td>
                        <td className="p-3">
                          {t.members.length} / {t.max_size}
                        </td>
                      </tr>
                    ))}
                    {teams.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-muted-foreground">
                          No teams yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            {users === null ? (
              <Spin />
            ) : (
              <div className="rounded-2xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-surface-elevated/60 text-left text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="p-3">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">College</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-t border-border">
                        <td className="p-3 font-medium">{u.name || "—"}</td>
                        <td className="p-3 text-muted-foreground">{u.email}</td>
                        <td className="p-3 text-muted-foreground">{u.phone || "—"}</td>
                        <td className="p-3 text-muted-foreground">{u.college || "—"}</td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-muted-foreground">
                          No participants yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {EVENTS.map((e) => {
                const count = teams?.filter((t) => t.event === e.id).length ?? 0;
                return (
                  <div
                    key={e.id}
                    className={`rounded-2xl p-6 border border-border bg-gradient-to-br ${e.accent} bg-card`}
                  >
                    <div className="text-3xl">{e.emoji}</div>
                    <h3 className="font-display font-semibold text-lg mt-2">{e.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {count} team{count === 1 ? "" : "s"} registered
                    </p>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function KPI({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl p-6 bg-gradient-card border border-border">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="size-4 text-primary" />
      </div>
      <p className="font-display text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

function Spin() {
  return (
    <div className="text-center text-muted-foreground py-10">
      <Loader2 className="animate-spin inline mr-2" />
      Loading…
    </div>
  );
}
