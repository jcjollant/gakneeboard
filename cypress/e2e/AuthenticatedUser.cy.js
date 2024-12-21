import { visitAndCloseBanner, maintenanceMode, visitSkipBanner, environment, kenmoreTitle, selectionTitle } from './shared'

describe('Authenticated User', () => {
  it('Sign in and Load Page', async () => {
    visitSkipBanner()
    // Authenticate
    maintenanceMode()

    // As signed in User I can see my name
    cy.get('.session').contains('Jc')
    // Reload to get templates
    cy.visit(environment)

    // As an authenticated I can see my templates
    let totalTemplates = 3
    cy.get('.templateSection > .templateList').children().should('have.length', totalTemplates)
    // Should have at least the 'Anchor' page
    cy.get('.templateSection > .templateList > :nth-child(3)').contains('Anchor')
    cy.get('.templateSection > .templateList > :nth-child(3)').click()
    cy.get('.tile0 > .headerTitle').contains(kenmoreTitle)
    cy.get('.logo').click()

    // As a signed in user, I should be able to make a copy of any template

    // As a signed in user I can create and save a template
    cy.get('.templateNew').click()
    cy.get('.page0 > .headerTitle').contains(selectionTitle)
    // Customize with Notes page on the left
    cy.get('.page0 > .list > [aria-label="Notes"]').click()
    cy.intercept({
      method: 'POST',
      url: '**/template',
    }).as('postTemplate');
    cy.get('#btnSave').click()
    cy.url().then((url) => {
      const id = url.split('/').pop()
      // Id should be reflected in the URL
      expect(id).to.be.greaterThan(0)
    })    
    cy.wait('@postTemplate').its('response.statusCode').should('equal', 200)

    // that new template should be in the home page
    totalTemplates++;
    cy.get('.logo').click()
    cy.get('.templateSection > .templateList').children().should('have.length', totalTemplates)

    cy.get('#btnDelete').click()
    cy.get('.p-confirm-dialog-message').contains('Do you want to delete "New Template"')
    cy.intercept({
      method: 'DELETE',
      url: '**/template/**',
    }).as('deleteTemplate');
    // Confirm delete
    cy.get('.p-confirm-dialog-accept').click()

    // that deleted template should NOT be in the home page
    totalTemplates--;
    cy.get('.logo').click()
    cy.get('.templateSection > .templateList').children().should('have.length', totalTemplates)


    // As an authenticated User, I can sign out
    // Check Sign out
    cy.get('.active').click()
    cy.get('.p-confirm-dialog-message').contains("You will loose access")
    cy.get('.p-confirm-dialog-accept').click()

    // should be back to sign in
    cy.get('.menuIcon').click()
    cy.get('[aria-label="Sign In"]')

  })
})