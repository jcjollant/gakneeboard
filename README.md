# Development
Start the UI
`npm run dev`
And access via the browser, typically on port 5173
`http://localhost:5173`

# Cypress Testing
## Command line
Open the UI
`npx cypress open`
Run the test suite:
`npx cypress run`

# BUGS
* Custom Airport is not editable after update

## TODO

# Done
## 10/01/2024
* Localstore cleanup
* Replaced Navlog Video link with Plylist
## 9/29/2024
* Added file upload button in NavlogEdit
* Airport Tile List mode uses correct format for Weather Frequency
* Fixed altitute bug when editing checkpoint
## 9/28/2024
* Fixed publication request without user error
* Fixed Load and Save without user
* Added publication tests
## 9/27/2024
* Confirmation before editor copy to page
* Checklist page does not cancel edits on header click
* Refreshed About with Patreon link
## 9/25/2024
* Showing the list of public templates
## 9/23/2024
* Added video link to NavLog editor
## 9/22/2024
* Fixed small text bug on two colums checklist
* Added description to Templates
* Changed Load Template dialog to split own and community
* All demos are not available under Menu>"Demo" 
# 9/20/2024
* Fixed unselect on Print, Checklist, About, Template Sharing, Navlog creation
* Added page eject for Navlog, Checklist and Cover pages
* Fixed From/To width in Navlog Editor
* Fixed checklist edit rendering on Mac
# 9/19/2024
* New HDIW
* Airport codes are blanked on reset
## 9/18/2024
* Toggle true course and magnetic
* Apply and Next leg
* calculation value in hints
* Fixed Navlog tile overflow
## 9/16/2024
* Added calculator to Leg Editor
## 9/15/2024
* Fixed header behavior for checklist
## 9/14/2024
* Added privacy policy
* NavLog tile is active
* New replace behavior (mouse over)
* Headings now include ° symbol
* Navlog demo now has NavLog tile
* Fixed Navlog eject button opacity
## 9/12/2024
* Facebook login
## 9/11/2024
* Tile selection and page selection use Font Awesome icons
* New Navlog tile (not functional)
* Airport Tile defaults to edit mode when no code is present
## 9/10/2024
1) Refreshed checklist tile and page placeholder and height with new values
2) Fixed Checklist height discrepenacy with section headers
## 9/09/2024
* Bigger checlist to match page
* Fixed Navlog continued page descirption
* Added page count to template description
## 9/08/2024
* Editor is now able to copy from left to right
* Leg Editor is now only showing relevant variables
* navlog now supports continued mode
* navlog page now show fuel recap
* Navlog support cruise GPH, TAS, descent GPH and FPM
## 9/06/2024
1) 
* Fixed missing confirmation on Editor Delete sheet
* Fixed invalid offset on editor delete sheet
* Editor reset button updated to Replace with Eject button to match tiles
2) Boosted max log to 15
## 9/05/2024
* Delete template confirmation
* Fixed template deletion bug
* Fixed editor mask size
## 9/04/2024
1) User can print multiple pages at once
2) Enlarged tiles for better aspect ratio
## 9/03/2024
* Fixed get publication bug
* Fixed page number issue
## 9/02/2024
* Load Template shows "Fetching..." when fetching
* Radio Flows formats frequency upon selection
* You can now rename templates when saving
* You can now have more than two pages per template
* Editor mode now shows a grey overlay
## 9/01/2024
* Refreshed Warning with banner
* Leg and CHeckpoint have their own editor
* Leg editor has built in calculations
## 8/31/2024
* Improved navlog creation process with altitude
* Navlog now include a reserve fuel
## 8/29/2024
1) New format for How Does it Work
2) Improved maxTemplate processing
## 8/27/2024
* Renamed Sheets to Templates
* Save page is also truncated
## 8/26/2024
* Maintenance showing toasts
* Editor button removed from Menu and added Main page bottom left corner
* Navlog page with associated editor
* Sheet description is truncated when too long
* New Demo sheet with navlog
## 8/21/2024
* Maintenance mode
* Sign out confirmation
## 8/20/2024
* Fixed typo in sheet save code
* New Demo sheet is a mix of Tiles and Checklist
## 8/19/2024
1) Added Help link to Airport Edit ActionBar
* Improved unknown code management
* Disabled custom creation
2) Editor improvments, copy paste
## 8/18/2024
* Editor mode
* Sunlight caching
## 8/17/2024
* New Page type "Cover"
## 8/16/2024
1) Fixed visual bugs
2) Added placeholder
## 8/14/2024
1) ATC in airport tile
2) Fixed About
## 8/13/2024
* Updated About box with Facebook group and Guides as buttons
## 8/12/2024
1) 812
* Fixed page name not updated when saving a page under a different name
* Rwy Selector behavior on large number (KORD, KDFW)
* All Rwys have been redesigned to fit more data
* Fixed All Rwys scroll
2) 812-2
* Save sheet is now showing current sheet if it's been previously loaded
* Print Hide version number is now implicit
* print is now showing options in real time. Print options are simplified
## 8/11/2024
1) Users can share a deep link to the page
2) Airport data caching and Fixed heading in checlist demo
## 8/10/2024
* Strong mode for checklist section
* Tiles now using ActionBar and showing help: Fuel Radio Sunlight
* ActionBar showing hint
* Link to new Sunlight Tile guide
## 8/09/2024
* Added help to Checklist Tile and Checklist page
* Emergent Section header
## 8/07/2024
* New About Dialog
## 8/06/2024
* New Tile Checklist
## 8/04/2024
* Showing Sheet name
* Added more print options
## 8/03/2024
1) Fixed checklist color bug
2) Improved checklist management of empty and long lines
3) One toast when saving and publishing. targetSheet clean up when saving or loading
## 8/02/2024
* Added sheets sharing
## 7/30/2024
* Added two columns and theme to checklist
## 7/29/2024
* Added Checklist support
## 7/26/2024
* Improved page management
## 7/25/2024
* Reworked RadioFlow
## 7/24/2024
* Added night flight support to Sunlight tile
## 7/23/2024
* Added Navaids to airport corners
## 7/22/2024
* Added Rwy to ATIS compact
## 7/21/2024
* Fixed Airport Name behavior in Airport edit
## 7/19/2024 719
* Print mode
## 7/17/2024 717
* Sunlight component shows sunrise, sunset, civil twilight
## 06/26/2024 626
* Show list of frequencies for selection in corners list
* Add separators in Corner data selectors
## 06/23/2024 623
* Added Copy from left to right
* renamed Print to Flip
* Added Custom sheets support
## 06/15/2024 615
* Custom Airport
* Improved airport edit to avoid useless partial code request
* Improved airport edit UI to fit more runways
## 5/27/2024
* Users can authenticate with Google
* Authenticatred users can get feedback follow up
* Send Feedback is disabled if there is no text
## 5/18/2024
* Big watermark on 3 letter airports
* Print mode flips the back page
* Fuel Bug is now configurable
## 5/17/2024
* Selecting first runway by default
## 5/16/2024 516
* Initial Revision of Fuel Bug
## 5/14/2024 514
* Added link to Blog
* Firefox display bug replace airport edit .settings grid-template-columns: 50px 170px;
## 5/13/2024 513
* Fixed sticky pattern mode between pages
* improved replace button layout
* You can deselect all options in runway orientation
* ALL runways mode spills over tile height
## 5/12/2024 512
* reduce size of the loading spiner
* Show airport code in the edit window
* Test code ??? to fake a loading airport
* When an airport code is unknown, we should say so
* when demo is loaded, rwy orientation is not considered
* change rwy orientation choice to buttons
* Add site to google search
## 5/11/2024 511
* Atis compact mode
* patternMode is save with airport
* User can configure magnetic orientation for runway
## 5/09/2024 510
* clear mode on browser messes up buttons format
## 5/09/2024 509
* Improved Warning Legibility
* Clicking on the rwy will cycle through combinations of TP display
* Show version number in the feedback box
* Use different dash styles for left and right pattern
* Cannot get AA25
* Showing dirt strips and gravel strips with their own color
* AK5 should fit (rwy # in width)
* Show -.- if gnd frequency is unknown
* Airport : Add cancel button at the bottom of Rwy selector
* Add "nothing" in possible corner data
## 05/08/2024 508
* Show a spiner when the airport request data is sent
* Fixed feedback
* Airport : When leaving edit mode without applying, selector should revert back to current airport
## 5/06/2024
* Capture feedback with API
* Load demo tiles into current page.
* Add confirmation to load demo tiles and reset tiles
* Updated demo page to help functional testing
* Left traffic pattern is blue, right is red
## 5/05/2024-2
* Added configurable corners
* Added colors to traffic pattern
## 5/05/2024
* Bulk loading on page load
* Fixed pacific/alaska airports
* Improved menu
* Fixed 45 entry color not showing on printer
* Switched UI to clear mode to match paper version
## 5/03/2024
* Clearance title left aling to make room for airport name
* Atis title left aling to make room for airport name
* Navigation update: clicking the title now toggles settings mode. Clicking the trash can replaced the tile
* New Tile Radio flow
* Notes using new title 'stealth' mode
## 5/01/2024
* Airport title navigation normal > edit > tile selection. Removed reset button.
* Added tpa to airport rwy list
## 4/30/2024
* Add Airport tile which shows all rwy information without chart (TP direction, Rwy Dimensions, Freq)
* Do not round TPA
* Fix bug for long airport name KTTA
## 4/29/2024
* Show runway length and width next to runway
## 4/28/2024
* Change favicon
* Add clearance widget
* Fixed runway selector layout
* Read airport data from external source
## 4/27/2024
* Removed runway orientation angle for legibility
* Add Magnetic course for 45 with visual cue (Trenton Lipscomb)
* Show version number in Feedback
* Show airport code in title
* Users can switch between their page and the demo page
* Users can send feedback through the menu
* remove fetch
## 4/26/2024
* Water runway rendered as blue
* offer at least 25 airports
* Show tower frequency when no CTAF (kbfi) or when there is a tower (krnt)
* Round up elevation figure
* Users can use 3 letters code to pick airport
* show rwy selection as a runway sign
* Show wather frequency when there is not Atis
* fix data validation
* Save updated airport params
* Rename App to Kneeboard
* Add kb.jollant.net domain
## 4/25/2024
* Page configuration is saved in browser
* Default widget can be reset to the blank state
## 4/24/2024
* Edit mode allows to change existing widgets content
* Show traffic patterns using dashed line
* Rename KBVS to Demo 1 page.
## 4/22/2024
* Improved ATIS with Rwy number
## 4/21/2024
* I want a flexible solution to fly to KBVS or Seattle Skyline
## 4/20/2024
* Rearrange layout for optimal print on half letter format. Consider 2x2x3 layout to display 12 airports
* Add all airports for a full route to KBVS and KELN : KAWO, KELN, KESW
* Border should include airport name (airport information should be in the same visua block)
## 4/19/2024
* Remove airport(s) from the list
* Remove the dot
* Add arrow tip to TP
* Automatically parse airport codes
* Update Window title


##
Google API CliendId : 864395393673-li5elss3gtbhipp6pdjs1pbgbl0866si.apps.googleusercontent.com
