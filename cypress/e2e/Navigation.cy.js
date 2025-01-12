import { environment, loadDemo, visitSkipBanner } from './shared'

describe('Navigation', () => {
  it('Offset', () => {
    visitSkipBanner()
    cy.viewport('macbook-16')

    // As user I should not be able to see navigation button on show pages
    loadDemo()
    cy.get('#offsetPrev').should('have.class','noShow')
    cy.get('#offsetNext').should('have.class','noShow')

    // Load Checklist Demo and navigate offset
    cy.visit(environment)
    loadDemo('Checklist')

    cy.get('#offsetPrev').should('have.class','noShow')
    cy.get('#offsetNext').should('not.have.class','noShow')
    cy.get('.page0').should('be.visible')
    cy.get('.page1').should('be.visible')
    cy.get('.page2').should('not.be.visible')

    // move to next page (2 and 3)
    cy.get('#offsetNext').click()
    cy.get('#offsetPrev').should('not.have.class','noShow')
    cy.get('#offsetNext').should('have.class','noShow')
    cy.get('.page0').should('not.be.visible')
    cy.get('.page1').should('be.visible')
    cy.get('.page2').should('be.visible')

    // first page 1 and 2
    cy.get('#offsetPrev').click()
    cy.get('#offsetPrev').should('have.class','noShow')
    cy.get('#offsetNext').should('not.have.class','noShow')
    cy.get('.page0').should('be.visible')
    cy.get('.page1').should('be.visible')
    cy.get('.page2').should('not.be.visible')

  })

  it('Publication', () => {
    cy.intercept({method: 'GET',url: '/publication/**',}).as('getPublication');
    cy.visit(environment + '?t=RC')
    cy.wait('@getPublication')

    // remove banner
    cy.contains('Got it').click()

    cy.get('#app').contains('C172 G1000')
    cy.get('#offsetPrev').should('have.class','noShow')
    cy.get('#offsetNext').should('not.have.class','noShow')
    cy.get('.page0').should('have.class','pageChecklist')
    cy.get('.page1').should('have.class','pageChecklist')
    cy.get('.page2').should('have.class','pageChecklist')
    cy.get('.page3').should('have.class','pageChecklist')
    cy.get('.page4').should('have.class','pageChecklist')
    cy.get('.page5').should('have.class','pageChecklist')

    // pages should have a version number
    cy.get('.page0 .version')
    cy.get('.page1 .version')
  })

  it('Print Dialog', () =>{
    visitSkipBanner()
    cy.viewport('macbook-16')

    // Test print dialog show up
    loadDemo()
    cy.get('#btnPrint').click()
    // check title
    cy.get('.p-dialog-header').contains('Print')
    // Check Page options
    cy.get('.pageOptions').contains('Pages per sheet')
    cy.get('.pageOptions').contains('Back Page Orientation')
    cy.get('[aria-label="One"]')
    cy.get('[aria-label="Two"]')
    cy.get('[aria-label="Normal"]')
    cy.get('[aria-label="Flipped"]')
    // click do not print
    cy.get('.actionDialog > .p-button-link').click()
  })
})