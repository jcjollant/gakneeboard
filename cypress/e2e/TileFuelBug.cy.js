import { visitAndCloseBanner, newPage } from './shared'

describe('Fuel Bug Tile', () => {
  it('Fuel Bug Tile', () => {
    visitAndCloseBanner()

    cy.intercept({
      method: 'GET',
      url: 'https://ga-api-seven.vercel.app/airports/**',
    }).as('getAirports');

    cy.wait('@getAirports').its('response.statusCode').should('equal', 200)

    cy.get('.pageTwo > :nth-child(4) > .headerTitle > div').contains('Fuel Bug')
    // switch to edits mode
    cy.get('.pageTwo > :nth-child(4) > .headerTitle > div').click()
        // check it has hint
    cy.get('.actionBar > .p-button-icon-only')

  })

})