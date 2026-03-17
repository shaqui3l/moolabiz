# MoolaBiz 💰

> 24/7 WhatsApp business bot platform for African informal traders.  
> AI-powered in Zulu, Xhosa, Afrikaans, Sesotho & English via Lelapa AI (VulaVula).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| AI Reasoning | Anthropic Claude (claude-3-5-haiku) |
| African Language AI | Lelapa AI – VulaVula |
| Database | Supabase (Postgres) |
| Messaging | WhatsApp Cloud API (Meta) |

---

## Project Structure

```
app/
  page.tsx                    # Landing page
  layout.tsx                  # Root layout
  dashboard/page.tsx          # Admin dashboard (basic-auth protected)
  api/
    webhook/route.ts          # WhatsApp webhook (GET verify + POST messages)
    cron/
      morning-summary/route.ts
      reminders/route.ts
lib/
  ai/
    claude.ts                 # Anthropic Claude integration
    lelapa.ts                 # Lelapa VulaVula – language detect & translate
  bot/
    processor.ts              # Message routing + onboarding flow
  db/
    supabase.ts               # All DB helpers
  whatsapp/
    client.ts                 # WhatsApp Cloud API helpers
supabase/
  schema.sql                  # CREATE TABLE statements
```

---

## Quick Start

### 1. Clone & Install
```bash
npm install
```

### 2. Environment Variables
```bash
cp .env.example .env.local
# Fill in all values in .env.local
```

### 3. Database Setup
Run `supabase/schema.sql` in your Supabase SQL editor.

### 4. Run Dev Server
```bash
npm run dev
```

### 5. Expose Webhook (local dev)
```bash
npx ngrok http 3000
# Set the HTTPS URL as your Meta webhook: https://<ngrok>/api/webhook
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Anthropic Claude API key |
| `LELAPA_API_KEY` | Lelapa VulaVula token |
| `WHATSAPP_ACCESS_TOKEN` | Meta WhatsApp Cloud API token |
| `WHATSAPP_PHONE_NUMBER_ID` | Meta phone number ID |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | Random secret for webhook verification |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `CRON_SECRET` | Bearer token to secure cron routes |
| `ADMIN_PASSWORD` | Password for dashboard basic auth |

---

## Pricing Plans

| Plan | Price | Features |
|---|---|---|
| Basic | R149/mo | Bot, orders, appointments, morning reports |
| Growth | R299/mo | + Payments, analytics, unlimited messages |

---

## Cron Jobs

Configure these routes as cron jobs (e.g. Vercel Cron or GitHub Actions):

| Route | Schedule | Description |
|---|---|---|
| `GET /api/cron/morning-summary` | `0 6 * * *` | Send overnight order summary to owners |
| `GET /api/cron/reminders` | `*/30 * * * *` | Send appointment reminders 2h in advance |

Both require `Authorization: Bearer <CRON_SECRET>` header.

---

## License
MIT
