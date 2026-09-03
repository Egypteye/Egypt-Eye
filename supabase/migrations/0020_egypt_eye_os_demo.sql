-- ===========================================================================
-- EGYPT EYE OS — demo / evaluation data
-- ===========================================================================
--
-- OPTIONAL. Skip this file on a production project and the OS starts empty
-- but fully configured.
--
-- Everything here is fictional but shaped like the real business: the crew
-- Egypt Eye actually needs, the locations it actually works at, the way a
-- Fayoum flying-dress shoot actually differs from a Giza tour. Trips are
-- created RELATIVE TO THE DAY THIS RUNS, so the Today board, the Tomorrow
-- board and the calendar are always populated no matter when it is seeded.
--
-- A few records are deliberately imperfect, because a demo where everything
-- is green demonstrates nothing:
--   * EE-1xxxx tomorrow has no driver           -> a critical readiness blocker
--   * one photographer is soft-double-booked    -> the conflict engine fires
--   * a completed shoot has no Drive folder yet -> the media chase automation
--   * one supplier rate rises mid-year          -> historical pricing holds
--
-- Safe to re-run.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- FX rates. Inserted with a date, never updated — a trip costed at 48.60
-- EGP/USD keeps that number for its whole life.
-- ---------------------------------------------------------------------------
insert into public.os_fx_rates (base_currency, quote_currency, rate, as_of, source) values
  ('USD', 'EGP', 47.80, current_date - 180, 'manual'),
  ('USD', 'EGP', 48.60, current_date - 30,  'manual'),
  ('USD', 'EUR', 0.9200, current_date - 30, 'manual'),
  ('USD', 'GBP', 0.7850, current_date - 30, 'manual'),
  ('USD', 'JPY', 152.40, current_date - 30, 'manual'),
  ('USD', 'KRW', 1352.00, current_date - 30, 'manual'),
  ('USD', 'AED', 3.6725, current_date - 30, 'manual'),
  ('USD', 'USD', 1.0, current_date - 365, 'fixed')
on conflict (base_currency, quote_currency, as_of) do nothing;

-- ---------------------------------------------------------------------------
-- LOCATIONS — with the operational notes that normally live in one veteran's
-- head. This is the institutional-memory requirement made concrete.
-- ---------------------------------------------------------------------------
insert into public.os_locations (org_id, name, city, region, kind, latitude, longitude, typical_drive_minutes, access_notes, permit_notes, ticket_notes, best_time_notes)
select o.id, v.* from public.os_orgs o,
(values
  ('Giza Plateau', 'Giza', 'Greater Cairo', 'site', 29.9773, 31.1325, 45,
   'Enter by the main gate at Al Haram for vehicles. The Sphinx gate is walk-in only and adds 20 minutes on foot. Drivers wait in the upper lot; there is no shade there after 10:00.',
   'Tripod and professional lighting need a paid photography permit arranged the day before. A handheld camera needs nothing.',
   'Plateau entry plus separate tickets for the Great Pyramid interior and the Solar Boat museum. Interior tickets sell out by 09:30 in high season.',
   'Sunrise until 09:00 for clean frames and soft light. Avoid 11:00-14:00 entirely between May and September.'),
  ('Grand Egyptian Museum', 'Giza', 'Greater Cairo', 'site', 29.9938, 31.1194, 50,
   'Coach drop-off is on the north side; private cars use the east lot. Allow 15 minutes from the lot to the atrium.',
   'Commercial photography requires written permission from the museum press office, minimum one week ahead.',
   'Timed-entry tickets. Book the slot, not just the day.',
   'First slot of the morning or the last two hours before close.'),
  ('Saqqara', 'Giza', 'Greater Cairo', 'site', 29.8710, 31.2165, 60,
   'One road in and out. It closes early; confirm the closing time seasonally.',
   'Standard photography permit covers the Step Pyramid complex.',
   'Site ticket plus separate entry for the Serapeum and the noble tombs.',
   'Mornings. The site is exposed and there is almost no shade.'),
  ('Dahshur', 'Giza', 'Greater Cairo', 'site', 29.8090, 31.2065, 75,
   'Quietest of the pyramid fields. Very few visitors before 10:00, which is why it is the best photoshoot backup when Giza is crowded.',
   'Permits are simpler here than at Giza.',
   'Single site ticket covers the Red and Bent Pyramids.',
   'Any morning. Golden hour here is exceptional.'),
  ('Wadi El Rayan', 'Fayoum', 'Fayoum', 'site', 29.2000, 30.4000, 130,
   'Two hours from Cairo on a good day, three if you leave after 07:00. The last stretch is sand — 4x4 or a driver who knows the track only.',
   'Protected area entry fee per person and per vehicle. Drone flight is not permitted without prior clearance.',
   'Protectorate ticket at the gate. Cash, Egyptian pounds.',
   'Late afternoon for the dunes. The light on the lakes at sunset is the reason clients come.'),
  ('Tunis Village', 'Fayoum', 'Fayoum', 'site', 29.4500, 30.5800, 120,
   'Narrow lanes. Large vans cannot reach the pottery workshops; park at the village entrance.',
   null,
   'No ticket. Workshop visits are arranged directly and paid in cash.',
   'Morning, before the workshops fill with day groups.'),
  ('Khan el-Khalili', 'Cairo', 'Greater Cairo', 'site', 30.0477, 31.2622, 35,
   'No vehicle access inside the bazaar. Drop at Al-Azhar and walk in; agree the pickup point before the group disperses.',
   'Tripods draw attention and are best avoided.',
   'No ticket.',
   'Evening, when the lanes are lit. Fridays before noon are very quiet.'),
  ('Coptic Cairo', 'Cairo', 'Greater Cairo', 'site', 30.0053, 31.2306, 40,
   'Compact and walkable. Security screening at the entrance to the compound.',
   'No professional lighting inside the churches.',
   'Free entry; the Coptic Museum is ticketed separately.',
   'Mornings on weekdays.'),
  ('Luxor East Bank', 'Luxor', 'Upper Egypt', 'site', 25.7000, 32.6400, 20,
   'Karnak and Luxor Temple. Hotel pickups on the Corniche are straightforward.',
   'Photography permit needed for tripods at Karnak.',
   'Separate tickets for Karnak and Luxor Temple. The Karnak sound and light show is booked separately.',
   'Karnak at opening, Luxor Temple after dark when it is lit.'),
  ('Luxor West Bank', 'Luxor', 'Upper Egypt', 'site', 25.7400, 32.6000, 45,
   'Ferry or bridge. The bridge adds 30 minutes but is the only option for a vehicle.',
   'No photography at all inside the Valley of the Kings tombs without the paid camera ticket.',
   'Valley of the Kings general ticket covers three tombs; Tutankhamun, Seti I and Nefertari are each extra.',
   'Start at 06:00. By 10:00 the valley is both crowded and dangerously hot in summer.'),
  ('Philae Temple', 'Aswan', 'Upper Egypt', 'site', 24.0250, 32.8840, 30,
   'Reached only by motorboat from Marina. Boat fare is negotiated separately and is not in the ticket.',
   null,
   'Temple ticket plus the boat. Agree the boat price before boarding.',
   'Early morning, or the evening sound and light show.'),
  ('Cairo International Airport', 'Cairo', 'Greater Cairo', 'airport', 30.1219, 31.4056, 45,
   'Terminal 3 for most international arrivals, Terminal 2 for some European carriers. Meeting point is inside the arrivals hall after customs — confirm the terminal from the flight number, never from the client.',
   'A meet-and-greet representative needs an airport access pass to go past the hall.',
   null,
   'Allow 90 minutes from landing to being in the vehicle at peak times.'),
  ('Nile Corniche, Maadi', 'Cairo', 'Greater Cairo', 'meeting_point', 29.9600, 31.2570, 30,
   'Reliable, quiet pickup point for Maadi hotels and apartments.', null, null, 'Anytime.'),
  ('Egypt Eye Office', 'Cairo', 'Greater Cairo', 'office', 30.0444, 31.2357, 0,
   'Crew base. Equipment and dresses are signed in and out here.', null, null, null)
) as v(name, city, region, kind, latitude, longitude, typical_drive_minutes, access_notes, permit_notes, ticket_notes, best_time_notes)
where o.key = 'egypt-eye'
  and not exists (select 1 from public.os_locations l where l.org_id = o.id and l.name = v.name);

-- ---------------------------------------------------------------------------
-- THE TEAM
-- ---------------------------------------------------------------------------
insert into public.os_employees
  (org_id, code, full_name, display_name, email, phone, job_title, department, employment_type,
   primary_unit_id, skills, languages, home_city, can_drive, day_rate_amount, day_rate_currency, hired_on, notes)
select o.id, v.code, v.full_name, v.display_name, v.email, v.phone, v.job_title, v.department, v.employment_type,
       u.id, v.skills::text[], v.languages::text[], v.home_city, v.can_drive, v.rate, v.rate_ccy,
       current_date - v.hired_days, v.notes
from public.os_orgs o
cross join lateral (values
  ('EE-001','Bishoy Nassif','Bish','bish@egypteyetravel.com','+20 100 000 0001','Founder','Management','staff','tours','{leadership,commercial}','{Arabic,English}','Cairo',true,null,'USD',2400,'Founder. Final say on pricing, partnerships and anything a client escalates.'),
  ('EE-002','Mariam Fahmy','Mariam','mariam@egypteyetravel.com','+20 100 000 0002','Operations Manager','Operations','staff','tours','{scheduling,crisis_management,supplier_relations}','{Arabic,English,French}','Cairo',true,null,'USD',1500,'Owns the daily operation. Approves overrides and unplanned cost.'),
  ('EE-003','Karim Adel','Karim','karim@egypteyetravel.com','+20 100 000 0003','Operations Executive','Operations','staff','tours','{scheduling,logistics}','{Arabic,English}','Giza',true,null,'USD',700,'Builds the schedule and staffs it. First responder on the Tomorrow board.'),
  ('EE-004','Nour Hassan','Nour','nour@egypteyetravel.com','+20 100 000 0004','Reservations Lead','Reservations','staff','photoshoots','{sales,client_care,quoting}','{Arabic,English,Italian}','Cairo',false,null,'USD',900,'Closes the deal and creates the trip. The OS starts with her.'),
  ('EE-005','Yasmin Saleh','Yasmin','yasmin@egypteyetravel.com','+20 100 000 0005','Reservations Executive','Reservations','staff','photoshoots','{sales,client_care}','{Arabic,English}','Cairo',false,null,'USD',400,null),
  ('EE-006','Hana Mostafa','Hana','hana@egypteyetravel.com','+20 100 000 0006','Finance Manager','Finance','staff','tours','{accounting,reporting}','{Arabic,English}','Cairo',false,null,'USD',1100,'Owns actual cost, payments and the monthly margin report.'),
  ('EE-007','Dalia Ramzy','Dalia','dalia@egypteyetravel.com','+20 100 000 0007','HR and Admin','People','staff','tours','{hr,scheduling}','{Arabic,English}','Cairo',false,null,'USD',800,null),
  ('EE-008','Omar Sherif','Omar','omar@egypteyetravel.com','+20 100 000 0008','Photoshoot Coordinator','Operations','staff','photoshoots','{styling,location_scouting,client_care}','{Arabic,English}','Giza',true,null,'USD',600,'Runs shoot days on location. Knows every permit officer at the plateau.'),
  ('EE-009','Aya Fathy','Aya','aya@egypteyetravel.com','+20 100 000 0009','Tours Coordinator','Operations','staff','tours','{logistics,client_care}','{Arabic,English,German}','Cairo',false,null,'USD',550,null),
  ('EE-010','Ahmed Tarek','Ahmed','ahmed.t@egypteyetravel.com','+20 100 000 0010','Senior Photographer','Creative','staff','photoshoots','{portrait,golden_hour,drone,retouching}','{Arabic,English}','Giza',true,120,'USD',900,'Best available for VIP and luxury tiers. Books out first.'),
  ('EE-011','Mina Wagih','Mina','mina@egypteyetravel.com','+20 100 000 0011','Photographer','Creative','freelance','photoshoots','{portrait,couples}','{Arabic,English}','Cairo',false,85,'USD',500,null),
  ('EE-012','Salma Adly','Salma','salma@egypteyetravel.com','+20 100 000 0012','Photographer','Creative','staff','flying_dress','{flying_dress,styling,portrait}','{Arabic,English}','Fayoum',false,95,'USD',430,'Specialist. Handles the dress and the wind better than anyone.'),
  ('EE-013','Youssef Ibrahim','Youssef','youssef@egypteyetravel.com','+20 100 000 0013','Videographer','Creative','freelance','content','{video,drone,editing}','{Arabic,English}','Cairo',true,140,'USD',320,null),
  ('EE-014','Mostafa Kamal','Mostafa','mostafa@egypteyetravel.com','+20 100 000 0014','Senior Guide','Guiding','staff','tours','{egyptology,storytelling,museums}','{Arabic,English,German}','Cairo',false,70,'USD',1800,'Licensed Egyptologist. Requested by name by repeat clients.'),
  ('EE-015','Rania Elgohary','Rania','rania@egypteyetravel.com','+20 100 000 0015','Guide','Guiding','staff','tours','{egyptology,family_groups}','{Arabic,English,French,Spanish}','Cairo',false,60,'USD',900,null),
  ('EE-016','Hossam Ali','Hossam','hossam@egypteyetravel.com','+20 100 000 0016','Guide (Upper Egypt)','Guiding','freelance','tours','{egyptology,luxor,aswan}','{Arabic,English}','Luxor',false,55,'USD',700,'Based in Luxor. Covers everything south of Minya.'),
  ('EE-017','Sayed Abdo','Sayed','sayed@egypteyetravel.com','+20 100 000 0017','Driver','Transport','staff','transfers','{cairo,giza,airport}','{Arabic}','Giza',true,45,'USD',2000,'Twenty years on the plateau roads. Never late.'),
  ('EE-018','Ashraf Fouad','Ashraf','ashraf@egypteyetravel.com','+20 100 000 0018','Driver','Transport','staff','transfers','{cairo,fayoum,long_distance}','{Arabic,English}','Cairo',true,45,'USD',1200,'The Fayoum desert track driver.'),
  ('EE-019','Ibrahim Nagy','Ibrahim','ibrahim@egypteyetravel.com','+20 100 000 0019','Driver (Luxor)','Transport','freelance','transfers','{luxor,aswan}','{Arabic}','Luxor',true,35,'USD',600,null),
  ('EE-020','Tamer Zaki','Tamer','tamer@egypteyetravel.com','+20 100 000 0020','Lead Editor','Creative','staff','content','{retouching,colour_grading,delivery}','{Arabic,English}','Cairo',false,null,'USD',800,'Owns the editing queue and the quality check before delivery.'),
  ('EE-021','Laila Mounir','Laila','laila@egypteyetravel.com','+20 100 000 0021','Content Producer','Creative','staff','content','{editing,social,copywriting}','{Arabic,English}','Cairo',false,null,'USD',450,null),
  ('EE-022','Peter Sobhy','Peter','peter@egypteyetravel.com','+20 100 000 0022','Airport Representative','Operations','staff','transfers','{meet_and_greet,airport}','{Arabic,English,Russian}','Cairo',false,30,'USD',900,'Holds the airport access pass.')
) as v(code, full_name, display_name, email, phone, job_title, department, employment_type, unit_key,
       skills, languages, home_city, can_drive, rate, rate_ccy, hired_days, notes)
join public.os_business_units u on u.org_id = o.id and u.key = v.unit_key
where o.key = 'egypt-eye'
  and not exists (select 1 from public.os_employees e where e.org_id = o.id and e.code = v.code);

-- Role grants for the demo team.
insert into public.os_employee_roles (employee_id, role_id)
select e.id, r.id
from public.os_employees e
join public.os_orgs o on o.id = e.org_id and o.key = 'egypt-eye'
join (values
  ('EE-001','owner'), ('EE-002','operations_manager'), ('EE-003','operations'),
  ('EE-004','reservation'), ('EE-005','reservation'), ('EE-006','finance'),
  ('EE-007','hr'), ('EE-008','coordinator'), ('EE-009','coordinator'),
  ('EE-010','photographer'), ('EE-011','photographer'), ('EE-012','photographer'),
  ('EE-013','photographer'), ('EE-014','guide'), ('EE-015','guide'), ('EE-016','guide'),
  ('EE-017','driver'), ('EE-018','driver'), ('EE-019','driver'),
  ('EE-020','editor'), ('EE-021','content_team'), ('EE-022','representative')
) as v(code, role_key) on v.code = e.code
join public.os_roles r on r.org_id = o.id and r.key = v.role_key
on conflict (employee_id, role_id) do nothing;

-- Unit membership drives scope='unit' resolution.
insert into public.os_employee_units (employee_id, unit_id)
select e.id, e.primary_unit_id from public.os_employees e
where e.primary_unit_id is not null
on conflict do nothing;

