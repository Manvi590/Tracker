# My Little Tracker ✿

Personal monthly tracker built with React + Vite + Tailwind + Supabase + Recharts.

## Features
- Supabase email/password auth
- Monthly daily-goal grid with one-click check-ins
- Monthly progress bar chart
- Expense diary with categories and monthly total
- Cheat meal/food log
- Data protected by Supabase Row Level Security

## Setup
1. Create a Supabase project.
2. Open Supabase SQL Editor and run `supabase.sql`.
3. Copy `.env.example` to `.env` and add your Supabase URL + anon key.
4. Run `npm install` then `npm run dev`.
5. Open the local Vite URL and create your account.

For production, deploy the Vite app to Vercel/Netlify and add the same two environment variables.
