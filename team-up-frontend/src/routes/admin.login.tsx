import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Organizer Login — TeamForge" },
      {
        name: "description",
        content: "Restricted access for event organizers and management team.",
      },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminLogin(email.trim(), pass);
      toast.success("Welcome, organizer.");
      navigate({ to: "/admin" });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Admin login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container mx-auto px-4 py-20 max-w-md">
        <div className="rounded-3xl p-8 bg-gradient-card border border-border shadow-elevated">
          <div className="size-12 rounded-2xl bg-primary/15 grid place-items-center text-primary mb-4">
            <ShieldCheck />
          </div>
          <h1 className="font-display text-2xl font-bold">Organizer Access</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Restricted to authorized management team members.
          </p>
          <form onSubmit={onSubmit} className="space-y-4 mt-6">
            <div>
              <Label htmlFor="ae">Email</Label>
              <Input
                id="ae"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="ap">Password</Label>
              <Input
                id="ap"
                type="password"
                required
                value={pass}
                onChange={(e) => setPass(e.target.value)}
              />
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />} Sign in
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Participant?{" "}
              <Link to="/login" className="text-primary underline">
                Login here
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
