# Admin Documentation

This directory contains all documentation related to the admin panel.

## 📚 Available Documentation

### Authentication & Security

- **[auth.md](./auth.md)** - Complete guide to Supabase authentication setup
  - How authentication works
  - Login flow
  - Session management
  - Environment variables
  - Troubleshooting

- **[access-control.md](./access-control.md)** - Configuring user access restrictions
  - Disabling public signups
  - Email whitelist configuration
  - Managing admin users
  - Role-based access (advanced)
  - Security best practices

### Quick Start

For a quick setup guide, see **[/admin/AUTH_SETUP.md](../../admin/AUTH_SETUP.md)** in the admin project directory.

## 🔗 Related Documentation

- **[../admin.md](../admin.md)** - General admin panel overview
- **[../Ticket.md](../Ticket.md)** - Ticket management system
- **[../store.md](../store.md)** - Store order management

## 📋 Quick Links

### First-Time Setup
1. Read [auth.md](./auth.md) to understand the authentication system
2. Follow [access-control.md](./access-control.md) to configure user access
3. Use [/admin/AUTH_SETUP.md](../../admin/AUTH_SETUP.md) for step-by-step setup

### Common Tasks
- **Add a new admin user**: See [access-control.md - Managing Admins](./access-control.md#managing-admins-over-time)
- **Troubleshoot login issues**: See [auth.md - Troubleshooting](./auth.md#troubleshooting)
- **Configure security settings**: See [access-control.md - Security Best Practices](./access-control.md#-security-best-practices)

## 🛠️ Admin Project Structure

```
/admin/                        # Admin project root
├── AUTH_SETUP.md             # Quick start guide
├── middleware/
│   └── auth.global.ts        # Authentication middleware with whitelist
├── pages/
│   ├── login.vue             # Login page
│   └── index.vue             # Admin dashboard
├── utils/
│   └── supabase.ts           # Supabase client configuration
└── .env                      # Environment variables (not in git)

/docs/admin/                  # Admin documentation (you are here)
├── README.md                 # This file
├── auth.md                   # Authentication guide
└── access-control.md         # Access control guide
```

## 🔐 Security Checklist

Before deploying to production, ensure:

- [ ] Public signups are disabled in Supabase
- [ ] Email whitelist is configured in middleware
- [ ] Strong passwords for all admin accounts
- [ ] Environment variables are secured
- [ ] `.env` is in `.gitignore`
- [ ] Session timeout is configured appropriately
- [ ] Only authorized emails are in `AUTHORIZED_ADMINS`

## 📞 Support

If you encounter issues not covered in the documentation:

1. Check the troubleshooting sections in each guide
2. Review the browser console for errors
3. Check Supabase Dashboard for authentication logs
4. Verify environment variables are set correctly

## 🎯 Next Steps

- [ ] Review the [authentication guide](./auth.md)
- [ ] Configure [access control](./access-control.md)
- [ ] Complete the [quick setup](../../admin/AUTH_SETUP.md)
- [ ] Create your first admin user
- [ ] Test the authentication flow
