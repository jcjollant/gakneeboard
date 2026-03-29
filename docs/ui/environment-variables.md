# UI Environment Variables

This document lists the environment variables used in the GA Kneeboard UI project. Variables starting with `GAK_` are automatically exposed to the Vite environment.

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `GAK_API_URL` | The base URL for the backend API. Used by `UrlService.ts`. | `https://api.kneeboard.ga/` |
| `GAK_GOOGLE_CLIENT_ID` | The Google Client ID for Google Sign-In authentication. Used by `GoogleSignInButton.vue`. | |
| `GAK_USER_COUNT` | The number of pilots displayed on the FTUX (First Time User Experience) page. Used by `FTUX.vue`. | `250` |
| `GAK_GOOGLE_TAG_MANAGER` | The Google Tag Manager ID for analytics and tracking. Injected via `vite.config.js`. | `GTM-TMT48TDV` |
| `GAK_SUPABASE_URL` | The Supabase project URL for authentication and database access. Used by `SupabaseClient.ts`. | |
| `GAK_SUPABASE_ANON_KEY` | The Supabase anonymous key for client-side API access. Used by `SupabaseClient.ts`. | |

## Usage in Code

### Vue Components and Services

In the Vue components and services, these variables are typically accessed via:

```typescript
import.meta.env.GAK_VARIABLE_NAME
```

### index.html

Vite also performs replacement in `index.html`. Variables like `GAK_GOOGLE_TAG_MANAGER` and `GAK_GOOGLE_CLIENT_ID` are used there:

```html
<meta name="google-signin-client_id" content="%GAK_GOOGLE_CLIENT_ID%">
...
})(window,document,'script','dataLayer','%GAK_GOOGLE_TAG_MANAGER%');
```

Note: For variables used in `vite.config.js` or during build time, they are accessed via `process.env`.
