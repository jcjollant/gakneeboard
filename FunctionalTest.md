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
      * Watermark airport code should be KRNT
      * Rwy should be displayed in the center
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
* State is saved locally
  * Change Harvey runway
  * Toggle All runways on KPAE
  * Reload page -> Runway and KPAE mode should have been saved
* ATIS Tile
  * Check layout showing 7 fields : Information, Wind, Rwy, Visiblity, Tempreature, Atimeter and Sky
* Clearance Tile
  * CRAFT is showing
* Notes Tiles
  * Check Layout
