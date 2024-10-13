import { visitAndCloseBanner, newPage } from './shared'

describe('Clearance Tile', () => {
  it('Clearance Tile', () => {
    visitAndCloseBanner()

    // Header
    cy.get('.page0 > :nth-child(6) > .headerTitle > div').contains('Clearance @')
    // Fields
    cy.get('.cleared').contains('To')
    cy.get('.cleared > .watermrk').contains('C')
    cy.get('.route').contains('Route')
    cy.get('.route > .watermrk').contains('R')
    cy.get('.altitude').contains("Altitude")
    cy.get('.altitude > .watermrk').contains('A')
    cy.get('.frequency').contains('Freq.')
    cy.get('.frequency > .watermrk').contains('F')
    cy.get('.transponder').contains('Xpdr')
    cy.get('.transponder > .watermrk').contains('T')
  })


})