import { currentVersionNumber, environment, visitAndCloseBanner, maintenanceMode } from './shared'

describe('Navigation', () => {
    it('How Does It Work', () => {
      cy.visit(environment)

      function checkHdiw() {
        cy.get('.hdiw').contains('1. Edit')
        cy.get('.hdiw').contains('2. Print')
        cy.get('.hdiw').contains('3. Clip')
      }
      checkHdiw();

      // remove banner
      cy.contains('Got it').click()

      // reopen how does it work via About page
      cy.get('.menuIcon').click()
      cy.get('.p-button-icon-only').click()
      cy.get('.p-button-link').click()

      checkHdiw();

    })

  it('Print Dialog', () =>{
    visitAndCloseBanner()

    // check version number
    cy.get('.versionDialog').contains(currentVersionNumber)

    // Test print dialog show up
    cy.get('.menuIcon').click()
    cy.get('[aria-label="Print"]').click()
    // check title
    cy.get('.p-dialog-header').contains('Print')
    // Check Page options
    cy.get('[aria-label="Front Page"]')
    cy.get('[aria-label="Both"]')
    cy.get('[aria-label="Flipped"]')
    cy.get('[aria-label="Back Page"]')
    // click do not print
    cy.get('.actionDialog > .p-button-link').click()

    
  })


})