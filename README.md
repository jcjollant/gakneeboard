## Local Debugging
run `vercel dev` to run the local service

## Unit testing
To test everything use `npm test`
Otherwise use `npm test script.test.ts`

## Debug tests
Start debugger in terminal `npm run debug`
Run the actual test `npm test XXX`

## Houskeeping and Metrics
Housekeeper willie is a script that checks system heath . It is invoked everyday via a cron entry in `vercel.json`. 
Waylon (Smithers) is reporting metrics and is also invoked everyday via cron
To run script manually use
```
cd housekeeping
ts-node .\willie.ts
ts-node .\waylon.ts
```
## Manual Data backup
Open pgAdmin 4
Select Table
Menu Tools > Import/Export Data
Save files in c:\src\kneeboard.ga\data

## New Data Cycle
Refresh currentEffectiveDate in backend/adip/Adip.ts
Refresh currentAsOf in test/constants.ts

## Authentication
### Apple
* https://developer.apple.com/account/resources/identifiers/list/serviceId
Service identifier : ga.kneeboard
Sign In with Apple > Configure > Website URLs.
### Google
* https://console.cloud.google.com/apis/credentials?pli=1&project=kneeboard
Client ID : 864395393673-li5elss3gtbhipp6pdjs1pbgbl0866si.apps.googleusercontent.com

## TODO
* 
