-- ===========================================================================
-- EGYPT EYE OS — COMMERCIAL DEMO DATA
-- ===========================================================================
--
-- Optional. Skip this file on a production project; 0022 and 0023 are all
-- the commercial layer needs to run.
--
-- Everything here is dated relative to current_date, so the pipeline is
-- always live whenever the migration is applied, and it connects to the
-- trips already seeded by 0020 rather than inventing a parallel world.
--
-- Deliberate situations, so the screens have something true to show:
--
--   * Olivia Bennett is ONE record. She booked a private photoshoot as a
--     customer (EE-10005, EE-10018) and she is also the product manager at
--     Southern Cross Journeys, which is now negotiating a volume agreement.
--     This is the "avoid duplicate records" requirement made visible: her
--     B2C history and her B2B role are the same person, joined by a
--     membership row, not two people with the same name.
--
--   * LD-03004 sat unanswered for eleven hours against a sixty-minute
--     target, and its score says so — "we replied within an hour" did not
--     match, and that is visible on the lead.
--
--   * Blue Nile Collective's commission was renegotiated from 12% to 15%.
--     The old term is CLOSED, not overwritten, so a trip that ran in
--     the earlier window still resolves 12%.
--
--   * Two deals are stalled past their stage's stale_after_days.
--   * One B2B deal was lost for an uncontrollable reason and one for a
--     controllable one, so the lost-reason split shows both colours.
--   * Meridian Voyages is over its credit limit and on hold.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- PARTNER COMPANIES
-- ---------------------------------------------------------------------------
-- Two already exist: Wanderlust Travel Co. and Nile Star Reisen GmbH, both
-- promoted from the agency client records by 0022. These are the rest of the
-- book, at every stage of a relationship.
insert into public.os_companies (
  org_id, code, name, legal_name, kind, status, tier, website, email, phone,
  country, city, languages, default_commission_pct, default_payment_terms, currency,
  credit_limit_amount, credit_hold, owner_employee_id, unit_id, source, notes, created_by, created_at
)
select o.id,
       'CO-' || lpad(nextval('public.os_company_code_seq')::text, 4, '0'),
       v.name, v.legal_name, v.kind, v.status, v.tier, v.website, v.email, v.phone,
       v.country, v.city, v.languages::text[], v.commission, v.terms, v.currency,
       v.credit_limit, v.credit_hold,
       owner.id, unit.id, v.source, v.notes, creator.id,
       current_date - v.created_days_ago
from public.os_orgs o
cross join lateral (values
  ('Blue Nile Collective', 'Blue Nile Collective Ltd', 'tour_operator', 'active', 'strategic',
   'https://bluenilecollective.example', 'partners@bluenilecollective.example', '+44 20 7000 1001',
   'United Kingdom', 'London', '{English}', 15.00, 'Net 30', 'USD', 25000, false,
   'Trade show — WTM London',
   'Our largest trade partner. Sends premium couples and small groups year round. Commission renegotiated upward this year in exchange for a volume commitment.', 'EE-001', 420),
  ('Southern Cross Journeys', 'Southern Cross Journeys Pty Ltd', 'travel_agency', 'prospect', 'standard',
   'https://southerncrossjourneys.example', 'hello@southerncrossjourneys.example', '+61 2 8000 2002',
   'Australia', 'Sydney', '{English}', null, null, 'USD', null, false,
   'Existing client introduction',
   'Introduced by Olivia Bennett, who books with us privately and runs their Egypt product. Negotiating a volume agreement for their 2027 season.', 'EE-004', 95),
  ('Meridian Voyages', 'Meridian Voyages SARL', 'dmc', 'active', 'preferred',
   'https://meridianvoyages.example', 'ops@meridianvoyages.example', '+33 1 4000 3003',
   'France', 'Paris', '{French,English}', 12.00, 'Net 45', 'EUR', 12000, true,
   'Referral — Blue Nile Collective',
   'Reliable French-speaking volume, but payment has slipped twice. On credit hold until the outstanding balance clears — new bookings need a decision.', 'EE-001', 300),
  ('Pharos Cruises', 'Pharos Nile Cruises S.A.E.', 'cruise_line', 'active', 'preferred',
   'https://pharoscruises.example', 'shore@pharoscruises.example', '+20 2 2000 4004',
   'Egypt', 'Luxor', '{Arabic,English}', 10.00, 'Net 14', 'USD', 8000, false,
   'Direct approach',
   'Their guests take our Luxor photoshoots as a shore excursion. Volume is seasonal and follows their sailing calendar.', 'EE-001', 250),
  ('Aurora Weddings', 'Aurora Destination Weddings LLC', 'wedding_planner', 'active', 'standard',
   'https://auroraweddings.example', 'egypt@auroraweddings.example', '+1 212 555 5005',
   'United States', 'New York', '{English,Spanish}', 18.00, 'Net 30', 'USD', 6000, false,
   'Instagram',
   'Destination proposals and elopements. Small numbers, very high value per booking, and extremely demanding on delivery time.', 'EE-004', 180),
  ('Nordic Sun Travel', 'Nordic Sun Travel AB', 'tour_operator', 'dormant', 'standard',
   'https://nordicsun.example', 'egypt@nordicsun.example', '+46 8 000 6006',
   'Sweden', 'Stockholm', '{Swedish,English}', 12.00, 'Net 30', 'EUR', 5000, false,
   'Trade show — WTM London',
   'Sent good volume two seasons ago and has gone quiet since their Egypt product manager left. Worth one proper approach before writing off.', 'EE-001', 640),
  ('Cairo Grand Hotel', 'Cairo Grand Hotel Company', 'hotel', 'active', 'standard',
   'https://cairograndhotel.example', 'concierge@cairograndhotel.example', '+20 2 2000 7007',
   'Egypt', 'Cairo', '{Arabic,English}', 10.00, 'Cash on the day', 'USD', 3000, false,
   'Direct approach',
   'Concierge desk refers guests for morning Giza tours. Small commission, no paperwork, steady trickle.', 'EE-003', 200),
  ('Lumiere Media', 'Lumiere Media Group', 'media', 'prospect', 'standard',
   'https://lumieremedia.example', 'productions@lumieremedia.example', '+44 20 7000 8008',
   'United Kingdom', 'London', '{English}', null, null, 'USD', null, false,
   'Inbound — website',
   'Production company scouting Egypt for a documentary series. Would need permits, fixers and vehicles rather than a normal trip.', 'EE-001', 40)
) as v(name, legal_name, kind, status, tier, website, email, phone, country, city, languages,
       commission, terms, currency, credit_limit, credit_hold, source, notes, creator_code, created_days_ago)
left join public.os_employees owner on owner.org_id = o.id and owner.code = v.creator_code
left join public.os_employees creator on creator.org_id = o.id and creator.code = v.creator_code
left join public.os_business_units unit on unit.org_id = o.id and unit.key = 'tours'
where o.key = 'egypt-eye'
  and not exists (select 1 from public.os_companies c where c.org_id = o.id and lower(c.name) = lower(v.name));

-- Blue Nile introduced us to Meridian. Referral revenue is traced through
-- this column rather than remembered by whoever was in the room.
update public.os_companies m
set referred_by_company_id = b.id
from public.os_companies b
where m.name = 'Meridian Voyages' and b.name = 'Blue Nile Collective'
  and m.org_id = b.org_id and m.referred_by_company_id is null;

