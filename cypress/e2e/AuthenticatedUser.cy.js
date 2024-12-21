import { maintenanceMode, visitSkipBanner, environment, kenmoreTitle, selectionTitle } from './shared'

describe('Authenticated User', () => {
  it('Sign in and Load Page', async () => {
    visitSkipBanner()
    // Authenticate
    maintenanceMode()

    cy.intercept({method: 'GET',url: '**/airports/**',}).as('getAirports');
    cy.intercept({method: 'GET',url: '**/template/**',}).as('getTemplate');
    cy.intercept({method: 'POST',url: '**/template',}).as('postTemplate');
    cy.intercept({method: 'DELETE',url: '**/template/**',}).as('deleteTemplate');

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
      expect(id).to.equal('new')
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

    // Open new template
    cy.get('[title="Two selection pages"]').click()
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
    cy.visit(environment)
    cy.wait(200)
    cy.get('.templateSection > .templateList').children().should('have.length', totalTemplates)


    // As an authenticated User, I can sign out
    // Check Sign out
    cy.get('.session .fabutton').click()
    cy.get('.p-confirm-dialog-message').contains("You will loose access")
    cy.get('.p-confirm-dialog-accept').click()

    // should be back to sign in
    cy.get('.session').contains('Sign In')
  
  })
})