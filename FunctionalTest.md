# Functional Testing
## data.js
* Check version number => Should be latest 
* Check data source => Should be remote
## Console
* Show console, reload => Nothing should show
  * All tiles are loading
## Bulk Page Edit
  * reset tiles => Confirmation => All tiles switch to selector
  * Load demo tiles => Confirmation => All tiles are loading
    * Renton, Boeing 14L, Raleigh, Arlington ALL
    * Roche Harbor, Death Valley, Harvey (Mag), Fuel Bug
    * ATIS Full, Clearance, Notes, Radios
## Airport Tile
  * Data Fields @ Renton Muni
    * Name = Renton Muni (centered), ATIS = 126.95, CTAF = 124.700, Label = CTAF
    * Elev = 32, TPA = 1032, Rwy dimension = 5382x200
    * Watermark airport code = KRNT, Rwy orientation = vertical
    * 16 LP, blue, symetric pattern stroke 
    * 34 RP, red, asymetric pattern stroke
    * patternmmode cycle => test 5 modes
  * Boeing field cycle runway 
    * 14R-32L frequency=120.6 label=RWY 14R-32L 
    * 14L-32R frequency=118.3 label=RWY 14L-32R 
  * Magnetic orientation
    * Enable then disable magnetic orientation
  * Edit mode
    * Pending Airport
      * Raleigh : Edit mode, Type BFI without selecting => Airport name should show below input field
      * Cancel and back to edit => Should show Raleigh with ryw 03-21
      * Pick 03-21 should work
  * Raleigh Exec KTTA name should be truncated
  * Test replace
  * Test Unknown Airport can be Cancelled
  * Sign out
    * Request TEST => Should be unknown
    * Create button => Should prompt to sign in
  * Sign In
    * Request TEST => Should be known
  * Edit Custom
    * remove rwy
    * try to save => Should red toast
    * Change All values to match renton
    * Save
    * Check all values are represented correctly
    * reload page => Check values are correct
    * Replace with old values
      * Change All values Name => Airport JC 2, CTAF 124.1, Wx 124.2, GND 124.3 
      * Add Rwy RP16-LP34, Length 4,000 width 50
## ATIS Tile
  * Check layout showing 7 fields : Information, Wind, Rwy, Visiblity, Tempreature, Atimeter and Sky
  * Title is offset to the left
  * Test Settings mode toggle + pick compact
  * Compact mode should show 4 row, title centered
  * Test replace
## Clearance Tile
  * CRAFT is showing
  * Title is offset to the left
  * Test Edit mode toggle => No settings
  * Test replace
## Notes Tiles
  * Check Layout title should be faded
  * Test Edit mode toggle
  * Test replace
## Radio Flow
  * Load Demo Page
    * Should show 8 frequencies
  * Replace first frequency to 116.0 and last name to ZERO
    * Both should be updated
  * Erase all frequencies and apply => Should show all nordo
  * Test replace
## Fuel Bug
  * Edit mode + change usable 53 to 43 + cancel edit => Should stay at 53
  * Change default values to 52/8/0.75 + Apply
  * Reload page should show saved values
  * Edit mode should show warnings for 
    * usable < 10 gal > 100 Gal
    * fuel flow < 4
    * reserve < 0.5
    * reserve / fuel flow > usable
## Feedback
  * Dialog should show version number in bottom right corner
  * Enter feedback singed out should not prompt for follow up => Should show in the DB without r
## Print Mode
 * Pick Print from menu -> Should flip right page
## Persistance
 * Tweak demo page content
   * Change Renton to S50 change pattern mode
   * Change KBFI rwy to 14R-32L
   * Change Roche Harbor corners to Elev
   * Change Death Valley to all runways
   * Remove last 4 freq from Radio Flows
## Authentication
 * Sign In w/ Google => Should succeed => User name should show in sign in button
 * Feedback should give the follow up option
 * Sign Out => User name should be removed

## Throurough test
  * Reset + No should not reset tiles
  * Demo + No should not load demo tiles
  * Check warning layout
  * Send Feedback, test "Do No Send" closes the window
  * Send Feeback, try to send authenticated without follow up => DB should show null
  * Airport, check headings 16 enrty=292 midfield=67 34 entry=202 midfield=67
