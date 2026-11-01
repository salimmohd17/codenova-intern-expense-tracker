# Database Setup

## Create a Supabase database

1. Create a project at Supabase.
2. Set a database password and save it securely.
3. Open **Project Settings > Database**.
4. Copy the PostgreSQL connection string for the connection pooler.

## Local configuration

Create `backend/.env` with:

```env
DATABASE_URL=postgresql://...
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
```

`backend/.env` is ignored by Git. Do not add `DATABASE_URL` to any frontend environment variable or to a variable beginning with `VITE_`.

## Run migrations

From the backend directory:

```bash
npm install
npm run migrate
npm run db:test
```

The server also runs migrations during startup. Migration files are recorded in `schema_migrations`, so they are applied only once.

## Render configuration

In the Render backend service:

- Build command: `npm install`
- Start command: `npm start`
- Environment variable: `DATABASE_URL`
- Environment variable: `NODE_ENV=production`
- Environment variable: `CLIENT_ORIGIN=https://your-vercel-app.vercel.app`

Do not set a database connection string in the frontend. Configure `VITE_API_URL` in Vercel to the Render backend URL ending in `/api`.

## Connection test

```bash
cd backend
npm run db:test
```

A successful connection prints the connected database name and server time.
