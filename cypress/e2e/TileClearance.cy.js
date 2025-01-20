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
    cy.get('[aria-label="C R A F T"]')
    cy.get('[aria-label="Vertical Boxes"]')
    cy.get('[aria-label="Departure"]')
    cy.get('[aria-label="Holding"]')

    // Check Departure mode
    cy.get('[aria-label="Departure"]').click()
    cy.get('.boxAtis').contains('Atis')
    cy.get('.boxGround').contains('Grnd')
    cy.get('.boxTower').contains("Twr")
    cy.get('.boxInfo').contains('Info')
    cy.get('.boxWind').contains('Wind')
    cy.get('.boxAltimeterSetting').contains('Altimeter')
    cy.get('.boxRunway').contains('Rwy')
    cy.get('.boxClearedTo').contains('To')
    cy.get('.boxRoute').contains('Route')
    cy.get('.boxAltitudes').contains('Alt/Exp')
    cy.get('.boxFrequency').contains('Freq')
    cy.get('.boxTransponder').contains('XPDR')
    cy.get('.boxClearedTo > .watermrk').contains('C')
    cy.get('.boxRoute > .watermrk').contains('R')
    cy.get('.boxAltitudes > .watermrk').contains('A')
    cy.get('.boxFrequency > .watermrk').contains('F')
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
    const expectedHoldField = ['Established', 'RAD/CRS', 'EFC', 'CRS', 'WCA', 'HDG']
    for(let i=0; i<expectedHoldField.length; i++) {
      cy.get(`.page0 .tile5`).contains(expectedHoldField[i])
    }

    // Display modes should cycles
    cy.get('.page0 .tile5 > .headerTitle').click()
    cy.get('[aria-label="C R A F T"]').click()
    cy.get('.modeCraft').click()
    cy.get('.departure').click()
    cy.get('.clearance').click()
    cy.get('.hold').click()
    cy.get('.modeCraft')

  })


})