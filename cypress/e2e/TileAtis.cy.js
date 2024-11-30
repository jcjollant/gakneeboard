import { visitAndCloseBanner, newPage, titleAtis } from './shared'

describe('ATIS Tile', () => {
  it('ATIS Tile', () => {
    visitAndCloseBanner()

    // check header
    cy.get('.page0 > :nth-child(5) > .headerTitle > div').contains(titleAtis)

    // Check ATIS has all fields in full mode
    cy.get('.info').contains('Info')
    cy.get('.wind').contains('Wind')
    cy.get('.runway').contains('Rwy')
    cy.get('.visibility').contains('Vis')
    cy.get('.sky').contains('Sky')
    cy.get('.temperature').contains('Temp')
    cy.get('.altimeter').contains('Alt')

    // Edit mode
    cy.get('.page0 > :nth-child(5) > .headerTitle').click()

    // Check all display modes are showing up
    cy.get('[aria-label="Full Size ATIS"]')
    cy.get('[aria-label="Compact ATIS (x4)"]')
    cy.get('[aria-label="Flight Categories"]')
    cy.get('[aria-label="Cloud Clearance"]')
    
    // Check ATIS has all fields in compact mode
    cy.get('[aria-label="Compact ATIS (x4)"]').click()
    for(let index=1; index <=4; index++) {
      cy.get(`:nth-child(${index}) > .info`).contains('Info')
      cy.get(`:nth-child(${index}) > .wind`).contains('Wind')
      cy.get(`:nth-child(${index}) > .altimeter`).contains('Alt')
      cy.get(`:nth-child(${index}) > .runway`).contains('Rwy')
  
    }
  })

})