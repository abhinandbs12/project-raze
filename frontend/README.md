# Project Raze — Frontend (Command Center Dashboard)

Next.js dashboard for Project Raze: live threat monitoring, the Surgical Bay (neural ablation console), Red Team adversarial verification, and the Compliance/Certificate ledger.

## Requirements

- Node.js 18+
- npm
- The backend service running locally (see `../backend/README.md`) — defaults to `http://localhost:8000`

## Setup

1. **Enter the frontend folder:**
```bash
   cd project-raze/frontend
```

2. **Install dependencies:**
```bash
   npm install
```

3. **Set up environment variables:**

   Create a `.env.local` file in `frontend/` with:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
   Supabase is used for the immutable audit log on the Compliance page. If you don't have a Supabase project, the app still works — audit logging will silently fail and no history will show on the Compliance page.

4. **Run the dev server:**
```bash
   npm run dev
```
   App will be live at `http://localhost:3000`.

## Pages

| Route | Purpose |
|---|---|
| `/` | Command Center — live threat feed, AMD telemetry, model health monitor |
| `/surgical-bay` | Neural Surgery Console — configure and run the ablation, live perplexity chart + weight heatmap |
| `/sandbox` | Red Team / adversarial verification against the post-surgery model |
| `/scanner` | Contamination scanner (membership inference) |
| `/compliance` | Certificate of Erasure + immutable audit history |
| `/queue` | Batch surgery queue |

## Supabase Setup (for audit logging)

The `audit_log` table needs Row Level Security policies allowing inserts from the `anon` role, e.g.:
```sql
create policy "Allow insert for anon"
on "public"."audit_log"
as PERMISSIVE
for INSERT
to anon
with check (true);
```
Without this, surgeries will still run, but logging to the Compliance history will silently fail with a `42501` RLS error (visible in browser console).

## Notes

- Requires the backend running first — pages will show "CONNECTING TO NEURAL ENGINE..." or fail silently otherwise.
- Built with Next.js App Router + TypeScript.
