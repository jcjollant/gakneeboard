import { loadDemo, placeHolderSubtitle, visitSkipBanner } from './shared'

describe('Tiles', () => {
  // ========================================================================
  // Sunlight
  // ========================================================================
  it('Sunlight Tile', () => {
    visitSkipBanner()
    loadDemo('Tiles')

    cy.intercept({
      method: 'GET',
      url: 'https://ga-api-seven.vercel.app/airports/**',
    }).as('getAirports');

    // check header is present
    cy.get('.page1 .tile2 > .headerTitle').contains('Sun Light')
    // date should be today
    const today = new Date().toLocaleString('en-US', {weekday: 'short', month: 'short', day: 'numeric'})
    cy.get('.date').contains( today)
    // Check corners in day mode
    cy.get('.topLeftCorner').contains('KRNT')
    cy.get('.topRightCorner').contains('KSFF')
    cy.get('.bottomLeftCorner').contains('Solar Noon')
    cy.get('.bottomRightCorner').contains('Golden Hour')
    cy.wait('@getAirports').its('response.statusCode').should('equal', 200)

    // switch to overnight mode
    cy.get('.page1 > :nth-child(3) > .headerTitle > div').click()
    // check it has hint
    cy.get('.actionBarHelp')

    cy.get('.nightFlight').click()
    cy.get('[aria-label="Apply"]').click()

    // Check corners in night mode
    cy.get('.topLeftCorner').contains('KRNT')
    cy.get('.topRightCorner').contains('KSFF')
    cy.get('.bottomLeftCorner').contains('From')
    cy.get('.bottomRightCorner').contains('To')
    cy.get('.date').contains( 'Night Flight')
    // Test Tile can be replaced by Notes
    cy.get('.page1 > :nth-child(3) > .headerTitle > div').click()
    cy.get('.page1 > :nth-child(3) > .headerTitle > .p-button').click({force: true})
    cy.get('[aria-label="Notes"]').click()
    cy.get(':nth-child(2) > :nth-child(3) > .headerTitle > div').contains('Notes')
    // Change tile back to Sunlight
    cy.get(':nth-child(2) > :nth-child(3) > .headerTitle > div').click()
    cy.get(':nth-child(2) > :nth-child(3) > .headerTitle > .p-button').click({force: true})
    cy.get('[aria-label="Sunlight"]').click()
    // We should see the placeholder
    cy.get('.page1 > :nth-child(3) > :nth-child(2) > .placeHolder').contains('No Airport')
    cy.get('.page1 > :nth-child(3) > :nth-child(2) > .placeHolder').contains(placeHolderSubtitle)
  })

})