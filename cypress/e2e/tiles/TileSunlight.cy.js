import { replaceTile, visitSkipBanner, TileTypeLabel, checkHeader, displaySelection, checkImageContent, newTemplateWithTile, checkTileTitle, waitForAirports, waitOneAirport, notesTitle } from '../shared'

class Header {
  static displaySelection = "Sunlight Display Mode"
  static flight = "Sunlight"
  static settings = "Sunlight Settings"
  static reference = "Definitions of Night"
}

class DisplayModeLabel {
  static flight = "Flight Sunlight"
  static reference = "Definitions of Night"
}

const placeHolderSubtitle = "Click Here to Configure"

describe('Tiles', () => {
  beforeEach(() => {
    visitSkipBanner()
    newTemplateWithTile(TileTypeLabel.sunlight)
  })

  it('Display selection is correct', () => {
    checkTileTitle(0, 0, Header.displaySelection)
    // all modes are present
    const expectedModes = [DisplayModeLabel.flight, DisplayModeLabel.reference]
    for(const mode of expectedModes) {
      cy.get(`[aria-label="${mode}"]`)
    }
  })

  it('Flight Mode works', () => {
    // Switch to flight mode
    displaySelection( 0, 0, DisplayModeLabel.flight)

    // Edit Mode
    cy.get(`.placeHolder`).click()
    cy.get(':nth-child(1) > .p-inputgroup > .p-inputtext').type('KRNT')
    waitOneAirport()
    cy.get(':nth-child(2) > .p-inputgroup > .p-inputtext').type('KSFF')
    waitOneAirport()
    // Apply
    cy.get('.page0 .tile0 .actionBar [aria-label="Apply"]').click()

    cy.get('.legend')

    // date should be today
    const today = new Date().toLocaleString('en-US', {weekday: 'short', month: 'short', day: 'numeric'})
    cy.get('.date').contains( today)
    // Check corners in day mode
    cy.get('.topLeftCorner').contains('KRNT')
    cy.get('.topRightCorner').contains('KSFF')
    cy.get('.bottomLeftCorner').contains('Solar Noon')
    cy.get('.bottomRightCorner').contains('Golden Hour')

    // switch to overnight mode
    cy.get('.page0 > .tile0 > .sunlight').click()
    cy.get('.nightFlight').click()
    cy.get('[aria-label="Apply"]').click()

    // Check corners in night mode
    cy.get('.topLeftCorner').contains('KRNT')
    cy.get('.topRightCorner').contains('KSFF')
    cy.get('.bottomLeftCorner').contains('From')
    cy.get('.bottomRightCorner').contains('To')
    cy.get('.date').contains( 'Night Flight')
  })

  it('Can be replaced by other tiles', () => {
    displaySelection( 0, 0, DisplayModeLabel.reference)

    // Test Tile can be replaced by Notes
    replaceTile(0, 0, TileTypeLabel.notes)
    checkTileTitle(0, 0, notesTitle)

    // Change tile back to Sunlight
    replaceTile(0, 0, TileTypeLabel.sunlight)
    checkTileTitle(0, 0, Header.displaySelection)
  })

  it('has the correct header title', () => {
    // check header is present
    checkTileTitle(0, 0, Header.displaySelection)

    // Flight Mode
    displaySelection( 0, 0, DisplayModeLabel.flight)
    checkTileTitle(0, 0, Header.flight)

    // Edit mode
    cy.get(`.placeHolder`).click()
    checkTileTitle(0, 0, Header.settings)
    // exist edit mode
    cy.get(`[aria-label="Cancel"]`).click()

    // Definition of Night mode
    displaySelection(0, 0, DisplayModeLabel.reference)
    checkTileTitle(0, 0, Header.reference)
  })

  it('Can switch to definitions of night', () => {
    displaySelection(0, 0, DisplayModeLabel.reference)
    // cy.get(`[aria-label="${DisplayModeLabel.reference}"]`).click()
    checkImageContent('/tiles/nights.png')

    // test mode is saved correctly
    cy.getLocalStorage('template')
      .then(t => {
        const template = JSON.parse(t)
        console.log('>>>>', template)
        expect(template.data[0].data[0].data['mode']).to.equal('ref')
      })
  })

})