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
    cy.viewport('macbook-16')
    // enable editor
    cy.get('#btnEditor').click()

    // check size makes sense
    const expectedHeight = 800
    cy.get('.twoPages').invoke('outerHeight').should('be.equal', expectedHeight - 3)
    cy.get('.editorMask').invoke('outerHeight').should('be.equal', expectedHeight)

    // Check we have action buttons
    cy.get(':nth-child(1) > [aria-label="Replace"]')
    cy.get(':nth-child(1) > [aria-label="Copy"]')
    cy.get(':nth-child(1) > [aria-label="Paste"]')
    cy.get('.middle > .p-button').should('have.class','p-button-icon-only')
    cy.get(':nth-child(3) > [aria-label="Replace"]')
    cy.get(':nth-child(3) > [aria-label="Copy"]')
    cy.get(':nth-child(3) > [aria-label="Paste"]')

    // reset left
    cy.get(':nth-child(1) > [aria-label="Replace"]').click()
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
    cy.get(':nth-child(3) > [aria-label="Replace"]').click()
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
    cy.get('[aria-label="1 | 2"]').should('not.have.class', 'active')
    cy.get('[aria-label="3 | 4"]').should('have.class', 'active')
    // Check page content
    cy.get('.pageOne').contains('Page Selection')
    cy.get('.pageTwo').contains('Page Selection')

    // delete new page
    cy.get('[title="Delete active sheet"]').click()
    cy.get('.p-confirm-dialog-message').contains('3 and 4')
    cy.get('.p-confirm-dialog-accept').click()
    cy.get('[aria-label="1 | 2"]').should('have.class', 'active')

    // delete last page should not be possible
    cy.get('[title="Delete active sheet"]').click()
    cy.get('[aria-label="1 | 2"]')
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