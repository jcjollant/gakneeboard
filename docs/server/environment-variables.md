# Server Environment Variables

The GAKneeboard server relies on the following environment variables for configuration.

| Variable | Description | Usage |
| :--- | :--- | :--- |
| `STRIPE_SECRET_KEY` | Stripe Secret API Key | Used for payment processing and subscription management. |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Secret | Verifies that incoming webhooks are from Stripe. |
| `STRIPE_HH1_PRICE` | Stripe Price ID | Price ID for a specific product/plan (HH1). |
| `STRIPE_PP1_PRICE` | Stripe Price ID | Price ID for a specific product/plan (PP1). |
| `STRIPE_PP2_PRICE` | Stripe Price ID | Price ID for a specific product/plan (PP2). |
| `STRIPE_BD1_PRICE` | Stripe Price ID | Price ID for a specific product/plan (BD1). |
| `STRIPE_LD1_PRICE` | Stripe Price ID | Price ID for a specific product/plan (LD1). |
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

## Usage Details

Most variables are checked on startup in `HealthCheck.environmentVariables`. Missing variables may cause the server to fail health checks or malfunction.

### Health Check Access
To invoke the health check endpoint from an automated tool (e.g., a monitoring service), set the `HEALTH_CHECK_ACCESS_KEY` variable on the server and include the header `x-health-check-access-key` with the same value in your request.
