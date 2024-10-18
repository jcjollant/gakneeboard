import { visitAndCloseBanner, maintenanceMode } from './shared'

describe('Authenticated User', () => {
  it('Sign in and Load Page', () => {
    visitAndCloseBanner()
    maintenanceMode()

    // open menu
    cy.get('.menuIcon').click()
    // user name should show up
    cy.get('.active').contains('Jc')

    // load page should open
    cy.get('#menuLoad').click()
    cy.get('.contentPlaceholder').contains('Select a template')

    // Should have at least the 'Anchor' page
    cy.get('[aria-label="Anchor"]').click()
    cy.get('.templateDescription > :nth-child(2)').contains('(none)')

    // Do Not Load
    cy.get('.actionDialog > .p-button-link').click()

    // Save the page into something disposable
    const tempName = 'Temp'
    const tempDescription = 'Temporary Description'
    cy.get('#menuSave').click()
    cy.get('.p-dialog-header').contains('Save New Template')
    cy.get('.pageName > .p-inputtext').type('{selectAll}').type(tempName)
    cy.get('.pageDescription > .p-inputtext').type('{selectAll}').type(tempDescription)

    cy.intercept({
      method: 'POST',
      url: '**/template',
    }).as('postTemplate');
    cy.get('.actionDialog > [aria-label="Save"]').click()
    cy.wait('@postTemplate').its('response.statusCode').should('equal', 200)

    // second time we save we should have the short save
    cy.get('#menuSave').click()
    cy.get('.p-dialog-header').contains('Save "' + tempName + '"')
    cy.get('.pageName > .p-inputtext').should( 'have.value', tempName)
    cy.get('.pageDescription > .p-inputtext').should( 'have.value', tempDescription)

    // navigate save options
    cy.get('[aria-label="Replace..."]').click()
    cy.get('.p-dialog-header').contains('Overwrite Existing Template')
    cy.get('.p-fieldset-legend').contains('Your 2 Templates')
    // select temp
    cy.get('[aria-label="Temp"]').click()
    cy.get('.p-confirm-dialog > .p-dialog-header').contains('Overwrite Template')
    // do not confirm
    cy.get('.p-confirm-dialog-reject').click()
    cy.get('.actionDialog > .p-button').click()

    // Now delete it
    cy.get('#menuLoad').click()
    // Delete mode
    cy.get('.templateList > .p-button-icon-only').click()
    cy.intercept({
      method: 'DELETE',
      url: '**/template/**',
    }).as('deleteTemplate');

    cy.get('[aria-label="Temp"]').click()
    // confirmation
    cy.get('.p-confirm-dialog-accept').click()

    // Delete Temp
    cy.wait('@deleteTemplate').its('response.statusCode').should('equal', 200)

    // Close dialog
    cy.get('.actionDialog > .p-button-link').click()

    // Check Sign out
    cy.get('.active').click()
    cy.get('.p-confirm-dialog-message').contains("You will loose access")
    cy.get('.p-confirm-dialog-accept').click()

    // should be back to sign in
    cy.get('.menuIcon').click()
    cy.get('[aria-label="Sign In"]')

  })

  it('Shows Publications', () => {
    cy.viewport('macbook-16')
    visitAndCloseBanner()
    maintenanceMode()

    // open menu
    cy.get('.menuIcon').click()
    // Load Template
    cy.get('#menuLoad').click()
    cy.get('.choiceInactive').contains('Community').click()
    cy.get('[aria-label="Page 2"]')
    cy.get('.p-datatable-tbody').children().should('have.length', 5)
  })
})