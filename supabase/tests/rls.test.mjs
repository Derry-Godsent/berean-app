/**
 * Security tests for the Berean schema. Runs the migrations against an
 * in-process PostgreSQL (PGlite) with stand-ins for Supabase's auth schema
 * and roles, then tries to do things each kind of user must NOT be able to do.
 *
 *   npm run test:db
 *
 * Add a test here whenever you add a table or a policy.
 */
import { PGlite } from "@electric-sql/pglite";
import { citext } from "@electric-sql/pglite/contrib/citext";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import fs from "fs";

const db = new PGlite({ extensions: { citext, pgcrypto } });
// --- Supabase stubs -------------------------------------------------
await db.exec(`
  create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
  create schema auth;
  create table auth.users (id uuid primary key default gen_random_uuid(), raw_user_meta_data jsonb default '{}');
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated, service_role;
  grant usage on schema public to anon, authenticated, service_role;
  grant execute on function auth.uid() to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to authenticated, service_role;
  alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
  alter default privileges in schema public grant usage on sequences to authenticated, service_role;
`);
const dir = new URL("../migrations/", import.meta.url);
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
  try { await db.exec(fs.readFileSync(new URL(f, dir), "utf8")); }
  catch (e) { console.log(`MIGRATION ERROR in ${f}:`, e.message); process.exit(1); }
}
console.log("migration applied OK");

// --- helpers --------------------------------------------------------
const as = async (uid, role = "authenticated") => {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${uid ?? ""}', false); set role ${role};`);
};
const q = async (sql, params) => (await db.query(sql, params)).rows;
const expectFail = async (name, fn) => {
  try { await fn(); console.log("  ✗ SHOULD HAVE FAILED:", name); process.exitCode = 1; }
  catch (e) { console.log("  ✓ blocked:", name, "→", e.message.slice(0, 70)); }
};
const ok = (name, cond) => { console.log(cond ? "  ✓" : "  ✗ FAIL:", name); if (!cond) process.exitCode = 1; };

await db.exec("reset role");
const [a, b, c, mod] = (await q(`insert into auth.users (raw_user_meta_data) values ('{"name":"Ama"}'),('{"name":"Kofi"}'),('{"name":"Eve"}'),('{}') returning id`)).map(r => r.id);
await db.exec(`insert into public.app_staff values ('${mod}','moderator')`);
ok("profile auto-created", (await q(`select count(*)::int n from public.profiles`))[0].n === 4);

console.log("\nGroups / prayer privacy");
await as(a);
const g = (await q(`select * from public.create_group('Adenta Cell')`))[0];
await q(`insert into public.prayer_requests (user_id, group_id, body, anonymous) values ($1,$2,'help me',true)`, [a, g.id]);
await as(b); await q(`select public.join_group($1)`, [g.invite_code]);
let feed = await q(`select * from public.prayer_feed`);
ok("member sees prayer via feed", feed.length === 1);
ok("anonymous author hidden", feed[0].user_id === null);
ok("member cannot read base table", (await q(`select * from public.prayer_requests`)).length === 0);
await as(c);
ok("non-member sees nothing", (await q(`select * from public.prayer_feed`)).length === 0);
await expectFail("non-member prays", () => q(`insert into public.prayer_events values ((select id from public.prayer_feed limit 1), $1)`, [c]));

console.log("\nChat");
await db.exec("reset role");
const ch = (await q(`insert into public.channels (kind, slug, name) values ('global','room','The Room') returning id`))[0].id;
const gch = (await q(`insert into public.channels (kind, slug, name, group_id) values ('group','chat','Cell chat',$1) returning id`, [g.id]))[0].id;
await as(a);
const m1 = (await q(`insert into public.messages (channel_id, user_id, body) values ($1,$2,'Hello world') returning id`, [ch, a]))[0].id;
await expectFail("post as someone else", () => q(`insert into public.messages (channel_id, user_id, body) values ($1,$2,'spoof')`, [ch, b]));
await expectFail("empty message", () => q(`insert into public.messages (channel_id, user_id, body) values ($1,$2,'   ')`, [ch, a]));
await as(c);
await expectFail("outsider posts in group chat", () => q(`insert into public.messages (channel_id, user_id, body) values ($1,$2,'hi')`, [gch, c]));
ok("outsider can't read group channel", (await q(`select * from public.channels where id=$1`, [gch])).length === 0);
await as(a);
await q(`update public.messages set body='Hello world (edited)', hidden=false where id=$1`, [m1]);
await as(mod); await q(`update public.messages set hidden=true where id=$1`, [m1]);
await as(a);
await q(`update public.messages set hidden=false where id=$1`, [m1]);
ok("author cannot un-hide moderated message", (await q(`select hidden from public.messages where id=$1`, [m1]))[0].hidden === true);
await as(b);
ok("hidden message invisible to others", (await q(`select * from public.messages where id=$1`, [m1])).length === 0);
await as(mod);
ok("moderator sees hidden", (await q(`select * from public.messages where id=$1`, [m1])).length === 1);
await as(a);
for (let i = 0; i < 19; i++) await q(`insert into public.messages (channel_id, user_id, body) values ($1,$2,'x')`, [ch, a]);
await expectFail("flood > 20/min", () => q(`insert into public.messages (channel_id, user_id, body) values ($1,$2,'x')`, [ch, a]));

