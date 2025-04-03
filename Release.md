## 04/03/2025 5141
* New Users are created with print credits
## 03/31/2025 5140
* Fixed Wille effectiveDateCheck
## 03/29/2025 5134
* Disabled auto diagram
* Checking users for invalid source
* Checking airports without diagram
## 03/28/2025 5133
* Re-Enabled auto Diagram
## 03/27/2025 5132
* Allowing for maxTemplate override
## 03/26/2025 5131
* Customers metric
* Save restriction on sim accounts
## 03/24/2025 5130
* Airport Tile Diagrams
## 03/19/2025 5126
* New Effective date
## 3/18/2025 5125
* Fixed version bug
## 3/16/2025 5123
1) 5123
* Fixed Willie
2) 5124
* Better page management
## 3/15/2025 5120 5130 5122
1) 5120
* Over template logic
2) 5130
* Added templates to email string
3) 5122
* Export logic with warning challenge
## 03/10/2025 5110
* Progress with metering
## 03/03/2025 5102
* Adjusted metrics
## 03/02/2025
1) 5100
* Added ILS Loc to airport frequencies
2) 5101
* Returning Page Credits in user view
* Enabled new pricings
## 02/28/2025 5093
* Reading user from header or param
## 02/27/2025 5092
* Added user in print
## 02/24/2025 5091
* Added Annual prices
## 02/23/2025 5090
* Payments backend
## 02/21/2025 5081
* Added environment variables to Willie
## 02/19/2025 5080
* Data refresh
* New Metrics
## 02/11/2025 5070
* Added account type to User model
## 02/01/2025 5050
* Filtering frequencies below 118
* Added notes to frequencies
* Mapping 'LCL/P IC' to Tower
## 01/22/2025 5040
* Data Refresh and departure charts
## 01/19/2025 5030
* Added User category metrics
## 01/08/2025 5021
* Refresh pages count utility
## 01/06/2025 5020
* Templates now have page counts
## 01/02/2025 5010
* Added diagram and strips to page counts
## 12/29/2024 4525
* Metrics code cleanup
## 12/28/2024 
1) 4522
* Reverted Adip date
2) 4523
* Improved effective date check
3) 4524
* Added 7, 14 and 28 days session counts
## 12/27/2024
* Data Refresh 12/26
## 12/23/2024 4520
* Added airport currency to Waylon
* Added Maxout users to Willie
## 11/27/2024
* New Effective date
* Switch to data recap
## 11/22/2024
* Templates return version
## 11/17/2024
* Feedback is sending emails. 
* Email sending is centralized
## 11/16/2024
* Diagram API and model change
## 11/15/2024
* Usage table and metrics
## 11/12/2024
* Foreflight checklist exports
## 11/08/2024
* Apporach plate API
## 11/03/2024
* New Metrics for Approach page, Users and Prints
## 11/01/2024
* Instrument Approaches in airport
## 10/31/2024
* New Effective date
## 10/27/2024
* Prints table
* Added Sessions to metrics
## 10/26/2024
* Apple Authentication
## 10/19/2024
* New Sessions table
## 10/15/2024
* Template version is increasing upon update
## 10/11/2024
* New Export API to generate ACE files from checklists
## 10/10/2024
* Fixed missing staleTemplateCount
## 10/07/2024
* Metrics count notepage
## 10/03/2024
* Data refresh
## 10/02/2024
* Changed data format to support larger airports
## 9/29/2024
* Flight plan upload
## 9/24/2024
* Added active column to publication
* Added GET /publications API
* Added sticky publication code (that survive deactivation)
## 9/22/2024
* Templates now have a description
## 9/18/2024
* Metrics : Added navlog tile count
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
