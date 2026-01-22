import { TileTypeLabel, checkTileSpan, checkTileVisible, checkTileTitle, displaySelection, displaySelectionExpand, replaceTile, loadDemo, visitSkipBanner } from '../shared.js'
import { loadTestTile, displaySelectionTestTile, displayModesCheck, loadTestPage, PageTypeLabel, checkTestPageTileTitle } from '../shared.js'

const titlWeatherAt = "Weather @"
const titleDisplayMode = "Weather Tile Mode"
const titleFlightCategories = "Flight Categories"
const titleCloudClearance = "Cloud Clearance"
const departTitle = "Depart"
const atisTitle = "Weather"

const labelFullATIS = "Full Notepad"
const labelCompact = "4 Lines Notepad"
const labelCategories = "Flight Categories"
const labelCloudClearance = "VFR Cloud Clearance"

const atisTilesData = [
  { name: 'atis', data: {} },
  { name: 'atis', data: { mode: 'compact' } },
  { name: 'atis', data: { mode: 'categories' } },
  { name: 'atis', data: { mode: 'cloudClearance' } },
  { name: 'atis', data: { mode: "" }, span2: true },
  { name: '', data: {} },
]
function loadAtisTestPage() {
  loadTestPage(PageTypeLabel.tiles, atisTilesData)
}



describe('ATIS Tile', () => {

  it('Loads ATIS Tiles with various display modes', () => {
    loadAtisTestPage()

    checkTestPageTileTitle(0, "Weather @")
    checkTestPageTileTitle(1, "Weather")
    checkTestPageTileTitle(2, "Flight Categories")
    checkTestPageTileTitle(3, "Weather")
    checkTestPageTileTitle(4, "Weather")

    // tile 4 should span 2 columns
    cy.get('.tile4').should('have.class', 'span-2')
    // tile 5 should be hidden
    cy.get('.tile5').should('have.css', 'display', 'none')
  })

  it('should contain all display modes', () => {
    loadTestTile(TileTypeLabel.atis)

    displaySelectionTestTile()
    const expectedDisplayModes = [labelFullATIS, labelCompact, labelCategories, labelCloudClearance]
    displayModesCheck(expectedDisplayModes, true)
  })

  it('Should Start Simple Mode', () => {
    loadTestTile(TileTypeLabel.atis)
    cy.get('.headerTitle').contains(titlWeatherAt)

    const expectedFields = [
      { class: '.info', label: 'Info' },
      { class: '.wind', label: 'Wind' },
      { class: '.wind > .clear', label: 'Calm' },
      { class: '.wind > .gust', label: 'G' },
      { class: '.wind > .wtrmrk', label: 'Vrb' },
      { class: '.wind > .at', label: '@' },
      { class: '.runway', label: 'Rwy' },
      { class: '.visibility', label: 'Vis' },
      { class: '.visibility > .clear', label: '10+' },
      { class: '.visibility > .wtrmrk', label: 'Ra' },
      { class: '.visibility > .wtrmrk', label: 'Fg' },
      { class: '.visibility > .wtrmrk', label: 'Br' },
      { class: '.sky', label: 'Sky' },
      { class: '.sky > .clear', label: 'CLR' },
      { class: '.sky > .wtrmrk', label: 'Fw' },
      { class: '.sky > .wtrmrk', label: 'Sc' },
      { class: '.sky > .wtrmrk', label: 'Bk' },
      { class: '.sky > .wtrmrk', label: 'Ov' },
      { class: '.temperature', label: 'T°/DP' },
      { class: '.altimeter', label: 'Alt' },
      { class: '.altimeter > .wtrmrk', label: '28' },
      { class: '.altimeter > .wtrmrk', label: '29' },
      { class: '.altimeter > .wtrmrk', label: '30' },
    ]

    for (const field of expectedFields) {
      cy.get(`${field.class}`).contains(field.label)
    }

  })

})