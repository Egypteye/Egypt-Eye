-- ===========================================================================
-- EGYPT EYE OS — permission catalog, system roles and base configuration
-- ===========================================================================
--
-- Everything in this file is CONFIGURATION the OS needs in order to run at
-- all: the vocabulary of permissions, the roles that ship with the product,
-- the organization, its business units, trip statuses, trip types,
-- currencies and pricing tiers.
--
-- Demo/sample records (people, clients, trips) are NOT here — they live in
-- 0020_egypt_eye_os_demo.sql, which is optional and can be skipped entirely
-- on a production project.
--
-- Safe to re-run. Configuration rows are upserted by their natural key, so
-- re-running restores anything an administrator deleted by accident without
-- clobbering deliberate edits to labels/colors (those use DO NOTHING).
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- The organization
-- ---------------------------------------------------------------------------
insert into public.os_orgs (key, name, legal_name, base_currency, timezone)
values ('egypt-eye', 'Egypt Eye', 'Egypt Eye Travel and Tours', 'USD', 'Africa/Cairo')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- Currencies. Rates are added separately (os_fx_rates) and never overwritten.
-- ---------------------------------------------------------------------------
insert into public.os_currencies (code, name, symbol, decimals, sort_order) values
  ('USD', 'US Dollar', '$', 2, 1),
  ('EUR', 'Euro', '€', 2, 2),
  ('GBP', 'British Pound', '£', 2, 3),
  ('EGP', 'Egyptian Pound', 'E£', 2, 4),
  ('JPY', 'Japanese Yen', '¥', 0, 5),
  ('KRW', 'South Korean Won', '₩', 0, 6),
  ('AED', 'UAE Dirham', 'AED', 2, 7),
  ('SAR', 'Saudi Riyal', 'SAR', 2, 8),
  ('CAD', 'Canadian Dollar', 'C$', 2, 9),
  ('AUD', 'Australian Dollar', 'A$', 2, 10)
on conflict (code) do nothing;

