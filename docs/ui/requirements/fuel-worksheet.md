The fuel Worksheet should help the pilot answer two questions 1) How much fuel do I need? and 2) How much fuel can I take?

The page is divided in three parts 
## Load
Top of the page allows the pilot to select what goes into the aircraft. 
There are three visual compoents : The Tarmac, the Aircraft and the CG Envelope.
The tarmac and the Aircraft are stacked vertically. The aircraft is on top of the tarmac. The CG Envelope is to the right of the tarmac/aircraft stack.
The tarmac component is a large box listing all people and things that can be put into the aircraft. The pilot can create new things or people by giving them a name and a weight. People are represented with a user icon. Things are represented with a box icon. 
The Aircraft component shows a fuselage, seen from above, with all stations in the aircraft.
The pilot can drag and drop items between the tarmac and the aircraft. 
## Flight
The flight section shows a list of legs and some summary information. 
### Legs
The list starts empty. Pilot adds legs by clicking a + where they can select the leg type (climb, cruis and descent) and the leg time.
Legs are represented inside a LegCard which shows the leg type, the leg time and the fuel used for that leg. Leg type use the existing color pattern. See NavLog Page for inspiration.
Legs can be removed by clicking a - button on the right top corner. See Radio Tile Settings for inspiration.
### Information
Pilot can specify whether the flight rules are VFR or IFR
If the flight is VFR, Pilot can specify if this is Day or Night Flight.
If the flight is IFR, Pilot can specify an optional time to Alternate Airport.
Pilot can enter a personal buffer, which is a cruise time that will be used as a reserve.
Pilot can enter Taxi fuel in gallons at the beginning of the flight portion.
## Fuel Gauge
The bottom page shows a fuel gauge that goes from 0 to maxUsableFuelGal. The gauge is divided in 3 sections, each using a specific color from left to right.
Legal Fuel : The amount required by law based of flight type and conditions. This should be hard red.
Personal Buffer : The amount of fuel for the personal buffer time. This should be hard yellow.
Legs Fuel : The amount of fuel required for the legs. Each leg is represented with it's own color
These three sections add up to the required fuel.
That gauge should also represent the Max Take Off Weight (MTOW) and the Max Landing Weight (MLDW) as bars along the gauge, if onbaord fuel is limited by weight. 