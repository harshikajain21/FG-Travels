import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Sagar, MP coordinates
const SAGAR = { lat: 23.8388, lon: 78.7378 };

// Curated approximate one-way distances (km) from Sagar, MP for popular destinations.
// Used as a fallback when the user has not configured a Google Maps API key.
const KNOWN: Record<string, { km: number; label: string }> = {
  bhopal: { km: 175, label: "Bhopal, MP" },
  jabalpur: { km: 172, label: "Jabalpur, MP" },
  indore: { km: 365, label: "Indore, MP" },
  gwalior: { km: 305, label: "Gwalior, MP" },
  ujjain: { km: 410, label: "Ujjain, MP" },
  khajuraho: { km: 175, label: "Khajuraho, MP" },
  orchha: { km: 215, label: "Orchha, MP" },
  panna: { km: 165, label: "Panna, MP" },
  satna: { km: 195, label: "Satna, MP" },
  rewa: { km: 270, label: "Rewa, MP" },
  damoh: { km: 75, label: "Damoh, MP" },
  chhatarpur: { km: 110, label: "Chhatarpur, MP" },
  tikamgarh: { km: 145, label: "Tikamgarh, MP" },
  vidisha: { km: 130, label: "Vidisha, MP" },
  raisen: { km: 145, label: "Raisen, MP" },
  pachmarhi: { km: 220, label: "Pachmarhi, MP" },
  nagpur: { km: 425, label: "Nagpur, MH" },
  agra: { km: 395, label: "Agra, UP" },
  delhi: { km: 590, label: "Delhi" },
  mumbai: { km: 1100, label: "Mumbai, MH" },
  varanasi: { km: 545, label: "Varanasi, UP" },
  lucknow: { km: 470, label: "Lucknow, UP" },
  kanpur: { km: 425, label: "Kanpur, UP" },
  allahabad: { km: 410, label: "Prayagraj, UP" },
  prayagraj: { km: 410, label: "Prayagraj, UP" },
  raipur: { km: 510, label: "Raipur, CG" },
  ahmedabad: { km: 720, label: "Ahmedabad, GJ" },
};

const InputSchema = z.object({
  destination: z.string().trim().min(2).max(120),
  vehicleId: z.string().uuid(),
  durationDays: z.number().int().min(1).max(30),
  driverFood: z.enum(["provide_locally", "pay_allowance"]),
});

const FOOD_ALLOWANCE = 250;

type DistanceResult =
  | { ok: true; oneWayKm: number; label: string; source: "google" | "fallback" }
  | { ok: false; error: string };

/**
 * Resolve one-way driving distance from Sagar, MP to a destination.
 * Prefers Google Maps Distance Matrix API if GOOGLE_MAPS_API_KEY is set;
 * otherwise falls back to the curated KNOWN dictionary.
 */
async function resolveDistance(destination: string): Promise<DistanceResult> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (apiKey) {
    try {
      const origin = `${SAGAR.lat},${SAGAR.lon}`;
      const dest = encodeURIComponent(`${destination}, India`);
      const url =
        `https://maps.googleapis.com/maps/api/distancematrix/json` +
        `?origins=${origin}&destinations=${dest}&mode=driving&units=metric&key=${apiKey}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: any = await res.json();

      if (json.status !== "OK") {
        throw new Error(`Google API status: ${json.status}`);
      }
      const element = json.rows?.[0]?.elements?.[0];
      if (!element || element.status !== "OK") {
        // Standardized message per spec
        return { ok: false, error: "Destination city not found. Please verify spelling." };
      }
      const meters = element.distance?.value;
      const label = json.destination_addresses?.[0] || destination;
      if (typeof meters !== "number") {
        return { ok: false, error: "Destination city not found. Please verify spelling." };
      }
      return { ok: true, oneWayKm: Math.round(meters / 1000), label, source: "google" };
    } catch (err) {
      console.error("[google-maps] falling back to curated list:", err);
      // fall through to KNOWN lookup
    }
  }

  const key = destination.toLowerCase().trim().split(",")[0].trim();
  const match = KNOWN[key];
  if (!match) {
    return {
      ok: false,
      error: "Destination city not found. Please verify spelling or try a nearby major city.",
    };
  }
  return { ok: true, oneWayKm: match.km, label: match.label, source: "fallback" };
}

export const getEstimate = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data }) => {
    // 1. Resolve distance (Google Maps when key present, else curated fallback)
    const dist = await resolveDistance(data.destination);
    if (!dist.ok) {
      return { ok: false as const, error: dist.error };
    }

    const oneWayKm = dist.oneWayKm;
    const roundTripKm = oneWayKm * 2;

    // 2. Fetch vehicle rate
    const { data: car, error } = await supabaseAdmin
      .from("cars")
      .select("id, name, rate_per_km, is_available")
      .eq("id", data.vehicleId)
      .maybeSingle();

    if (error || !car) {
      return { ok: false as const, error: "Selected vehicle not found." };
    }
    if (!car.is_available) {
      return { ok: false as const, error: "Selected vehicle is currently unavailable." };
    }

    const rate = Number(car.rate_per_km);
    const baseFare = roundTripKm * rate;
    const foodAllowance = data.driverFood === "pay_allowance" ? FOOD_ALLOWANCE * data.durationDays : 0;
    const total = baseFare + foodAllowance;

    return {
      ok: true as const,
      destinationLabel: dist.label,
      oneWayKm,
      roundTripKm,
      ratePerKm: rate,
      baseFare,
      foodAllowance,
      total,
      vehicleName: car.name,
      distanceSource: dist.source,
    };
  });

const CreateBookingSchema = z.object({
  customerName: z.string().trim().min(2).max(100),
  customerPhone: z.string().trim().min(7).max(20),
  destination: z.string().trim().min(2).max(120),
  vehicleId: z.string().uuid(),
  durationDays: z.number().int().min(1).max(30),
  driverFood: z.enum(["provide_locally", "pay_allowance"]),
});

export const createBooking = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => CreateBookingSchema.parse(d))
  .handler(async ({ data }) => {
    const dist = await resolveDistance(data.destination);
    if (!dist.ok) return { ok: false as const, error: dist.error };

    const { data: car } = await supabaseAdmin
      .from("cars")
      .select("id, name, rate_per_km")
      .eq("id", data.vehicleId)
      .maybeSingle();
    if (!car) return { ok: false as const, error: "Vehicle not found." };

    const roundTripKm = dist.oneWayKm * 2;
    const baseFare = roundTripKm * Number(car.rate_per_km);
    const foodAllowance = data.driverFood === "pay_allowance" ? 250 * data.durationDays : 0;
    const total = baseFare + foodAllowance;

    const { data: booking, error } = await supabaseAdmin.from("bookings").insert({
      customer_name: data.customerName,
      customer_phone: data.customerPhone,
      from_location: "Sagar, MP",
      to_location: dist.label,
      round_trip_km: roundTripKm,
      duration_days: data.durationDays,
      vehicle_id: car.id,
      vehicle_name: car.name,
      driver_food_handling: data.driverFood,
      base_fare: baseFare,
      driver_food_allowance: foodAllowance,
      total_estimated: total,
    }).select("id").single();

    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, bookingId: booking.id, total };
  });
