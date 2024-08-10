import { visitAndCloseBanner, newPage } from './shared'

describe('Tiles', () => {
  // ========================================================================
  // Sunlight
  // ========================================================================
  it('Sunlight Tile', () => {
    visitAndCloseBanner()

    cy.intercept({
      method: 'GET',
      url: 'https://ga-api-seven.vercel.app/airports/**',
    }).as('getAirports');

    cy.wait('@getAirports').its('response.statusCode').should('equal', 200)

    // check header is present
    cy.get('.pageTwo > :nth-child(3) > .header > div').contains('Sun Light')
    // date should be today
    const today = new Date().toLocaleString('en-US', {weekday: 'short', month: 'short', day: 'numeric'})
    cy.get('.date').contains( today)
    // Check corners in day mode
    cy.get('.topLeftCorner').contains('KRNT')
    cy.get('.topRightCorner').contains('KSFF')
    cy.get('.bottomLeftCorner').contains('Solar Noon')
    cy.get('.bottomRightCorner').contains('Golden Hour')
    // switch to overnight mode
    cy.get('.pageTwo > :nth-child(3) > .header > div').click()
    // check it has hint
    cy.get('.actionBar > .p-button-icon-only')

    cy.get('.nightFlight').click()
    cy.get('[aria-label="Apply"]').click()
    cy.intercept({
      method: 'GET',
      url: 'https://ga-api-seven.vercel.app/sunlight/**',
    }).as('getSunlight');    
    cy.wait('@getSunlight').its('response.statusCode').should('equal', 200)
    // Check corners in night mode
    cy.get('.topLeftCorner').contains('KRNT')
    cy.get('.topRightCorner').contains('KSFF')
    cy.get('.bottomLeftCorner').contains('From')
    cy.get('.bottomRightCorner').contains('To')
    cy.get('.date').contains( 'Night Flight')
    // Test Tile can be replaced by Notes
    cy.get('.pageTwo > :nth-child(3) > .header > div').click()
    cy.get('.header > .p-button').click()
    cy.get('[aria-label="Notes"]').click()
    cy.get(':nth-child(2) > :nth-child(3) > .header > div').contains('Notes')
    // If we come back to sunlight, it should be in edit mode
    cy.get(':nth-child(2) > :nth-child(3) > .header > div').click()
    cy.get('.header > .p-button').click()
    cy.get('[aria-label="Sunlight"]').click()
    // Check edit mode fields
    cy.get('.settings > :nth-child(1) > .p-inputgroup > .p-inputgroup-addon').contains('From')
    cy.get(':nth-child(2) > .p-inputgroup > .p-inputgroup-addon').contains('To')
    cy.get('.pageTwo > :nth-child(3) > .content > .settings > :nth-child(3)').contains('Date')
    cy.get('[aria-label="Cancel"]').click()

  })

})