-- The photoshoot coordinator also covers flying dresses, so their 'unit'
-- scope reaches both — this is the multi-unit case the model has to handle.
insert into public.os_employee_units (employee_id, unit_id)
select e.id, u.id
from public.os_employees e
join public.os_orgs o on o.id = e.org_id and o.key = 'egypt-eye'
join public.os_business_units u on u.org_id = o.id and u.key = 'flying_dress'
where e.code = 'EE-008'
on conflict do nothing;

-- A real-world exception, and exactly the kind the override table exists
-- for: the senior photographer is trusted to see what a shoot costs so he
-- can push back on unrealistic briefs, without being given anything else
-- from the finance module.
insert into public.os_permission_overrides (employee_id, permission_key, scope, granted, reason)
select e.id, 'trips.financials', 'own', true,
  'Senior photographer reviews shoot costings for the trips he is on. Agreed with Finance.'
from public.os_employees e
join public.os_orgs o on o.id = e.org_id and o.key = 'egypt-eye'
where e.code = 'EE-010'
on conflict (employee_id, permission_key) do nothing;

-- ---------------------------------------------------------------------------
-- RESOURCES — vehicles, dresses, equipment
-- ---------------------------------------------------------------------------
insert into public.os_resources
  (org_id, unit_id, kind, code, name, description, status, condition, capacity, model, plate, year,
   color, size, serial_number, home_base, cost_rate_amount, cost_rate_currency, cost_rate_unit, attributes, notes)
select o.id, u.id, v.kind, v.code, v.name, v.description, v.status, v.condition, v.capacity, v.model, v.plate, v.year,
       v.color, v.size, v.serial_number, v.home_base, v.rate, v.rate_ccy, v.rate_unit, v.attributes::jsonb, v.notes
from public.os_orgs o
cross join lateral (values
  ('vehicle','VEH-01','Hyundai H1 — White','7-seat van, the workhorse for Giza and Cairo days.','available','good',7,'Hyundai H1','GZ 4471',2022,null,null,null,'Egypt Eye Office',45,'USD','per_trip','{"air_conditioning":true,"luggage":"4 large","wifi":false}','transfers','Default vehicle for standard tier day tours.'),
  ('vehicle','VEH-02','Hyundai H1 — Grey','Second 7-seat van.','available','good',7,'Hyundai H1','GZ 4472',2021,null,null,null,'Egypt Eye Office',45,'USD','per_trip','{"air_conditioning":true,"luggage":"4 large","wifi":false}','transfers',null),
  ('vehicle','VEH-03','Toyota Hiace — 12 seat','Group vehicle.','available','fair',12,'Toyota Hiace','CA 8820',2019,null,null,null,'Egypt Eye Office',65,'USD','per_trip','{"air_conditioning":true,"luggage":"8 large"}','group_trips','Needs a service every 5,000 km. Watch the AC in July.'),
  ('vehicle','VEH-04','Mercedes V-Class — VIP','Premium and VIP tier only.','available','excellent',6,'Mercedes V-Class','CA 1101',2024,null,null,null,'Egypt Eye Office',110,'USD','per_trip','{"air_conditioning":true,"wifi":true,"water":true,"privacy_glass":true}','tours','Reserved for Luxury and VIP. Do not assign to standard tier without approval.'),
  ('vehicle','VEH-05','Chevrolet Cruze — Sedan','Airport transfers, couples.','available','good',3,'Chevrolet Cruze','CA 6633',2021,null,null,null,'Egypt Eye Office',28,'USD','per_trip','{"air_conditioning":true,"luggage":"2 large"}','transfers',null),
  ('vehicle','VEH-06','Toyota Land Cruiser — 4x4','The only vehicle that goes on the Wadi El Rayan sand.','maintenance','needs_repair',6,'Toyota Land Cruiser','FY 2210',2018,null,null,null,'Fayoum',90,'USD','per_trip','{"four_wheel_drive":true,"desert_rated":true}','flying_dress','Front suspension in the workshop. Back in service in a few days.'),

  ('dress','DR-01','Red Flame','Signature red flying dress with a six-metre train.','available','excellent',null,null,null,null,'Red','One size / adjustable',null,'Egypt Eye Office',35,'USD','per_trip','{"train_metres":6,"needs_assistant":true}','flying_dress','The most requested dress. Photographs best at Wadi El Rayan and Dahshur.'),
  ('dress','DR-02','Ivory Cloud','Ivory, lighter fabric — best in low wind.','available','excellent',null,null,null,null,'Ivory','One size / adjustable',null,'Egypt Eye Office',35,'USD','per_trip','{"train_metres":5,"needs_assistant":true,"wind_sensitive":true}','flying_dress',null),
  ('dress','DR-03','Royal Blue','Deep blue, heavy fabric, holds shape in wind.','cleaning','good',null,null,null,null,'Royal Blue','One size / adjustable',null,'Dry cleaner, Maadi',35,'USD','per_trip','{"train_metres":6,"needs_assistant":true}','flying_dress','At the cleaner after the Fayoum shoot. Back within two days.'),
  ('dress','DR-04','Emerald Nile','Emerald green with gold detailing.','available','good',null,null,null,null,'Emerald','One size / adjustable',null,'Egypt Eye Office',35,'USD','per_trip','{"train_metres":5,"needs_assistant":true}','flying_dress',null),
  ('dress','DR-05','Blush Rose','Soft pink. Popular for proposals.','available','excellent',null,null,null,null,'Blush','One size / adjustable',null,'Egypt Eye Office',35,'USD','per_trip','{"train_metres":5,"needs_assistant":true}','flying_dress',null),
  ('dress','DR-06','Gold Pharaoh','Gold, structured, heaviest of the set.','available','fair',null,null,null,null,'Gold','One size / adjustable',null,'Egypt Eye Office',40,'USD','per_trip','{"train_metres":7,"needs_assistant":true,"heavy":true}','flying_dress','Hem needs repair before the next booking.'),

  ('equipment','EQ-01','Sony A7 IV — Body A','Primary camera body.','available','excellent',null,'Sony A7 IV',null,2023,null,null,'SN-A74-88120','Egypt Eye Office',null,'USD','per_trip','{"mount":"E","sensor":"full_frame"}','photoshoots',null),
  ('equipment','EQ-02','Sony A7 IV — Body B','Second body / backup.','available','good',null,'Sony A7 IV',null,2022,null,null,'SN-A74-88121','Egypt Eye Office',null,'USD','per_trip','{"mount":"E","sensor":"full_frame"}','photoshoots',null),
  ('equipment','EQ-03','Sony 24-70mm f/2.8 GM','Workhorse zoom.','available','excellent',null,'FE 24-70 GM II',null,2023,null,null,'SN-2470-4412','Egypt Eye Office',null,'USD','per_trip','{"mount":"E"}','photoshoots',null),
  ('equipment','EQ-04','Sony 70-200mm f/2.8 GM','Compression lens for pyramid backdrops.','available','excellent',null,'FE 70-200 GM II',null,2023,null,null,'SN-70200-9931','Egypt Eye Office',null,'USD','per_trip','{"mount":"E"}','photoshoots','The lens that makes the pyramid look the size clients expect.'),
  ('equipment','EQ-05','DJI Mavic 3','Drone. Flight clearance required at most sites.','available','good',null,'DJI Mavic 3',null,2022,null,null,'SN-MAV3-2201','Egypt Eye Office',null,'USD','per_trip','{"requires_permit":true}','content','Do not fly at Giza or Wadi El Rayan without written clearance.'),
  ('equipment','EQ-06','Portable lighting kit','Two heads, stands, modifiers.','available','good',null,'Godox AD200 Pro x2',null,2021,null,null,'SN-GDX-5510','Egypt Eye Office',null,'USD','per_trip','{"needs_permit_at_sites":true}','photoshoots','Counts as professional equipment at ticketed sites — permit needed.')
) as v(kind, code, name, description, status, condition, capacity, model, plate, year, color, size,
       serial_number, home_base, rate, rate_ccy, rate_unit, attributes, unit_key, notes)
join public.os_business_units u on u.org_id = o.id and u.key = v.unit_key
where o.key = 'egypt-eye'
  and not exists (select 1 from public.os_resources r where r.org_id = o.id and r.code = v.code);

-- The 4x4 is genuinely out of service, so it is blocked on the calendar too
-- rather than only carrying a status label.
insert into public.os_unavailability (org_id, resource_id, starts_at, ends_at, reason, note)
select o.id, r.id, (current_date - 2)::timestamptz, (current_date + 4)::timestamptz, 'maintenance',
  'Front suspension rebuild at the Fayoum workshop.'
from public.os_orgs o join public.os_resources r on r.org_id = o.id and r.code = 'VEH-06'
where o.key = 'egypt-eye'
  and not exists (select 1 from public.os_unavailability x where x.resource_id = r.id and x.reason = 'maintenance');

insert into public.os_unavailability (org_id, employee_id, starts_at, ends_at, reason, note)
select o.id, e.id, (current_date + 3)::timestamptz, (current_date + 8)::timestamptz, 'leave',
  'Annual leave, approved.'
from public.os_orgs o join public.os_employees e on e.org_id = o.id and e.code = 'EE-015'
where o.key = 'egypt-eye'
  and not exists (select 1 from public.os_unavailability x where x.employee_id = e.id);

-- ---------------------------------------------------------------------------
-- SUPPLIERS AND THEIR SERVICES
-- ---------------------------------------------------------------------------
insert into public.os_suppliers (org_id, code, name, contact_name, phone, email, city, categories, payment_terms, currency, rating, notes)
select o.id, v.code, v.name, v.contact_name, v.phone, v.email, v.city, v.categories::text[], v.payment_terms, v.currency, v.rating, v.notes
from public.os_orgs o,
(values
  ('SUP-01','Horizon Permits & Tickets','Adel Mahmoud','+20 100 111 0001','permits@horizon-eg.example','Giza','{tickets,permits}','Net 7, cash on collection for same-day','EGP',4.60,'Handles plateau photography permits and bulk site tickets. Needs 24 hours for a permit; same-day is possible but costs more.'),
  ('SUP-02','Fayoum Desert Camp','Sameh Roushdy','+20 100 111 0002','camp@fayoumdesert.example','Fayoum','{activity,catering,venue}','50% deposit, balance on the day','EGP',4.20,'Base for Wadi El Rayan shoots. Lunch, shade and changing facilities.'),
  ('SUP-03','Nile Jewel Cruises','Marina Adib','+20 100 111 0003','ops@nilejewel.example','Cairo','{cruise,dining}','Net 14','USD',4.80,'Dinner cruise partner. Reliable, but confirm the table in writing.'),
  ('SUP-04','Sky Luxor Balloons','Tarek Younis','+20 100 111 0004','book@skyluxor.example','Luxor','{activity}','Prepaid','USD',4.10,'Balloon flights. Weather cancellations are common in winter — always hold a backup morning.'),
  ('SUP-05','Marsam Catering','Hoda Zaki','+20 100 111 0005','hoda@marsam.example','Luxor','{catering}','Net 7','EGP',4.40,null),
  ('SUP-06','Pyramids View Hotel','Reservations Desk','+20 100 111 0006','res@pyramidsview.example','Giza','{hotel}','Net 30','USD',3.90,'Convenient for early plateau starts. Rooms vary; ask for the pyramid-side floors.')
) as v(code, name, contact_name, phone, email, city, categories, payment_terms, currency, rating, notes)
where o.key = 'egypt-eye'
  and not exists (select 1 from public.os_suppliers s where s.org_id = o.id and s.code = v.code);

insert into public.os_supplier_services (supplier_id, name, category, unit_label, lead_time_hours, notes)
select s.id, v.name, v.category, v.unit_label, v.lead_time, v.notes
from public.os_suppliers s
join public.os_orgs o on o.id = s.org_id and o.key = 'egypt-eye'
join (values
  ('SUP-01','Giza photography permit','permits','per shoot',24,'Covers tripod and lighting on the plateau.'),
  ('SUP-01','Giza plateau entry ticket','tickets','per person',0,null),
  ('SUP-01','Great Pyramid interior ticket','tickets','per person',12,'Sells out early in high season.'),
  ('SUP-02','Desert camp day use with lunch','activity','per person',48,'Includes shade, changing tent and a hot lunch.'),
  ('SUP-02','4x4 desert transfer','activity','per vehicle',24,'Their driver, their vehicle, on the sand section only.'),
  ('SUP-03','Dinner cruise with entertainment','cruise','per person',72,null),
  ('SUP-04','Sunrise balloon flight','activity','per person',48,'Weather dependent.'),
  ('SUP-05','Set lunch, West Bank','catering','per person',24,null),
  ('SUP-06','Standard double, room only','hotel','per room per night',24,null)
) as v(supplier_code, name, category, unit_label, lead_time, notes) on v.supplier_code = s.code
where not exists (
  select 1 from public.os_supplier_services ss where ss.supplier_id = s.id and ss.name = v.name
);

-- ---------------------------------------------------------------------------
-- THE PRICE BOOK
-- ---------------------------------------------------------------------------
insert into public.os_price_items (org_id, key, name, category, unit_label, description, sort_order)
select o.id, v.* from public.os_orgs o,
(values
  ('giza_entry',        'Giza plateau entry',          'ticket',       'per person', 'Site entry ticket. Rises with the annual antiquities revision.', 1),
  ('giza_interior',     'Great Pyramid interior',      'ticket',       'per person', null, 2),
  ('gem_entry',         'Grand Egyptian Museum entry', 'ticket',       'per person', 'Timed entry.', 3),
  ('saqqara_entry',     'Saqqara site ticket',         'ticket',       'per person', null, 4),
  ('vok_entry',         'Valley of the Kings',         'ticket',       'per person', 'Covers three tombs.', 5),
  ('photo_permit_giza', 'Giza photography permit',     'permit',       'per shoot',  'Required for tripod or lighting.', 6),
  ('fayoum_protectorate','Wadi El Rayan protectorate', 'permit',       'per person', null, 7),
  ('guide_day',         'Guide, full day',             'guide',        'per day',    'Licensed Egyptologist, up to 8 hours.', 10),
  ('guide_half',        'Guide, half day',             'guide',        'per half day', null, 11),
  ('driver_cairo',      'Driver, Cairo and Giza day',  'driver',       'per day',    null, 12),
  ('driver_long',       'Driver, long distance',       'driver',       'per day',    'Fayoum, Alexandria, Ain Sokhna.', 13),
  ('vehicle_van7',      'Van, 7 seat',                 'vehicle',      'per day',    null, 14),
  ('vehicle_vip',       'Vehicle, VIP',                'vehicle',      'per day',    'Mercedes V-Class.', 15),
  ('photographer_2h',   'Photographer, 2 hour session','photographer', 'per session', null, 20),
  ('photographer_4h',   'Photographer, 4 hour session','photographer', 'per session', null, 21),
  ('photographer_full', 'Photographer, full day',      'photographer', 'per day',    null, 22),
  ('videographer_half', 'Videographer, half day',      'videographer', 'per half day', null, 23),
  ('dress_rental',      'Flying dress rental',         'dress',        'per shoot',  'Includes assistant and steaming.', 24),
  ('editing_standard',  'Editing, standard delivery',  'editing',      'per shoot',  'Up to 40 retouched images.', 25),
  ('editing_express',   'Editing, 48 hour delivery',   'editing',      'per shoot',  null, 26),
  ('lunch_standard',    'Lunch, standard',             'meal',         'per person', null, 30),
  ('camp_day_use',      'Desert camp day use',         'activity',     'per person', null, 31),
  ('cruise_dinner',     'Nile dinner cruise',          'activity',     'per person', null, 32),
  ('balloon_sunrise',   'Sunrise balloon flight',      'activity',     'per person', null, 33),
  ('transfer_airport',  'Airport transfer',            'transfer',     'per vehicle', null, 34),
  ('coordinator_day',   'On-site coordinator',         'staff',        'per day',    null, 35)
) as v(key, name, category, unit_label, description, sort_order)
where o.key = 'egypt-eye'
  and not exists (select 1 from public.os_price_items p where p.org_id = o.id and p.key = v.key);

-- Effective-dated rates. Note `giza_entry` and `photo_permit_giza`: both have
-- a January window and an April window at a higher price. A trip on 15 March
-- resolves the first; a trip on 15 May resolves the second; and re-opening
-- the March trip a year later still shows the March number, because the cost
-- line snapshotted both the amount and the rate id it came from.
insert into public.os_rates (org_id, price_item_id, tier, cost_amount, sell_amount, currency, unit_label, valid_from, valid_to, note)
select o.id, p.id, v.tier, v.cost, v.sell, v.ccy, p.unit_label,
       make_date(extract(year from current_date)::int, v.from_month, 1),
       case when v.to_month is null then null
            else (make_date(extract(year from current_date)::int, v.to_month, 1) + interval '1 month - 1 day')::date end,
       v.note
