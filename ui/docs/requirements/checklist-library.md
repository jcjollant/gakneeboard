# Checklist Library Requirements

## Problem Statement
Currently, checklists are defined individually within `ChecklistTile` or `ChecklistPage`. There is no mechanism to reuse a checklist across multiple tiles or pages. If a user wants the same checklist in multiple places, they must duplicate it manually. Updates to one copy are not reflected in others.

## Solution
Implement a "Checklist Library" system that allows users to create named, shared checklists. These checklists can then be referenced in any checklist editor using a special syntax.

### Key Features

#### 1. Shared Checklist Creation
- Users can create a "Shared Checklist" that is stored centrally (e.g., in a new `checklist-library` store).
- Each shared checklist has a unique name/identifier.

#### 2. Referencing Mechanism (@ Syntax)
- In any checklist editor (Checklist Page or Checklist Tile), users can import a shared checklist.
- The proposed syntax is to use the `@` symbol followed by the checklist name (e.g., `@Cessna 172 Preflight`).
- When the system detects this syntax, it pulls the content of the shared checklist.

#### 3. Synchronization
- **References are Links**: The reference should act as a link to the source.
- **Updates**: Any changes made to the source "Shared Checklist" are automatically reflected in all tiles and pages that reference it.
- **Read-Only in Tile**: When a checklist is being used via a reference, it should probably be read-only in the local potential instance to prevent accidental divergence, or it should clearly indicate it is a linked instance.

#### 4. Managing the Library
- A UI is needed to view, create, and delete shared checklists.
- This could be part of the Account/Settings area or a dedicated "Library" view.
- **Visual Representation**: Checklists in the library should be represented by a card that shows the first few items.

## User Experience
1.  **Creating**: User goes to "Checklist Library", clicks "New", enters a name ("C-172 Normal"), and edits the items.
2.  **Using**: User adds a Checklist Tile to a page. In the editor, instead of typing items, they type `@C-172 Normal`.
3.  **Result**: The tile populates with the items from "C-172 Normal".
4.  **Updating**: User realizes a step is missing. They go back to "Checklist Library", edit "C-172 Normal". The next time viewing the tile, the new step appears.
