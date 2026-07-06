# Seeding a staff account

The original `seed_staff.sql` is deleted, not fixed, for two reasons:

1. **It was broken.** It inserted into `auth.users` with columns that don't
   exist on current Supabase schemas — `confirmation_token_new` and
   `confirmation_token_new_sent_at` / `email_change_token_new_sent_at` are
   not real column names (the actual field is `confirmation_token`, no
   `_new` variant). It would fail with `column "confirmation_token_new" of
   relation "users" does not exist` the moment it ran.

2. **Even fixed, it's the wrong approach.** `auth.users` is GoTrue's
   internal table, not a documented public interface — Supabase doesn't
   guarantee its shape stays stable across versions, so hand-crafting
   inserts against it is fragile by design, not just today. It also fully
   bypasses Supabase Auth's own validation and hashing pipeline.
   And a hardcoded password (`staff123456`) was committed straight into
   the file, with the credential spelled out in a comment — that's a live
   exposure the moment this file touches version control, independent of
   whether the SQL even ran.

## Do this instead

**Option A — Dashboard (simplest for a one-off account):**
Supabase Dashboard → Authentication → Users → Add User. Set the email,
set a password generated at creation time (not reused anywhere else), and
under "User Metadata" add:
```json
{ "role": "staff", "display_name": "Staff" }
```
The `handle_new_user()` trigger in `01_schema_and_rls.sql` reads this
metadata automatically and creates the matching `public.profiles` row —
you don't need to touch `profiles` by hand.

**Option B — Admin API (for scripting/CI):**
```bash
curl -X POST 'https://<project-ref>.supabase.co/auth/v1/admin/users' \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "staff@yourdomain.id",
    "password": "'"$STAFF_INITIAL_PASSWORD"'",
    "email_confirm": true,
    "user_metadata": { "role": "staff", "display_name": "Staff" }
  }'
```
`SUPABASE_SERVICE_ROLE_KEY` and `STAFF_INITIAL_PASSWORD` should come from
your environment/secrets manager — never typed into a file that gets
committed. This hits Supabase's actual, documented Admin API, so it stays
correct across Supabase version upgrades instead of depending on
`auth.users`' internal column layout.

Either way, have the staff member change the password on first login —
treat whatever you set at creation as a one-time bootstrap value, not a
long-lived credential.
