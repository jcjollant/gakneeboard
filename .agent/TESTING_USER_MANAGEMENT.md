# Testing Email Authentication - User Management Guide

## The Problem

When testing email authentication, you create and delete users in Supabase. However, **your application database still has the user record**, which causes issues when you try to recreate the same user.

### What Happens:

1. **First signup**: User created in both Supabase and your database ✅
2. **Delete in Supabase**: User removed from Supabase ✅
3. **Your database**: User still exists ❌
4. **Try to signup again**: 
   - Supabase creates new user ✅
   - Your backend tries to create user → **ERROR** ❌
   - Error: `"Cannot save existing user without overwrite"`

---

## Solution 1: Use Email Aliases (Recommended for Testing)

Instead of deleting and recreating, use different email addresses that all go to your inbox.

### Gmail Trick:

All these emails go to the same inbox but are treated as different users:

```
yourname+test1@gmail.com
yourname+test2@gmail.com
yourname+test3@gmail.com
yourname+supabase1@gmail.com
yourname+dev@gmail.com
```

**How it works:**
- Gmail ignores everything after the `+` sign
- All emails arrive at `yourname@gmail.com`
- Supabase treats them as unique users
- Your database treats them as unique users

**Other email providers that support this:**
- Outlook: `yourname+test@outlook.com`
- ProtonMail: `yourname+test@protonmail.com`
- Most modern email providers

### Benefits:
✅ No need to delete users
✅ Keep test history
✅ Test multiple accounts simultaneously
✅ No database cleanup needed

---

## Solution 2: Cleanup Script (For When You Need to Delete)

I've created a CLI tool to help you clean up test users from your database.

### Usage:

```bash
cd server
npm run cleanup-test-users
```

### Features:

**1. List all Supabase users:**
```bash
npm run cleanup-test-users
# Enter: list
```

Output:
```
📋 Supabase Users:
────────────────────────────────────────────────────────────────────────────────
ID: 123 | Email: test@example.com | Name: Test User | Created: 2026-02-11
ID: 124 | Email: john@example.com | Name: John Doe | Created: 2026-02-10
────────────────────────────────────────────────────────────────────────────────
Total: 2 users
```

**2. Delete a specific user:**
```bash
npm run cleanup-test-users
# Enter: test@example.com
```

Output:
```
📌 Found user:
   ID: 123
   Email: test@example.com
   Name: Test User
   SHA256: abc123...

⚠️  Delete this user? (yes/no): yes
✅ User deleted from database
⚠️  Remember to also delete from Supabase Dashboard if needed!
```

### Important Notes:

⚠️ **This only deletes from YOUR database**, not from Supabase
⚠️ **You still need to delete from Supabase Dashboard manually**

---

## Solution 3: Manual SQL Cleanup

If you prefer to use SQL directly:

### Connect to Your Database:

```bash
# Using Vercel CLI
vercel env pull
# Then use your database connection string
```

### Find the User:

```sql
SELECT id, data->>'email' as email, data->>'name' as name, source, sha256
FROM users
WHERE source = 'supabase' 
  AND data->>'email' = 'your-test-email@example.com';
```

### Delete the User:

```sql
DELETE FROM users 
WHERE source = 'supabase' 
  AND data->>'email' = 'your-test-email@example.com';
```

Or by ID:
```sql
DELETE FROM users WHERE id = 123;
```

### Delete All Supabase Test Users:

⚠️ **CAREFUL - This deletes ALL Supabase users!**

```sql
-- First, see what will be deleted
SELECT id, data->>'email' as email, data->>'name' as name
FROM users
WHERE source = 'supabase';

-- Then delete (only if you're sure!)
DELETE FROM users WHERE source = 'supabase';
```

---

## Complete Testing Workflow

### Recommended Approach (Using Email Aliases):

1. **First test**: `yourname+test1@gmail.com`
2. **Second test**: `yourname+test2@gmail.com`
3. **Third test**: `yourname+test3@gmail.com`
4. **Continue as needed...**

**No cleanup needed!** ✨

### Alternative Approach (Using Cleanup Script):

1. **Test with**: `test@example.com`
2. **Delete from Supabase Dashboard**:
   - Go to Authentication → Users
   - Find the user
   - Click the three dots → Delete user
3. **Delete from your database**:
   ```bash
   cd server
   npm run cleanup-test-users
   # Enter: test@example.com
   # Confirm: yes
   ```
4. **Repeat testing**

---

## Deleting Users from Supabase Dashboard

### Steps:

1. Go to https://app.supabase.com
2. Select your project
3. Go to **Authentication** → **Users**
4. Find the user you want to delete
5. Click the **three dots (⋮)** on the right
6. Click **Delete user**
7. Confirm deletion

### Bulk Delete:

Supabase doesn't have a UI for bulk delete, but you can use SQL:

1. Go to **SQL Editor** in Supabase Dashboard
2. Run:
   ```sql
   -- See all users
   SELECT * FROM auth.users;
   
   -- Delete a specific user
   DELETE FROM auth.users WHERE email = 'test@example.com';
   
   -- Delete all users (CAREFUL!)
   DELETE FROM auth.users;
   ```

---

## Best Practices for Testing

### Development:

✅ **Use email aliases** (`yourname+test1@gmail.com`)
✅ **Keep test users** for regression testing
✅ **Use descriptive names** (`yourname+signup-flow@gmail.com`)

### Staging:

✅ **Create dedicated test accounts**
✅ **Document test credentials** in a secure place
✅ **Clean up periodically** using the cleanup script

### Production:

❌ **Never use test accounts** in production
❌ **Never delete real users** without proper process
✅ **Use separate Supabase project** for production

---

## Troubleshooting

### "Cannot save existing user without overwrite"

**Cause:** User exists in your database but not in Supabase

**Fix:**
1. Delete from your database using cleanup script
2. Or use a different email address

### "User already registered"

**Cause:** User exists in Supabase but not in your database

**Fix:**
1. Delete from Supabase Dashboard
2. Or use a different email address

### "Email already exists"

**Cause:** User exists in both Supabase and your database

**Fix:**
1. Sign in instead of signing up
2. Or delete from both places and start fresh
3. Or use a different email address

---

## Quick Reference

### List Supabase users in your database:
```bash
npm run cleanup-test-users
# Enter: list
```

### Delete a test user from your database:
```bash
npm run cleanup-test-users
# Enter: test@example.com
```

### Use email aliases (no cleanup needed):
```
yourname+test1@gmail.com
yourname+test2@gmail.com
yourname+test3@gmail.com
```

---

## Summary

**For Testing:** Use email aliases (`+test1`, `+test2`, etc.) - No cleanup needed! ✨

**For Cleanup:** Use `npm run cleanup-test-users` to remove users from your database

**Remember:** Always delete from BOTH Supabase and your database if you want to fully remove a user
