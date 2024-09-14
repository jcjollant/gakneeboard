import { visitAndCloseBanner, newPage, maintenanceMode, placeHolderSubtitle } from './shared'

describe('Tiles', () => {
  it('Airport Tile', () => {
    visitAndCloseBanner()

    // wait for airports query
    // cy.intercept({
    //   method: 'GET',
    //   url: 'https://ga-api-seven.vercel.app/airports/**',
    // }).as('getAirports');

//    cy.wait('@getAirports').its('response.statusCode').should('equal', 200)
    cy.wait(1000)

    newPage()

    // sets one page in Tiles, other in Checlisk
    cy.get('.pageOne > .list > [aria-label="Tiles"]').click()
    cy.get('.pageTwo > .list > [aria-label="Checklist"]').click()

    // check all tiles are in reset mode on page 1
    for( const tile of [1, 2, 3, 4, 5, 6]) {
      cy.get(`:nth-child(1) > :nth-child(${tile}) > .headerTitle > div`).contains('Tile Selection')
    }

    // Check page 2 is in checlist mode
    cy.get('.pageTwo > .headerTitle').contains("Checklist")

    // load tiles demo page
    maintenanceMode()
    cy.get('.menuIcon').click()
    cy.get('[aria-label="Load"]').click()
    cy.get('[aria-label="Tiles"]').click()
    cy.get('[aria-label="Load Template"]').click()
    cy.get('.p-confirm-dialog-accept').click()
    cy.get('.menuIcon').click()

    // test All expected tiles are loading
    const expectedTiles = [
      ['Renton Muni', 'Boeing Fld/king County Intl', 'Roche Harbor', 'Lone Pine/death Valley', 'ATIS @', 'Clearance @'],
      ['Power OFF stalls', 'Arlington Muni', 'Sun Light', 'Fuel Bug', 'Notes', 'Radio Flow']]
    for( let page = 1; page < 3; page++) {
      for( let tile = 1; tile < 7; tile++) {
        const value = expectedTiles[page-1][tile-1]
        cy.get(`:nth-child(${page}) > :nth-child(${tile}) > .headerTitle > div`).contains(value)
      }
    }

    // Renton and Boeing fields
    const expectedValues = []
    expectedValues.push({tile:'Renton Muni','label0':'ATIS','value0':'126.950','label1':'TWR','value1':'124.700','label2':'Elev','value2':'32','label3':'TPA',value3:'1250',watermark:'KRNT','dimensions':'5382x200'})
    expectedValues.push({'tile':'Boeing Fld/king County Intl','label0':'ATIS','value0':'127.750','label1':'RWY 14L-32R','value1':'118.300','label2':'Elev','value2':'22','label3':'TPA','value3':'1022','watermark':'KBFI','dimensions':'3709x100'})
    for(let index = 0; index < 2; index++) {
      const value = expectedValues[index]
      const child = index + 1
      cy.get(`:nth-child(1) > :nth-child(${child}) > .headerTitle > div`).contains(value.tile)
      cy.get(`:nth-child(1) > :nth-child(${child}) > .content > :nth-child(1) > .top.left > .clickable > :nth-child(1) > :nth-child(1)`).contains(value.value0)
      cy.get(`:nth-child(1) > :nth-child(${child}) > .content > :nth-child(1) > .top.left > .clickable > :nth-child(1) > .label`).contains(value.label0)
      cy.get(`:nth-child(1) > :nth-child(${child}) > .content > :nth-child(1) > .top.right > .clickable > :nth-child(1) > :nth-child(1)`).contains(value.value1)
      cy.get(`:nth-child(1) > :nth-child(${child}) > .content > :nth-child(1) > .top.right > .clickable > :nth-child(1) > .label`).contains(value.label1)
      cy.get(`:nth-child(1) > :nth-child(${child}) > .content > :nth-child(1) > .bottom.left > .clickable > :nth-child(1) > :nth-child(2)`).contains(value.value2)
      cy.get(`:nth-child(1) > :nth-child(${child}) > .content > :nth-child(1) > .bottom.left > .clickable > :nth-child(1) > .label`).contains(value.label2)
      cy.get(`:nth-child(1) > :nth-child(${child}) > .content > :nth-child(1) > .bottom.right > .clickable > :nth-child(1) > :nth-child(2)`).contains(value.value3)
      cy.get(`:nth-child(1) > :nth-child(${child}) > .content > :nth-child(1) > .bottom.right > .clickable > :nth-child(1) > .label`).contains(value.label3)
      cy.get(`:nth-child(1) > :nth-child(${child}) > .content > :nth-child(1) > .container > .label`).contains(value.dimensions)
      cy.get(`:nth-child(1) > :nth-child(${child}) > .content > :nth-child(1) > .airportCode`).contains(value.watermark)
    }
    // Switch runway and check frequency is being updated accordingly
    cy.get(':nth-child(1) > :nth-child(2) > .headerTitle > div').click()
    cy.get('[aria-label="14R-32L"]').click()
    cy.get('[aria-label="Apply"]').click()
    cy.get(':nth-child(2) > .content > :nth-child(1) > .top.right > .clickable > :nth-child(1) > :nth-child(1)').contains('120.600')
    cy.get(':nth-child(2) > .content > :nth-child(1) > .top.right > .clickable > :nth-child(1) > .label').contains('RWY 14R-32L')
    // Check Corners have all exected data
    // Open the bottom right corner to get the corner selection window
    cy.get(':nth-child(1) > :nth-child(1) > .content > :nth-child(1) > .bottom.right').click()
    // standard fields
    const expectedStandardFields = ['Field Elevation', 'Traffic Pattern Altitude', 'Runway Information', 'Nothing']
    for(let index = 0; index < expectedStandardFields.length; index++) {
      cy.get(`.standardList > :nth-child(${index+1})`).contains(expectedStandardFields[index])
    }
    // Radios
    const expectedRadios = ['124.700 : CTAF', '122.950 : UNICOM', '126.950 : ATIS', '121.600 : GND', '124.700 : TWR']
    for(let index = 0; index < expectedRadios.length; index++) {
      cy.get(`.freqList > :nth-child(${index+1})`).contains(expectedRadios[index])
    }
    const expectedNavaids = ['116.800 : SEA (VORTAC)', '110.600 : PAE (VOR/DME)', '113.400 : OLM (VORTAC)', '117.200 : CVV (VOR/DME)']
    for(let index = 0; index < expectedNavaids.length; index++) {
      cy.get(`.navList > :nth-child(${index+1})`).contains(expectedNavaids[index])
    }
    const expectedAtcs = ['119.200 : Apch', '120.100 : Apch', '120.400 : Apch', '123.900 : Approach', '125.600 : OLYMPIA', '125.900 : Apch', '126.500 : Apch', '128.500 : Apch']
    for(let index = 0; index < expectedAtcs.length; index++) {
      cy.get(`.atcList > :nth-child(${index+1})`).contains(expectedAtcs[index])
    }
    // close overlaypanel
    cy.get('[aria-label="Done"]').click()

    // Enter a new airport code and check it's data is loading
    cy.get('.pageOne > :nth-child(3) > .headerTitle > div').click()
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
    const kbliValues = {tile:'Bellingham Intl',label0:'ATIS',value0:'134.450',label1:'TWR',value1:'124.900',label2:'Elev',value2:'171',label3:'TPA',value3:'1201',watermark:'KBLI',dimensions:'6700x150'}
    cy.get('.pageOne > :nth-child(3) > .headerTitle > div').contains(kbliValues.tile)
    cy.get(':nth-child(3) > .content > :nth-child(1) > .top.left > .clickable > :nth-child(1) > .label').contains(kbliValues.label0)
    cy.get(':nth-child(3) > .content > :nth-child(1) > .top.left > .clickable > :nth-child(1) > :nth-child(1)').contains(kbliValues.value0)
    cy.get(':nth-child(3) > .content > :nth-child(1) > .top.right > .clickable > :nth-child(1) > .label').contains(kbliValues.label1)
    cy.get(':nth-child(3) > .content > :nth-child(1) > .top.right > .clickable > :nth-child(1) > :nth-child(1)').contains(kbliValues.value1)
    cy.get(':nth-child(3) > .content > :nth-child(1) > .bottom.left > .clickable > :nth-child(1) > .label').contains(kbliValues.label2)
    cy.get(':nth-child(3) > .content > :nth-child(1) > .bottom.left > .clickable > :nth-child(1) > :nth-child(2)').contains(kbliValues.value2)
    cy.get(':nth-child(3) > .content > :nth-child(1) > .bottom.right > .clickable > :nth-child(1) > .label').contains(kbliValues.label3)
    cy.get(':nth-child(3) > .content > :nth-child(1) > .bottom.right > .clickable > :nth-child(1) > :nth-child(2)').contains(kbliValues.value3)
    cy.get(':nth-child(3) > .content > :nth-child(1) > .container > .label').contains(kbliValues.dimensions)

    // Test All Runways mode with KAWO Arlington
    cy.get('.runwayList > :nth-child(1) > :nth-child(1)').contains('Rwy')
    cy.get('.runwayList > :nth-child(1) > :nth-child(2)').contains('Len')
    cy.get('.runwayList > :nth-child(1) > :nth-child(3)').contains('Freq')
    cy.get('.runwayList > :nth-child(2) > .runwayListItemRunway > .patternRight').contains('11')
    cy.get('.runwayList > :nth-child(2) > .runwayListItemRunway > .patternLeft').contains('29')
    cy.get('.runwayList > :nth-child(3) > .runwayListItemRunway > .patternRight').contains('16')
    cy.get('.runwayList > :nth-child(3) > .runwayListItemRunway > .patternLeft').contains('34')
    cy.get(':nth-child(1) > :nth-child(1) > :nth-child(1) > .label').contains('Elev')
    cy.get(':nth-child(2) > :nth-child(1) > :nth-child(1) > .label').contains('TPA')
    cy.get('.footer > :nth-child(3) > :nth-child(1) > :nth-child(1) > .label').contains('AWOS-3PT')
    cy.get(':nth-child(1) > :nth-child(1) > :nth-child(1) > :nth-child(2)').contains('142')
    cy.get('.footer > :nth-child(2) > :nth-child(1) > :nth-child(1) > :nth-child(2)').contains('1142')
    cy.get('.footer > :nth-child(3) > :nth-child(1) > :nth-child(1) > :nth-child(2)').contains('135.625')

    // Replace tile with Notes
    cy.get('.pageOne > :nth-child(3) > .headerTitle > div').click()
    cy.get('.pageOne > :nth-child(3) > .headerTitle > .p-button').click()
    cy.get('[aria-label="Notes"]').click()
    cy.get('.pageOne > :nth-child(3) > .headerTitle > div').contains('Notes')
    // Change tile back to Airport
    cy.get('.pageOne > :nth-child(3) > .headerTitle > div').click()
    cy.get('.pageOne > :nth-child(3) > .headerTitle > .p-button').click()
    cy.get('[aria-label="Airport"]').click()
    // we should be in edit mode
    cy.get('.p-inputtext')

    // We should see the placeholder
    // cy.get('.pageOne > :nth-child(3) > :nth-child(2) > .placeHolder').contains('No Airport')
    // cy.get('.pageOne > :nth-child(3) > :nth-child(2) > .placeHolder').contains(placeHolderSubtitle)


  })

})
