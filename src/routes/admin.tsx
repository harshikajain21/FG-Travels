import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — FG Travels" }, { name: "robots", content: "noindex" }] }),
  component: AdminGate,
});

function AdminGate() {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e: any, s: any) => {
      setAuthed(!!s);
      if (s) {
        supabase.from("user_roles").select("role").eq("user_id", s.user.id).eq("role", "admin").maybeSingle()
          .then(({ data }: any) => { setIsAdmin(!!data); setLoading(false); });
      } else { setIsAdmin(false); setLoading(false); }
    });
    supabase.auth.getSession().then(({ data }: any) => {
      if (data.session) {
        setAuthed(true);
        supabase.from("user_roles").select("role").eq("user_id", data.session.user.id).eq("role", "admin").maybeSingle()
          .then(({ data: r }: any) => { setIsAdmin(!!r); setLoading(false); });
      } else { setLoading(false); }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (loading) return <Shell><div className="text-muted-foreground">Loading…</div></Shell>;
  if (!authed) return <Shell><LoginForm /></Shell>;
  if (!isAdmin) return <Shell>
    <Card className="p-6 max-w-md">
      <div className="font-semibold">No admin access</div>
      <p className="text-sm text-muted-foreground mt-1">This account isn't an admin yet. Sign in with the owner account, or grant admin access in the database.</p>
      <Button variant="outline" className="mt-4" onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/admin" }); }}>Sign out</Button>
    </Card>
  </Shell>;

  return <Shell><AdminDashboard /></Shell>;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="container mx-auto px-4 py-10 flex-1">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Admin command center</h1>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

function LoginForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) toast.error(error.message); else toast.success("Signed in");
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/admin` }
        });
        if (error) toast.error(error.message);
        else toast.success("Account created — check your email to confirm, then sign in.");
      }
    } finally { setBusy(false); }
  };

  return (
    <Card className="p-6 max-w-md">
      <div className="flex gap-2 mb-4">
        <Button variant={mode === "signin" ? "default" : "outline"} size="sm" onClick={() => setMode("signin")}>Sign in</Button>
        <Button variant={mode === "signup" ? "default" : "outline"} size="sm" onClick={() => setMode("signup")}>Sign up</Button>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} required minLength={6} />
        </div>
        <Button type="submit" disabled={busy} className="w-full">{busy ? "…" : (mode === "signin" ? "Sign in" : "Create account")}</Button>
      </form>
      <p className="text-xs text-muted-foreground mt-4">
        First time? Sign up, then ask the developer to grant admin role for your user.
      </p>
    </Card>
  );
}

type Car = { id: string; name: string; rate_per_km: number; is_available: boolean; status: string; };
type Booking = {
  id: string; created_at: string; customer_name: string; customer_phone: string;
  to_location: string; round_trip_km: number; vehicle_name: string;
  total_estimated: number; booking_status: string;
};

function AdminDashboard() {
  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const loadCars = () => supabase.from("cars").select("id,name,rate_per_km,is_available,status").order("name").then(({ data }: any) => setCars((data as Car[]) ?? []));
  const loadBookings = () => supabase.from("bookings").select("id,created_at,customer_name,customer_phone,to_location,round_trip_km,vehicle_name,total_estimated,booking_status").order("created_at", { ascending: false }).limit(50).then(({ data }: any) => setBookings((data as Booking[]) ?? []));

  useEffect(() => { loadCars(); loadBookings(); }, []);

  const updateRate = async (id: string, rate: number) => {
    const { error } = await supabase.from("cars").update({ rate_per_km: rate }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Rate updated"); loadCars(); }
  };
  const toggleAvail = async (c: Car) => {
    const { error } = await supabase.from("cars").update({ is_available: !c.is_available, status: !c.is_available ? "Available" : "Under Maintenance" }).eq("id", c.id);
    if (error) toast.error(error.message); else loadCars();
  };
  const updateBookingStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("bookings").update({ booking_status: status }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Updated"); loadBookings(); }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">Manage tariffs, fleet status, and incoming bookings.</div>
        <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}>Sign out</Button>
      </div>

      <section>
        <h2 className="text-xl font-bold mb-3">Tariff & fleet</h2>
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-xs uppercase tracking-wider">
              <tr><th className="text-left p-3">Vehicle</th><th className="text-left p-3">₹/km</th><th className="text-left p-3">Status</th><th className="text-right p-3">Action</th></tr>
            </thead>
            <tbody>
              {cars.map(c => (
                <tr key={c.id} className="border-t border-border">
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3">
                    <Input type="number" step="0.5" defaultValue={c.rate_per_km} className="w-24 h-9"
                      onBlur={(e: any) => { const v = parseFloat(e.target.value); if (v && v !== c.rate_per_km) updateRate(c.id, v); }} />
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs ${c.is_available ? "text-success" : "text-destructive"}`}>
                      <span className={`size-2 rounded-full ${c.is_available ? "bg-success" : "bg-destructive"}`} />
                      {c.is_available ? "Available" : c.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => toggleAvail(c)}>
                      {c.is_available ? "Mark unavailable" : "Mark available"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">Recent bookings</h2>
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left p-3">When</th>
                <th className="text-left p-3">Customer</th>
                <th className="text-left p-3">Trip</th>
                <th className="text-left p-3">Total</th>
                <th className="text-left p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No bookings yet.</td></tr>}
              {bookings.map(b => (
                <tr key={b.id} className="border-t border-border">
                  <td className="p-3 text-xs text-muted-foreground">{new Date(b.created_at).toLocaleString()}</td>
                  <td className="p-3">
                    <div className="font-medium">{b.customer_name}</div>
                    <div className="text-xs text-muted-foreground">{b.customer_phone}</div>
                  </td>
                  <td className="p-3">
                    <div>Sagar → {b.to_location}</div>
                    <div className="text-xs text-muted-foreground">{b.vehicle_name} · {b.round_trip_km} km</div>
                  </td>
                  <td className="p-3 font-semibold tabular-nums">₹{Math.round(b.total_estimated).toLocaleString("en-IN")}</td>
                  <td className="p-3">
                    <select className="text-xs border border-border rounded px-2 py-1 bg-background"
                      defaultValue={b.booking_status}
                      onChange={e => updateBookingStatus(b.id, e.target.value)}>
                      <option value="Pending_Confirmation">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-xs text-muted-foreground">Tip: <Link to="/" className="underline">View customer site</Link></p>
    </div>
  );
}
