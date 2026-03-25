# Server CLI Tools

This document provides a summary of the command-line interface (CLI) scripts available in the `server/cli` directory. These scripts are typically executed using `npx ts-node cli/<script_name>.ts` (or `npx tsx`) from within the `server/` directory. They serve various administrative, maintenance, and debugging purposes.

## Maintenance and Housekeeping

*   **`healthCheck.ts`**: Runs system health checks to verify that external integrations and critical services are responsive and functioning correctly.
*   **`houseKeeping.ts`**: Executes scheduled housekeeping tasks. This includes granting monthly free print refills, triggering updates for missing airport sketches, and cleaning up abandoned template histories or print orders.
*   **`summon.ts`**: Invokes specific automated maintenance routines identifiable by character names (e.g., "willie").
*   **`updateCycle.ts`**: Checks for updates to the FAA Aeronav data cycle, and automatically configures relevant Vercel environment variables if a new cycle is available.
*   **`setVercelEnv.ts`**: Sets or updates project-level Vercel environment variables for specified deployment targets (`production`, `preview`, `development`).
*   **`updateVersion.ts`**: Automates updating the application version values consistently across required project files.
*   **`testRedeploy.ts`**: Triggers a manual redeploy of the application on Vercel.
*   **`swapTileDisplayMode.ts`**: Performs a mass migration of tile types or display modes across all existing templates in the database.

## Data Fetching and Updating

*   **`fetchAdipCycle.ts`**: Connects to the FAA's ADIP service to retrieve and display the current active aeronautical data cycle and effective dates.
*   **`manualFetchAirport.ts`**: Triggers a manual fetch of detailed data for a specific airport code (runways, frequencies, charts) and outputs the full JSON data.
*   **`manualFetchMetar.ts`**: Manually requests METAR weather data for a specified airport code. Allows specifying various output formats like raw, decoded, JSON, or XML.
*   **`manualFetchNotams.ts`**: Manually fetches active NOTAMs (Notices to Air Missions) for a given airport, allowing filters for format and classification.
*   **`manualSketchUpdate.ts`**: Targets airports missing sketches and forces an update from ADIP. Supports bulk update, manual fetch dry-runs (`<ICAO>`), and manual PDF uploads (`<ICAO> <path>`).
*   **`refresh.sh`**: A shell script wrapper that launches the manual sketch update process. It is intended to be triggered periodically via system `cron` jobs.

## Database Utilities

*   **`analyzeDuplicates.ts`**: Scans database tables to identify data duplication or inconsistencies.
*   **`dedupAirports.ts`**: Specifically searches for and merges or removes duplicate airport records within the database to maintain data integrity.
*   **`dbCheck.ts`**: Performs basic integrity checks and validations directly against the PostgreSQL database.
*   **`createPrintTables.ts`**: Initializes or reconstructs the database tables required to manage the print ordering subsystem.

## User and Billing Management

*   **`cleanupTestUsers.ts`**: Purges test or dummy accounts and their associated usage data to keep production metrics clean.
*   **`manualUserChecks.ts`**: Queries and outputs diagnostic statistics for user accounts, such as maximum allowed templates, page limits, and assigned subscription plans.
*   **`setProdUserPlan.ts`**: Allows administrators to manually upgrade or modify the subscription plan of a specific production user.
*   **`fetchStripeSession.ts`**: Given a checkout session ID, securely fetches and displays details for a Stripe checkout session for debugging billing disputes or errors.
*   **`manualTicketCreation.ts`**: Creates a manual internal ticket with a specified severity level and custom message without going through the UI.

## Analytics

*   **`countChecklistItems.ts`**: Queries the database to aggregate and output usage statistics regarding how users are applying checklist items.
*   **`countTileType.ts`**: Analyzes kneeboard templates to determine the distribution and usage frequency of different UI tile types.
*   **`searchDisplayMode.ts`**: Scans all user templates to find occurrences of a specific tile type and display mode.
*   **`topAirports.ts`**: Analyzes and outputs the most popular airports used across all user-created templates.