-- Nobody has spoken to Nordic Sun in a long time. Health scoring reads this.
update public.os_companies set last_contact_at = now() - interval '400 days' where name = 'Nordic Sun Travel';

-- ---------------------------------------------------------------------------
-- CONTACTS — people at those companies
-- ---------------------------------------------------------------------------
-- New people get an os_clients record, because a person is a person whether
-- they book for themselves or for an agency. That is the whole reason there
-- is no separate contacts table.
insert into public.os_clients (org_id, code, kind, full_name, email, phone, country, language, source, lifecycle, notes, created_by)
select o.id,
       'CL-' || lpad((
         coalesce((select max(nullif(regexp_replace(c2.code, '\D', '', 'g'), '')::int) from public.os_clients c2 where c2.org_id = o.id), 0)
         + row_number() over (order by v.full_name)
       )::text, 4, '0'),
       'individual', v.full_name, v.email, v.phone, v.country, v.language, 'Travel Agency', 'prospect', v.notes, creator.id
from public.os_orgs o
cross join lateral (values
  ('Rebecca Hale',    'rebecca.hale@bluenilecollective.example', '+44 20 7000 1011', 'United Kingdom', 'English',
   'Product director at Blue Nile Collective. Signs the agreements and cares about photography quality above price.'),
  ('Tom Ashworth',    'tom.ashworth@bluenilecollective.example', '+44 20 7000 1012', 'United Kingdom', 'English',
   'Operations at Blue Nile. Books the individual trips and is who operations actually talks to.'),
  ('Camille Moreau',  'camille@meridianvoyages.example',         '+33 1 4000 3013', 'France', 'French',
   'Runs Meridian''s Egypt programme. Excellent to work with; her finance department is the problem, not her.'),
  ('Hazem Sobhy',     'hazem@pharoscruises.example',             '+20 2 2000 4014', 'Egypt', 'Arabic',
   'Shore excursions manager at Pharos. Decides the excursion list each season.'),
  ('Danielle Ortiz',  'danielle@auroraweddings.example',         '+1 212 555 5015', 'United States', 'English',
   'Founder of Aurora Weddings. Decision maker, replies at midnight Cairo time, expects the same.'),
  ('Erik Lindqvist',  'erik@nordicsun.example',                  '+46 8 000 6016', 'Sweden', 'Swedish',
   'New Egypt product manager at Nordic Sun. Has never dealt with us — the relationship is starting again from scratch.'),
  ('Nadia Fahim',     'nadia@cairograndhotel.example',           '+20 2 2000 7017', 'Egypt', 'Arabic',
   'Head concierge at Cairo Grand. Sends guests when she trusts the guide, and remembers when she should not have.'),
  ('Grace Whitmore',  'grace@lumieremedia.example',              '+44 20 7000 8018', 'United Kingdom', 'English',
   'Line producer at Lumiere Media. Scoping only; the commissioning decision is not hers.')
) as v(full_name, email, phone, country, language, notes)
left join public.os_employees creator on creator.org_id = o.id and creator.code = 'EE-004'
where o.key = 'egypt-eye'
  and not exists (select 1 from public.os_clients c where c.org_id = o.id and lower(c.email) = lower(v.email));

insert into public.os_client_companies (client_id, company_id, job_title, department, decision_role, is_primary, work_email, work_phone, started_on, notes, created_by)
select c.id, co.id, v.job_title, v.department, v.decision_role, v.is_primary, c.email, c.phone,
       current_date - v.started_days_ago, v.notes, creator.id
from public.os_orgs o
cross join lateral (values
  ('rebecca.hale@bluenilecollective.example', 'Blue Nile Collective',    'Product Director',            'Product',    'signatory',      true,  400, 'Signs. Reads the whole contract.'),
  ('tom.ashworth@bluenilecollective.example', 'Blue Nile Collective',    'Operations Manager',          'Operations', 'contact',        false, 380, 'Day to day bookings. Not the person to send terms to.'),
  ('camille@meridianvoyages.example',         'Meridian Voyages',        'Egypt Programme Manager',     'Product',    'decision_maker', true,  290, null),
  ('hazem@pharoscruises.example',             'Pharos Cruises',          'Shore Excursions Manager',    'Operations', 'decision_maker', true,  240, null),
  ('danielle@auroraweddings.example',         'Aurora Weddings',         'Founder',                     null,         'signatory',      true,  175, null),
  ('erik@nordicsun.example',                  'Nordic Sun Travel',       'Egypt Product Manager',       'Product',    'decision_maker', true,   90, 'Joined long after the relationship went quiet.'),
  ('nadia@cairograndhotel.example',           'Cairo Grand Hotel',       'Head Concierge',              'Guest Services', 'recommender', true,  195, 'Recommends, does not decide. The GM signs.'),
  ('grace@lumieremedia.example',              'Lumiere Media',           'Line Producer',               'Production', 'influencer',     true,   38, 'Scoping. The commissioner decides, and we have not met them.')
) as v(email, company_name, job_title, department, decision_role, is_primary, started_days_ago, notes)
join public.os_clients c on c.org_id = o.id and lower(c.email) = lower(v.email)
join public.os_companies co on co.org_id = o.id and co.name = v.company_name
left join public.os_employees creator on creator.org_id = o.id and creator.code = 'EE-004'
where o.key = 'egypt-eye'
  and not exists (select 1 from public.os_client_companies cc where cc.client_id = c.id and cc.company_id = co.id);

-- ---------------------------------------------------------------------------
-- THE POINT OF THE WHOLE MODEL, IN ONE ROW
-- ---------------------------------------------------------------------------
-- Olivia Bennett booked a photoshoot with us privately (EE-10005) and is
-- booked again (EE-10018). She also runs the Egypt product at Southern Cross
-- Journeys. There is ONE Olivia Bennett. Her private bookings and her
-- agency's negotiation hang off the same record, which is why her value to
-- the company can be stated at all.
insert into public.os_client_companies (client_id, company_id, job_title, department, decision_role, is_primary, work_email, started_on, notes, created_by)
select c.id, co.id, 'Egypt Product Manager', 'Product', 'decision_maker', true,
       'olivia.bennett@southerncrossjourneys.example', current_date - 60,
       'Books with us privately as well. Same person, one record — her private history is why this conversation started.',
       creator.id
from public.os_orgs o
join public.os_clients c on c.org_id = o.id and c.full_name = 'Olivia Bennett'
join public.os_companies co on co.org_id = o.id and co.name = 'Southern Cross Journeys'
left join public.os_employees creator on creator.org_id = o.id and creator.code = 'EE-004'
where o.key = 'egypt-eye'
  and not exists (select 1 from public.os_client_companies cc where cc.client_id = c.id and cc.company_id = co.id);

update public.os_companies co
set referred_by_company_id = null,
    source = 'Existing client introduction'
where co.name = 'Southern Cross Journeys';

-- Owners on the existing client book, so 'own' scope means something.
update public.os_clients c
set owner_employee_id = e.id
from public.os_employees e
where e.org_id = c.org_id and e.code = 'EE-004'
  and c.owner_employee_id is null and c.kind = 'individual';

