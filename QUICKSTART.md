# WWM Quick Start

## Run the project (no database required for UI check)

**Terminal 1 - Backend**
```powershell
cd c:\Users\USER\wwm\backend
npm run dev
```

**Terminal 2 - Frontend**
```powershell
cd c:\Users\USER\wwm\frontend
npm run dev
```

Then open **http://localhost:3000** in your browser.

---

## Dev mode without PostgreSQL

The backend uses **mock packages** when PostgreSQL is not running (dev only). You can:
- Browse the landing page
- View packages listing
- Open package details
- See the luxury UI

Auth, bookings, and payments require Firebase and database.

---

## Full setup (with database)

1. Install PostgreSQL and start it
2. Create database and run migrations:
   ```powershell
   psql -U postgres -c "CREATE DATABASE wwm;"
   psql -U postgres -d wwm -f database/schema.sql
   psql -U postgres -d wwm -f database/migrations/001_production_features.sql
   psql -U postgres -d wwm -f database/seed.sql
   ```
3. Add to `backend/.env`:
   ```
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/wwm
   ```
4. Restart backend

---

## Create admin user

After signing up:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```
