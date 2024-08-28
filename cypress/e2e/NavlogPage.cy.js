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
    const expectedVariables = ['From', 'To', 'Initial Fuel', 'Create']
    for(const variable of expectedVariables) {
      cy.get('.variables').contains(variable)
    }

    // create a navlog
    cy.get('.airportFrom > .p-inputgroup > .p-inputtext').type('KRNT')
    cy.get('.airportTo > .p-inputgroup > .p-inputtext').type('KSFF')
    cy.wait(1500)
    // Click create
    cy.get('.variables > .p-button').click()

    // we should see Felts field
    cy.get('.checkpoints > :nth-child(5)').contains('KSFF')
    cy.get('.checkpoints > :nth-child(5)').contains('1957')
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

    cy.get(':nth-child(3) > .br').click()
    cy.get('#ld').type('5')
    cy.get('#gs').type('6')
    cy.get('#lt').type('7:30')
    cy.get('#lf').type('8')
    cy.get('.actionDialog > [aria-label="Save"]').click()
    cy.get(':nth-child(4) > .br').click()
    cy.get('#ld').type('9')
    cy.get('#gs').type('10')
    cy.get('#lt').type('11.75') // twist, decimal format
    cy.get('#lf').type('12')
    cy.get('.actionDialog > [aria-label="Save"]').click()

    // test totals
    cy.get('.totalDistance').contains('15.0')
    cy.get('.totalTime').contains('22:30')
    cy.get('.totalFuel').contains('24.0')
  })
})