-- ===========================================================================
-- EGYPT EYE OS — COMMERCIAL CONFIGURATION
-- Permissions, roles, pipelines, stages, lost reasons and scoring rules
-- ===========================================================================
--
-- Configuration the commercial layer needs in order to run. No demo records
-- here — those are in 0024, which a production project can skip entirely.
--
-- The two pipelines are the two workspaces. They are rows in os_deal_stages,
-- not two applications: the same deal table, the same tasks, the same
-- approvals and the same audit log stand behind both, which is what makes
-- "this B2C guest turns out to run an agency" a re-point rather than a
-- re-entry.
--
-- Safe to re-run.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- THE COMMERCIAL PERMISSION VOCABULARY
-- ---------------------------------------------------------------------------
-- Split finely on purpose. The two lines that matter most:
--
--   deals.value      — what a deal is worth and what the pipeline forecasts.
--                      A reservations executive works their own deals every
--                      day without needing the company's forecast.
--   companies.terms  — commission and net rates. This is the number a
--                      competitor would most like to have, and it is a
--                      different question from "may I see this agency".
-- ---------------------------------------------------------------------------
insert into public.os_permissions (key, module, action, label, description, sensitive, scopeable, sort_order) values
  ('leads.view',        'commercial', 'view',    'View leads', 'See enquiries that have arrived and what happened to them.', false, true, 300),
  ('leads.create',      'commercial', 'create',  'Log a lead', 'Record an enquiry that arrived by any channel.', false, false, 301),
  ('leads.edit',        'commercial', 'edit',    'Work leads', 'Qualify, update and close enquiries.', false, true, 302),
  ('leads.assign',      'commercial', 'assign',  'Assign leads', 'Hand an enquiry to a colleague.', false, true, 303),

  ('deals.view',        'commercial', 'view',    'View deals', 'See opportunities in the pipeline.', false, true, 310),
  ('deals.create',      'commercial', 'create',  'Create deals', 'Open an opportunity from a qualified enquiry or directly.', false, false, 311),
  ('deals.edit',        'commercial', 'edit',    'Edit deals', 'Change the detail, next step and expected close of a deal.', false, true, 312),
  ('deals.stage',       'commercial', 'stage',   'Move deals through the pipeline', 'Advance or return a deal between stages.', false, true, 313),
  ('deals.value',       'commercial', 'value',   'See deal value and forecast', 'Deal amounts, weighted pipeline and the forecast.', true, true, 314),
  ('deals.close',       'commercial', 'close',   'Close deals', 'Mark a deal won or lost, with a reason.', false, true, 315),
  ('deals.assign',      'commercial', 'assign',  'Assign deals', 'Change who owns an opportunity.', false, true, 316),
  ('deals.convert',     'commercial', 'convert', 'Turn a won deal into a trip', 'Hand a closed deal to the operation.', false, true, 317),

  ('companies.view',    'commercial', 'view',    'View partner companies', 'Agencies, operators, hotels and corporate partners.', false, true, 320),
  ('companies.create',  'commercial', 'create',  'Register a partner', 'Add a company to the partner book.', false, false, 321),
  ('companies.edit',    'commercial', 'edit',    'Edit partners', 'Maintain company detail, contacts and ownership.', false, true, 322),
  ('companies.terms',   'commercial', 'terms',   'See and set commercial terms', 'Commission percentages, net rates and payment terms.', true, true, 323),
  ('companies.credit',  'commercial', 'credit',  'Set credit limits and holds', 'Decide how much a partner may owe before bookings stop.', true, false, 324),

  ('agreements.view',   'commercial', 'view',    'View agreements', 'Contracts with partners and the terms in force.', false, true, 330),
  ('agreements.create', 'commercial', 'create',  'Draft agreements', 'Prepare a contract for a partner.', false, false, 331),
  ('agreements.edit',   'commercial', 'edit',    'Edit agreements', 'Change a draft and supersede terms.', false, true, 332),
  ('agreements.activate','commercial','activate', 'Activate and terminate agreements', 'Put a contract into force, or end one.', true, false, 333),

  ('engagements.view',  'commercial', 'view',    'View the conversation history', 'Calls, meetings and messages logged against a relationship.', false, true, 340),
  ('engagements.log',   'commercial', 'log',     'Log contact', 'Record a call, meeting or message that happened.', false, false, 341),

  ('commercial.discount','commercial','discount','Propose a discount', 'Offer a price below the standard rate, subject to approval.', false, false, 350),
  ('commercial.analytics','commercial','analytics','Commercial reporting', 'Pipeline, conversion, source performance and partner revenue.', true, true, 351),
  ('commercial.export', 'commercial', 'export',  'Export commercial data', 'Download leads, deals and partner data as CSV.', true, true, 352)