from public.os_orgs o
join public.os_price_items p on p.org_id = o.id
join (values
  ('giza_entry','any',14.00,20.00,'USD',1,3,'Antiquities tariff, first quarter.'),
  ('giza_entry','any',16.50,24.00,'USD',4,null,'Antiquities tariff revised upward in April.'),
  ('giza_interior','any',18.00,26.00,'USD',1,null,null),
  ('gem_entry','any',25.00,35.00,'USD',1,null,null),
  ('saqqara_entry','any',9.00,14.00,'USD',1,null,null),
  ('vok_entry','any',13.00,20.00,'USD',1,null,null),
  ('photo_permit_giza','any',50.00,80.00,'USD',1,3,'Horizon Permits, first quarter.'),
  ('photo_permit_giza','any',60.00,95.00,'USD',4,6,'Spring revision.'),
  ('photo_permit_giza','any',75.00,115.00,'USD',7,null,'High-season rate from July.'),
  ('fayoum_protectorate','any',6.00,10.00,'USD',1,null,null),
  ('guide_day','any',70.00,120.00,'USD',1,null,null),
  ('guide_day','luxury',95.00,180.00,'USD',1,null,'Senior guide, requested by name.'),
  ('guide_half','any',45.00,80.00,'USD',1,null,null),
  ('driver_cairo','any',45.00,75.00,'USD',1,null,null),
  ('driver_long','any',70.00,115.00,'USD',1,null,null),
  ('vehicle_van7','any',45.00,80.00,'USD',1,null,null),
  ('vehicle_vip','any',110.00,190.00,'USD',1,null,null),
  ('photographer_2h','any',85.00,180.00,'USD',1,null,null),
  ('photographer_4h','any',120.00,260.00,'USD',1,null,null),
  ('photographer_4h','luxury',150.00,340.00,'USD',1,null,'Senior photographer.'),
  ('photographer_full','any',180.00,380.00,'USD',1,null,null),
  ('videographer_half','any',140.00,280.00,'USD',1,null,null),
  ('dress_rental','any',35.00,90.00,'USD',1,null,'Includes the assistant who runs the train.'),
  ('editing_standard','any',40.00,0.00,'USD',1,null,'Included in the shoot price; carried as cost only.'),
  ('editing_express','any',70.00,120.00,'USD',1,null,null),
  ('lunch_standard','any',9.00,16.00,'USD',1,null,null),
  ('camp_day_use','any',18.00,32.00,'USD',1,null,null),
  ('cruise_dinner','any',38.00,70.00,'USD',1,null,null),
  ('balloon_sunrise','any',85.00,140.00,'USD',1,null,null),
  ('transfer_airport','any',28.00,50.00,'USD',1,null,null),
  ('coordinator_day','any',55.00,95.00,'USD',1,null,null)
) as v(item_key, tier, cost, sell, ccy, from_month, to_month, note) on v.item_key = p.key
where o.key = 'egypt-eye'
  and not exists (
    select 1 from public.os_rates r
    where r.price_item_id = p.id and r.tier = v.tier
      and r.valid_from = make_date(extract(year from current_date)::int, v.from_month, 1)
  );

-- ---------------------------------------------------------------------------
-- TASK TEMPLATES — the operational checklists that a trip generates
-- ---------------------------------------------------------------------------
insert into public.os_task_templates (org_id, key, name, description, trip_type_id)
select o.id, v.key, v.name, v.description, tt.id
from public.os_orgs o
join (values
  ('photoshoot_standard','Photoshoot — standard checklist','From confirmation through to client delivery.','photoshoot'),
  ('flying_dress_standard','Flying Dress — standard checklist','Adds the dress, the assistant and the wind call.','flying_dress'),
  ('tour_standard','Day Tour — standard checklist','Guide, driver, tickets and the client brief.','tour'),
  ('transfer_standard','Transfer — standard checklist','Deliberately short. A transfer needs four things, not fourteen.','transfer')
) as v(key, name, description, type_key) on true
join public.os_trip_types tt on tt.org_id = o.id and tt.key = v.type_key
where o.key = 'egypt-eye'
  and not exists (select 1 from public.os_task_templates t where t.org_id = o.id and t.key = v.key);

insert into public.os_task_template_items (template_id, seq, title, description, owner_role_key, priority, offset_days, offset_hours, phase, blocking)
select t.id, v.seq, v.title, v.description, v.owner, v.priority, v.days, v.hours, v.phase, v.blocking
from public.os_task_templates t
join public.os_orgs o on o.id = t.org_id and o.key = 'egypt-eye'
join (values
  -- Photoshoot: the eleven steps the spec describes, with real owners and timing.
  ('photoshoot_standard', 1,'Confirm client details and contact number','Phone, WhatsApp and the language they prefer. A shoot that cannot reach the client at 06:00 does not happen.','reservation','critical',-5,0,'pre',true),
  ('photoshoot_standard', 2,'Assign photographer','Match tier, location and language. Check the workload board before committing.','operations','critical',-4,0,'pre',true),
  ('photoshoot_standard', 3,'Assign driver and vehicle','Vehicle must match the party size and the tier.','operations','critical',-4,0,'pre',true),
  ('photoshoot_standard', 4,'Confirm pickup point and time','Hotel name, exact door, and the time the client agreed — not the time we assumed.','operations','high',-3,0,'pre',true),
  ('photoshoot_standard', 5,'Arrange the photography permit','Horizon needs 24 hours. Same-day costs more and is not guaranteed.','operations','high',-2,0,'pre',true),
  ('photoshoot_standard', 6,'Buy site tickets','Interior tickets sell out early in high season.','operations','medium',-1,0,'pre',false),
  ('photoshoot_standard', 7,'Send the trip brief to the crew','Photographer, driver and coordinator all get the same brief.','coordinator','high',-1,0,'pre',true),
  ('photoshoot_standard', 8,'Execute the shoot','On location. Report field status as you go.','photographer','critical',0,0,'day',false),
  ('photoshoot_standard', 9,'Upload raw files to Google Drive','Same day. Raw folder, correct trip reference in the folder name.','photographer','critical',0,8,'post',false),
  ('photoshoot_standard',10,'Edit and quality check','Up to 40 retouched images unless the package says otherwise.','editor','high',3,0,'post',false),
  ('photoshoot_standard',11,'Deliver the gallery to the client','Delivery link, and confirm the client can open it.','content_team','critical',6,0,'post',false),
  ('photoshoot_standard',12,'Ask for feedback and a review','Only after they have seen the photos.','reservation','medium',8,0,'post',false),

  ('flying_dress_standard', 1,'Confirm client details and dress size','Height matters as much as size — the train length is chosen from it.','reservation','critical',-6,0,'pre',true),
  ('flying_dress_standard', 2,'Reserve the dress','Check it is not at the cleaner and not booked for the same window.','operations','critical',-5,0,'pre',true),
  ('flying_dress_standard', 3,'Assign photographer and assistant','The assistant runs the train. A flying dress shoot with one person on it does not work.','operations','critical',-5,0,'pre',true),
  ('flying_dress_standard', 4,'Assign driver and desert-capable vehicle','Wadi El Rayan needs the 4x4 or a supplier transfer on the sand.','operations','critical',-4,0,'pre',true),
  ('flying_dress_standard', 5,'Confirm the desert camp booking','Shade, changing tent and lunch.','operations','high',-3,0,'pre',true),
  ('flying_dress_standard', 6,'Check the wind forecast','Above about 25 km/h the dress is unusable and the shoot is moved, not attempted.','coordinator','high',-1,0,'pre',false),
  ('flying_dress_standard', 7,'Confirm pickup — this is a 05:30 start','Confirm the night before, by voice, not by message.','coordinator','critical',-1,0,'pre',true),
  ('flying_dress_standard', 8,'Execute the shoot','','photographer','critical',0,0,'day',false),
  ('flying_dress_standard', 9,'Return and inspect the dress','Log any damage immediately. Send to the cleaner the same day.','coordinator','high',0,10,'post',false),
  ('flying_dress_standard',10,'Upload raw files','','photographer','critical',0,10,'post',false),
  ('flying_dress_standard',11,'Edit, quality check and deliver','','editor','high',4,0,'post',false),

  ('tour_standard', 1,'Confirm client details and party','Names, ages, nationalities, dietary needs.','reservation','critical',-5,0,'pre',true),
  ('tour_standard', 2,'Assign guide','Language first, then specialisation.','operations','critical',-4,0,'pre',true),
  ('tour_standard', 3,'Assign driver and vehicle','','operations','critical',-4,0,'pre',true),
  ('tour_standard', 4,'Buy site tickets','','operations','high',-2,0,'pre',true),
  ('tour_standard', 5,'Confirm lunch booking','','operations','medium',-2,0,'pre',false),
  ('tour_standard', 6,'Confirm pickup with the client','','operations','high',-1,0,'pre',true),
  ('tour_standard', 7,'Send the trip brief to the crew','','coordinator','high',-1,0,'pre',true),
  ('tour_standard', 8,'Run the tour','','guide','critical',0,0,'day',false),
  ('tour_standard', 9,'Record actual costs','Tickets, lunch, anything unplanned.','coordinator','medium',0,8,'post',false),
  ('tour_standard',10,'Ask for feedback and a review','','reservation','medium',2,0,'post',false),

  ('transfer_standard', 1,'Confirm flight number and terminal','From the airline, not from the client.','reservation','critical',-2,0,'pre',true),
  ('transfer_standard', 2,'Assign driver and vehicle','','operations','critical',-1,0,'pre',true),
  ('transfer_standard', 3,'Confirm the meet-and-greet representative','Only if the package includes one.','operations','medium',-1,0,'pre',false),
  ('transfer_standard', 4,'Complete the transfer','','driver','critical',0,0,'day',false)
) as v(template_key, seq, title, description, owner, priority, days, hours, phase, blocking)
  on v.template_key = t.key
where not exists (
  select 1 from public.os_task_template_items i where i.template_id = t.id and i.seq = v.seq
);

-- Point each trip type at its checklist.
update public.os_trip_types tt
set default_task_template_id = t.id
from public.os_task_templates t
where t.org_id = tt.org_id and t.trip_type_id = tt.id and tt.default_task_template_id is null;

-- ---------------------------------------------------------------------------
-- CLIENTS — B2C travellers and B2B agencies in one book
-- ---------------------------------------------------------------------------
insert into public.os_clients
  (org_id, code, kind, full_name, company_name, email, phone, whatsapp, nationality, country, city,
   language, instagram, tiktok, source, vip, commission_pct, payment_terms, preferences, dietary_notes, notes)
select o.id, v.* from public.os_orgs o,
(values
  ('CL-0001','individual','Emma Larsen',null,'emma.larsen@example.com','+45 20 11 22 33','+45 20 11 22 33','Danish','Denmark','Copenhagen','English','@emmalarsen',null,'Instagram',false,null,null,'Prefers early starts. Dislikes crowds — will pay for a quieter alternative.',null,'Second trip with us. Sent three referrals after the first.'),
  ('CL-0002','individual','Yuki Tanaka',null,'y.tanaka@example.com','+81 90 1234 5678',null,'Japanese','Japan','Osaka','English',null,null,'Viator',false,null,null,'Travelling with two children aged 7 and 11. Pace matters more than coverage.','No pork.',null),
  ('CL-0003','individual','Sophia Rossi',null,'sophia@example.com','+39 333 444 5566','+39 333 444 5566','Italian','Italy','Milan','English','@sophiarossi','@sophiarossi','Instagram',true,null,null,'Content creator. Wants golden hour, no exceptions. Will reschedule rather than shoot in flat light.',null,'Audience around 400k. Content rights were agreed in writing before the first shoot.'),
  ('CL-0004','individual','James Whitfield',null,'j.whitfield@example.com','+44 7700 900123',null,'British','United Kingdom','London','English',null,null,'Website',false,null,null,'Luxury tier throughout. Private vehicle only.',null,null),
  ('CL-0005','individual','Chloé Dubois',null,'chloe.dubois@example.com','+33 6 12 34 56 78','+33 6 12 34 56 78','French','France','Lyon','French',null,null,'Instagram',false,null,null,'Proposal planned at the shoot. Her partner does not know — do not mention it in any message she can see.',null,'PROPOSAL. Coordinate through the partner only.'),
  ('CL-0006','individual','Min-Jun Park',null,'minjun.park@example.com','+82 10 9876 5432',null,'South Korean','South Korea','Seoul','English','@minjunshoots','@minjunshoots','TikTok',false,null,null,'Creator collaboration. Shooting his own content alongside ours.',null,null),
  ('CL-0007','individual','Hannah Meyer',null,'h.meyer@example.com','+49 170 1234567',null,'German','Germany','Munich','German',null,null,'Referral',false,null,null,'German-speaking guide requested.','Vegetarian.',null),
  ('CL-0008','individual','Ana Souza',null,'ana.souza@example.com','+55 11 91234 5678',null,'Brazilian','Brazil','São Paulo','English',null,null,'Airbnb Experiences',false,null,null,null,null,null),
  ('CL-0009','individual','Fatima Al-Rashid',null,'f.alrashid@example.com','+971 50 123 4567','+971 50 123 4567','Emirati','United Arab Emirates','Dubai','Arabic',null,null,'Referral',true,null,null,'VIP. Female photographer requested. Private access wherever it can be arranged.',null,'Handled personally by Bish. Escalate anything unusual immediately.'),
  ('CL-0010','individual','Michael Chen',null,'m.chen@example.com','+1 415 555 0198',null,'American','United States','San Francisco','English',null,null,'Tripadvisor',false,null,null,null,null,null),
  ('CL-0011','individual','Olivia Bennett',null,'olivia.b@example.com','+61 4 1234 5678',null,'Australian','Australia','Melbourne','English',null,null,'Website',false,null,null,null,null,null),
  ('CL-0012','individual','Priya Sharma',null,'priya.sharma@example.com','+91 98765 43210',null,'Indian','India','Mumbai','English',null,null,'Instagram',false,null,null,null,'Vegetarian, no onion or garlic.',null),
  ('CL-0013','agency','Wanderlust Travel Co.','Wanderlust Travel Co.','ops@wanderlust.example','+44 20 7946 0100',null,null,'United Kingdom','London','English',null,null,'Travel Agency',false,12.00,'Net 30','Sends small groups monthly. Wants one invoice per month, not per trip.',null,'Reliable payer. Book the senior guide for their groups.'),
  ('CL-0014','agency','Nile Star Reisen','Nile Star Reisen GmbH','buchung@nilestar.example','+49 30 1234 5678',null,null,'Germany','Berlin','German',null,null,'Travel Agency',false,15.00,'Net 30','German-speaking guides mandatory on every booking.',null,null)
) as v(code, kind, full_name, company_name, email, phone, whatsapp, nationality, country, city, language,
       instagram, tiktok, source, vip, commission_pct, payment_terms, preferences, dietary_notes, notes)
where o.key = 'egypt-eye'
  and not exists (select 1 from public.os_clients c where c.org_id = o.id and c.code = v.code);

-- Tag them.
insert into public.os_taggings (tag_id, entity_type, entity_id)
select t.id, 'client', c.id
from public.os_orgs o
join public.os_tags t on t.org_id = o.id
join public.os_clients c on c.org_id = o.id
join (values
  ('CL-0001','repeat'), ('CL-0001','couple'),
  ('CL-0002','family'),
  ('CL-0003','vip'), ('CL-0003','influencer'), ('CL-0003','content_creator'),
  ('CL-0004','luxury'),
  ('CL-0005','couple'),
  ('CL-0006','content_creator'),
  ('CL-0007','family'),
  ('CL-0009','vip'), ('CL-0009','luxury'), ('CL-0009','repeat'),
  ('CL-0013','agency'), ('CL-0014','agency')
) as v(client_code, tag_key) on v.client_code = c.code and v.tag_key = t.key
where o.key = 'egypt-eye'
on conflict do nothing;

