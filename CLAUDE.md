# Project overview

This is a mobile-first fintech web application designed for seamless bill splitting. The architecture is currently a Progressive Web App (PWA) built with React and Vite, with structural considerations in place for a future transition to React Native.

# Key Commands

- 'npm run dev -- --host' - Start local development environment
- 'npm run build' - Build for production
- 'npm run preview' - Preview production build

## Important Caveats

- **Supabase Free Tier Storage Limits:** The database has a strict 1GB storage limit. Because this app handles user-uploaded receipt images, **client-side image compression must be implemented** before uploading to Supabase, or the free tier will be exhausted rapidly.
- **Secret Management:** Only the `VITE_SUPABASE_ANON_KEY` is permitted in the frontend `.env` file.

## Directory Structure

* **`/` (Root):** Build tools and environment configs (`vite.config.js`, `tailwind.config.js`, `package.json`, `.env`).
* **`/supabase_schema.sql`:** The single source of truth for all database tables and RLS policies.
* **`/src/App.jsx`:** The main router and global state provider. **Rule:** Do not bloat this file with UI code.
* **`/src/main.jsx`:** React DOM entry point.
* **`/src/lib/`:** Backend bridges, API clients, and utilities 
* **`/src/pages/`:** Full-screen view components mapped to specific routes 
* **`/src/components/`:** Reusable UI fragments and modular modals 