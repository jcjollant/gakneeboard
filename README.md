# Background
As a GA pilot, I rely on my kneeboard to get just in time information about the flight. For example, I need to see traffic pattern orientation, rwy length, frequencies or ATIS. I want a solution to customize this data, print it and snap it on the board so it's right there when I need it.
I couldn't find anything I liked, so I scratched my own itch.

# TODO
* Airport title should toggle normal > edit mode then edit > tile selection if clicked again. Remove reset button.
* New Tile Radio flow
* New Tiles Synopsis
* Add settings
* Notes tile should not have a title, the whole tile should be clickable to replace
* User setting wether runway should be oriented or straight
* User settings whether to show 45 entry magnetic course

# Done
## 4/30/2024
* Add Airport tile which shows all rwy information without chart (TP direction, Rwy Dimensions, Freq)
* Do not round TPA
* Fix bug for long airport name KTTA
## 4/29/2024
* Show runway length and width next to runway
## 4/28/2024
* Change favicon
* Add clearance widget
* Fixed runway selector layout
* Read airport data from external source
## 4/27/2024
* Removed runway orientation angle for legibility
* Add Magnetic course for 45 with visual cue (Trenton Lipscomb)
* Show version number in Feedback
* Show airport code in title
* Users can switch between their page and the demo page
* Users can send feedback through the menu
* remove fetch
## 4/26/2024
* Water runway rendered as blue
* offer at least 25 airports
* Show tower frequency when no CTAF (kbfi) or when there is a tower (krnt)
* Round up elevation figure
* Users can use 3 letters code to pick airport
* show rwy selection as a runway sign
* Show wather frequency when there is not Atis
* fix data validation
* Save updated airport params
* Rename App to Kneeboard
* Add kb.jollant.net domain
## 4/25/2024
* Page configuration is saved in browser
* Default widget can be reset to the blank state
## 4/24/2024
* Edit mode allows to change existing widgets content
* Show traffic patterns using dashed line
* Rename KBVS to Demo 1 page.
## 4/22/2024
* Improved ATIS with Rwy number
## 4/21/2024
* I want a flexible solution to fly to KBVS or Seattle Skyline
## 4/20/2024
* Rearrange layout for optimal print on half letter format. Consider 2x2x3 layout to display 12 airports
* Add all airports for a full route to KBVS and KELN : KAWO, KELN, KESW
* Border should include airport name (airport information should be in the same visua block)
## 4/19/2024
* Remove airport(s) from the list
* Remove the dot
* Add arrow tip to TP
* Automatically parse airport codes
* Update Window title
