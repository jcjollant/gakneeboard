import { bellinghamTitle, boeingTitle, checkCorner, checkTileSpan, checkTileVisible, loadDemo, maintenanceMode, rentonTitle, visitSkipBanner } from './shared'

describe('Tiles', () => {
  it('Airport Tile', () => {
    visitSkipBanner()
    maintenanceMode()
    loadDemo('Tiles')

    // Renton and Boeing fields
    const expectedValues = [
      {tile:rentonTitle,'label0':'ATIS','value0':'126.950','label1':'TWR','value1':'124.700','label2':'Elev','value2':'32','label3':'TPA',value3:'1250',watermark:'KRNT','dimensions':'5382x200'},
      {tile:boeingTitle,'label0':'ATIS','value0':'127.750','label1':'RWY 14L-32R','value1':'118.300','label2':'Elev','value2':'22','label3':'TPA','value3':'1022','watermark':'KBFI','dimensions':'3709x100'},
    ]
    for(let index = 0; index < expectedValues.length; index++) {
      const value = expectedValues[index]
      cy.get(`.page0 > .tile${index} > .headerTitle`).contains(value.tile)
      cy.get(`.page0 > .tile${index} > .tileContent .top.left > .clickable`)
      checkCorner(0, index, '.top.left', value.label0, value.value0)

      cy.get(`.page0 > .tile${index} > .tileContent .top.right > .clickable`)
      checkCorner(0, index, '.top.right', value.label1, value.value1)

      cy.get(`.page0 > .tile${index} > .tileContent .bottom.left > .clickable`)
      checkCorner(0, index, '.bottom.left', value.label2, value.value2)

      cy.get(`.page0 > .tile${index} > .tileContent .bottom.right > .clickable`)
      checkCorner(0, index, '.bottom.right', value.label3, value.value3)

      cy.get(`.page0 > .tile${index} > .tileContent .container .label`).contains(value.dimensions)
      cy.get(`.page0 > .tile${index} > .tileContent .airportCode`).contains(value.watermark)
    }

    // Switch runway and check frequency is being updated accordingly
    cy.get('.page0 > .tile1 > .headerTitle > .titleText').click()
    cy.get('[aria-label="14R-32L"]').click()
    cy.get('[aria-label="Apply"]').click()
    cy.get(`.page0 > .tile1 > .tileContent .top.right .value`).contains('120.600')
    cy.get(`.page0 > .tile1 > .tileContent .top.right .label`).contains('RWY 14R-32L')

    // Check Corners have all exected data
    // Open Renton bottom right corner to get the corner selection window
    cy.get(`.page0 > .tile0 > .tileContent .bottom.right`).click()
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
    cy.get('.page0 > .tile2 > .headerTitle > .titleText').click()
    cy.get('.page0 > :nth-child(3) > .content > .settings > .airportCode > .p-inputgroup > .p-inputtext').clear().type('KBLI')
    // wait for the reply
    cy.intercept({
      method: 'GET',
      url: '**/airport/**',
    }).as('getOneAirport');
    cy.wait('@getOneAirport').its('response.statusCode').should('equal', 200)
    // Name should be shown in AirportInput
    cy.get('.page0 > :nth-child(3) > .content > .settings > .airportCode > .airportName').contains(bellinghamTitle)
    cy.get('.page0 > :nth-child(3) > .content > .actionBar > [aria-label="Apply"]').click()
    // Check for bellingham fields
    const kbliValues = {tile:bellinghamTitle, label0:'ATIS',value0:'134.450',label1:'TWR',value1:'124.900',label2:'Elev',value2:'171',label3:'TPA',value3:'1201',watermark:'KBLI',dimensions:'6700x150'}
    cy.get('.page0 > .tile2 > .headerTitle').contains(kbliValues.tile)
    checkCorner(0,2, '.top.left', kbliValues.label0, kbliValues.value0)
    checkCorner(0,2, '.top.right', kbliValues.label1, kbliValues.value1)
    checkCorner(0,2, '.bottom.left', kbliValues.label2, kbliValues.value2)
    checkCorner(0,2, '.bottom.right', kbliValues.label3, kbliValues.value3)
    cy.get(`.page0 > .tile2 > .tileContent .container .label`).contains(kbliValues.dimensions)

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
    cy.get('.page0 > .tile2 > .headerTitle > .titleText').click()
    cy.get('.page0 > .tile2 > .headerTitle > .replaceButton').click({force: true})
    cy.get('[aria-label="Notes"]').click()
    cy.get('.page0 > :nth-child(3) > .headerTitle > div').contains('Notes')
    // Change tile back to Airport
    cy.get('.page0 > .tile2 > .headerTitle > .titleText').click()
    cy.get('.page0 > .tile2 > .headerTitle > .replaceButton').click({force: true})
    cy.get('[aria-label="Airport"]').click()
    // we should be in edit mode
    cy.get('.p-inputtext')

    // We should see the placeholder
    // cy.get('.page0 > :nth-child(3) > :nth-child(2) > .placeHolder').contains('No Airport')
    // cy.get('.page0 > :nth-child(3) > :nth-child(2) > .placeHolder').contains(placeHolderSubtitle)
  })

  it('Merges', () => {
    visitSkipBanner()
    // Load default demo
    loadDemo()

    // by default tiles are not merged
    checkTileSpan(0, 0, false)
    checkTileVisible(0, 1, true)

    // change tiles 1 Match tile 0
    cy.get('.tile1 .runway').click()
    cy.get('.p-inputtext').type('{selectAll}KBFI')
    cy.get('[aria-label="14L-32R"]').click()
    cy.get('[aria-label="Apply"]').click()
    checkTileSpan(0, 0, true)
    checkTileVisible(0, 1, false)

    // check tile has 8 large Corners
    cy.get('.top.left.cornerColumn').children().should('have.length', 4)
    cy.get('.top.right.cornerColumn').children().should('have.length', 4)

    const expectedCorners = [
      {label:'ATIS',value:'127.750'},
      {label:'RWY 14L-32R',value:'118.300'},
      {label:'Elevation',value:'22'},
      {label:'TPA',value:'1022'},
      {label:'CD/P',value:'132.400'},
      {label:'GND',value:'121.900'},
      {label:'Custom',value:'Custom'},
      {label:'UNICOM',value:'122.950'},
    ]
    for(let index = 0; index < expectedCorners.length; index++) {
      cy.get(`.corner${index}`).contains(expectedCorners[index].label)
      cy.get(`.corner${index}`).contains(expectedCorners[index].value)

    }

    // We can change values of corner boxes
    for(let index = 0; index < 8; index++) {
      cy.get(`.corner${index}`).click()
      // pick elevation
      cy.get('.standardList > :nth-child(1) > :nth-child(1)').click()
      cy.get('.p-button').click()
      cy.get(`.corner${index}`).contains('Elevation')
      cy.get(`.corner${index}`).contains('22')
    }
  })

})
