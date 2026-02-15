# Admin Authentication Setup

## Overview
The admin project is now protected with Supabase authentication. All routes except `/login` require authentication.

## Setup Steps

### 1. Create Admin User in Supabase

You need to create at least one admin user in your Supabase project:

1. Go to your Supabase Dashboard: https://vgobjzmkbzfvnbfibmva.supabase.co
2. Navigate to **Authentication** → **Users**
3. Click **Add User** → **Create new user**
4. Enter email and password for the admin user
5. Click **Create user**

**Recommended Admin Credentials:**
- Email: `admin@kneeboard.ga` (or your preferred admin email)
- Password: Create a secure password

### 2. Login to Admin Dashboard

1. Start the admin dev server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. You will be redirected to `/login` if not authenticated
4. Enter your admin credentials created in Supabase
5. After successful login, you'll be redirected to the admin dashboard

## How It Works

### Authentication Flow

1. **Login Page** (`/pages/login.vue`):
   - Users enter email and password
   - Credentials are verified against Supabase Auth
   - On success, a session is created and stored

2. **Global Middleware** (`/middleware/auth.global.ts`):
   - Runs on every route navigation
   - Checks if user has a valid Supabase session
   - Redirects to `/login` if no session exists
   - Login page is publicly accessible

3. **App Root** (`/app.vue`):
   - Monitors authentication state
   - Displays user email and logout button when authenticated
   - Handles logout functionality

### Supabase Client

The Supabase client is configured in `/utils/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

export const useSupabaseClient = () => {
  const config = useRuntimeConfig()
  
  const supabaseUrl = config.public.SUPABASE_URL as string
  const supabaseKey = config.public.SUPABASE_ANON_KEY as string
  
  return createClient(supabaseUrl, supabaseKey)
}
```

### Environment Variables

Required environment variables in `.env`:

```bash
SUPABASE_URL=https://vgobjzmkbzfvnbfibmva.supabase.co
SUPABASE_ANON_KEY=eyJhbG...
```

These are exposed to the client via `nuxt.config.ts`:

```typescript
runtimeConfig: {
  public: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
  }
}
```

## Security Notes

- **Anon Key**: The `SUPABASE_ANON_KEY` is safe to expose on the client side. It's designed for client-side authentication.
- **Service Role Key**: The `SUPABASE_SERVICE_ROLE_KEY` should **NEVER** be exposed to the client. It's only used in server-side API routes.
- **Row Level Security**: Consider enabling RLS (Row Level Security) in Supabase for additional protection.

## Session Management

- Sessions are automatically persisted in localStorage
- Sessions are validated on every route navigation
- Users are automatically logged out when session expires
- Logout button clears the session and redirects to login page

## Troubleshooting

### Can't login after setup
- Verify the user exists in Supabase Dashboard
- Check browser console for errors
- Ensure environment variables are set correctly
- Try clearing browser localStorage

### Middleware redirect loops
- Check that `/login` route is excluded from auth middleware
- Verify Supabase client is properly initialized

### User created but can't access Supabase
- Make sure you're using the correct Supabase project URL
- Verify the anon key matches your project
- Check that the user's email is confirmed in Supabase (or disable email confirmation)

## Customization

### Add More Authentication Methods

You can extend the login page to support:
- Magic link authentication
- OAuth providers (Google, GitHub, etc.)
- Phone authentication

### Add Role-Based Access Control

To implement role-based permissions:
1. Add user metadata in Supabase
2. Check roles in middleware
3. Conditionally show/hide UI elements based on role

### Session Timeout

Configure session timeout in Supabase Dashboard:
- Go to **Authentication** → **Settings**
- Adjust **JWT Expiry Time**
