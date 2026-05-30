
-- App role enum + user_roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "users view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Cars
CREATE TABLE public.cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  seating_capacity INT NOT NULL,
  has_ac BOOLEAN NOT NULL DEFAULT true,
  luggage_capacity TEXT NOT NULL DEFAULT '2 Medium Bags',
  rate_per_km NUMERIC(10,2) NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'Available',
  image_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can view cars" ON public.cars FOR SELECT USING (true);
CREATE POLICY "admins manage cars" ON public.cars FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Bookings
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  from_location TEXT NOT NULL DEFAULT 'Sagar, MP',
  to_location TEXT NOT NULL,
  round_trip_km NUMERIC(10,2) NOT NULL,
  duration_days INT NOT NULL DEFAULT 1,
  vehicle_id UUID REFERENCES public.cars(id),
  vehicle_name TEXT NOT NULL,
  driver_food_handling TEXT NOT NULL,
  base_fare NUMERIC(10,2) NOT NULL,
  driver_food_allowance NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_estimated NUMERIC(10,2) NOT NULL,
  booking_status TEXT NOT NULL DEFAULT 'Pending_Confirmation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can create bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "admins view bookings" ON public.bookings FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update bookings" ON public.bookings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed fleet
INSERT INTO public.cars (name, category, seating_capacity, has_ac, luggage_capacity, rate_per_km) VALUES
('Maruti Suzuki Swift Dzire', 'Sedan', 5, true, '2 Medium Bags', 12.00),
('Toyota Etios', 'Sedan', 5, true, '2 Medium Bags', 13.00),
('Toyota Innova Crysta', 'SUV', 7, true, '4 Large Bags', 18.00),
('Maruti Ertiga', 'MUV', 7, true, '3 Medium Bags', 15.00),
('Tempo Traveller', 'Van', 12, true, '8 Large Bags', 25.00);
