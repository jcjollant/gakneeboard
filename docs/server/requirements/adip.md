## Getting Chart data from adip
API at https://adip.faa.gov/agisServices/public-api/getAirportChartData
### Sample Payload
{locId: "RNT"}

### Interesting Fields
`cycle`: "2410" => contains the current document cycle which should be used to construct the URL
charts[n].chartCode: "IAP"
charts[n].chartName: "RNAV (GPS) RWY 34"
charts[n].pdfName: "05396R34.PDF"
### Actual PDF URI
https://aeronav.faa.gov/d-tpp/2409/05396RZ16.PDF
https://aeronav.faa.gov/d-tpp/{cycle}/
https://aeronav.faa.gov/d-tpp/2411/05396R34.PDF

### Sample response
{
    "cycle": "2410",
    "airportName": "",
    "locId": "RNT",
    "icaoId": "KRNT",
    "military": "N",
    "charts": [
        {
            "chartSeq": "10100",
            "chartCode": "MIN",
            "chartName": "TAKEOFF MINIMUMS",
            "pdfName": "NW1TO.PDF"
        },
        {
            "chartSeq": "10200",
            "chartCode": "MIN",
            "chartName": "ALTERNATE MINIMUMS",
            "pdfName": "NW1ALT.PDF"
        },
        {
            "chartSeq": "30000",
            "chartCode": "STAR",
            "chartName": "CHINS FIVE",
            "pdfName": "00582CHINS.PDF"
        },
        {
            "chartSeq": "30000",
            "chartCode": "STAR",
            "chartName": "CHINS FIVE, CONT.1",
            "pdfName": "00582CHINS_C.PDF"
        },
        {
            "chartSeq": "30000",
            "chartCode": "STAR",
            "chartName": "GLASR THREE",
            "pdfName": "00582GLASR.PDF"
        },
        {
            "chartSeq": "30000",
            "chartCode": "STAR",
            "chartName": "GLASR THREE, CONT.1",
            "pdfName": "00582GLASR_C.PDF"
        },
        {
            "chartSeq": "30000",
            "chartCode": "STAR",
            "chartName": "OLYMPIA TWO",
            "pdfName": "00582OLYMPIA.PDF"
        },
        {
            "chartSeq": "30000",
            "chartCode": "STAR",
            "chartName": "OLYMPIA TWO, CONT.1",
            "pdfName": "00582OLYMPIA_C.PDF"
        },
        {
            "chartSeq": "30000",
            "chartCode": "STAR",
            "chartName": "SKYKO ONE",
            "pdfName": "00582SKYKO.PDF"
        },
        {
            "chartSeq": "53525",
            "chartCode": "IAP",
            "chartName": "RNAV (GPS) RWY 34",
            "pdfName": "05396R34.PDF"
        },
        {
            "chartSeq": "53525",
            "chartCode": "IAP",
            "chartName": "RNAV (GPS) Y RWY 16",
            "pdfName": "05396RY16.PDF"
        },
        {
            "chartSeq": "53525",
            "chartCode": "IAP",
            "chartName": "RNAV (GPS) Z RWY 16",
            "pdfName": "05396RZ16.PDF"
        },
        {
            "chartSeq": "70000",
            "chartCode": "APD",
            "chartName": "AIRPORT DIAGRAM",
            "pdfName": "05396AD.PDF"
        },
        {
            "chartSeq": "90100",
            "chartCode": "DP",
            "chartName": "BELLEVUE FOUR",
            "pdfName": "05396BELLEVUE.PDF"
        },
        {
            "chartSeq": "90100",
            "chartCode": "DP",
            "chartName": "RENTN THREE",
            "pdfName": "05396RENTN.PDF"
        }
    ]
}

## Getting Airport Details from ADIP
API at https://adip.faa.gov/agisServices/public-api/getAirportDetails

## ADIP Table Behavior

### Purpose
The `adip` table serves as an **audit log** of all ADIP API calls made by the application. Every time the ADIP API is invoked, a new record is created in this table with:
- `code`: The airport code that was queried
- `data`: A recap of the response (currently just the response length)
- `create_time`: Timestamp of when the API call was made

### Expected Behavior
**A new record should be created in the `adip` table EVERY TIME the ADIP API is called.** This is intentional and correct behavior for audit/monitoring purposes.

### Airport Caching Strategy
To minimize ADIP API calls, the application uses the `airports` table as a cache:

1. **First Request**: When an airport code is requested for the first time:
   - ADIP API is called → record created in `adip` table
   - Airport data is parsed and stored in `airports` table with:
     - `version`: Current model version (currently 15)
     - `effectiveDate`: ADIP effective date from environment variable

2. **Subsequent Requests**: When the same airport code is requested again:
   - Airport is retrieved from `airports` table
   - **Staleness check** determines if refresh is needed:
     - `modelIsStale`: `airport.version < Airport.currentVersion`
     - `dataIsStale`: `airport.effectiveDate < AdipService.currentEffectiveDate()`
   - **ADIP API should NOT be called** if:
     - Airport version matches current version (15)
     - Airport effective date matches current effective date
     - Airport is not a custom airport

3. **Refresh Scenarios** (when ADIP API IS called again):
   - Model version has been upgraded (e.g., 14 → 15)
   - Effective date has changed (new ADIP data cycle)
   - Airport is marked for refresh for other reasons

### Troubleshooting Excessive ADIP Calls
If you see many `adip` table records for the same airport code:
1. Check if `airport.version` matches `Airport.currentVersion` (15)
2. Check if `airport.effectiveDate` matches `AdipService.currentEffectiveDate()`
3. Verify the staleness logic in `AirportService.getAirports()` (line 144)
4. Ensure custom airports (`airport.custom = true`) are not being refreshed
