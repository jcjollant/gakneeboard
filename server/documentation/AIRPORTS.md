Airports data is stored in 'airports' tables
Airport version indicate the data model version number.
When an airport is requested and its version is outdated, data is sanitized to the latest version.
Codes that are already unknown use the special version number -1, thereby creating a list of know unknowns

## Sketch Updates

### Overview

Airport sketches (diagrams) are updated through the CLI script `server/cli/manualSketchUpdate.ts`. This process involves fetching the Instrument Approach Procedure (IAP) PDF for an airport, extracting the sketch using an external service, and storing the resulting image.

### Schedule and Triggers

Sketches are fetched in two main ways:

1.  **Nightly Schedule ("Willie")**: An automated process runs the update script every night.
2.  **Manual Execution**: Developers can run the script manually via `npm run sketch`.

In both cases, the script specifically targets airports that **do not have a sketch** (database value is `NULL`).
*   It does **not** update airports that already have a valid sketch URL.
*   It does **not** retry airports marked as `dne` (Does KNot Exist), as these are considered "resolved" as having no sketch. To force a retry for a `dne` airport, the sketch field must be manually set to `NULL` in the database.

### CLI Script Usage

The script can be run via `npm run sketch` (mapped in `package.json`) or directly with `tsx`. It supports three modes:

1.  **Batch Update (No arguments):**
    *   Scans for up to 1000 airports that are missing a sketch.
    *   Updates the IAP PDF URL to the current cycle (defined by `AERONAV_DATA_CYCLE`).
    *   If no IAP exists, marks the sketch as `dne` (does not exist).
    *   If IAP exists, fetches and saves the sketch.
    *   Includes a random delay (3-7s) between updates to respect rate limits.

2.  **Single Airport Dry-Run:**
    *   Usage: `tsx cli/manualSketchUpdate.ts <AIRPORT_CODE>`
    *   Fetches the sketch for the specified airport but **does not save it** to the database or blob storage.
    *   Useful for testing if the external sketcher service is working for a specific airport without making changes.

3.  **Manual File Upload:**
    *   Usage: `tsx cli/manualSketchUpdate.ts <AIRPORT_CODE> <FILE_PATH>`
    *   Uploads a local image file as the sketch for the specified airport.
    *   Updates the database with the new blob URL.

### Technical Implementation

The logic is encapsulated in `server/backend/AirportSketch.ts`:

*   **`AirportSketch.resolve`**: The main orchestrator. It checks if an airport has IAPs. If not, it marks the sketch as "dne". If yes, it delegates to `get`.
*   **`AirportSketch.get`**: content the external service `https://gak-sketcher.vercel.app/api`. This service saves the PDF from the provided URL, extracts the airport diagram, and returns it as a PNG buffer.
*   **`AirportSketch.save`**: Uploads the PNG buffer to Vercel Blob storage (`sketch/{code}.png`) and updates the `airports` table in Postgres with the new public URL.

### Dependencies

*   **External Service**: `gak-sketcher` (Vercel app) is used for image processing to avoid heavy dependencies in the main API.
*   **Environment Variables**:
    *   `AERONAV_DATA_CYCLE`: The current cycle for constructing PDF URLs (e.g., "2401").
    *   `BLOB_READ_WRITE_TOKEN`: Required for uploading images to Vercel Blob.
    *   `POSTGRES_PROD_URL`: Optional. If set, the script interacts with the production database.