-- ---------------------------------------------------------------------------
-- LEADS
-- ---------------------------------------------------------------------------
insert into public.os_leads (
  org_id, ref, pipeline, contact_name, contact_email, contact_phone, contact_instagram,
  company_name, country, language, client_id, company_id, source, campaign,
  interest, trip_type_id, unit_id, requested_date, date_flexible, guests,
  budget_amount, budget_currency, message, status, owner_employee_id,
  received_at, first_response_at, first_response_minutes, qualified_at, notes, created_by
)
select o.id,
       'LD-' || lpad(nextval('public.os_lead_ref_seq')::text, 5, '0'),
       v.pipeline, v.contact_name, v.contact_email, v.contact_phone, v.contact_instagram,
       v.company_name, v.country, v.language, null, co.id, v.source, v.campaign,
       v.interest, tt.id, bu.id,
       case when v.requested_in_days is null then null else current_date + v.requested_in_days end,
       v.flexible, v.guests, v.budget, v.budget_ccy, v.message, v.status, owner.id,
       now() - make_interval(hours => v.received_hours_ago),
       case when v.response_minutes is null then null
            else now() - make_interval(hours => v.received_hours_ago) + make_interval(mins => v.response_minutes) end,
       v.response_minutes,
       case when v.status in ('qualified','converted') then now() - make_interval(hours => v.received_hours_ago) + interval '3 hours' else null end,
       v.notes, owner.id
from public.os_orgs o
cross join lateral (values
  ('b2c','Laura Pettersen','laura.pettersen@example.com','+47 900 00001',null,null,'Norway','English',
   'Instagram','Autumn flying dress reel',
   'Flying dress photoshoot at Wadi El Rayan','flying_dress','flying_dress',
   34,false,2,700,'USD',
   'Hi! We saw your flying dress reel and would love to do this in October. Two of us. What does it cost and can you do sunrise?',
   'qualified','EE-004',30,18,
   'Clear date, clear budget, gave a number. Answered in eighteen minutes.'),

  ('b2c','Daniel Okafor','daniel.okafor@example.com','+234 800 00002',null,null,'Nigeria','English',
   'WhatsApp',null,
   'Private Giza day tour','tour','tours',
   12,false,4,null,'USD',
   'Good evening, I am in Cairo next week with my family. Four people. Can you do a private day at the pyramids?',
   'contacted','EE-005',9,44,
   'No budget stated, but a near date and a real party size.'),

  ('b2c','Mei Lin','mei.lin@example.com',null,'@meilin.travels',null,'Singapore','English',
   'TikTok','Pyramids POV',
   'Photoshoot, undecided on location','photoshoot','photoshoots',
   null,true,1,null,null,
   'love your content!! is it expensive?',
   'new','EE-005',5,null,
   'No date, no budget, no number to call. Answered honestly by the score.'),

  ('b2c','Ricardo Alves','ricardo.alves@example.com','+55 11 90000 0003',null,null,'Brazil','Portuguese',
   'Referral',null,
   'Proposal shoot at the pyramids','photoshoot','photoshoots',
   21,false,2,1500,'USD',
   'Hannah Meyer travelled with you last month and told me to write. I am proposing to my girlfriend and I want it photographed without her knowing until the moment.',
   'qualified','EE-004',52,25,
   'Referred by a past client, real date, generous budget. The highest scoring lead on the board.'),

  ('b2c','Sarah Whitfield','sarah.whitfield@example.com','+44 7700 000004',null,null,'United Kingdom','English',
   'Repeat Customer',null,
   'Second trip — Luxor','tour','tours',
   75,true,2,900,'USD',
   'My husband James travelled with you and has not stopped talking about it. We would like to come back and do Luxor properly.',
   'contacted','EE-004',26,90,
   'Related to an existing client. Flexible dates, which costs it a few points and is worth knowing.'),

  ('b2c','Anonymous enquiry','',null,'@wanderdust____',null,'Unknown','English',
   'Instagram',null,
   'Unclear','photoshoot','photoshoots',
   null,true,null,null,null,
   'price?',
   'unqualified','EE-005',72,null,
   'Nothing to work with and no way to reply. Kept rather than deleted so the channel''s real quality is visible.'),

  ('b2c','Ingrid Halvorsen','ingrid.h@example.com','+47 900 00005',null,null,'Norway','English',
   'Website',null,
   'Family tour, three days','tour','tours',
   110,true,5,2200,'USD',
   'Planning our December holiday. Two adults, three children aged 6, 9 and 13. We would like three days around Cairo and Giza.',
   'new','EE-004',11,null,
   'Eleven hours old against a sixty-minute target, and nobody has replied. This is what the response-time watch is for.'),

  ('b2b','Erik Lindqvist','erik@nordicsun.example','+46 8 000 6016',null,'Nordic Sun Travel','Sweden','Swedish',
   'Trade show — WTM London','WTM London',
   'Restarting a dormant partnership','tour','tours',
   null,true,null,null,null,
   'Hello — I have taken over the Egypt programme at Nordic Sun. I can see we worked together in the past. Could we talk about the coming season?',
   'qualified','EE-001',96,180,
   'Inbound from a dormant partner with a new decision maker. Exactly the lead a partnerships manager wants.'),

  ('b2b','Grace Whitmore','grace@lumieremedia.example','+44 20 7000 8018',null,'Lumiere Media','United Kingdom','English',
   'Website',null,
   'Documentary production support','content_production','content',
   150,true,null,null,null,
   'We are scouting Egypt for a six-part series and need a local production partner for permits, fixers and vehicles. Is this something you do?',
   'qualifying','EE-001',40,120,
   'Real budget behind it, but the person writing cannot commission. That is the risk, and the score says so.'),

  ('b2b','Priya Raghavan','priya@indusvoyages.example','+91 22 4000 0006',null,'Indus Voyages','India','English',
   'Referral',null,
   'Volume agreement for Indian market','tour','tours',
   null,true,null,null,null,
   'Blue Nile suggested we speak. We send roughly forty groups a year to Egypt and are unhappy with our current DMC.',
   'new','EE-001',20,null,
   'Referred by our strongest partner and states volume. Has not been answered yet.')
) as v(pipeline, contact_name, contact_email, contact_phone, contact_instagram, company_name, country, language,
       source, campaign, interest, type_key, unit_key,
       requested_in_days, flexible, guests, budget, budget_ccy, message, status, owner_code,
       received_hours_ago, response_minutes, notes)
left join public.os_companies co on co.org_id = o.id and co.name = v.company_name
left join public.os_trip_types tt on tt.org_id = o.id and tt.key = v.type_key
left join public.os_business_units bu on bu.org_id = o.id and bu.key = v.unit_key
left join public.os_employees owner on owner.org_id = o.id and owner.code = v.owner_code
where o.key = 'egypt-eye'
  and not exists (
    select 1 from public.os_leads l
    where l.org_id = o.id and l.contact_name = v.contact_name and l.message = v.message
  );

-- ---------------------------------------------------------------------------
-- QUALIFYING A LEAD CREATES THE PERSON
-- ---------------------------------------------------------------------------
-- This is what the Qualify action does in the application, reproduced here so
-- the demo pipeline is the shape a real one would be. A lead that never got
-- past "new" deliberately does NOT get a client record — half the value of
-- keeping leads separate is that the client book is not full of people who
-- once sent the word "price?".
insert into public.os_clients (org_id, code, kind, full_name, email, phone, country, language, source, lifecycle, notes, owner_employee_id, created_by, created_at)
select o.id,
       'CL-' || lpad((
         coalesce((select max(nullif(regexp_replace(c2.code, '\D', '', 'g'), '')::int) from public.os_clients c2 where c2.org_id = o.id), 0)
         + row_number() over (order by l.received_at)
       )::text, 4, '0'),
       'individual', l.contact_name, l.contact_email, l.contact_phone, l.country, l.language,
       l.source, 'prospect',
       'Created when ' || l.ref || ' was qualified. The enquiry itself is kept as it arrived.',
       l.owner_employee_id, l.owner_employee_id, l.received_at
