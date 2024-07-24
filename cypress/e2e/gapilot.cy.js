const currentVersionNumber = '724'

describe('template spec', () => {
  it('Visits main page', () => {
    // cy.visit('https://www.kneeboard.ga/')
    // Local environment
    cy.visit('http://localhost:5173/')
    // Sunlight Branch
    // cy.visit('https://gapilot-git-sunlight-jcjollants-projects.vercel.app/')

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

    // Reset tiles and check all are reset
    cy.get('.menuIcon').click()
    cy.get('[aria-label="New"]').click()
    cy.get('.p-confirm-dialog-accept').click()
    cy.get('.menuIcon').click()

    // check all tiles are in reset mode
    for( const page of [1,2]) {
      for( const tile of [1, 2, 3, 4, 5, 6]) {
        cy.get(`:nth-child(${page}) > :nth-child(${tile}) > .header > div`).contains('Tile Selection')
      }
    }

    // load demo page
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

    // Test Airport Tile Renton and Boeing fields
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
    // Open the bottom right corner
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

    
    // Check ATIS has all fields in full mode
    cy.get('.info').contains('Info')
    cy.get('.wind').contains('Wind')
    cy.get('.runway').contains('Rwy')
    cy.get('.visibility').contains('Vis')
    cy.get('.sky').contains('Sky')
    cy.get('.temperature').contains('Temp')
    cy.get('.altimeter').contains('Alt')
    // Check ATIS has all fields in compact mode
    cy.get('[data-v-553a57e2=""][data-v-b66d1b07=""] > .header').click()
    cy.get('[aria-label="Full Size"]').contains('Full Size')
    cy.get('[aria-label="Compact (x4)"]').contains('Compact (x4)')
    cy.get('[aria-label="Compact (x4)"]').click()
    for(let index=1; index <=4; index++) {
      cy.get(`:nth-child(${index}) > .info`).contains('Info')
      cy.get(`:nth-child(${index}) > .wind`).contains('Wind')
      cy.get(`:nth-child(${index}) > .altimeter`).contains('Alt')
      cy.get(`:nth-child(${index}) > .runway`).contains('Rwy')
  
    }

    // Test Sunlight Tile
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
    cy.get('[data-v-364bf338=""][data-pc-name="inputgroup"] > .p-inputgroup-addon').contains('Date')

    // Test print dialog show up
    cy.get('.menuIcon').click()
    cy.get('[aria-label="Print"]').click()
    cy.get('#pv_id_4_header').contains('Print Active Sheet')
    cy.get('[title="So you can read back page while front page is clipped"] > .ml-2').contains('Flip right page')
    cy.get('[title="That\'s the little thing in the bottom right corner"] > .ml-2').contains('Hide version number')
    cy.get('[title="That\'s the little thing in the bottom right corner"] > .ml-2').click()
    // click do not print
    cy.get('.actionDialog > .p-button-link').click()

  })
  
})
