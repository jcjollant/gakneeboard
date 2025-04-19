const devEnv = 'http://localhost:5173/'
// const prodEnv = 'https://kneeboard.ga'
export const environment = devEnv
export const landing = environment + 'rwy01.html'
// const devBackend = 'http://localhost:3000/'
// export const backend = devBackend
export const titleAtis = "ATIS @"
export const placeHolderSubtitle = 'Click header to configure'

export const maintenanceLogin = '12b39a0daff8fc144fc678663395f6ce5706c778a259167ebc307144fcc96146'
export const maintenanceTest ='4d51414ceb16fe67ec67ef5194a76036fc54b59846c9e8da52841717fe4b6247'

export const atisTitle = 'ATIS @'
export const bellinghamTitle = 'Bellingham Intl'
export const boeingTitle = 'Boeing Fld/king County Intl'
export const clearanceTitle = 'Clearance @'
export const departTitle = 'Depart @'
export const demoNameTiles = 'Tiles Demo'
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
export const approachTitle = 'Apch'
export const pageNameCover = 'Cover'
export const pageNameInstrumentApproach = 'Instrument Approach'
export const pageNameNavlog = 'NavLog'
export const pageNameNotes = 'Notes'

export class TileTypeLabel {
    static notes = 'Notes'
    static radios = 'Radios'
    static navlog = 'Navlog'
    static atis = 'Weather'
}

export const expectedDemos = [ 
    {i:0, l:'VFR Flight', t:'A sample Skyhawk Reference',c:['pageTiles','pageTiles']}, 
    {i:1, l:'Checklist',t:'Checklist syntax Showcase',c:['pageChecklist','pageChecklist']}, 
    {i:2, l:'Tiles', t:'Every Tile Available on GA Kneeboard',c:['pageTiles','pageTiles']}, 
    {i:3, l:'NavLog', t:'Navlog page along with six tiles',c:['pageNavlog','pageTiles']}, 
    {i:4, l:'Charts', t:'Airport Diagram and Instrument Approach',c:['approachPage','approachPage']},
    {i:5, l:'Holds Practice', t:'Full sheet of Holds and Compasses',c:['pageTiles','pageTiles']},
    {i:6, l:'IFR Flight', t:'Full sheet of Holds and Compasses',c:['pageStrips','pageStrips']},
]


export function checkCorner(page, tile, classe, label, value) {
    cy.get(`.page${page} > .tile${tile} > .tileContent ${classe} .label`).contains(label)
    cy.get(`.page${page} > .tile${tile} > .tileContent ${classe} .value`).contains(value)
}

export function checkTileSpan(page, tile, spanned=true) {
    const condition = spanned ? 'have.class' : 'not.have.class'
    cy.get(`.page${page} > .tile${tile}`).should(condition,'span-2')
}

export function checkTileTitle(page, tile, title) {
    cy.get(`.page${page} > .tile${tile} > .headerTitle`).contains(title)
}

export function checkTileVisible(page, tile, visible=true) {
    const condition = visible ? 'not.have.css' : 'have.css'
    cy.get(`.page${page} > .tile${tile}`).should(condition, 'display', 'none')
}

export function demoChecklistOnPage(index) {
    cy.get(`.page${index}`).should('have.class','pageChecklist')
    cy.get(`.page${index} .list0 > :nth-child(13)`).contains('Engine FAILURE')
    cy.get(`.page${index} .list0 > :nth-child(19)`).contains('Engine FIRE')
}

export function demoTilesOnPage(page) {
    cy.get(`.page${page}`).should('have.class','pageTiles')

    const expectedTitles = [boeingTitle, feltsTitle, radioTitle, notesTitle, atisTitle, departTitle]
    for(let index = 0; index < 6; index++) {
        checkTileTitle(page, index, expectedTitles[index])
    }
}

export function visitAndCloseBanner() {
    cy.visit(environment)

    // remove banner
    cy.contains('Got it').click()
}

export function visitSkipBanner() {
    localStorage.setItem( "popup", "3")
    cy.visit(environment)
}

