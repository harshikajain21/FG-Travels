import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { MapPin, Phone, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — FG Travels" },
      { name: "description", content: "FG Travels is a Sagar-based outstation cab service built on transparent pricing and professional drivers." },
      { property: "og:title", content: "About — FG Travels" },
      { property: "og:description", content: "Local roots, regional reach. Honest fares from Sagar, Madhya Pradesh." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="container mx-auto px-4 py-14 flex-1 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">A travel agency built on trust.</h1>
        <p className="text-lg text-muted-foreground mt-4">
          FG Travels operates outstation and local cabs out of Sagar, Madhya Pradesh.
          We started with one simple promise: <strong className="text-foreground">no surprise charges, ever</strong>.
          Every fare you see is broken down into the per-kilometer base, the driver's food handling, and that's it.
          Tolls and any diesel fluctuations are paid at their actual cost — never marked up.
        </p>

        <div className="grid gap-4 md:grid-cols-3 mt-10">
          <Card icon={<MapPin className="size-5 text-accent" />} title="Based in Sagar">
            All trips originate from Sagar, MP. Round-trip distances are calculated automatically.
          </Card>
          <Card icon={<ShieldCheck className="size-5 text-accent" />} title="Vetted drivers">
            Every driver is route-experienced, courteous, and trained for long-distance comfort.
          </Card>
          <Card icon={<Phone className="size-5 text-accent" />} title="Direct WhatsApp">
            Bookings go straight to the owner. No call centres, no hold music.
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      {icon}
      <div className="font-semibold mt-2">{title}</div>
      <div className="text-sm text-muted-foreground mt-1">{children}</div>
    </div>
  );
}
