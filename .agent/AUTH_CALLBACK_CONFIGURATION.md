# Auth Callback URL Configuration

## Summary

The auth callback URL is used when users click the email verification link sent by Supabase. This document explains where and how to configure it.

---

## 1. In Your Code ✅ (Already Configured)

### Frontend - Email Verification Redirect

**File:** `ui/src/components/signin/EmailPasswordAuth.vue`

```javascript
await supabase!.auth.signUp({
  email: signupEmail.value,
  password: signupPassword.value,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,  // ← Callback URL
    data: {
      full_name: signupName.value.trim()
    }
  }
})
```

This dynamically sets the callback URL based on your environment:
- **Local:** `http://localhost:5173/auth/callback`
- **Production:** `https://yourdomain.com/auth/callback`

### Frontend - Callback Route Handler

**File:** `ui/src/router/index.js`

```javascript
{ path: '/auth/callback', name: RouterNames.AuthCallback, component: AuthCallback }
```

**File:** `ui/src/views/AuthCallback.vue`

Handles the redirect after email verification:
1. Shows "Verifying..." message
2. Supabase automatically processes the verification
3. Redirects user to home page after 2 seconds

---

## 2. In Supabase Dashboard ⚠️ (YOU MUST CONFIGURE THIS)

### Steps to Configure:

1. **Go to Supabase Dashboard**
   - URL: https://app.supabase.com
   - Select your project

2. **Navigate to Authentication → URL Configuration**
   - Left sidebar: **Authentication**
   - Click: **URL Configuration**

3. **Configure Site URL**
   
   Set the **Site URL** to your main application URL:
   
   **For Development:**
   ```
   http://localhost:5173
   ```
   
   **For Production:**
   ```
   https://yourdomain.com
   ```

4. **Add Redirect URLs**
   
   In the **Redirect URLs** section, add BOTH:
   
   ```
   http://localhost:5173/auth/callback
   https://yourdomain.com/auth/callback
   ```
   
   **Important:** 
   - Add one URL per line
   - Include both development and production URLs
   - Replace `yourdomain.com` with your actual domain

5. **Click Save**

---

## 3. Password Reset Callback

The password reset also uses a callback URL:

**File:** `ui/src/components/signin/EmailPasswordAuth.vue`

```javascript
await supabase!.auth.resetPasswordForEmail(resetEmail.value, {
  redirectTo: `${window.location.origin}/auth/reset-password`
})
```

### Additional Redirect URL to Add:

In Supabase Dashboard → Authentication → URL Configuration, also add:

```
http://localhost:5173/auth/reset-password
https://yourdomain.com/auth/reset-password
```

**Note:** You'll need to create a password reset page at `/auth/reset-password` if you want to handle password resets. For now, you can redirect to home or show an error.

---

## 4. Testing the Callback

### Test Email Verification:

1. Sign up with a new email
2. Check your email inbox
3. Click the verification link
4. You should be redirected to: `http://localhost:5173/auth/callback`
5. See "Email verified! Redirecting..." message
6. Automatically redirected to home page

### If It Doesn't Work:

**Error: "Invalid redirect URL"**
- ✅ Check that you added the callback URL to Supabase Dashboard
- ✅ Make sure the URL exactly matches (including `http://` or `https://`)
- ✅ Click Save in Supabase Dashboard

**Error: 404 Not Found**
- ✅ Check that the route is added to `router/index.js`
- ✅ Check that `AuthCallback.vue` exists
- ✅ Restart your dev server

---

## 5. Production Deployment Checklist

Before deploying to production:

- [ ] Update Supabase Site URL to production domain
- [ ] Add production callback URLs to Supabase:
  - [ ] `https://yourdomain.com/auth/callback`
  - [ ] `https://yourdomain.com/auth/reset-password`
- [ ] Test email verification in production
- [ ] Test password reset in production

---

## 6. Current Status

✅ **Code configured** - Callback URL is set in `EmailPasswordAuth.vue`
✅ **Route created** - `/auth/callback` route added to router
✅ **Handler created** - `AuthCallback.vue` component created
⚠️ **Supabase Dashboard** - YOU NEED TO ADD THE URLS (see section 2)

---

## Quick Reference

### Callback URLs to Add to Supabase:

**Development:**
```
http://localhost:5173/auth/callback
http://localhost:5173/auth/reset-password
```

**Production:**
```
https://yourdomain.com/auth/callback
https://yourdomain.com/auth/reset-password
```

### Where to Add Them:

Supabase Dashboard → Authentication → URL Configuration → Redirect URLs

---

## Need Help?

If you're having issues:
1. Check the browser console for errors
2. Check Supabase Dashboard → Authentication → Logs
3. Verify the URLs match exactly (no trailing slashes, correct protocol)
