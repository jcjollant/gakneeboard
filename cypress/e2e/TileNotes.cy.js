import { loadDemo, notesTitle, visitSkipBanner, replaceTile, TileTypeLabel, displaySelection, checkTileSpan, checkTileVisible } from './shared'

const labelBlank = "Blank"
const labelCRAFT = "C R A F T"
const labelCompass = "Compass"
const labelGrid = "Grid"

describe('Notes Tile', () => {

  it('Notes Tile', () => {
    visitSkipBanner()
    loadDemo()

    cy.get('.page0 > .tile3 > .headerTitle').contains(notesTitle)

    // Switch to Display mode selection
    displaySelection(0, 3)
    const expectedDisplayModes = [ labelBlank, labelCRAFT, labelCompass, labelGrid]
    for(const displayMode of expectedDisplayModes) {
      cy.get('.modesList').contains(displayMode)
    }

    cy.get(`[aria-label="${labelBlank}"]`).click()
    // Should be back to blank mode
    cy.get('.page0 > .tile3 > .stealth')

    displaySelection(0, 3, labelCRAFT)
    cy.get('.modeCraft .craftWatermark').contains('C')

    displaySelection(0, 3, labelCompass)
    cy.get('.page0 > .tile3 .modeCompass')

    displaySelection(0, 3, labelGrid)
    cy.get('.page0 > .tile3 .modeGrid')

    // Two notes side by side should merge when both are notes
    replaceTile(0,2,TileTypeLabel.notes)
    // 2 is blank, 3 is grid
    checkTileSpan(0,2,false)
    checkTileVisible(0,3, true)
    // Switch 3 back to blank
    displaySelection(0, 3, labelBlank)
    // now they should merge
    checkTileSpan(0, 2, true)
    checkTileVisible(0, 3, false)
    // Switch 2 to compass
    displaySelection(0, 2, labelCompass)
    // They should not merge
    checkTileSpan(0, 2, false)
    checkTileVisible(0, 3, true)

    replaceTile(0,2,TileTypeLabel.radios)
    checkTileSpan(0, 2, false)
    checkTileVisible(0, 3, true)
  })

})