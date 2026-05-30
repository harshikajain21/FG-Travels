import dzire from "@/assets/dzire.jpg";
import aspire from "@/assets/aspire.jpg";
import innova from "@/assets/innova.jpg";
import innovaCrysta from "@/assets/innova-crysta.jpg";
import tavera from "@/assets/tavera.jpg";

export const FLEET_IMAGES: Record<string, string> = {
  dzire,
  aspire,
  innova,
  "innova-crysta": innovaCrysta,
  tavera,
};

export function getCarImage(key?: string | null) {
  if (!key) return dzire;
  return FLEET_IMAGES[key] ?? dzire;
}
