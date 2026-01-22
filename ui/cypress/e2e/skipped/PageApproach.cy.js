import { visitAndCloseBanner, newTemplate, visitSkipBanner } from '../shared'

function checkBlankState() {
  cy.get('.titleContainer').contains('Title')
  cy.get('.clickable > .pi').should('have.class', 'pi-camera')
  cy.get('.subtitle').contains('Click anywhere to customize')
}

describe('Approach Page', () => {
  it('Basic flow', () => {
    visitSkipBanner()

    newTemplate()

    // select approch pages on both sides
    cy.get('.page0  [aria-label="Instrument Approach"]').click()
    cy.get('.page1  [aria-label="Instrument Approach"]').click()


    // by default, we should be in edit mode
    cy.get('.page0 > .headerTitle').contains('Instrument Approach')
    cy.get('.page0  .editMode > .airportCode')
    cy.get('.page1 > .headerTitle').contains('Instrument Approach')
    cy.get('.page1  .editMode > .airportCode')

    // we should not be able to exit edit mode until we have a valid airport
    cy.get('.page0 > .headerTitle').click()
    cy.get('.page0  .editMode > .airportCode')


    // Bogus airport should not allow toggle
    cy.get('.page0 .editMode > .airportCode > .p-inputgroup > .p-inputtext').type('{selectall}').type('KJC')
    cy.get('.page0 > .headerTitle').click()
    cy.get('.page0 .editMode > .airportCode')

    // Valid airport should show all approaches
    cy.get('.page0 .editMode > .airportCode > .p-inputgroup > .p-inputtext').type('{selectall}').type('KRNT')
    cy.intercept({
      method: 'GET',
      url: '**/05396RY16.PDF',
    }).as('getPDF');

    cy.get('[aria-label="RNAV (GPS) Y RWY 16"]').click()

    cy.wait('@getPDF').its('response.statusCode').should('equal', 200)

  })
})