-- ---------------------------------------------------------------------------
-- THE PERMISSION CATALOG
-- ---------------------------------------------------------------------------
-- Every access decision anywhere in the OS resolves to one of these keys.
-- Nothing in the application invents a permission string at runtime, which
-- is why the Admin Center can render a complete and always-current matrix,
-- and why "what can this person actually do" has one honest answer.
--
--   sensitive  — exposes money or personal data. The Admin Center warns
--                before granting it, and the AI layer refuses to put the
--                underlying data in a prompt for an actor who lacks it.
--   scopeable  — whether all / unit / own is a meaningful distinction.
--                Configuration permissions are not scopeable: you either
--                administer the system or you do not.
-- ---------------------------------------------------------------------------
insert into public.os_permissions (key, module, action, label, description, sensitive, scopeable, sort_order) values
  -- Trips
  ('trips.view',            'trips', 'view',    'View trips', 'See trip records and their operational detail.', false, true, 10),
  ('trips.create',          'trips', 'create',  'Create trips', 'Turn a closed deal into a trip in the OS.', false, false, 11),
  ('trips.edit',            'trips', 'edit',    'Edit trips', 'Change dates, times, locations, itinerary and notes.', false, true, 12),
  ('trips.delete',          'trips', 'delete',  'Archive trips', 'Archive a trip. Trips are never hard-deleted.', false, true, 13),
  ('trips.assign',          'trips', 'assign',  'Assign crew and resources', 'Put people, vehicles, dresses and equipment on a trip.', false, true, 14),
  ('trips.status',          'trips', 'status',  'Change trip status', 'Move a trip through its lifecycle.', false, true, 15),
  ('trips.financials',      'trips', 'financials', 'See trip money', 'Selling price, cost, margin and profit on a trip.', true, true, 16),
  ('trips.export',          'trips', 'export',  'Export trips', 'Download trip data as CSV.', false, true, 17),
  ('trips.bulk',            'trips', 'bulk',    'Bulk trip actions', 'Apply a change to many trips at once.', false, true, 18),

  -- Clients
  ('clients.view',          'clients', 'view',   'View clients', 'See client profiles and travel history.', false, true, 20),
  ('clients.contact',       'clients', 'contact','See client contact details', 'Phone, email, WhatsApp, social handles.', true, true, 21),
  ('clients.create',        'clients', 'create', 'Create clients', 'Add a new client record.', false, false, 22),
  ('clients.edit',          'clients', 'edit',   'Edit clients', 'Change client details, preferences and tags.', false, true, 23),
  ('clients.delete',        'clients', 'delete', 'Archive clients', 'Archive a client record.', false, true, 24),
  ('clients.export',        'clients', 'export', 'Export clients', 'Download client data. Personal data — grant carefully.', true, true, 25),

  -- Resources
  ('resources.view',        'resources', 'view',   'View resources', 'Vehicles, dresses, equipment and their availability.', false, true, 30),
  ('resources.create',      'resources', 'create', 'Add resources', 'Register a new vehicle, dress or piece of equipment.', false, false, 31),
  ('resources.edit',        'resources', 'edit',   'Edit resources', 'Update condition, status, location and maintenance.', false, true, 32),
  ('resources.delete',      'resources', 'delete', 'Retire resources', 'Take a resource out of service.', false, true, 33),
  ('resources.costs',       'resources', 'costs',  'See resource costs', 'Purchase price, day rate and maintenance spend.', true, true, 34),

  -- Team
  ('team.view',             'team', 'view',    'View team', 'The staff directory, skills and availability.', false, true, 40),
  ('team.create',           'team', 'create',  'Add team members', 'Create an employee record.', false, false, 41),
  ('team.edit',             'team', 'edit',    'Edit team members', 'Update profiles, skills and availability.', false, true, 42),
  ('team.rates',            'team', 'rates',   'See staff pay rates', 'Day rates and per-trip fees.', true, true, 43),
  ('team.roles',            'team', 'roles',   'Grant roles', 'Assign roles and permission overrides to people.', true, false, 44),
  ('team.performance',      'team', 'performance', 'See performance data', 'Ratings, punctuality and incident history.', true, true, 45),

  -- Suppliers
  ('suppliers.view',        'suppliers', 'view',   'View suppliers', 'Supplier profiles, services and reliability.', false, true, 50),
  ('suppliers.create',      'suppliers', 'create', 'Add suppliers', 'Register a new supplier.', false, false, 51),
  ('suppliers.edit',        'suppliers', 'edit',   'Edit suppliers', 'Update contacts, contracts and services.', false, true, 52),
  ('suppliers.rates',       'suppliers', 'rates',  'See supplier rates', 'What we actually pay suppliers.', true, true, 53),

  -- Pricing and the calculator
  ('pricing.view',          'pricing', 'view',      'View the price book', 'Cost and sell prices for everything we sell.', true, false, 60),
  ('pricing.edit',          'pricing', 'edit',      'Edit the price book', 'Add rates and supersede old ones.', true, false, 61),
  ('pricing.calculate',     'pricing', 'calculate', 'Use the trip calculator', 'Build a costed quote for a trip.', false, false, 62),
  ('pricing.margins',       'pricing', 'margins',   'See margins in the calculator', 'Cost, markup and profit, not just the selling price.', true, false, 63),

  -- Finance
  ('finance.view',          'finance', 'view',   'View finance', 'Revenue, costs, payments and outstanding balances.', true, true, 70),
  ('finance.edit',          'finance', 'edit',   'Record costs and payments', 'Add actual costs and log payments.', true, true, 71),
  ('finance.export',        'finance', 'export', 'Export financial data', 'Download financial reports.', true, false, 72),

  -- Tasks and projects
  ('tasks.view',            'tasks', 'view',     'View tasks', 'See tasks across the company.', false, true, 80),
  ('tasks.create',          'tasks', 'create',   'Create tasks', 'Add a task against a trip, client or project.', false, false, 81),
  ('tasks.edit',            'tasks', 'edit',     'Edit tasks', 'Change a task''s detail, priority or due date.', false, true, 82),
  ('tasks.assign',          'tasks', 'assign',   'Assign tasks', 'Give a task to someone else.', false, true, 83),
  ('projects.view',         'tasks', 'projects_view', 'View projects', 'Internal projects that are not trips.', false, true, 84),
  ('projects.manage',       'tasks', 'projects_manage', 'Manage projects', 'Create and run internal projects.', false, true, 85),

  -- Approvals
  ('approvals.view',        'approvals', 'view',    'View approvals', 'See approval requests and their outcome.', false, true, 90),
  ('approvals.request',     'approvals', 'request', 'Request approval', 'Raise something for a manager to decide.', false, false, 91),
  ('approvals.decide',      'approvals', 'decide',  'Approve or reject', 'Make the decision on an approval request.', true, true, 92),

  -- Incidents and quality
  ('incidents.view',        'incidents', 'view',   'View incidents', 'Operational problems and how they were handled.', false, true, 100),
  ('incidents.create',      'incidents', 'create', 'Report an incident', 'Log a problem from the field or the office.', false, false, 101),
  ('incidents.edit',        'incidents', 'edit',   'Manage incidents', 'Own, investigate and resolve incidents.', false, true, 102),
  ('quality.review',        'incidents', 'review', 'Rate performance', 'Score crew, suppliers and resources after a trip.', true, true, 103),
  ('feedback.view',         'incidents', 'feedback_view', 'View client feedback', 'Post-trip feedback from clients.', false, true, 104),
  ('feedback.manage',       'incidents', 'feedback_manage', 'Record client feedback', 'Capture what the client told us.', false, true, 105),

  -- Content and media
  ('content.view',          'content', 'view',    'View the content pipeline', 'Where every shoot is in editing and delivery.', false, true, 110),
  ('content.edit',          'content', 'edit',    'Move content through the pipeline', 'Advance a shoot from upload to delivery.', false, true, 111),
  ('media.view',            'content', 'media_view', 'View media links', 'Google Drive folders attached to a trip.', false, true, 112),
  ('media.manage',          'content', 'media_manage', 'Manage media links', 'Add, verify and remove media links.', false, true, 113),
  ('documents.view',        'content', 'documents_view', 'View documents', 'Vouchers, contracts, tickets and briefs.', false, true, 114),
  ('documents.manage',      'content', 'documents_manage', 'Manage documents', 'Attach and organise documents.', false, true, 115),

  -- Knowledge
  ('knowledge.view',        'knowledge', 'view', 'Read the knowledge base', 'Destinations, procedures and company policy.', false, false, 120),
  ('knowledge.edit',        'knowledge', 'edit', 'Write knowledge articles', 'Add and update articles and SOPs.', false, false, 121),

  -- Calendars
  ('calendar.view',         'calendar', 'view', 'View the operations calendar', 'Every trip on a day, week or month view.', false, true, 130),
  ('calendar.edit',         'calendar', 'edit', 'Reschedule from the calendar', 'Drag a trip to a new slot.', false, true, 131),
  ('events.view',           'calendar', 'events_view', 'View the company calendar', 'Meetings, training, interviews and deadlines.', false, true, 132),
  ('events.edit',           'calendar', 'events_edit', 'Manage company events', 'Create and change internal events.', false, true, 133),

  -- Communication
  ('chat.view',             'chat', 'view', 'Read internal chat', 'Trip, team and department channels.', false, true, 140),
  ('chat.post',             'chat', 'post', 'Post in internal chat', 'Send messages in channels you belong to.', false, true, 141),

  -- Attendance
  ('attendance.self',       'attendance', 'self', 'Check in and out', 'Record your own attendance.', false, false, 150),
  ('attendance.view',       'attendance', 'view', 'View attendance', 'See who checked in, and when.', true, true, 151),
  ('attendance.edit',       'attendance', 'edit', 'Correct attendance', 'Fix a missed check-out or mark leave.', true, true, 152),

  -- Analytics
  ('analytics.view',        'analytics', 'view',      'View operational analytics', 'Volumes, utilisation, sources and destinations.', false, true, 160),
  ('analytics.financial',   'analytics', 'financial', 'View financial analytics', 'Revenue, margin and profitability breakdowns.', true, true, 161),
  ('analytics.export',      'analytics', 'export',    'Export reports', 'Download analytics as CSV.', true, false, 162),

  -- Administration
  ('admin.users',           'admin', 'users',        'Manage users', 'Invite, activate, suspend and link accounts.', true, false, 170),
  ('admin.roles',           'admin', 'roles',        'Manage roles and permissions', 'Create roles and set what they can do.', true, false, 171),
  ('admin.units',           'admin', 'units',        'Manage business units', 'Add and rename service units.', false, false, 172),
  ('admin.catalog',         'admin', 'catalog',      'Manage trip types and statuses', 'Configure the lifecycle and service catalog.', false, false, 173),
  ('admin.templates',       'admin', 'templates',    'Manage templates', 'Trip templates, task templates and SOP wiring.', false, false, 174),
  ('admin.tags',            'admin', 'tags',         'Manage tags', 'The company''s shared tag vocabulary.', false, false, 175),
  ('admin.automations',     'admin', 'automations',  'Manage automations', 'Turn automation rules on and off.', false, false, 176),
  ('admin.settings',        'admin', 'settings',     'System settings', 'Company-wide configuration.', true, false, 177),
  ('admin.integrations',    'admin', 'integrations', 'Manage integrations', 'Google Drive, email and other external services.', true, false, 178),
  ('admin.audit',           'admin', 'audit',        'Read the audit log', 'The forensic record of every important change.', true, false, 179),

  -- AI
  ('ai.ask',                'ai', 'ask',   'Ask the AI assistant', 'Question the OS in natural language, within your own permissions.', false, false, 190),
  ('ai.act',                'ai', 'act',   'Let AI propose actions', 'AI may draft assignments and changes for a human to approve.', true, false, 191),
  ('ai.admin',              'ai', 'admin', 'Administer AI', 'Configure the AI layer and read its action ledger.', true, false, 192)
