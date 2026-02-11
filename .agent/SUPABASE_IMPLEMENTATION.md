# Supabase Email/Password Authentication - Implementation Guide

## ✅ What's Been Implemented

### Frontend Components

1. **SupabaseClient.ts** (`ui/src/services/SupabaseClient.ts`)
   - Supabase client configuration
   - Environment variable validation
   - Availability checking

2. **EmailPasswordAuth.vue** (`ui/src/components/signin/EmailPasswordAuth.vue`)
   - Sign up form with email/password
   - Sign in form
   - Password reset form
   - Email verification handling
   - Error and success messaging

3. **SignIn.vue** (Updated)
   - Integrated email/password auth alongside Google/Apple OAuth
   - Added visual divider between OAuth and email/password
   - Added handler for Supabase authentication success

4. **Type Definitions** (`ui/src/vite-env.d.ts`)
   - TypeScript environment variable definitions
   - Vite config updated to support `VITE_` prefix

### Backend Services

1. **SupabaseService.ts** (`server/backend/services/SupabaseService.ts`)
   - Token verification using Supabase admin client
   - User data extraction from tokens

2. **UserTools.ts** (Updated)
   - Added `supabase` as a valid authentication source
   - Added `decodeSupabase()` method to verify tokens and create users
   - Updated `hasValidSource()` to include Supabase

### Dependencies

- ✅ `@supabase/supabase-js` installed in both `ui` and `server`

---

## 🔧 Setup Required

### 1. Create Supabase Project

Follow the instructions in `.agent/SUPABASE_SETUP.md` to:
- Create a Supabase project
- Configure authentication settings
- Get your credentials

### 2. Configure Environment Variables

#### Frontend (`ui/.env.local` or `ui/.env`)

Create this file if it doesn't exist:

```bash
# Existing
GAK_GOOGLE_CLIENT_ID=your-google-client-id

# NEW: Add these Supabase credentials
GAK_SUPABASE_URL=https://xxxxx.supabase.co
GAK_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key
```

#### Backend (`server/.env`)

Add these to your existing `.env` file:

```bash
# NEW: Add these Supabase credentials
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key
```

**⚠️ IMPORTANT:**
- The `SUPABASE_SERVICE_ROLE_KEY` is different from the anon key
- Find it in Supabase Dashboard → Settings → API → service_role key
- **NEVER** expose this key in the frontend

### 3. Restart Development Servers

After adding environment variables:

```bash
# Terminal 1 - Frontend
cd ui
npm run dev

# Terminal 2 - Backend
cd server
vercel dev
```

---

## 🧪 Testing the Implementation

### Test Sign Up Flow

1. Open your app in the browser
2. Click "Sign In"
3. Scroll down to the email/password section
4. Enter:
   - Email: `test@example.com`
   - Password: `TestPassword123!`
   - Confirm Password: `TestPassword123!`
5. Click "Sign Up"
6. Check your email for verification link
7. Click the verification link
8. Sign in with the same credentials

### Test Sign In Flow

1. After verifying email, go back to sign in
2. Enter your email and password
3. Click "Sign In"
4. You should be authenticated and see your account

### Test Password Reset

1. Click "Forgot password?"
2. Enter your email
3. Click "Send Reset Link"
4. Check your email for reset link
5. Click the link and set a new password

---