from public.os_orgs o
join public.os_leads l on l.org_id = o.id
where o.key = 'egypt-eye'
  and l.pipeline = 'b2c'
  and l.status in ('contacted', 'qualifying', 'qualified', 'converted')
  and l.client_id is null
  and coalesce(l.contact_email, '') <> ''
  and not exists (select 1 from public.os_clients c where c.org_id = o.id and lower(c.email) = lower(l.contact_email));

update public.os_leads l
set client_id = c.id
from public.os_clients c
where c.org_id = l.org_id
  and lower(c.email) = lower(l.contact_email)
  and l.client_id is null
  and coalesce(l.contact_email, '') <> '';

update public.os_leads l
set company_id = co.id
from public.os_companies co
where co.org_id = l.org_id and co.name = l.company_name and l.company_id is null;

-- ---------------------------------------------------------------------------
-- DEALS — both pipelines, at every stage
-- ---------------------------------------------------------------------------
insert into public.os_deals (
  org_id, ref, pipeline, title, client_id, company_id, stage_id, status,
  value_amount, currency, probability_pct, probability_source, expected_close_on,
  trip_type_id, unit_id, requested_date, guests, owner_employee_id, source, campaign,
  won_at, lost_at, lost_reason_id, lost_note, lost_to,
  stage_entered_at, last_activity_at, next_step, next_step_due_on, notes, created_by, created_at
)
select o.id,
       'DL-' || lpad(nextval('public.os_deal_ref_seq')::text, 5, '0'),
       v.pipeline, v.title, cl.id, co.id, st.id, v.status,
       v.value, v.currency, null, 'stage',
       case when v.close_in_days is null then null else current_date + v.close_in_days end,
       tt.id, bu.id,
       case when v.trip_in_days is null then null else current_date + v.trip_in_days end,
       v.guests, owner.id, v.source, v.campaign,
       case when v.status = 'won'  then now() - make_interval(days => v.closed_days_ago) end,
       case when v.status = 'lost' then now() - make_interval(days => v.closed_days_ago) end,
       lr.id, null, null,
       now() - make_interval(days => v.in_stage_days),
       now() - make_interval(days => v.last_activity_days),
       v.next_step,
       case when v.next_step_in_days is null then null else current_date + v.next_step_in_days end,
       v.notes, owner.id, now() - make_interval(days => v.created_days_ago)
from public.os_orgs o
cross join lateral (values
  -- ---- B2C -------------------------------------------------------------
  ('b2c','Laura Pettersen — flying dress, Wadi El Rayan','laura.pettersen@example.com',null,'quoted','open',
   740,'USD',30,'flying_dress','flying_dress',34,2,'EE-004','Instagram','Autumn flying dress reel',
   null,null,2,1,'Follow up on the sunrise slot she asked about',2,
   'Quote sent with two dress options. She asked whether sunrise is possible in October — it is, and it is the better light.',
   3),

  ('b2c','Ricardo Alves — surprise proposal shoot','ricardo.alves@example.com',null,'negotiating','open',
   1650,'USD',18,'photoshoot','photoshoots',21,2,'EE-004','Referral',null,
   null,null,3,1,'Confirm the second photographer and the ring-moment position',1,
   'Referred by Hannah Meyer. Wants a second photographer hidden at distance. Discussing whether the extra photographer is chargeable.',
   6),

  ('b2c','Daniel Okafor — private Giza day, family of four','daniel.okafor@example.com',null,'qualified','open',
   0,'USD',10,'tour','tours',12,4,'EE-005','WhatsApp',null,
   null,null,1,1,'Send the priced options — standard and premium vehicle',1,
   'Has not been quoted yet. Value is deliberately zero until it is, rather than a made-up number inflating the forecast.',
   2),

  ('b2c','Sarah Whitfield — return trip to Luxor','sarah.whitfield@example.com',null,'qualified','open',
   950,'USD',75,'tour','tours',75,2,'EE-004','Repeat Customer',null,
   null,null,9,9,'She went quiet after the first reply. Chase once, then park.',0,
   'Stalled. Nine days in a stage that goes stale after three, which is exactly what the stale watch is for.',
   11),

  ('b2c','Min-Jun Park — content collaboration','minjun.park@example.com',null,'won','won',
   380,'USD',-4,'photoshoot','photoshoots',1,1,'EE-005','TikTok',null,
   4,null,4,3,null,null,
   'Closed and already operating as EE-10014.',
   16),

  ('b2c','Chloe Dubois — Giza photoshoot','chloe.dubois@example.com',null,'won','won',
   640,'USD',-8,'photoshoot','photoshoots',0,2,'EE-004','Instagram',null,
   8,null,8,7,null,null,
   'Closed. Ran today as EE-10007.',
   19),

  -- One loss of each kind, so the split on the reporting page shows both
  -- halves. Egypt Eye could have done something about the first and nothing
  -- about the second, and a report that mixed them would teach nobody.
  ('b2c','Emma Larsen — return trip with friends','emma.larsen@example.com',null,'lost','lost',
   1900,'USD',-6,'tour','tours',null,6,'EE-004','Instagram',null,
   6,'travel_cancelled',6,6,null,null,
   'Six of them were coming in November. One had a family emergency and the group cancelled the whole trip. Nothing to do with us and nothing to fix.',
   40),

  ('b2c','Yuki Tanaka — Luxor extension','y.tanaka@example.com',null,'lost','lost',
   1100,'USD',-2,'tour','tours',null,2,'EE-005','Viator',null,
   2,'price',2,2,null,null,
   'She has travelled with us twice and asked about adding Luxor. Lost on price against a local operator — a controllable reason, and the kind worth counting.',
   14),

  -- ---- B2B -------------------------------------------------------------
  ('b2b','Southern Cross Journeys — 2027 volume agreement',null,'Southern Cross Journeys','negotiating','open',
   48000,'USD',45,'tour','tours',null,null,'EE-001','Existing client introduction',null,
   null,null,12,3,'Send the revised commission ladder with the 40-booking tier',4,
   'Introduced by Olivia Bennett, who books with us privately. They want 18% flat; we are offering a ladder that reaches 18% at volume.',
   80),

  ('b2b','Nordic Sun Travel — restart the partnership',null,'Nordic Sun Travel','qualified','open',
   22000,'USD',70,'tour','tours',null,null,'EE-001','Trade show — WTM London','WTM London',
   null,null,4,2,'Erik to send their 2027 Egypt volume forecast',3,
   'New product manager, no history with us personally. Worth rebuilding — they sent good volume two seasons ago.',
   4),

  ('b2b','Pharos Cruises — 2027 shore excursion contract',null,'Pharos Cruises','contracting','open',
   36000,'USD',21,'photoshoot','photoshoots',null,null,'EE-001','Direct approach',null,
   null,null,6,2,'Chase the signed copy from their legal team',5,
   'Agreement drafted and sent. Their legal review is the only thing outstanding.',
   120),

  ('b2b','Lumiere Media — documentary production support',null,'Lumiere Media','contacted','open',
   0,'USD',60,'content_production','content',null,null,'EE-001','Website',null,
   null,null,16,16,'Ask Grace to introduce whoever commissions the series',0,
   'Sixteen days with no movement, and we still have not met anybody who can commission. Stalled, and the stage says why.',
   18),

  ('b2b','Aurora Weddings — preferred supplier renewal',null,'Aurora Weddings','won','won',
   14000,'USD',-30,'photoshoot','photoshoots',null,null,'EE-004','Instagram',null,
   30,null,30,12,null,null,
   'Renewed for another year at 18%. High value per booking, demanding delivery times.',
   210),

  ('b2b','Meridian Voyages — exclusivity for the French market',null,'Meridian Voyages','lost','lost',
   60000,'EUR',-45,'tour','tours',null,null,'EE-001','Referral — Blue Nile Collective',null,
   45,'exclusivity',45,50,null,null,
   'They wanted exclusivity across France in exchange for volume we could not verify. We declined. The working relationship continues.',
   150)
) as v(pipeline, title, client_email, company_name, stage_key, status,
       value, currency, close_in_days, type_key, unit_key, trip_in_days, guests,
       owner_code, source, campaign, closed_days_ago, lost_reason_key,
       in_stage_days, last_activity_days, next_step, next_step_in_days, notes, created_days_ago)
