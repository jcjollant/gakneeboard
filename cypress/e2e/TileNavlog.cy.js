import { visitAndCloseBanner, titleAtis, maintenanceMode } from './shared'

describe('ATIS Tile', () => {
  it('ATIS Tile', () => {
    visitAndCloseBanner()

    // swap tile for navlog
    cy.get('.pageOne > :nth-child(5) > .headerTitle').click()
    cy.get('.pageOne > :nth-child(5) > .headerTitle > .p-button').click()
    cy.get('[aria-label="Navlog"]').click()
    cy.get('.navlogTile > .headerTitle > div').contains('NavLog')
    cy.get('.placeHolder > :nth-child(1) > :nth-child(1)').contains('No Log')
    cy.get('.small').contains('Create a log in the navlog page')

    // Should not have data
    maintenanceMode()

    // load navlog demo
    cy.get('.menuIcon').click()
    cy.get('[aria-label="Load"]').click()
    cy.get('[aria-label="Navlog"]').click()
    cy.wait(300)
    cy.get('[aria-label="Load Template"]').click()
    // confirm
    cy.get('.p-confirm-dialog-accept').click()


    cy.get('.pageTwo > :nth-child(6) > .headerTitle').contains('NavLog')
    // tile should be populated
    cy.get(':nth-child(1)').should('have.class','entryClimb')
    cy.get(':nth-child(10)').should('have.class','entryDesc')
    cy.get('.nameArrival').contains('KELN (Arrival)')

  })

})