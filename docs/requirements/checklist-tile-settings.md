# Checklist Tile Settings

## Problem Statement
Checklist tile settings are currently held inside the tile itself (inline editing), which does not have proper real estate for the settings. User currently clicks inside the tile to edit settings, which is not a consistent experience.

## Solution
We have implemented a new "Hoisted Settings" pattern where settings are displayed outside the tile in a bigger container. For example, the Airport Tile is already using this experience. 

### Architecture
- **Settings Overlay**: A generic `TileSettings.vue` component acts as the container. It provides a consistent header (with title and close button), a body slot for tile-specific content which are defined in ChecklistTileSettings.vue, and a footer with standard actions (`ActionBar`).
Since ChecklistPage settings and ChecklistTileSettings are very similar, we should consider consolidating them into a single component. Consider reorganizing SettingsPage settings so that columns count selection and active column selection are on the same line, which can be disabled with the component is used for ChecklistTile settings.

### Settings Overlay Layout
The overlay consists of three main parts:
1.  **Header** (Generic)
    -   **Title**: Dynamically acts based on the tile type (e.g., "Checklist Tile Settings").
    -   **Icon**: A placeholder for a 2x3 grid accent to indicate the tile's position.
    -   **Close Button**: A close icon on the right to dismiss the overlay.
2.  **Body**: (Specific)
ChecklistTile Is essentially the same as ChecklistPage settings without the columns and font selection, since the tile always has only one checklist. The remaining list of controls is:
    - Checklist Name Input
    - Editor Mode (Visual vs Text OneChoice)
    - Actual Editor (Using ChecklistEditor.vue)
    - Theme selection (Using ThemeSelector.vue)
3.  **Footer**: (Generic)
    -   Contains the `ActionBar` with standard actions:
        -   **Apply**: Saves changes and closes.
        -   **Cancel**: Discards changes and closes.
        -   **Help**: Opens relevant help documentation.

## Migration Strategy
The Checklist Tile is the second to use this new pattern. Other tiles currently use the legacy inline/header display mode selection but benefit from the updated `Header` component architecture. Future work will migrate other tiles to their own specific settings components within this same overlay system.