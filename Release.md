# User Experience updates
# Format is {today's date} - {version number} - {change description}
# REMINDER: Always use `date +"%m/%d/%Y"` command to get today's date. Always match version number to data.js version constant

## 11/11/2025 - 5462 - Fixed broken demo and broken frequencies in corners
## 11/11/2025 - 5461 - Fixed demo not loading correctly
## 11/10/2025 - 5460 - Activated lifetime deal
## 11/06/2025 - 5454 
- Added Demo page with route parameter support
- Flight info dialog moved to Demo page with cancel navigation
- Demo route removes history to prevent back navigation
- Extracted tile data manipulation methods (setAirportTile, setRadioTile, setTileData)
- Reduced FlightInfoDialog width by half
- Added loading spinner to Demo page
## 11/05/2025 - 5453 - New color schemes for Radio Tile
## 11/04/2025 - 5452 - Larger labels for Airport Mode corners
## 11/03/2025 - 5451 - Updated oxygen requirement layout
## 11/03/2025 - 5450 - Fixed Tiles demo (KAWO) and thumbnail
## 10/30/2025 - 5444 - Plans button shows "Upgrade" for Sim users. Improved SignIn dialog styling
## 10/29/2025 - 5443 - Added pilot emoji next to user name when signed in
## 10/29/2025 - 5442 - Darker blue for tile selection. Added titles to note tile display mode.
## 10/29/2025 - 5441 - UX changed, removed beta
## 10/29/2025 - 5440 - Revamed Landing page
## 10/25/2025 - 5434 - TemplateSelector supports multiple thumbnails side by side
## 10/25/2025 - 5433 - Admin Active Users API now accepts days parameter
## 10/24/2025 - 5432 - Admin API selector for User Profile and Active Users endpoints
## 10/22/2025 - 5431 - Added Regulations tile with Supplemental Oxygen
## 10/20/2025 - 5430 - Added regulations to IFR Alternate and Lost Comms
## 10/13/2025 - 5423 - Removed pumpkin
## 10/12/2025 - 5422 - New Regulation component
## 10/11/2025 - 5421 - Updated new page style
## 10/11/2025 - 5420 - Fixed Halloween layout
## 10/10/2025 - 5414 - Halloween Theme
## 10/09/2025 - 5413 - Refreshed night time logo
## 10/08/2025 - 5412 - Fixed IFR Flight Demo and VFR Sunlight tile mode
## 10/06/2025 - 5411 - New page selection layout
## 10/04/2025 - 5410 - New Admin page
## 10/03/2025 - 5405 - Fixed IFR Training thumbnail
## 10/03/2025 - 5404 - Radio Frequency lookup improvments
## 09/30/2025 - 5403 - New Ready to Print / Renamed Home Screen sections to "Ready to Print" and "Kneeboard Inspiration"
## 09/29/2025 - 5402 - Removed unneccessary save of sunlight displayMode
## 09/28/2025 - 5401 - New Click and Print Reference Card
## 09/28/2025 - 5400 - New Definitions of night mode for sunlight tile
## 09/26/2025 - 5392 - New VFR Tile / New VFR Altitudes / New Click and Print section
## 09/21/2025 - 5391 - Fixed student pages count
## 09/20/2025 - 5390 - Fixed IFR Depature layout
## 09/19/2025 - 5386 - Added / to temperature. Added / and +10 to Alt
## 09/19/2025 - 5385 - Fixed tracon frequency bug and added ' : ' to freq lookup
## 09/18/2025 - 5384 - Version popup
## 09/14/2025 - 5383 - Vertical Info Bar can now show only version number
## 09/13/2025 - 5382 - Radio Strip Dynamic header, height and removed default code
## 09/13/2025 - 5381 - Fixed ATIS default mode
## 09/13/2025 - 5380 - Fixed unwanted saveConfig during display mode init causing modified template on load 
## 09/12/2025 - 5376 - Fixed feedback logic
## 09/12/2025 - 5375 - Flight Debrief: User defined categories - Strips : New addition bar
## 09/11/2025 - 5374 - Fixed blank strip would not add
## 09/11/2025 - 5373 - Fixed IfrDisplay mode not working
## 09/11/2025 - 5372 - Fixed wrong edit mode on Airport Diagram
## 09/09/2025 - 5371 - Radio Strip supports airport code
## 09/07/2025 - 5370 - ATIS strip stack better
## 09/05/2025 - 5367 - New Flight Debrief Page - Removed format selection
## 09/05/2025 - 5366 - EULA Acceptance status
## 09/04/2025 - 5361 - Cover page Title and subtitle are now conditional which allows for full page image
## 09/04/2025 - 5362 - fixed mulitple rendering
## 09/04/2025 - 5363 - fixed unsave title and image size
## 09/04/2025 - 5364 - fixed image ratio
## 09/04/2025 - 5365 - fixed preview margin
## 08/30/2025 - 5360 - PaperNavlog small format
## 08/28/2025 - 5357 - Reworked about box
## 8/26/2025
1) 5356
* New Cover page image behavior with Blob
## 8/24/2025
1) 5355
* Last comms display mode for Radio Tile and IFR Tile.
## 8/23/2025
1) 5350
* Runway colors for Sand, Concrete and Gravel
2) 5351
* Fixed large image woul not print with Cover page
3) 5352
* Fixed Template rename
4) 5353
* Fixed overall page height
5) 5354
* Fixed modified flag
## 8/21/2025
1) 5347 
* Added Aviate Software LLC to EULA and Privacy
## 8/20/2025
1) 5346
* Fixed display mode selection
## 8/17/2025
1) 5344
* New Paper Nalog Page
* New Demo for Paper navlog
* Fixed singled last page on prints
2) 5345
* Fixed DemotData Template type
## 8/16/2025
1) 5343
* Simmers need to upgrade to use print options
## 8/15/2025
1) 5340 
* New Expand mode
* Improved Frequency selection for Tower frequencies
2) 5341
* Duplicate template feature
* New Print option to show/hide vertical bar
3) 5342
* Fixed over saving by Radio tile
## 8/12/2025
1) 5331
* Multiple runway selection
* New Corner selection menu
2) 5332
* removed logs
3) 5333
* Fixed Runway sketch position on merged tile
4) 5334
* Fixed display mode issue
5) 5335
* Refreshed Airport Tile video link
## 8/11/2025
1) 5330
* Added version number to sidebar
## 8/07/2025
1) 5322
* Added new pricing plan Private Pilot, renamed Private to Student Pilot
* Added more airports in cache
## 8/04/2025
1) 5321
* New Sidebar with Tail number, date and Kneeboard.ga
* New Icon
## 8/02/2025
1) 5320
* Enforcing prints credits
* Reversed the contact me logic in feedback form
## 7/19/2025
1) 5290 - Widenned XPDR, added one digit to departure frequency, added Gust
## 7/05/2025
1) 5280 - Moved Airport Code to top
## 6/28/2025
1) 5271 - Watermark imrovements for Departure and ATIS tiles
## 6/27/2025
1) 5270
* Version number added to save confirmation toast
* Delete confirmation closed pending deletion toast
* Runway name flipped to look prototypical
## 6/24/2025
1) 5266 - Saving a new opens the props dialog
## 6/23/2025
1) 5262 - Improved checklist margins for legibility
2) 5263 - Improved checklist font size
3) 5264 - Correct checklist items fit count
4) 5265 - Showing Airport Code on the unclogged side
## 6/22/2025
1) 5260 - FullPage template and Customizable font in Checklist
2) 5261 
* Fixed Fullpage print
* New Demo Seattle Airports
## 6/20/2025
1) 5251 - Improved scrolling beahavioe
## 6/18/2025 
1) 5250 - Fixed title typo
## 6/14/2025
1) 5248
* Updated print warning text
2) 5249
* Editor is back. Nav button are out
## 6/13/2025
1) 5245
* Improving real estate usage
2) 5246
* Smaller scale on small devices
3) 5247
* Collapsable menu and proportional scaling on min size
## 6/12/2025 5244
* Single page template support
* Moved navigation buttons to the bottom
## 6/11/2025 5242
* Fixed origin parsing in Apple SignIn
## 6/09/2025 5241
* New Alternate display mode for IFR Tile
* Using that mode for IFR Demo
## 6/08/2025 5240
* New Demos IFR Flight and Acronyms
* Former IFR Flight has been renamed to IFR Strips
## 6/06/2025 5233
* Added warning message to prints before saving which cause erroneous version number
## 6/03/2025 5232
* Fixed Note tile Word not updating on copy
## 6/02/2025
1) 5230
* Hiding GA Kneeboard and plans from the menu when screen is narrow
2) 5231
* GA Kneeboard is shown when no template is loaded
## 5/29/2025 5221
* Airport Tile corners are using the same color codes
## 5/25/2025 5220
* Saving template hides info toast on success
## 5/18/2025 5201
* Tab is picking up template name
## 5/15/2025 5201
* New Checklist Digest for PA-28 (and associated help page)
## 5/13/2025 5200
* New Checlist Digest for C182T
## 5/09/2025 5190
* New Checklist Digest section with C172S checklist
* In Navlog, renamed Apply to Apply & Close
## 4/27/2025 5182
* Loading pages matches template length
## 4/26/2025
1) 5180
* Sky Clear in expanded mode
2) 5181
* Wind Calm and Visibility 10 using the same pattern
## 4/25/2025 5173
* User can cancel tile selection from selection tile
## 4/22/2025 5172
* Refreshed print options
## 4/20/2025 5171
* Fixed Frequency Label truncated bottom when printing
* Localizer frequencies are correctly recognized as NavAid
## 04/19/2025 5170
* Showing Page count
* Maxed out message come from backend
* Added Blnk page to cosmetic group
* Removed display mode for Notes and Cover Headers
## 04/17/2025 5163
* Updated pricing to show max pages
* Adde plans link in menu bar
* Fixed airport sketch not showing on prints
## 04/15/2025 5162
* Fixed Prints on iPad via PDF
## 04/12/2025 5161
* Removed feedback from prints
## 04/11/2025 5160
* User can skip Home Page
* New Notes corner type
## 04/09/2025
1) 5151
* Removed default demo
* New Landing page and FTUX
2) 5152
* App Responsiveness for mobile
* Drawer mode for Feedback
## 04/08/2025 5150
* Removed local template from list
* Added thumbnail management
## 04/06/2025 5144
* Fixed Skyhawk demo
* Refreshed How Does it Work
## 04/04/2025 5143
* Page selection in Print
## 04/03/2025 5142
* Radio tile supports phone numbers
## 03/31/2025 5141
* Fixed pdfjs-dist version issue
## 03/30/2025 5140
* Airport Tile expand mode for diagram + convenience button
* Can expand Flight Categories and cloud clearance
* Radio Tile expand mode for Frequency LIst
## 03/24/2025 5130
* Airport Tile + Display Modes and Diagram
* Airport Edit simplified for List and Diagram
## 03/21/2025 5124
* Upodated Holds demo with Hold compass mode
* Airport Edit using EitherOr
## 03/18/2025 5123
* Notes tile Holds mode
* USer can print unsaved template
## 03/15/2025 5120 5121
1) 5120
* delete button is disabled while loading template
* Template overshot toast
* Popup save template before exporting
* Fixed pasting onto a merge tile in editor
* Editor is saving local template for editor actions
* Checklist Important items
* Customizable word in notes tile
* Pricing Plans enabled
* template Id displayed in settings
2) 5121 
* Notes Tile : Fixed Edit mode overlap
3) 5122
* Alternate mode
## 03/11/2025 5110
* Version number is showing up in template details
* Removed google analytics from dev
* Added button to enable recent airport list
## 03/08/2025 5103
* Force save before printing
* Lines alignment in Checklist fix
* Plan Update
* Google Analytics
## 03/04/2025 5102
* Notes and Atis tiles have a convenient "expand" button to merge tile with it's neighbor
## 03/03/2025 5101
* Print settings recommendations
* Approaches Improved management of long lists
* Added print credits to Account Details
## 03/02/2025 5100
* Navaid frequency in Airport Tile corner
## 03/01/2025 5098
* Sign in is required to print and use the editor
* New Pricing plans In the plans page
## 02/28/2025 5097
* User is captured on prints
## 02/27/2025 5096
* Added large mode to Radio Tile
* Unicom is now ground
* New icon for ground
## 02/25/2025 5095
* Fixed diagram bug on unknown airports
## 02/24/2025 5094
* Updated pricing plans 
* Added Annual pricing
## 02/23/2025 
1) 5090
* Added account management features
2) 5091
* Preventing to empty airports to merge
3) 5092
* refreshed airport tile vide
* Fixed merged tiles too short
4) 5093
* Configurable TP headings
* Fixed IP Price
* Fixed Airport Diagram not loading bug
## 02/21/2025 
1) 5081
* Airport Tile merge mode
2) 5082
* Updated airport Tile guide
* Bigger fonts for small Frequences box used in Departure and Approach mode of IFR tile
## 02/18/2025 5080
* Fixed Cloud Clearance layout
* Fixed compact ATIS layout
* Removed logs on frequency type
* Removed logs on user update
## 02/11/2025 5070
* New Icons for Clearance and CTAF
## 02/07/2025 5064
* Updated radio tile help link
## 02/03/2025 5060 5061 5062
1) 5060
* Full Atis is now able to merge
2) 5061
* Fixed truncatd Q in radio box
3) 5062
* Frequency box is showing a different color and Icon for each Frequency type
* Radio Tile is able to merge to side by side Frequency lists
* Fixed radio would not swap without data
* Fixed swap on merged tiles
4) 5063
* Fixed Radio tile width when expanded
## 02/02/2025 5052
* Display mode is consistent accross all tiles
* Approach tile with preselected frequencies
## 01/30/2025 5051
* Aproach tile title is showing Airport + Apch, meant to capture approach name in title
* ATIS has replaced APCH/RMY
## 01/26/2025 5050
* Notes will only merge if both are blank
* Departure can show pre selected airport
* Smaller font for Craft Clearance and Departure
## 01/20/2025 5040 5041
1) 5040
* Weather Strip inline cues for calm and variable
* New Departure Display mode for IFR Tile (renamed)
* New Display mode highlight active mode
2) 5041
* Two notes tiles side by side will merge into one wide note
* ILS tile now have an Approach and Departure (in addition to CRAFT Clearance and HOLD) 
* Radio tile loses ILS or LOC (which is now under IFR)
## 01/18/2025 5032 5033
1) 5032
* Beta survey
2) 5033
* Fixed Beta Survey
## 01/15/2025 5031
* New ILS Display mode for Radio Tile
* Airport Code pickup is using local cache (showing more recent value)
* Diagram Page showing Airport Code if diagram does not exist
## 01/12/2025 5024 5030
1) 5024
* New Strips Demo
* Improved Checklist Demo layout
* Reworked About layout and content
* Updated Facebook page link in the Help page
2) 5030
* New Account details
## 01/09/2025 5022 5023
1) 5022
*  Fixed Strip page update bug
2) 5023
* Added BETA logo
## 01/08/2025 5021
* Added Craft Strip
* Radio Strip Atis and ground have been regrouped
* Atis strip cleared has been removed from sky condition
## 01/05/2025 5020
* Radio tile has a new mode to display VOR service volumes
* Radio is now using  Display Selection components
## 01/02/2025 5014
1) 5014
* Page Selection can be used with Editor
2) 5015
* Removed description from new page
* FIxed print routing issue
## 01/01/2025 5012 5013
1) 5012
* New Page type Strips
* New Page slection layout
* Fixed airport loading issue on current data
2) 5013
* Strip demo link
* Reorder Strips in selection
* Strips usability improvments
## 12/30/2024 5011
* Improved turns legibility in holds
## 12/27/2024 
1) 4522
* New Google Sign In button
* Demo are directy accessible via ?d=name
2) 4523
* Vercel rewrite for route parameters
## 12/24/2024 4521
* New Holds demo
## 12/23/2024 4520
* Hold Mode improvments
## 12/22/2024 4512
* Bigger font on Notes/Compass
* Fixed do not print
## 12/21/2024
2) 4511
* Fixed version position
1) 4510
* New HomePage with thumbnails
* New Demos : Skyhawk, Charts
* Improved Demo : Checklist
* New url system allows to bookmark templates
* New Template actions layout
## 12/09/2024
* Three Columns checklist
## 12/08/2024
* Notes tile has compass and CRAFT
* Improved Notes Blank steath mode
* Holding moved from Notes to Clearance tile. Also improved layout
* Fixed checklist placeholder items count
## 12/05/2024
* Editor Save and Exit will not save new pages or demos
* Airport Code is now showing a list of recent airports
## 11/29/2024
* ATIS becomes Weather with new display modes
* Airport Asphalt Runways have center line
* New Themes for Checklists + refreshed demo checklist
## 11/28/2024
* Tile Copy/Paste
* Holding Tile design improvments
## 11/27/2024
* Fixed template version not updating
## 11/25/2024
* Notes plus holding mode
* Fixed Notes not loading previous mode
## 11/24/2024
* Grid Mode for Notes Tile
* AdSense
## 11/23/2024
* Template version number shows in checklist bottom right corner
## 11/16/2024
* Layout adjustment for Checklist heading
* New Airport Diagram Page
## 11/15/2024
* Fixed copy page mirror bug
* Removed confirmation when discarding editor without changes
* Removed confirmation when the existing template was not modified
## 11/13/2024
* Added Nordo mode to Radio tile
## 11/12/2024
* Foreflight checklist export
## 11/10/2024
* replace Insert page icon
* User can select a page type from the editor
* Autosave on editor save and exit
## 11/09/2024
1) Showing Selected Approach with link to source PDF
2) Fixed Approach Page crah on invalid airport
## 11/08/2024
* New Approach page implementation with local PDF rendering
* Checklist Default Section is black on white
## 11/06/2024
* New Cleearance Tile layouts
* Atis tile cycling through click
## 11/05/2024
* Emergent Section with text shadow
## 11/03/2024
1) Zoom level warning for PDF rendering
2) Updated Editor video link, Fixed approach description
## 11/02/2024
* New Editor Mode
## 11/01/2024
* Approach Page
## 10/28/2024
* Fixed Radio flow bug on iPad prints
## 10/27/2024
* Print tracking
* Clearance tile opacity
## 10/26/2024
* Apple ID authentication support
## 10/25/2024
* Exist print mode by clicking
* iPad print tow pages works
* Dmoe and about button secondary
* Afterprint event for ipad
## 10/20/2024
* removed duplicate publications request
* Version title on mouse over version
## 10/19/2024
* Reorders navlog column GS > Dist > Time
* Added calculations for leg time and leg fuel
* Changed home page meta description
## 10/17/2024
* NavLog tile added hint to no settings
* Menu shrinks to fit Tablet display / Narrow pages 
* Removed eval
* Added localstore tests
* fixed missing emits
## 10/13/2024
1) Below
* Fixed erronous page number on Editor page copy to clipboard
* Reactive display
* Removed page index next to Template name
* New Insert page replaces add 2 pages
* Delete individual page
2) Fixed save bug
## 10/11/2024
* Template Export to ACE format
## 10/10/2024
1) Added Google Tag for tracking
2) Fixed airport localstore bug
## 10/08/2024
* Editor mode now supports tiles swapping
## 10/06/2024
* Shared template now show as green in the load dialog
* Description includes published status and publication code
* Fixed template name with *
* Feedback button has been extracted from menu
* Editor Button is using new control
* Speed up initial load