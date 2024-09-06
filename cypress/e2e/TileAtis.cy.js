import { visitAndCloseBanner, newPage, titleAtis } from './shared'

describe('ATIS Tile', () => {
  it('ATIS Tile', () => {
    visitAndCloseBanner()

    // check header
    cy.get('.pageOne > :nth-child(5) > .headerTitle > div').contains(titleAtis)

    // Check ATIS has all fields in full mode
    cy.get('.info').contains('Info')
    cy.get('.wind').contains('Wind')
    cy.get('.runway').contains('Rwy')
    cy.get('.visibility').contains('Vis')
    cy.get('.sky').contains('Sky')
    cy.get('.temperature').contains('Temp')
    cy.get('.altimeter').contains('Alt')

    // Edit mode
    cy.get('.pageOne > :nth-child(5) > .headerTitle').click()
    // check header size
    const expectedHeight = 25
    cy.get('.headerTitle').invoke('outerHeight').should('be.equal', expectedHeight)
    cy.get('.headerTitle > .p-button').invoke('outerHeight').should('be.equal', expectedHeight - 2)

    cy.get('[aria-label="Full Size"]').contains('Full Size')
    cy.get('[aria-label="Compact (x4)"]').contains('Compact (x4)')
    // Check ATIS has all fields in compact mode
    cy.get('[aria-label="Compact (x4)"]').click()
    for(let index=1; index <=4; index++) {
      cy.get(`:nth-child(${index}) > .info`).contains('Info')
      cy.get(`:nth-child(${index}) > .wind`).contains('Wind')
      cy.get(`:nth-child(${index}) > .altimeter`).contains('Alt')
      cy.get(`:nth-child(${index}) > .runway`).contains('Rwy')
  
    }
  })

})