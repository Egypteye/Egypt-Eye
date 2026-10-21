-- Take the person out of the payment log.
--
-- PayPal's webhooks arrive carrying the payer. A check of this table found an
-- email address in 15 of 15 stored events and a full postal address in 10 of
-- them. None of it is read by any code here: settlement and reconciliation
-- work from the order id, the amount and the status.
--
-- PayPal keeps the real record, and the order id is the pointer back to it.
-- So "who paid this?" is answered by logging into PayPal rather than by us
-- holding a copy of somebody's home address indefinitely.
--
-- From now on the webhook strips the payer BEFORE writing the row — see
-- src/lib/privacy/redact.ts. This cleans what was written before that.
--
-- VERIFIED AS A DRY RUN BEFORE APPLYING:
--   15 rows affected; emails 15 -> 0; addresses 10 -> 0;
--   capture id preserved 15/15; order reference preserved 15/15;
--   every amount preserved (5 rows carry resource.amount, 10 carry it
--   inside purchase_units — both survive).

update public.payment_events
set payload = jsonb_set(
  payload,
  '{resource}',
  ((payload -> 'resource') - 'payer' - 'payee' - 'payment_source')
  || case
       when payload -> 'resource' ? 'purchase_units'
       then jsonb_build_object('purchase_units', (
              select jsonb_agg(pu - 'shipping' - 'payee')
              from jsonb_array_elements(payload -> 'resource' -> 'purchase_units') pu))
       else '{}'::jsonb
     end
)
where payload ? 'resource'
  and (
    payload -> 'resource' ? 'payer'
    or payload -> 'resource' ? 'payee'
    or payload -> 'resource' ? 'payment_source'
    or payload -> 'resource' ? 'purchase_units'
  );

-- ---------------------------------------------------------------------------
-- Close the public RPC hole the Supabase security advisor found.
--
-- cleanup_rate_limit_hits() is SECURITY DEFINER and was executable by `anon`
-- over /rest/v1/rpc/. Anyone on the internet could call it, wipe the
-- rate-limit table, and then brute-force the login and every public form
-- with no throttling at all.
--
-- NOTE THE `public` IN THE REVOKE LIST. Revoking from `anon` alone does
-- NOTHING: Postgres grants EXECUTE on a new function to PUBLIC by default and
-- anon inherits it. The first attempt at this revoked only the roles and
-- has_function_privilege still returned true. The grant has to come off
-- PUBLIC as well.
-- ---------------------------------------------------------------------------
revoke execute on function public.cleanup_rate_limit_hits() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.prevent_role_self_escalation() from public, anon, authenticated;
revoke execute on function public.trip_departure_seat_sync() from public, anon, authenticated;

-- The sweep runs as the service role and still needs it. Triggers run as the
-- table owner and are unaffected by EXECUTE grants on the function itself.
grant execute on function public.cleanup_rate_limit_hits() to service_role;
