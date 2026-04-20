# Walk With Me (WWM) – Luxury Experience Marketplace

A three-sided marketplace for booking curated life moments: dates, parties, birthdays, proposals, trips, and celebrations. Built for Ghana with Paystack (card + mobile money) and Firebase Auth.

## Architecture Overview

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, mobile-first luxury UI (Black + Gold + White)
- **Backend**: Node.js + Express, REST API
- **Database**: PostgreSQL
- **Auth**: Firebase (email + phone)
- **Payments**: Paystack (escrow-style: hold until service completion)
- **Hosting**: Frontend → Vercel | Backend → AWS / DigitalOcean

## Project Structure

```
wwm/
├── backend/           # Express API
│   ├── src/
│   │   ├── config/    # DB, Firebase
│   │   ├── middleware/# Auth, roles
│   │   ├── routes/    # API routes
│   │   └── services/  # Business logic
│   └── package.json
├── frontend/          # Next.js app
│   ├── src/
│   │   ├── app/       # Pages (App Router)
│   │   ├── components/
│   │   ├── context/   # AuthContext
│   │   └── lib/       # API, Firebase
│   └── package.json
├── database/
│   ├── schema.sql     # PostgreSQL schema
│   └── seed.sql       # Sample packages
└── README.md
```

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Firebase project
- Paystack account (Ghana)

## Quick Start

### 1. Database

```bash
# Create database
createdb wwm

# Run schema
psql -U postgres -d wwm -f database/schema.sql

# Run production features migration
psql -U postgres -d wwm -f database/migrations/001_production_features.sql

# Seed packages
psql -U postgres -d wwm -f database/seed.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your values
npm install
npm run dev
```

Backend runs at `http://localhost:4000`.

### 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local
# Edit .env.local with your values
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

### 4. Environment Variables

**Backend `.env`**
- `DATABASE_URL` – PostgreSQL connection string
- `FIREBASE_SERVICE_ACCOUNT_PATH` – Path to Firebase service account JSON (or use `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`)
- `PAYSTACK_SECRET_KEY` – Paystack secret key (test or live)
- `PAYSTACK_WEBHOOK_SECRET` – For webhook signature verification
- `FRONTEND_URL` – e.g. `http://localhost:3000`
- `PORT` – Default 4000

**Frontend `.env.local`**
- `NEXT_PUBLIC_API_URL` – e.g. `http://localhost:4000/api`
- `NEXT_PUBLIC_FIREBASE_*` – Firebase client config
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` – Optional, for inline Paystack

### 5. Create Admin User

After signing up a user, promote to admin in the database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | Bearer | Register/sync user |
| GET | `/api/auth/me` | Bearer | Get current user |
| GET | `/api/packages` | - | List packages |
| GET | `/api/packages/featured` | - | Featured packages |
| GET | `/api/packages/:idOrSlug` | - | Package detail |
| POST | `/api/bookings` | Customer | Create booking |
| GET | `/api/bookings/my` | Customer | My bookings |
| GET | `/api/bookings/vendor` | Vendor | Vendor bookings |
| POST | `/api/bookings/:id/initiate-payment` | Customer | Get Paystack URL |
| POST | `/api/bookings/:id/accept` | Vendor | Accept paid booking |
| GET | `/api/payments/verify` | Customer | Verify payment |
| POST | `/api/payments/webhook` | Paystack | Webhook (raw body) |
| POST | `/api/vendors/apply` | User | Apply as vendor |
| GET | `/api/vendors/me` | Vendor | Vendor profile |
| GET | `/api/admin/dashboard` | Admin | Dashboard stats |
| GET | `/api/admin/vendors` | Admin | List vendors |
| POST | `/api/admin/vendors/:id/approve` | Admin | Approve vendor |
| POST | `/api/admin/vendors/:id/reject` | Admin | Reject vendor |
| GET | `/api/admin/bookings` | Admin | All bookings |
| GET | `/api/admin/payments` | Admin | List payments with commission breakdown |
| POST | `/api/admin/payments/:id/release` | Admin | Release payment to vendor |
| GET | `/api/admin/analytics` | Admin | Analytics (conversion, AOV, completion rate) |
| GET | `/api/config` | Admin | Platform config |
| PATCH | `/api/config` | Admin | Update platform config |
| POST | `/api/bookings/:id/cancel` | Customer | Cancel booking (with penalty logic) |
| POST | `/api/ratings` | Customer | Rate vendor after completed booking |
| GET | `/api/ratings/vendor/:id` | - | Get vendor rating |
| POST | `/api/disputes` | User | Create dispute |
| GET | `/api/disputes` | Admin | List disputes |
| POST | `/api/disputes/:id/resolve` | Admin | Resolve dispute |
| GET | `/api/vendor-matching/eligible` | Admin | Find eligible vendors for booking |

## Production Features (Post-Migration)

### 1. Pricing & Commission
- Configurable commission % (default 15%) and service fee
- Vendor payout calculated on payment success
- Cancellation penalties: 100% &lt;24h, 50% &lt;48h, 25% &lt;7d before event
- Admin config at `/admin/config`

### 2. Vendor Matching
- `findEligibleVendors`: availability, service capability, double-booking prevention
- Buffer times between bookings
- Fallback vendors for emergencies

### 3. Trust Layer
- Email/phone verification columns
- Vendor ratings (1–5 stars) after completed bookings
- Dispute resolution workflow
- Activity logs for audit

### 4. Logistics & Scheduling
- `vendor_booking_slots` prevents double-booking
- `vendor_availability` and `vendor_blocked_dates` for schedule

### 5. Notifications
- In-app + DB logging (extend with SendGrid, Twilio)
- Booking confirmation, payment confirmation, vendor alerts, reminders

### 6. Analytics
- Conversion rate, completion rate, revenue, AOV
- Vendor reliability, customer lifetime value
- Admin dashboard and `/admin/analytics`

## Booking Flow

1. **Customer**: Browse packages → Book → Select date, customizations → Proceed to Paystack
2. **Paystack**: User pays (card or mobile money)
3. **Webhook**: Backend receives `charge.success` → verifies → updates booking to `paid`
4. **Vendor**: Sees paid bookings → Accepts → Booking `confirmed`
5. **Admin**: Releases payment to vendor after service completion

## Trust & Safety

- Vendor verification (pending → approved/rejected)
- Escrow: payments held until admin releases
- Activity logs table for audit trail
- Cancellation and refund logic (schema ready)

## Deployment

- **Frontend (Vercel)**: Connect repo, set env vars, deploy
- **Backend**: Deploy to AWS EC2/ECS or DigitalOcean App Platform
- **Database**: Use managed PostgreSQL (RDS, DigitalOcean)
- **Paystack Webhook**: Set URL to `https://your-api.com/api/payments/webhook`

## Development Phases

- **Phase 1 (Current)**: Manual MVP – admin assigns, manual release
- **Phase 2**: Automation – auto-assign vendors, scheduled releases
- **Phase 3**: Scaling – queues, caching, multi-region

## License

Proprietary.