## 🔄 How It Works

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User enters email/password in EmailPasswordAuth.vue      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Supabase authenticates and returns session + user        │
│    (via SupabaseClient.ts)                                  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. SignIn.vue receives success event with:                  │
│    - source: 'supabase'                                     │
│    - session.access_token                                   │
│    - user data                                              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. POST /authenticate with:                                 │
│    { source: 'supabase', token: access_token, user: {...} } │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Backend (UserTools.authenticate):                        │
│    - Calls UserTools.decodeSupabase(token, user)            │
│    - SupabaseService verifies token with Supabase           │
│    - Creates User object with email from Supabase           │
│    - Creates SHA256 hash: sha256('supabase' + email)        │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. UserDao checks if user exists in Vercel Postgres         │
│    - If exists: return existing user                        │
│    - If new: create user in database                        │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Return UserView to frontend                              │
│    Frontend stores in localStorage and updates CurrentUser  │
└─────────────────────────────────────────────────────────────┘
```

### Data Storage

- **Supabase:** Stores authentication data (email, hashed password, email verification status)
- **Vercel Postgres:** Stores your application data (user profiles, templates, etc.)
- **User Linking:** Users are linked by SHA256 hash of `source + email`

### Security Features

✅ **Automatic Features (Supabase handles):**
- Password hashing (bcrypt)
- Email verification
- Password reset tokens with expiration
- Rate limiting on auth endpoints
- Session management

✅ **Your Implementation:**
- Token verification on backend
- User data stored in your database
- Existing authorization logic works unchanged

---

## 🎨 UI/UX Features

### Sign Up
- Email validation
- Password strength requirement (min 8 characters)
- Password confirmation matching
- Clear error messages
- Success message with email verification reminder

### Sign In
- Email/password fields
- "Forgot password?" link
- "Create account" link
- Loading states
- Error handling for:
  - Invalid credentials
  - Unverified email
  - Network errors

### Password Reset
- Email input
- Success confirmation
- Back to sign-in link

---

## 🔐 Security Best Practices

### Already Implemented

✅ Email verification required (configure in Supabase)
✅ Secure password hashing (Supabase handles)
✅ Token-based authentication
✅ Server-side token verification
✅ Rate limiting (Supabase handles)
✅ HTTPS in production (Vercel handles)

### Recommended Additional Steps

1. **Enable MFA (Multi-Factor Authentication)** in Supabase
   - Go to Authentication → Settings → Multi-Factor Authentication
   - Enable TOTP or SMS

2. **Configure Password Requirements**
   - Go to Authentication → Settings → Password Requirements
   - Set minimum length, require special characters, etc.

3. **Set up Email Templates**
   - Customize verification and reset emails
   - Add your branding

4. **Monitor Auth Events**
   - Set up logging for failed login attempts
   - Monitor for suspicious activity

---

## 🐛 Troubleshooting

### "Email authentication is not configured"

**Cause:** Environment variables not set or Supabase client not initialized

**Fix:**
1. Check that `GAK_SUPABASE_URL` and `GAK_SUPABASE_ANON_KEY` are in `ui/.env.local`
2. Restart the dev server
3. Check browser console for warnings

### "Invalid Supabase token or missing email"

**Cause:** Token verification failed on backend

**Fix:**
1. Check that `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are in `server/.env`
2. Verify the service role key is correct (not the anon key)
3. Check backend logs for detailed error

### "Please verify your email before signing in"

**Cause:** Email confirmation is enabled but user hasn't verified

**Fix:**
1. Check spam folder for verification email
2. Resend verification email from Supabase dashboard
3. Or disable email confirmation in Supabase (not recommended for production)

### User created in Supabase but not in your database

**Cause:** Backend authentication failed after Supabase signup

**Fix:**
1. Check backend logs for errors
2. Verify database connection
3. User can still sign in - backend will create user on first successful sign-in

---

## 📊 Monitoring

### Supabase Dashboard

Monitor in **Authentication** → **Users**:
- Total users
- Recent signups
- Email verification status
- Last sign-in times

### Your Database

Query your users table:
```sql
SELECT * FROM users WHERE source = 'supabase';
```

---

## 🚀 Next Steps

### Optional Enhancements

1. **Add Name Field to Sign Up**
   - Update `EmailPasswordAuth.vue` to include a name field
   - Pass name in user metadata to Supabase

2. **Social OAuth via Supabase**
   - Enable Google/Apple OAuth in Supabase
   - Migrate existing OAuth to use Supabase providers
   - Benefit: Unified user management

3. **Magic Links (Passwordless)**
   - Add magic link sign-in option
   - Users receive email with one-time login link

4. **Session Management**
   - Implement token refresh logic
   - Handle session expiration gracefully

5. **Account Linking**
   - Allow users to link multiple auth methods
   - E.g., user signs up with email, later links Google account

---

## 📝 Migration Notes

### Existing Users (Google/Apple OAuth)

- ✅ **No impact** - Existing users continue to sign in with Google/Apple
- ✅ **Separate user base** - Supabase users are distinct (different SHA256 hash)
- ⚠️ **Same email, different accounts** - A user could have both:
  - Google account: `sha256('google' + 'user@example.com')`
  - Supabase account: `sha256('supabase' + 'user@example.com')`

### Future: Account Linking

If you want to link accounts with the same email:

1. Detect duplicate emails across sources
2. Prompt user to link accounts
3. Merge user data
4. Update SHA256 to use primary source

---

## 📚 Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/auth-security)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

## ✅ Checklist

Before going to production:

- [ ] Supabase project created
- [ ] Environment variables configured (frontend + backend)
- [ ] Email verification enabled in Supabase
- [ ] Password requirements configured
- [ ] Email templates customized
- [ ] Tested sign up flow
- [ ] Tested sign in flow
- [ ] Tested password reset flow
- [ ] Tested email verification
- [ ] HTTPS enabled in production
- [ ] Monitoring set up
- [ ] Error logging configured
- [ ] Rate limiting verified

---

## 🎉 You're Done!

Your application now supports:
- ✅ Google OAuth (existing)
- ✅ Apple OAuth (existing)
- ✅ Email/Password authentication (new)
- ✅ Email verification
- ✅ Password reset
- ✅ Unified user management

Users can choose their preferred sign-in method!
