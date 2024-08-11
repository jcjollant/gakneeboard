import { currentVersionNumber, visitAndCloseBanner, titleAtis } from './shared'

describe('Tiles', () => {
  // ========================================================================
  // Print Dialog
  // ========================================================================
  it('Print Dialog', () =>{
    visitAndCloseBanner()

    // check version number
    cy.get('.versionDialog').contains(currentVersionNumber)

    // Test print dialog show up
    cy.get('.menuIcon').click()
    cy.get('[aria-label="Print"]').click()
    // check title
    cy.get('#pv_id_4_header').contains('Print')
    // Check Page options
    cy.get('[aria-label="Front Page"]')
    cy.get('[aria-label="Both Pages"]')
    cy.get('[aria-label="Back Page"]')
    // check options
    cy.get('[title="So you can read back page while front page is clipped"] > .ml-2').contains('Flip Back Page')
    cy.get('[title="That\'s the little thing in the bottom right corner"] > .ml-2').contains('Hide version number')
    cy.get('[title="That\'s the little thing in the bottom right corner"] > .ml-2').click()
    // click do not print
    cy.get('.actionDialog > .p-button-link').click()

    
  })

  it('Mirrors', () => {
    visitAndCloseBanner()

    // wait for airports query
    cy.intercept({
      method: 'GET',
      url: 'https://ga-api-seven.vercel.app/airports/**',
    }).as('getAirports');

    cy.wait('@getAirports').its('response.statusCode').should('equal', 200)

    // load checklist demo
    cy.get('.menuIcon').click()
    cy.get('[aria-label="Mirror"]').click()
    cy.get('.p-confirm-dialog-accept').click()

    // check tiles have been mirrored
    cy.get('.pageTwo > :nth-child(5) > .header > div').contains(titleAtis)
    cy.get('.pageTwo > :nth-child(6) > .header > div').contains('Clearance @')

    // Modifying left page should not impact right page
    cy.get('.pageOne > :nth-child(5) > .header > div').click()
    // replace tile with notes
    cy.get('.header > .p-button').click()
    cy.get('[aria-label="Notes"]').click()
    cy.get('.pageOne > :nth-child(5) > .header > div').contains('Notes')
    // Page two should still be Atis
    cy.get('.pageTwo > :nth-child(5) > .header > div').contains(titleAtis)

  })

  it('Maintenance Window', () => {
    visitAndCloseBanner()
    cy.get('.maintenanceDialog').click()
  })


})