on conflict (key) do update set
  module = excluded.module,
  action = excluded.action,
  label = excluded.label,
  description = excluded.description,
  sensitive = excluded.sensitive,
  scopeable = excluded.scopeable,
  sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- Grant helper. Keeps the role definitions below readable as a matrix rather
-- than 400 lines of INSERT.
-- ---------------------------------------------------------------------------
create or replace function public.os_grant(p_role_key text, p_scope text, variadic p_perms text[])
returns void
language plpgsql
as $$
declare
  v_role uuid;
  v_perm text;
begin
  select r.id into v_role
    from public.os_roles r
    join public.os_orgs o on o.id = r.org_id
    where o.key = 'egypt-eye' and r.key = p_role_key;
  if v_role is null then
    raise exception 'os_grant: unknown role %', p_role_key;
  end if;
  foreach v_perm in array p_perms loop
    if not exists (select 1 from public.os_permissions where key = v_perm) then
      raise exception 'os_grant: unknown permission %', v_perm;
    end if;
    insert into public.os_role_permissions (role_id, permission_key, scope)
    values (v_role, v_perm, p_scope)
    on conflict (role_id, permission_key) do update set scope = excluded.scope;
  end loop;
end;
$$;

-- Grants every permission in the catalog at 'all' scope. Used only by the
-- Owner role, so that adding a permission to the catalog later can never
-- leave the owner unable to reach a new part of their own system.
create or replace function public.os_grant_everything(p_role_key text)
returns void
language plpgsql
as $$
declare
  v_role uuid;
begin
  select r.id into v_role
    from public.os_roles r join public.os_orgs o on o.id = r.org_id
    where o.key = 'egypt-eye' and r.key = p_role_key;
  insert into public.os_role_permissions (role_id, permission_key, scope)
    select v_role, key, 'all' from public.os_permissions
  on conflict (role_id, permission_key) do update set scope = 'all';
end;
$$;

-- ---------------------------------------------------------------------------
-- SYSTEM ROLES
-- ---------------------------------------------------------------------------
-- `rank` is the authority ladder. A person can never grant a role ranked at
-- or above their own highest role, which is what stops an Operations Manager
-- from quietly promoting themselves to Admin.
insert into public.os_roles (org_id, key, name, description, is_system, rank, color)
select o.id, v.key, v.name, v.description, true, v.rank, v.color
from public.os_orgs o,
(values
  ('owner',              'Owner',              'Complete control of Egypt Eye OS, including roles, settings and every financial figure.', 0,  '#8c6d1f'),
  ('admin',              'Administrator',      'Runs the system: users, roles, catalog, templates, integrations and the audit log.', 10, '#a8562e'),
  ('management',         'Management',         'Full operational and financial visibility, approvals and analytics. Cannot reconfigure the system.', 20, '#5c7a5f'),
  ('operations_manager', 'Operations Manager', 'Owns the daily operation: scheduling, assignments, readiness, incidents and the team.', 30, '#c9a227'),
  ('operations',         'Operations',         'Plans and staffs trips, manages resources and suppliers, works the Today and Tomorrow boards.', 40, '#c9a227'),
  ('reservation',        'Reservation',        'Creates clients and trips from closed deals, quotes with the calculator, owns client data.', 45, '#5c7a5f'),
  ('finance',            'Finance',            'Costs, payments, margins and financial reporting. No operational scheduling.', 40, '#8c6d1f'),
  ('hr',                 'HR',                 'People records, attendance, leave and the company calendar.', 45, '#5c7a5f'),
  ('coordinator',        'Coordinator',        'Runs trips on the day: readiness, field status, incidents, trip chat.', 50, '#c9a227'),
  ('content_team',       'Content Team',       'Owns the post-shoot pipeline from upload through editing to client delivery.', 60, '#a8562e'),
  ('editor',             'Editor',             'Edits and delivers shoot media. Sees only the trips they are working on.', 65, '#a8562e'),
  ('photographer',       'Photographer',       'Field role. Their own assignments, clients and briefs — no company money.', 70, '#5c7a5f'),
  ('guide',              'Guide',              'Field role. Their own assignments, itineraries and client briefs.', 70, '#5c7a5f'),
  ('representative',     'Representative',     'Field role. Meets clients, confirms pickups, reports issues.', 70, '#5c7a5f'),
  ('driver',             'Driver',             'Field role. Their own runs, pickups and vehicle. Minimal interface.', 75, '#4a5c4f')
) as v(key, name, description, rank, color)
where o.key = 'egypt-eye'
on conflict (org_id, key) do nothing;

