// import { version as currentVersionNumber } from '../../src/assets/data'
const currentVersionNumber = 804
const devEnv = 'http://localhost:5173/'
const prodEnv = 'https://kneeboard.ga'
const environment = devEnv

function visitAndCloseBanner() {
    cy.visit(environment)

    // wait for airports query
    cy.intercept({
      method: 'GET',
      url: 'https://ga-api-seven.vercel.app/airports/**',
    }).as('getAirports');

    cy.wait('@getAirports').its('response.statusCode').should('equal', 200)

    // remove banner
    cy.contains('Got it').click()


    // check version number
    cy.get('.versionDialog').contains(currentVersionNumber)
}

function newPage() {
    // Reset tiles and check all are reset
    cy.get('.menuIcon').click()
    cy.get('[aria-label="New"]').click()
    cy.get('.p-confirm-dialog-accept').click()
    cy.get('.menuIcon').click()

    // both pages should be in selection mode
    cy.get('.pageOne > .header').contains('Page Selection')
    cy.get('.pageTwo > .header').contains('Page Selection')
}

describe('template spec', () => {
  it.skip('Navigation works correcly', () => {
    visitAndCloseBanner()
    newPage()
    // sets one page in Tiles, other in Checlisk
    cy.get('.pageOne > .list > [aria-label="Tiles"]').click()
    cy.get('.pageTwo > .list > [aria-label="Checklist"]').click()

    // check all tiles are in reset mode on page 1
    for( const tile of [1, 2, 3, 4, 5, 6]) {
      cy.get(`:nth-child(1) > :nth-child(${tile}) > .header > div`).contains('Tile Selection')
    }

    // Check page 2 is in checlist mode
    cy.get('.pageTwo > .header').contains("Checklist")

    // load tiles demo page
    cy.get('.menuIcon').click()
    cy.get('[aria-label="Demo"]').click()
    cy.get('.p-confirm-dialog-accept > .p-button-label').click()
    cy.get('.menuIcon').click()

    // test All expected tiles are loading
    const expectedTiles = [
      ['Renton Muni', 'Boeing Fld/king County Intl', 'Roche Harbor', 'Lone Pine/death Valley', 'ATIS @', 'Clearance @'],
      ['Raleigh Exec Jetport At', 'Arlington Muni', 'Sun Light', 'Fuel Bug', 'Notes', 'Radio Flow']]
    for( let page = 1; page < 3; page++) {
      for( let tile = 1; tile < 7; tile++) {
        const value = expectedTiles[page-1][tile-1]
        cy.get(`:nth-child(${page}) > :nth-child(${tile}) > .header > div`).contains(value)
      }
    }

    // ========================================================================
    // Arport tile
    // ========================================================================
    // Renton and Boeing fields
    const expectedValues = []
    expectedValues.push({'tile':'Renton Muni','label0':'ATIS','value0':'126.950','label1':'TWR','value1':'124.700','label2':'Elev','value2':'32','label3':'TPA','value3':'1032','watermark':'KRNT','dimensions':'5382x200'})
    expectedValues.push({'tile':'Boeing Fld/king County Intl','label0':'ATIS','value0':'127.750','label1':'RWY 14L-32R','value1':'118.300','label2':'Elev','value2':'22','label3':'TPA','value3':'1022','watermark':'KBFI','dimensions':'3709x100'})
    for(let index = 0; index < 2; index++) {
      const value = expectedValues[index]
      const child = index + 1
      cy.get(`:nth-child(1) > :nth-child(${child}) > .header > div`).contains(value.tile)
      cy.get(`:nth-child(1) > :nth-child(${child}) > .content > .top.left > .clickable > :nth-child(1) > :nth-child(1)`).contains(value.value0)
      cy.get(`:nth-child(1) > :nth-child(${child}) > .content > .top.left > .clickable > :nth-child(1) > .label`).contains(value.label0)
      cy.get(`:nth-child(1) > :nth-child(${child}) > .content > .top.right > .clickable > :nth-child(1) > :nth-child(1)`).contains(value.value1)
      cy.get(`:nth-child(1) > :nth-child(${child}) > .content > .top.right > .clickable > :nth-child(1) > .label`).contains(value.label1)
      cy.get(`:nth-child(1) > :nth-child(${child}) > .content > .bottom.left > .clickable > :nth-child(1) > :nth-child(2)`).contains(value.value2)
      cy.get(`:nth-child(1) > :nth-child(${child}) > .content > .bottom.left > .clickable > :nth-child(1) > .label`).contains(value.label2)
      cy.get(`:nth-child(1) > :nth-child(${child}) > .content > .bottom.right > .clickable > :nth-child(1) > :nth-child(2)`).contains(value.value3)
      cy.get(`:nth-child(1) > :nth-child(${child}) > .content > .bottom.right > .clickable > :nth-child(1) > .label`).contains(value.label3)
      cy.get(`:nth-child(1) > :nth-child(${child}) > .content > .container > .label`).contains(value.dimensions)
      cy.get(`:nth-child(1) > :nth-child(${child}) > .content > .airportCode`).contains(value.watermark)
    }
    // Switch runway and check frequency is being updated accordingly
    cy.get(':nth-child(1) > :nth-child(2) > .header > div').click()
    cy.get('[aria-label="14R-32L"]').click()
    cy.get('[aria-label="Apply"]').click()
    cy.get(':nth-child(2) > .content > .top.right > .clickable > :nth-child(1) > :nth-child(1)').contains('120.600')
    cy.get(':nth-child(2) > .content > .top.right > .clickable > :nth-child(1) > .label').contains('RWY 14R-32L')
    // Check Corners have all exected data
    // Open the bottom right corner to get the corner selection window
    cy.get(':nth-child(1) > :nth-child(1) > .content > .bottom.right').click()
    // standard fields
    const expectedStandardFields = ['Field Elevation', 'Traffic Pattern Altitude', 'Runway Information', 'Nothing']
    for(let index = 0; index < expectedStandardFields.length; index++) {
      cy.get(`.standardList > :nth-child(${index+1})`).contains(expectedStandardFields[index])
    }
    // Radios
    const expectedRadios = ['CTAF : 124.700', 'UNICOM : 122.950', 'ATIS : 126.950', 'GND : 121.600', 'TWR : 124.700']
    for(let index = 0; index < expectedRadios.length; index++) {
      cy.get(`.freqList > :nth-child(${index+1})`).contains(expectedRadios[index])
    }
    const expectedNavaids = ['SEA (VORTAC)', 'PAE (VOR/DME)', 'OLM (VORTAC)', 'CVV (VOR/DME)']
    for(let index = 0; index < expectedNavaids.length; index++) {
      cy.get(`.navList > :nth-child(${index+1})`).contains(expectedNavaids[index])
    }
    // Enter a new airport code and check it's data is loading
    cy.get('.pageOne > :nth-child(3) > .header > div').click()
    cy.get('.pageOne > :nth-child(3) > .content > .settings > .airportCode > .p-inputgroup > .p-inputtext').clear().type('KBLI')
    // wait for the reply
    cy.intercept({
      method: 'GET',
      url: 'https://ga-api-seven.vercel.app/airport/**',
    }).as('getOneAirport');
    cy.wait('@getOneAirport').its('response.statusCode').should('equal', 200)
    // Name should be shown in AirportInput
    cy.get('.pageOne > :nth-child(3) > .content > .settings > .airportCode > .airportName').contains('Bellingham Intl')
    cy.get('.pageOne > :nth-child(3) > .content > .actionBar > [aria-label="Apply"]').click()
    // Check for bellingham fields
    const kbliValues = {'tile':'Bellingham Intl','label0':'ATIS','value0':'134.450','label1':'TWR','value1':'124.900','label2':'Elev','value2':'171','label3':'TPA','value3':'1171','watermark':'KBLI','dimensions':'6700x150'}
    cy.get('.pageOne > :nth-child(3) > .header > div').contains(kbliValues.tile)
    cy.get(':nth-child(3) > .content > .top.left > .clickable > :nth-child(1) > .label').contains(kbliValues.label0)
    cy.get(':nth-child(3) > .content > .top.left > .clickable > :nth-child(1) > :nth-child(1)').contains(kbliValues.value0)
    cy.get(':nth-child(3) > .content > .top.right > .clickable > :nth-child(1) > .label').contains(kbliValues.label1)
    cy.get(':nth-child(3) > .content > .top.right > .clickable > :nth-child(1) > :nth-child(1)').contains(kbliValues.value1)
    cy.get(':nth-child(3) > .content > .bottom.left > .clickable > :nth-child(1) > .label').contains(kbliValues.label2)
    cy.get(':nth-child(3) > .content > .bottom.left > .clickable > :nth-child(1) > :nth-child(2)').contains(kbliValues.value2)
    cy.get(':nth-child(3) > .content > .bottom.right > .clickable > :nth-child(1) > .label').contains(kbliValues.label3)
    cy.get(':nth-child(3) > .content > .bottom.right > .clickable > :nth-child(1) > :nth-child(2)').contains(kbliValues.value3)
    cy.get(':nth-child(3) > .content > .container > .label').contains(kbliValues.dimensions)

    // ========================================================================
    // ATIS
    // ========================================================================
    // Check ATIS has all fields in full mode
    cy.get('.info').contains('Info')
    cy.get('.wind').contains('Wind')
    cy.get('.runway').contains('Rwy')
    cy.get('.visibility').contains('Vis')
    cy.get('.sky').contains('Sky')
    cy.get('.temperature').contains('Temp')
    cy.get('.altimeter').contains('Alt')
    // Check ATIS has all fields in compact mode
    cy.get('.pageOne > :nth-child(5) > .header').click()
    cy.get('[aria-label="Full Size"]').contains('Full Size')
    cy.get('[aria-label="Compact (x4)"]').contains('Compact (x4)')
    cy.get('[aria-label="Compact (x4)"]').click()
    for(let index=1; index <=4; index++) {
      cy.get(`:nth-child(${index}) > .info`).contains('Info')
      cy.get(`:nth-child(${index}) > .wind`).contains('Wind')
      cy.get(`:nth-child(${index}) > .altimeter`).contains('Alt')
      cy.get(`:nth-child(${index}) > .runway`).contains('Rwy')
  
    }

    // ========================================================================
    // Sunlight
    // ========================================================================
    cy.get('.pageTwo > :nth-child(3) > .header > div').contains('Sun Light')
    // date should be today
    const today = new Date().toLocaleString('en-US', {weekday: 'short', month: 'short', day: 'numeric'})
    cy.get('.date').contains( today)
    // Check corners in day mode
    cy.get('.topLeftCorner').contains('KRNT')
    cy.get('.topRightCorner').contains('KSFF')
    cy.get('.bottomLeftCorner').contains('Solar Noon')
    cy.get('.bottomRightCorner').contains('Golden Hour')
    // switch to overnight mode
    cy.get('.pageTwo > :nth-child(3) > .header > div').click()
    cy.get('.nightFlight').click()
    cy.get('[aria-label="Apply"]').click()
    cy.intercept({
      method: 'GET',
      url: 'https://ga-api-seven.vercel.app/sunlight/**',
    }).as('getSunlight');    
    cy.wait('@getSunlight').its('response.statusCode').should('equal', 200)
    // Check corners in night mode
    cy.get('.topLeftCorner').contains('KRNT')
    cy.get('.topRightCorner').contains('KSFF')
    cy.get('.bottomLeftCorner').contains('From')
    cy.get('.bottomRightCorner').contains('To')
    cy.get('.date').contains( 'Night Flight')
    // Test Tile can be replaced by Notes
    cy.get('.pageTwo > :nth-child(3) > .header > div').click()
    cy.get('.header > .p-button').click()
    cy.get('[aria-label="Notes"]').click()
    cy.get(':nth-child(2) > :nth-child(3) > .header > div').contains('Notes')
    // If we come back to sunlight, it should be in edit mode
    cy.get(':nth-child(2) > :nth-child(3) > .header > div').click()
    cy.get('.header > .p-button').click()
    cy.get('[aria-label="Sunlight"]').click()
    // Check edit mode fields
    cy.get('.settings > :nth-child(1) > .p-inputgroup > .p-inputgroup-addon').contains('From')
    cy.get(':nth-child(2) > .p-inputgroup > .p-inputgroup-addon').contains('To')
    cy.get('.pageTwo > :nth-child(3) > .content > .settings > :nth-child(3)').contains('Date')
    cy.get('.actionBar > .p-button-link').click()

    // ========================================================================
    // Radio Flow
    // ========================================================================
    // Check all fields are present in Radio flow
    cy.fixture('radioFlow').then((radioFlow) => {
      for(let index=0; index<radioFlow.length; index++) {
        cy.get(`.freqList > :nth-child(${index+1})`).contains(radioFlow[index].freq)
        cy.get(`.freqList > :nth-child(${index+1})`).contains(radioFlow[index].name)
      }
    })
//    cy.get('.freqList > :nth-child(1)')

    // Sign in to get to
    // cy.get('.menuIcon').click()
    // cy.get('[aria-label="Sign In"]').click()
    // cy.get('#gsi_755440_831716').click()
  })

  // ========================================================================
  // Print Dialog
  // ========================================================================
  it.skip('Print Dialog', () =>{
    visitAndCloseBanner()

    // Test print dialog show up
    cy.get('.menuIcon').click()
    cy.get('[aria-label="Print"]').click()
    // check title
    cy.get('#pv_id_4_header').contains('Print')
    // Check Page options
    cy.get('[aria-label="Front Page"]')
    cy.get('[aria-label="Both Pages"]')
    cy.get('[aria-label="Back Page"]')
    // check options
    cy.get('[title="So you can read back page while front page is clipped"] > .ml-2').contains('Flip Back Page')
    cy.get('[title="That\'s the little thing in the bottom right corner"] > .ml-2').contains('Hide version number')
    cy.get('[title="That\'s the little thing in the bottom right corner"] > .ml-2').click()
    // click do not print
    cy.get('.actionDialog > .p-button-link').click()

    
  })

  it.skip('Checklist work', () => {
    visitAndCloseBanner()
    newPage()
    // set both pages to checlist
    cy.get('.pageOne > .list > [aria-label="Checklist"]').click()
    cy.get('.pageTwo > .list > [aria-label="Checklist"]').click()
    cy.get('.pageOne > .header').contains("Checklist")
    cy.get('.pageTwo > .header').contains("Checklist")

    //  swicth to edit mode
    cy.get('.pageOne > .header').click()
    cy.get('.pageOne > .header').contains("Checklist")

    // cy.get('.p-inputgroup > .p-inputtext').contains('Checklist')
    // one list for now
    cy.get('.oneOrTwoLists').children().should('have.length', 1)

    // swicth to two columns
    cy.get('[tabindex="-1"]').click()
    cy.get('.oneOrTwoLists').children().should('have.length', 2)

    cy.get('.oneOrTwoLists > :nth-child(1)').type('##Section1\nChallenge1.1##Response1.1\n##\n\nChallenge1.2\nChallenge1.3##')
    cy.get('.oneOrTwoLists > :nth-child(2)').type('##Section2\nChallenge2.1##Response2.1\n##\n\nChallenge2.2\nChallenge2.3##')
    cy.get('.theme-green').click()
    cy.get('[aria-label="Apply"]').click()
    // Section
    cy.get('.leftList > :nth-child(1) > .separator').contains('Section1')
    // Normal line with two short boxes
    cy.get('.leftList > .theme-green > .challenge').contains('Challenge1.1')
    cy.get('.leftList > .theme-green > .response').contains('Response1.1')
    // short empty boxes
    cy.get('.leftList > :nth-child(3) > .challenge').should('be.empty')
    cy.get('.leftList > :nth-child(3) > .response').should('be.empty')
    // long empty box
    cy.get('.leftList > :nth-child(4) > .spanned').should('be.empty')
    // long box with challenge
    cy.get('.leftList > :nth-child(5) > .spanned').contains('Challenge1.2')
    // short boxes with challenge and question
    cy.get('.leftList > :nth-child(6) > .challenge').contains('Challenge1.3')
    cy.get('.leftList > :nth-child(6) > .response').should('be.empty')

    cy.get('.rightList > .theme-green > .challenge').contains('Challenge2.1')
    cy.get('.rightList > .theme-green > .response').contains('Response2.1')
    // short empty boxes
    cy.get('.rightList > :nth-child(3) > .challenge').should('be.empty')
    cy.get('.rightList > :nth-child(3) > .response').should('be.empty')
    // long empty box
    cy.get('.rightList > :nth-child(4) > .spanned').should('be.empty')
    // long box with challenge
    cy.get('.rightList > :nth-child(5) > .spanned').contains('Challenge2.2')
    // short boxes with challenge and question
    cy.get('.rightList > :nth-child(6) > .challenge').contains('Challenge2.3')
    cy.get('.rightList > :nth-child(6) > .response').should('be.empty')


    // Change color to blue
    cy.get('.pageOne > .header').click()
    cy.get('.theme-blue > label').click()
    cy.get('[aria-label="Apply"]').click()
    // check it's blue
    cy.get('.leftList > .theme-blue > .challenge').contains('Challenge1.1')

  })

  it('Maintenance Window', () => {
    visitAndCloseBanner()
    cy.get('.maintenanceDialog').click()
  })

})
