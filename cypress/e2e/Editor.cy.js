import { visitAndCloseBanner } from './shared'

function reloadDemo() {
    cy.get('#btnEditor').click()
    cy.get('.menuIcon').click()
    cy.get('[aria-label="Demo"]').click()
    cy.get('.p-confirm-dialog-accept').click()
    cy.get('.menuIcon').click()
    cy.get('#btnEditor').click()
}

describe('Editor', () => {
 it('Editor', () => {
    visitAndCloseBanner()

    cy.wait(500)
    cy.viewport('macbook-13')
    // enable editor
    cy.get('#btnEditor').click()

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

    // close editor and reload demo
    cy.get('#btnEditor').click()
    cy.get('.menuIcon').click()
    cy.get('[aria-label="Demo"]').click()
    cy.get('.p-confirm-dialog-accept').click()
    // back to editor mode
    cy.get('#btnEditor').click()

    // reset right
    cy.get(':nth-child(3) > [aria-label="Reset"]').click()
    cy.get('.pageOne').contains('Page Selection').should('not.exist')
    cy.get('.pageTwo').contains('Page Selection')

    // reload demo
    reloadDemo()

    // swap
    cy.get('.pageOne > :nth-child(6) > .headerTitle').contains('Clearance @')
    cy.get('.pageTwo > :nth-child(2) > .twoLists > .leftList > :nth-child(19)').contains('FIRE')
    cy.get('.middle > .p-button').click()
    cy.get('.pageOne > :nth-child(2) > .twoLists > .leftList > :nth-child(19)').contains('FIRE')
    cy.get('.pageTwo > :nth-child(6) > .headerTitle').contains('Clearance @')

    // reload demo
    reloadDemo()

    // Copy Front to Back
    cy.get(':nth-child(1) > [aria-label="Copy"]').click()
    cy.get(':nth-child(3) > [aria-label="Paste"]').click()

    cy.get('.pageOne > :nth-child(6) > .headerTitle').contains('Clearance @')
    cy.get('.pageTwo > :nth-child(6) > .headerTitle').contains('Clearance @')

    reloadDemo()

    // Copy Back to Front
    cy.get(':nth-child(3) > [aria-label="Copy"]').click()
    cy.get(':nth-child(1) > [aria-label="Paste"]').click()
    cy.get('.pageOne > :nth-child(2) > .twoLists > .leftList > :nth-child(19)').contains('FIRE')
    cy.get('.pageTwo > :nth-child(2) > .twoLists > .leftList > :nth-child(19)').contains('FIRE')

    // Add a page
    cy.get('[title="Add 2 Pages"]').click()
    // select new page
    cy.get('[aria-label="3 | 4"]').click()
    cy.get('.pageOne').contains('Page Selection')
    cy.get('.pageTwo').contains('Page Selection')

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