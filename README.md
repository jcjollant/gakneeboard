## Local Debugging
run `vercel dev` to run the local service

## Unit testing
To test everything use `npm test`
Otherwise use `npm test script.test.ts`

## Debug tests
Start debugger in terminal `npm run debug`
Run the actual test `npm test XXX`

## Simpsons Characters
We have named some operational tasks and emails after simpsons characters. 
Groundskeeper 'Willie' is a script that checks system heath . It is invoked everyday via a cron entry in `vercel.json`. 
'Waylon' Smithers is reporting metrics and is also invoked everyday via cron
'Ralph' Wiggum is sending an email every time we receive user feedback
'Ned' Flanders is sending an email every time we see a new user
'Apu' Nahasapeemapetilon is sending an email every time a user becomes a customer

Willie and Waylon can be executed manually as follows
```
cd housekeeping
ts-node .\willie.ts
ts-node .\waylon.ts
```


## Testing Stripe client
(installation) ``
With Stripe client
C:\src>stripe listen --forward-to localhost:3000/stripe/webhook

## Manual Data backup
Open pgAdmin 4
Select Table
Menu Tools > Import/Export Data
Save files in c:\src\kneeboard.ga\data

## New Data Cycle
see [Operations](documentation/Operations.md)

## Testing with Stripe
### Installation
(macos) brew install stripe/stripe-cli/stripe

### Usage
stripe listen --forward-to locashost:3000/webhook
Call http://localhost:3000/checkout with user and product

## Refreshing Sketch Data
1. Set database to prod
2. Run ga-api on port 3000 (vercel dev)
3. Run gak-sketcher on port 3001 (vercel dev)
4. Run ts-node housekeeping/manualSketchUpdate.ts

## Authentication
### Apple
* https://developer.apple.com/account/resources/identifiers/list/serviceId
Service identifier : ga.kneeboard
Sign In with Apple > Configure > Website URLs.
### Google
* https://console.cloud.google.com/apis/credentials?pli=1&project=kneeboard
Client ID : 864395393673-li5elss3gtbhipp6pdjs1pbgbl0866si.apps.googleusercontent.com

