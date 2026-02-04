
### Automated Agents & Characters
We have named operational tasks and emails after Simpsons characters. Some are automated agents (cron jobs), while others represent system notifications.

| Character.      | Role                   | Trigger                  |
|-----------------|------------------------ |-------------------------|
| **Dr. Hibbert** | System Health Checks   | Daily Cron @ 2:05 AM PT  |
| **Willie**      | Housekeeping (Refills) | Daily Cron @ 1:05 AM PT  |
| **Waylon**      | Metrics Reporting      | Daily Cron @ 5:05 AM PT  |
| **Marge**       | Airport Sketch Updates | Daily Cron @ 11:05 PM PT |
| **Ralph**       | User Feedback Emails   | User Feedback Received.  |
| **Ned**         | New User Emails        | New User Signup.         |
| **Apu**         | Customer Emails        | User Purchase.           |

All automated agents send emails and save a record in the database.

Note: Trigger times fluctuate sometimes by almost +/- 1h

# Effective date management




Adip is returning effective data in getAirportCurrentEffectiveDate() which is reading from EFFECTIVE_DATE environment variable, defaulting to 

## Refresh effective date
* Refresh EFFECTIVE_DATE in Vercel environment variables for ga-api
* Refresh AERONAV_DATA_CYCLE in Vercel environment variables for ga-api
  -> This is used by automated sketch updates and manualSketchUpdate
  -> Value comes from Adip API getAirportChartData(cycle)
* Refresh Adip.defaultEffectiveDate in [AdipService.ts](../backend/services/AdipService.ts) (starting date)

## Checks
Effective date is checked by Dr Hibbert every day which invokes HealthChecks.perform()

## Monthly refills 
Willie cron job triggers Maintenance.willie() which calls HouseKeeping.perform(). This calls Business.freePrintRefills() to identify users needing credit refills by account type. UserDao.refill() updates print_credit column for qualifying users below threshold. UsageDao.refill() logs refill events. Refills target specific account types (Student, Private) with predetermined credit amounts based on subscription tiers.

## Tests
[constants.ts](../test/constants.ts) defines currentAsOf as a constant which is used to check API return value

If a test fails, this is a good place to start
