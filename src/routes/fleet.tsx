import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { getCarImage } from "@/lib/fleet-images";
import {
  Users,
  Snowflake,
  MessageCircle,
  Gauge,
  CheckCircle2,
} from "lucide-react";
import { OWNER_WHATSAPP } from "@/lib/config";
import { STATIC_CARS } from "@/lib/data";

export const Route = createFileRoute("/fleet")({
  head: () => ({
    meta: [
      { title: "Our Fleet — FG Travels" },
      {
        name: "description",
        content:
          "Premium sedans, SUVs and MUVs available for outstation trips from Sagar, MP. Transparent per-km pricing.",
      },
      { property: "og:title", content: "Our Fleet — FG Travels" },
      {
        property: "og:description",
        content: "Browse the FG Travels vehicle fleet.",
      },
    ],
  }),
  component: Fleet,
});

function bookHref(carName: string) {
  const msg = `Hi FG Travels, I'd like to book the ${carName}. Please share availability and a quote.`;
  return `https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(msg)}`;
}

function Fleet() {
  const cars = STATIC_CARS;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="container mx-auto px-4 py-12 flex-1">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-xs font-semibold uppercase tracking-wider text-accent">
            <span className="size-1.5 rounded-full bg-accent" /> Our Fleet
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mt-4">
            Choose your ride
          </h1>
          <p className="text-muted-foreground mt-3 text-base md:text-lg">
            Handpicked sedans, SUVs and MUVs — each maintained for long highway
            runs. Transparent per-kilometer pricing with no hidden charges.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-10">
          {cars.map((c) => (
            <article
              key={c.id}
              className="group relative rounded-2xl border border-border bg-card overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-secondary/40">
                <img
                  src={getCarImage(c.image_path)}
                  alt={c.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/90 backdrop-blur text-[10px] uppercase tracking-wider font-bold text-accent">
                  {c.category}
                </div>
                {c.is_available && (
                  <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-success/15 backdrop-blur text-[10px] font-semibold text-success border border-success/30">
                    <CheckCircle2 className="size-3" /> Available
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-end justify-between gap-3">
                  <h3 className="font-bold text-xl tracking-tight">{c.name}</h3>
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-bold leading-none">
                      ₹{Number(c.rate_per_km).toFixed(0)}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      per km
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-3 text-xs">
                  <Tag icon={<Users className="size-3" />}>
                    {c.seating_capacity} + 1 driver
                  </Tag>
                  {c.has_ac && (
                    <Tag icon={<Snowflake className="size-3" />}>AC</Tag>
                  )}
                </div>

                {c.min_daily_fare != null && (
                  <div className="mt-4 rounded-lg bg-secondary/60 border border-border px-3 py-2.5 flex items-center gap-2">
                    <Gauge className="size-4 text-accent shrink-0" />
                    <div className="text-xs leading-tight">
                      <span className="font-semibold text-foreground">
                        Min ₹{Number(c.min_daily_fare).toFixed(0)}/day
                      </span>
                      {c.min_daily_km != null && (
                        <span className="text-muted-foreground">
                          {" "}
                          · for {c.min_daily_km} km
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <a
                  href={bookHref(c.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 h-11 rounded-lg bg-[#25D366] text-white font-semibold shadow-sm hover:brightness-110 hover:shadow-md active:scale-[0.98] transition-all"
                >
                  <MessageCircle className="size-4" fill="currentColor" />
                  Book on WhatsApp
                </a>
              </div>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Tag({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary text-secondary-foreground font-medium">
      {icon}
      {children}
    </span>
  );
}
