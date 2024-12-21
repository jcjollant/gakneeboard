import { visitSkipBanner, newTemplate } from './shared'

function enterCode(page, code) {
    cy.get(`.page${page} .p-inputtext`).type('{selectall}').type(code, {delay:0})
}

function testEditMode(page,edit) {
  if(edit) {
    cy.get(`.page${page}  .section`).contains('Pick New Airport')

  } else {
    cy.get(`.page${page} .section`).should('not.exist')
  }
}

describe('Diagram Page', () => {
  it('Basic flow', () => {
    visitSkipBanner()
    newTemplate()

    // select Diagram pages on both sides
    cy.get('.page0 > .list > [aria-label="Airport Diagram"]').click()
    cy.get('.page1 > .list > [aria-label="Airport Diagram"]').click()
    // Titles
    cy.get('.page0 > .headerTitle').contains('Airport Diagram')
    cy.get('.page1 > .headerTitle').contains('Airport Diagram')
    // by default, we should be in edit mode
    testEditMode(0,true)
    testEditMode(1,true)

    // Test Bogus code => airport should not allow toggle
    enterCode(0, 'KJC')
    cy.wait(250)
    cy.get('.page0 > .headerTitle').click()
    // Should still be in edit mode
    testEditMode(0,true)

    // Test an airport without diagram
    enterCode(0, 'W39')
    cy.get('.page0 [aria-label="Show Diagram"]').should('not.exist')
    cy.get('.page0 .notfound')

    // Test a valid airport with diagram
    enterCode(0, 'KRNT')
    cy.get('.page0 [aria-label="Show Diagram"]')
    cy.get('.page0 .notfound').should('not.exist')

    // cy.intercept({ method: 'GET', url: '**/pdf.worker.min.mjs',}).as('getWorker')

    // make selection
    cy.intercept({ method: 'GET', url: '**/05396AD.PDF',}).as('getPDF');
    cy.get('.page0 [aria-label="Show Diagram"]').click()

    // accept 200 or 304
    cy.wait('@getPDF').its('response.statusCode').should('be.oneOf', [200,304])

  })
})