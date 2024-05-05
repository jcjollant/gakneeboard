# Functional Testing
* Open the app
  * Open console
    * Nothing should be showing during the test
  * All tiles are loading
  * reset tiles
    * All tiles switch to selector
  * Load demo tiles.
    * All tiles are loading
* Airport Tile
  * Data Fields
    * Select KRNT 16-34
      * Name should be Renton Muni (centered)
      * ATIS should be 126.950
      * TWR should be 124.700
      * Elev should be 32
      * TPA should be 1032
      * Rwy Lengthxwidth should be 5382x200
      * Watermark airport code should be KRNT
      * Rwy should be displayed in the center
      * Traffic Pattern should be 16LP 34RP
  * Long airport names / select KTTA
    * Airport name should be truncated
  * Change Active Runway / Picking
    * Click on title
      * Should show a list of runways for the airport
    * Select a different runway
      * New runway should be selected
  * Change active runway / cycle
    * Click on the runway
      * Should cycle through existing runways
  * Test Edit mode toggle
  * Test replace
* State is saved locally
  * Change anything on page 1
  * Reload page -> changes should be recalled
* ATIS Tile
  * Check layout showing 7 fields : Information, Wind, Rwy, Visiblity, Tempreature, Atimeter and Sky
  * Test Settings mode toggle
  * Test replace
* Clearance Tile
  * CRAFT is showing
  * Test Edit mode toggle
  * Test replace
* Notes Tiles
  * Check Layout
  * Test Edit mode toggle
  * Test replace
* Radio Flow
  * Load Demo Page
    * Should show 8 frequencies
  * Copy data to Page 1
  * Replace first frequency and last name
    * Both should be updated
  * reload page => should remember 2 updates
  * Erase all frequencies and apply => Should show all nordo