-- Travellers. The party is reused across trips rather than retyped.
insert into public.os_travelers (org_id, client_id, full_name, relationship, age_category, nationality, dietary_notes, special_requirements)
select o.id, c.id, v.full_name, v.relationship, v.age_category, v.nationality, v.dietary, v.requirements
from public.os_orgs o
join public.os_clients c on c.org_id = o.id
join (values
  ('CL-0001','Emma Larsen','self','adult','Danish',null,null),
  ('CL-0001','Anders Larsen','spouse','adult','Danish',null,null),
  ('CL-0002','Yuki Tanaka','self','adult','Japanese','No pork.',null),
  ('CL-0002','Kenji Tanaka','spouse','adult','Japanese','No pork.',null),
  ('CL-0002','Hana Tanaka','child','child','Japanese',null,'Age 11. Gets tired after four hours.'),
  ('CL-0002','Sora Tanaka','child','child','Japanese',null,'Age 7. Needs a booster seat.'),
  ('CL-0003','Sophia Rossi','self','adult','Italian',null,null),
  ('CL-0004','James Whitfield','self','adult','British',null,null),
  ('CL-0004','Eleanor Whitfield','spouse','adult','British',null,'Limited mobility — no long walks on sand.'),
  ('CL-0005','Chloé Dubois','self','adult','French',null,null),
  ('CL-0005','Lucas Martin','partner','adult','French',null,null),
  ('CL-0006','Min-Jun Park','self','adult','South Korean',null,null),
  ('CL-0007','Hannah Meyer','self','adult','German','Vegetarian.',null),
  ('CL-0007','Felix Meyer','spouse','adult','German',null,null),
  ('CL-0007','Lena Meyer','child','child','German','Vegetarian.','Age 9.'),
  ('CL-0009','Fatima Al-Rashid','self','adult','Emirati',null,'Female photographer required.'),
  ('CL-0009','Noura Al-Rashid','sister','adult','Emirati',null,null),
  ('CL-0010','Michael Chen','self','adult','American',null,null),
  ('CL-0011','Olivia Bennett','self','adult','Australian',null,null),
  ('CL-0012','Priya Sharma','self','adult','Indian','Vegetarian, no onion or garlic.',null)
) as v(client_code, full_name, relationship, age_category, nationality, dietary, requirements)
  on v.client_code = c.code
where o.key = 'egypt-eye'
  and not exists (
    select 1 from public.os_travelers t where t.client_id = c.id and t.full_name = v.full_name
  );

-- ---------------------------------------------------------------------------
-- TRIPS
-- ---------------------------------------------------------------------------
-- Dated relative to the day this runs, so the Today board, the Tomorrow board
-- and the calendar are always alive. Statuses are set directly here rather
-- than driven through the status engine, because this is seed data, not a
-- simulation of the office.
insert into public.os_trips
  (org_id, ref, title, trip_type_id, unit_id, client_id, status, priority, trip_date, start_time, end_time,
   location_id, pickup_location, pickup_time, dropoff_location, guests_adults, guests_children,
   source, currency, sell_amount, special_requests, notes_internal, emergency_notes,
   confirmed_at, completed_at, created_by)
select o.id, v.ref, v.title, tt.id, tt.unit_id, c.id, v.status, v.priority,
       current_date + v.day_offset, v.start_time::time, v.end_time::time,
       l.id, v.pickup, v.pickup_time::time, v.dropoff, v.adults, v.children,
       v.source, 'USD', v.sell, v.special_requests, v.notes_internal, v.emergency,
       case when v.status <> 'draft' then now() - make_interval(days => greatest(1, 14 + v.day_offset)) end,
       case when v.status in ('completed','content_pending','client_follow_up','closed')
            then (current_date + v.day_offset + 1)::timestamptz end,
       e.id
from public.os_orgs o
join (values
  -- ref, title, type, client, status, priority, day_offset, start, end, location, pickup, pickup_time, dropoff, adults, children, source, sell, special, internal, emergency, created_by
  ('EE-10001','Sunrise Pyramids Photoshoot','photoshoot','CL-0001','closed','normal',-12,'06:30','09:30','Giza Plateau','Marriott Mena House, main entrance','06:00','Marriott Mena House',2,0,'Instagram',560.00,'Wants the classic pyramid compression shot.','Delivered on time. Client sent a five-star review.',null,'EE-004'),
  ('EE-10002','Giza and Grand Egyptian Museum','tour','CL-0002','closed','normal',-9,'08:00','17:00','Giza Plateau','Steigenberger Pyramids, lobby','07:30','Steigenberger Pyramids',2,2,'Viator',430.00,'Children aged 7 and 11 — pace it.','Finished early at the family''s request. Fine.',null,'EE-005'),
  ('EE-10003','Fayoum Flying Dress — Red Flame','flying_dress','CL-0003','content_pending','high',-6,'05:30','13:00','Wadi El Rayan','Four Seasons Nile Plaza, main door','05:00','Four Seasons Nile Plaza',1,0,'Instagram',890.00,'Golden hour on the dunes. No compromise on light.','Dress went to the cleaner the same evening. Editing in progress.',null,'EE-004'),
  ('EE-10004','Airport Arrival Transfer','transfer','CL-0010','closed','normal',-4,'14:00','15:30','Cairo International Airport','Terminal 3, arrivals hall','14:00','Kempinski Nile Hotel',1,0,'Website',50.00,null,null,null,'EE-005'),
  ('EE-10005','Grand Egyptian Museum Portrait Session','photoshoot','CL-0011','content_pending','normal',-3,'09:00','12:00','Grand Egyptian Museum','Hilton Cairo Zamalek, lobby','08:15','Hilton Cairo Zamalek',1,0,'Website',420.00,null,'Raw files still not uploaded. Chased once.',null,'EE-005'),
  ('EE-10006','Saqqara and Dahshur Half Day','tour','CL-0007','completed','normal',-1,'08:30','14:30','Saqqara','Conrad Cairo, lobby','08:00','Conrad Cairo',2,1,'Referral',390.00,'German-speaking guide required.',null,null,'EE-004'),

  ('EE-10007','Sunrise Pyramids Photoshoot','photoshoot','CL-0005','in_progress','high',0,'06:30','09:30','Giza Plateau','Marriott Mena House, main entrance','06:00','Marriott Mena House',2,0,'Instagram',640.00,'PROPOSAL AT THE SHOOT. The partner does not know. Photographer briefed separately.','Proposal moment agreed for the second location. Do not discuss over any channel she can see.','Client partner mobile: +33 6 98 76 54 32','EE-004'),
  ('EE-10008','Giza, Sphinx and GEM Full Day','tour','CL-0012','in_progress','normal',0,'08:00','17:30','Giza Plateau','Ramses Hilton, lobby','07:30','Ramses Hilton',1,0,'Instagram',310.00,'Strict vegetarian, no onion or garlic. Confirm with the restaurant.',null,null,'EE-005'),
  ('EE-10009','Airport Arrival Transfer — meet and greet','transfer','CL-0008','ready','normal',0,'14:30','16:00','Cairo International Airport','Terminal 2, arrivals hall','14:30','Sofitel Cairo Nile El Gezirah',2,0,'Airbnb Experiences',65.00,null,'Flight LH 588, confirmed with the airline.',null,'EE-005'),
  ('EE-10010','Nile Dinner Cruise Experience','experience','CL-0010','ready','normal',0,'18:30','21:30','Nile Corniche, Maadi','Kempinski Nile Hotel, lobby','18:00','Kempinski Nile Hotel',2,0,'Tripadvisor',180.00,null,'Table confirmed in writing with Nile Jewel.',null,'EE-005'),

  ('EE-10011','Fayoum Flying Dress — VIP','flying_dress','CL-0009','assigned','critical',1,'05:30','13:00','Wadi El Rayan','Four Seasons First Residence, private entrance','05:00','Four Seasons First Residence',2,0,'Referral',1450.00,'VIP. Female photographer required — non-negotiable. Private changing area at the camp.','VIP handled by Bish. The desert 4x4 is in the workshop — supplier transfer needed on the sand section.','Client mobile reachable at all times: +971 50 123 4567','EE-004'),
  ('EE-10012','Sunrise Pyramids Photoshoot','photoshoot','CL-0004','assigned','high',1,'06:30','09:30','Giza Plateau','Four Seasons Nile Plaza, lobby','05:45','Four Seasons Nile Plaza',2,0,'Website',720.00,'Luxury tier. Mrs Whitfield has limited mobility — no long walks on sand.','NO DRIVER ASSIGNED. This is a 05:45 pickup from Garden City.',null,'EE-004'),
  ('EE-10013','Luxor West Bank Full Day','tour','CL-0013','ready','normal',1,'06:00','14:00','Luxor West Bank','Sofitel Winter Palace, lobby','05:45','Sofitel Winter Palace',4,0,'Travel Agency',760.00,'Agency group. Senior guide requested.',null,null,'EE-005'),
  ('EE-10014','Dahshur Golden Hour Session','photoshoot','CL-0006','assigned','normal',1,'08:00','11:00','Dahshur','Steigenberger Pyramids, lobby','07:15','Steigenberger Pyramids',1,0,'TikTok',380.00,'Creator collaboration — he is filming his own content too.','Photographer overlaps with EE-10012. Needs resolving before tomorrow.',null,'EE-005'),

  ('EE-10015','Wanderlust Group — Giza and Saqqara','group_trip','CL-0013','planning','normal',2,'08:00','18:00','Giza Plateau','Le Méridien Pyramids, lobby','07:30','Le Méridien Pyramids',9,0,'Travel Agency',1680.00,'Agency series. One invoice at month end.',null,null,'EE-005'),
  ('EE-10016','Coptic Cairo and Khan el-Khalili','tour','CL-0014','planning','normal',3,'09:00','17:00','Coptic Cairo','Marriott Zamalek, lobby','08:30','Marriott Zamalek',6,0,'Travel Agency',890.00,'German-speaking guide mandatory.',null,null,'EE-005'),
  ('EE-10017','GEM Luxury Portrait Session','photoshoot','CL-0004','confirmed','normal',5,'09:00','12:00','Grand Egyptian Museum','Four Seasons Nile Plaza, lobby','08:00','Four Seasons Nile Plaza',2,0,'Website',680.00,'Luxury tier.','Museum press permission still to be requested — one week lead time.',null,'EE-004'),
  ('EE-10018','Fayoum Flying Dress — Ivory Cloud','flying_dress','CL-0011','confirmed','normal',7,'05:30','13:00','Wadi El Rayan','Hilton Cairo Zamalek, lobby','05:00','Hilton Cairo Zamalek',1,0,'Instagram',820.00,null,null,null,'EE-005'),
  ('EE-10019','Creator Collaboration — Dahshur and Saqqara','content_production','CL-0006','confirmed','normal',10,'06:30','13:00','Dahshur','Steigenberger Pyramids, lobby','06:00','Steigenberger Pyramids',1,0,'TikTok',0.00,'Barter collaboration — no fee, content rights agreed in writing.','Zero revenue by design. Cost is real and must still be tracked.',null,'EE-004'),
  ('EE-10020','Philae Temple and Aswan Highlights','tour','CL-0002','confirmed','normal',14,'07:00','15:00','Philae Temple','Sofitel Legend Old Cataract, lobby','06:30','Sofitel Legend Old Cataract',2,2,'Viator',540.00,'Same family returning for the southern leg.',null,null,'EE-004'),
  ('EE-10021','Sunrise Pyramids Photoshoot — VIP','photoshoot','CL-0009','confirmed','high',21,'06:00','10:00','Giza Plateau','Four Seasons First Residence, private entrance','05:15','Four Seasons First Residence',2,0,'Referral',1280.00,'VIP. Female photographer required. Private access being negotiated.',null,null,'EE-004')
) as v(ref, title, type_key, client_code, status, priority, day_offset, start_time, end_time, location_name,
       pickup, pickup_time, dropoff, adults, children, source, sell, special_requests, notes_internal, emergency, creator_code)
  on true
join public.os_trip_types tt on tt.org_id = o.id and tt.key = v.type_key
join public.os_clients c on c.org_id = o.id and c.code = v.client_code
left join public.os_locations l on l.org_id = o.id and l.name = v.location_name
left join public.os_employees e on e.org_id = o.id and e.code = v.creator_code
where o.key = 'egypt-eye'
  and not exists (select 1 from public.os_trips t where t.org_id = o.id and t.ref = v.ref);

-- Keep the reference sequence ahead of the seeded refs so the next trip
-- created in the UI does not collide with one of these.
select setval('public.os_trip_ref_seq', greatest(10021, (select last_value from public.os_trip_ref_seq)), true);

-- Travel parties.
insert into public.os_trip_travelers (trip_id, traveler_id, is_lead)
select t.id, tr.id, tr.full_name = v.lead_name
from public.os_orgs o
join public.os_trips t on t.org_id = o.id
join public.os_clients c on c.id = t.client_id
join public.os_travelers tr on tr.client_id = c.id
join (values
  ('EE-10001','Emma Larsen'), ('EE-10002','Yuki Tanaka'), ('EE-10003','Sophia Rossi'),
  ('EE-10005','Olivia Bennett'), ('EE-10006','Hannah Meyer'), ('EE-10007','Chloé Dubois'),
  ('EE-10008','Priya Sharma'), ('EE-10011','Fatima Al-Rashid'), ('EE-10012','James Whitfield'),
  ('EE-10014','Min-Jun Park'), ('EE-10017','James Whitfield'), ('EE-10018','Olivia Bennett'),
  ('EE-10019','Min-Jun Park'), ('EE-10020','Yuki Tanaka'), ('EE-10021','Fatima Al-Rashid')
) as v(ref, lead_name) on v.ref = t.ref
where o.key = 'egypt-eye'
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- CREW AND RESOURCE ASSIGNMENTS
-- ---------------------------------------------------------------------------
-- Note the deliberate gaps, because a demo where nothing is wrong proves
-- nothing:
--   EE-10012 has no driver           -> critical readiness blocker tomorrow
--   EE-10011 has no vehicle          -> the 4x4 is in the workshop
--   EE-10014 and EE-10012 share a photographer on overlapping windows,
--     both at 'assigned' -> a soft conflict the engine reports loudly and
--     the database permits (it would be impossible at 'confirmed')
insert into public.os_trip_assignments (org_id, trip_id, role_key, employee_id, status, rate_amount, rate_currency, assigned_by)
select o.id, t.id, v.role_key, e.id, v.status, e.day_rate_amount, e.day_rate_currency, ab.id
from public.os_orgs o
join public.os_trips t on t.org_id = o.id
join (values
  ('EE-10001','photographer','EE-010','confirmed','EE-003'),
  ('EE-10001','driver','EE-017','confirmed','EE-003'),
  ('EE-10002','guide','EE-014','confirmed','EE-003'),
  ('EE-10002','driver','EE-017','confirmed','EE-003'),
  ('EE-10003','photographer','EE-012','confirmed','EE-002'),
  ('EE-10003','driver','EE-018','confirmed','EE-002'),
  ('EE-10003','coordinator','EE-008','confirmed','EE-002'),
  ('EE-10004','driver','EE-017','confirmed','EE-003'),
  ('EE-10005','photographer','EE-011','confirmed','EE-003'),
  ('EE-10005','driver','EE-017','confirmed','EE-003'),
  ('EE-10006','guide','EE-015','confirmed','EE-003'),
  ('EE-10006','driver','EE-018','confirmed','EE-003'),
  ('EE-10007','photographer','EE-010','confirmed','EE-002'),
  ('EE-10007','driver','EE-017','confirmed','EE-002'),
  ('EE-10007','coordinator','EE-008','confirmed','EE-002'),
  ('EE-10008','guide','EE-014','confirmed','EE-003'),
  ('EE-10008','driver','EE-018','confirmed','EE-003'),
  ('EE-10009','driver','EE-019','confirmed','EE-003'),
  ('EE-10009','representative','EE-022','confirmed','EE-003'),
  ('EE-10010','representative','EE-022','assigned','EE-003'),
  -- Tomorrow: the VIP flying dress. Female photographer as required.
  ('EE-10011','photographer','EE-012','assigned','EE-002'),
  ('EE-10011','driver','EE-018','assigned','EE-002'),
  ('EE-10011','coordinator','EE-008','assigned','EE-002'),
  -- Tomorrow: the luxury Giza shoot. NO DRIVER — deliberately. Omar is also
  -- on the Fayoum VIP shoot the same morning, which is a second, equally real
  -- clash: he cannot be at Wadi El Rayan and the Giza plateau at 06:30.
  ('EE-10012','photographer','EE-010','assigned','EE-003'),
  ('EE-10012','coordinator','EE-008','assigned','EE-003'),
  -- Tomorrow: Luxor, fully staffed.
  ('EE-10013','guide','EE-016','confirmed','EE-003'),
  ('EE-10013','driver','EE-019','confirmed','EE-003'),
  -- Tomorrow: Dahshur. Same photographer as EE-10012, overlapping window.
  ('EE-10014','photographer','EE-010','assigned','EE-003'),
  ('EE-10014','driver','EE-017','assigned','EE-003'),
  ('EE-10015','guide','EE-014','assigned','EE-003'),
  ('EE-10015','driver','EE-018','assigned','EE-003'),
  ('EE-10015','coordinator','EE-009','assigned','EE-003'),
  ('EE-10016','guide','EE-015','proposed','EE-003'),
  ('EE-10017','photographer','EE-010','proposed','EE-003'),
  ('EE-10018','photographer','EE-012','proposed','EE-003'),
  ('EE-10020','guide','EE-016','proposed','EE-003')
) as v(ref, role_key, emp_code, status, by_code) on v.ref = t.ref
join public.os_employees e on e.org_id = o.id and e.code = v.emp_code
left join public.os_employees ab on ab.org_id = o.id and ab.code = v.by_code
where o.key = 'egypt-eye'
  and not exists (
    select 1 from public.os_trip_assignments a
    where a.trip_id = t.id and a.role_key = v.role_key and a.employee_id = e.id
  );

