# Local Debugging
run `vercel dev` to run the local service

# Setting up the environment
Create a .env file in the server directory with the variables detailed in [environment variables](environment-variables.md)

# Testing
## Unit testing
To test everything use `npm test`
Otherwise use `npm test script.test.ts`

## Debug tests
Start debugger in terminal `npm run debug`
Run the actual test `npm test XXX`

## Simpsons Characters
We have named some operational tasks and emails after simpsons characters. 
See [Operations](documentation/Operations.md) for a complete list of characters and their roles.

Willie, Dr Hibbert and Waylon can be executed manually as follows
```
cd housekeeping
ts-node .\summon.ts willie
ts-node .\summon.ts drhibbert
ts-node .\summon.ts waylon
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


# Data Utilities

## Environment Check
Run the following script to verify which database your local environment is currently interacting with (Production vs Test).
```bash
npx ts-node housekeeping/dbCheck.ts
```

## Refreshing Sketch Data
Missing sketch data is refreshed every day by Willie.
This can be done manualy using `npm run sketch`

## Authentication
### Apple
* https://developer.apple.com/account/resources/identifiers/list/serviceId
Service identifier : ga.kneeboard
Sign In with Apple > Configure > Website URLs.
### Google
* https://console.cloud.google.com/apis/credentials?pli=1&project=kneeboard
Client ID : 864395393673-li5elss3gtbhipp6pdjs1pbgbl0866si.apps.googleusercontent.com