on conflict (key) do update set
  module = excluded.module, action = excluded.action, label = excluded.label,
  description = excluded.description, sensitive = excluded.sensitive,
  scopeable = excluded.scopeable, sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- TWO NEW ROLES
-- ---------------------------------------------------------------------------
-- Reservations already existed and owns B2C. These two own the B2B side.
-- Ranked below Management and above the field roles, so neither can grant
-- itself anything, and Partnerships Manager outranks Sales because signing a
-- contract is a different kind of authority from negotiating one.
insert into public.os_roles (org_id, key, name, description, is_system, rank, color)
select o.id, v.key, v.name, v.description, true, v.rank, v.color
from public.os_orgs o,
(values
  ('partnerships_manager', 'Partnerships Manager',
   'Owns the B2B relationship book: partners, agreements, commercial terms and the B2B pipeline. Signs contracts.',
   35, '#5c7a5f'),
  ('sales', 'Sales',
   'Works the B2B pipeline: prospects, deals, proposals and follow-up. Negotiates terms but does not put them into force.',
   45, '#8c6d1f')
) as v(key, name, description, rank, color)
where o.key = 'egypt-eye'
on conflict (org_id, key) do nothing;

-- ---------------------------------------------------------------------------
-- WHO GETS WHAT
-- ---------------------------------------------------------------------------
do $$
begin
  -- Owner and Administrator pick up every permission in the catalog,
  -- including the ones added above.
  perform public.os_grant_everything('owner');
  perform public.os_grant_everything('admin');

  -- MANAGEMENT — sees the whole commercial picture and decides, but does not
  -- work the pipeline day to day.
  perform public.os_grant('management', 'all',
    'leads.view','leads.edit','leads.assign',
    'deals.view','deals.edit','deals.stage','deals.value','deals.close','deals.assign','deals.convert',
    'companies.view','companies.edit','companies.terms','companies.credit',
    'agreements.view','agreements.edit','agreements.activate',
    'engagements.view','engagements.log',
    'commercial.discount','commercial.analytics','commercial.export');

  -- PARTNERSHIPS MANAGER — the B2B book end to end, including the terms and
  -- the signature. No trip financials: what a specific trip cost to run is
  -- operations' and finance's business, not the relationship owner's.
  perform public.os_grant('partnerships_manager', 'all',
    'leads.view','leads.create','leads.edit','leads.assign',
    'deals.view','deals.create','deals.edit','deals.stage','deals.value','deals.close','deals.assign','deals.convert',
    'companies.view','companies.create','companies.edit','companies.terms','companies.credit',
    'agreements.view','agreements.create','agreements.edit','agreements.activate',
    'engagements.view','engagements.log',
    'commercial.discount','commercial.analytics','commercial.export',
    'clients.view','clients.contact','clients.create','clients.edit',
    'trips.view','quality.review','feedback.view',
    'tasks.view','tasks.create','tasks.edit','tasks.assign',
    'approvals.view','approvals.request','approvals.decide',
    'pricing.view','pricing.calculate',
    'knowledge.view','calendar.view','events.view','chat.view','chat.post',
    'attendance.self','analytics.view','ai.ask');

  -- SALES — works the pipeline. Sees the terms in force so a proposal is
  -- accurate, and may DRAFT an agreement, but activating one is somebody
  -- else's signature. Deal value is scoped to their own deals: a salesperson
  -- needs their own numbers, not the company forecast.
  perform public.os_grant('sales', 'all',
    'leads.view','leads.create','leads.edit',
    'deals.view','deals.create','deals.edit','deals.stage',
    'companies.view','companies.create','companies.edit','companies.terms',
    'agreements.view','agreements.create','agreements.edit',
    'engagements.view','engagements.log',
    'commercial.discount',
    'clients.view','clients.contact','clients.create','clients.edit',
    'pricing.view','pricing.calculate',
    'tasks.view','tasks.create','tasks.edit',
    'approvals.view','approvals.request',
    'knowledge.view','calendar.view','events.view','chat.view','chat.post',
    'attendance.self','ai.ask');
  perform public.os_grant('sales', 'own',
    'deals.value','deals.close','deals.assign','deals.convert','leads.assign','trips.view','commercial.analytics');

  -- RESERVATIONS — owns B2C. Same shape, opposite pipeline: they qualify
  -- enquiries, quote, close and hand the result to operations. They see the
  -- terms of an agency they are booking under, because quoting an agency
  -- booking without the commission is quoting the wrong number.
  perform public.os_grant('reservation', 'all',
    'leads.view','leads.create','leads.edit','leads.assign',
    'deals.view','deals.create','deals.edit','deals.stage','deals.close','deals.convert',
    'companies.view','companies.terms',
    'agreements.view',
    'engagements.view','engagements.log',
    'commercial.discount');
  perform public.os_grant('reservation', 'own', 'deals.value','deals.assign','commercial.analytics');

  -- OPERATIONS MANAGER — reads the commercial layer because tomorrow's
  -- staffing depends on what sales just closed, and logs contact when a
  -- partner calls about a live trip. Does not work the pipeline.
  perform public.os_grant('operations_manager', 'all',
    'leads.view','deals.view','deals.convert',
    'companies.view','agreements.view','engagements.view','engagements.log');

  -- OPERATIONS — needs to know which agency a trip belongs to, and nothing
  -- commercial beyond that. No deal values, no terms.
  perform public.os_grant('operations', 'all', 'companies.view','deals.view','engagements.view');

  -- FINANCE — commission is a payable, so finance must see the terms that
  -- created it and the agreements behind them. No pipeline editing.
  perform public.os_grant('finance', 'all',
    'companies.view','companies.terms','companies.credit',
    'agreements.view','deals.view','deals.value',
    'commercial.analytics','commercial.export','engagements.view');

  -- COORDINATOR — sees which partner a trip is for, so the greeting on the
  -- day is right. Nothing more.
  perform public.os_grant('coordinator', 'all', 'companies.view');
  perform public.os_grant('coordinator', 'own', 'deals.view');
