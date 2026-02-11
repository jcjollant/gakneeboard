# Supabase Email/Password Authentication Setup

## Overview

This guide will help you set up Supabase for email/password authentication while keeping your existing Google and Apple OAuth flows intact.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Vue)                         │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Google     │  │    Apple     │  │    Email     │       │
│  │   Sign-In    │  │   Sign-In    │  │  /Password   │       │
│  │  (Existing)  │  │  (Existing)  │  │    (NEW)     │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                 │                  │              │
│         └─────────────────┴──────────────────┘              │
│                           │                                 │
└───────────────────────────┼─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Express)                         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  POST /authenticate                                  │   │
│  │  - Handles Google/Apple (existing)                   │   │
│  │  - Handles Supabase email/password (new)             │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                 │
└───────────────────────────┼─────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
    ┌──────────────────┐    ┌──────────────────┐
    │   Supabase       │    │  Vercel Postgres │
    │   (Auth Only)    │    │  (Your Data)     │
    └──────────────────┘    └──────────────────┘
```

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name:** `gakneeboard-auth` (or your preferred name)
   - **Database Password:** (save this securely)
   - **Region:** Choose closest to your users (e.g., `us-west-1`)
   - **Pricing Plan:** Free tier is fine to start
5. Click "Create new project"
6. Wait for project to be provisioned (~2 minutes)

## Step 2: Configure Supabase Authentication

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. **Email provider:**
   - Enable "Email" provider
   - **Confirm email:** Toggle ON (recommended for production)
   - **Secure email change:** Toggle ON
   - **Secure password change:** Toggle ON
3. **Site URL:**
   - Go to **Authentication** → **URL Configuration**
   - Set **Site URL:** `https://yourdomain.com` (your production URL)
   - Add **Redirect URLs:**
     - `http://localhost:5173` (for local development)
     - `https://yourdomain.com` (your production URL)
     - `https://yourdomain.com/auth/callback` (callback URL)

## Step 3: Get Your Supabase Credentials

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 4: Configure Environment Variables

### Frontend (`ui/.env` or `ui/.env.local`)

Create or update your environment file:

```bash
# Existing Google OAuth
GAK_GOOGLE_CLIENT_ID=your-existing-google-client-id

# NEW: Supabase
GAK_SUPABASE_URL=https://xxxxx.supabase.co
GAK_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key
```

### Backend (`server/.env`)

```bash
# NEW: Supabase (for server-side verification)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key
```

**⚠️ IMPORTANT:** 
- The `SUPABASE_SERVICE_ROLE_KEY` is different from the anon key
- Find it in **Settings** → **API** → **service_role key**
- **NEVER** expose this key in the frontend

## Step 5: Configure Email Templates (Optional but Recommended)

1. Go to **Authentication** → **Email Templates**
2. Customize the following templates:
   - **Confirm signup:** Email sent when user registers
   - **Reset password:** Email sent for password reset
   - **Magic Link:** (optional) For passwordless login

Example customization for "Confirm signup":

```html
<h2>Welcome to Gakneeboard!</h2>
<p>Thanks for signing up! Please confirm your email address by clicking the link below:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
<p>If you didn't sign up for Gakneeboard, you can safely ignore this email.</p>
```

## Step 6: Disable Supabase Database (We're Using Vercel Postgres)

Since we're only using Supabase for authentication and not for data storage:

1. Go to **Settings** → **Database**
2. Note: You can't fully disable the database, but we won't use it for application data
3. We'll sync authenticated users to your Vercel Postgres database

## Step 7: Install Dependencies

Run in your project:

```bash
# In the ui directory
cd ui
npm install @supabase/supabase-js

# In the server directory
cd ../server
npm install @supabase/supabase-js
```

## Step 8: Test Supabase Connection

After installing dependencies, you can test the connection:

```javascript
// Test in browser console after setup
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
)

console.log('Supabase client:', supabase)
```

## Next Steps

After completing this setup:

1. ✅ Supabase project created
2. ✅ Environment variables configured
3. ✅ Dependencies installed
4. 🔄 Implement email/password sign-in UI (next)
5. 🔄 Integrate with backend authentication (next)
6. 🔄 Add email verification flow (next)
7. 🔄 Add password reset flow (next)

## Security Checklist

- [ ] Email confirmation enabled
- [ ] Strong password requirements configured
- [ ] Rate limiting enabled (Supabase does this automatically)
- [ ] Service role key stored securely (never in frontend)
- [ ] Redirect URLs properly configured
- [ ] HTTPS enabled in production

## Troubleshooting

### "Invalid API key" error
- Check that you're using the correct anon key for frontend
- Verify the key doesn't have extra spaces or line breaks

### Email not sending
- Check **Authentication** → **Email Templates**
- Verify your email provider settings (Supabase uses their SMTP by default on free tier)
- Check spam folder

### "User already registered" error
- This is expected if you try to sign up with the same email twice
- Use password reset flow to recover access

## Cost Monitoring

Monitor your usage in **Settings** → **Usage**:
- Monthly Active Users (MAU)
- Database size
- Bandwidth

Free tier limits:
- 50,000 MAU
- 500 MB database
- 2 GB bandwidth
- 50,000 emails/month
