import { maintenanceMode, loadDemo, visitSkipBanner } from '../shared'

describe('Navigation', () => {

  it('Print Dialog', () => {
    visitSkipBanner()
    maintenanceMode()
    cy.viewport('macbook-16')

    // Test print dialog show up
    loadDemo()
    cy.get('#btnPrint').click()
    // check title
    cy.get('.p-dialog-header').contains('Print')
    cy.url().should('include', '/print/0')
    // Check Page options
    cy.get('.pageOptions').contains('Pages per sheet')
    cy.get('.pageOptions').contains('Back Page Orientation')
    cy.get('[aria-label="One"]')
    cy.get('[aria-label="Two"]')
    cy.get('[aria-label="Normal"]')
    cy.get('[aria-label="Flipped"]')
    // click do not print
    cy.get('.actionDialog > .p-button-link').click()
    cy.url().should('include', '/template/local')
  })

})