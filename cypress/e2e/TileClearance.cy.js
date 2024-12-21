import { clearanceTitle, visitSkipBanner, loadDemo, holdTitle } from './shared'

describe('Clearance Tile', () => {
  it('Clearance Tile', () => {
    visitSkipBanner()
    loadDemo('Tiles')
    // Header
    cy.get('.page0 .tile5 > .headerTitle').contains(clearanceTitle)

    // check defaults to CRAFT mode
    cy.get('.modeCraft')

    // Check settings has 4 modes
    cy.get('.page0 .tile5 > .headerTitle').click()
    cy.get('[aria-label="Just CRAFT"]')
    cy.get('[aria-label="Vertical Boxes"]')
    cy.get('[aria-label="Horizontal Boxes"]')
    cy.get('[aria-label="Holding"]')

    // Check BoxV mode
    cy.get('[aria-label="Horizontal Boxes"]').click()
    cy.get('.boxCleared').contains('To')
    cy.get('.boxCleared > .watermrk').contains('C')
    cy.get('.boxRouteH').contains('Route')
    cy.get('.boxRouteH > .watermrk').contains('R')
    cy.get('.boxAltitudeH').contains("Altitude")
    cy.get('.boxAltitudeH > .watermrk').contains('A')
    cy.get('.boxFrequencyH').contains('Freq.')
    cy.get('.boxFrequencyH > .watermrk').contains('F')
    cy.get('.boxTransponder').contains('Xpdr')
    cy.get('.boxTransponder > .watermrk').contains('T')

    // Check mode change via settings
    cy.get('.page0 .tile5 > .headerTitle').click()
    cy.get('[aria-label="Vertical Boxes"]').click()
    cy.get('.boxCleared').contains('To')
    cy.get('.boxCleared > .watermrk').contains('C')
    cy.get('.boxRouteV').contains('Route')
    cy.get('.boxRouteV > .watermrk').contains('R')
    cy.get('.boxAltitudeV').contains("Altitude")
    cy.get('.boxAltitudeV > .watermrk').contains('A')
    cy.get('.boxFrequencyV').contains('Freq.')
    cy.get('.boxFrequencyV > .watermrk').contains('F')
    cy.get('.boxTransponder').contains('Xpdr')
    cy.get('.boxTransponder > .watermrk').contains('T')

    // Check Holding
    cy.get('.page0 .tile5 > .headerTitle').click()
    cy.get('[aria-label="Holding"]').click()
    cy.get('.page0 .tile5 > .headerTitle').contains(holdTitle)
    const expectedHoldField = ['Turns', 'RAD/CRS', 'EFC', 'CRS', 'WCA', 'HDG']
    for(let i=0; i<expectedHoldField.length; i++) {
      cy.get(`.page0 .tile5`).contains(expectedHoldField[i])
    }
  })


})