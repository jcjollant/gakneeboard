import { bellinghamTitle, boeingTitle, checkCorner, checkTileSpan, checkTileVisible, loadDemo, maintenanceMode, rentonTitle, visitSkipBanner, waitForAirports, waitOneAirport } from './shared'

describe('Tiles', () => {
  it('Airport Tile', () => {
    visitSkipBanner()
    maintenanceMode()
    loadDemo('Tiles')

    waitForAirports()

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

    // Enter a new airport code and check it's data is loading
    cy.get('.page0 > .tile2 > .headerTitle > .titleText').click()
    cy.get('.page0 > :nth-child(3) > .content > .settings > .airportCode > .p-inputgroup > .p-inputtext').clear().type('KBLI')
    // wait for the reply
    waitOneAirport()

    // Name should be shown in AirportInput
    cy.get('.page0 > .tile2 .settings > .airportCode .airportName').contains(bellinghamTitle)
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
  })

  it('Configure Corners', () => {
    visitSkipBanner()
    loadDemo('Tiles')

    // Check Corners have all expected data
    // Open Renton bottom right corner to get the corner selection window
    cy.get(`.page0 > .tile0 > .tileContent .bottom.right`).click()
    // standard fields
    const expectedStandardFields = [
      {name:'Field Elevation',label:'Elevation',value:'32'}, 
      {name:'Traffic Pattern Altitude',label:'TPA',value:'1250'}, 
      {name:'Runway Information',label:'(G) Good/ASPH-CONC',value:'5382x200'}, 
      {name:'Nothing',label:'',value:''}, 
    ]
    for(let index = 0; index < expectedStandardFields.length; index++) {
      const field = expectedStandardFields[index]
      cy.get(`.standardList > :nth-child(${index+1})`).contains(field.name)
      cy.get(`.standardList > :nth-child(${index+1})`).click()
      if(field.label != '') cy.get('.page0 > .tile0 > .tileContent > :nth-child(1) > .bottom.right > .clickable > .small > .label').contains(field.label)
      if(field.value != '') cy.get('.page0 > .tile0 > .tileContent > :nth-child(1) > .bottom.right > .clickable > .small > .value').contains(field.value)
    }
    // Radios
    const expectedRadios = [
      {name:'124.700 : CTAF',label:'CTAF',value:'124.700'}, 
      {name:'122.950 : UNICOM',label:'UNICOM',value:'122.950'}, 
      {name:'126.950 : ATIS',label:'ATIS',value:'126.950'}, 
      {name:'121.600 : GND',label:'GND',value:'121.600'}, 
      {name:'124.700 : TWR',label:'TWR',value:'124.700'}, 
      {name:'Selected Runway',label:'twr',value:'-.-'}, 
    ]
    for(let index = 0; index < expectedRadios.length; index++) {
      const field = expectedRadios[index]
      cy.get(`.freqList > :nth-child(${index+1}) > .ml-2`).contains(field.name)
      cy.get(`.freqList > :nth-child(${index+1}) > .ml-2`).click()
      cy.get('.page0 > .tile0 > .tileContent > :nth-child(1) > .bottom.right > .clickable > .small > .label').contains(field.label)
      cy.get('.page0 > .tile0 > .tileContent > :nth-child(1) > .bottom.right > .clickable > .small > .value').contains(field.value)
    }
    const expectedNavaids = [
      'SEA (VORTAC)', '116.800', '48°', 
      'PAE (VOR/DME)', '110.600', '174°',
      'OLM (VORTAC)', '113.400', '42°',
      'CVV (VOR/DME)', '117.200', '155°']
    const expectedNaaidsOutcomes = [
      {label1:'SEA', value1:'116.800', label2:'SEA Radial', value2:'48°'},
      {label1:'PAE', value1:'110.600', label2:'PAE Radial', value2:'174°'},
      {label1:'OLM', value1:'113.400', label2:'OLM Radial', value2:'42°'},
      {label1:'CVV', value1:'117.200', label2:'CVV Radial', value2:'155°'},
    ]
    for(let index = 0; index < expectedNavaids.length; index++) {
      cy.get(`.navList > :nth-child(${index+1})`).contains(expectedNavaids[index])
      if(index % 3 == 0) {
        const field2 = expectedNaaidsOutcomes[index/3]
        cy.get(`.navList > :nth-child(${index+2}) > .ml-2`).click()
        cy.get('.page0 > .tile0 > .tileContent > :nth-child(1) > .bottom.right > .clickable > .small > .label').contains(field2.label1)
        cy.get('.page0 > .tile0 > .tileContent > :nth-child(1) > .bottom.right > .clickable > .small > .value').contains(field2.value1)
        cy.get(`.navList > :nth-child(${index+3}) > .ml-2`).click()
        cy.get('.page0 > .tile0 > .tileContent > :nth-child(1) > .bottom.right > .clickable > .small > .label').contains(field2.label2)
        cy.get('.page0 > .tile0 > .tileContent > :nth-child(1) > .bottom.right > .clickable > .small > .value').contains(field2.value2)
      }
    }
    const expectedAtcs = [
      {name:'119.200 : Apch',     label:'SEATTLE-TACOMA', value:'119.200'},
      {name:'120.100 : Apch',     label:'SEATTLE-TACOMA', value:'120.100'}, 
      {name:'120.400 : Apch',     label:'SEATTLE-TACOMA', value:'120.400'}, 
      {name:'123.900 : Approach', label:'SEATTLE-TACOMA', value:'123.900'}, 
      {name:'125.600 : OLYMPIA',  label:'SEATTLE-TACOMA', value:'125.600'}, 
      {name:'125.900 : Apch',     label:'SEATTLE-TACOMA', value:'125.900'}, 
      {name:'126.500 : Apch',     label:'SEATTLE-TACOMA', value:'126.500'}, 
      {name:'128.500 : Apch',     label:'SEATTLE-TACOMA', value:'128.500'}, 
      ]
    for(let index = 0; index < expectedAtcs.length; index++) {
      const field = expectedAtcs[index]
      cy.get(`.atcList > :nth-child(${index+1}) > .ml-2`).contains(field.name)
      cy.get(`.atcList > :nth-child(${index+1}) > .ml-2`).click()
      cy.get('.page0 > .tile0 > .tileContent > :nth-child(1) > .bottom.right > .clickable > .small > .label').contains(field.label)
      cy.get('.page0 > .tile0 > .tileContent > :nth-child(1) > .bottom.right > .clickable > .small > .value').contains(field.value)
    }
    // Test custom value
    const customLabel = 'CustLabel';
    const customValue = 'CustValue';
    cy.get('[placeholder="label"]').type(customLabel)
    cy.get('[placeholder="value"]').type(customValue)
    cy.get('.ctCustom > label.ml-2').click()
    cy.get('.page0 > .tile0 > .tileContent > :nth-child(1) > .bottom.right > .clickable > .small > .label').contains(customLabel)
    cy.get('.page0 > .tile0 > .tileContent > :nth-child(1) > .bottom.right > .clickable > .small > .value').contains(customValue)
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

  it('Settings', () => {
    visitSkipBanner()
    loadDemo()

    waitForAirports()

    // switch to settings
    cy.get('.page0 > .tile0 > .headerTitle').click()
    // Check default values
    cy.get('.eoOrientation .choiceOr').should('have.class', 'selected')
    cy.get('.ocTP > .choice0').should('have.class', 'choiceActive')
    cy.get('.eoHeadings > .choiceEither').should('have.class', 'selected')
    // Select different values
    cy.get('.eoOrientation > .choiceEither').click()
    cy.get('.ocTP > .choice1').click()
    cy.get('.eoHeadings > .choiceOr').click()
    // Apply settings
    cy.get('[aria-label="Apply"]').click()

    // test locastorage is reflecting that list
    cy.getLocalStorage('template')
      .then(t => {
        const template = JSON.parse(t)
        expect(template.data[0].data[0].data.rwyOrientation).to.equal('vertical')
        expect(template.data[0].data[0].data.pattern).to.equal(1)
        expect(template.data[0].data[0].data.headings).to.equal(false)
      })

    // reopen settings to make sure evenrything is memorized
    cy.get('.page0 > .tile0 > .headerTitle').click()
    cy.get('.ocTP > .choice1').should('have.class', 'choiceActive')
    cy.get('.eoHeadings > .choiceOr').should('have.class', 'selected')
    // Change Pattern and headings
    cy.get('.eoOrientation > .choiceOr').click()
    cy.get('.ocTP > .choice2').click()
    cy.get('.eoHeadings > .choiceEither').click()
    // Apply settings
    cy.get('[aria-label="Apply"]').click()

    // test locastorage is reflecting that list
    cy.getLocalStorage('template')
      .then(t => {
        const template = JSON.parse(t)
        expect(template.data[0].data[0].data.rwyOrientation).to.equal('magnetic')
        expect(template.data[0].data[0].data.pattern).to.equal(2)
        expect(template.data[0].data[0].data.headings).to.equal(true)
      })
  })
})