end $$;

-- ---------------------------------------------------------------------------
-- THE B2C PIPELINE — Reservations
-- ---------------------------------------------------------------------------
-- Short, because a photoshoot enquiry either becomes a booking within days
-- or it does not. `requirements` is what the application checks before
-- letting a deal leave the stage, and it names the blocker rather than
-- refusing silently.
insert into public.os_deal_stages (org_id, pipeline, key, label, description, category, color, sort_order, probability_pct, stale_after_days, requirements)
select o.id, 'b2c', v.key, v.label, v.description, v.category, v.color, v.sort_order, v.probability, v.stale, v.requirements::jsonb
from public.os_orgs o,
(values
  ('enquiry',    'Enquiry',            'Somebody has asked. Nobody has answered yet.',                                'new',        '#7c8a91', 1,   10, 1,  '{}'),
  ('qualified',  'Qualified',          'We know what they want, when, for how many, and roughly what they will spend.','qualifying', '#4a7c8c', 2,   25, 3,  '{"contact":true,"interest":true}'),
  ('quoted',     'Quote sent',         'A priced proposal is with them.',                                             'proposing',  '#c9a227', 3,   45, 4,  '{"quote":true,"date":true}'),
  ('negotiating','Negotiating',        'They have come back. Dates, price or inclusions are moving.',                  'negotiating','#d97706', 4,   65, 5,  '{"quote":true}'),
  ('holding',    'Holding for payment','Agreed, waiting on the deposit.',                                             'negotiating','#8c6d1f', 5,   85, 3,  '{"quote":true,"date":true}'),
  ('won',        'Booked',             'Paid or confirmed. This becomes a trip.',                                     'won',        '#5c7a5f', 6,  100, null,'{"date":true,"value":true}'),
  ('lost',       'Lost',               'Did not happen, with the reason kept.',                                       'lost',       '#b91c1c', 7,    0, null,'{"lost_reason":true}')
) as v(key, label, description, category, color, sort_order, probability, stale, requirements)
where o.key = 'egypt-eye'
on conflict (org_id, pipeline, key) do nothing;

