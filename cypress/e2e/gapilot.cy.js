describe('template spec', () => {
  it('Visits main page', () => {
    cy.visit('https://www.kneeboard.ga/')
    // remove banner
    cy.contains('Got it').click()

    // wait for airports query
    cy.intercept({
      method: 'GET',
      url: 'https://ga-api-seven.vercel.app/airports/**',
    }).as('getAirports');    

    cy.wait('@getAirports').its('response.statusCode').should('equal', 200)

    // check version number
    cy.get('.versionDialog').contains('627')

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


    // renton fields
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

  })
  
})