console.log("\nBlocks");
await as(b); await q(`insert into public.blocks values ($1,$2)`, [b, a]);
ok("blocked user's messages hidden from blocker", (await q(`select * from public.messages where user_id=$1`, [a])).length === 0);

console.log("\nProfiles / church");
await as(c);
await q(`update public.profiles set display_name='Eve!' where id=$1`, [c]);
await q(`update public.profiles set age_band='13_17' where id=$1`, [c]);
ok("age_band untouched by client", (await q(`select age_band from public.profiles where id=$1`, [c]))[0].age_band === "18_plus");
const ch1 = (await q(`select * from public.create_church('Cornerstone Chapel','cornerstone','Accra','GH')`))[0];
ok("creator is church admin", (await q(`select role from public.church_members where user_id=$1`, [c]))[0].role === "admin");
await expectFail("read join_code column directly", () => q(`select join_code from public.churches`));
ok("staff can fetch join code", (await q(`select public.church_join_code($1) code`, [ch1.id]))[0].code?.length === 8);
await expectFail("self-insert into church_members", () => q(`insert into public.church_members values ($1,$2,'pastor')`, [ch1.id, b]));
await as(b);
await expectFail("non-staff stats", () => q(`select * from public.church_weekly_stats($1)`, [ch1.id]));
await as(c);
const st = (await q(`select * from public.church_weekly_stats($1)`, [ch1.id]))[0];
ok("staff stats: suppressed when <5 sharing", st.active_sharing === null && st.members === 1);

console.log("\nReading + streak");
await as(a);
await db.exec("reset role");
await db.exec(`insert into public.reading_days (user_id, day, minutes) select '${b}', current_date - g, 5 from generate_series(1,3) g on conflict do nothing`);
await as(b);
ok("streak alive when today not yet read (3)", (await q(`select public.current_streak() s`))[0].s === 3);
await q(`select public.log_reading('MAT', 6, 7)`);
ok("streak becomes 4 after reading today", (await q(`select public.current_streak() s`))[0].s === 4);
await expectFail("backdate 10 days", () => q(`select public.log_reading('MAT', 7, 5, current_date - 10)`));
await as(c);
ok("outsider gets 0 for others' streak", (await q(`select public.current_streak($1) s`, [b]))[0].s === 0);

console.log("\nFunding");
await db.exec("reset role");
await db.exec(`insert into public.funding_goals (title, target_usd_minor) values ('Cover running costs', 5000)`);
await db.exec(`insert into public.donations (provider, provider_ref, amount_minor, currency, amount_usd_minor, donor_name, show_publicly) values ('kofi','k1',500,'USD',500,'Grace',true),('kofi','k2',300,'USD',300,'Secret',false)`);
await as(null, "anon");
const fp = (await q(`select * from public.funding_public`))[0];
ok("anon sees public meter", Number(fp.raised_usd_minor) === 800 && Number(fp.supporters) === 2);
ok("wall shows only opted-in", (await q(`select * from public.supporters_wall`)).length === 1);
await expectFail("anon reads donations table", () => q(`select * from public.donations`));
await as(a);
await expectFail("client inserts donation", () => q(`insert into public.donations (provider, provider_ref, amount_minor, currency) values ('x','y',1,'USD')`));
await expectFail("client grants self entitlement", () => q(`insert into public.entitlements (user_id,key,source) values ($1,'plus','client')`, [a]));
await expectFail("client makes self staff", () => q(`insert into public.app_staff values ($1,'admin')`, [a]));

console.log("\nQuiz recursion check + live");
await as(a);
const qs = (await q(`insert into public.quiz_sets (owner_id,title,visibility) values ($1,'Genesis','private') returning id`, [a]))[0].id;
const ls = (await q(`insert into public.live_sessions (set_id, host_id) values ($1,$2) returning id`, [qs, a]))[0].id;
ok("live session readable by host (no RLS recursion)", (await q(`select * from public.live_sessions`)).length === 1);
await as(b);
ok("private quiz hidden", (await q(`select * from public.quiz_sets`)).length === 0);

console.log("\nDeletion");
await as(a); await q(`select public.request_account_deletion()`);
await db.exec("reset role");
ok("profile anonymised", (await q(`select display_name from public.profiles where id=$1`, [a]))[0].display_name === "Deleted user");
ok("messages redacted", (await q(`select count(*)::int n from public.messages where user_id=$1 and body<>'[deleted]'`, [a]))[0].n === 0);
console.log(process.exitCode ? "\nSOME CHECKS FAILED" : "\nALL CHECKS PASSED");
