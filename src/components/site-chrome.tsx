import { Link } from "@tanstack/react-router";
import { Car, MessageCircle } from "lucide-react";
import { OWNER_WHATSAPP } from "@/lib/config";

const WA_URL = `https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent("Hi FG Travels, I'd like to book a cab.")}`;

export function WhatsAppFloat() {
  return (
    <a
      href={WA_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 h-12 rounded-full shadow-lg bg-[#25D366] text-white font-semibold hover:scale-105 transition-transform"
    >
      <MessageCircle className="size-5" fill="currentColor" />
      <span className="hidden sm:inline">Chat on WhatsApp</span>
    </a>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div
            className="size-9 rounded-lg flex items-center justify-center"
            style={{ background: "var(--gradient-accent)" }}
          >
            <Car className="size-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <div className="font-bold text-foreground tracking-tight">
              FG Travels
            </div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Sagar · MP
            </div>
          </div>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium">
          <Link
            to="/"
            className="px-3 py-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            activeOptions={{ exact: true }}
            activeProps={{
              className: "px-3 py-2 rounded-md text-foreground bg-secondary",
            }}
          >
            Home
          </Link>
          <Link
            to="/fleet"
            className="px-3 py-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            activeProps={{
              className: "px-3 py-2 rounded-md text-foreground bg-secondary",
            }}
          >
            Fleet
          </Link>
          <Link
            to="/about"
            className="px-3 py-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            activeProps={{
              className: "px-3 py-2 rounded-md text-foreground bg-secondary",
            }}
          >
            About
          </Link>

          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-semibold bg-[#25D366] text-white hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="size-4" fill="currentColor" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-20 bg-secondary/40">
      <div className="container mx-auto px-4 py-10 grid gap-8 md:grid-cols-3 text-sm">
        <div>
          <div className="font-bold text-foreground mb-2">FG Travels</div>
          <p className="text-muted-foreground">
            Premium outstation & local car rentals operating out of Sagar,
            Madhya Pradesh. Transparent pricing, professional drivers.
          </p>
        </div>
        <div>
          <div className="font-semibold mb-2">Pricing model</div>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Fixed ₹/km per car (round-trip)</li>
            <li>• Tolls & diesel fluctuations at actuals</li>
            <li>• Driver food: provide locally or ₹250/day</li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Contact</div>
          <p className="text-muted-foreground mb-2">
            WhatsApp bookings open 24×7. Confirmations within minutes.
          </p>
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-semibold text-[#25D366] hover:underline"
          >
            <MessageCircle className="size-4" fill="currentColor" /> +91 70004
            82690
          </a>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} FG Travels. All rights reserved.
      </div>
    </footer>
  );
}
