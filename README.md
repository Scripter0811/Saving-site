# Toronto Weekend Savings Site

A small responsive trip-plan website with a shared savings tracker. It uses Vercel for hosting and Supabase for persistent shared storage.

## What it tracks
- Your target: $1,750 (limo, hotel, emergency reserve)
- Friend's target: $800 (food, activities, personal spending)
- Total target: $2,550 CAD
- Each update is saved online and is visible to both people.
- Updates require the shared trip PIN.

## Setup (one time)

1. Create a free project at https://supabase.com.
2. In Supabase, open **SQL Editor**, create a new query, paste all of `supabase-setup.sql`, and run it.
3. In Supabase **Project Settings → API** (or **API Keys**), copy the project URL and the **service_role / secret** key. Keep the secret key private.
4. Put these files in a GitHub repository and import the repository at https://vercel.com.
5. In Vercel, open **Project → Settings → Environment Variables** and add:
   - `SUPABASE_URL` = your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = your Supabase service-role/secret key
   - `SAVINGS_PIN` = choose a private PIN that only you and your friend know
6. Save environment variables, then redeploy the project.
7. Open the live site. Both people can enter their current saved amount and tap **Save**, then enter the shared PIN.

## Important
- Never put the Supabase service-role key in `index.html` or `app.js`. It belongs only in Vercel environment variables.
- Prices in the trip plan are estimates, not bookings or confirmed quotes.
- Because the travellers are teenagers, have a parent/guardian help arrange the trip and confirm hotel check-in/age rules before paying.