-- ---------------------------------------------------------------------------
-- THE B2B PIPELINE — Sales and Partnerships
-- ---------------------------------------------------------------------------
-- Longer and slower, because it ends in a contract rather than a booking,
-- and because the stage that actually kills B2B deals — nobody with
-- authority ever joined the conversation — deserves to be visible.
insert into public.os_deal_stages (org_id, pipeline, key, label, description, category, color, sort_order, probability_pct, stale_after_days, requirements)
select o.id, 'b2b', v.key, v.label, v.description, v.category, v.color, v.sort_order, v.probability, v.stale, v.requirements::jsonb
from public.os_orgs o,
(values
  ('prospect',   'Prospect',        'Identified as worth approaching. No conversation yet.',                          'new',        '#7c8a91', 1,   5,  14, '{"company":true}'),
  ('contacted',  'In conversation', 'Someone at the company is talking to us.',                                       'qualifying', '#4a7c8c', 2,  15,  14, '{"company":true,"engagement":true}'),
  ('qualified',  'Qualified',       'We know their volume, their markets and who signs.',                             'qualifying', '#4a7c8c', 3,  30,  21, '{"decision_maker":true,"engagement":true}'),
  ('proposed',   'Proposal sent',   'Rates and terms are with them.',                                                 'proposing',  '#c9a227', 4,  45,  14, '{"quote_or_terms":true}'),
  ('negotiating','Negotiating terms','Commission, exclusivity or volume commitments are being argued.',               'negotiating','#d97706', 5,  60,  21, '{"quote_or_terms":true,"decision_maker":true}'),
  ('contracting','Contract out',    'An agreement is drafted and awaiting signature.',                                'negotiating','#8c6d1f', 6,  80,  14, '{"agreement":true}'),
  ('won',        'Signed',          'Agreement in force. The partnership is live.',                                   'won',        '#5c7a5f', 7, 100, null,'{"agreement_active":true}'),
  ('lost',       'Lost',            'Did not happen, with the reason kept.',                                          'lost',       '#b91c1c', 8,   0, null,'{"lost_reason":true}')
) as v(key, label, description, category, color, sort_order, probability, stale, requirements)
where o.key = 'egypt-eye'
on conflict (org_id, pipeline, key) do nothing;

-- ---------------------------------------------------------------------------
-- WHY DEALS ARE LOST
-- ---------------------------------------------------------------------------
-- `controllable` is the entire point of the field. A quarter lost to price
-- is a pricing problem; a quarter lost to cancelled travel is weather. Any
-- list that mixes the two teaches nothing.
insert into public.os_lost_reasons (org_id, key, label, controllable, pipeline, sort_order)
select o.id, v.key, v.label, v.controllable, v.pipeline, v.sort_order
from public.os_orgs o,
(values
  ('price',              'Too expensive',                          true,  null,  1),
  ('competitor',         'Went with a competitor',                 true,  null,  2),
  ('slow_response',      'We were too slow to reply',              true,  null,  3),
  ('availability',       'We could not do the date',               true,  null,  4),
  ('scope',              'We do not offer what they wanted',       true,  null,  5),
  ('trust',              'Not convinced by us',                    true,  null,  6),
  ('no_response',        'Went quiet',                             false, null,  7),
  ('travel_cancelled',   'Their trip was cancelled',               false, null,  8),
  ('budget_cut',         'Their budget disappeared',               false, null,  9),
  ('not_qualified',      'Never a real opportunity',               false, null, 10),
  ('terms',              'Could not agree commercial terms',       true,  'b2b', 11),
  ('exclusivity',        'Wanted exclusivity we would not give',   true,  'b2b', 12),
  ('no_decision_maker',  'Never reached anybody who could decide', true,  'b2b', 13),
  ('existing_contract',  'Locked into another operator',           false, 'b2b', 14)
) as v(key, label, controllable, pipeline, sort_order)
where o.key = 'egypt-eye'
on conflict (org_id, key) do nothing;

