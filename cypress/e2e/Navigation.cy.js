import { visitAndCloseBanner, newPage } from './shared'

describe('Tiles', () => {
  // ========================================================================
  // Print Dialog
  // ========================================================================
  it('Print Dialog', () =>{
    visitAndCloseBanner()

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

  it.skip('Mirrors', () => {
    visitAndCloseBanner()
    // load checlist demo
    cy.get('.menuIcon').click()
    cy.get('[aria-label="Load"]').click()

  })

  it('Maintenance Window', () => {
    visitAndCloseBanner()
    cy.get('.maintenanceDialog').click()
  })


})