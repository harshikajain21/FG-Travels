import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { BookingWidget } from "@/components/booking-widget";
import heroCar from "@/assets/hero-car.jpg";
import { ShieldCheck, Receipt, Headset, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FG Travels — Outstation Cabs from Sagar, MP" },
      {
        name: "description",
        content:
          "Book outstation taxis from Sagar, Madhya Pradesh with transparent per-km pricing, professional drivers, and instant WhatsApp confirmation.",
      },
      {
        property: "og:title",
        content: "FG Travels — Outstation Cabs from Sagar, MP",
      },
      {
        property: "og:description",
        content:
          "Transparent per-kilometer outstation taxi pricing from Sagar, MP.",
      },
      { property: "og:image", content: heroCar },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{ background: "var(--gradient-hero)" }}
        />
        <img
          src={heroCar}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30 -z-10"
          width={1600}
          height={900}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/60 to-transparent" />

        <div className="container mx-auto px-4 pt-16 pb-8 md:pt-24 md:pb-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-xs font-medium text-accent-foreground mb-5">
              <Sparkles className="size-3" /> Operating from Sagar, Madhya
              Pradesh
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground tracking-tight leading-[1.05]">
              Outstation cabs with{" "}
              <span className="text-accent">honest pricing</span>.
            </h1>
            <p className="mt-5 text-lg text-primary-foreground/85 max-w-2xl">
              Fixed per-kilometer rates, professional drivers, and a live
              receipt that shows every paisa — before you book.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 -mb-32 pb-32 relative">
          <BookingWidget />
        </div>
      </section>

      {/* Trust strip */}
      <section className="container mx-auto px-4 mt-44 md:mt-48">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            {
              icon: Receipt,
              t: "Transparent fares",
              d: "Per-km × round-trip. No hidden charges.",
            },
            {
              icon: ShieldCheck,
              t: "Verified drivers",
              d: "Experienced, courteous, route-aware.",
            },
            {
              icon: Headset,
              t: "WhatsApp support",
              d: "Reach the owner directly. 24×7.",
            },
            {
              icon: Sparkles,
              t: "Clean fleet",
              d: "Sedans, SUVs, MUVs and travellers.",
            },
          ].map(({ icon: Icon, t, d }) => (
            <div
              key={t}
              className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
            >
              <Icon className="size-5 text-accent mb-3" />
              <div className="font-semibold">{t}</div>
              <div className="text-sm text-muted-foreground mt-1">{d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How pricing works */}
      <section className="container mx-auto px-4 mt-20">
        <div className="max-w-2xl mb-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            How our pricing works
          </h2>
          <p className="text-muted-foreground mt-2">
            Three clear components. Nothing hidden.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <PricingStep
            n="1"
            title="Per-km × round-trip"
            desc="Each car has a fixed ₹/km. We calculate Sagar → destination → Sagar (×2) automatically."
          />
          <PricingStep
            n="2"
            title="Tolls & diesel — actuals"
            desc="Toll plazas and any diesel surcharge are paid at actual cost during the trip. No markup."
          />
          <PricingStep
            n="3"
            title="Driver food, your choice"
            desc="Either provide basic meals locally, or add a flat ₹250/day allowance to your bill."
          />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function PricingStep({
  n,
  title,
  desc,
}: {
  n: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] relative overflow-hidden">
      <div className="absolute -top-2 -right-2 text-[80px] font-black text-accent/10 leading-none">
        {n}
      </div>
      <div className="text-xs font-bold text-accent uppercase tracking-widest">
        Step {n}
      </div>
      <div className="mt-2 font-semibold text-lg">{title}</div>
      <div className="text-sm text-muted-foreground mt-1.5">{desc}</div>
    </div>
  );
}
