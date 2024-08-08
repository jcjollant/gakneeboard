export const currentVersionNumber = 807
const devEnv = 'http://localhost:5173/'
const prodEnv = 'https://kneeboard.ga'
export const environment = devEnv
export const titleAtis = "ATIS @"

export function visitAndCloseBanner() {
    cy.visit(environment)


    // remove banner
    cy.contains('Got it').click()


    // check version number
    cy.get('.versionDialog').contains(currentVersionNumber)
}

export function newPage() {
    // Reset tiles and check all are reset
    cy.get('.menuIcon').click()
    cy.get('[aria-label="New"]').click()
    cy.get('.p-confirm-dialog-accept').click()
    cy.get('.menuIcon').click()

    // both pages should be in selection mode
    cy.get('.pageOne > .header').contains('Page Selection')
    cy.get('.pageTwo > .header').contains('Page Selection')
}

