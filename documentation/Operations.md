### Automated Agents
We have two agents performing tasks at night. They are declared in vercel.json as cron entries

Willie (...88c4) is triggered at 2:05am UTC (7pm PT). It perform Heathchecks and Print refills
Waylong (..0992) is triggered at 12:05pm UTC (5am PT). Its computing metrics
Both agents send emails and save a record in the database.

Note: Trigger times fluctuate sometimes by alost +/- 1h