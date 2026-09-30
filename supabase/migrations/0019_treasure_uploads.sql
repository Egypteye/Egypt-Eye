-- Backs the photograph step on Take Egypt Home → Papyrus, where a traveller
-- sends the picture that will be painted into the scene.
--
-- PRIVATE, unlike the avatars bucket next door, and the difference is the
-- point. An avatar is a picture someone chose to display; this is a family
-- photograph handed over for a commission, often of children, by someone who
-- has no account and will never log in. It has no business sitting on a
-- guessable public URL.
--
-- So: no public read, and no storage policies granting anon or authenticated
-- roles anything at all. Every write comes from /api/treasure-request using
-- the service role, which bypasses RLS, and the team reads each file through a
-- signed link that expires. A browser holding the object's path can do nothing
-- with it.
--
-- The 8 MB ceiling and the MIME list are enforced twice on purpose — once in
-- the route so the customer gets a sentence they can act on, and once here so
-- the rule holds even if a future caller forgets.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('treasure-uploads', 'treasure-uploads', false, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Belt and braces: if a policy for this bucket is ever added by hand, these
-- drops make the intended state obvious in the migration history.
drop policy if exists "treasure uploads are publicly accessible" on storage.objects;
drop policy if exists "anyone can upload a treasure photo" on storage.objects;
