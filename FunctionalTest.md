# Functional Testing
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
    * Name should be Renton Muni (centered)
    * ATIS should be 126.950
    * TWR should be 124.700 Label should be TWR/CTAF
    * Elev should be 32
    * TPA should be 1032
    * Rwy Lengthxwidth should be 5382x200
    * Watermark airport code should be KRNT
    * Rwy should be vertical
    * Traffic Pattern => should be 16LP (blue/292) 34RP (red/202)
  * Boeing field cycle runway 
    * 14L-32R frequency=118.3 label=TWR 14L-32R 
    * 14R-32L frequency=120.6 label=TWR 14R-32L 
  * Raleigh Exec name should be truncated
  * Test Edit mode toggle
  * Test replace
## ATIS Tile
  * Check layout showing 7 fields : Information, Wind, Rwy, Visiblity, Tempreature, Atimeter and Sky
  * Title is offset to the left
  * Test Settings mode toggle => no settings
  * Test replace
## Clearance Tile
  * CRAFT is showing
  * Title is offset to the left
  * Test Edit mode toggle => No settings
  * Test replace
## Notes Tiles
  * Check Layout
  * Test Edit mode toggle
  * Test replace
## Radio Flow
  * Load Demo Page
    * Should show 8 frequencies
  * Replace first frequency and last name
    * Both should be updated
  * Erase all frequencies and apply => Should show all nordo
  * Test replace
## Persistance
 * Tweak demo page content
   * Change Renton to S50 
   * Change KBFI rwy to 14R-32L
   * Change Roche Harbor corners to Elev, TPA, GND and Weather 
   * Change Raleigh to all runways
   * Remove last 4 freq from Radio Flows
 * switch to page 2, reload
 * (Page1) Check content matches list above
## Popups
 * Check Feedback
 * Check Warning