-- ---------------------------------------------------------------------------
-- LEAD SCORING — every point is a published, arguable rule
-- ---------------------------------------------------------------------------
-- There is no model here and no hidden weighting. A lead's score is the sum
-- of the rules below that matched it, and the application shows the matching
-- rules with their points and this exact explanation text beside the number.
-- `explanation` is NOT NULL and a rule with an empty one does not run,
-- because a contribution nobody can question is a contribution nobody should
-- trust.
--
-- Change a number here and every lead is rescored against the new published
-- rules — which is what makes this a company decision rather than a
-- developer's opinion baked into code.
insert into public.os_lead_score_rules (org_id, key, label, explanation, points, pipeline, sort_order)
select o.id, v.key, v.label, v.explanation, v.points, v.pipeline, v.sort_order
from public.os_orgs o,
(values
  ('has_date',          'Has a specific date',
   'They named a date rather than "sometime". People who have booked flights convert far more often than people who are dreaming.',
   15, null, 1),
  ('date_soon',         'Travelling within 60 days',
   'Near dates mean the trip is real and already being paid for.',
   10, null, 2),
  ('has_budget',        'Stated a budget',
   'Naming a number means they have thought about cost and are not about to be shocked by the quote.',
   12, null, 3),
  ('budget_above_average','Budget above our average booking',
   'Worth answering first, because the same hour of work is worth more here.',
   8, 'b2c', 4),
  ('group_size',        'Four or more guests',
   'Larger parties are worth more and are much less likely to be idly browsing.',
   8, 'b2c', 5),
  ('referral',          'Referred by a past client or partner',
   'Referred enquiries convert at roughly twice the rate of cold ones and almost never haggle.',
   18, null, 6),
  ('repeat_customer',   'Has travelled with us before',
   'They already know what they are buying and who they are buying it from.',
   20, null, 7),
  ('reachable',         'Gave a phone or WhatsApp number',
   'A number can be answered in five minutes. An email address usually cannot.',
   6, null, 8),
  ('detailed_message',  'Wrote a detailed message',
   'Effort spent writing to us is effort they will not spend writing to three competitors.',
   5, null, 9),
  ('known_agency',      'Works for a company already in our partner book',
   'A warm relationship exists even if this person is new to us.',
   15, 'b2b', 10),
  ('agency_volume',     'Sends volume in our markets',
   'Stated volume is the single thing that decides whether a partnership is worth the paperwork.',
   20, 'b2b', 11),
  ('decision_maker',    'The person writing can decide',
   'B2B deals die when nobody with authority ever joins. Starting with one is worth a great deal.',
   15, 'b2b', 12),
  ('answered_fast',     'We replied within an hour',
   'Our own response time. It belongs in the score because it is the one factor we control.',
   10, null, 13),
  ('no_contact_detail', 'No usable way to reply',
   'An enquiry we cannot answer is not an opportunity, whatever else it says.',
   -25, null, 14),
  ('vague',             'No date, no budget, no party size',
   'Nothing to quote against. Worth answering, not worth prioritising.',
   -10, null, 15),
  ('out_of_scope',      'Asking for something we do not sell',
   'Better referred onward than worked.',
   -20, null, 16)
) as v(key, label, explanation, points, pipeline, sort_order)
where o.key = 'egypt-eye'
on conflict (org_id, key) do nothing;

