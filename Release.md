
# Format is {today's date} - {version number} - {change description}
# REMINDER: Always use `date +"%m/%d/%Y"` command to get today's date. Always match version number to data.js version constant

## 01/06/2026 - 6.2.2 - Defaulting user name
## 01/03/2026 - 6.2.1 - Captured attribution during user creation
## 01/03/2026 - 6.2.0 - Added attribution to stripe checkout
## 01/01/2026 - 6.1.6 - Fixed Health Check
## 01/01/2026 - 6.1.5 - Updated codesLookup logic to return three lists
## 12/31/2025 - 6.1.4 - Fixed parse and codeLookup logic
## 12/27/2025 - 6.1.3 - Now auditing SkyVector data fetch
## 12/27/2025 - 6.1.2 - Fixed airport update logic
## 12/27/2025 - 6.1.1 - Effective Date update
## 12/27/2025 - 6.1.0 - Health Check API
## 12/20/2025 - 5.52.0 - Added Skyvector as a DataSource
## 12/15/2025 - 5.51.3 - Manual update of airport diagram
## 12/15/2025 - 5.51.2 - Airport creation
## 12/15/2025 - 5.51.1 - Fixed empty asosAwos list bug (canadian airports)
## 12/15/2025 - 5.51.0 - New source field in airport table
## 12/01/2025 - 5500 - Added valid airport count to missing sketches
## 12/01/2025 - 5490 - Cycle Update 2512
## 11/16/2025 - 5470 - Fixed upgrade print credits
## 11/10/2025 - 5461 - Fixed lifetime deal logic
## 11/10/2025 - 5460 - Added CHI API
## 11/09/2025 - 5451 - Added lifetime deal
## 11/07/2025 - 5450 - Fixed churn method and subscription cancel
## 10/31/2025 - 5442 - Data refresh
## 10/29/2025 - 5441 - Adjusted values for business limits
## 10/27/2025 - 5440 - Added business metrics for new customers and churn tracking with monthly revenue test
## 10/25/2025 - 5432 - Enhanced usage/active API with numberOfDays parameter and added 404 handling for user/profile
## 10/24/2025 - 5431 - Added usage/active API to get active users in past 24h (admin only)
## 10/24/2025 - 5430 - Added template count and page count to user profile API
## 10/10/2025 - 5411 - Fixed sign up notification email
## 10/04/2025 - 5410 - User Id in creation email / test users at test.gak
## 10/03/2025 - 5401 - New API for user profile / Waylon tells active customers
## 10/02/2025 - 5400 - Refreshed effective date
## 09/21/2025 - 5391 - Counting active customers
## 09/20/2025 - 5390 - Refill student pilots on monthly invoice
## 09/18/2025 - 5381 - Refills create usage - Fixed effective date error message
## 09/12/2025 - 5380 - Fixed feedback logic
## 09/05/2025 - 5362 - Eula Acceptance status
## 09/05/2025 - 5361 - Eula Acceptance API
## 09/03/2025 - 5360 - Effective date update
## 08/26/2025
1) 5350
* Removed restriction for admin user
2) 5351
* New API for user images
## 08/07/2025 - 5320 - Effective Date update - New Account type Private, old Private becomes Student
## 07/10/2025 - 5280 - Effective Date update
## 06/22/2025 - 5250 - Added support for FullPage Format
## 06/13/2025
1) 5240
* New Effective date 2025-06-12T00:00:00
2) 5241
* Removed logs and refreshed effective date
## 05/25/2025 5220
* Added save-7d and save-28d to metrics
## 5/21/2025 5210
* Email on new user
* Historical Template data saved
* Thumbnail refreshed everytime
## 05/16/2025 5200
* Effective date update
## 5/05/2025 5190
* Fixed subscription update bug
## 4/21/2025 5171
* Fixed new joiner bug since 4/03/2025
## 4/19/2025 5170
* Max pages
* Thumbnails in DB
## 04/16/2025
1) 5160
* Fixed metrics when Tiles page has no selection.
2) 5161
* Added support for EFFECTIVE_DATE variable
## 04/08/2025 5150
* Thumbnails
## 04/04/2025 5143
* New users are created with max_templates and print_credit
## 04/03/2025 5141 5142
1) 5141
* New Users are created with print credits
2) 5142
* Reading Max Templates from column => Bunch of folks will go back to 2
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
