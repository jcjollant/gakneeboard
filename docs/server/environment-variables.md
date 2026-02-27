# Server Environment Variables

The GAKneeboard server relies on the following environment variables for configuration.

| Variable | Description | Usage |
| :--- | :--- | :--- |
| `STRIPE_SECRET_KEY` | Stripe Secret API Key | Used for payment processing and subscription management. |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Secret | Verifies that incoming webhooks are from Stripe. |
| `STRIPE_HH1_PRICE` | Stripe Price ID | **[Deprecated]** Old HH1 price ID. |
| `STRIPE_PRICE_SP1` | Stripe Price ID | Price ID for the Student Pilot plan (SP1). |
| `STRIPE_PRICE_CR1` | Stripe Price ID | Price ID for the Checkride Ready plan (CR1). |
| `STRIPE_PRICE_PP3` | Stripe Price ID | Price ID for the Private Pilot plan (PP3). |
| `STRIPE_BD1_PRICE` | Stripe Price ID | **[Deprecated]** Old BD1 price ID. |
| `STRIPE_LD1_PRICE` | Stripe Price ID | **[Deprecated]** Old lifetime deal price ID. |
| `STRIPE_PRODUCT_REFCARD_PRICE` | Stripe Price ID | Price ID for the reference card product. |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob Token | Authentication token for Vercel Blob storage (read/write). |
| `BLOB_THUMBNAILS_DIRECTORY` | Vercel Blob Directory | Optional directory for storing thumbnails in Vercel Blob storage. |
| `POSTGRES_URL` | Database Connection String | URL for connecting to the PostgreSQL database. |
| `EFFECTIVE_DATE` | Date String | Overrides the current effective date for testing/historical data. |
| `NMS_API_URL` | NMS API URL | URL for the external NMS service (if used). |
| `NMS_API_KEY` | NMS API Key | API Key for the NMS service. |
| `NMS_API_SECRET` | NMS API Secret | Secret for the NMS service. |
| `AERONAV_DATA_CYCLE` | Cycle Number (e.g., 2312) | The current FAA data cycle expected by the server. |
| `SUPABASE_URL` | Supabase URL | URL for the Supabase project. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key | Admin key for Supabase operations (bypasses RLS). |
| `HEALTH_CHECK_ACCESS_KEY` | Health Check API Key | **[Required]** Key to bypass admin session requirement for `/admin/healthCheck`. Also checked by health monitors. |
| `VERCEL_TOKEN` | Vercel Access Token | **[Required]** Used by the Aeronav automation to update environment variables and trigger redeployments. |
| `VERCEL_PROJECT_ID` | Vercel Project ID | **[Required]** The ID of the Vercel project for the server. |
| `VERCEL_TEAM_ID` | Vercel Team ID | **[Required]** The ID of the Vercel team (or user) associated with the project. |
| `GOOGLE_ANALYTICS_TAG` | Google Analytics Tag | **[Required]** The GA4 Measurement ID (e.g. G-XXXXXXX) to track website events. |

## Usage Details

Most variables are checked on startup in `HealthCheck.environmentVariables`. Missing variables may cause the server to fail health checks or malfunction.

### Health Check Access
To invoke the health check endpoint from an automated tool (e.g., a monitoring service), set the `HEALTH_CHECK_ACCESS_KEY` variable on the server and include the header `x-health-check-access-key` with the same value in your request.
