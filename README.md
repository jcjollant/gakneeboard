## Local Debugging
run `vercel dev` to run the local service

## Unit testing
To test everything use `npm test`

Otherwise use `npm test script.test.ts`

## Debug tests
Start debugger in terminal `npm run debug`
Run the actual test `npm test XXX`

## Houskeeper Willie
Housekeeper willie is a script that checks system heath . It is invoked everyday via a cron entry in `vercel.json`. To run the script locally use
```
cd housekeeping
ts-node .\willie.ts
```

## TODO
* Struggling airports : KATL, KDNN, KCHA, KGVL

# Done
## 7/22
Added navaids to airport vue
## 7/21
Fixed the missing weather freq in version 7
Removed usage of unknowns which are now integrated with airports

## 7/17
* Implemented Sunrise API
## 7/16
* Fixed missing Asos/Awos frequency
## 7/13
* Fixed runway frequency bug
## 7/12
* Backend is now dynamically loading new FAA data when effective date is changed
## 6/29/2024
* Added emails to housekeeping
## 6/16/2024
* Daily process captures #Airport, #Users, #Feedbacks and effective date for a given airport
* Automatically catch when new publication is available
* Automatically refresh data when new publication is available
* Automatically catch duplicates
## 6/15/2024
* Custom airports creation
## 5/27/2024
* Create Users test
## ?
* Initial load in one pass (airports)
## 5/11/2024
* Removed all military frequencies from DBgith
* We are now filtering militray frequencies for ground, weather and tower
## 5/05/2024
* Functional airport list
* locId resultion from icao
* Improved unknown airports management
## 5/03/2024
* Improved testing and code reorg
## 4/28/2024  
* Remember partial codes in DB e.g "KAW" => not found