-- ---------------------------------------------------------------------------
-- SETTINGS the commercial layer reads
-- ---------------------------------------------------------------------------
insert into public.os_settings (org_id, key, value, description)
select o.id, v.key, v.value::jsonb, v.description
from public.os_orgs o,
(values
  ('commercial.first_response_target_minutes', '60',
   'How quickly an enquiry should get a first human reply. Missing it is shown on the lead, and it is a scored factor.'),
  ('commercial.lead_stale_after_hours', '48',
   'An unanswered enquiry older than this is surfaced as overdue.'),
  ('commercial.discount_approval_pct', '10',
   'A discount at or beyond this percentage of the standard price needs an approval before the quote can be sent.'),
  ('commercial.average_booking_value', '900',
   'Used by the "budget above our average" scoring rule. In the org base currency.'),
  ('commercial.forecast_horizon_days', '90',
   'How far ahead the weighted pipeline forecast looks.'),
  ('commercial.b2b_review_months', '6',
   'How often an active partnership should be reviewed. Overdue reviews appear on the partner list.')
) as v(key, value, description)
where o.key = 'egypt-eye'
on conflict (org_id, key) do nothing;

-- ---------------------------------------------------------------------------
-- AUTOMATIONS the commercial layer runs
-- ---------------------------------------------------------------------------
-- Registered here so they appear in the Admin Centre alongside every other
-- rule, with the same honesty about which ones actually run today.
insert into public.os_automations (org_id, key, name, description, trigger_event, condition, actions, active, implemented)
select o.id, v.key, v.name, v.description, v.trigger_event, v.condition::jsonb, v.actions::jsonb, true, v.implemented
from public.os_orgs o,
(values
  ('lead_first_response_watch', 'Flag enquiries going unanswered',
   'Raises a notification for the owner and the reservations lead when an enquiry passes the first-response target.',
   'sweep', '{"setting":"commercial.first_response_target_minutes"}', '[{"kind":"notify","to":"owner_and_role","role":"reservation"}]', true),
  ('deal_stale_watch', 'Flag deals that have stopped moving',
   'Uses the stale_after_days on each pipeline stage. A deal sitting past it appears on the owner''s list.',
   'sweep', '{}', '[{"kind":"notify","to":"owner"}]', true),
  ('agreement_expiry_watch', 'Warn before an agreement expires',
   'Notifies the partnership owner 60 days before an active agreement ends, so a renewal is a conversation rather than a scramble.',
   'sweep', '{"days_before":60}', '[{"kind":"notify","to":"owner"}]', true),
  ('deal_won_creates_trip', 'Prompt to turn a won booking into a trip',
   'When a B2C deal is marked booked, a task is raised to create the trip. Deliberately a prompt, not an automatic creation — the operation decides what it is taking on.',
   'deal.won', '{"pipeline":"b2c"}', '[{"kind":"task","title":"Create the trip for this booking"}]', true),
  ('partner_review_due', 'Schedule the partnership review',
   'Raises a review task on the cadence in commercial.b2b_review_months.',
   'sweep', '{"setting":"commercial.b2b_review_months"}', '[{"kind":"task","title":"Partnership review"}]', true)
) as v(key, name, description, trigger_event, condition, actions, implemented)
where o.key = 'egypt-eye'
on conflict (org_id, key) do nothing;

-- ---------------------------------------------------------------------------
-- APPROVAL RULES for commercial decisions
-- ---------------------------------------------------------------------------
insert into public.os_approval_rules (org_id, key, name, kind, condition, approver_role_key, escalate_after_hours, escalate_to_role_key, active)
select o.id, v.key, v.name, v.kind, v.condition::jsonb, v.approver, v.escalate_hours, v.escalate_to, true
from public.os_orgs o,
(values
  -- A quote priced below the standard rate by more than the configured
  -- percentage cannot be sent until somebody decides.
  ('commercial_discount', 'Discount beyond the standard rate', 'discount',
   '{"setting":"commercial.discount_approval_pct"}', 'management', 8, 'owner'),
  -- A commission above what the partner tier normally carries is a margin
  -- decision, not a sales one.
  ('commercial_terms', 'Commission above the standard band', 'special_request',
   '{"commission_pct_gt": 15}', 'management', 24, 'owner'),
  -- A partner past their credit limit cannot have another deal marked won
  -- without somebody accepting the exposure.
  ('commercial_credit', 'Booking for a partner over their credit limit', 'special_request',
   '{"credit_exceeded": true}', 'management', 12, 'owner')
) as v(key, name, kind, condition, approver, escalate_hours, escalate_to)
where o.key = 'egypt-eye'
on conflict (org_id, key) do nothing;
