import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield } from "lucide-react";
import { EVENTS } from "@/lib/events";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "AURA — Annual Fest Registration",
      },
      {
        name: "description",
        content: "Register, create or join a team in seconds with unique codes.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        {/* HERO */}
        <section className="container mx-auto px-4 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-elevated/60 border border-border text-xs text-muted-foreground mb-6">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            Annual Fest – AURA
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight max-w-4xl mx-auto leading-[1.05]">
            Experience <span className="text-gradient">AURA</span>
            <br />
            Where Ideas, Talent & Innovation Collide.
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Join the ultimate college fest featuring Hackathon, Ideathon, Shark Tank, Nukkad Natak, Singing, and Dance.<br />
            Compete, collaborate, and showcase your skills on one stage.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="xl" variant="hero">
              <Link to="/login">
                Join AURA <ArrowRight className="ml-1" />
              </Link>
            </Button>

            <Button asChild size="xl" variant="glass">
              <Link to="/admin/login">Admin Login</Link>
            </Button>
          </div>
        </section>



        {/* EVENTS (FIXED CLICKABLE) */}
        <section className="container mx-auto px-4 pb-24">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="font-display text-3xl font-bold">Featured events</h2>
              <p className="text-muted-foreground mt-1">Six categories, one registration flow.</p>
            </div>

            <Button asChild variant="ghost">
              <Link to="/login">
                Join now <ArrowRight />
              </Link>
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {EVENTS.map((e) => (
              <Link
                key={e.id}
                to="/events/$eventId"
                params={{ eventId: e.id }}
                className={`relative overflow-hidden rounded-2xl p-6 border border-border bg-gradient-to-br ${e.accent} bg-card hover:border-primary/60 transition-all hover:-translate-y-1 cursor-pointer`}
              >
                <div className="text-3xl">{e.emoji}</div>

                <h3 className="font-display font-semibold text-xl mt-3">{e.name}</h3>

                <p className="text-sm text-muted-foreground">{e.tagline}</p>

                <div className="mt-4 inline-flex items-center gap-2 text-xs font-mono px-2.5 py-1 rounded-md bg-background/40 border border-border">
                  Team size: {e.minSize === e.maxSize ? e.minSize : `${e.minSize}–${e.maxSize}`}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-border/40 py-8 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <Shield className="size-4" /> Secured with email + password authentication
          </div>
        </footer>
      </main>
    </div>
  );
}
