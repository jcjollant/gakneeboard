# UI Requirements: Route Frequencies Display Mode for Radio Tile

## Overview
Create a new display mode for the Radio Tile called "Route Frequencies". This mode will generate a dynamic list of radio frequencies based on the route assigned to the current template.

## Requirements

### 1. New Display Mode
*   **Name:** "Route Frequencies"
*   **Component:** `RadioTileSettings.vue` and `RadioTile.vue`
*   **Behavior:** When selected, the radio tile will look at the current template's route and dynamically build a list of relevant radio frequencies for the airports/points along that route.

### 2. Frequency Generation Logic
*   The dynamically generated list must mimic the logic currently used to construct the frequencies in the "VFR Flight" demo.
*   The frequency types should include relevant communications for the route, such as:
    *   ATIS / AWOS / ASOS (Weather)
    *   Tower (TWR)
    *   CTAF / UNICOM
    *   Other relevant frequencies from the route's segments (e.g., approach/departure).
*   The ordering and selection must match the needs demonstrated by the VFR Flight demo's hardcoded radio list:
    ```json
    [
        { mhz: 127.750, name: 'KBFI ATIS', type: FrequencyType.weather },
        { mhz: 118.300, name: 'KBFI TWR', type: FrequencyType.tower },
        { mhz: 119.025, name: '0S9 AWOS-3P', type: FrequencyType.weather },
        { mhz: 123.000, name: '0S9 CTAF', type: FrequencyType.ctaf },
        { mhz: 128.650, name: 'KPAE ATIS', type: FrequencyType.weather },
        { mhz: 120.200, name: 'KPAE TWR', type: FrequencyType.tower },
        { mhz: 122.900, name: 'LK WA CTAF', type: FrequencyType.ctaf },
        { mhz: 118.200, name: 'CHINOOK A MOA' }
    ]
    ```

### 3. Refactor VFR Flight Demo
*   **File to Update:** `DemoData.ts` (specifically `page0DemoVFR` and/or `static skyhawk()`)
*   **Action:** Remove the hardcoded list of frequencies in the VFR Flight demo.
*   **Replacement:** Configure the radio tile in the VFR Flight demo to use the newly created "Route Frequencies" mode.
*   **Validation:** Ensure the template has an explicit route set so that the dynamic list generates the exact same frequencies previously provided by the hardcoded array.

## Acceptance Criteria
*   The `RadioTileSettings.vue` UI has a "Route Frequencies" option.
*   Selecting "Route Frequencies" hides the manual frequency list editor and dynamically fetches/displays frequencies for the current route.
*   The VFR Flight demo uses the new mechanism instead of a hardcoded frequency list.
*   The visual output of the VFR Flight demo's radio tile remains backward compatible with its current appearance.