insert into public.os_trip_assignments (org_id, trip_id, role_key, resource_id, status, rate_amount, rate_currency, assigned_by)
select o.id, t.id, v.role_key, r.id, v.status, r.cost_rate_amount, r.cost_rate_currency, ab.id
from public.os_orgs o
join public.os_trips t on t.org_id = o.id
join (values
  ('EE-10001','vehicle','VEH-01','confirmed','EE-003'),
  ('EE-10001','equipment','EQ-01','confirmed','EE-003'),
  ('EE-10002','vehicle','VEH-01','confirmed','EE-003'),
  ('EE-10003','vehicle','VEH-06','confirmed','EE-002'),
  ('EE-10003','dress','DR-01','confirmed','EE-002'),
  ('EE-10003','equipment','EQ-01','confirmed','EE-002'),
  ('EE-10004','vehicle','VEH-05','confirmed','EE-003'),
  ('EE-10005','vehicle','VEH-02','confirmed','EE-003'),
  ('EE-10005','equipment','EQ-02','confirmed','EE-003'),
  ('EE-10006','vehicle','VEH-02','confirmed','EE-003'),
  ('EE-10007','vehicle','VEH-01','confirmed','EE-002'),
  ('EE-10007','equipment','EQ-01','confirmed','EE-002'),
  ('EE-10007','equipment','EQ-04','confirmed','EE-002'),
  ('EE-10008','vehicle','VEH-02','confirmed','EE-003'),
  ('EE-10009','vehicle','VEH-05','confirmed','EE-003'),
  -- EE-10011 has NO vehicle: the only desert-capable one is in the workshop.
  ('EE-10011','dress','DR-01','assigned','EE-002'),
  ('EE-10011','equipment','EQ-01','assigned','EE-002'),
  ('EE-10012','vehicle','VEH-04','assigned','EE-003'),
  ('EE-10012','equipment','EQ-02','assigned','EE-003'),
  ('EE-10013','vehicle','VEH-03','confirmed','EE-003'),
  ('EE-10014','vehicle','VEH-01','assigned','EE-003'),
  ('EE-10015','vehicle','VEH-03','assigned','EE-003'),
  ('EE-10018','dress','DR-02','proposed','EE-003')
) as v(ref, role_key, res_code, status, by_code) on v.ref = t.ref
join public.os_resources r on r.org_id = o.id and r.code = v.res_code
left join public.os_employees ab on ab.org_id = o.id and ab.code = v.by_code
where o.key = 'egypt-eye'
  and not exists (
    select 1 from public.os_trip_assignments a
    where a.trip_id = t.id and a.role_key = v.role_key and a.resource_id = r.id
  );

-- Field status reported from phones on today's live trips.
update public.os_trip_assignments a
set field_status = 'started', field_status_at = now() - interval '90 minutes'
from public.os_trips t
where t.id = a.trip_id and t.ref in ('EE-10007','EE-10008') and a.employee_id is not null
  and a.field_status is null;

-- ---------------------------------------------------------------------------
-- ITINERARIES
-- ---------------------------------------------------------------------------
insert into public.os_itinerary_items (trip_id, seq, start_time, end_time, title, description, kind, location_id)
select t.id, v.seq, v.start_time::time, v.end_time::time, v.title, v.description, v.kind, l.id
from public.os_orgs o
join public.os_trips t on t.org_id = o.id
join (values
  ('EE-10007',1,'06:00','06:25','Hotel pickup','Marriott Mena House main entrance. Photographer travels with the client.','pickup','Giza Plateau'),
  ('EE-10007',2,'06:30','07:15','Panoramic point','Wide frames with all three pyramids while the plateau is empty.','shoot','Giza Plateau'),
  ('EE-10007',3,'07:20','08:15','Great Pyramid base','Close work at the base. THIS is where the proposal happens — photographer briefed.','shoot','Giza Plateau'),
  ('EE-10007',4,'08:20','09:15','Sphinx and causeway','Classic compression shots with the 70-200.','shoot','Giza Plateau'),
  ('EE-10007',5,'09:15','09:30','Return to hotel','','dropoff','Giza Plateau'),

  ('EE-10011',1,'05:00','05:30','Pickup, Four Seasons First Residence','Private entrance. Coordinator meets them at the door.','pickup','Wadi El Rayan'),
  ('EE-10011',2,'05:30','07:30','Drive to Fayoum','Two hours. Rest stop at the halfway point.','drive','Wadi El Rayan'),
  ('EE-10011',3,'07:30','08:00','Arrive at the desert camp','Changing tent, dress fitting and steaming.','activity','Wadi El Rayan'),
  ('EE-10011',4,'08:00','10:30','Dune shoot','Red Flame dress. Assistant runs the train.','shoot','Wadi El Rayan'),
  ('EE-10011',5,'10:30','11:30','Lake shoot and lunch','','shoot','Wadi El Rayan'),
  ('EE-10011',6,'11:30','13:00','Return to Cairo','','drive','Wadi El Rayan'),

  ('EE-10013',1,'05:45','06:00','Hotel pickup','Sofitel Winter Palace lobby.','pickup','Luxor West Bank'),
  ('EE-10013',2,'06:00','08:30','Valley of the Kings','Three tombs on the general ticket. Start at opening.','activity','Luxor West Bank'),
  ('EE-10013',3,'08:45','10:00','Hatshepsut Temple','','activity','Luxor West Bank'),
  ('EE-10013',4,'10:15','11:00','Colossi of Memnon','','activity','Luxor West Bank'),
  ('EE-10013',5,'11:15','12:30','Lunch, West Bank','Marsam Catering set lunch.','meal','Luxor West Bank'),
  ('EE-10013',6,'12:30','14:00','Return to hotel','','dropoff','Luxor West Bank'),

  ('EE-10008',1,'07:30','08:00','Hotel pickup','Ramses Hilton lobby.','pickup','Giza Plateau'),
  ('EE-10008',2,'08:00','11:30','Giza Plateau and the Sphinx','Panoramic point, Great Pyramid exterior, Sphinx.','activity','Giza Plateau'),
  ('EE-10008',3,'12:00','13:00','Lunch','Strict vegetarian, no onion or garlic. Confirmed with the restaurant.','meal','Giza Plateau'),
  ('EE-10008',4,'13:30','16:30','Grand Egyptian Museum','Timed entry. Allow 15 minutes from the car park.','activity','Grand Egyptian Museum'),
  ('EE-10008',5,'16:30','17:30','Return to hotel','','dropoff','Grand Egyptian Museum')
) as v(ref, seq, start_time, end_time, title, description, kind, location_name) on v.ref = t.ref
left join public.os_locations l on l.org_id = o.id and l.name = v.location_name
where o.key = 'egypt-eye'
  and not exists (select 1 from public.os_itinerary_items i where i.trip_id = t.id and i.seq = v.seq);

-- ---------------------------------------------------------------------------
-- TRIP ECONOMICS — estimated cost lines, and actuals where the trip has run
-- ---------------------------------------------------------------------------
-- Every line snapshots the rate id it resolved from, so re-opening a trip
-- from three months ago shows what it actually cost then, not what the same
-- shopping list would cost today.
insert into public.os_trip_cost_lines
  (org_id, trip_id, kind, category, label, price_item_id, rate_id, qty, unit_amount, amount, currency, fx_rate, base_amount, incurred_on, payment_status)
select o.id, t.id, v.kind, p.category, p.name, p.id, r.id, v.qty, r.cost_amount,
       round(r.cost_amount * v.qty, 2), 'USD', 1, round(r.cost_amount * v.qty * v.factor, 2),
       case when v.kind = 'actual' then t.trip_date end,
       case when v.kind = 'actual' then 'paid' else 'unpaid' end
from public.os_orgs o
join public.os_trips t on t.org_id = o.id
join (values
  ('EE-10001','estimated','photographer_4h',1,1.0), ('EE-10001','estimated','driver_cairo',1,1.0),
  ('EE-10001','estimated','vehicle_van7',1,1.0), ('EE-10001','estimated','photo_permit_giza',1,1.0),
  ('EE-10001','estimated','giza_entry',2,1.0), ('EE-10001','estimated','editing_standard',1,1.0),
  ('EE-10001','actual','photographer_4h',1,1.0), ('EE-10001','actual','driver_cairo',1,1.0),
  ('EE-10001','actual','vehicle_van7',1,1.0), ('EE-10001','actual','photo_permit_giza',1,1.0),
  ('EE-10001','actual','giza_entry',2,1.0), ('EE-10001','actual','editing_standard',1,1.0),

  ('EE-10002','estimated','guide_day',1,1.0), ('EE-10002','estimated','driver_cairo',1,1.0),
  ('EE-10002','estimated','vehicle_van7',1,1.0), ('EE-10002','estimated','giza_entry',4,1.0),
  ('EE-10002','estimated','gem_entry',4,1.0), ('EE-10002','estimated','lunch_standard',4,1.0),
  ('EE-10002','actual','guide_day',1,1.0), ('EE-10002','actual','driver_cairo',1,1.0),
  ('EE-10002','actual','vehicle_van7',1,1.0), ('EE-10002','actual','giza_entry',4,1.0),
  ('EE-10002','actual','gem_entry',4,1.0), ('EE-10002','actual','lunch_standard',4,0.75),

  ('EE-10003','estimated','photographer_full',1,1.0), ('EE-10003','estimated','driver_long',1,1.0),
  ('EE-10003','estimated','dress_rental',1,1.0), ('EE-10003','estimated','fayoum_protectorate',1,1.0),
  ('EE-10003','estimated','camp_day_use',2,1.0), ('EE-10003','estimated','coordinator_day',1,1.0),
  ('EE-10003','estimated','editing_standard',1,1.0),
  ('EE-10003','actual','photographer_full',1,1.0), ('EE-10003','actual','driver_long',1,1.0),
  ('EE-10003','actual','dress_rental',1,1.15), ('EE-10003','actual','fayoum_protectorate',1,1.0),
  ('EE-10003','actual','camp_day_use',2,1.0), ('EE-10003','actual','coordinator_day',1,1.0),

  ('EE-10004','estimated','transfer_airport',1,1.0), ('EE-10004','actual','transfer_airport',1,1.0),
  ('EE-10005','estimated','photographer_4h',1,1.0), ('EE-10005','estimated','driver_cairo',1,1.0),
  ('EE-10005','estimated','vehicle_van7',1,1.0), ('EE-10005','estimated','gem_entry',1,1.0),
  ('EE-10005','estimated','editing_standard',1,1.0),
  ('EE-10005','actual','photographer_4h',1,1.0), ('EE-10005','actual','driver_cairo',1,1.0),
  ('EE-10005','actual','vehicle_van7',1,1.0), ('EE-10005','actual','gem_entry',1,1.0),

  ('EE-10006','estimated','guide_half',1,1.0), ('EE-10006','estimated','driver_cairo',1,1.0),
  ('EE-10006','estimated','vehicle_van7',1,1.0), ('EE-10006','estimated','saqqara_entry',3,1.0),
  ('EE-10006','actual','guide_half',1,1.0), ('EE-10006','actual','driver_cairo',1,1.0),
  ('EE-10006','actual','vehicle_van7',1,1.0), ('EE-10006','actual','saqqara_entry',3,1.0),

  ('EE-10007','estimated','photographer_4h',1,1.0), ('EE-10007','estimated','driver_cairo',1,1.0),
  ('EE-10007','estimated','vehicle_van7',1,1.0), ('EE-10007','estimated','photo_permit_giza',1,1.0),
  ('EE-10007','estimated','giza_entry',2,1.0), ('EE-10007','estimated','coordinator_day',1,1.0),
  ('EE-10007','estimated','editing_standard',1,1.0),

  ('EE-10008','estimated','guide_day',1,1.0), ('EE-10008','estimated','driver_cairo',1,1.0),
  ('EE-10008','estimated','vehicle_van7',1,1.0), ('EE-10008','estimated','giza_entry',1,1.0),
  ('EE-10008','estimated','gem_entry',1,1.0), ('EE-10008','estimated','lunch_standard',1,1.0),

  ('EE-10009','estimated','transfer_airport',1,1.0),
  ('EE-10010','estimated','cruise_dinner',2,1.0),

  ('EE-10011','estimated','photographer_full',1,1.0), ('EE-10011','estimated','driver_long',1,1.0),
  ('EE-10011','estimated','dress_rental',1,1.0), ('EE-10011','estimated','fayoum_protectorate',2,1.0),
  ('EE-10011','estimated','camp_day_use',2,1.0), ('EE-10011','estimated','coordinator_day',1,1.0),
  ('EE-10011','estimated','editing_express',1,1.0),

  ('EE-10012','estimated','photographer_4h',1,1.0), ('EE-10012','estimated','driver_cairo',1,1.0),
  ('EE-10012','estimated','vehicle_vip',1,1.0), ('EE-10012','estimated','photo_permit_giza',1,1.0),
  ('EE-10012','estimated','giza_entry',2,1.0), ('EE-10012','estimated','coordinator_day',1,1.0),
  ('EE-10012','estimated','editing_standard',1,1.0),

  ('EE-10013','estimated','guide_day',1,1.0), ('EE-10013','estimated','driver_long',1,1.0),
  ('EE-10013','estimated','vehicle_van7',1,1.0), ('EE-10013','estimated','vok_entry',4,1.0),
  ('EE-10013','estimated','lunch_standard',4,1.0),

  ('EE-10014','estimated','photographer_4h',1,1.0), ('EE-10014','estimated','driver_cairo',1,1.0),
  ('EE-10014','estimated','vehicle_van7',1,1.0), ('EE-10014','estimated','editing_standard',1,1.0),

  ('EE-10015','estimated','guide_day',1,1.0), ('EE-10015','estimated','driver_cairo',1,1.0),
  ('EE-10015','estimated','vehicle_van7',1,1.0), ('EE-10015','estimated','giza_entry',9,1.0),
  ('EE-10015','estimated','saqqara_entry',9,1.0), ('EE-10015','estimated','lunch_standard',9,1.0),
  ('EE-10015','estimated','coordinator_day',1,1.0),

  ('EE-10016','estimated','guide_day',1,1.0), ('EE-10016','estimated','driver_cairo',1,1.0),
  ('EE-10016','estimated','vehicle_van7',1,1.0), ('EE-10016','estimated','lunch_standard',6,1.0),

  ('EE-10017','estimated','photographer_4h',1,1.0), ('EE-10017','estimated','driver_cairo',1,1.0),
  ('EE-10017','estimated','vehicle_vip',1,1.0), ('EE-10017','estimated','gem_entry',2,1.0),
  ('EE-10017','estimated','editing_standard',1,1.0),

  ('EE-10018','estimated','photographer_full',1,1.0), ('EE-10018','estimated','driver_long',1,1.0),
  ('EE-10018','estimated','dress_rental',1,1.0), ('EE-10018','estimated','fayoum_protectorate',1,1.0),
  ('EE-10018','estimated','camp_day_use',1,1.0), ('EE-10018','estimated','editing_standard',1,1.0),

  ('EE-10019','estimated','photographer_full',1,1.0), ('EE-10019','estimated','driver_cairo',1,1.0),
  ('EE-10019','estimated','vehicle_van7',1,1.0), ('EE-10019','estimated','editing_standard',1,1.0),

  ('EE-10020','estimated','guide_day',1,1.0), ('EE-10020','estimated','driver_long',1,1.0),
  ('EE-10020','estimated','vehicle_van7',1,1.0), ('EE-10020','estimated','lunch_standard',4,1.0),

  ('EE-10021','estimated','photographer_4h',1,1.0), ('EE-10021','estimated','driver_cairo',1,1.0),
  ('EE-10021','estimated','vehicle_vip',1,1.0), ('EE-10021','estimated','photo_permit_giza',1,1.0),
  ('EE-10021','estimated','giza_entry',2,1.0), ('EE-10021','estimated','coordinator_day',1,1.0),
  ('EE-10021','estimated','editing_express',1,1.0)
) as v(ref, kind, item_key, qty, factor) on v.ref = t.ref
join public.os_price_items p on p.org_id = o.id and p.key = v.item_key
join lateral (
  -- The rate valid on the trip's own date. This is the whole point of
  -- effective dating: a March trip and a May trip pick different rows.
  select r2.* from public.os_rates r2
  where r2.price_item_id = p.id
    and r2.valid_from <= t.trip_date
    and (r2.valid_to is null or r2.valid_to >= t.trip_date)
    and r2.tier = 'any'
  order by r2.valid_from desc limit 1
) r on true
where o.key = 'egypt-eye'
  and not exists (
    select 1 from public.os_trip_cost_lines cl
    where cl.trip_id = t.id and cl.kind = v.kind and cl.price_item_id = p.id
  );