-- ---------------------------------------------------------------------------
-- THE PERMISSION MATRIX
-- ---------------------------------------------------------------------------
-- Read each block as: "this role can do these things, at this scope."
-- Scope: all = the whole company, unit = their business unit(s),
--        own = only what they are assigned to, own, or created.
-- ---------------------------------------------------------------------------
do $$
begin
  -- OWNER — everything, always, including permissions added in future
  -- versions of this catalog.
  perform public.os_grant_everything('owner');

  -- ADMINISTRATOR — everything except the ability to hide their own tracks:
  -- an admin can read the audit log but the log itself is append-only for
  -- every application role, so there is no "delete audit entry" permission
  -- to grant in the first place.
  perform public.os_grant_everything('admin');

  -- MANAGEMENT — sees the whole company and decides, but does not reconfigure
  -- it. No admin.* except reading the audit log.
  perform public.os_grant('management', 'all',
    'trips.view','trips.create','trips.edit','trips.assign','trips.status','trips.financials','trips.export','trips.bulk',
    'clients.view','clients.contact','clients.create','clients.edit','clients.export',
    'resources.view','resources.edit','resources.costs',
    'team.view','team.edit','team.rates','team.performance',
    'suppliers.view','suppliers.edit','suppliers.rates',
    'pricing.view','pricing.calculate','pricing.margins',
    'finance.view','finance.edit','finance.export',
    'tasks.view','tasks.create','tasks.edit','tasks.assign','projects.view','projects.manage',
    'approvals.view','approvals.request','approvals.decide',
    'incidents.view','incidents.create','incidents.edit','quality.review','feedback.view','feedback.manage',
    'content.view','content.edit','media.view','media.manage','documents.view','documents.manage',
    'knowledge.view','knowledge.edit',
    'calendar.view','calendar.edit','events.view','events.edit',
    'chat.view','chat.post',
    'attendance.self','attendance.view','attendance.edit',
    'analytics.view','analytics.financial','analytics.export',
    'admin.audit',
    'ai.ask','ai.act');

  -- OPERATIONS MANAGER — the whole operation, and the money that belongs to
  -- running it (supplier rates, trip costs), but not company-level financial
  -- reporting or payroll-grade staff rates.
  perform public.os_grant('operations_manager', 'all',
    'trips.view','trips.create','trips.edit','trips.delete','trips.assign','trips.status','trips.financials','trips.export','trips.bulk',
    'clients.view','clients.contact','clients.create','clients.edit',
    'resources.view','resources.create','resources.edit','resources.delete','resources.costs',
    'team.view','team.edit','team.performance',
    'suppliers.view','suppliers.create','suppliers.edit','suppliers.rates',
    'pricing.view','pricing.calculate','pricing.margins',
    'tasks.view','tasks.create','tasks.edit','tasks.assign','projects.view',
    'approvals.view','approvals.request','approvals.decide',
    'incidents.view','incidents.create','incidents.edit','quality.review','feedback.view','feedback.manage',
    'content.view','content.edit','media.view','media.manage','documents.view','documents.manage',
    'knowledge.view','knowledge.edit',
    'calendar.view','calendar.edit','events.view','events.edit',
    'chat.view','chat.post',
    'attendance.self','attendance.view','attendance.edit',
    'analytics.view',
    'ai.ask','ai.act');
  perform public.os_grant('operations_manager', 'unit', 'finance.view');

  -- OPERATIONS — plans and staffs trips company-wide, but deliberately has
  -- NO permission to see selling price, margin or profit. This is the
  -- spec's "edit trip operations but cannot see profit margins" case, and it
  -- is enforced server-side, not by hiding a column.
  perform public.os_grant('operations', 'all',
    'trips.view','trips.create','trips.edit','trips.assign','trips.status','trips.export',
    'clients.view','clients.contact','clients.create','clients.edit',
    'resources.view','resources.edit',
    'team.view',
    'suppliers.view','suppliers.edit',
    'pricing.calculate',
    'tasks.view','tasks.create','tasks.edit','tasks.assign','projects.view',
    'approvals.view','approvals.request',
    'incidents.view','incidents.create','incidents.edit','feedback.view',
    'content.view','media.view','media.manage','documents.view','documents.manage',
    'knowledge.view',
    'calendar.view','calendar.edit','events.view',
    'chat.view','chat.post',
    'attendance.self',
    'analytics.view',
    'ai.ask');

  -- RESERVATION — the entry point of the whole OS. Owns client records and
  -- creates the trip, quotes it with real margins, then hands it to
  -- operations. Does not schedule crew.
  perform public.os_grant('reservation', 'all',
    'trips.view','trips.create','trips.edit','trips.status','trips.financials',
    'clients.view','clients.contact','clients.create','clients.edit','clients.export',
    'resources.view',
    'team.view',
    'suppliers.view',
    'pricing.view','pricing.calculate','pricing.margins',
    'tasks.view','tasks.create','tasks.edit',
    'approvals.view','approvals.request',
    'incidents.view','incidents.create','feedback.view','feedback.manage',
    'media.view','documents.view','documents.manage',
    'knowledge.view',
    'calendar.view','events.view',
    'chat.view','chat.post',
    'attendance.self',
    'analytics.view',
    'ai.ask');

  -- FINANCE — every number, no scheduling authority.
  perform public.os_grant('finance', 'all',
    'trips.view','trips.financials','trips.export',
    'clients.view','clients.contact','clients.export',
    'resources.view','resources.costs',
    'team.view','team.rates',
    'suppliers.view','suppliers.edit','suppliers.rates',
    'pricing.view','pricing.edit','pricing.calculate','pricing.margins',
    'finance.view','finance.edit','finance.export',
    'tasks.view','tasks.create','tasks.edit',
    'approvals.view','approvals.request','approvals.decide',
    'incidents.view',
    'documents.view','documents.manage',
    'knowledge.view',
    'calendar.view','events.view',
    'chat.view','chat.post',
    'attendance.self','attendance.view',
    'analytics.view','analytics.financial','analytics.export',
    'ai.ask');

  -- HR — people, attendance and the company calendar. No client data, no
  -- trip money.
  perform public.os_grant('hr', 'all',
    'trips.view',
    'team.view','team.create','team.edit','team.rates','team.performance',
    'tasks.view','tasks.create','tasks.edit','tasks.assign','projects.view','projects.manage',
    'approvals.view','approvals.request',
    'incidents.view',
    'documents.view','documents.manage',
    'knowledge.view','knowledge.edit',
    'calendar.view','events.view','events.edit',
    'chat.view','chat.post',
    'attendance.self','attendance.view','attendance.edit',
    'analytics.view',
    'ai.ask');

  -- COORDINATOR — runs the day. Scoped to their business unit so a
  -- Photoshoots coordinator does not administer the Tours desk.
  perform public.os_grant('coordinator', 'unit',
    'trips.view','trips.edit','trips.assign','trips.status',
    'clients.view','clients.contact',
    'resources.view','resources.edit',
    'team.view',
    'suppliers.view',
    'tasks.view','tasks.create','tasks.edit','tasks.assign',
    'approvals.view','approvals.request',
    'incidents.view','incidents.create','incidents.edit','feedback.view','feedback.manage',
    'content.view','media.view','media.manage','documents.view',
    'calendar.view','calendar.edit','events.view',
    'chat.view','chat.post',
    'analytics.view');
  perform public.os_grant('coordinator', 'all', 'knowledge.view','pricing.calculate','attendance.self','ai.ask');

  -- CONTENT TEAM — owns everything after the shutter closes.
  perform public.os_grant('content_team', 'all',
    'trips.view',
    'clients.view',
    'team.view',
    'tasks.view','tasks.create','tasks.edit','tasks.assign','projects.view',
    'content.view','content.edit','media.view','media.manage','documents.view','documents.manage',
    'knowledge.view',
    'calendar.view','events.view',
    'chat.view','chat.post',
    'attendance.self',
    'incidents.view','incidents.create',
    'approvals.request','approvals.view',
    'analytics.view',
    'ai.ask');

  -- EDITOR — only the shoots they are actually editing.
  perform public.os_grant('editor', 'own',
    'trips.view','clients.view','content.view','content.edit','media.view','media.manage',
    'tasks.view','tasks.edit','documents.view','chat.view','chat.post','incidents.create','incidents.view');
  perform public.os_grant('editor', 'all', 'knowledge.view','attendance.self','calendar.view','team.view','ai.ask');

  -- FIELD ROLES — photographer, guide, representative.
  -- Everything is 'own': their assignments, the clients on those trips, the
  -- briefs for those trips. No company revenue, no supplier costs, no other
  -- people's trips, no payroll, no settings. This is exactly the
  -- photographer example in the specification, and it is the default shape
  -- for anyone who works in the field.
  perform public.os_grant('photographer', 'own',
    'trips.view','clients.view','clients.contact',
    'tasks.view','tasks.edit',
    'media.view','media.manage','documents.view',
    'incidents.view','incidents.create',
    'chat.view','chat.post',
    'content.view','feedback.view');
  perform public.os_grant('photographer', 'all',
    'knowledge.view','attendance.self','calendar.view','team.view','resources.view','events.view','ai.ask');

  perform public.os_grant('guide', 'own',
    'trips.view','clients.view','clients.contact',
    'tasks.view','tasks.edit',
    'documents.view','media.view',
    'incidents.view','incidents.create',
    'chat.view','chat.post','feedback.view');
  perform public.os_grant('guide', 'all',
    'knowledge.view','attendance.self','calendar.view','team.view','resources.view','events.view','ai.ask');

  perform public.os_grant('representative', 'own',
    'trips.view','clients.view','clients.contact',
    'tasks.view','tasks.edit','documents.view',
    'incidents.view','incidents.create','chat.view','chat.post','feedback.view','feedback.manage');
  perform public.os_grant('representative', 'all',
    'knowledge.view','attendance.self','calendar.view','team.view','events.view','ai.ask');

  -- DRIVER — the narrowest role in the system. Their runs, their pickups,
  -- their vehicle, and the ability to shout for help.
  perform public.os_grant('driver', 'own',
    'trips.view','clients.contact','tasks.view','tasks.edit',
    'incidents.view','incidents.create','chat.view','chat.post');
  perform public.os_grant('driver', 'all', 'knowledge.view','attendance.self','resources.view');
