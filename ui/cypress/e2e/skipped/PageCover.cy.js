import { newTemplate, visitSkipBanner } from '../shared'

function checkBlankState() {
  cy.get('.titleContainer').contains('Title')
  cy.get('.clickable > .pi').should('have.class', 'pi-camera')
  cy.get('.subtitle').contains('Click anywhere to customize')
}

describe('Cover Page', () => {
  it('Basic flow', () => {
    visitSkipBanner()
    newTemplate()
    // set left page to cover
    cy.get('.page0 > .list > [aria-label="Cover"]').click()

    // should see the blank state
    checkBlankState()

    // edit mode
    cy.get('.titleContainer').click()

    // change everything
    const newTitle = 'New Title'
    const newUrl = 'https://lh3.googleusercontent.com/pw/AP1GczPLO8wvSxY_E4wiez6KGvT8qhXwJyDwp6vg1_HZ_3gOYfTEFCrylQ2GyCNJuSAzpa_7mVFPgeNbpGjJnSfOeEQ9Io7G1jzW4DScU0RJ144bE7bRX23JlNbyjpfZKXzmV2UjCoYQdD_Nwz26zCPxxU47AQ=w2150-h968-s-no-gm?authuser=0'
    const newSubtitle = 'New Subtitle'
    cy.get(':nth-child(1) > .p-inputtext').type('{selectall}').type(newTitle, { delay: 0 })
    cy.get(':nth-child(2) > .p-inputtext').type('{selectall}').type(newUrl, { delay: 0 })
    cy.get(':nth-child(3) > .p-inputtext').type('{selectall}').type(newSubtitle, { delay: 0 })

    // Cancel should revert to default state
    cy.get('.actionBar > .p-button-link').click()
    checkBlankState()

    // change everything again
    cy.get('.titleContainer').click()
    cy.get(':nth-child(1) > .p-inputtext').type('{selectall}').type(newTitle, { delay: 0 })
    cy.get(':nth-child(2) > .p-inputtext').type('{selectall}').type(newUrl, { delay: 0 })
    cy.get(':nth-child(3) > .p-inputtext').type('{selectall}').type(newSubtitle, { delay: 0 })

    // Apply
    cy.get('[aria-label="Apply"]').click()

    // Everything should be changed
    cy.get('.titleContainer').contains(newTitle)
    cy.get('img')
    cy.get('.subtitle').contains(newSubtitle)

  })
})