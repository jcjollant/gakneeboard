# Tile Settings Refactor (As Built)

## Problem Statement
Tile settings were previously held inside the tile itself (inline editing), which overcrowded the small tile space. Users also had to switch between "Display Mode" and "Edit Mode" via different interactions, leading to a fragmented experience.

## Solution
We have implemented a new "Hoisted Settings" pattern where settings are displayed in a full-page overlay component that covers the entire tile grid. This overlay is triggered by a generic "Settings" action from the tile header.

### Architecture
- **Settings Overlay**: A generic `TileSettings.vue` component acts as the container. It provides a consistent header (with title and close button), a body slot for tile-specific content, and a footer with standard actions (`ActionBar`).
- **State Management**: The state of the settings overlay (visibility, which tile is being edited, pending configuration) is managed by the parent `TilePage.vue`.
- **Tile Header**: The specific `displayMode` prop in `Header.vue` has been replaced by a generic `leftButton` prop. By default, this shows a "Display Mode" icon. For tiles with the new settings pattern (like Airport), it shows a "Gear" icon (`leftButton='settings'`).

### Settings Overlay Layout
The overlay consists of three main parts:
1.  **Header**:
    -   **Title**: Dynamically acts based on the tile type (e.g., "Airport Tile Settings").
    -   **Icon**: A placeholder for a 2x3 grid accent to indicate the tile's position.
    -   **Close Button**: A close icon on the right to dismiss the overlay without saving.
2.  **Body**:
    -   Dynamically renders a tile-specific settings component (e.g., `AirportTileSettings.vue`) based on the tile type.
    -   The body content scrolls independently of the page.
3.  **Footer**:
    -   Contains the `ActionBar` with standard actions:
        -   **Apply**: Saves changes and closes.
        -   **Cancel**: Discards changes and closes.
        -   **Help**: Opens relevant help documentation.
        -   **Video**: Opens relevant help video.

## Airport Tile Settings (`AirportTileSettings.vue`)
The specific settings for the Airport Tile are implemented in `AirportTileSettings.vue` and include the following sections:

### 1. Display Mode
-   Allows creating the display mode (e.g., "Runway Sketch" vs "Airport Diagram").
-   Uses the `DisplayModeSelection` component.
-   Includes the ability to toggle "Wide" mode (spanning two columns).

### 2. Airport Selection
-   **Input**: An auto-completing airport code input field.
-   **Recents**: Displays a list of recently used airport codes for quick selection.

### 3. Runway Configuration
-   **Runway Selector**: Buttons to toggle visibility of individual runways.
-   **Orientation**: Toggle between "Vertical" (runways aligned up) and "Magnetic" (true heading).
-   **Headings**: Toggle to show or hide runway heading numbers.

### 4. Traffic Pattern
-   Allows selection of traffic pattern display style (e.g., Teardrop, 45-degree entry, Midfield).

## Migration Strategy
The Airport Tile is the first to use this new pattern. Other tiles currently use the legacy inline/header display mode selection but benefit from the updated `Header` component architecture. Future work will migrate other tiles to their own specific settings components within this same overlay system.
