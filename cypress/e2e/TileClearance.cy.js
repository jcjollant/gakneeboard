import { visitAndCloseBanner, newPage } from './shared'

describe('Clearance Tile', () => {
  it('Clearance Tile', () => {
    visitAndCloseBanner()

    cy.intercept({
      method: 'GET',
      url: 'https://ga-api-seven.vercel.app/airports/**',
    }).as('getAirports');

    cy.wait('@getAirports').its('response.statusCode').should('equal', 200)

    // Header
    cy.get('.pageOne > :nth-child(6) > .header > div').contains('Clearance @')
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