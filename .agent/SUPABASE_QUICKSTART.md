# Quick Start: Supabase Email/Password Authentication

## 🚀 Get Started in 5 Minutes

### Step 1: Create Supabase Project (2 minutes)

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click **"New Project"**
3. Fill in:
   - Name: `gakneeboard-auth`
   - Database Password: (save this!)
   - Region: Choose closest to you
4. Click **"Create new project"** and wait ~2 minutes

### Step 2: Get Your Credentials (1 minute)

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** → `https://xxxxx.supabase.co`
   - **anon public** key → `eyJhbGc...` (long string)
   - **service_role** key → `eyJhbGc...` (different long string)

### Step 3: Configure Environment Variables (1 minute)

#### Frontend (`ui/.env.local`)

Create this file:

```bash
GAK_SUPABASE_URL=https://xxxxx.supabase.co
GAK_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key
GAK_GOOGLE_CLIENT_ID=your-existing-google-id
```

#### Backend (`server/.env`)

Add to your existing `.env`:

```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key
```

### Step 4: Enable Email Authentication (1 minute)

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Email** provider
3. Toggle **"Enable Email provider"** to ON
4. Toggle **"Confirm email"** to ON (recommended)
5. Click **Save**

### Step 5: Restart Your Dev Servers

```bash
# Terminal 1 - Frontend
cd ui
npm run dev

# Terminal 2 - Backend  
cd server
vercel dev
```

### Step 6: Test It! 🎉

1. Open your app: `http://localhost:5173`
2. Click **"Sign In"**
3. Scroll down to the email/password section
4. Create an account with your email
5. Check your email for verification link
6. Click the link, then sign in!

---

## ✅ That's It!

You now have:
- ✅ Email/password authentication
- ✅ Email verification
- ✅ Password reset
- ✅ Works alongside your existing Google/Apple OAuth

---

## 📚 Need More Details?

See the full documentation:
- **Setup Guide:** `.agent/SUPABASE_SETUP.md`
- **Implementation Guide:** `.agent/SUPABASE_IMPLEMENTATION.md`

---

## 🐛 Something Not Working?

### "Email authentication is not configured"
→ Check that environment variables are set and dev server was restarted

### "Invalid credentials" when signing in
→ Make sure you verified your email (check spam folder)

### Still stuck?
→ Check the troubleshooting section in `SUPABASE_IMPLEMENTATION.md`