export function maintenanceMode() {
    // Open menu
    cy.get('.maintenanceButton').click()
    
    // type code in maintenance window
    cy.wait(500)
    cy.get('.p-dialog-content .p-inputtext:not([disabled])')
    cy.get('.p-dialog-content .p-inputtext').type(maintenanceLogin,{delay:0})

    // submit
    cy.intercept({method: 'GET',url: '**/maintenance/**',}).as('getMaintenance')
    cy.get('.p-dialog-content .p-button').click()
    cy.wait('@getMaintenance').then(interception => {
        expect(interception.response.statusCode == 200 || interception.response.statusCode == 304).to.be.true
    })
    // wait for dialog closure
    cy.get('.p-dialog-content').should('not.exist');
}

export function loadDemo(index=-1) {
    // Turn text into index if necessary
    const demoNames = ['C172','Checklist','Tiles', 'NavLog', 'Charts', 'Holds', 'IFR']
    if(index == -1) {
        // load default demo
        cy.get('.demoSection > .header').click()        
    } else {
        const indexOf = demoNames.indexOf(index)
        if(indexOf > -1) index = indexOf;
        cy.get('.demo' + index).click()
    }

    // wait for the page to be loaded
    cy.get('#btnPrint')
}

export function newTemplate() {
    cy.get('.templateNew').click()

    // both pages should be in selection mode
    cy.get('.page0 > .headerTitle').contains('Page Selection')
    cy.get('.page1 > .headerTitle').contains('Page Selection')
}

export function replacePage(pageNum, newPage=undefined, replaceButton=true) {
    try {
        if(replaceButton) {
            cy.get(`.page${pageNum} .replaceButton`).click({force:true})
            cy.get('.p-confirm-dialog-accept').click()
        }
        cy.get('.contentPage > .headerTitle').contains('Page Selection')
    } catch(e) {
        // doesn't matter if it's not there
    }
    if(newPage) cy.get(`.page${pageNum} [aria-label="${newPage}"]`).click()
}

/**
    Will replace a tile with a new one if label is provided
 */
export function replaceTile(pageNum, tileNum, label=undefined) {
    cy.get(`.page${pageNum} > .tile${tileNum} .replaceButton`).click({force: true})
    if(label) cy.get(`[aria-label="${label}"]`).click()

}

export function displaySelection(pageNum, tileNum, mode=undefined) {
    cy.get(`.page${pageNum} > .tile${tileNum} .displayButton`).click({force: true})
    if( mode) cy.get(`[aria-label="${mode}"]`).click()

}

export function displaySelectionExpand(pageNum, tileNum, modeNumber, accept=true) {
    cy.get(`.page${pageNum} > .tile${tileNum} .displayButton`).click({force: true})
    cy.get(`.page${pageNum} > .tile${tileNum} .expand${modeNumber}`).click({force: true})
    if(accept) cy.get('.p-confirm-dialog-accept').click()
    else cy.get('.p-confirm-dialog-reject').click()

}

export function expectToast(message) {
    cy.get('.p-toast-message-content').contains(message)
    cy.get('.p-toast-icon-close').click()
    cy.get('.p-toast-icon-close').should('not.exist')
}

export function replaceBy(selector, value) {
    cy.get(selector).type('{selectAll}{backspace}', {delay:0})
    cy.get(selector).type(value, {delay:0})
}


export function viewport() {
    cy.viewport(1300,1000)
}

export function waitForAirports() {
    cy.intercept({
      method: 'GET',
      url: '**/airports/**',
    }).as('getAirports');
    cy.wait('@getAirports').then(interception => {
        expect(interception.response.statusCode == 200 || interception.response.statusCode == 304).to.be.true
    })
}

export function waitOneAirport() {
    cy.intercept({
      method: 'GET',
      url: '**/airport/**',
    }).as('getOneAirport');
    cy.wait('@getOneAirport').then(interception => {
        expect(interception.response.statusCode == 200 || interception.response.statusCode == 304).to.be.true
    })
}