end;
$$;

-- ---------------------------------------------------------------------------
-- BUSINESS UNITS
-- ---------------------------------------------------------------------------
-- Not separate applications. A unit is an attribute of a trip and a scoping
-- boundary for permissions; clients, crew, vehicles, dresses, suppliers and
-- knowledge are shared across every one of them.
insert into public.os_business_units (org_id, key, name, description, color, sort_order)
select o.id, v.key, v.name, v.description, v.color, v.sort_order
from public.os_orgs o,
(values
  ('tours',        'Tours',              'Guided day tours and multi-day itineraries across Egypt.', '#c9a227', 1),
  ('photoshoots',  'Photoshoots',        'Professional photography sessions at Egypt''s landmark locations.', '#a8562e', 2),
  ('flying_dress', 'Flying Dresses',     'The flying-dress experience: dress, styling, location and shoot.', '#8c6d1f', 3),
  ('experiences',  'Experiences',        'Signature experiences — Nile evenings, desert nights, hot air balloon.', '#5c7a5f', 4),
  ('transfers',    'Transfers',          'Airport and intercity transfers.', '#4a5c4f', 5),
  ('group_trips',  'Group Trips',        'Larger parties, corporate groups and agency series.', '#5c7a5f', 6),
  ('content',      'Content Production', 'Brand shoots, creator collaborations and Egypt Eye''s own content.', '#a8562e', 7)
) as v(key, name, description, color, sort_order)
where o.key = 'egypt-eye'
on conflict (org_id, key) do nothing;

