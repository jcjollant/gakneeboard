# Components
Main component is App.vue it's managing one sheet of two pages. It's responsible for loading/saving sheets data and for printing.
Sheet can be one of two types, tiles (TilePage.vue) or checklist (ChecklistPage.vue)
# Remote data
Data loading is initated by individual tiles which invoke functions in data.js
For example : Airport.vue loads airport data when loadProps calls getAirport() defined in data.js
## Airport Data
data.js has a logic to mutualize airport data request into a single query during initial load
A logic is also in place to store airport data in localStorage and update is when effectiveData (airport.asof) becomes stale
When AirportTile request airport data with data.getAirport, data may position a promise on  airport data if it not sure about the effectiveData. This promise is then resolved with an outcome that tells whether data was current along with most current data.