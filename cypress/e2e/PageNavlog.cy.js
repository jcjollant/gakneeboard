import { visitAndCloseBanner, newPage, placeHolderSubtitle } from './shared'

function checkBlankState() {
    cy.get(':nth-child(1) > .headerTitle').contains("NavLog")
    cy.get('.placeHolder').contains('No Entries')
    cy.get('.placeHolder').contains(placeHolderSubtitle)
}

describe('navlog Page', () => {
  it('Basic flow', () => {
    visitAndCloseBanner()
    newPage()
    // set left page to cover
    cy.get('.pageOne > .list > [aria-label="NavLog"]').click()

    // should see the blank state
    checkBlankState()

    // edit mode
    cy.get(':nth-child(1) > .headerTitle').click()
    const expectedVariables = ['From', 'To', 
      'Altitudes', 'Create',
      'Fuel Tank', 'Descent', 
      'Init.', 'Res.', 'FPM', 'GPH']
    for(const variable of expectedVariables) {
      cy.get('.variables').contains(variable)
    }

    // create a navlog
    cy.get('.varAirportFrom > .p-inputgroup > .p-inputtext').type('KRNT')
    cy.get('.varAirportTo > .p-inputgroup > .p-inputtext').type('KSFF')
    cy.get('.varAltitudes > .p-inputtext').type("2500 2500 4500 4500 7500 7500 5500")
    cy.wait(500) // give it time to pull data
    // Click create
    cy.get('.variables > .p-button').click()

    // we should see Checkpoints and altitudes
    const expectedItems = [ {c:'KRNT',a:32},
      {c:'TOC 25',a:2500},
      {c:'CheckPt 1',a:2500},
      {c:'TOC 45',a:4500},
      {c:'CheckPt 3',a:4500},
      {c:'TOC 75',a:7500},
      {c:'TOD 55',a:7500},
      {c:'TOD KSFF',a:5500},
      {c:'KSFF',a:1957},
    ]
    for(let index = 0; index < expectedItems.length; index++) {
      const item = expectedItems[index]
      cy.get(`:nth-child(${index+2}) > .checkpointName`).contains(item.c)
      cy.get(`:nth-child(${index+2}) > .checkpointAlt`).contains(item.a)
    }
    // totals should be undefined
    cy.get('.totalDistance').contains('0.0')
    cy.get('.totalTime').contains('0:00')
    cy.get('.totalFuel').contains('0.0')

    // Update legs
    cy.get(':nth-child(2) > .br').click()
    cy.get('#mh').type('90')
    cy.get('#ld').type('1')
    cy.get('#gs').type('2')
    cy.get('#lt').type('3:15')
    cy.get('#lf').type('4')
    cy.get('.actionDialog > [aria-label="Save"]').click()
    // first line should be updated
    cy.get(':nth-child(2) > .magneticHeading').contains('90')
    cy.get(':nth-child(2) > .legDistance').contains('1.0')
    cy.get(':nth-child(2) > .groundSpeed').contains('2')
    cy.get(':nth-child(2) > .legTime').contains('3:15')
    cy.get(':nth-child(2) > .legFuel').contains('4')

    // enter values for the other two legs

    const legData = [
      {index: 3, ld: '5', gs: '6', lt: '7:30', lf: '8'},
      {index: 4, ld: '9', gs: '10', lt: '11.75', lf: '12'},
      {index: 5, ld: '9', gs: '10', lt: '11.75', lf: '5'},
      {index: 6, ld: '9', gs: '10', lt: '11.75', lf: '5'},
      {index: 7, ld: '9', gs: '10', lt: '11.75', lf: '5'},
    ]
    for(const data of legData) {
      cy.get(`:nth-child(${data.index}) > .br`).click()
      cy.get('#ld').type(data.ld)
      cy.get('#gs').type(data.gs)
      cy.get('#lt').type(data.lt)
      cy.get('#lf').type(data.lf)
      cy.get('.actionDialog > [aria-label="Save"]').click()
    }

    // test totals
    cy.get('.totalDistance').contains('42.0')
    cy.get('.totalTime').contains('57:45')
    cy.get('.totalFuel').contains('39.0')

    // Apply
    cy.get('[aria-label="Apply"]').click()
    cy.get('.p-toast-message-content').contains('Bingo Fuel')

    // enter initial fuel and reserve
    cy.get('.varInitialFuel > .p-inputtext').type(53)
    cy.get('.varReserveFuel > .p-inputtext').type(30)
    // and apply again
    cy.get('[aria-label="Apply"]').click()

    // Fuel reserve should pop
    cy.get(':nth-child(5) > .fuel').should('not.have.class','fuelBingo')
    cy.get(':nth-child(6) > .fuel').should('have.class','fuelBingo')
    cy.get('.totalFuel').should('have.class', 'fuelBingo')

    // Delete
  })
})