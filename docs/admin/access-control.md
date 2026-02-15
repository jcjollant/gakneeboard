# Supabase Access Control Configuration

This guide explains how to restrict admin panel access to select users only.

## 🔒 Access Control Methods

### Method 1: Disable Public Signups (CRITICAL - Do This First!)

**This is the most important security step** - it prevents anyone from creating their own account.

#### Steps:

1. Go to your Supabase Dashboard: https://vgobjzmkbzfvnbfibmva.supabase.co
2. Navigate to **Authentication** → **Settings**
3. Scroll down to **Auth Providers**
4. Find **Email** provider
5. **Disable**: "Enable email signup"
6. Click **Save**

✅ **Result**: Now only you (as the Supabase admin) can create user accounts through the dashboard.

---

### Method 2: Email Whitelist (IMPLEMENTED ✅)

An email whitelist has been added to the authentication middleware to provide an additional layer of security.

#### How It Works:

The middleware (`/middleware/auth.global.ts`) now checks if the authenticated user's email is in the `AUTHORIZED_ADMINS` list:

```typescript
const AUTHORIZED_ADMINS = [
  'admin@kneeboard.ga',
  'jc@kneeboard.ga',
  // Add more authorized admin emails here
]
```

**What happens:**
- ✅ User with whitelisted email → Access granted
- ❌ User with non-whitelisted email → Logged out and redirected with error message
- The login page displays: _"Access denied. Your account is not authorized to access this admin panel."_

#### How to Add/Remove Users:

**To add a new admin:**

1. Open `/Users/jc/src/gakneeboard/admin/middleware/auth.global.ts`
2. Add their email to the `AUTHORIZED_ADMINS` array:
   ```typescript
   const AUTHORIZED_ADMINS = [
     'admin@kneeboard.ga',
     'jc@kneeboard.ga',
     'newadmin@example.com',  // <- Add here
   ]
   ```
3. Save the file
4. The dev server will auto-reload

**To remove an admin:**
1. Remove their email from the array
2. Save the file
3. They will be immediately logged out on their next page navigation

---

### Method 3: Manually Manage User Accounts

Only create accounts for people you want to have access.

#### Create a New Admin User:

**Option A: Via Supabase Dashboard**

1. Go to https://vgobjzmkbzfvnbfibmva.supabase.co
2. Navigate to **Authentication** → **Users**
3. Click **Add User** → **Create new user**
4. Enter the authorized user's email (must be in your whitelist!)
5. Set a secure password
6. Click **Create user**

**Option B: Via SQL (Advanced)**

Go to SQL Editor in Supabase Dashboard:

```sql
-- Create a new admin user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_sent_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'newadmin@kneeboard.ga',  -- Change this email
  crypt('SecurePassword123!', gen_salt('bf')),  -- Change this password
  NOW(),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);
```

#### Revoke User Access:

**Option A: Via Dashboard**
1. Go to **Authentication** → **Users**
2. Find the user
3. Click the **•••** menu
4. Select **Delete user**

**Option B: Via SQL**
```sql
-- Delete a user by email
DELETE FROM auth.users WHERE email = 'user@example.com';
```

---

### Method 4: User Metadata & Roles (Advanced - Optional)

For more complex scenarios, you can add custom metadata to users.

#### Add Admin Role to User:

Go to SQL Editor:

```sql
-- Update user metadata to include admin role
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  raw_user_meta_data,
  '{role}',
  '"admin"'
)
WHERE email = 'admin@kneeboard.ga';
```

#### Check Role in Middleware:

You could extend the middleware to check for roles:

```typescript
// In middleware/auth.global.ts
const userMetadata = session.user?.user_metadata
const userRole = userMetadata?.role

if (userRole !== 'admin') {
  await supabase.auth.signOut()
  return navigateTo('/login?error=unauthorized')
}
```

---

## 🛡️ Security Best Practices

### ✅ Recommended Configuration:

