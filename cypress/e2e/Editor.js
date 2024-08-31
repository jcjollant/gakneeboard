import { currentVersionNumber, environment, visitAndCloseBanner, maintenanceMode } from './shared'

describe('Editor', () => {
 it('Editor', () => {
    visitAndCloseBanner()

    cy.wait(1000)

    // enable editor
    cy.get('.pi-file-edit').click()

    // Check we have action buttons
    cy.get(':nth-child(1) > [aria-label="Reset"]')
    cy.get(':nth-child(1) > [aria-label="Copy"]')
    cy.get(':nth-child(1) > [aria-label="Paste"]')
    cy.get('.middle > .p-button').should('have.class','p-button-icon-only')
    cy.get(':nth-child(3) > [aria-label="Reset"]')
    cy.get(':nth-child(3) > [aria-label="Copy"]')
    cy.get(':nth-child(3) > [aria-label="Paste"]')

    // reset left
    cy.get(':nth-child(1) > [aria-label="Reset"]').click()
    cy.get('.pageOne').contains('Page Selection')
    cy.get('.pageTwo').contains('Page Selection').should('not.exist')

    // reload demo
    cy.get('.menuIcon').click()
    cy.get('[aria-label="Demo"]').click()
    cy.get('.p-confirm-dialog-accept').click()

    // reset right
    cy.get(':nth-child(3) > [aria-label="Reset"]').click()
    cy.get('.pageOne').contains('Page Selection').should('not.exist')
    cy.get('.pageTwo').contains('Page Selection')

    // reload demo
    cy.get('[aria-label="Demo"]').click()
    cy.get('.p-confirm-dialog-accept').click()

    // swap
    cy.get('.pageOne > :nth-child(6) > .headerTitle').contains('Clearance @')
    cy.get('.pageTwo > :nth-child(2) > .twoLists > .leftList > :nth-child(19)').contains('FIRE')
    cy.get('.middle > .p-button').click()
    cy.get('.pageOne > :nth-child(2) > .twoLists > .leftList > :nth-child(19)').contains('FIRE')
    cy.get('.pageTwo > :nth-child(6) > .headerTitle').contains('Clearance @')

    // reload demo
    cy.get('[aria-label="Demo"]').click()
    cy.get('.p-confirm-dialog-accept').click()

    // Copy Front to Back
    cy.get(':nth-child(1) > [aria-label="Copy"]').click()
    cy.get(':nth-child(3) > [aria-label="Paste"]').click()

    cy.get('.pageOne > :nth-child(6) > .headerTitle').contains('Clearance @')
    cy.get('.pageTwo > :nth-child(6) > .headerTitle').contains('Clearance @')

    // reload demo
    cy.get('[aria-label="Demo"]').click()
    cy.get('.p-confirm-dialog-accept').click()

    // Copy Back to Front
    cy.get(':nth-child(3) > [aria-label="Copy"]').click()
    cy.get(':nth-child(1) > [aria-label="Paste"]').click()
    cy.get('.pageOne > :nth-child(2) > .twoLists > .leftList > :nth-child(19)').contains('FIRE')
    cy.get('.pageTwo > :nth-child(2) > .twoLists > .leftList > :nth-child(19)').contains('FIRE')

  })
  
  it('Page Selection', () => {
    visitAndCloseBanner()

    cy.wait(1000)

    cy.get('.menuIcon').click()
    cy.get('[aria-label="New"]').click()
    // Accept new page
    cy.get('.p-confirm-dialog-accept').click()

    const expectedList = ['Tiles', 'Checklist', 'Cover', 'NavLog']
    const pages = ['pageOne', 'pageTwo']
    cy.get('.pageOne > .headerTitle').contains('Page Selection')
    for(const page of pages) {
      for( const label of expectedList) {
        cy.get('.' + page + ' > .list > [aria-label="' + label + '"]')
      }
    }
  })


  })