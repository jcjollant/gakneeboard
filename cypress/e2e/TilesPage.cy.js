import { visitAndCloseBanner, newPage } from './shared'

describe('Tiles', () => {
  it('Airport Tile', () => {
    visitAndCloseBanner()

    // wait for airports query
    cy.intercept({
      method: 'GET',
      url: 'https://ga-api-seven.vercel.app/airports/**',
    }).as('getAirports');

    cy.wait('@getAirports').its('response.statusCode').should('equal', 200)

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
      ['Power OFF stalls', 'Arlington Muni', 'Sun Light', 'Fuel Bug', 'Notes', 'Radio Flow']]
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
  })

  it('ATIS Tile', () => {
    visitAndCloseBanner()

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
  })

  it('Clearance Tile', () => {
    visitAndCloseBanner()

    cy.get('.pageOne > :nth-child(6) > .header > div').contains('Clearance @')
    cy.get('.cleared').contains('To')
    cy.get('.cleared > .watermrk').contains('C')
    cy.get('.route').contains('Route')
    cy.get('.route > .watermrk').contains('R')
    cy.get('.altitude').contains("Altitude")
    cy.get('.altitude > .watermrk').contains('A')
    cy.get('.frequency').contains('Freq.')
    cy.get('.frequency > .watermrk').contains('F')
    cy.get('.transponder').contains('Xpdr')
    cy.get('.transponder > .watermrk').contains('T')
  })

  it('Sunlight Tile', () => {
    visitAndCloseBanner()

    cy.intercept({
      method: 'GET',
      url: 'https://ga-api-seven.vercel.app/airports/**',
    }).as('getAirports');

    cy.wait('@getAirports').its('response.statusCode').should('equal', 200)

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

  })

  // ========================================================================
  // Radio Flow
  // ========================================================================
  it('RadioFlow Tile', () => {
    visitAndCloseBanner()
    // Check all fields are present in Radio flow
    cy.fixture('radioFlow').then((radioFlow) => {
      for(let index=0; index<radioFlow.length; index++) {
        cy.get(`.freqList > :nth-child(${index+1})`).contains(radioFlow[index].freq)
        cy.get(`.freqList > :nth-child(${index+1})`).contains(radioFlow[index].name)
      }
    })
  })

  // ========================================================================
  // Checklist Tile
  // ========================================================================
  it('Checklist Tile', () => {
    visitAndCloseBanner()
    const title = 'Power OFF stalls'
    const title3 = 'Name3'
    // check we have default content
    cy.get('.pageTwo > :nth-child(1) > .header > div').contains(title)
    cy.get(':nth-child(1) > .response').contains('Made')
    cy.get(':nth-child(2) > .response').contains('Bugged')
    cy.get(':nth-child(2)').should('have.class', 'theme-blue')

    // Edit mode 
    cy.get('.pageTwo > :nth-child(1) > .header > div').click()
    cy.get('.oneLine > .p-inputgroup > .p-inputgroup-addon').contains('Name')
    cy.get('.p-inputgroup > .p-inputtext').should('have.value', title)
    cy.get('.p-dropdown-label').contains('Blue')
    // Information icon
    cy.get('.actionBar > .p-button-icon-only')
    // Change title but cancel
    cy.get('.p-inputgroup > .p-inputtext').type('{selectall}').type('Name1')
    // Title should be updated for now
    cy.get('.pageTwo > :nth-child(1) > .header > div').contains('Name1')
    cy.get('.p-dropdown').type('G').type('{enter}')
    // Cancel
    cy.get('[aria-label="Cancel"]').click()
    // Title goes back
    cy.get('.pageTwo > :nth-child(1) > .header > div').contains(title)
    // Color sdhould not change
    cy.get(':nth-child(2)').should('have.class', 'theme-blue')

    // Change title and color to green
    cy.get('.pageTwo > :nth-child(1) > .header > div').click()
    // Change title
    cy.get('.p-inputgroup > .p-inputtext').type('{selectall}').type(title3)
    // change color to green
    cy.get('.p-dropdown').type('G').type('{enter}')
    cy.get('[aria-label="Apply"]').click()
    // Title should have changed
    cy.get('.pageTwo > :nth-child(1) > .header > div').contains(title3)
    // Color should be green
    cy.get(':nth-child(2)').should('have.class', 'theme-green')

    // remove all entries 
    cy.get('.pageTwo > :nth-child(1) > .header > div').click()
    cy.get('.p-inputtextarea').type('{selectall}{backspace}')
    // Apply changes
    cy.get('[aria-label="Apply"]').click()
    // There should be not items
    cy.get('.placeHolder').contains('There are no items')

  })


})