left join public.os_clients cl on cl.org_id = o.id and cl.email = v.client_email
left join public.os_companies co on co.org_id = o.id and co.name = v.company_name
left join public.os_deal_stages st on st.org_id = o.id and st.pipeline = v.pipeline and st.key = v.stage_key
left join public.os_lost_reasons lr on lr.org_id = o.id and lr.key = v.lost_reason_key
left join public.os_trip_types tt on tt.org_id = o.id and tt.key = v.type_key
left join public.os_business_units bu on bu.org_id = o.id and bu.key = v.unit_key
left join public.os_employees owner on owner.org_id = o.id and owner.code = v.owner_code
where o.key = 'egypt-eye'
  and not exists (select 1 from public.os_deals d where d.org_id = o.id and d.title = v.title);

-- Meridian's lost note, which is the part that teaches something.
update public.os_deals set lost_note = 'The group cancelled after a family emergency. They asked to be contacted next spring.'
where title = 'Emma Larsen — return trip with friends' and lost_note is null;

update public.os_deals set lost_note = 'Local operator quoted roughly 30% under us for the Luxor days. We did not match it.', lost_to = 'A Luxor-based operator'
where title = 'Yuki Tanaka — Luxor extension' and lost_note is null;

update public.os_deals set lost_note =
  'Would only commit volume behind a market-wide exclusive. We could not verify the volume and would have closed the French market to do it.'
where title like 'Meridian Voyages%' and lost_note is null;

-- The B2C deals that were won are the trips already operating. Connecting
-- them is what makes "what did this channel actually earn" answerable.
insert into public.os_deal_trips (deal_id, trip_id)
select d.id, t.id
from public.os_orgs o
cross join lateral (values
  ('Min-Jun Park — content collaboration', 'EE-10014'),
  ('Chloe Dubois — Giza photoshoot', 'EE-10007')
) as v(deal_title, trip_ref)
join public.os_deals d on d.org_id = o.id and d.title = v.deal_title
join public.os_trips t on t.org_id = o.id and t.ref = v.trip_ref
where o.key = 'egypt-eye'
  and not exists (select 1 from public.os_deal_trips dt where dt.deal_id = d.id and dt.trip_id = t.id);

update public.os_trips t
set deal_id = d.id
from public.os_deal_trips dt
join public.os_deals d on d.id = dt.deal_id
where dt.trip_id = t.id and t.deal_id is null;

-- Trips booked by a partner carry the partner, so B2B revenue is real.
update public.os_trips t
set company_id = co.id
from public.os_orgs o
join public.os_companies co on co.org_id = o.id
where t.org_id = o.id and t.company_id is null
  and t.ref in ('EE-10003', 'EE-10011') and co.name = 'Blue Nile Collective';

-- ---------------------------------------------------------------------------
-- STAGE HISTORY — how each deal actually got where it is
-- ---------------------------------------------------------------------------
-- Written as a chain per deal so "three weeks in Negotiation" is a fact
-- rather than an impression. Only the deals whose journey is interesting.
insert into public.os_deal_stage_history (deal_id, from_stage_id, to_stage_id, from_status, to_status, changed_by, note, days_in_previous_stage, changed_at)
select d.id, fs.id, ts.id, 'open', 'open', d.owner_employee_id, v.note, v.days_in_previous, now() - make_interval(days => v.days_ago)
from public.os_orgs o
cross join lateral (values
  ('Southern Cross Journeys — 2027 volume agreement', 'prospect',   'contacted',   'b2b', 'Olivia introduced us to their commercial team.',            null, 74),
  ('Southern Cross Journeys — 2027 volume agreement', 'contacted',  'qualified',   'b2b', 'Volume confirmed at roughly 30 bookings a season.',        14,   60),
  ('Southern Cross Journeys — 2027 volume agreement', 'qualified',  'proposed',    'b2b', 'Commission ladder sent.',                                  32,   28),
  ('Southern Cross Journeys — 2027 volume agreement', 'proposed',   'negotiating', 'b2b', 'They came back asking for 18% flat from the first booking.', 16,  12),
  ('Pharos Cruises — 2027 shore excursion contract',  'qualified',  'proposed',    'b2b', 'Season rates sent for the 2027 sailing calendar.',          21,   40),
  ('Pharos Cruises — 2027 shore excursion contract',  'proposed',   'negotiating', 'b2b', 'Agreed the rate, arguing about cancellation windows.',      14,   26),
  ('Pharos Cruises — 2027 shore excursion contract',  'negotiating','contracting', 'b2b', 'Terms agreed. Agreement drafted and sent for signature.',   20,    6),
  ('Lumiere Media — documentary production support',  'prospect',   'contacted',   'b2b', 'Grace replied and described the scope.',                    2,   16),
  ('Laura Pettersen — flying dress, Wadi El Rayan',   'enquiry',    'qualified',   'b2c', 'Date, party size and budget all confirmed on the first call.', 1,   3),
  ('Laura Pettersen — flying dress, Wadi El Rayan',   'qualified',  'quoted',      'b2c', 'Two dress options priced and sent.',                        1,    2),
  ('Ricardo Alves — surprise proposal shoot',         'enquiry',    'qualified',   'b2c', 'Referral from Hannah Meyer. Qualified in one call.',        null,  6),
  ('Ricardo Alves — surprise proposal shoot',         'qualified',  'quoted',      'b2c', 'Priced with a second photographer included.',                2,    4),
  ('Ricardo Alves — surprise proposal shoot',         'quoted',     'negotiating', 'b2c', 'Asked whether the second photographer could be removed.',    1,    3),
  ('Sarah Whitfield — return trip to Luxor',          'enquiry',    'qualified',   'b2c', 'Related to an existing client. Dates still flexible.',      null,  9)
) as v(deal_title, from_key, to_key, pipeline, note, days_in_previous, days_ago)
join public.os_deals d on d.org_id = o.id and d.title = v.deal_title
left join public.os_deal_stages fs on fs.org_id = o.id and fs.pipeline = v.pipeline and fs.key = v.from_key
left join public.os_deal_stages ts on ts.org_id = o.id and ts.pipeline = v.pipeline and ts.key = v.to_key
where o.key = 'egypt-eye'
  and not exists (
    select 1 from public.os_deal_stage_history h
    where h.deal_id = d.id and h.to_stage_id = ts.id and h.note = v.note
  );


