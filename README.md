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
## 9/15/2024
* Metrics : Added valid and current airports, added adip.
* Metrics : reordered output
## 9/12/2024
* Experimenting with facebook login
## 9/04/2024
1) fixed pageCount metrics
2) New effective date
## 9/03/2024
* Airport code cleanup
* Custom TPA
## 8/29/2024
* Fixed authentication maxTemplate overwrite
## 8/28/2024
* Add navlog page count to report
* Added user mini to root
## 8/27/2024
* Added navlog to page count details (Waylon)
## 8/25/2024
* Adip is not saving raw data on effectiveDateCheck
## 8/23/2024
* Housekeeping methods moved to maintenance
## 8/22/2024
1) Adip is saving data
2) Mainteinance is able to trigger metrics
## 8/21/2024
* Added get maintenance
## 8/19/2024
* Improved unknown code management
## 8/18/2024
* Added Waylon that publishes metrics
## 8/14/2024
* Added support for ATC information
## 8/11/2024
* Root is now returning airport current effective date
## 8/08/2024
* Updated effective date
## 8/03/2024
1) Added publications to healthcheck
2) Aded publication code to GApi.sheetGet
## 8/02/2024
* Sheet sharing
## 7/23/2024
1) Fixed name bug affecting KBFF (When an airport has double blank in the name)
2) Extended Sunlight API to support different dates
## 7/22/2024
Added navaids to airport vue
## 7/21/2024
Fixed the missing weather freq in version 7
Removed usage of unknowns which are now integrated with airports
## 7/17/2024
* Implemented Sunrise API
## 7/16/2024
* Fixed missing Asos/Awos frequency
## 7/13/2024
* Fixed runway frequency bug
## 7/12/2024
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
