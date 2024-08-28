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

    cy.wait(2000)

    // check header is present
    cy.get('.pageTwo > :nth-child(3) > .headerTitle > div').contains('Sun Light')
    // date should be today
    const today = new Date().toLocaleString('en-US', {weekday: 'short', month: 'short', day: 'numeric'})
    cy.get('.date').contains( today)
    // Check corners in day mode
    cy.get('.topLeftCorner').contains('KRNT')
    cy.get('.topRightCorner').contains('KSFF')
    cy.get('.bottomLeftCorner').contains('Solar Noon')
    cy.get('.bottomRightCorner').contains('Golden Hour')
    // switch to overnight mode
    cy.get('.pageTwo > :nth-child(3) > .headerTitle > div').click()
    // check it has hint
    cy.get('.actionBar > .p-button-icon-only')

    cy.get('.nightFlight').click()
    cy.get('[aria-label="Apply"]').click()
    cy.wait(500)
    // Check corners in night mode
    cy.get('.topLeftCorner').contains('KRNT')
    cy.get('.topRightCorner').contains('KSFF')
    cy.get('.bottomLeftCorner').contains('From')
    cy.get('.bottomRightCorner').contains('To')
    cy.get('.date').contains( 'Night Flight')
    // Test Tile can be replaced by Notes
    cy.get('.pageTwo > :nth-child(3) > .headerTitle > div').click()
    cy.get('.headerTitle > .p-button').click()
    cy.get('[aria-label="Notes"]').click()
    cy.get(':nth-child(2) > :nth-child(3) > .headerTitle > div').contains('Notes')
    // Change tile back to Sunlight
    cy.get(':nth-child(2) > :nth-child(3) > .headerTitle > div').click()
    cy.get('.headerTitle > .p-button').click()
    cy.get('[aria-label="Sunlight"]').click()
    // We should see the placeholder
    cy.get('.pageTwo > :nth-child(3) > :nth-child(2) > .placeHolder').contains('No Airport')
    cy.get('.pageTwo > :nth-child(3) > :nth-child(2) > .placeHolder').contains('Click header to configure')
  })

})