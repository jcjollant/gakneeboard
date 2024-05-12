# Functional Testing
## data.js
* Check version number => Should be latest 
* Check data source => Should be remote
* Open the app
  * Open console
    * Nothing should be showing during the test
  * All tiles are loading
## Bulk Page Edit
  * reset tiles
    * Should get a confirmation => No then yes
    * All tiles switch to selector
  * Load demo tiles.
    * Should get a confirmation => No then Yes
    * All tiles are loading
## Airport Tile
  * Data Fields @ Renton Muni
    * Name = Renton Muni (centered), ATIS = 126.95, TWR = 124.700, Label = TWR/CTAF
    * Elev = 32, TPA = 1032, Rwy dimension = 5382x200
    * Watermark airport code = KRNT, Rwy orientation = vertical
    * 16 LP, blue, symetric pattern stroke 
    * 34 RP, red, asymetric pattern stroke
    * rwy click => 16 LP only 292 entry
    * rwy click => 16 midfield only 67 entry
    * rwy click => 34 RP only 202 entry
    * rwy click => 34 midfield 67 entry
  * Boeing field cycle runway 
    * 14L-32R frequency=118.3 label=TWR 14L-32R 
    * 14R-32L frequency=120.6 label=TWR 14R-32L 
  * Magnetic orientation
    * Enable then disable magnetic orientation
  * Pending Airport in Edit mode
    * Skagit : Edit mode, Type BFI without selecting a rwy then toggle normal and back to edit
    * Should show Skagit with ryw 04-22 and 11-29
    * Pick 04-22 should work
  * Raleigh Exec name should be truncated
  * Test Edit mode toggle
  * Test replace
## ATIS Tile
  * Check layout showing 7 fields : Information, Wind, Rwy, Visiblity, Tempreature, Atimeter and Sky
  * Title is offset to the left
  * Test Settings mode toggle + pick compact
  * Compact mode should show 4 row
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
  * Replace first frequency and last name
    * Both should be updated
  * Erase all frequencies and apply => Should show all nordo
  * Test replace
## Feedback
  * Dialog should show version number in bottom right corner
  * Enter feedback => Should show in the DB
## Persistance
 * Tweak demo page content
   * Change Renton to S50 change pattern mode
   * Change KBFI rwy to 14R-32L
   * Change Roche Harbor corners to Elev
   * Change Death Valley to all runways
   * Remove last 4 freq from Radio Flows
 * switch to page 2, reload
 * (Page1) Check content matches list above
## Warning
 * Check Layout