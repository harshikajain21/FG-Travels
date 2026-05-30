UPDATE public.cars SET image_path = CASE name
  WHEN 'Maruti Suzuki Swift Dzire' THEN 'dzire'
  WHEN 'Toyota Etios' THEN 'etios'
  WHEN 'Toyota Innova Crysta' THEN 'innova'
  WHEN 'Maruti Ertiga' THEN 'ertiga'
  WHEN 'Tempo Traveller' THEN 'tempo'
END;