-- ---------------------------------------------------------------------------
-- TRIP LIFECYCLE
-- ---------------------------------------------------------------------------
-- `category` is what code branches on and never changes; key and label are
-- what an administrator may rename or extend. `requires_readiness` marks the
-- statuses a trip may only enter once its readiness gate passes.
insert into public.os_trip_statuses (org_id, key, label, category, color, sort_order, requires_readiness, is_terminal)
select o.id, v.key, v.label, v.category, v.color, v.sort_order, v.req, v.terminal
from public.os_orgs o,
(values
  ('draft',            'Draft',            'draft',     '#9ca3af',  1, false, false),
  ('confirmed',        'Confirmed',        'planning',  '#5c7a5f',  2, false, false),
  ('planning',         'Planning',         'planning',  '#8faa8f',  3, false, false),
  ('assigned',         'Assigned',         'planning',  '#c9a227',  4, false, false),
  ('ready',            'Ready',            'ready',     '#2f855a',  5, true,  false),
  ('in_progress',      'In Progress',      'active',    '#c9a227',  6, false, false),
  ('completed',        'Completed',        'post',      '#4a5c4f',  7, false, false),
  ('content_pending',  'Content Pending',  'post',      '#a8562e',  8, false, false),
  ('client_follow_up', 'Client Follow-up', 'post',      '#8c6d1f',  9, false, false),
  ('closed',           'Closed',           'closed',    '#1b2a20', 10, false, true),
  ('cancelled',        'Cancelled',        'cancelled', '#b91c1c', 11, false, true)
) as v(key, label, category, color, sort_order, req, terminal)
where o.key = 'egypt-eye'
on conflict (org_id, key) do nothing;

-- ---------------------------------------------------------------------------
-- TRIP TYPES AND THEIR READINESS CONTRACTS
-- ---------------------------------------------------------------------------
-- `requirements` is what the readiness engine reads. Adding a new service to
-- Egypt Eye is a row here, not a code change: declare what the service needs
-- and readiness, task generation and conflict checking all follow.
--
-- Keys understood by src/lib/os/readiness.ts:
--   guide / driver / photographer / videographer / coordinator / representative
--     — a crew member of that role must be assigned
--   vehicle / dress / equipment — a resource of that kind must be assigned
--   client_contact   — the client has a reachable phone or email
--   pickup           — a pickup location and time are recorded
--   itinerary        — the trip has at least one itinerary item
--   tickets          — a ticket/permit cost line or document exists
--   supplier_confirmation — a supplier confirmation document is attached
--   media_folder     — a Google Drive folder is linked (post-shoot delivery)
--   pricing          — a selling price is recorded
--   blocking_tasks   — every task marked "blocking" is done
with tt(key, unit_key, name, description, color, mins, reqs, sort_order) as (values
  ('tour', 'tours', 'Tour', 'A guided day tour with a driver and a licensed guide.', '#c9a227', 480,
   '{"guide":true,"driver":true,"vehicle":true,"client_contact":true,"pickup":true,"itinerary":true,"tickets":true,"pricing":true,"blocking_tasks":true}', 1),
  ('photoshoot', 'photoshoots', 'Photoshoot', 'A professional photography session at a landmark location.', '#a8562e', 240,
   '{"photographer":true,"driver":true,"vehicle":true,"client_contact":true,"pickup":true,"itinerary":true,"tickets":true,"pricing":true,"media_folder":true,"blocking_tasks":true}', 2),
  ('flying_dress', 'flying_dress', 'Flying Dress', 'The flying-dress shoot: dress, assistant, location and photographer.', '#8c6d1f', 300,
   '{"photographer":true,"driver":true,"vehicle":true,"dress":true,"client_contact":true,"pickup":true,"itinerary":true,"pricing":true,"media_folder":true,"blocking_tasks":true}', 3),
  ('experience', 'experiences', 'Experience', 'A signature Egypt Eye experience with a host or representative.', '#5c7a5f', 240,
   '{"representative":true,"driver":true,"client_contact":true,"pickup":true,"pricing":true,"supplier_confirmation":true,"blocking_tasks":true}', 4),
  ('transfer', 'transfers', 'Transfer', 'An airport or intercity transfer.', '#4a5c4f', 90,
   '{"driver":true,"vehicle":true,"client_contact":true,"pickup":true,"pricing":true}', 5),
  ('group_trip', 'group_trips', 'Group Trip', 'A larger party or agency series, usually with a coordinator on site.', '#5c7a5f', 600,
   '{"guide":true,"driver":true,"vehicle":true,"coordinator":true,"client_contact":true,"pickup":true,"itinerary":true,"tickets":true,"pricing":true,"blocking_tasks":true}', 6),
  ('content_production', 'content', 'Content Production', 'A brand, creator or in-house content shoot.', '#a8562e', 480,
   '{"photographer":true,"driver":true,"vehicle":true,"itinerary":true,"pricing":true,"media_folder":true,"blocking_tasks":true}', 7),
  ('custom', 'tours', 'Custom Trip', 'Anything that does not fit a standard service. Readiness is minimal by design.', '#9ca3af', 240,
   '{"client_contact":true,"pricing":true}', 8)
)
insert into public.os_trip_types (org_id, unit_id, key, name, description, color, default_duration_minutes, requirements, sort_order)
select o.id, u.id, tt.key, tt.name, tt.description, tt.color, tt.mins, tt.reqs::jsonb, tt.sort_order
from tt
join public.os_orgs o on o.key = 'egypt-eye'
join public.os_business_units u on u.org_id = o.id and u.key = tt.unit_key
on conflict (org_id, key) do nothing;

