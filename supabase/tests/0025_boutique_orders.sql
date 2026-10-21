-- The one-parent rule on payment_attempts, proven rather than asserted.
--
-- An attempt that belongs to both a reservation and a boutique order, or to
-- neither, is an orphan the reconciliation sweep could never resolve in
-- either direction. The constraint is the only thing standing between that
-- and a real payment nobody can match to anything.

begin;

insert into public.boutique_orders
  (reference, product_slug, product_name, engraved_name, sign_count,
   unit_cents, total_cents, customer_name, customer_email, quote)
values
  ('EEB-TEST0001', 'khufu-cartouche', 'Khufu Cartouche', 'OMAR', 4,
   9900, 9900, 'Test Buyer', 'buyer@example.com', '{"totalCents":9900}'::jsonb);

insert into public.reservations (reference, guest_name, guest_email)
values ('EE-TEST0001', 'Test Guest', 'guest@example.com');

-- 1. An attempt on a boutique order alone is fine.
insert into public.payment_attempts (boutique_order_id, amount_cents, quote)
select id, 9900, '{}'::jsonb from public.boutique_orders where reference = 'EEB-TEST0001';
select 'boutique-only attempt -> accepted' as step;

-- 2. An attempt on a reservation alone is still fine — nothing regressed.
insert into public.payment_attempts (reservation_id, amount_cents, quote)
select id, 2500, '{}'::jsonb from public.reservations where reference = 'EE-TEST0001';
select 'reservation-only attempt -> accepted' as step;

-- 3. Both parents must be refused.
do $$
declare refused boolean := false;
begin
  begin
    insert into public.payment_attempts (reservation_id, boutique_order_id, amount_cents, quote)
    select r.id, b.id, 100, '{}'::jsonb
    from public.reservations r, public.boutique_orders b
    where r.reference = 'EE-TEST0001' and b.reference = 'EEB-TEST0001';
  exception when check_violation then
    refused := true;
  end;
  if not refused then
    raise exception 'ERROR: an attempt with BOTH parents was accepted';
  end if;
  raise notice 'two parents -> refused';
end $$;

-- 4. Neither parent must be refused too.
do $$
declare refused boolean := false;
begin
  begin
    insert into public.payment_attempts (amount_cents, quote) values (100, '{}'::jsonb);
  exception when check_violation then
    refused := true;
  end;
  if not refused then
    raise exception 'ERROR: an orphan attempt with NO parent was accepted';
  end if;
  raise notice 'no parent -> refused';
end $$;

-- 5. Deleting the order takes its attempts with it, so a cascade cannot
--    leave a payment row pointing at nothing.
delete from public.boutique_orders where reference = 'EEB-TEST0001';
select 'attempts after order delete=' || count(*)::text || ' (expect 0)' as step
from public.payment_attempts where boutique_order_id is not null;

-- 6. A free cartouche is a configuration mistake, not an offer.
do $$
declare refused boolean := false;
begin
  begin
    insert into public.boutique_orders
      (reference, product_slug, product_name, engraved_name, sign_count,
       unit_cents, total_cents, customer_name, customer_email, quote)
    values ('EEB-TEST0002', 'x', 'X', 'OMAR', 4, 0, 0, 'A', 'a@example.com', '{}'::jsonb);
  exception when check_violation then
    refused := true;
  end;
  if not refused then
    raise exception 'ERROR: a zero-price order was accepted';
  end if;
  raise notice 'zero price -> refused';
end $$;

rollback;
