import { maintenanceMode, visitSkipBanner, environment, kenmoreTitle, selectionTitle, expectToast } from '../shared'

describe.skip('Authenticated User', () => {
  it('Sign in and Load Page', async () => {
    cy.intercept({ method: 'GET', url: '**/' }).as('getBackend')
    visitSkipBanner()

    // Authenticate
    cy.wait('@getBackend').its('response.statusCode').should('equal', 200)
    cy.get('.p-dialog-content').should('not.exist');
    maintenanceMode()
    // wait for toast to disapear
    cy.get('.p-toast-message-content').should('not.exist');

    cy.intercept({ method: 'GET', url: '**/airports/**', }).as('getAirports');
    cy.intercept({ method: 'GET', url: '**/template/**', }).as('getTemplate');
    cy.intercept({ method: 'POST', url: '**/template', }).as('postTemplate');
    cy.intercept({ method: 'DELETE', url: '**/template/**', }).as('deleteTemplate');

    // As signed in User I can see my name
    cy.get('.session').contains('Jc')

    // As an authenticated I can see my templates
    let totalTemplates = 3
    // cy.get('.templateSection > .templateList').children().should('have.length', totalTemplates)
    // Should have at least the 'Anchor' page
    cy.get('.templateSection > .templateList > :nth-child(3)').contains('Anchor')
    cy.get('.templateSection > .templateList > :nth-child(3)').click()
    cy.wait('@getTemplate').its('response.statusCode').should('equal', 200)
    cy.wait('@getAirports').its('response.statusCode').should('equal', 200)
    cy.get('.p-dialog-content').should('not.exist');
    cy.get('.tile0 > .headerTitle').contains(kenmoreTitle)

    // go back to home page
    cy.get('.logo').click()

    // As a signed in user, I should be able to make a copy of any template
    // Feature missing

    // As a signed in user I can create and save a template
    cy.get('.templateNew').click()
    cy.url().then((url) => {
      const id = url.split('/').pop()
      // Id should be reflected in the URL
      expect(id).to.equal('local')
      // expect(id).to.be.greaterThan(0)
    })
    cy.get('.page0 > .headerTitle').contains(selectionTitle)
    // Customize with Notes page on the left
    cy.get('.page0 > .list > [aria-label="Notes"]').click()
    cy.get('#btnSave').click()
    cy.wait('@postTemplate').its('response.statusCode').should('equal', 200)
    cy.url().then((url) => {
      const id = Number(url.split('/').pop())
      // Id should be reflected in the URL
      expect(id).to.be.greaterThan(0)
    })

    // that new template should be in the home page
    totalTemplates++;
    // cy.get('.logo').click()
    cy.visit(environment)
    cy.get('.templateSection > .templateList').children().should('have.length', totalTemplates)

    // Open newly created template
    cy.get('.templateSection > .templateList > :nth-child(4)').click()
    cy.wait('@getTemplate')

    // delete template
    cy.get('#btnDelete').click()
    cy.get('.p-confirm-dialog-message').contains('Do you want to delete "New Template"')
    // Confirm delete
    cy.get('.p-confirm-dialog-accept').click()
    cy.wait('@deleteTemplate').its('response.statusCode').should('equal', 200)
    cy.get('.p-confirm-dialog-accept').should('not.exist')

    // that deleted template should NOT be in the home page
    totalTemplates--;
    // cy.get('.logo').click()
    visitSkipBanner()
    cy.get('.templateSection > .templateList').children().should('have.length', totalTemplates)


    // As an authenticated User, I view my account details
    // Click Name
    cy.get('.session .fabutton').click()
    // Should open Account details
    cy.get('.p-dialog-header').contains('Account Details')
    cy.get('.templatesCount').contains('1 / 5')
    cy.get('.pagesCount').contains('2')
    cy.get('.accountType').contains('Flight Simmer')
    // Stay signed in
    cy.get('[aria-label="Stay In Pattern"]').click()

    // As an authenticated User, I can sign out
    // reopen dialog
    cy.get('.session .fabutton').click()
    // Click Sign out
    cy.get('.btnSignOut').click()
    cy.get('.p-confirm-dialog-message').contains("You will loose access")
    cy.get('.p-confirm-dialog-accept').click()

    // should be back to sign in
    cy.get('.session').contains('Sign In')

  })
})