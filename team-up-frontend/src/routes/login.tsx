import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login or Register — AURA" },
      {
        name: "description",
        content: "Login or create an account to register for events and form teams.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);

  // Login state
  const [lEmail, setLEmail] = useState("");
  const [lPass, setLPass] = useState("");

  // Register state
  const [rName, setRName] = useState("");
  const [rEmail, setREmail] = useState("");
  const [rPhone, setRPhone] = useState("");
  const [rCollege, setRCollege] = useState("");
  const [rPass, setRPass] = useState("");

  // ===== LOGIN =====
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    if (!lEmail.trim() || !lPass.trim()) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      await login(lEmail.trim(), lPass);
      toast.success("Welcome back!");
      navigate({ to: "/events" });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ===== REGISTER =====
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    if (!rName.trim() || !rEmail.trim() || !rPhone.trim() || !rCollege.trim()) {
      toast.error("All fields are required");
      return;
    }

    if (rPass.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await register({
        name: rName.trim(),
        email: rEmail.trim(),
        phone: rPhone.trim(),
        college: rCollege.trim(),
        password: rPass,
      });

      toast.success("Account created!");
      navigate({ to: "/events" });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="container mx-auto px-4 py-16 grid lg:grid-cols-2 gap-12 items-center max-w-6xl">
        {/* LEFT SIDE */}
        <div className="hidden lg:block">
          <h1 className="font-display text-5xl font-bold tracking-tight">
            Welcome to <span className="text-gradient">AURA</span>
          </h1>

          <p className="mt-4 text-muted-foreground text-lg max-w-md">
            Join the ultimate college fest featuring Hackathon, Ideathon, Shark Tank, Nukkad Natak, Singing, and Dance.
          </p>

          <ul className="mt-8 space-y-3 text-sm">
            {[
              "Compete, collaborate, and showcase your skills on one stage.",
              "Cash prizes and exciting rewards for winners.",
              "Networking opportunities with industry experts.",
              "Unforgettable experiences and memories.",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT SIDE */}
        <div className="rounded-3xl p-8 bg-gradient-card border border-border shadow-elevated">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            {/* LOGIN */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="le">Email</Label>
                  <Input
                    id="le"
                    type="email"
                    required
                    value={lEmail}
                    onChange={(e) => setLEmail(e.target.value)}
                    placeholder="you@college.edu"
                  />
                </div>

                <div>
                  <Label htmlFor="lp">Password</Label>
                  <Input
                    id="lp"
                    type="password"
                    required
                    value={lPass}
                    onChange={(e) => setLPass(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={loading || !lEmail || !lPass}
                >
                  {loading && <Loader2 className="animate-spin mr-2" />}
                  Login
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Are you an organizer?{" "}
                  <Link to="/admin/login" className="text-primary underline">
                    Admin login
                  </Link>
                </p>
              </form>
            </TabsContent>

            {/* REGISTER */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="rn">Full name</Label>
                    <Input
                      id="rn"
                      required
                      value={rName}
                      onChange={(e) => setRName(e.target.value)}
                      maxLength={80}
                    />
                  </div>

                  <div>
                    <Label htmlFor="rp">Phone</Label>
                    <Input
                      id="rp"
                      required
                      value={rPhone}
                      onChange={(e) => setRPhone(e.target.value)}
                      maxLength={20}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="rc">College</Label>
                  <Input
                    id="rc"
                    required
                    value={rCollege}
                    onChange={(e) => setRCollege(e.target.value)}
                    maxLength={120}
                  />
                </div>

                <div>
                  <Label htmlFor="re">Email</Label>
                  <Input
                    id="re"
                    type="email"
                    required
                    value={rEmail}
                    onChange={(e) => setREmail(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="rpw">Password</Label>
                  <Input
                    id="rpw"
                    type="password"
                    required
                    minLength={6}
                    value={rPass}
                    onChange={(e) => setRPass(e.target.value)}
                    placeholder="Min. 6 characters"
                  />
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={loading || !rName || !rEmail || !rPhone || !rCollege || !rPass}
                >
                  {loading && <Loader2 className="animate-spin mr-2" />}
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