-- Client payments received.
insert into public.os_payments (org_id, trip_id, client_id, direction, method, amount, currency, fx_rate, base_amount, status, reference, paid_on, recorded_by)
select o.id, t.id, t.client_id, 'in', v.method, round(t.sell_amount * v.pct, 2), 'USD', 1,
       round(t.sell_amount * v.pct, 2), 'received', v.reference, t.trip_date - v.days_before, h.id
from public.os_orgs o
join public.os_trips t on t.org_id = o.id
join (values
  ('EE-10001',1.00,'card','STRIPE-8841',5),
  ('EE-10002',1.00,'card','STRIPE-8846',7),
  ('EE-10003',0.50,'bank_transfer','WISE-2201',14),
  ('EE-10003',0.50,'cash','CASH-0093',0),
  ('EE-10004',1.00,'cash','CASH-0088',0),
  ('EE-10005',1.00,'card','STRIPE-8855',3),
  ('EE-10006',1.00,'card','STRIPE-8861',4),
  ('EE-10007',0.30,'card','STRIPE-8870',10),
  ('EE-10011',0.50,'bank_transfer','WISE-2244',12),
  ('EE-10012',0.30,'card','STRIPE-8877',9),
  ('EE-10013',1.00,'bank_transfer','AGENCY-INV-0921',20)
) as v(ref, pct, method, reference, days_before) on v.ref = t.ref
left join public.os_employees h on h.org_id = o.id and h.code = 'EE-006'
where o.key = 'egypt-eye'
  and not exists (select 1 from public.os_payments p where p.trip_id = t.id and p.reference = v.reference);

-- ---------------------------------------------------------------------------
-- TASKS — generated from each trip type's checklist
-- ---------------------------------------------------------------------------
-- This mirrors exactly what src/lib/os/tasks.ts does when a trip is created:
-- one task per template item, due relative to the trip's start, owned by the
-- person actually assigned to that role on that trip where one exists, and
-- otherwise left to the role so it still shows up on the right desk.
insert into public.os_tasks
  (org_id, title, description, status, priority, owner_employee_id, owner_role_key,
   entity_type, entity_id, trip_id, unit_id, due_at, phase, blocking, template_item_id, created_by)
select o.id, i.title, i.description,
       -- Anything whose due time has passed on a trip that has already run is
       -- done; the rest are open. Two deliberate exceptions below.
       case
         when t.status in ('closed') then 'done'
         when t.trip_date < current_date and i.phase in ('pre','day') then 'done'
         when t.trip_date < current_date and i.phase = 'post'
              and (t.trip_date + i.offset_days) < current_date then 'done'
         else 'todo'
       end,
       i.priority,
       -- Prefer the person actually on the trip in that role.
       coalesce(a.employee_id, owner_by_role.id),
       i.owner_role_key,
       'trip', t.id, t.id, t.unit_id,
       (t.starts_at + make_interval(days => i.offset_days, hours => i.offset_hours)),
       i.phase, i.blocking, i.id,
       t.created_by
from public.os_orgs o
join public.os_trips t on t.org_id = o.id
join public.os_trip_types tt on tt.id = t.trip_type_id
join public.os_task_templates tpl on tpl.id = tt.default_task_template_id
join public.os_task_template_items i on i.template_id = tpl.id
left join lateral (
  select a2.employee_id from public.os_trip_assignments a2
  where a2.trip_id = t.id
    and a2.employee_id is not null
    and a2.status in ('proposed','assigned','confirmed')
    and a2.role_key = i.owner_role_key
  limit 1
) a on true
left join lateral (
  -- Fall back to whoever holds that role, preferring their own business unit.
  select e2.id from public.os_employees e2
  join public.os_employee_roles er on er.employee_id = e2.id
  join public.os_roles r2 on r2.id = er.role_id and r2.key = i.owner_role_key
  where e2.org_id = o.id and e2.archived_at is null
  order by (e2.primary_unit_id = t.unit_id) desc, e2.code
  limit 1
) owner_by_role on true
where o.key = 'egypt-eye'
  and not exists (
    select 1 from public.os_tasks x where x.trip_id = t.id and x.template_item_id = i.id
  );

update public.os_tasks set completed_at = due_at, completed_by = owner_employee_id
where status = 'done' and completed_at is null;

-- Two deliberate open blockers on tomorrow's trips, so the Tomorrow board and
-- the readiness engine have something real to report.
update public.os_tasks tk
set status = 'todo', completed_at = null, completed_by = null, priority = 'critical'
from public.os_trips t
where t.id = tk.trip_id and t.ref = 'EE-10012' and tk.title like 'Assign driver%';

update public.os_tasks tk
set status = 'blocked', completed_at = null, completed_by = null,
    description = coalesce(tk.description,'') || E'\n\nBLOCKED: the only desert-capable vehicle is in the workshop. Waiting on a supplier 4x4 quote from Fayoum Desert Camp.'
from public.os_trips t
where t.id = tk.trip_id and t.ref = 'EE-10011' and tk.title like 'Assign driver and desert-capable vehicle%';

-- ---------------------------------------------------------------------------
-- MEDIA LINKS AND THE CONTENT PIPELINE
-- ---------------------------------------------------------------------------
-- Note EE-10005 has NO media link at all — that is the "completed shoot with
-- no Drive folder" case the chase automation exists for.
insert into public.os_media_links (org_id, trip_id, client_id, kind, title, url, provider, visibility, item_count, added_by, verified_at)
select o.id, t.id, t.client_id, v.kind, v.title, v.url, 'google_drive', v.visibility, v.item_count, e.id,
       case when v.verified then now() - interval '2 days' end
from public.os_orgs o
join public.os_trips t on t.org_id = o.id
join (values
  ('EE-10001','raw_photos','EE-10001 — Raw','https://drive.google.com/drive/folders/DEMO-EE10001-RAW','internal',412,'EE-010',true),
  ('EE-10001','edited_photos','EE-10001 — Edited','https://drive.google.com/drive/folders/DEMO-EE10001-EDIT','internal',48,'EE-020',true),
  ('EE-10001','client_delivery','EE-10001 — Emma Larsen gallery','https://drive.google.com/drive/folders/DEMO-EE10001-DELIVERY','client',48,'EE-021',true),
  ('EE-10003','raw_photos','EE-10003 — Raw','https://drive.google.com/drive/folders/DEMO-EE10003-RAW','internal',680,'EE-012',true),
  ('EE-10003','behind_the_scenes','EE-10003 — Behind the scenes','https://drive.google.com/drive/folders/DEMO-EE10003-BTS','internal',35,'EE-012',false),
  ('EE-10006','raw_photos','EE-10006 — Guide phone photos','https://drive.google.com/drive/folders/DEMO-EE10006-RAW','internal',22,'EE-015',false)
) as v(ref, kind, title, url, visibility, item_count, added_by, verified) on v.ref = t.ref
left join public.os_employees e on e.org_id = o.id and e.code = v.added_by
where o.key = 'egypt-eye'
  and not exists (select 1 from public.os_media_links m where m.trip_id = t.id and m.kind = v.kind);

insert into public.os_content_jobs
  (org_id, trip_id, stage, editor_employee_id, photographer_employee_id, promised_at,
   uploaded_at, editing_started_at, ready_at, delivered_at, expected_photo_count, delivered_photo_count,
   marketing_permission, marketing_permission_note, notes)
select o.id, t.id, v.stage, ed.id, ph.id,
       t.starts_at + make_interval(days => 7),
       case when v.uploaded then t.starts_at + interval '10 hours' end,
       case when v.editing then t.starts_at + interval '2 days' end,
       case when v.ready then t.starts_at + interval '5 days' end,
       case when v.delivered then t.starts_at + interval '6 days' end,
       v.expected, v.delivered_count, v.permission, v.permission_note, v.notes
from public.os_orgs o
join public.os_trips t on t.org_id = o.id
join (values
  ('EE-10001','delivered','EE-020','EE-010',true,true,true,true,40,48,true,'Signed release on file. Approved for Instagram and the website.',null),
  ('EE-10003','editing','EE-020','EE-012',true,true,false,false,60,null,true,'Creator agreement covers Egypt Eye use with credit.','Sophia has asked for three specific frames first. Tamer is on it.'),
  ('EE-10005','upload_pending','EE-020','EE-011',false,false,false,false,40,null,false,null,'Raw files still not uploaded three days after the shoot. Chased once by the content team.')
) as v(ref, stage, editor_code, photog_code, uploaded, editing, ready, delivered, expected, delivered_count, permission, permission_note, notes)
  on v.ref = t.ref
left join public.os_employees ed on ed.org_id = o.id and ed.code = v.editor_code
left join public.os_employees ph on ph.org_id = o.id and ph.code = v.photog_code
where o.key = 'egypt-eye'
  and not exists (select 1 from public.os_content_jobs cj where cj.trip_id = t.id);

update public.os_content_jobs cj
set delivery_link_id = m.id
from public.os_media_links m
where m.trip_id = cj.trip_id and m.kind = 'client_delivery' and cj.delivery_link_id is null;

-- ---------------------------------------------------------------------------
-- DOCUMENTS
-- ---------------------------------------------------------------------------
insert into public.os_documents (org_id, title, kind, url, entity_type, entity_id, trip_id, client_id, visibility, uploaded_by)
select o.id, v.title, v.kind, v.url, 'trip', t.id, t.id, t.client_id, v.visibility, e.id
from public.os_orgs o
join public.os_trips t on t.org_id = o.id
join (values
  ('EE-10003','Fayoum Desert Camp confirmation','supplier_confirmation','https://drive.google.com/file/d/DEMO-CONF-10003','internal','EE-003'),
  ('EE-10003','Sophia Rossi — content release','contract','https://drive.google.com/file/d/DEMO-RELEASE-10003','management','EE-004'),
  ('EE-10011','Fayoum Desert Camp confirmation — VIP','supplier_confirmation','https://drive.google.com/file/d/DEMO-CONF-10011','internal','EE-002'),
  ('EE-10013','Wanderlust group manifest','client_document','https://drive.google.com/file/d/DEMO-MANIFEST-10013','internal','EE-005'),
  ('EE-10013','Valley of the Kings tickets','ticket','https://drive.google.com/file/d/DEMO-TICKETS-10013','assigned_crew','EE-003'),
  ('EE-10002','Invoice EE-10002','invoice','https://drive.google.com/file/d/DEMO-INV-10002','finance','EE-006')
) as v(ref, title, kind, url, visibility, uploaded_by) on v.ref = t.ref
left join public.os_employees e on e.org_id = o.id and e.code = v.uploaded_by
where o.key = 'egypt-eye'
  and not exists (select 1 from public.os_documents d where d.trip_id = t.id and d.title = v.title);

-- ---------------------------------------------------------------------------
-- INCIDENTS, QUALITY AND FEEDBACK
-- ---------------------------------------------------------------------------
with inc(ref, trip_ref, severity, category, title, description, day_offset, reporter, owner, subject_emp, subject_sup, subject_res, status, client_impact, actions, resolution, cost) as (values
  ('INC-0501','EE-10002','medium','late_arrival','Driver arrived 25 minutes late to the hotel',
   'Traffic on the Ring Road. The driver did not call ahead, which is the part that mattered — the family was standing in the lobby with two young children not knowing what was happening.',
   -9,'EE-005','EE-002','EE-017',null,null,'closed','minor',
   'Called the client from the office to explain. Guide started the commentary in the vehicle to recover the time.',
   'Recovered the schedule by cutting the Sphinx stop short. Reminded all drivers: if you are more than five minutes out, you call.',
   0.00),
  ('INC-0502','EE-10003','high','equipment','Dress hem torn on the dune shoot',
   'The Red Flame train caught on a rock during the second set. Roughly 15cm tear on the hem.',
   -6,'EE-012','EE-008','EE-012',null,'DR-01','resolved','none',
   'Shot the remaining sets from the opposite angle so the tear was never in frame. Client never knew.',
   'Repaired by the Maadi tailor for $28. Dress back in service. Added a briefing line: walk the ground before the first set.',
   28.00),
  ('INC-0503',null,'high','vehicle','Land Cruiser front suspension failure',
   'Failed on the Fayoum track. The vehicle was recovered, nobody was hurt, and no client was on board.',
   -2,'EE-018','EE-002',null,null,'VEH-06','investigating','none',
   'Vehicle towed to the Fayoum workshop. Marked unavailable in the OS so it cannot be scheduled.',
   null,
   0.00),
  ('INC-0504','EE-10005','medium','no_show','Raw files not uploaded after the shoot',
   'Three days after the session and the raw folder is still empty. The client has already asked when to expect her photos.',
   -1,'EE-021','EE-020','EE-011',null,null,'open','minor',
   'Content team messaged the photographer twice. No response yet.',
   null,
   0.00)
)
insert into public.os_incidents
  (org_id, ref, trip_id, severity, category, title, description, occurred_at, reported_by, owner_employee_id,
   subject_employee_id, subject_supplier_id, subject_resource_id, status, client_impact, actions_taken, resolution,
   cost_amount, cost_currency, resolved_at)
select o.id, v.ref, t.id, v.severity, v.category, v.title, v.description,
       (current_date + v.day_offset)::timestamptz + interval '9 hours',
       rep.id, own.id, subj.id, sup.id, res.id, v.status, v.client_impact, v.actions, v.resolution,
       v.cost, 'USD',
       case when v.status in ('resolved','closed') then (current_date + v.day_offset)::timestamptz + interval '2 days' end
from inc v
join public.os_orgs o on o.key = 'egypt-eye'
left join public.os_trips t on t.org_id = o.id and t.ref = v.trip_ref
left join public.os_employees rep on rep.org_id = o.id and rep.code = v.reporter
left join public.os_employees own on own.org_id = o.id and own.code = v.owner
left join public.os_employees subj on subj.org_id = o.id and subj.code = v.subject_emp
left join public.os_suppliers sup on sup.org_id = o.id and sup.code = v.subject_sup
left join public.os_resources res on res.org_id = o.id and res.code = v.subject_res
where not exists (select 1 from public.os_incidents i where i.org_id = o.id and i.ref = v.ref);

select setval('public.os_incident_ref_seq', 505, true);

insert into public.os_performance_reviews (org_id, trip_id, subject_type, employee_id, supplier_id, rating, punctuality, quality, professionalism, note, reviewer_employee_id)
select o.id, t.id, v.subject_type, e.id, s.id, v.rating, v.punctuality, v.quality, v.professionalism, v.note, r.id
from public.os_orgs o
join public.os_trips t on t.org_id = o.id
join (values
  ('EE-10001','employee','EE-010',null,5,5,5,5,'Delivered exactly what the client asked for and finished early.','EE-002'),
  ('EE-10001','employee','EE-017',null,5,5,5,5,'On time as always.','EE-002'),
  ('EE-10002','employee','EE-017',null,3,2,4,4,'Late, and did not call. Otherwise fine.','EE-002'),
  ('EE-10002','employee','EE-014',null,5,5,5,5,'Recovered the schedule and kept the children engaged.','EE-002'),
  ('EE-10003','employee','EE-012',null,5,5,5,5,'Handled the torn dress without the client ever noticing. Exactly right.','EE-008'),
  ('EE-10003','supplier',null,'SUP-02',4,4,4,4,'Camp was ready on time. Lunch was late by twenty minutes.','EE-008'),
  ('EE-10006','employee','EE-015',null,4,5,4,5,'Good German commentary. Client said the pace was slightly fast for the child.','EE-002')
) as v(ref, subject_type, emp_code, sup_code, rating, punctuality, quality, professionalism, note, reviewer)
  on v.ref = t.ref
left join public.os_employees e on e.org_id = o.id and e.code = v.emp_code
left join public.os_suppliers s on s.org_id = o.id and s.code = v.sup_code
left join public.os_employees r on r.org_id = o.id and r.code = v.reviewer
where o.key = 'egypt-eye'
  and not exists (
    select 1 from public.os_performance_reviews pr
    where pr.trip_id = t.id
      and pr.employee_id is not distinct from e.id
      and pr.supplier_id is not distinct from s.id
  );

insert into public.os_client_feedback (org_id, trip_id, client_id, rating, nps, comments, highlight, complaint, would_recommend, collected_by, public_review_requested_at, public_review_url)
select o.id, t.id, t.client_id, v.rating, v.nps, v.comments, v.highlight, v.complaint, v.recommend, e.id,
       case when v.review_requested then now() - interval '5 days' end, v.review_url
from public.os_orgs o
join public.os_trips t on t.org_id = o.id
join (values
  ('EE-10001',5,10,'Genuinely the best morning of our whole trip. Ahmed knew exactly where to stand and when.','Having the plateau almost to ourselves at 06:30.',null,true,'EE-004',true,'https://www.tripadvisor.com/example-review-1'),
  ('EE-10002',4,8,'Wonderful day. The late pickup at the start was stressful with two tired children.','The guide was outstanding with the kids.','Driver was 25 minutes late and nobody told us.',true,'EE-005',true,null),
  ('EE-10004',5,9,'Smooth and easy. Driver was waiting exactly where he said he would be.',null,null,true,'EE-005',false,null),
  ('EE-10006',5,10,'Saqqara was the highlight of Egypt for us. Rania is exceptional.','Rania.',null,true,'EE-004',true,null)
) as v(ref, rating, nps, comments, highlight, complaint, recommend, collector, review_requested, review_url)
  on v.ref = t.ref
