import { visitAndCloseBanner, feltsTitle, boeingTitle, radioFlowTitle, notesTitle, atisTitle, clearanceTitle } from './shared'

function demoChecklistOn(page) {
    cy.get(`${page} > :nth-child(2) > .twoLists > .leftList > :nth-child(19)`).contains('FIRE')
}

function reloadDemo(closeEditor=true) {
    // close editor
    if (closeEditor) cy.get('#btnEditor').click()
    cy.get('.menuIcon').click()
    cy.get('[aria-label="Demos"]').click()
    cy.get('.defaultDemo').click()
    cy.get('.p-confirm-dialog-accept').click()
    cy.get('.menuIcon').click()
    cy.get('#btnEditor').click()
}

describe('Editor', () => {
  it('Copy/Paste', () => {
    visitAndCloseBanner()
    cy.wait(500)
    cy.viewport('macbook-16')

    // reload demo
    reloadDemo(false)

    // Copy Front to Back via clip board
    cy.get(':nth-child(1) > [aria-label="Copy"]').click()
    cy.get(':nth-child(3) > [aria-label="Paste"]').click()

    cy.get('.pageOne > :nth-child(6) > .headerTitle').contains('Clearance @')
    cy.get('.pageTwo > :nth-child(6) > .headerTitle').contains('Clearance @')

    // reload demo
    reloadDemo()

    // Copy Back to Front
    cy.get(':nth-child(3) > [aria-label="Copy"]').click()
    cy.get(':nth-child(1) > [aria-label="Paste"]').click()
    cy.get('.pageOne > :nth-child(2) > .twoLists > .leftList > :nth-child(19)').contains('FIRE')
    cy.get('.pageTwo > :nth-child(2) > .twoLists > .leftList > :nth-child(19)').contains('FIRE')


  })

  it('Editor', () => {
    visitAndCloseBanner()

    cy.viewport('macbook-16')
    // enable editor
    cy.get('#btnEditor').click()

    // check size makes sense
    const expectedHeight = 800
    // cy.get('.twoPages').should( el => expect(el.height()).eq(expectedHeight))
    // cy.get('.twoPages').invoke('outerHeight').should('be.equal', expectedHeight)
    cy.get('.editorMask').invoke('outerHeight').should('be.equal', expectedHeight)

    // Check we have action buttons
    cy.get(':nth-child(1) > [aria-label="Replace"]')
    cy.get(':nth-child(1) > [aria-label="Copy"]')
    cy.get(':nth-child(1) > [aria-label="Paste"]')
    cy.get('#editorCopyToRight').should('have.class','p-button-icon-only')
    cy.get('#editorSwap').should('have.class','p-button-icon-only')
    cy.get('#editorCopyToLeft').should('have.class','p-button-icon-only')
    cy.get(':nth-child(3) > [aria-label="Replace"]')
    cy.get(':nth-child(3) > [aria-label="Copy"]')
    cy.get(':nth-child(3) > [aria-label="Paste"]')

    // reset left
    cy.get(':nth-child(1) > [aria-label="Replace"]').click()
    cy.get('.pageOne').contains('Page Selection')
    cy.get('.pageTwo').contains('Page Selection').should('not.exist')

    reloadDemo();

    // reset right
    cy.get(':nth-child(3) > [aria-label="Replace"]').click()
    cy.get('.pageOne').contains('Page Selection').should('not.exist')
    cy.get('.pageTwo').contains('Page Selection')

    // reload demo
    reloadDemo()

    // Copy left to right and confirm
    cy.get('#editorCopyToRight').click()
    cy.get('.p-confirm-dialog-accept').click()
    cy.get('.pageOne > :nth-child(6) > .headerTitle').contains('Clearance @')
    cy.get('.pageTwo > :nth-child(6) > .headerTitle').contains('Clearance @')

    // reload demo
    reloadDemo()

    // Copy left to right and confirm
    cy.get('#editorCopyToLeft').click()
    cy.get('.p-confirm-dialog-accept').click()
    demoChecklistOn('.pageOne')
    demoChecklistOn('.pageTwo')

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
    cy.get('.p-confirm-dialog-accept').click()
    cy.get('[aria-label="1 | 2"]')

  })
  
  it('Swaps', () => {
    visitAndCloseBanner()
    cy.wait(500)
    cy.viewport('macbook-16')

    // reload demo
    reloadDemo(false)

    // swap left and right
    cy.get('.pageOne > :nth-child(6) > .headerTitle').contains('Clearance @')
    demoChecklistOn('.pageTwo')
    cy.get('#editorSwap').click()
    demoChecklistOn('.pageOne')
    cy.get('.pageTwo > :nth-child(6) > .headerTitle').contains('Clearance @')

    // Test tiles swapping
    reloadDemo()

    // check we have tile swap buttons on left page
    const expectedButtons = ['btn1', 'btn2', 'btn3', 'btn4', 'btn5', 'btn6', 'btn7']
    for( const expected of expectedButtons) {
      cy.get('.editorMask > .leftTileOverlay > .' + expected).should('exist')
    }
    // right should not be there
    cy.get('.editorMask > .rightTileOverlay > .btn1').should('not.exist')
    // test swaps
    cy.get(':nth-child(1) > .headerTitle').contains(boeingTitle)
    cy.get(':nth-child(2) > .headerTitle').contains(feltsTitle)
    cy.get(':nth-child(3) > .headerTitle').contains(radioFlowTitle)
    cy.get(':nth-child(4) > .headerTitle').contains(notesTitle)
    // Flip 1 and 2
    cy.get('.editorMask > .leftTileOverlay > .btn1').click()
    cy.get(':nth-child(1) > .headerTitle').contains(feltsTitle)
    cy.get(':nth-child(2) > .headerTitle').contains(boeingTitle)
    // Should flip 1 and 3
    cy.get('.editorMask > .leftTileOverlay > .btn2').click()
    cy.get(':nth-child(1) > .headerTitle').contains(radioFlowTitle)
    cy.get(':nth-child(3) > .headerTitle').contains(feltsTitle)
    // Flip 2 and 4
    cy.get('.editorMask > .leftTileOverlay > .btn3').click()
    cy.get(':nth-child(2) > .headerTitle').contains(notesTitle)
    cy.get(':nth-child(4) > .headerTitle').contains(boeingTitle)
    // flip 3 and 4
    cy.get('.editorMask > .leftTileOverlay > .btn4').click()
    cy.get(':nth-child(3) > .headerTitle').contains(boeingTitle)
    cy.get(':nth-child(4) > .headerTitle').contains(feltsTitle)
    // flip 3 and 5
    cy.get('.editorMask > .leftTileOverlay > .btn5').click()
    cy.get(':nth-child(3) > .headerTitle').contains(atisTitle)
    cy.get(':nth-child(5) > .headerTitle').contains(boeingTitle)
    // flip 4 and 6
    cy.get('.editorMask > .leftTileOverlay > .btn6').click()
    cy.get(':nth-child(4) > .headerTitle').contains(clearanceTitle)
    cy.get(':nth-child(6) > .headerTitle').contains(feltsTitle)
    // flip 5 and 6
    cy.get('.editorMask > .leftTileOverlay > .btn7').click()
    cy.get(':nth-child(5) > .headerTitle').contains(feltsTitle)
    cy.get(':nth-child(6) > .headerTitle').contains(boeingTitle)
  })

  it('Page Selection', () => {
    visitAndCloseBanner()

    cy.wait(500)

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