-- ---------------------------------------------------------------------------
-- PRICING TIERS
-- ---------------------------------------------------------------------------
-- The calculator derives a selling price from cost x markup whenever a rate
-- has no explicit sell price. min_margin_pct is the line the calculator warns
-- below and the approval engine escalates below.
insert into public.os_pricing_tiers (org_id, key, label, markup_pct, min_margin_pct, description, sort_order)
select o.id, v.key, v.label, v.markup, v.min_margin, v.description, v.sort_order
from public.os_orgs o,
(values
  ('standard', 'Standard', 45, 22, 'The everyday Egypt Eye product. Shared vehicles where sensible, standard locations.', 1),
  ('premium',  'Premium',  65, 30, 'Private vehicle, senior crew, priority locations and time slots.', 2),
  ('luxury',   'Luxury',   90, 38, 'Best-in-class crew and vehicles, extended session, full styling support.', 3),
  ('vip',      'VIP',     120, 45, 'Bespoke. Dedicated coordinator on site, private access where obtainable.', 4)
) as v(key, label, markup, min_margin, description, sort_order)
where o.key = 'egypt-eye'
on conflict (org_id, key) do nothing;

-- ---------------------------------------------------------------------------
-- TAGS
-- ---------------------------------------------------------------------------
insert into public.os_tags (org_id, key, label, color, applies_to, description)
select o.id, v.key, v.label, v.color, v.applies_to::text[], v.description
from public.os_orgs o,
(values
  ('vip',             'VIP',              '#8c6d1f', '{client,trip}',  'Handle personally. Escalate anything unusual immediately.'),
  ('repeat',          'Repeat Customer',  '#5c7a5f', '{client}',       'Has travelled with Egypt Eye before.'),
  ('influencer',      'Influencer',       '#a8562e', '{client}',       'Significant audience. Content rights matter here.'),
  ('content_creator', 'Content Creator',  '#a8562e', '{client}',       'Creates and publishes their own content from the trip.'),
  ('agency',          'Agency Client',    '#4a5c4f', '{client}',       'B2B partner booking on behalf of travellers.'),
  ('luxury',          'Luxury',           '#c9a227', '{client,trip}',  'Expects premium delivery end to end.'),
  ('family',          'Family',           '#5c7a5f', '{client,trip}',  'Travelling with children. Pace and timing matter.'),
  ('couple',          'Couple',           '#8faa8f', '{client,trip}',  'Two travellers, usually a romantic occasion.'),
  ('proposal',        'Proposal',         '#a8562e', '{trip}',         'A proposal is planned. Discretion required.'),
  ('urgent',          'Urgent',           '#b91c1c', '{trip,task}',    'Needs attention ahead of everything else.'),
  ('at_risk',         'At Risk',          '#d97706', '{trip}',         'Flagged by a human, independent of the readiness score.'),
  ('press',           'Press / Media',    '#8c6d1f', '{client,trip}',  'Journalists or media production. Permits usually required.')
) as v(key, label, color, applies_to, description)
where o.key = 'egypt-eye'
on conflict (org_id, key) do nothing;

