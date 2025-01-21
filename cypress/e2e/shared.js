const devEnv = 'http://localhost:5173/'
// const prodEnv = 'https://kneeboard.ga'
export const environment = devEnv
// const devBackend = 'http://localhost:3000/'
// export const backend = devBackend
export const titleAtis = "ATIS @"
export const placeHolderSubtitle = 'Click header to configure'

export const maintenanceLogin = '12b39a0daff8fc144fc678663395f6ce5706c778a259167ebc307144fcc96146'
export const maintenanceTest ='4d51414ceb16fe67ec67ef5194a76036fc54b59846c9e8da52841717fe4b6247'

export const atisTitle = 'ATIS @'
export const boeingTitle = 'Boeing Fld/king County Intl'
export const clearanceTitle = 'Clearance @'
export const feltsTitle = 'Felts Fld'
export const holdTitle = 'Hold @'
export const kenmoreTitle = 'Kenmore Air Harbor'
export const notesTitle = 'Notes'
export const radioTitle = 'Radios'
export const lostCommsTitle = 'Lost Comms'
export const serviceVolumeTitle = 'VOR Service Volumes'
export const rentonTitle = 'Renton Muni'
export const selectionTitle = 'Page Selection'
export const departureTitle = 'Depart @'
export const approachTitle = 'Approach @'

export class TileTypeLabel {
    static notes = 'Notes'
    static radios = 'Radios'
}

export const expectedDemos = [ 
    {i:0, l:'Default', t:'Default Demo',c:['pageTiles','pageChecklist']}, 
    {i:1, l:'C172 Reference', t:'A sample Skyhawk Reference',c:['pageTiles','pageTiles']}, 
    {i:2, l:'Checklist',t:'Checklist syntax Showcase',c:['pageChecklist','pageChecklist']}, 
    {i:3, l:'Tiles', t:'Every Tile Available on GA Kneeboard',c:['pageTiles','pageTiles']}, 
    {i:4, l:'NavLog', t:'Navlog page along with six tiles',c:['pageNavlog','pageTiles']}, 
    {i:5, l:'Charts', t:'Airport Diagram and Instrument Approach',c:['approachPage','approachPage']},
    {i:6, l:'Holds Practice', t:'Full sheet of Holds and Compasses',c:['pageTiles','pageTiles']},
    {i:7, l:'IFR Flight', t:'Full sheet of Holds and Compasses',c:['pageStrips','pageStrips']},
]

export function demoChecklistOnPage(index) {
    cy.get(`.page${index}`).should('have.class','pageChecklist')
    cy.get(`.page${index} .list0 > :nth-child(13)`).contains('Engine FAILURE')
    cy.get(`.page${index} .list0 > :nth-child(19)`).contains('Engine FIRE')
}

export function demoTilesOnPage(index) {
    cy.get(`.page${index}`).should('have.class','pageTiles')

    cy.get(`.page${index} > :nth-child(1) > .headerTitle`).contains(boeingTitle)
    cy.get(`.page${index} > :nth-child(2) > .headerTitle`).contains(feltsTitle)
    cy.get(`.page${index} > :nth-child(3) > .headerTitle`).contains(radioTitle)
    cy.get(`.page${index} > :nth-child(4) > .headerTitle`).contains(notesTitle)
    cy.get(`.page${index} > :nth-child(5) > .headerTitle`).contains(atisTitle)
    cy.get(`.page${index} > :nth-child(6) > .headerTitle`).contains(clearanceTitle)
}

export function visitAndCloseBanner() {
    cy.visit(environment)

    // remove banner
    cy.contains('Got it').click()
}

export function visitSkipBanner() {
    localStorage.setItem( "howDoesItWork", "false")
    cy.visit(environment)
}

export function maintenanceMode() {
    // Open menu
    cy.get('.maintenanceButton').click()
    
    // type code in maintenance window
    cy.get('.p-dialog-content .p-inputtext:not([disabled])').type(maintenanceLogin,{delay:0})

    // submit
    cy.intercept({method: 'GET',url: '**/maintenance/**',}).as('getMaintenance')
    cy.get('.p-dialog-content .p-button').click()
    cy.wait('@getMaintenance').its('response.statusCode').should('equal', 200)
    // wait for dialog closure
    cy.get('.p-dialog-content').should('not.exist');
}

export function loadDemo(index=0) {
    // Turn text into index if necessary
    const expectedDemos = ['Default','C172','Checklist','Tiles', 'NavLog', 'Charts', 'Holds', 'IFR']
    const indexOf = expectedDemos.indexOf(index)
    if(indexOf > -1) index = indexOf;

    cy.get('.demo' + index).click()
    // wait for the page to be loaded
    cy.get('#btnPrint')
}

export function newTemplate() {
    cy.get('.templateNew').click()

    // both pages should be in selection mode
    cy.get('.page0 > .headerTitle').contains('Page Selection')
    cy.get('.page1 > .headerTitle').contains('Page Selection')
}

export function replaceTile(pageNum, tileNum, label) {
    cy.get(`.page${pageNum} > .tile${tileNum} > .headerTitle > .p-button`).click({force: true})
    cy.get(`[aria-label="${label}"]`).click()

}