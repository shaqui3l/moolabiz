# MoolaBiz 💰

> 24/7 WhatsApp business bot platform for African informal traders.  
> AI-powered in Zulu, Xhosa, Afrikaans, Sesotho & English via Lelapa AI (VulaVula), with optional OpenAI-compatible providers (e.g. Azure OpenAI / GitHub Models) for cost-effective flexibility.  
> Instant payments via Yoco, Ozow and PayFast — customers pay without leaving WhatsApp.

---

## What is MoolaBiz?

MoolaBiz gives informal traders (spaza shops, hair braiders, tailors, food sellers) a WhatsApp bot that works around the clock — taking orders, confirming appointments, sending payment links, and handling customer queries in their home language. Setup takes 5 minutes via chat; no forms, dashboards or app downloads needed.

---

## Features

| Feature | Description |
|---|---|
| 🤖 **24/7 Bot** | Responds to customers on WhatsApp while the owner sleeps |
| 🌍 **African Languages** | Auto-detects and replies in Zulu, Xhosa, Afrikaans, Sesotho & English via Lelapa AI (VulaVula), or an OpenAI-compatible endpoint |
| 📦 **Order Management** | Customers browse, order and pay — all inside WhatsApp |
| 📅 **Appointments** | Booking, confirmations and 2-hour reminders sent automatically |
| 💳 **Instant Payments** | Sends Yoco, Ozow or PayFast payment links on order confirmation — customer pays in seconds |
| 💬 **Morning Reports** | Owner wakes up to an overnight orders + revenue summary on WhatsApp |
| 📊 **Admin Dashboard** | Revenue, orders and customer stats per business |
| 🤔 **Devil's Advocate** | AI stress-tests the trader's setup — flags pricing risks, blind spots and asks the hard questions |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router, TypeScript) |
| Styling | Tailwind CSS |
| AI Reasoning | [Anthropic Claude](https://www.anthropic.com/) (claude-3-5-haiku) |
| African Language AI | [Lelapa AI – VulaVula](https://lelapa.ai/) or OpenAI-compatible endpoint (e.g. Azure OpenAI / GitHub Models) |
| Database | [Supabase](https://supabase.com/) (Postgres + RLS) |
| Messaging | [WhatsApp Business Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api) (Meta) |
| Payments | [Yoco](https://developer.yoco.com/) · [Ozow](https://docs.ozow.com/) · [PayFast](https://developers.payfast.co.za/) |
| Deployment | [Vercel](https://vercel.com/) |

---

## Project Structure

```
app/
  page.tsx                          # Landing page
  dashboard/
    page.tsx                        # Admin dashboard (basic-auth protected)
    AdvocatePanel.tsx               # Devil's advocate per-business analysis (client component)
    actions.ts                      # Server action: fetchAdvocateReport
  api/
    webhook/route.ts                # WhatsApp incoming messages (GET verify + POST)
    advocate/route.ts               # Devil's advocate REST endpoint
    payments/
      create/route.ts               # Create payment link for an order
      webhook/[provider]/route.ts   # Yoco / Ozow / PayFast payment callbacks
    cron/
      morning-summary/route.ts      # Send overnight order summary to owners
      reminders/route.ts            # Send appointment reminders (2h before)

lib/
  ai/
    claude.ts                       # Claude: processMessage, extractBusinessSetup
    lelapa.ts                       # VulaVula: detectLanguage, translate
    devil.ts                        # Devil's Advocate: runDevilsAdvocate
  bot/
    processor.ts                    # Message routing, onboarding, payment helpers
  db/
    supabase.ts                     # Supabase client + all DB helpers + types
  payments/
    types.ts                        # Shared payment types (PaymentProvider, etc.)
    yoco.ts                         # Yoco Payment Links API + order status polling
    ozow.ts                         # Ozow Instant EFT
    payfast.ts                      # PayFast redirect URL + MD5 signature
    index.ts                        # Unified createPayment() dispatcher
  whatsapp/
    client.ts                       # sendMessage, sendTemplate helpers

supabase/
  schema.sql                        # Full DB schema — run in Supabase SQL editor
```

---

## Quick Start

### 1. Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com/) project
- [Meta WhatsApp Business Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api) access
- [Anthropic](https://www.anthropic.com/) API key
- Either [Lelapa AI](https://lelapa.ai/) API key, or an OpenAI-compatible language endpoint (e.g. Azure OpenAI / GitHub Models)
- At least one payment provider: [Yoco](https://developer.yoco.com/), [Ozow](https://docs.ozow.com/) or [PayFast](https://developers.payfast.co.za/)

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
# Fill in all values in .env.local
```

### 4. Set up the database

Run `supabase/schema.sql` in your Supabase project's SQL editor.

### 5. Run locally

```bash
npm run dev
```

### 6. Expose your local server for WhatsApp webhooks

```bash
npx ngrok http 3000
# Set your Meta webhook URL to: https://<your-ngrok-url>/api/webhook
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Anthropic Claude API key |
| `LANGUAGE_AI_PROVIDER` | `lelapa` (default) or `openai_compatible` |
| `LELAPA_API_KEY` | Lelapa AI VulaVula API key |
| `OPENAI_COMPAT_BASE_URL` | OpenAI-compatible base URL for language tasks (Azure OpenAI / GitHub Models, etc.) |
| `OPENAI_COMPAT_API_KEY` | API key/token for OpenAI-compatible language endpoint |
| `OPENAI_COMPAT_MODEL` | Model name for OpenAI-compatible language endpoint (default `gpt-4o-mini`) |
| `WHATSAPP_ACCESS_TOKEN` | Meta WhatsApp Cloud API access token |
| `WHATSAPP_PHONE_NUMBER_ID` | Meta phone number ID |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | Secret token for webhook verification |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `CRON_SECRET` | Bearer token protecting cron routes |
| `ADMIN_PASSWORD` | Password for the `/dashboard` admin page |
| `ADVOCATE_API_KEY` | Bearer token protecting `/api/advocate` |
| `YOCO_SECRET_KEY` | Yoco secret key (`sk_live_...`) |
| `YOCO_WEBHOOK_SECRET` | Yoco webhook signing secret |
| `OZOW_SITE_CODE` | Ozow site code |
| `OZOW_API_KEY` | Ozow API key |
| `OZOW_PRIVATE_KEY` | Ozow private key (used for SHA512 HashCheck) |
| `PAYFAST_MERCHANT_ID` | PayFast merchant ID |
| `PAYFAST_MERCHANT_KEY` | PayFast merchant key |
| `PAYFAST_PASSPHRASE` | PayFast passphrase (used in MD5 signature) |
| `PAYFAST_SANDBOX` | `true` for sandbox, `false` for live |
| `NEXT_PUBLIC_APP_URL` | Your deployed URL (e.g. `https://moolabiz.vercel.app`) |
| `PAYMENTS_API_KEY` | Bearer token protecting `/api/payments/create` |

---

## Payments

### Flow

```
Customer WhatsApps an order
        ↓
Bot confirms order → createPayment() → sends pay link via WhatsApp
        ↓
Customer pays via Yoco / Ozow / PayFast
        ↓
Provider hits POST /api/payments/webhook/[provider]
        ↓
Order marked paid → ✅ WhatsApp receipt sent to customer
```

**Checking payment status:** A customer can send `PAID?` or `CHECK PAYMENT` — the bot polls the Yoco Orders API (`GET /v1/orders/{order_id}`) and replies instantly.

### Provider Comparison

| Provider | Type | Best for |
|---|---|---|
| **Yoco** | Card + payment links | Traders with card-paying customers; simplest link-based flow |
| **Ozow** | Instant EFT | Township customers who don't use cards; direct bank-to-bank |
| **PayFast** | Card, EFT, SnapScan, Zapper | Broadest SA payment method coverage |

Each business sets a preferred `payment_provider` in the database. Defaults to Yoco if not set.

---

## Devil's Advocate

After onboarding, the bot automatically runs a business stress-test and sends the trader a WhatsApp follow-up:

- ⚠️ **Top challenge** — e.g. pricing too low, market oversaturated
- 💡 **Top blind spot** — e.g. no upsell strategy, seasonal demand ignored
- ❓ **Provoke question** — the one question that challenges their biggest assumption

The full report (all challenges, blind spots, verdict) is available in the admin dashboard under **🤔 Devil's Advocate Analysis**.

---

## Cron Jobs

Configure these in Vercel Cron with `Authorization: Bearer <CRON_SECRET>`:

| Route | Schedule | Description |
|---|---|---|
| `POST /api/cron/morning-summary` | `0 6 * * *` | Send overnight orders + revenue summary to owners |
| `POST /api/cron/reminders` | `*/30 * * * *` | Send appointment reminders 2 hours before |

---

## Pricing

| Plan | Price | Includes |
|---|---|---|
| **Basic** | R149/month | 24/7 bot, orders, appointments, morning reports |
| **Growth** | R299/month | Everything in Basic + payment integration + analytics |

---

## Deployment

Deploy to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/shaqui3l/moolabiz)

Set all environment variables in your Vercel project settings before deploying.

---

## Security

- All secrets are environment variables — never committed to source
- Webhook signatures use `timingSafeEqual` (prevents timing attacks):
  - Yoco: HMAC-SHA256
  - Ozow: SHA512 HashCheck
  - PayFast: MD5 + passphrase
- Cron and payment routes are Bearer-token protected
- Supabase Row Level Security (RLS) enabled on all tables

---

## License

MIT
