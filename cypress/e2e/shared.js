export const currentVersionNumber = '821/821'
const devEnv = 'http://localhost:5173/'
const prodEnv = 'https://kneeboard.ga'
export const environment = devEnv
// const devBackend = 'http://localhost:3000/'
// export const backend = devBackend
export const titleAtis = "ATIS @"

export function visitAndCloseBanner() {
    cy.visit(environment)


    // remove banner
    cy.contains('Got it').click()
}

export function maintenanceMode() {
    const code = '12b39a0daff8fc144fc678663395f6ce5706c778a259167ebc307144fcc96146'
    // Open menu
    cy.get('.menuIcon').click()
    cy.get('.buttonsList > :nth-child(10)').click()
    // type code in maintenance window
    cy.get('.p-inputtext').type(code)
    // submit
    cy.get('.p-dialog-content > div > .p-button').click()

    // and close the menu
    cy.get('.menuIcon').click()
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

