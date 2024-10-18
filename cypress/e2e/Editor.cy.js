import { visitAndCloseBanner, feltsTitle, boeingTitle, radioFlowTitle, notesTitle, atisTitle, clearanceTitle, loadDemo } from './shared'

function demoChecklistOn(page) {
    cy.get(`${page} > :nth-child(2) > .twoLists > .leftList > :nth-child(19)`).contains('FIRE')
}

function reloadDemo(closeEditor=true) {
    // close editor
    if (closeEditor) cy.get('#btnEditor').click()
    loadDemo('default')

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
    // Toast Should say Page 1 
    // <div class="p-toast-message-text" data-pc-section="text"><span class="p-toast-summary" data-pc-section="summary">Page 1 copied to clipboard</span><div class="p-toast-detail" data-pc-section="detail"></div></div>
    cy.get('.p-toast-message-text').contains('Page 1 copied to clipboard')
    cy.get(':nth-child(3) > [aria-label="Paste"]').click()

    cy.get('.page0 > :nth-child(6) > .headerTitle').contains('Clearance @')
    cy.get('.page1 > :nth-child(6) > .headerTitle').contains('Clearance @')

    // reload demo
    reloadDemo()

    // Copy Back to Front
    cy.get(':nth-child(3) > [aria-label="Copy"]').click()
    cy.get(':nth-child(1) > [aria-label="Paste"]').click()
    cy.get('.page0 > :nth-child(2) > .twoLists > .leftList > :nth-child(19)').contains('FIRE')
    cy.get('.page1 > :nth-child(2) > .twoLists > .leftList > :nth-child(19)').contains('FIRE')


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
    cy.get('.page0').contains('Page Selection')
    cy.get('.page1').contains('Page Selection').should('not.exist')

    reloadDemo();

    // reset right
    cy.get(':nth-child(3) > [aria-label="Replace"]').click()
    cy.get('.page0').contains('Page Selection').should('not.exist')
    cy.get('.page1').contains('Page Selection')

    // reload demo
    reloadDemo()

    // Copy left to right and confirm
    cy.get('#editorCopyToRight').click()
    cy.get('.p-confirm-dialog-accept').click()
    cy.get('.page0 > :nth-child(6) > .headerTitle').contains('Clearance @')
    cy.get('.page1 > :nth-child(6) > .headerTitle').contains('Clearance @')

    // reload demo
    reloadDemo()

    // Copy left to right and confirm
    cy.get('#editorCopyToLeft').click()
    cy.get('.p-confirm-dialog-accept').click()
    demoChecklistOn('.page0')
    demoChecklistOn('.page1')

    // Add a page
    cy.get('#editorInsert').click()
    // New page should have be blanks
    cy.get('.page1').contains('Page Selection')

    // make sure this is reflected in local storage
    cy.getLocalStorage('template')
      .then(t => {
        const template = JSON.parse(t)
        // console.log('>>>>', template)
        expect(template.data.length).to.equal(3)
        expect(template.data[1].type).to.equal('selection')
      })

    // delete new page
    cy.get('.editorBottom > :nth-child(3) > .p-button-warning').click()
    cy.get('.p-confirm-dialog-message').contains('delete page 2')
    cy.get('.p-confirm-dialog-accept').click()
    // Flight page should be back at that position
    cy.get('.page1').contains('Flight')

    // delete last two pages should not be possible
    cy.get('.editorBottom > :nth-child(3) > .p-button-warning').click()
    cy.get('.p-confirm-dialog-message').contains('delete page 2')
    cy.get('.p-confirm-dialog-accept').click()
    // toast should say no more pages
    cy.get('.p-toast-message-text').contains('Last two pages cannot be deleted')

    // Page should still be there
    cy.get('.page1').contains('Flight')

  })
  
  it('Swaps', () => {
    visitAndCloseBanner()
    cy.wait(500)
    cy.viewport('macbook-16')

    // reload demo
    reloadDemo(false)

    // swap left and right
    cy.get('.page0 > :nth-child(6) > .headerTitle').contains('Clearance @')
    demoChecklistOn('.page1')
    cy.get('#editorSwap').click()
    demoChecklistOn('.page0')
    cy.get('.page1 > :nth-child(6) > .headerTitle').contains('Clearance @')

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
    cy.get('#menuNew').click()
    // Accept new page
    cy.get('.p-confirm-dialog-accept').click()

    const expectedList = ['Tiles', 'Checklist', 'Cover', 'NavLog']
    const pages = ['page0', 'page1']
    cy.get('.page0 > .headerTitle').contains('Page Selection')
    for(const page of pages) {
      for( const label of expectedList) {
        cy.get('.' + page + ' > .list > [aria-label="' + label + '"]')
      }
    }
  })


  })