left join public.os_employees e on e.org_id = o.id and e.code = v.collector
where o.key = 'egypt-eye'
  and not exists (select 1 from public.os_client_feedback f where f.trip_id = t.id);

-- ---------------------------------------------------------------------------
-- APPROVALS
-- ---------------------------------------------------------------------------
with ap(ref, kind, title, detail, trip_ref, amount, status, requester, hours_ago, approver_role, decider, decision_note, rule_key) as (values
  ('AP-1001','extra_cost','Supplier 4x4 transfer for the VIP Fayoum shoot',
   'Our Land Cruiser is in the workshop and tomorrow''s VIP shoot cannot reach the dunes without a desert-capable vehicle. Fayoum Desert Camp will provide their 4x4 with a driver for the sand section. This is above the $150 unplanned-cost threshold, so it needs a decision tonight.',
   'EE-10011',185.00,'pending','EE-002',6,'management',null,null,'extra_cost_over_150'),
  ('AP-1002','assignment_override','Ahmed Tarek is on two overlapping shoots tomorrow',
   'EE-10012 runs 06:30-09:30 at Giza and EE-10014 runs 08:00-11:00 at Dahshur. Both currently have Ahmed as photographer. One of them has to move to Mina, or one of the trips has to shift. Raising it rather than silently forcing it.',
   'EE-10014',null,'pending','EE-003',3,'operations_manager',null,null,'assignment_override'),
  ('AP-1003','discount','20% discount for the Wanderlust September series',
   'Wanderlust have committed to four group departures this month. They have asked for 20% across the series, which is above the 15% threshold.',
   'EE-10013',null,'approved','EE-004',72,'management','EE-001','Approved at 18%, not 20. Volume justifies it but the margin at 20 is too thin on the Luxor legs.','discount_over_15'),
  ('AP-1004','free_service','Complimentary express editing for Emma Larsen',
   'Emma referred three clients who all booked. Proposing we cover express editing on her next session as a thank you.',
   null,70.00,'approved','EE-004',96,'management','EE-001','Yes. Referrals like this are worth far more than $70.','free_service'),
  ('AP-1005','extra_cost','Dress repair after the Fayoum shoot',
   'Red Flame hem torn on rock. Maadi tailor quoted $28.',
   'EE-10003',28.00,'approved','EE-008',120,'operations_manager','EE-002','Approved. Under threshold but logged for the record.','extra_cost_over_150')
)
insert into public.os_approvals
  (org_id, ref, kind, title, detail, trip_id, amount, currency, status, requested_by, requested_at,
   approver_role_key, decided_by, decided_at, decision_note, due_at, rule_id)
select o.id, v.ref, v.kind, v.title, v.detail, t.id, v.amount, 'USD', v.status, req.id,
       now() - make_interval(hours => v.hours_ago), v.approver_role, dec.id,
       case when v.status <> 'pending' then now() - make_interval(hours => v.hours_ago - 2) end,
       v.decision_note,
       now() - make_interval(hours => v.hours_ago) + make_interval(hours => coalesce(ar.escalate_after_hours, 24)),
       ar.id
from ap v
join public.os_orgs o on o.key = 'egypt-eye'
left join public.os_trips t on t.org_id = o.id and t.ref = v.trip_ref
left join public.os_employees req on req.org_id = o.id and req.code = v.requester
left join public.os_employees dec on dec.org_id = o.id and dec.code = v.decider
left join public.os_approval_rules ar on ar.org_id = o.id and ar.key = v.rule_key
where not exists (select 1 from public.os_approvals a where a.org_id = o.id and a.ref = v.ref);

select setval('public.os_approval_ref_seq', 1006, true);

insert into public.os_approval_events (approval_id, employee_id, action, note, at)
select a.id, a.requested_by, 'requested', null, a.requested_at
from public.os_approvals a
where not exists (select 1 from public.os_approval_events e where e.approval_id = a.id and e.action = 'requested');

insert into public.os_approval_events (approval_id, employee_id, action, note, at)
select a.id, a.decided_by,
       case a.status when 'approved' then 'approved' when 'rejected' then 'rejected' else 'commented' end,
       a.decision_note, a.decided_at
from public.os_approvals a
where a.decided_at is not null
  and not exists (select 1 from public.os_approval_events e where e.approval_id = a.id and e.action in ('approved','rejected'));

-- ---------------------------------------------------------------------------
-- KNOWLEDGE BASE
-- ---------------------------------------------------------------------------
-- The point of these articles is that they contain what people actually need
-- and normally have to ask a colleague for. If an article could be replaced
-- by a web search, it does not belong here.
insert into public.os_knowledge_articles (org_id, slug, title, category, summary, body, tags, location_id, author_employee_id)
select o.id, v.slug, v.title, v.category, v.summary, v.body, v.tags::text[], l.id, e.id
from public.os_orgs o
cross join lateral (values
  ('giza-plateau-operations','Giza Plateau — how we actually work there','Destinations',
   'Gates, timings, permits, parking and the mistakes that cost us mornings.',
   E'## Getting in\n\nVehicles enter by the main gate on Al Haram. The Sphinx gate is walk-in only and adds about twenty minutes on foot with equipment — never route a shoot through it.\n\nDrivers wait in the upper lot. There is no shade there after 10:00, so on summer days tell the driver to keep the engine running for the air conditioning and build the fuel into the cost.\n\n## Timing\n\n- Sunrise to 09:00 is the only window that gives clean frames. Past 09:30 the plateau fills with coaches.\n- Between May and September, nothing outdoors between 11:00 and 14:00. It is not a preference, it is a safety call.\n- Interior tickets for the Great Pyramid sell out by about 09:30 in high season. If the client wants the interior, buy the day before.\n\n## Permits\n\nA tripod or any lighting makes it a professional shoot in the eyes of the plateau inspectors, and that needs a paid photography permit. Horizon Permits (SUP-01) needs 24 hours. Same-day is sometimes possible and always costs more.\n\nA handheld camera, even a professional body, needs nothing. This is the single most common thing new coordinators get wrong in both directions — either paying for a permit we did not need, or arriving with a light stand and no paperwork.\n\n## What goes wrong\n\n- **Arriving without the permit.** The inspector will stop the shoot. There is no talking your way past it.\n- **Assuming the client knows which gate.** They do not. Always name the hotel door and the gate.\n- **Under-estimating the walk.** From the upper lot to the panoramic point is fifteen minutes carrying gear.',
   '{giza,permits,photography,operations}','Giza Plateau','EE-008'),

  ('fayoum-flying-dress','Fayoum flying dress — the full operating procedure','Destinations',
   'Two hours each way, one usable light window, and a dress that behaves entirely according to the wind.',
   E'## The shape of the day\n\n05:00 pickup in Cairo. 07:30 at the camp. Shoot 08:00-11:00. Back in Cairo by 13:00. There is no version of this that starts later and still works.\n\n## The vehicle question\n\nThe last stretch to the dunes is soft sand. Only the Land Cruiser (VEH-06) goes on it, or a 4x4 hired from Fayoum Desert Camp (SUP-02). A standard van will bog down, and recovering it costs the whole morning.\n\nIf our 4x4 is unavailable, book the supplier transfer at the planning stage, not on the morning.\n\n## Wind\n\nAbove roughly 25 km/h the dress is unusable — it wraps rather than flies, and it is genuinely unsafe on a dune edge. Check the forecast the day before and move the shoot rather than attempt it. A moved shoot is a mild disappointment; a failed one is a refund.\n\n## The assistant is not optional\n\nSomeone has to run the train and reset it between frames. A flying dress shoot staffed with one photographer and nobody else does not produce the images the client paid for. Build the coordinator or an assistant into every quote.\n\n## After the shoot\n\nInspect the dress on site, before it goes in the bag. Sand and small tears are both much easier to deal with the same day. Log any damage in the OS immediately and send the dress to the cleaner that evening.',
   '{fayoum,flying_dress,photoshoot,operations}','Wadi El Rayan','EE-008'),

  ('luxor-west-bank','Luxor West Bank — early starts and ticket structure','Destinations',
   'Why 06:00 is not negotiable, and which tombs cost extra.',
   E'## Start at 06:00\n\nBy 10:00 the Valley of the Kings is both crowded and, from May to September, dangerous. There is no shade and no breeze in the valley floor.\n\n## Tickets\n\nThe general ticket covers **three tombs of your choice** from the open rotation. These are each a separate, more expensive ticket:\n\n- Tutankhamun\n- Seti I\n- Nefertari (Valley of the Queens, and limited numbers per day)\n\nA camera ticket is required for any photography inside the tombs. Phones included. Guides cannot enter the tombs to give commentary — brief the client on that before they go in, or they will feel abandoned.\n\n## Getting there\n\nThe bridge adds about 30 minutes over the ferry but is the only option for a vehicle. Plan the vehicle route, not the ferry route.',
   '{luxor,tours,tickets}','Luxor West Bank','EE-016'),

  ('pickup-rules','Pickup rules — the thing we get wrong most often','Operations',
   'Every late start we have ever had traces back to one of these five things.',
   E'## The five rules\n\n1. **Name the door, not the hotel.** "Marriott Mena House" is not a pickup point. "Marriott Mena House, main entrance, by the fountain" is.\n2. **Confirm by voice the night before** for anything starting before 07:00. A message that has not been read is not a confirmation.\n3. **The driver calls if he is more than five minutes out.** Not when he arrives — when he knows he will be late.\n4. **Get the flight number from the airline, not from the client.** Clients routinely give the wrong terminal, and terminal 2 and terminal 3 are twenty minutes apart.\n5. **Build in the hotel exit time.** From a Garden City hotel room to being in the vehicle is fifteen minutes, not two.\n\n## If the client is not there\n\nWait ten minutes, then call. Then call the hotel front desk and ask them to knock. Then call Operations. Do not leave, and do not start the clock on their session, until Operations says so.',
   '{operations,pickup,sop}',null,'EE-002'),

  ('emergency-procedure','Emergency procedure','Safety',
   'What to do, in order, when something goes seriously wrong on a trip.',
   E'## In order\n\n1. **Make people safe.** Everything else can wait. Move away from traffic, out of the sun, into shade or a vehicle.\n2. **Call the emergency services if anyone is injured.** Ambulance 123. Tourist Police 126.\n3. **Call Operations.** Mariam Fahmy, +20 100 000 0002. If she does not answer within two rings, call Bish.\n4. **Log an incident in the OS** as soon as the situation is stable, with the severity set honestly. Do not wait until the end of the day.\n5. **Do not discuss fault or compensation with the client.** Say that Egypt Eye is dealing with it and that someone will call them. Then make sure someone does.\n\n## Vehicle breakdown\n\nGet everyone out and away from the road. Call Operations before calling a mechanic — we will usually send a second vehicle faster than a repair.\n\n## Heat\n\nConfusion, stopping sweating, or a stumbling walk are heat-stroke signs and are an emergency, not a rest stop. Shade, water, wet cloth on the neck, and call 123.',
   '{safety,emergency,sop}',null,'EE-002'),

  ('working-with-suppliers','Working with suppliers','Operations',
   'Who we use, what they need from us, and the confirmation rule.',
   E'## The confirmation rule\n\nA supplier booking that exists only as a phone call does not exist. Get it in writing — a WhatsApp message from their account is enough — and attach it to the trip as a supplier confirmation document. Trips without one are not Ready.\n\n## Lead times that actually bite\n\n- Giza photography permit: **24 hours**\n- Desert camp day use: **48 hours**\n- Nile dinner cruise: **72 hours**\n- Balloon flight: **48 hours**, and always hold a backup morning in winter\n\n## Payment\n\nNever pay a supplier in cash on the day without recording the actual cost line against the trip the same day. A cost that is not in the OS on the day it happened is a cost that will be argued about at month end.',
   '{suppliers,operations,sop}',null,'EE-002'),

  ('pricing-principles','How Egypt Eye prices','Commercial',
   'Where the numbers come from and what the tiers actually mean.',
   E'## Nothing is priced from memory\n\nEvery cost in a quote comes from the price book, and every price book entry is dated. If a rate looks wrong, fix the rate — do not override the number in the quote, because that breaks the link between what we quoted and what we will be charged.\n\n## The tiers\n\n- **Standard** — the everyday product. 45% markup, and we do not go below 22% margin.\n- **Premium** — private vehicle, senior crew, better time slots. 65% markup, 30% floor.\n- **Luxury** — best crew and vehicles, extended session, full styling. 90% markup, 38% floor.\n- **VIP** — bespoke, dedicated coordinator on site. 120% markup, 45% floor.\n\n## Below the floor\n\nA quote below its tier''s margin floor is not forbidden, but it needs a reason and, past 15% off list, an approval. Volume commitments from agencies are the usual good reason. "The client asked" is not one.',
   '{pricing,commercial,sop}',null,'EE-001'),

  ('content-delivery-standard','Content delivery standard','Creative',
   'What the client gets, when, and what has to be true before we send it.',
   E'## The promise\n\nSeven working days from shoot to delivery, unless the package says express (48 hours).\n\n## What is delivered\n\nUp to 40 retouched images on a standard package. Raw files are never delivered — they are ours, and clients who receive raws inevitably post the worst frame of the set.\n\n## Before anything is sent\n\n- Every image colour-graded consistently across the set.\n- No frame with the client mid-blink, mid-word, or with equipment in shot.\n- The delivery link opened and checked **from outside our Google account**. A link that works for us and not for the client is the most common delivery failure there is.\n- Marketing permission checked. If the client has not agreed in writing, nothing from that shoot goes anywhere near our social accounts.',
   '{content,editing,delivery,sop}',null,'EE-020')
) as v(slug, title, category, summary, body, tags, location_name, author)
left join public.os_locations l on l.org_id = o.id and l.name = v.location_name
left join public.os_employees e on e.org_id = o.id and e.code = v.author
where o.key = 'egypt-eye'
  and not exists (select 1 from public.os_knowledge_articles a where a.org_id = o.id and a.slug = v.slug);

-- ---------------------------------------------------------------------------
-- SOPs — procedures that can be applied to a trip as a real checklist
-- ---------------------------------------------------------------------------
insert into public.os_sops (org_id, slug, title, category, summary, trip_type_id, location_id, owner_employee_id, task_template_id)
select o.id, v.slug, v.title, v.category, v.summary, tt.id, l.id, e.id, tpl.id
from public.os_orgs o
cross join lateral (values
  ('fayoum-flying-dress-sop','Fayoum Flying Dress','Operations',
   'The full procedure for a Wadi El Rayan flying dress shoot, from confirmation to closing the trip.',
   'flying_dress','Wadi El Rayan','EE-008','flying_dress_standard'),
  ('giza-sunrise-photoshoot-sop','Giza Sunrise Photoshoot','Operations',
   'The standard sunrise session on the plateau, including the permit decision.',
   'photoshoot','Giza Plateau','EE-008','photoshoot_standard'),
  ('airport-transfer-sop','Airport Transfer','Operations',
   'Meeting a client at Cairo International without losing them.',
   'transfer','Cairo International Airport','EE-003','transfer_standard')
) as v(slug, title, category, summary, type_key, location_name, owner, template_key)
left join public.os_trip_types tt on tt.org_id = o.id and tt.key = v.type_key
left join public.os_locations l on l.org_id = o.id and l.name = v.location_name
left join public.os_employees e on e.org_id = o.id and e.code = v.owner
left join public.os_task_templates tpl on tpl.org_id = o.id and tpl.key = v.template_key
where o.key = 'egypt-eye'
  and not exists (select 1 from public.os_sops s where s.org_id = o.id and s.slug = v.slug);

