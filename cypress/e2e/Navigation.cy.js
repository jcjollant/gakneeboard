import { currentVersionNumber, environment, visitAndCloseBanner, maintenanceMode } from './shared'

describe('Navigation', () => {
  it('HDIW and default nav', () => {
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

    // remove banner
    cy.contains('Got it').click()

    cy.get('#offsetPrev').should('have.class','noShow')
    cy.get('#offsetNext').should('have.class','noShow')
    cy.get('.sheetNumber').should('match',':empty')

  })

  it('Publication', () => {
    cy.intercept({
      method: 'GET',
      url: '/publication/**',
    }).as('getPublication');
    cy.visit(environment + '?t=RC')
    cy.wait('@getPublication').its('response.statusCode').should('equal', 200)

    // remove banner
    cy.contains('Got it').click()

    cy.get('#app').contains('C172 G1000')
    cy.get('#offsetPrev').should('have.class','noShow')
    cy.get('#offsetNext').should('not.have.class','noShow')
    cy.get('.pageOne').should('have.class','pageCover')
    cy.get('.pageTwo').should('have.class','pageChecklist')
    cy.get('.sheetNumber').contains('1/3')
    // click next
    cy.get('#offsetNext').click()
    // Now both should be visible
    cy.get('#offsetPrev').should('not.have.class','noShow')
    cy.get('#offsetNext').should('not.have.class','noShow')
    cy.get('.pageOne').should('have.class','pageChecklist')
    cy.get('.pageTwo').should('have.class','pageChecklist')
    cy.get('.sheetNumber').contains('2/3')
    // click next
    cy.get('#offsetNext').click()
    // Next should be hidden, prev should be visible
    cy.get('#offsetPrev').should('not.have.class','noShow')
    cy.get('#offsetNext').should('have.class','noShow')
    cy.get('.pageOne').should('have.class','pageChecklist')
    cy.get('.pageTwo').should('have.class','pageChecklist')
    cy.get('.sheetNumber').contains('3/3')
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