# FinCalc — Financial Calculator Suite & Tracker

FinCalc is a full-stack, production-ready web application containing 6 advanced calculators and an integrated daily income & expense tracker.

## Setup Instructions

### 1. Environment Variables
Create a `.env` file in the `/server` directory and a `.env` in the `/client` directory (or use `.env.local` for Vite).

**Client Environment Variables (`/client/.env`):**
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Server Environment Variables (`/server/.env`):**
```env
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 2. Database Schema
Execute the SQL commands in `supabase_schema.sql` inside the Supabase SQL editor to create the necessary tables and setup Row Level Security (RLS) policies.

### 3. Installation & Run
From the root workspace directory, run:
```bash
# Install dependencies for both client and server
npm run install:all

# Run React Client
npm run dev:client

# Run Express Server
npm run dev:server
```

---

## Database Tables & RLS Configuration

The project configures three main tables:
1. `profiles`: Extends Supabase auth profiles.
2. `transactions`: Stores incomes and expenses per user.
3. `calculations`: Stores saved calculation logs per user.

All tables have RLS enabled, ensuring users can only read, write, or delete their own data rows.
