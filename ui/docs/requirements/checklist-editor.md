# Checklist Editor

## Problem Statement
Editing a checklist today is complex. It is done via a bare text input which requires advanced knowledge of the checklist format.

## Solution
We are implementing a checklist editor component that allows users to edit checklists in a more user-friendly way. The component is used by the checklist page and eventually the checklist tile.

### UI Mode
By default, the editor is in UI mode.
- **Viewing**: The user sees the full checklist content rendered similarly to the final view.
- **Adding Items**: 
    - At the bottom, "Section", "Challenge/Response", and "Separator" buttons (styled blue with a plus icon) allow adding new entries to the end of the list.
    - Hovering over an item reveals "Insert Above" and "Insert Below" buttons (using `fa-arrows-up-to-line` and `fa-arrows-down-to-line` icons) to insert a new item of the *same type* at that position.
    - Adding or inserting a separator does not trigger the edit mode.
- **Editing**: Clicking an item (except separators) turns it into an edit form.
    - **Items**: "Challenge" (required), "Response" (optional).
    - **Sections**: "Title" (required).
    - **Confirmation**: Pressing Enter or the checkmark saves changes.
- **Reordering**: 
    - Items have a drag handle on the left (`fa-grip-lines`) allowing them to be reordered via drag-and-drop.
- **Removing**: Hovering reveals a "Delete" button (trash icon, red background) to remove the entry.

### Text Mode
The editor can be switched to "Text Mode", which provides a raw text area.
- **Synchronization**: 
    - Changes in text mode are auto-saved to the model after a debounce period (e.g., 1 second).
    - The text area content automatically syncs when the underlying model changes (e.g., switching columns), but preserves the local state while typing to prevent cursor jumps.
- **Layout**: The text area expands to fill the available vertical space.

### Checklist Page Integration
The editor is hosted within the Checklist Page which manages multiple columns.
- **Column Selection**: Users can choose between 1, 2, or 3 columns.
- **Dynamic Labels**: The column selection for editing ("Left", "Right", "Middle") dynamically updates based on the number of columns (e.g., 2 cols = "Left", "Right").
- **Reset Behavior**: Changing the number of columns automatically resets the editing selection to the first column ("Left").
