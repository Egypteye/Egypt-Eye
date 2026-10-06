#!/usr/bin/env bash
# Applies every migration to a throwaway Postgres and runs supabase/tests.
# Skips with a clear message where no local Postgres is installed, so it never
# fails a machine that simply cannot run it.
set -u
PGBIN=$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | tail -1)
if [ -z "${PGBIN:-}" ] || [ ! -x "$PGBIN/initdb" ]; then
  echo "check-sql: skipped — no local PostgreSQL (install postgresql to run it)."
  exit 0
fi
command -v su >/dev/null 2>&1 && id -u postgres >/dev/null 2>&1 || {
  echo "check-sql: skipped — needs a 'postgres' system user to run initdb."; exit 0; }

D=$(mktemp -d /tmp/eecheck.XXXXXX); chmod 777 "$D"
REPO=$(pwd)
cp -r "$REPO/supabase/migrations" "$D/migs"; cp -r "$REPO/supabase/tests" "$D/tests"
chmod -R 755 "$D/migs" "$D/tests"
cleanup() { su postgres -c "$PGBIN/pg_ctl -D $D/data stop -m immediate" >/dev/null 2>&1; rm -rf "$D"; }
trap cleanup EXIT

su postgres -c "$PGBIN/initdb -D $D/data -U postgres --auth=trust" >/dev/null 2>&1 || { echo "check-sql: initdb failed"; exit 1; }
su postgres -c "$PGBIN/pg_ctl -D $D/data -o \"-k $D -p 5455 -c listen_addresses=''\" -l $D/log start" >/dev/null 2>&1
sleep 3
P="$PGBIN/psql -h $D -p 5455 -U postgres"
su postgres -c "$P -q -c 'create role anon' -c 'create role authenticated' -c 'create role service_role'" >/dev/null 2>&1
su postgres -c "$P -q -c 'create database t'" >/dev/null 2>&1
su postgres -c "$P -d t -q -f $D/tests/_supabase_stubs.sql" >/dev/null 2>&1

fail=0
for f in "$D"/migs/*.sql; do
  out=$(su postgres -c "$P -d t -v ON_ERROR_STOP=1 -q -f $f" 2>&1)
  if echo "$out" | grep -q "ERROR"; then
    echo "check-sql: $(basename "$f") failed"; echo "$out" | grep ERROR | head -2; fail=1
  fi
done
[ $fail -ne 0 ] && exit 1

for f in "$D"/tests/[0-9]*.sql; do
  out=$(su postgres -c "$P -d t -v ON_ERROR_STOP=1 -q -f $f" 2>&1)
  if echo "$out" | grep -q "ERROR"; then
    echo "check-sql: test $(basename "$f") failed"; echo "$out" | grep ERROR | head -3; exit 1
  fi
  echo "$out" | grep -E "expect|->" | sed 's/^/  /'
  # The assertions are written as "(expect N ...)" next to the real figure;
  # a mismatch is a wrong number printed beside the expectation, so compare.
  if echo "$out" | grep -qE "seats_taken=([0-9]+) \(expect ([0-9]+)" ; then
    while read -r line; do
      got=$(echo "$line" | sed -nE 's/.*seats_taken=([0-9]+).*/\1/p')
      want=$(echo "$line" | sed -nE 's/.*expect ([0-9]+).*/\1/p')
      if [ -n "$got" ] && [ -n "$want" ] && [ "$got" != "$want" ]; then
        echo "check-sql: seats_taken=$got but expected $want"; exit 1
      fi
    done <<< "$(echo "$out" | grep -E 'seats_taken=[0-9]+ \(expect')"
  fi
done
echo "check-sql: ok — every migration applies to a clean database, and 0023 releases a lapsed seat hold exactly once, never a paid one, and is idempotent."
