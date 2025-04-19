import { demoNameTiles, environment, loadDemo, visitSkipBanner } from './shared'

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

  it('Navigates directly to publication', () => {
    cy.intercept({method: 'GET',url: '/publication/**',}).as('getPublication');
    cy.visit(environment + '?t=RC')
    cy.wait('@getPublication')

    cy.get('.templateName').contains('C172 G1000')
  })

  it('Goes directly to Tiles demo', () => {
    cy.visit(environment + '?d=tiles')
    cy.get('.templateName').contains(demoNameTiles)
  })
})