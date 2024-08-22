import { currentVersionNumber, visitAndCloseBanner, maintenanceMode } from './shared'

describe('Navigation', () => {
  // ========================================================================
  // Print Dialog
  // ========================================================================
  it('Print Dialog', () =>{
    visitAndCloseBanner()

    // check version number
    cy.get('.versionDialog').contains(currentVersionNumber)

    // Test print dialog show up
    cy.get('.menuIcon').click()
    cy.get('[aria-label="Print"]').click()
    // check title
    cy.get('.p-dialog-header').contains('Print')
    // Check Page options
    cy.get('[aria-label="Front Page"]')
    cy.get('[aria-label="Both"]')
    cy.get('[aria-label="Flipped"]')
    cy.get('[aria-label="Back Page"]')
    // click do not print
    cy.get('.actionDialog > .p-button-link').click()

    
  })

  it('Editor', () => {
    visitAndCloseBanner()

    cy.wait(1000)

    // enable editor
    cy.get('.menuIcon').click()
    cy.get('[aria-label="Editor"]').click()

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
    cy.get('.pageOne > :nth-child(6) > .header').contains('Clearance @')
    cy.get('.pageTwo > :nth-child(2) > .twoLists > .leftList > :nth-child(19)').contains('FIRE')
    cy.get('.middle > .p-button').click()
    cy.get('.pageOne > :nth-child(2) > .twoLists > .leftList > :nth-child(19)').contains('FIRE')
    cy.get('.pageTwo > :nth-child(6) > .header').contains('Clearance @')

    // reload demo
    cy.get('[aria-label="Demo"]').click()
    cy.get('.p-confirm-dialog-accept').click()

    // Copy Front to Back
    cy.get(':nth-child(1) > [aria-label="Copy"]').click()
    cy.get(':nth-child(3) > [aria-label="Paste"]').click()

    cy.get('.pageOne > :nth-child(6) > .header').contains('Clearance @')
    cy.get('.pageTwo > :nth-child(6) > .header').contains('Clearance @')

    // reload demo
    cy.get('[aria-label="Demo"]').click()
    cy.get('.p-confirm-dialog-accept').click()

    // Copy Back to Front
    cy.get(':nth-child(3) > [aria-label="Copy"]').click()
    cy.get(':nth-child(1) > [aria-label="Paste"]').click()
    cy.get('.pageOne > :nth-child(2) > .twoLists > .leftList > :nth-child(19)').contains('FIRE')
    cy.get('.pageTwo > :nth-child(2) > .twoLists > .leftList > :nth-child(19)').contains('FIRE')

  })

  it('Sign in and Load Page', () => {
    visitAndCloseBanner()
    maintenanceMode()

    // open menu
    cy.get('.menuIcon').click()
    // user name should show up
    cy.get('.active').contains('Jc')

    // load page should open
    cy.get('[aria-label="Load"]').click()
    cy.get('#pv_id_15_content > .p-fieldset-content > div').contains('Select a sheet above')
    // Check demo pages work
    cy.get('[aria-label="Default"]').click()
    cy.get('.sheetDescription > :nth-child(2)').contains('Default Demo')
    cy.get('[aria-label="All Tiles"]').click()
    cy.get('.sheetDescription > :nth-child(2)').contains('Tiles Demo')
    cy.get('[aria-label="Checklist"]').click()
    cy.get('.sheetDescription > :nth-child(2)').contains('Checklist Demo')

    // Do Not Load
    cy.get('.p-button-link').click()

    // Check Sign out
    cy.get('.active').click()
    cy.get('.p-confirm-dialog-message').contains("You will loose access")
    cy.get('.p-confirm-dialog-accept').click()

    // should be back to sign in
    cy.get('.menuIcon').click()
    cy.get('[aria-label="Sign In"]')

  })


})