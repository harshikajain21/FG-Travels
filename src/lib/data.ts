export type Car = {
  id: string;
  name: string;
  category: string;
  seating_capacity: number;
  has_ac: boolean;
  rate_per_km: number;
  min_daily_fare: number | null;
  min_daily_km: number | null;
  is_available: boolean;
  status: string;
  image_path: string | null;
};

export const STATIC_CARS: Car[] = [
  {
    id: "crysta",
    name: "Innova Crysta",
    category: "MUV",
    seating_capacity: 6,
    has_ac: true,
    rate_per_km: 16,
    min_daily_fare: 4800,
    min_daily_km: 300,
    is_available: true,
    status: "Available",
    image_path: "innova-crysta.jpg",
  },
  {
    id: "innova",
    name: "Toyota Innova",
    category: "MUV",
    seating_capacity: 6,
    has_ac: true,
    rate_per_km: 14,
    min_daily_fare: 4200,
    min_daily_km: 300,
    is_available: true,
    status: "Available",
    image_path: "innova.jpg",
  },
  {
    id: "tavera",
    name: "Chevrolet Tavera",
    category: "MUV",
    seating_capacity: 8,
    has_ac: true,
    rate_per_km: 13,
    min_daily_fare: 3900,
    min_daily_km: 300,
    is_available: true,
    status: "Available",
    image_path: "tavera.jpg",
  },
  {
    id: "dzire",
    name: "Swift Dzire",
    category: "Sedan",
    seating_capacity: 4,
    has_ac: true,
    rate_per_km: 11,
    min_daily_fare: 3300,
    min_daily_km: 300,
    is_available: true,
    status: "Available",
    image_path: "dzire.jpg",
  },
  {
    id: "aspire",
    name: "Ford Aspire",
    category: "Sedan",
    seating_capacity: 4,
    has_ac: true,
    rate_per_km: 11,
    min_daily_fare: 3300,
    min_daily_km: 300,
    is_available: true,
    status: "Available",
    image_path: "aspire.jpg",
  },
];