insert into public.os_sop_steps (sop_id, seq, title, detail, owner_role_key, expected_minutes, evidence_required, critical)
select s.id, v.seq, v.title, v.detail, v.owner, v.minutes, v.evidence, v.critical
from public.os_sops s
join public.os_orgs o on o.id = s.org_id and o.key = 'egypt-eye'
join (values
  ('fayoum-flying-dress-sop',1,'Confirm the client and their height','Height decides the train length, which decides the dress. Size alone is not enough.','reservation',10,false,true),
  ('fayoum-flying-dress-sop',2,'Reserve the dress','Check it is not at the cleaner and not booked in an overlapping window.','operations',5,false,true),
  ('fayoum-flying-dress-sop',3,'Assign the photographer and the assistant','Two people minimum. One of them runs the train.','operations',10,false,true),
  ('fayoum-flying-dress-sop',4,'Secure a desert-capable vehicle','Our Land Cruiser, or a supplier 4x4 booked at least 24 hours ahead.','operations',15,true,true),
  ('fayoum-flying-dress-sop',5,'Confirm the camp booking in writing','Shade, changing tent and lunch. Attach the confirmation to the trip.','operations',10,true,true),
  ('fayoum-flying-dress-sop',6,'Check the wind forecast the day before','Above 25 km/h, move the shoot. Do not attempt it.','coordinator',5,false,true),
  ('fayoum-flying-dress-sop',7,'Confirm the 05:00 pickup by voice','Not by message. By voice, the night before.','coordinator',10,false,true),
  ('fayoum-flying-dress-sop',8,'Run the shoot','Dunes first while the light is low, lake after.','photographer',180,false,false),
  ('fayoum-flying-dress-sop',9,'Inspect the dress before it goes in the bag','Log any damage in the OS the same day.','coordinator',10,true,true),
  ('fayoum-flying-dress-sop',10,'Upload the raw files the same evening','Correct trip reference in the folder name.','photographer',30,true,true),
  ('fayoum-flying-dress-sop',11,'Edit, quality check and deliver','Check the delivery link from outside our Google account.','editor',240,true,true),
  ('fayoum-flying-dress-sop',12,'Close the trip','Actual costs recorded, feedback requested, dress back in service.','coordinator',15,false,false),

  ('giza-sunrise-photoshoot-sop',1,'Confirm the client and the pickup door','Name the door, not the hotel.','reservation',10,false,true),
  ('giza-sunrise-photoshoot-sop',2,'Decide whether a permit is needed','Tripod or lighting means yes. Handheld means no.','coordinator',5,false,true),
  ('giza-sunrise-photoshoot-sop',3,'Arrange the permit if needed','Horizon Permits, 24 hours ahead.','operations',20,true,true),
  ('giza-sunrise-photoshoot-sop',4,'Assign the photographer, driver and vehicle','','operations',15,false,true),
  ('giza-sunrise-photoshoot-sop',5,'Buy the plateau tickets','Interior tickets the day before if the client wants them.','operations',20,true,false),
  ('giza-sunrise-photoshoot-sop',6,'Send the brief to the crew','Same brief to photographer, driver and coordinator.','coordinator',10,false,true),
  ('giza-sunrise-photoshoot-sop',7,'Run the session','Panoramic point, then the base, then the Sphinx.','photographer',180,false,false),
  ('giza-sunrise-photoshoot-sop',8,'Upload raws the same day','','photographer',30,true,true),
  ('giza-sunrise-photoshoot-sop',9,'Edit, quality check and deliver','','editor',240,true,true),

  ('airport-transfer-sop',1,'Get the flight number from the airline','Not from the client. Confirm the terminal from the flight, every time.','reservation',10,true,true),
  ('airport-transfer-sop',2,'Assign the driver and vehicle','Match the vehicle to the luggage, not just the headcount.','operations',10,false,true),
  ('airport-transfer-sop',3,'Confirm the representative if the package includes one','They need the airport access pass to go past the hall.','operations',5,false,false),
  ('airport-transfer-sop',4,'Track the flight on the day','Landing time, not scheduled time.','coordinator',5,false,true),
  ('airport-transfer-sop',5,'Meet in the arrivals hall after customs','Name board with the lead traveller''s name spelled as they wrote it.','representative',60,false,true),
  ('airport-transfer-sop',6,'Complete the transfer and report','','driver',60,false,false)
) as v(sop_slug, seq, title, detail, owner, minutes, evidence, critical) on v.sop_slug = s.slug
where not exists (select 1 from public.os_sop_steps st where st.sop_id = s.id and st.seq = v.seq);

-- ---------------------------------------------------------------------------
-- INTERNAL CHAT — a channel per trip, plus the standing team channels
-- ---------------------------------------------------------------------------
insert into public.os_channels (org_id, kind, name, trip_id, unit_id, created_by, last_message_at)
select o.id, 'trip', t.ref || ' — ' || t.title, t.id, t.unit_id, t.created_by, t.created_at
from public.os_orgs o
join public.os_trips t on t.org_id = o.id
where o.key = 'egypt-eye'
  and not exists (select 1 from public.os_channels c where c.trip_id = t.id);

insert into public.os_channels (org_id, kind, name, unit_id, department, created_by)
select o.id, v.kind, v.name, u.id, v.department, e.id
from public.os_orgs o
cross join lateral (values
  ('announcement','Company Announcements',null,null,'EE-001'),
  ('department','Operations',null,'Operations','EE-002'),
  ('department','Reservations',null,'Reservations','EE-004'),
  ('department','Creative and Content',null,'Creative','EE-020'),
  ('team','Photoshoots Unit','photoshoots',null,'EE-008'),
  ('team','Drivers',null,'Transport','EE-003')
) as v(kind, name, unit_key, department, creator)
left join public.os_business_units u on u.org_id = o.id and u.key = v.unit_key
left join public.os_employees e on e.org_id = o.id and e.code = v.creator
where o.key = 'egypt-eye'
  and not exists (select 1 from public.os_channels c where c.org_id = o.id and c.name = v.name);

-- Trip channels are joined by whoever is on the trip, plus whoever created it.
insert into public.os_channel_members (channel_id, employee_id, role)
select c.id, x.employee_id, case when x.employee_id = t.created_by then 'owner' else 'member' end
from public.os_channels c
join public.os_trips t on t.id = c.trip_id
join lateral (
  select a.employee_id from public.os_trip_assignments a
  where a.trip_id = t.id and a.employee_id is not null
  union
  select t.created_by
) x on x.employee_id is not null
on conflict do nothing;

-- Everyone is in Announcements; departments get their own people.
insert into public.os_channel_members (channel_id, employee_id)
select c.id, e.id
from public.os_orgs o
join public.os_channels c on c.org_id = o.id and c.name = 'Company Announcements'
join public.os_employees e on e.org_id = o.id and e.archived_at is null
where o.key = 'egypt-eye'
on conflict do nothing;

insert into public.os_channel_members (channel_id, employee_id)
select c.id, e.id
from public.os_orgs o
join public.os_channels c on c.org_id = o.id and c.department is not null
join public.os_employees e on e.org_id = o.id and e.department = c.department and e.archived_at is null
where o.key = 'egypt-eye'
on conflict do nothing;

-- A short, real conversation on tomorrow's problem trip, so the trip chat is
-- not an empty box in the demo.
insert into public.os_messages (channel_id, employee_id, body, kind, created_at)
select c.id, e.id, v.body, v.kind, now() - make_interval(mins => v.mins_ago)
from public.os_orgs o
cross join lateral (values
  ('EE-10012', null, 'Trip created by Nour Hassan from a confirmed booking. Luxury tier, 2 guests, 05:45 pickup from Four Seasons Nile Plaza.', 'system', 2880),
  ('EE-10012','EE-003','Ahmed is on this one. Still need a driver — Sayed is on ET-10014 at Dahshur and Ashraf is on the Fayoum VIP.','message',600),
  ('EE-10012','EE-008','Mrs Whitfield has limited mobility. We should park as close to the panoramic point as the inspectors allow, which means the VIP vehicle and a word with the gate.','message',540),
  ('EE-10012','EE-002','Noted. I am looking for a driver now. If nothing comes free by 18:00 today I will bring in a freelance from the Giza list.','message',180),
  ('EE-10012','EE-003','Also flagging: Ahmed is currently on this AND on EE-10014 at 08:00. One of them has to move. Raised it as an approval.','message',170),

  ('EE-10011', null, 'Trip created by Nour Hassan. VIP flying dress, Wadi El Rayan, 05:00 pickup.', 'system', 4320),
  ('EE-10011','EE-002','Land Cruiser is in the workshop until the end of the week. I have asked Fayoum Desert Camp for their 4x4 with a driver for the sand section — $185. Raised for approval because it is over the threshold.','message',360),
  ('EE-10011','EE-008','Dress is Red Flame, repaired and back from the tailor. Salma is confirmed as photographer, which covers the female photographer requirement.','message',300),
  ('EE-10011','EE-001','Approve the 4x4. This client is not one we improvise with.','message',120)
) as v(ref, author, body, kind, mins_ago)
join public.os_trips t on t.org_id = o.id and t.ref = v.ref
join public.os_channels c on c.trip_id = t.id
left join public.os_employees e on e.org_id = o.id and e.code = v.author
where o.key = 'egypt-eye'
  and not exists (select 1 from public.os_messages m where m.channel_id = c.id and m.body = v.body);

-- ---------------------------------------------------------------------------
-- THE COMPANY CALENDAR — separate from operations, on purpose
-- ---------------------------------------------------------------------------
insert into public.os_events (org_id, kind, title, description, starts_at, ends_at, location, organizer_employee_id, visibility)
select o.id, v.kind, v.title, v.description,
       (current_date + v.day_offset)::timestamptz + v.start_time::interval,
       (current_date + v.day_offset)::timestamptz + v.end_time::interval,
       v.location, e.id, v.visibility
from public.os_orgs o
cross join lateral (values
  ('meeting','Operations stand-up','Tomorrow board review. Every open blocker gets an owner before we leave the room.',0,'09:00','09:20','Egypt Eye Office','EE-002','team'),
  ('meeting','Operations stand-up','',1,'09:00','09:20','Egypt Eye Office','EE-002','team'),
  ('meeting','Operations stand-up','',2,'09:00','09:20','Egypt Eye Office','EE-002','team'),
  ('meeting','Weekly management review','Revenue, margin, incidents and anything that needs a decision.',1,'14:00','15:30','Egypt Eye Office','EE-001','team'),
  ('supplier_meeting','Horizon Permits — quarterly rates','Their July increase and whether we can hold the old rate on volume.',2,'11:00','12:00','Egypt Eye Office','EE-002','team'),
  ('training','New coordinator onboarding — pickup rules and readiness','',3,'10:00','13:00','Egypt Eye Office','EE-007','company'),
  ('interview','Interview — freelance photographer','Portfolio review and a practical.',4,'12:00','13:00','Egypt Eye Office','EE-007','private'),
  ('one_on_one','Mariam and Karim — monthly','',4,'16:00','16:45','Egypt Eye Office','EE-002','private'),
  ('deadline','Month-end supplier reconciliation','All actual costs must be in the OS before Hana closes the month.',6,'17:00','17:30',null,'EE-006','company'),
  ('company_event','Team dinner','',9,'19:00','22:00','Zamalek','EE-007','company')
) as v(kind, title, description, day_offset, start_time, end_time, location, organizer, visibility)
left join public.os_employees e on e.org_id = o.id and e.code = v.organizer
where o.key = 'egypt-eye'
  and not exists (
    select 1 from public.os_events ev
    where ev.org_id = o.id and ev.title = v.title
      and ev.starts_at = (current_date + v.day_offset)::timestamptz + v.start_time::interval
  );

insert into public.os_event_attendees (event_id, employee_id, response)
select ev.id, e.id, 'accepted'
from public.os_orgs o
join public.os_events ev on ev.org_id = o.id
join public.os_employees e on e.org_id = o.id
where o.key = 'egypt-eye'
  and ((ev.title = 'Operations stand-up' and e.department = 'Operations')
    or (ev.title = 'Weekly management review' and e.code in ('EE-001','EE-002','EE-004','EE-006','EE-007')))
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- ATTENDANCE — the last two weeks
-- ---------------------------------------------------------------------------
insert into public.os_attendance (org_id, employee_id, work_date, check_in_at, check_out_at, minutes, status, check_in_source)
select o.id, e.id, d.day,
       d.day::timestamptz + interval '9 hours' + make_interval(mins => (abs(hashtext(e.code || d.day::text)) % 40)),
       case when d.day < current_date then d.day::timestamptz + interval '18 hours' end,
       case when d.day < current_date then 520 end,
       case when (abs(hashtext(e.code || d.day::text)) % 40) > 25 then 'late' else 'present' end,
       'web'
from public.os_orgs o
join public.os_employees e on e.org_id = o.id and e.employment_type = 'staff' and e.archived_at is null
cross join generate_series(current_date - 13, current_date, interval '1 day') as d(day)
where o.key = 'egypt-eye'
  and extract(dow from d.day) not in (5)   -- Friday is the weekend day here
  and not exists (select 1 from public.os_attendance a where a.employee_id = e.id and a.work_date = d.day::date);

-- Rania is on approved leave from three days out; mark it so the roster and
-- the availability engine agree with the leave record.
insert into public.os_attendance (org_id, employee_id, work_date, status, note)
select o.id, e.id, d.day::date, 'leave', 'Annual leave, approved.'
from public.os_orgs o
join public.os_employees e on e.org_id = o.id and e.code = 'EE-015'
cross join generate_series(current_date + 3, current_date + 7, interval '1 day') as d(day)
where o.key = 'egypt-eye'
  and not exists (select 1 from public.os_attendance a where a.employee_id = e.id and a.work_date = d.day::date);

-- ---------------------------------------------------------------------------
-- SAVED VIEWS — the questions people actually ask every day
-- ---------------------------------------------------------------------------
-- Shared views are visible to everyone; the view grants nothing on its own,
-- it just carries a filter. What each person sees when they open it is still
-- decided by their own permissions and scope.
insert into public.os_saved_views (org_id, employee_id, name, resource, query, shared, pinned, sort_order, icon)
select o.id, null, v.name, v.resource, v.query::jsonb, true, v.pinned, v.sort_order, v.icon
from public.os_orgs o
cross join lateral (values
  ('Tomorrow, unassigned','trips','{"when":"tomorrow","missing":"crew"}',true,1,'alert'),
  ('Trips at risk','trips','{"readiness":["yellow","red"],"when":"upcoming"}',true,2,'warning'),
  ('Missing a Google Drive folder','trips','{"produces_content":true,"missing":"media","status":["completed","content_pending"]}',true,3,'folder'),
  ('VIP trips this month','trips','{"tag":"vip","when":"this_month"}',true,4,'star'),
  ('High margin trips','trips','{"margin_pct_gte":45,"when":"last_90_days"}',true,5,'trending'),
  ('Low margin trips','trips','{"margin_pct_lt":22,"when":"last_90_days"}',true,6,'trending-down'),
  ('Unpaid balances','trips','{"balance_due":true}',true,7,'money'),
  ('Pending approvals','approvals','{"status":"pending"}',true,8,'check'),
  ('Open incidents','incidents','{"status":["open","investigating"]}',true,9,'alert'),
  ('My overdue tasks','tasks','{"owner":"me","overdue":true}',true,10,'clock'),
  ('Repeat customers','clients','{"tag":"repeat"}',true,11,'users'),
  ('Resources in maintenance','resources','{"status":["maintenance","cleaning"]}',true,12,'tool')
) as v(name, resource, query, pinned, sort_order, icon)
where o.key = 'egypt-eye'
  and not exists (select 1 from public.os_saved_views sv where sv.org_id = o.id and sv.name = v.name and sv.employee_id is null);

-- ---------------------------------------------------------------------------
-- A little history, so every entity has a story on its Activity tab.
-- ---------------------------------------------------------------------------
insert into public.os_activity (org_id, entity_type, entity_id, trip_id, employee_id, verb, summary, at)
select o.id, 'trip', t.id, t.id, t.created_by, 'created',
       'Trip created from a confirmed booking.', t.created_at
from public.os_orgs o
join public.os_trips t on t.org_id = o.id
where o.key = 'egypt-eye'
  and not exists (select 1 from public.os_activity a where a.trip_id = t.id and a.verb = 'created');

insert into public.os_activity (org_id, entity_type, entity_id, trip_id, employee_id, verb, summary, meta, at)
select o.id, 'trip', t.id, t.id, a.assigned_by, 'assigned',
       coalesce(e.full_name, r.name) || ' assigned as ' || replace(a.role_key, '_', ' ') || '.',
       jsonb_build_object('role', a.role_key, 'employee', e.full_name, 'resource', r.name),
       a.assigned_at
from public.os_orgs o
join public.os_trips t on t.org_id = o.id
join public.os_trip_assignments a on a.trip_id = t.id
left join public.os_employees e on e.id = a.employee_id
left join public.os_resources r on r.id = a.resource_id
where o.key = 'egypt-eye'
  and not exists (
    select 1 from public.os_activity ac
    where ac.trip_id = t.id and ac.verb = 'assigned'
      and ac.meta ->> 'role' = a.role_key
      and coalesce(ac.meta ->> 'employee', ac.meta ->> 'resource') = coalesce(e.full_name, r.name)
  );

insert into public.os_trip_status_history (trip_id, from_status, to_status, employee_id, note, at)
select t.id, null, t.status, t.created_by, 'Seeded demo data — the trip was created at this status.', t.created_at
from public.os_orgs o
join public.os_trips t on t.org_id = o.id
where o.key = 'egypt-eye'
  and not exists (select 1 from public.os_trip_status_history h where h.trip_id = t.id);