-- ---------------------------------------------------------------------------
-- QUOTES — because a deal past the quoting stage must have one
-- ---------------------------------------------------------------------------
-- The Quote sent stage refuses a deal with nothing priced attached, so seeding
-- a deal into that stage without a quote would show a state the application
-- itself forbids. These are the quotes those two deals were moved on the
-- strength of.
--
-- Each line records the rate it resolved to and the window that rate covered,
-- exactly as the application writes them, so the quote can still explain
-- itself long after the price book has moved on.
insert into public.os_quotes (
  org_id, ref, client_id, deal_id, trip_type_id, unit_id, title, tier, trip_date,
  guests_adults, guests_children, currency, cost_total, sell_total, margin_amount, margin_pct,
  valid_until, status, sent_at, notes, created_by, created_at
)
select o.id,
       'Q-' || lpad(nextval('public.os_quote_ref_seq')::text, 5, '0'),
       d.client_id, d.id, d.trip_type_id, d.unit_id,
       v.title, v.tier, d.requested_date,
       v.adults, 0, d.currency,
       v.cost, v.sell, v.sell - v.cost,
       round(((v.sell - v.cost) / nullif(v.sell, 0)) * 100, 2),
       current_date + v.valid_days, v.status,
       now() - make_interval(days => v.sent_days_ago),
       v.notes, d.owner_employee_id, now() - make_interval(days => v.sent_days_ago)
from public.os_orgs o
cross join lateral (values
  ('Laura Pettersen — flying dress, Wadi El Rayan', 'Sunrise at Wadi El Rayan, two dresses', 'standard',
   2, 268.00, 740.00, 21, 2, 'sent',
   'Two dress options priced. A sunrise start means a 04:00 pickup from Cairo, which she has agreed to.'),
  ('Ricardo Alves — surprise proposal shoot', 'Proposal shoot with a second photographer', 'premium',
   2, 610.00, 1650.00, 14, 4, 'sent',
   'Second photographer positioned at distance so she does not see it coming. He is asking whether that one can come out.')
) as v(deal_title, title, tier, adults, cost, sell, valid_days, sent_days_ago, status, notes)
join public.os_deals d on d.org_id = o.id and d.title = v.deal_title
where o.key = 'egypt-eye'
  and not exists (select 1 from public.os_quotes q where q.deal_id = d.id);

insert into public.os_quote_lines (quote_id, seq, price_item_id, rate_id, label, category, qty, unit_cost, unit_sell, currency, notes)
select q.id, v.seq, pi.id, r.id, pi.name, pi.category, v.qty,
       r.cost_amount, coalesce(r.sell_amount, round(r.cost_amount * 2.4, 2)), r.currency,
       to_char(r.valid_from, 'YYYY-MM-DD') || ' → ' || coalesce(to_char(r.valid_to, 'YYYY-MM-DD'), 'ongoing')
from public.os_orgs o
cross join lateral (values
  ('Sunrise at Wadi El Rayan, two dresses',     1, 'photographer_4h',     1),
  ('Sunrise at Wadi El Rayan, two dresses',     2, 'dress_rental',        2),
  ('Sunrise at Wadi El Rayan, two dresses',     3, 'vehicle_van7',        1),
  ('Sunrise at Wadi El Rayan, two dresses',     4, 'driver_long',         1),
  ('Sunrise at Wadi El Rayan, two dresses',     5, 'fayoum_protectorate', 2),
  ('Sunrise at Wadi El Rayan, two dresses',     6, 'editing_standard',    1),
  ('Proposal shoot with a second photographer', 1, 'photographer_4h',     1),
  ('Proposal shoot with a second photographer', 2, 'photographer_2h',     1),
  ('Proposal shoot with a second photographer', 3, 'photo_permit_giza',   2),
  ('Proposal shoot with a second photographer', 4, 'vehicle_vip',         1),
  ('Proposal shoot with a second photographer', 5, 'coordinator_day',     1),
  ('Proposal shoot with a second photographer', 6, 'editing_express',     1)
) as v(quote_title, seq, item_key, qty)
join public.os_quotes q on q.org_id = o.id and q.title = v.quote_title
join public.os_price_items pi on pi.org_id = o.id and pi.key = v.item_key
join lateral (
  select r.* from public.os_rates r
  where r.price_item_id = pi.id
    and coalesce(q.trip_date, current_date) between r.valid_from and coalesce(r.valid_to, '9999-12-31')
  order by r.valid_from desc limit 1
) r on true
where o.key = 'egypt-eye'
  and not exists (select 1 from public.os_quote_lines ql where ql.quote_id = q.id and ql.seq = v.seq);

insert into public.os_deal_quotes (deal_id, quote_id)
select q.deal_id, q.id from public.os_quotes q
where q.deal_id is not null
  and not exists (select 1 from public.os_deal_quotes dq where dq.deal_id = q.deal_id and dq.quote_id = q.id);

update public.os_deals d
set primary_quote_id = q.id
from public.os_quotes q
where q.deal_id = d.id and d.primary_quote_id is null;

-- ---------------------------------------------------------------------------
-- ENGAGEMENTS — the record that a conversation happened
-- ---------------------------------------------------------------------------
-- Not messages. What a colleague picking the relationship up on Monday needs
-- to know: who spoke to whom, when, and what came of it.
insert into public.os_engagements (org_id, kind, direction, channel, deal_id, client_id, company_id, subject, summary, outcome, happened_at, duration_minutes, employee_id, participants)
select o.id, v.kind, v.direction, v.channel, d.id, d.client_id, d.company_id,
       v.subject, v.summary, v.outcome,
       now() - make_interval(days => v.days_ago, hours => v.hours_ago),
       v.minutes, d.owner_employee_id, v.participants
