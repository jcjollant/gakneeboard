# Implementation Plan: Airport Deduplication & Schema Update

## Objective
Remedy the issue where airports are duplicated in the database due to having both a Location ID (`locId`) and an ICAO ID (`icaoId`). This redundancy increases storage costs and API calls.

## Proposed Solution
We will transition from a single `code` column to a dual-identifier system where each airport record stores both its `locId` (e.g., "123") and `icaoId` (e.g., "K123").

### 1. Database Schema Changes (`Airports` table)
Current Schema: `id`, `code` (mixed), `data` (json), `version`, `source`...

**New Schema:**
- **Add Column**: `loc_id` (VARCHAR, Nullable - or indexed)
- **Rename Column**: `code` -> `icao_id` (This will be the primary canonical identifier)
- **Constraint**: Unique constraint on `icao_id` (and potentially `loc_id` where not null?)

### 2. Migration Strategy (The "Smart" Remediation)
We need a migration script to clean up the existing data.
1.  **Iterate** through all records.
2.  **Parse** the `data` JSON.
    - The `icaoId` is NOT a separate key in the existing data. It is stored in the `code` key.
    - **Logic**:
        - If `data.code` is 4 letters (e.g. 'KLAX', 'PHNL'), treat it as correct `icao_id`. Derive `loc_id` by stripping the leading 'K' (or 'P' logic?).
        - If `data.code` is 3 alphanumeric (e.g. 'LAX', '123'), treat it as `loc_id`. Derive potential `icao_id` by prepending 'K' (standard US logic, roughly).
    - **Refinement**: To be safe, we might need to rely on matching strictly by `loc_id` if we can derive it from the ICAO record.
3.  **Update**:
    - Populate the new `loc_id` and `icao_id` columns based on this derivation.
4.  **Deduplicate (Simpler Logic)**:
    - **Identify**: Compare the table column `code` with the JSON field `data.code`.
    - **Logic**:
        - If `row.code == row.data.code`: This is a valid ICAO record (Primary). Keep it.
        - If `row.code != row.data.code`: This indicates the record was fetched via `locId` but refers to an ICAO airport. This is a "Duplicate/Redundant" record.
    - **Action**:
        - **Data Preservation**: Before deleting, ensure the corresponding "Primary" record (where `code == row.data.code`) has its `loc_id` column populated with this row's `code` (e.g., if row.code='123' and data.code='K123', set K123's loc_id='123').
        - **Mark for Deletion**: Update the `code` of the redundant record to start with `!` (e.g., `!123`).
        - **Delete**: Execute `DELETE FROM Airports WHERE code LIKE '!%'`.
5.  **Finalize**: Apply the column rename (`code` -> `icao_id`) and constraints.

### 3. Backend Code Updates
- **`models/Airport.ts`**:
    - Add `locId: string` and `icaoId: string`.
    - Deprecate specific reliance on a generic `code` field where possible, or make `code` a getter that prefers ICAO.
- **`services/AdipService.ts`**:
    - Ensure `parseAirport` populates both `locId` and `icaoId` from the ADIP response.
- **`dao/AirportDao.ts`**:
    - Update `create()`: Write to both `icao_id` and `loc_id` columns.
    - Update `codesLookup()`: This is the critical performance fix.
        - **Old**: `WHERE code = ANY(list)`
        - **New**: `WHERE icao_id = ANY(list) OR loc_id = ANY(list)`
        - Logic: If user asks for '123', the query finds the row where `loc_id='123'`. The returned object is the full airport (which might be 'K123').
        - The service needs to map this result back so the user gets the airport they asked for, even if the primary key is different.

### 4. Frontend Considerations
- Does the frontend strictly require the `code` to match what it requested?
- *Verification needed*: If the UI requests '123' and receives an object with `code: 'K123'`, does it break maps/lists?
- *Mitigation*: The `CodeAndAirport` object usage in `AirportService` effectively maps request codes to result objects, shielding the frontend from this change.

## Questions for User
1.  **Deduplication Logic**: If we find a duplicate (one '123', one 'K123'), and *both* have user sketches, which one should survive? (Currently assuming: take the most recently updated one).
2.  **Renaming**: Are you comfortable renaming the DB column `code` to `icao_id`, or should we keep it as `code` but treat it strictly as ICAO? (Renaming is cleaner but requires more careful migration).

## Action Plan
1.  [ ] Write Migration Script (`scripts/dedup_airports.ts`) to analyze and report on duplicates.
2.  [ ] Review duplicate report.
3.  [ ] Execute migration (add cols, data fix, dedup).
4.  [ ] Refactor Backend Code (`Airport.ts`, `AdipService.ts`, `AirportDao.ts`).
5.  [ ] Verify `AirportService.getAirports` handles mixed ICAO/LocId lists correctly.