-- ---------------------------------------------------------------------------
-- AUTOMATION REGISTRY
-- ---------------------------------------------------------------------------
-- Honest bookkeeping. `implemented = true` means the rule actually runs in
-- this build (executed by src/lib/os/automation.ts on the triggering
-- mutation, or by the scheduled sweep at /api/os/cron). `implemented = false`
-- means the rule is designed and registered but needs an integration that is
-- not configured — the Admin Center shows it greyed out with the reason, and
-- there is no toggle that pretends otherwise.
insert into public.os_automations (org_id, key, name, description, trigger_event, condition, actions, implemented, requires_integration)
select o.id, v.key, v.name, v.description, v.trigger_event, v.condition::jsonb, v.actions::jsonb, v.implemented, v.requires_integration
from public.os_orgs o,
(values
  ('trip_created_tasks', 'Generate the operational checklist',
   'When a trip is created from a trip type that has a task template, generate every task in that template with due dates relative to the trip start.',
   'trip.created', '{}', '[{"type":"generate_tasks_from_template"}]', true, null),
  ('trip_created_channel', 'Open the trip channel',
   'Every trip gets its own conversation, pre-populated with the operational header, so decisions live on the trip forever.',
   'trip.created', '{}', '[{"type":"create_trip_channel"}]', true, null),
  ('assignment_notify', 'Notify the person assigned',
   'Assigning someone to a trip notifies them in-app immediately, and posts a system line into the trip channel so the whole crew sees it.',
   'assignment.created', '{}', '[{"type":"notify_assignee"},{"type":"post_system_message"}]', true, null),
  ('assignment_conflict_alert', 'Escalate a forced double-booking',
   'When an operations lead overrides a soft conflict, raise an approval for the operations manager with the stated reason attached.',
   'assignment.override', '{}', '[{"type":"create_approval","kind":"assignment_override"}]', true, null),
  ('readiness_recompute', 'Keep readiness live',
   'Any change that could affect readiness — assignment, task, cost, media link, client detail — recomputes the trip''s readiness score and blockers.',
   'trip.mutated', '{}', '[{"type":"recompute_readiness"}]', true, null),
  ('readiness_sweep_24h', 'The 24-hour readiness sweep',
   'Once an hour, re-check every trip starting in the next 24 hours. Anything not green raises a critical or warning notification to the operations owners.',
   'schedule.hourly', '{"horizon_hours":24}', '[{"type":"recompute_readiness"},{"type":"notify_operations"}]', true, null),
  ('trip_completed_content', 'Start the content pipeline',
   'Completing a shoot opens its content job at "upload pending" and assigns the post-production tasks.',
   'trip.completed', '{"produces_content":true}', '[{"type":"open_content_job"},{"type":"generate_post_tasks"}]', true, null),
  ('media_missing_alert', 'Chase a missing media folder',
   'A completed shoot with no linked Drive folder after its promised date notifies the photographer and the content team.',
   'schedule.hourly', '{"grace_hours":24}', '[{"type":"notify_owner"}]', true, null),
  ('approval_escalation', 'Escalate a stalled approval',
   'An approval that has been pending longer than its rule allows escalates to the next role up and is flagged critical.',
   'schedule.hourly', '{}', '[{"type":"escalate_approval"}]', true, null),
  ('status_history', 'Record every status change',
   'Every lifecycle move is written to the trip''s status history and the audit log with who, when and why.',
   'trip.status_changed', '{}', '[{"type":"write_status_history"},{"type":"write_audit"}]', true, null),
  ('supplier_rate_versioning', 'Version supplier rates instead of overwriting them',
   'Changing a rate closes the old row''s validity window and inserts a new one, so historical trips keep the price they were costed at.',
   'rate.changed', '{}', '[{"type":"supersede_rate"}]', true, null),
  ('drive_folder_provisioning', 'Create the Google Drive folder automatically',
   'Create the trip''s Drive folder tree (Raw / Edited / Delivery) the moment a shoot is confirmed, and link it back to the trip.',
   'trip.confirmed', '{"produces_content":true}', '[{"type":"create_drive_folder"}]', false, 'Google Drive API (service account + shared drive)'),
  ('client_delivery_email', 'Email the client their gallery',
   'When a content job reaches Delivered, email the client the delivery link from the Egypt Eye domain.',
   'content.delivered', '{}', '[{"type":"send_client_email"}]', false, 'Resend (RESEND_API_KEY) with a verified sending domain'),
  ('whatsapp_crew_brief', 'Send the crew brief to WhatsApp',
   'Push the day''s brief to each crew member on WhatsApp the evening before.',
   'schedule.daily', '{}', '[{"type":"send_whatsapp"}]', false, 'WhatsApp Business Platform (Meta) message templates'),
  ('calendar_sync', 'Mirror trips into Google Calendar',
   'Publish confirmed trips to a shared operations calendar so crew see them in their own calendar app.',
   'trip.confirmed', '{}', '[{"type":"sync_google_calendar"}]', false, 'Google Calendar API (service account)')
) as v(key, name, description, trigger_event, condition, actions, implemented, requires_integration)
where o.key = 'egypt-eye'
on conflict (org_id, key) do nothing;

-- ---------------------------------------------------------------------------
-- SYSTEM SETTINGS
-- ---------------------------------------------------------------------------
insert into public.os_settings (org_id, key, value, description)
select o.id, v.key, v.value::jsonb, v.description
from public.os_orgs o,
(values
  ('readiness.thresholds', '{"green":90,"yellow":60}',
   'Score at or above green is Ready; at or above yellow is At Risk; below is Not Ready.'),
  ('readiness.critical_horizon_hours', '48',
   'A trip inside this many hours that is not green is treated as critical rather than a warning.'),
  ('approvals.discount_pct_threshold', '15',
   'A discount above this percentage needs management approval.'),
  ('approvals.extra_cost_threshold_usd', '150',
   'An unplanned cost above this amount needs approval before it is committed.'),
  ('approvals.default_escalate_hours', '24',
   'How long an approval may sit before it escalates to the next role.'),
  ('operations.day_start', '"06:00"', 'When the operational day begins, for the Today board and attendance lateness.'),
  ('operations.late_threshold_minutes', '15', 'Minutes after a shift start before attendance is marked late.'),
  ('finance.base_currency', '"USD"', 'The currency every figure is normalised to for reporting.'),
  ('content.delivery_target_days', '7', 'Working days from shoot to client delivery that the pipeline aims for.'),
  ('trips.ref_prefix', '"EE-"', 'Prefix for human-readable trip references.'),
  ('privacy.client_data_retention_years', '7',
   'How long client personal data is kept after the last trip before it is eligible for erasure.')
) as v(key, value, description)
where o.key = 'egypt-eye'
on conflict (org_id, key) do nothing;

-- ---------------------------------------------------------------------------
-- APPROVAL RULES
-- ---------------------------------------------------------------------------
insert into public.os_approval_rules (org_id, key, name, kind, condition, approver_role_key, escalate_after_hours, escalate_to_role_key)
select o.id, v.key, v.name, v.kind, v.condition::jsonb, v.approver, v.hours, v.escalate_to
from public.os_orgs o,
(values
  ('discount_over_15',   'Discount above 15%',            'discount',    '{"discount_pct_gt":15}',       'management',         24, 'owner'),
  ('refund_any',         'Any refund',                    'refund',      '{}',                            'management',         12, 'owner'),
  ('extra_cost_over_150','Unplanned cost above $150',     'extra_cost',  '{"amount_gt":150,"currency":"USD"}', 'operations_manager', 8,  'management'),
  ('supplier_change',    'Changing a confirmed supplier', 'supplier_change', '{}',                        'operations_manager', 6,  'management'),
  ('cancellation',       'Cancelling a confirmed trip',   'cancellation','{}',                            'management',         6,  'owner'),
  ('free_service',       'Complimentary service',         'free_service','{}',                            'management',         24, 'owner'),
  ('assignment_override','Forcing a scheduling conflict', 'assignment_override', '{}',                    'operations_manager', 4,  'management'),
  ('vip_upgrade',        'VIP upgrade at our cost',       'vip_upgrade', '{}',                            'operations_manager', 12, 'management')
) as v(key, name, kind, condition, approver, hours, escalate_to)
where o.key = 'egypt-eye'
on conflict (org_id, key) do nothing;