from public.os_orgs o
cross join lateral (values
  ('Southern Cross Journeys — 2027 volume agreement','meeting','outbound','Video call',
   'Introduction call',
   'Olivia introduced us to their commercial director. They place roughly 30 Egypt bookings a season, mostly couples, mostly October to March. They are unhappy with their current operator''s photography.',
   'positive', 74, 2, 45, 'Olivia Bennett, commercial director'),
  ('Southern Cross Journeys — 2027 volume agreement','email','outbound','Email',
   'Commission ladder sent',
   'Sent the tiered proposal: 12% to 15 bookings, 15% to 30, 18% beyond. Explained that a flat 18% from booking one prices us below cost on the smaller trips.',
   'neutral', 28, 4, null, 'Commercial director'),
  ('Southern Cross Journeys — 2027 volume agreement','call','inbound','Phone',
   'They pushed back on the ladder',
   'They want 18% from the first booking, arguing their volume is certain. Asked them to put the 2027 forecast in writing. Left it that we will revise once we see it.',
   'neutral', 12, 6, 22, 'Commercial director'),

  ('Pharos Cruises — 2027 shore excursion contract','meeting','outbound','In person, Luxor',
   'Season planning',
   'Walked their 2027 sailing calendar with Hazem and matched our photographer availability to it. Two weeks in February are tight on our side and he knows.',
   'positive', 40, 3, 90, 'Hazem Sobhy'),
  ('Pharos Cruises — 2027 shore excursion contract','email','outbound','Email',
   'Agreement sent for signature',
   'Sent the contract. Their legal review is the only outstanding item; Hazem expects it back within two weeks.',
   'positive', 6, 1, null, 'Hazem Sobhy'),

  ('Nordic Sun Travel — restart the partnership','call','inbound','Phone',
   'Erik introduced himself',
   'New Egypt product manager, no history with us personally. Found us in their old supplier list. Wants to compare us against their current operator before committing anything.',
   'positive', 4, 5, 30, 'Erik Lindqvist'),

  ('Lumiere Media — documentary production support','email','inbound','Email',
   'Scope of the production',
   'Six episodes, three weeks of filming across Cairo, Luxor and Aswan. Permits, fixers, vehicles and a local producer. Grace is scoping only — she said plainly that the commissioner has not signed off.',
   'neutral', 16, 2, null, 'Grace Whitmore'),

  ('Meridian Voyages — exclusivity for the French market','meeting','outbound','Video call',
   'Exclusivity discussion',
   'They asked for exclusivity across France in exchange for a volume commitment they would not put a number on. We declined. Camille took it well; the ordinary booking relationship continues.',
   'negative', 45, 1, 60, 'Camille Moreau'),

  ('Ricardo Alves — surprise proposal shoot','call','outbound','WhatsApp',
   'Qualified the proposal shoot',
   'Wants a second photographer positioned at distance so she does not see it coming. Talked through the Dahshur options and where the light is at that hour.',
   'positive', 4, 1, 18, 'Ricardo Alves'),
  ('Ricardo Alves — surprise proposal shoot','message','inbound','WhatsApp',
   'Asked about dropping the second photographer',
   'Asked whether the second photographer could come out to reduce the price. Explained what it costs the result and offered to reposition rather than remove.',
   'neutral', 3, 6, null, 'Ricardo Alves'),

  ('Laura Pettersen — flying dress, Wadi El Rayan','call','outbound','Phone',
   'First call',
   'Two guests, third of October, wants sunrise. Confirmed the drive time from Cairo means a 04:00 pickup and she is fine with it.',
   'positive', 3, 2, 18, 'Laura Pettersen'),
  ('Laura Pettersen — flying dress, Wadi El Rayan','proposal_sent','outbound','Email',
   'Quote sent',
   'Two dress options priced. Included the sunrise timing and the pickup time so there are no surprises.',
   'neutral', 2, 4, null, 'Laura Pettersen'),

  ('Sarah Whitfield — return trip to Luxor','email','outbound','Email',
   'First reply',
   'Sent an outline of a three-day Luxor itinerary and asked which month they are aiming at. No answer since.',
   'no_answer', 9, 2, null, 'Sarah Whitfield'),

  ('Yuki Tanaka — Luxor extension','call','outbound','Phone',
   'Lost on price',
   'She was straightforward about it: a Luxor operator quoted roughly 30% under us. We did not match it and said so. She is still happy with the trips she has taken.',
   'negative', 2, 5, 12, 'Yuki Tanaka')
) as v(deal_title, kind, direction, channel, subject, summary, outcome, days_ago, hours_ago, minutes, participants)
join public.os_deals d on d.org_id = o.id and d.title = v.deal_title
where o.key = 'egypt-eye'
  and not exists (
    select 1 from public.os_engagements en where en.deal_id = d.id and en.summary = v.summary
  );

-- Contact freshness, from what was actually logged. This is what the
-- relationship health score reads, so it is never a typed-in impression.
update public.os_companies co
set last_contact_at = latest.at
from (
  select company_id, max(happened_at) as at
  from public.os_engagements where company_id is not null group by company_id
) latest
where latest.company_id = co.id
  and (co.last_contact_at is null or co.last_contact_at < latest.at);

update public.os_clients c
set last_contact_at = latest.at
from (
  select client_id, max(happened_at) as at
  from public.os_engagements where client_id is not null group by client_id
) latest
where latest.client_id = c.id and c.last_contact_at is null;

-- ---------------------------------------------------------------------------
-- AGREEMENTS
-- ---------------------------------------------------------------------------
insert into public.os_agreements (
  org_id, ref, company_id, deal_id, title, kind, status, starts_on, ends_on,
  auto_renew, notice_days, currency, minimum_trips_per_year, minimum_revenue_amount,
  signed_on, signed_by_name, signed_by_employee_id, notes, created_by, created_at
)
select o.id,
       'AG-' || lpad(nextval('public.os_agreement_ref_seq')::text, 4, '0'),
       co.id, d.id, v.title, v.kind, v.status,
       current_date - v.starts_days_ago,
       case when v.ends_in_days is null then null else current_date + v.ends_in_days end,
       v.auto_renew, v.notice_days, v.currency, v.min_trips, v.min_revenue,
       case when v.signed_days_ago is null then null else current_date - v.signed_days_ago end,
       v.signed_by, signer.id, v.notes, signer.id, now() - make_interval(days => v.created_days_ago)
from public.os_orgs o
cross join lateral (values
  ('Blue Nile Collective', null, 'Blue Nile Collective — trade agreement 2026/27', 'commission', 'active',
   400, 330, true, 60, 'USD', 40, 60000, 400, 'Rebecca Hale',
   'Our largest trade agreement. Commission stepped up this year in exchange for the volume commitment below.', 405),
  ('Aurora Weddings', 'Aurora Weddings — preferred supplier renewal', 'Aurora Weddings — preferred supplier 2026/27', 'commission', 'active',
   30, 335, true, 30, 'USD', 8, 24000, 30, 'Danielle Ortiz',
   'Renewed for a second year. Small numbers, very high value per booking, and delivery inside seven days is written in.', 34),
  ('Pharos Cruises', 'Pharos Cruises — 2027 shore excursion contract', 'Pharos Cruises — shore excursions 2027', 'net_rate', 'sent',
   0, 400, false, 30, 'USD', 60, null, null, null,
   'Drafted and with their legal team. Net rates rather than commission, because they resell at their own price.', 6),
  ('Cairo Grand Hotel', null, 'Cairo Grand Hotel — concierge referral', 'referral', 'active',
   200, 165, true, 14, 'USD', null, null, 200, 'Nadia Fahim',
   'One page. Ten percent on anything the concierge desk sends us, paid monthly.', 202),
  ('Meridian Voyages', null, 'Meridian Voyages — trade agreement', 'commission', 'active',
   290, 75, false, 30, 'EUR', 20, 30000, 290, 'Camille Moreau',
   'Expires in under three months and they are on credit hold. Renewal is a real decision, not a formality.', 292),
  ('Nordic Sun Travel', null, 'Nordic Sun Travel — trade agreement 2024', 'commission', 'expired',
   640, -270, false, 30, 'EUR', 15, null, 640, 'Their previous product manager',
   'Lapsed when their product manager left. Kept because the terms it carried are what the new conversation starts from.', 645)
) as v(company_name, deal_title, title, kind, status, starts_days_ago, ends_in_days, auto_renew,
       notice_days, currency, min_trips, min_revenue, signed_days_ago, signed_by, notes, created_days_ago)
