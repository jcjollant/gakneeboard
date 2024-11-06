import { visitAndCloseBanner, newPage } from './shared'

describe('Clearance Tile', () => {
  it('Clearance Tile', () => {
    visitAndCloseBanner()

    // Header
    cy.get('.page0 > :nth-child(6) > .headerTitle > div').contains('Clearance @')

    // check defaults to CRAFT mode
    cy.get('.modeCraft')

    // Check settings has 3 modes
    cy.get('.page0 > :nth-child(6) > .headerTitle').click()
    cy.get('[aria-label="Just CRAFT"]')
    cy.get('[aria-label="Vertical Boxes"]')
    cy.get('[aria-label="Horizontal Boxes"]').click()

    // Check BoxV mode
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
    cy.get('.page0 > :nth-child(6) > .headerTitle').click()
    cy.get('[aria-label="Vertical Boxes"]').click()

    // Check BoxH mode
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

    // Check mode change via direct click
    cy.get('.page0 > :nth-child(6) > .tileContent').click()
    cy.get('.page0 > :nth-child(6) > .tileContent').click()

    // should be in craft mode
    cy.get('.modeCraft')
  })


})