-- Fix image_path values to match the actual bundled asset keys in src/lib/fleet-images.ts
-- Available keys: dzire, aspire, innova, innova-crysta, tavera
-- The previous migration (20260505160750) set wrong keys for 4 of 5 cars.

UPDATE public.cars SET image_path = 'dzire'         WHERE name = 'Maruti Suzuki Swift Dzire';
UPDATE public.cars SET image_path = 'aspire'        WHERE name = 'Toyota Etios';
UPDATE public.cars SET image_path = 'innova-crysta' WHERE name = 'Toyota Innova Crysta';
UPDATE public.cars SET image_path = 'innova'        WHERE name = 'Maruti Ertiga';
UPDATE public.cars SET image_path = 'tavera'        WHERE name = 'Tempo Traveller';