join public.os_companies co on co.org_id = o.id and co.name = v.company_name
left join public.os_deals d on d.org_id = o.id and d.title = v.deal_title
left join public.os_employees signer on signer.org_id = o.id and signer.code = 'EE-001'
where o.key = 'egypt-eye'
  and not exists (select 1 from public.os_agreements a where a.org_id = o.id and a.title = v.title);

-- ---------------------------------------------------------------------------
-- TERMS — effective-dated, superseded, never overwritten
-- ---------------------------------------------------------------------------
-- Blue Nile's commission moved from 12% to 15% partway through the year.
-- Both rows exist. A trip that ran before the change still resolves 12%,
-- which is what makes a commission statement from last spring defensible.
insert into public.os_agreement_terms (agreement_id, trip_type_id, tier, basis, commission_pct, net_amount, currency, min_guests, effective_from, effective_to, note, created_by)
select a.id, tt.id, v.tier, v.basis, v.commission_pct, v.net_amount, v.currency, v.min_guests,
       current_date - v.from_days_ago,
       case when v.to_days_ago is null then null else current_date - v.to_days_ago end,
       v.note, a.created_by
from public.os_orgs o
cross join lateral (values
  ('Blue Nile Collective — trade agreement 2026/27', null, null, 'commission_pct', 12.00, null, 'USD', null,
   400, 121, 'Opening rate for the 2026/27 agreement.'),
  ('Blue Nile Collective — trade agreement 2026/27', null, null, 'commission_pct', 15.00, null, 'USD', null,
   120, null, 'Increased to 15% in exchange for the 40-booking annual commitment. The 12% window above is closed, not deleted.'),
  ('Blue Nile Collective — trade agreement 2026/27', 'photoshoot', null, 'commission_pct', 18.00, null, 'USD', null,
   120, null, 'Photoshoots carry a higher commission because they are the product they are best at selling.'),
  ('Aurora Weddings — preferred supplier 2026/27', null, null, 'commission_pct', 18.00, null, 'USD', null,
   30, null, 'Flat across everything. Their bookings are few and large.'),
  ('Pharos Cruises — shore excursions 2027', 'photoshoot', 'standard', 'net_rate', null, 240.00, 'USD', 2,
   0, null, 'Net rate per shore excursion group. They resell at whatever they choose.'),
  ('Cairo Grand Hotel — concierge referral', null, null, 'commission_pct', 10.00, null, 'USD', null,
   200, null, 'Ten percent on anything the desk sends, paid monthly.'),
  ('Meridian Voyages — trade agreement', null, null, 'commission_pct', 12.00, null, 'EUR', null,
   290, null, 'Unchanged since signature.'),
  ('Nordic Sun Travel — trade agreement 2024', null, null, 'commission_pct', 12.00, null, 'EUR', null,
   640, 270, 'The terms the lapsed agreement carried. Kept because the new conversation starts from them.')
) as v(agreement_title, type_key, tier, basis, commission_pct, net_amount, currency, min_guests, from_days_ago, to_days_ago, note)
join public.os_agreements a on a.org_id = o.id and a.title = v.agreement_title
left join public.os_trip_types tt on tt.org_id = o.id and tt.key = v.type_key
where o.key = 'egypt-eye'
  -- Matched on the term's NATURAL key — the agreement, the service and the
  -- tier it covers — never on the computed date. The dates here are relative
  -- to current_date, so re-running this migration on a later day would
  -- otherwise compute a different effective_from, miss the row it already
  -- created, and insert a second term overlapping the first. The exclusion
  -- constraint would catch it, but a migration that only re-runs cleanly on
  -- the day it was first applied is not idempotent.
  and not exists (
    select 1 from public.os_agreement_terms t
    where t.agreement_id = a.id
      and coalesce(t.trip_type_id::text, '-') = coalesce(tt.id::text, '-')
      and coalesce(t.tier, '-') = coalesce(v.tier, '-')
      and t.basis = v.basis
  );

-- The 15% term supersedes the 12% one. Pointing at it is what lets the
-- screen show "replaced the 12% rate that ran until <date>" rather than
-- leaving two rows and no story.
update public.os_agreement_terms new_term
set supersedes_term_id = old_term.id
from public.os_agreement_terms old_term
join public.os_agreements a on a.id = old_term.agreement_id
where new_term.agreement_id = old_term.agreement_id
  and a.title = 'Blue Nile Collective — trade agreement 2026/27'
  and new_term.commission_pct = 15.00 and old_term.commission_pct = 12.00
  and new_term.trip_type_id is null and old_term.trip_type_id is null
  and new_term.supersedes_term_id is null;

-- Live trips booked through Blue Nile carry the agreement that priced them.
update public.os_trips t
set agreement_id = a.id,
    commission_pct = 15.00,
    commission_amount = round(coalesce(t.sell_amount, 0) * 0.15, 2)
from public.os_agreements a
where a.company_id = t.company_id
  and a.status = 'active'
  and t.agreement_id is null
  and t.company_id is not null;

-- ---------------------------------------------------------------------------
-- ATTRIBUTION — a snapshot of where finished revenue came from
-- ---------------------------------------------------------------------------
-- Written once per completed trip, from what was true at the time. It is a
-- snapshot rather than a view so that editing a client record today cannot
-- silently rewrite where last spring's revenue came from.
insert into public.os_revenue_attribution (
  org_id, trip_id, deal_id, lead_id, client_id, company_id, channel, campaign,
  referred_by_client_id, owner_employee_id, revenue_amount, commission_amount, currency, recognised_on
)
select t.org_id, t.id, t.deal_id, null, t.client_id, t.company_id,
       coalesce(t.source, 'Unknown'), null, c.referred_by_client_id,
       coalesce(c.owner_employee_id, t.created_by),
       coalesce(t.sell_amount, 0), coalesce(t.commission_amount, 0), t.currency, t.trip_date
from public.os_trips t
left join public.os_clients c on c.id = t.client_id
where t.status in ('completed', 'content_pending', 'closed')
  and not exists (select 1 from public.os_revenue_attribution ra where ra.trip_id = t.id);

-- ---------------------------------------------------------------------------
-- LIFETIME FIGURES — derived, never typed
-- ---------------------------------------------------------------------------
update public.os_clients c
set lifetime_trips = totals.trips,
    lifetime_revenue_amount = totals.revenue,
    lifecycle = case
      when c.lifecycle = 'do_not_contact' then c.lifecycle
      when totals.trips >= 2 then 'repeat'
      when totals.trips = 1 then 'customer'
      else c.lifecycle
    end
from (
  select client_id, count(*) as trips, coalesce(sum(sell_amount), 0) as revenue
  from public.os_trips
  where client_id is not null and status in ('completed', 'content_pending', 'closed')
  group by client_id
) totals
where totals.client_id = c.id;

update public.os_companies co
set lifetime_trips = totals.trips,
    lifetime_revenue_amount = totals.revenue,
    first_deal_on = totals.first_trip,
    last_deal_on = totals.last_trip
from (
  select company_id, count(*) as trips, coalesce(sum(sell_amount), 0) as revenue,
         min(trip_date) as first_trip, max(trip_date) as last_trip
  from public.os_trips where company_id is not null group by company_id
) totals
where totals.company_id = co.id;
