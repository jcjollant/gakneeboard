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
    cy.get('[aria-label="Load"]').click()
    cy.get('.contentPlaceholder').contains('Select a template above')

    // Should have at least the 'Anchor' page
    cy.get('[aria-label="Anchor"]').should('exist')

    // Check demo pages description work
    const demoPages = [ 
      {l:'Default', d:'Default Demo'}, 
      {l:'Tiles',d:'Tiles Demo'}, 
      {l:'Checklist',d:'Checklist Demo'}, 
      {l:'Navlog',d:'Navlog Demo'}, 
      ]
    for(const p of demoPages) {
      cy.get('[aria-label="' + p.l + '"]').click()
      cy.get(':nth-child(3) > .p-fieldset-legend').contains(p.d)
    }

    // Do Not Load
    cy.get('.p-button-link').click()

    // Save the page into something disposable
    cy.get('[aria-label="Save"]').click()
    cy.get('.p-dialog-header').contains('Save New Template')
    cy.get('.p-inputtext').type('{selectAll}').type('Temp')

    cy.intercept({
      method: 'POST',
      url: '**/template',
    }).as('postTemplate');
    cy.get('.actionDialog > [aria-label="Save"]').click()
    cy.wait('@postTemplate').its('response.statusCode').should('equal', 200)

    // second time we save we should have the short save
    cy.get('[aria-label="Save"]').click()
    cy.get('.p-dialog-header').contains('Save "Temp"')
    // navigate save options
    cy.get('[aria-label="Replace..."]').click()
    cy.get('.p-dialog-header').contains('Overwrite Existing Template')
    cy.get('.p-fieldset-legend').contains('Your 2 Templates')
    // select temp
    cy.get('[aria-label="Temp"]').click()
    cy.get('#pv_id_2_header').contains('Overwrite Template')
    // do not confirm
    cy.get('.p-confirm-dialog-reject').click()
    cy.get('.actionDialog > .p-button').click()

    // Now delete it
    cy.get('[aria-label="Load"]').click()
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