1. **Disable public signups** in Supabase settings
2. **Use the email whitelist** in middleware (already implemented)
3. **Manually create accounts** only for authorized admins
4. **Use strong passwords** for all admin accounts
5. **Enable email confirmation** (optional, in Auth Settings)
6. **Set JWT expiry** to a reasonable time (default: 3600s)
7. **Use MFA** (Multi-factor authentication) for critical admins (coming soon to Supabase)

### ❌ What NOT to Do:

- ❌ Don't leave public signups enabled
- ❌ Don't use weak passwords
- ❌ Don't share admin credentials
- ❌ Don't hardcode passwords in code
- ❌ Don't commit `.env` file to git (it's already in `.gitignore`)

---

## 🔍 Current Configuration Status

### ✅ What's Already Secured:

- [x] Email whitelist middleware
- [x] Supabase authentication required
- [x] Unauthorized users are logged out
- [x] Error messages for unauthorized access
- [x] Session validation on every route

### ⚠️ What You Need to Do:

- [ ] Disable public signups in Supabase Dashboard (see Method 1)
- [ ] Update the `AUTHORIZED_ADMINS` list with your emails
- [ ] Create initial admin users in Supabase
- [ ] Test login with authorized email
- [ ] Test that unauthorized emails are rejected

---

## 🧪 Testing Access Control

### Test 1: Authorized User

1. Add your email to `AUTHORIZED_ADMINS` in `/middleware/auth.global.ts`
2. Create a user with that email in Supabase
3. Try to login at http://localhost:3000/login
4. ✅ Expected: Successfully logged in and redirected to dashboard

### Test 2: Unauthorized User

1. Create a user in Supabase with an email NOT in `AUTHORIZED_ADMINS`
2. Try to login with those credentials
3. ✅ Expected: Logged in briefly, then immediately logged out with error message:
   _"Access denied. Your account is not authorized to access this admin panel."_

### Test 3: No Account

1. Try to login with an email that doesn't exist in Supabase
2. ✅ Expected: Error message: _"Invalid login credentials"_

---

## 🎯 Quick Setup Checklist

Complete these steps to fully secure your admin panel:

- [ ] **Step 1**: Disable public signups in Supabase Dashboard
- [ ] **Step 2**: Edit `/middleware/auth.global.ts` and update `AUTHORIZED_ADMINS` with your email(s)
- [ ] **Step 3**: Create your first admin user in Supabase with an email from the whitelist
- [ ] **Step 4**: Test login with authorized email
- [ ] **Step 5**: (Optional) Test with unauthorized email to verify rejection
- [ ] **Step 6**: Document admin emails in a secure location (not in git)

---

## 📝 Managing Admins Over Time

### Adding a New Admin:

1. Add their email to `AUTHORIZED_ADMINS` array
2. Create their account in Supabase Dashboard
3. Share login credentials securely (use password manager or secure channel)
4. Have them change their password on first login

### Removing an Admin:

1. Remove their email from `AUTHORIZED_ADMINS` array
2. Delete their account from Supabase Dashboard
3. They will be immediately logged out

### Temporary Access (Emergency):

1. Add email to whitelist
2. Create account with temporary password
3. When done, remove from whitelist and delete account

---

## 🆘 Troubleshooting

### "I'm blocked from my own admin panel!"

**Solution:**
1. Check that your email is in `AUTHORIZED_ADMINS` in `/middleware/auth.global.ts`
2. Make sure the email matches exactly (case-sensitive)
3. Save the file and let the dev server reload
4. Clear your browser localStorage and try again

### "Users can still sign up!"

**Solution:**
1. Go to Supabase Dashboard → Authentication → Settings
2. Verify "Enable email signup" is **disabled**
3. If it was enabled, disable it and save

### "Authorized user gets 'Access denied'"

**Solution:**
1. Check spelling of email in `AUTHORIZED_ADMINS` array
2. Verify the email in Supabase matches exactly
3. Check browser console for errors
4. Try logging out and back in

---

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)

---

**Current Status**: ✅ Email whitelist is active and protecting your admin panel!

**Next Step**: Go to Supabase Dashboard and disable public signups (Method 1 above).
