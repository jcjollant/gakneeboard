### Automated Agents
We have two agents performing tasks at night. They are declared in vercel.json as cron entries

Willie (...88c4) is triggered at 2:05am UTC (7pm PT). It perform Heathchecks and Print refills
Waylong (..0992) is triggered at 12:05pm UTC (5am PT). Its computing metrics
Both agents send emails and save a record in the database.

Note: Trigger times fluctuate sometimes by alost +/- 1h

# Effective date management




Adip is returning effective data in getAirportCurrentEffectiveDate() which is reading from EFFECTIVE_DATE environment variable, defaulting to 

## Refresh effective date
* Refresh EFFECTIVE_DATE in Vercel environment variables for ga-api
* Refresh cycle constant in [manualSketchUpdate.ts](../housekeeping/manualSketchUpdate.ts)
* Refresh Adip.defaultEffectiveDate in [Adip.ts](../backend/adip/Adip.ts) (starting date)
* Refresh currentAsOf in test/constants.ts

## Checks
Effective date is checked by Willie every day

## Tests
[constants.ts](../test/constants.ts) defines currentAsOf as a constant which is used to check API return value

If a test fails, this is a good place to start
