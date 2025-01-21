import { loadDemo, notesTitle, visitSkipBanner, replaceTile, TileTypeLabel } from './shared'

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
    cy.get('.page0 > .tile3 > .headerTitle').click()
    const expectedDisplayModes = [ labelBlank, labelCRAFT, labelCompass, labelGrid]
    for(const displayMode of expectedDisplayModes) {
      cy.get('.modesList').contains(displayMode)
    }

    cy.get(`[aria-label="${labelBlank}"]`).click()
    cy.get('.page0 > .tile3 > .stealth')

    cy.get('.page0 > .tile3 > .headerTitle').click()
    cy.get(`[aria-label="${labelCRAFT}"]`).click()
    cy.get('.modeCraft .craftWatermark').contains('C')

    cy.get('.page0 > .tile3 > .headerTitle').click()
    cy.get(`[aria-label="${labelCompass}"]`).click()
    cy.get('.page0 > .tile3 .modeCompass')

    cy.get('.page0 > .tile3 > .headerTitle').click()
    cy.get(`[aria-label="${labelGrid}"]`).click()
    cy.get('.page0 > .tile3 .modeGrid')

    // Two notes side by side should merge
    replaceTile(0,2,TileTypeLabel.notes)
    cy.get('.page0 > .tile2').should('have.class','span-2')
    cy.get('.page0 > .tile3').should('have.css', 'display', 'none')
    replaceTile(0,2,TileTypeLabel.radios)
    cy.get('.page0 > .tile2').should('not.have.class','span-2')
    cy.get('.page0 > .tile3').should('not.have.css', 'display', 'none')
  })

})