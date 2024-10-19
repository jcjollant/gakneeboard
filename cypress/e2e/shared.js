export const currentVersionNumber = '1019/1015'
const devEnv = 'http://localhost:5173/'
const prodEnv = 'https://kneeboard.ga'
export const environment = devEnv
// const devBackend = 'http://localhost:3000/'
// export const backend = devBackend
export const titleAtis = "ATIS @"
export const placeHolderSubtitle = 'Click header to configure'

export const maintenanceLogin = '12b39a0daff8fc144fc678663395f6ce5706c778a259167ebc307144fcc96146'
export const maintenanceTest ='4d51414ceb16fe67ec67ef5194a76036fc54b59846c9e8da52841717fe4b6247'

export const feltsTitle = 'Felts Fld'
export const boeingTitle = 'Boeing Fld/king County Intl'
export const radioFlowTitle = 'Radio Flow'
export const notesTitle = 'Notes'
export const atisTitle = 'ATIS @'
export const clearanceTitle = 'Clearance @'

export function visitAndCloseBanner() {
    cy.visit(environment)


    // remove banner
    cy.contains('Got it').click()
}

export function maintenanceMode() {
    // Open menu
    cy.get('.menuIcon').click()
    cy.get('.buttonsList > :nth-child(9)').click()
    // type code in maintenance window
    cy.get('.p-inputtext').type(maintenanceLogin)
    // submit
    cy.get('.p-dialog-content > div > .p-button').click()

    // and close the menu
    cy.get('.menuIcon').click()
}

export function loadDemo(name, openMenu=true) {
    const classes = {'tiles':'.tilesDemo','navlog':'.navlogDemo', 'checklist':'.checklistDemo', 'default':'.defaultDemo'}
    if(openMenu) cy.get('.menuIcon').click()
    cy.get('#menuDemos').click()
    cy.get(classes[name]).click()
    cy.get('.p-confirm-dialog-accept').click()
}

export function newPage() {
    // Reset tiles and check all are reset
    cy.get('.menuIcon').click()
    cy.get('#menuNew').click()
    cy.get('.p-confirm-dialog-accept').click()
    cy.get('.menuIcon').click()

    // both pages should be in selection mode
    cy.get('.page0 > .headerTitle').contains('Page Selection')
    cy.get('.page1 > .headerTitle').contains('Page Selection')
}

