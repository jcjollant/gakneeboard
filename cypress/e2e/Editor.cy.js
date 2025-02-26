import { visitAndCloseBanner, feltsTitle, boeingTitle, radioTitle, notesTitle, atisTitle, clearanceTitle, loadDemo, visitSkipBanner, environment,
 demoChecklistOnPage, demoTilesOnPage, 
 departureTitle,
 selectionTitle} from './shared'

function deletePage(index, force=false) {w
    cy.get('.editorPage' + index + ' > .editorBottom > .p-button-warning').click({force:force})
    cy.get('.p-confirm-dialog-message').contains('delete page ' + (index + 1))
    cy.get('.p-confirm-dialog-accept').click({force:force})
}

function reloadDemoWithEditor() {
    cy.visit(environment)
    loadDemo(0)
    // wait for airports to be loaded
    cy.get('.page0 .tile0 > .headerTitle').should('not.contain','Loading')
    cy.get('.page0 .tile1 > .headerTitle').should('not.contain','Loading')

    // reopen editor
    cy.get('#btnEditor').click()

}

describe('Editor', () => {
  it('Copy/Paste', () => {
    visitSkipBanner()
    cy.viewport('macbook-16')

    // reload demo
    reloadDemoWithEditor()

    // Copy Left to Right via clip board
    cy.get('.editorPage0 > .editorBottom > [aria-label="Copy"]').click()
    // Toast Should say Page 1 
    // <div class="p-toast-message-text" data-pc-section="text"><span class="p-toast-summary" data-pc-section="summary">Page 1 copied to clipboard</span><div class="p-toast-detail" data-pc-section="detail"></div></div>
    expectToast('Page 1 copied to clipboard')
    cy.get('.editorPage1 > .editorBottom > [aria-label="Paste"]').click()

    cy.get('.page0 > :nth-child(6) > .headerTitle').contains(departureTitle)
    cy.get('.page1 > :nth-child(6) > .headerTitle').contains(departureTitle)

    // copy tile from page0 to page1
    cy.get('.editorPage0 .btnCopy1').click()
    cy.get('.editorPage1 .btnPaste2').click()
    cy.get('.page1 > :nth-child(2) > .headerTitle').contains(boeingTitle)

    // copy tile from page1 to page0
    cy.get('.editorPage1 .btnCopy3').click()
    cy.get('.editorPage0 .btnPaste4').click()
    cy.get('.page0 > :nth-child(4) > .headerTitle').contains(radioTitle)


    // reload demo
    reloadDemoWithEditor()

    // Copy right to left
    cy.get('.editorPage1 > .editorBottom > [aria-label="Copy"]').click()
    cy.get('.editorPage0 > .editorBottom > [aria-label="Paste"]').click()
    demoChecklistOnPage(0)
    demoChecklistOnPage(1)

    // reload demo
    reloadDemoWithEditor()

    // Copy All left tiles to right
    cy.get('.btnCopy1').click()
    cy.get('.btnPaste2').click()
    cy.get(`.page0 > :nth-child(2) > .headerTitle`).contains(boeingTitle)
    cy.get('.btnCopy3').click()
    cy.get('.btnPaste4').click()
    cy.get(`.page0 > :nth-child(4) > .headerTitle`).contains(radioTitle)
    cy.get('.btnCopy5').click()
    cy.get('.btnPaste6').click()
    cy.get(`.page0 > :nth-child(6) > .headerTitle`).contains(atisTitle)

    // reload demo
    reloadDemoWithEditor()

    // Copy all right tiles to left    
    cy.get('.btnCopy2').click()
    cy.get('.btnPaste1').click()
    cy.get(`.page0 > :nth-child(1) > .headerTitle`).contains(feltsTitle)
    cy.get('.btnCopy4').click()
    cy.get('.btnPaste3').click()
    cy.get(`.page0 > :nth-child(3) > .headerTitle`).contains(notesTitle)
    cy.get('.btnCopy6').click()
    cy.get('.btnPaste5').click()
    cy.get(`.page0 > :nth-child(6) > .headerTitle`).contains(departureTitle)
  })

  it('Editor', () => {
    cy.viewport('macbook-16')
    visitSkipBanner()
    // enable editor
    reloadDemoWithEditor()

    // check size makes sense
    const expectedHeight = 800
    // cy.get('.twoPages').should( el => expect(el.height()).eq(expectedHeight))
    // cy.get('.twoPages').invoke('outerHeight').should('be.equal', expectedHeight)
    cy.get('.editorPage0 > .overlay').invoke('outerHeight').should('be.equal', expectedHeight)

    // Check we have all action buttons
    const expectedPages = [0,1]
    for( let pageIndex = 0; pageIndex < 2; pageIndex++) {
      // Page controls
      cy.get('.editorPage' + pageIndex + ' > .editorBottom > [aria-label="Copy"]')
      cy.get('.editorPage' + pageIndex + ' > .editorBottom > [aria-label="Paste"]')
      cy.get('.editorPage' + pageIndex + ' > .editorBottom > [aria-label="Replace"]')
      cy.get('.editorPage' + pageIndex + ' > .editorBottom > [aria-label="Delete"]')
      // Insert Button is always present
      cy.get('.editorPage' + pageIndex + ' > .verticalBar > #editorInsert')
    }

    // first insert button
    cy.get(':nth-child(1) > #editorInsert')
    // Last insert button should have special title
    cy.get('.editorPage1 > .verticalBar > #editorInsert')
      .invoke('attr', 'title')
      .should('eq', 'Add One Page')

    // these should not be ambiguous since page1 doesn't have them
    cy.get('#editorCopyToRight')
    cy.get('#editorSwap')
    cy.get('#editorCopyToLeft')

    // reset left
    cy.get('.editorPage0 > .editorBottom > [aria-label="Replace"]').click()
    cy.get('.page0').contains(selectionTitle)
    cy.get('.page1').contains(selectionTitle).should('not.exist')

    reloadDemoWithEditor();

    // reset right
    cy.get('.editorPage1 > .editorBottom > [aria-label="Replace"]').click()
    cy.get('.page0').contains(selectionTitle).should('not.exist')
    cy.get('.page1').contains(selectionTitle)

    // reload demo
    reloadDemoWithEditor()

    // Copy left to right and confirm
    cy.get('#editorCopyToRight').click()
    cy.get('.p-confirm-dialog-accept').click()
    // both papges should have departure in the bottom right corner
    cy.get('.page0 > .tile5 > .headerTitle').contains(departureTitle)
    cy.get('.page1 > .tile5 > .headerTitle').contains(departureTitle)
    // swap something on the left should not affect right
    cy.get('.editorPage0 .btnSwap12').click()
    cy.get('.page0 > :nth-child(1) > .headerTitle').contains(feltsTitle)
    cy.get('.page0 > :nth-child(2) > .headerTitle').contains(boeingTitle)
    cy.get('.page1 > :nth-child(1) > .headerTitle').contains(boeingTitle)
    cy.get('.page1 > :nth-child(2) > .headerTitle').contains(feltsTitle)

    // reload demo
    reloadDemoWithEditor()

    // Add a page in first position
    cy.get('#editorInsert').click()
    // New page should be selection
    cy.get('.page0').contains(selectionTitle)
    // delete new page
    deletePage(0,true)
    // Tiles page should be back at that position
    demoTilesOnPage(0)

    // Insert page in the middle
    cy.get('.editorPage0 > .verticalBar > #editorInsert').click()
    cy.get('.page1').contains(selectionTitle)
    deletePage(1, true)
    cy.get('.page1').contains('Flight')

    // Insert page last
    cy.get('.editorPage1 > .verticalBar > #editorInsert').click()
    // Offset next should be there
    cy.get('#offsetNext').click()
    cy.get('.page2').contains(selectionTitle)
    deletePage(2)

    // Copy left to right and confirm
    cy.get('#editorCopyToLeft').click()
    cy.get('.p-confirm-dialog-accept').click()
    demoChecklistOnPage(0)
    demoChecklistOnPage(1)


    // As user I cannot delete the last two pages of a template
    deletePage(1)
    // toast should say no more pages
    expectToast('Last two pages cannot be deleted')
    // Page 1 should still be there
    cy.get('.page1').contains('Flight')

    // As a user I can add and delete pages from a template
    reloadDemoWithEditor()
    // Insert page in the middle and delete it
    cy.get('.editorPage0 > .verticalBar > #editorInsert').click()
    cy.get('.page1').contains(selectionTitle)
    deletePage(1, true)

    // we should be back to default demo
    cy.get('.page0').contains(feltsTitle)
    cy.get('.page1').contains('Flight')

    // open editor again
    reloadDemoWithEditor()
    // Insert page in first position and save
    cy.get('.editorPage0 > .verticalBar > #editorInsert').click()
    cy.get('.page0').contains(feltsTitle)
    cy.get('.page1').contains(selectionTitle)
    cy.get('.page2').contains('Flight')

    // make sure this is reflected in local storage
    cy.getLocalStorage('template')
      .then(t => {
        const template = JSON.parse(t)
        // console.log('>>>>', template)
        expect(template.data.length).to.equal(3)
        expect(template.data[1].type).to.equal('selection')
      })

  })
  
  it('Swaps', () => {
    visitSkipBanner()
    cy.viewport('macbook-16')

    // reload demo
    reloadDemoWithEditor()

    // swap left and right
    demoTilesOnPage(0)
    demoChecklistOnPage(1)
    cy.get('#editorSwap').click()
    demoChecklistOnPage(0)
    demoTilesOnPage(1)

    // Test tiles swapping
    reloadDemoWithEditor()

    // check we have tile swap buttons on left page
    const expectedButtons = ['.btnSwap12', '.btnSwap13', '.btnSwap24', '.btnSwap34', '.btnSwap35', '.btnSwap46', '.btnSwap56']
    for( const expected of expectedButtons) {
      cy.get(expected).should('exist')
    }
    // right should not be there
    cy.get('.editorPage1 .btnSwap12').should('not.exist')
    // test swaps
    cy.get(':nth-child(1) > .headerTitle').contains(boeingTitle)
    cy.get(':nth-child(2) > .headerTitle').contains(feltsTitle)
    cy.get(':nth-child(3) > .headerTitle').contains(radioTitle)
    cy.get(':nth-child(4) > .headerTitle').contains(notesTitle)
    // Flip 1 and 2
    cy.get('.editorPage0 .btnSwap12').click()
    cy.get(':nth-child(1) > .headerTitle').contains(feltsTitle)
    cy.get(':nth-child(2) > .headerTitle').contains(boeingTitle)
    // Should flip 1 and 3
    cy.get('.editorPage0 .btnSwap13').click()
    cy.get(':nth-child(1) > .headerTitle').contains(radioTitle)
    cy.get(':nth-child(3) > .headerTitle').contains(feltsTitle)
    // Flip 2 and 4
    cy.get('.editorPage0 .btnSwap24').click()
    cy.get(':nth-child(2) > .headerTitle').contains(notesTitle)
    cy.get(':nth-child(4) > .headerTitle').contains(boeingTitle)
    // flip 3 and 4
    cy.get('.editorPage0 .btnSwap34').click()
    cy.get(':nth-child(3) > .headerTitle').contains(boeingTitle)
    cy.get(':nth-child(4) > .headerTitle').contains(feltsTitle)
    // flip 3 and 5
    cy.get('.editorPage0 .btnSwap35').click()
    cy.get(':nth-child(3) > .headerTitle').contains(atisTitle)
    cy.get(':nth-child(5) > .headerTitle').contains(boeingTitle)
    // flip 4 and 6
    cy.get('.editorPage0 .btnSwap46').click()
    cy.get(':nth-child(4) > .headerTitle').contains(departureTitle)
    cy.get(':nth-child(6) > .headerTitle').contains(feltsTitle)
    // flip 5 and 6
    cy.get('.editorPage0 .btnSwap56').click()
    cy.get(':nth-child(5) > .headerTitle').contains(feltsTitle)
    cy.get(':nth-child(6) > .headerTitle').contains(boeingTitle)

    // test page1 swaps
    cy.get('#editorSwap').click()
    // flip 5 and 6
    cy.get('.editorPage1  .btnSwap56').click()
    cy.get(':nth-child(6) > .headerTitle').contains(feltsTitle)
    cy.get(':nth-child(5) > .headerTitle').contains(boeingTitle)
  })

})