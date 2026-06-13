import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getEstimate } from "@/services/estimate.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  MapPin,
  Lock,
  Calendar,
  Users,
  Utensils,
  Wallet,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { OWNER_WHATSAPP, SUGGESTED_DESTINATIONS } from "@/lib/config";
import { getCarImage } from "@/lib/fleet-images";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { STATIC_CARS } from "@/lib/data";

type Estimate = {
  ok: true;
  destinationLabel: string;
  oneWayKm: number;
  roundTripKm: number;
  ratePerKm: number;
  baseFare: number;
  foodAllowance: number;
  total: number;
  vehicleName: string;
};

const fmt = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

export function BookingWidget() {
  const [destination, setDestination] = useState("");
  const [vehicleId, setVehicleId] = useState<string>(STATIC_CARS[0]?.id || "");
  const [days, setDays] = useState(1);
  const [food, setFood] = useState<"provide_locally" | "pay_allowance">(
    "provide_locally",
  );
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const getEstimateFn = useServerFn(getEstimate);

  const selectedCar = useMemo(
    () => STATIC_CARS.find((c) => c.id === vehicleId),
    [vehicleId],
  );

  // Auto-recompute estimate when inputs change & destination valid-looking
  useEffect(() => {
    if (!destination.trim() || !vehicleId) {
      setEstimate(null);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await getEstimateFn({
          data: {
            destination,
            vehicleId,
            durationDays: days,
            driverFood: food,
          },
        });
        if (res.ok) setEstimate(res);
        else setEstimate(null);
      } catch {
        setEstimate(null);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [destination, vehicleId, days, food, getEstimateFn]);

  const sendWhatsApp = async () => {
    if (!estimate) {
      toast.error("Get a valid estimate first");
      return;
    }
    if (!name.trim() || !phone.trim()) {
      toast.error("Enter your name & phone");
      return;
    }
    setSubmitting(true);
    try {
      const msg = [
        `*New Booking Request — FG Travels*`,
        ``,
        `*Name:* ${name}`,
        `*Phone:* ${phone}`,
        ``,
        `*Route:* Sagar, MP → ${estimate.destinationLabel} → Sagar`,
        `*Round-trip:* ${estimate.roundTripKm} km`,
        `*Vehicle:* ${estimate.vehicleName} (${fmt(estimate.ratePerKm)}/km)`,
        `*Duration:* ${days} day(s)`,
        `*Driver food:* ${food === "pay_allowance" ? `Pay allowance (${fmt(estimate.foodAllowance)})` : "Provided locally"}`,
        ``,
        `*Base fare:* ${fmt(estimate.baseFare)}`,
        `*Driver food:* ${fmt(estimate.foodAllowance)}`,
        `*Estimated total:* ${fmt(estimate.total)}`,
        `*Booking status:* Pending Confirmation`,
        ``,
        `_Tolls & diesel fluctuations payable at actuals._`,
      ].join("\n");

      const url = `https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(msg)}`;
      window.open(url, "_blank");
      toast.success("Booking saved — opening WhatsApp");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-6 md:p-8 shadow-[var(--shadow-elegant)] border-border/60 bg-card/95 backdrop-blur">
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Left: form */}
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1.5">
                <Lock className="size-3" /> From
              </Label>
              <div className="h-11 rounded-md border border-input bg-secondary/60 px-3 flex items-center gap-2 text-sm font-medium">
                <MapPin className="size-4 text-accent" /> Sagar, Madhya Pradesh
              </div>
            </div>
            <div>
              <Label
                htmlFor="dest"
                className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1.5"
              >
                <MapPin className="size-3" /> Destination city
              </Label>
              <Input
                id="dest"
                list="dest-list"
                placeholder="e.g. Bhopal"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="h-11"
              />
              <datalist id="dest-list">
                {SUGGESTED_DESTINATIONS.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-2 block">
              Choose your vehicle
            </Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {STATIC_CARS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setVehicleId(c.id)}
                  className={cn(
                    "text-left p-3 rounded-lg border-2 transition-all flex gap-3 items-center",
                    vehicleId === c.id
                      ? "border-accent bg-accent/5 shadow-sm"
                      : "border-border hover:border-accent/40",
                  )}
                >
                  <img
                    src={getCarImage(c.image_path)}
                    alt={c.name}
                    className="w-16 h-12 object-contain rounded"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm truncate">
                      {c.name}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <Users className="size-3" /> {c.seating_capacity}
                      <span>·</span>
                      <span>{c.has_ac ? "AC" : "Non-AC"}</span>
                    </div>
                    <div className="text-sm font-bold text-accent mt-0.5">
                      {fmt(c.rate_per_km)}/km
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label
                htmlFor="days"
                className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1.5"
              >
                <Calendar className="size-3" /> Trip duration (days)
              </Label>
              <Input
                id="days"
                type="number"
                min={1}
                max={30}
                value={days}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setDays(
                    Math.max(1, Math.min(30, parseInt(e.target.value) || 1)),
                  )
                }
                className="h-11"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1.5">
                <Utensils className="size-3" /> Driver meals
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFood("provide_locally")}
                  className={cn(
                    "h-11 px-2 rounded-md border-2 text-xs font-medium transition-all",
                    food === "provide_locally"
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-accent/40",
                  )}
                >
                  Provide locally
                </button>
                <button
                  type="button"
                  onClick={() => setFood("pay_allowance")}
                  className={cn(
                    "h-11 px-2 rounded-md border-2 text-xs font-medium transition-all",
                    food === "pay_allowance"
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-accent/40",
                  )}
                >
                  ₹250/day allowance
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-border">
            <div>
              <Label
                htmlFor="name"
                className="text-xs font-medium text-muted-foreground mb-1.5 block"
              >
                Your name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
                className="h-11"
                placeholder="Full name"
              />
            </div>
            <div>
              <Label
                htmlFor="phone"
                className="text-xs font-medium text-muted-foreground mb-1.5 block"
              >
                WhatsApp number
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPhone(e.target.value)
                }
                className="h-11"
                placeholder="+91…"
              />
            </div>
          </div>

          <Button
            onClick={sendWhatsApp}
            disabled={!estimate || submitting}
            className="w-full h-12 font-semibold text-base"
            style={{
              background: "var(--gradient-accent)",
              color: "var(--accent-foreground)",
            }}
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                Submit & Book on WhatsApp <ArrowRight className="size-4 ml-1" />
              </>
            )}
          </Button>
        </div>

        {/* Right: live receipt */}
        <div>
          <div className="rounded-xl border-2 border-dashed border-accent/40 bg-secondary/40 p-5 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  Live estimate
                </div>
                <div className="text-sm font-semibold">
                  Transparent breakdown
                </div>
              </div>
              {loading && (
                <Loader2 className="size-4 animate-spin text-accent" />
              )}
            </div>

            {!estimate ? (
              <div className="text-sm text-muted-foreground py-8 text-center">
                Enter a destination to see your real-time fare breakdown.
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <Row
                  label={`${selectedCar?.name ?? "Vehicle"}`}
                  sub={`${estimate.roundTripKm} km × ${fmt(estimate.ratePerKm)}/km`}
                  value={fmt(estimate.baseFare)}
                />
                <Row
                  label="Driver food"
                  sub={
                    food === "pay_allowance"
                      ? `${days} day × ₹250`
                      : "Provided by customer"
                  }
                  value={fmt(estimate.foodAllowance)}
                />
                <div className="pt-3 border-t border-border flex items-end justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Estimated total
                    </div>
                    <div className="text-3xl font-bold text-foreground">
                      {fmt(estimate.total)}
                    </div>
                  </div>
                  <div className="text-right text-[10px] text-muted-foreground max-w-[140px]">
                    Tolls & diesel fluctuations payable at actuals
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={sendWhatsApp}
              disabled={!estimate || submitting}
              className="w-full mt-5 h-12 font-semibold text-base"
              style={{
                background: "var(--gradient-accent)",
                color: "var(--accent-foreground)",
              }}
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  Book on WhatsApp <ArrowRight className="size-4 ml-1" />
                </>
              )}
            </Button>
            <div className="mt-2 text-[11px] text-muted-foreground text-center flex items-center justify-center gap-1">
              <Wallet className="size-3" /> No advance · Pay after the trip
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function Row({
  label,
  sub,
  value,
}: {
  label: string;
  sub: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
      <div className="font-semibold tabular-nums">{value}</div>
    </div>
  );
}
