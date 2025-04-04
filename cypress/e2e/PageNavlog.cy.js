import { placeHolderSubtitle, visitSkipBanner, newTemplate, replacePage, pageNameNavlog, expectToast, waitOneAirport } from './shared'
import { replaceBy } from './shared'

function checkBlankState() {
    cy.get(':nth-child(1) > .headerTitle').contains("NavLog")
    cy.get('.placeHolder').contains('No Entries')
    cy.get('.placeHolder').contains(placeHolderSubtitle)
}

function testRecap(page, depFuel, depFuelTime, usedFuel, destFuel, destFuelTime, resFuel, resFuelTime) {
  cy.get(`${page} > .main > .fuelRecap > :nth-child(1) > .fuelRecapAvailable`).contains(depFuel)
  cy.get(`${page} > .main > .fuelRecap > :nth-child(1) > .fuelRecapTime`).contains(depFuelTime)
  cy.get(`${page} > .main > .fuelRecap > :nth-child(2) > .fuelRecapUsed`).contains(usedFuel)
  cy.get(`${page} > .main > .fuelRecap > :nth-child(3) > .fuelRecapAvailable`).contains(destFuel)
  cy.get(`${page} > .main > .fuelRecap > :nth-child(3) > .fuelRecapTime`).contains(destFuelTime)
  cy.get(`${page} > .main > .fuelRecap > :nth-child(4) > .fuelRecapReserve`).contains(resFuel)
  cy.get(`${page} > .main > .fuelRecap > :nth-child(4) > .fuelRecapTime`).contains(resFuelTime)
  if(Number(destFuel) < Number(resFuel)) {
    cy.get(`${page} > .main > .fuelRecap > :nth-child(3) > .fuelRecapAvailable`).should('have.class', 'fuelRecapAvailableReserve')
    cy.get(`${page} > .main > .fuelRecap > :nth-child(3) > .fuelRecapTime`).should('have.class', 'fuelRecapAvailableReserve')
  }
}

describe('navlog Page', () => {

  it('Basic flow', () => {
    visitSkipBanner()
    newTemplate()

    // set left page to Navlog
    cy.get('.page0 > .list > [aria-label="NavLog"]').click()

    // should see the blank state
    checkBlankState()

    // edit mode
    cy.get(':nth-child(1) > .headerTitle').click()

    // should have two modes
    cy.get('.choiceActive').contains('Create New Log')
    cy.get('.choiceInactive').contains('Continue Existing Log')

    const expectedFields = ['From', 'To', 'Altitudes' ]
    for(const field of expectedFields) {
      cy.get('.createMode').contains(field)
    }

    // create a navlog w/o altitudes
    cy.get('.createAirportFrom > .p-inputgroup > .p-inputtext').type('KRNT', {delay:0})
    waitOneAirport()
    cy.get('.createAirportTo > .p-inputgroup > .p-inputtext').type('KBLI', {delay:0})
    waitOneAirport()
    cy.get('.createButton > .p-button').click()

    // All variable fields should show
    const expectedVariables = ['Fuel Tank', 'Cruise', 'Descent',  'Initial', 'Reserve', 'F.Flow', 'Rate']
    for(const variable of expectedVariables) {
      cy.get('.variables').contains(variable)
    }

    const expectedCheckpoints = ['KRNT','TOC','TOD','KBLI']
    for(const checkpoint of expectedCheckpoints) {
      cy.get('.checkpoints').contains(checkpoint)
    }

    // altitudes
    const expectedAltitudes = ['32','?','?','171']
    let index = 2
    for(const altitude of expectedAltitudes) {
      cy.get(`:nth-child(${index}) > .br`).contains(altitude)
      index++
    }

    cy.get('.varInitialFuel > .p-inputtext').type(53, {delay:0})
    cy.get('.varReserveFuel > .p-inputtext').type(30, {delay:0})
    cy.get('.varCruiseGph > .p-inputtext').type(9, {delay:0})
    cy.get('[aria-label="Apply"]').click()

    // test locastorage is reflecting that list
    cy.getLocalStorage('template')
      .then(t => {
        const template = JSON.parse(t)
        // console.log('>>>>', template)
        expect(template.data.length).to.equal(2)
        // page 0 should be a checklist
        expect(template.data[0].type).to.equal('navlog')
        // checklist should have all items
        expect(template.data[0].data.entries.length).to.equal(expectedCheckpoints.length)
        expect(template.data[0].data.from).to.equal(expectedCheckpoints[0])
        expect(template.data[0].data.to).to.equal(expectedCheckpoints[expectedCheckpoints.length-1])
      })

    // Go back to edit mode
    cy.get('.title').click()

    // reset with altitudes
    cy.get('[aria-label="Reset Log"]').click()
    cy.get('.p-confirm-dialog-accept').click()



    // should be back into edit mode
    cy.get('.createAirportFrom > .p-inputgroup > .p-inputtext').should('have.value','')
    cy.get('.createAirportTo > .p-inputgroup > .p-inputtext').should('have.value','')

    // check there is a link to the video
    cy.get('.actionBarVideo')
  })

  it('7 altitudes', () => {
    visitSkipBanner()
    newTemplate()

    // set left page to Navlog
    cy.get('.page0 > .list > [aria-label="NavLog"]').click()
    // edit mode
    cy.get(':nth-child(1) > .headerTitle').click()

    // Create navlog with altitudes
    cy.get('.createAirportFrom > .p-inputgroup > .p-inputtext').type('KRNT', {delay:0})
    cy.get('.createAirportTo > .p-inputgroup > .p-inputtext').type('KSFF', {delay:0})
    cy.get('.createAltitudes > .p-inputtext').type("2500 2500 4500 4500 7500 7500 5500", {delay:0})
    cy.get('.createAirportFrom > .nameGroup').contains('Renton Muni')
    cy.get('.createAirportTo > .nameGroup').contains('Felts Fld')
    // Click create
    cy.get('.createButton > .p-button').click()

    // we should see Checkpoints and altitudes
    const expectedItems = [ {c:'KRNT',a:32},
      {c:'TOC 25',a:2500},
      {c:'ChkPt 1',a:2500},
      {c:'TOC 45',a:4500},
      {c:'ChkPt 3',a:4500},
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

    // Open checkpoint editor for first line
    cy.get(':nth-child(2) > .checkpointName').click()
    cy.get('.p-dialog-header').contains('Checkpoint Editor')
    cy.get('#name').should('have.value', 'KRNT')
    cy.get('#alt').should('have.value', '32')

    // change text and do not apply
    cy.get('#name').type('RRRR', {delay:0})
    cy.get('#alt').type('42', {delay:0})
    cy.get('.actionDialog > .p-button-link').click()
    // Reopen editor
    cy.get(':nth-child(2) > .checkpointName').click()
    // Values should be unchanged
    cy.get('.p-dialog-header').contains('Checkpoint Editor')
    cy.get('#name').should('have.value', 'KRNT')
    cy.get('#alt').should('have.value', '32')
    // Change values and apply
    replaceBy('#name', '0S9')
    cy.get('#alt').type('00', {delay:0}) // just add 00
    cy.get('.actionDialog > [aria-label="Apply"]').click()
    // Values should be updated
    cy.get('.checkpoint0 > .checkpointName').contains('0S9')
    cy.get('.checkpoint0 > .checkpointAlt').contains('3200')
    // change back to KRNT
    cy.get('.checkpoint0 > .checkpointName').click()
    replaceBy('#name', 'KRNT')
    replaceBy('#alt', '32')
    cy.get('.actionDialog > [aria-label="Apply"]').click()

    // Test calculator on first line
    cy.get('.leg0 > .magneticHeading').click()
    replaceBy('#calcMV', '-15')
    replaceBy('#calcMD', '2', {delay:0})
    const expectedResult = [
      {tc: 246, wd: 45, ws: 21, tas: 106, gs: 125, wca: 4, th: 250, mh: 237},
      {tc: 45, wd: 45, ws: 20, tas: 106, gs: 86, wca: 0, th: 45, mh: 32},
      {tc: 45, wd: 225, ws: 20, tas: 106, gs: 126, wca: 0, th: 45, mh: 32},
    ]
    for(const result of expectedResult) {
      replaceBy('#calcTC', result.tc)
      replaceBy('#calcWD', result.wd)
      replaceBy('#calcWS', result.ws)
      replaceBy('#calcTAS', result.tas)
      cy.get('#calcGS').contains(result.gs)
      cy.get('#calcWCA').contains(result.wca)
      cy.get('#calcTH').contains(result.th)
      cy.get('#calcMH').contains(result.mh)
      // hints should be updated too
      cy.get('#mhHint').contains(result.mh)
      cy.get('#gsHint').contains(result.gs)
    }
    // this line is a climb, we should have calculations for fuel and time
    cy.get('#lf').type('2.4-1.5', {delay:0})
    cy.get('#lfHint').contains('0.9')
    cy.get('#lt').type('7-3.25', {delay:0})
    cy.get('#ltHint').contains('3:45')

    // Do not apply
    cy.get('.actionDialog > [aria-label="Do Not Apply"]').click()

    // Update legs
    cy.get('.leg0 > .magneticHeading').click()
    cy.get('.between').contains('KRNT @ 32')
    cy.get('.between').contains('TOC 25 @ 2500')
    cy.get('.between').should('have.class','attClimb')

    cy.get('#mh').type('90', {delay:0})
    cy.get('#ld').type('1', {delay:0})
    cy.get('#gs').type('2', {delay:0})
    cy.get('#lt').type('3:15', {delay:0})
    cy.get('#lf').type('4', {delay:0})

    // check calculated values
    // MH updates for TC / MV / MD
    cy.get('.headingCourse').contains('True Course')
    replaceBy('#calcTC', '135')
    cy.get('#mhHint').contains('135')
    replaceBy('#calcMV','10')
    cy.get('#mhHint').contains('145')
    replaceBy('#calcMD','5')
    cy.get('#mhHint').contains('150')
    // Toggle Magnectic Course
    cy.get('.headingCourse').click()
    cy.get('.headingCourse').contains('Magnetic Course')
    cy.get('#calcMC').should('have.value','145')
    replaceBy('#calcMC','200')
    cy.get('#mhHint').contains('205')

    cy.get('.actionDialog > [aria-label="Apply"]').click()

    // first line should be updated
    cy.get('.leg0 > .magneticHeading').contains('90')
    cy.get('.leg0 > .legDistance').contains('1.0')
    cy.get('.leg0 > .groundSpeed').contains('2')
    cy.get('.leg0 > .legTime').contains('3:15')
    cy.get('.leg0 > .legFuel').contains('4')  

    // second leg is cruise, let's see if we have proper hints
    cy.get('.leg1 > .magneticHeading').click()
    cy.get('.p-dialog-header').contains('Navigation Leg')
    cy.get('.between').should('have.class','attCruise')

    replaceBy('#cruiseGPH', '9')
    // Magnetic heading hint and copy
    cy.get('#mhHint').contains('205')
    cy.get('#mhHint').click()
    cy.get('#mh').should('have.value', '205')
    // Add distance and ground speed
    cy.get('#ld').type('10', {delay:0})
    cy.get('#gs').type('105', {delay:0})
    // should deliver hints
    cy.get('#ltHint').contains('5:43')
    cy.get('#ltHint').click()
    cy.get('#lt').should('have.value', '5:43')
    cy.get('#lfHint').contains('0.9')
    cy.get('#lfHint').click()
    cy.get('#lf').should('have.value', '0.9')
    // Save yet
    cy.get('.actionDialog > [aria-label="Apply"]').click()

    // test descent hints
    cy.get('.leg6 > .magneticHeading').click()
    cy.get('.between').should('have.class','attDescent')
    replaceBy('#descentGPH', '6')
    replaceBy('#descentFPM','500')
    // should deliver hints
    cy.get('#ltHint').contains('4:00')
    cy.get('#ltHint').click()
    cy.get('#lt').should('have.value', '4:00')
    cy.get('#lfHint').contains('0.4')
    cy.get('#lfHint').click()
    cy.get('#lf').should('have.value', '0.4')
    // Do not save
    cy.get('.actionDialog > .p-button-link').click()

    // enter values for the other legs
    const legData = [
      // {index: 3, ld: '10', gs: '105', lt: '5:43', lf: '0.9'},
      {index: 2, ld: '9', gs: '10', lt: '11.75', lf: '12'},
      {index: 3, ld: '9', gs: '10', lt: '11.75', lf: '5'},
      {index: 4, ld: '9', gs: '10', lt: '11.75', lf: '5'},
      {index: 5, ld: '9', gs: '10', lt: '11.75', lf: '5'},
    ]
    for(const data of legData) {
      cy.get(`.leg${data.index} > .magneticHeading`).click()
      replaceBy('#ld', data.ld)
      cy.get('#gs').type(data.gs, {delay:0})
      cy.get('#lt').type(data.lt, {delay:0})
      cy.get('#lf').type(data.lf, {delay:0})
      cy.get('.actionDialog > [aria-label="Apply"]').click()
    }

    // test totals
    cy.get('.totalDistance').contains('47.0')
    cy.get('.totalTime').contains('55:58')
    cy.get('.totalFuel').contains('31.9')

    // Apply
    cy.wait(200)
    cy.get('[aria-label="Apply"]').click()
    expectToast('Bingo Fuel')

    // enter initial fuel, reserve and cruise values
    replaceBy('.varInitialFuel > .p-inputtext', '53')
    replaceBy('.varReserveFuel > .p-inputtext', '30')
    replaceBy('.varCruiseGph > .p-inputtext', '9')
    // and apply again
    cy.get('[aria-label="Apply"]').click()

    // Fuel reserve should pop
    const expectedLegs = 8;
    const expectedBingo = 5
    for(let leg=0; leg < expectedLegs; leg++) {
      const should = ( leg < expectedBingo ? 'not.have.class' : 'have.class')
      cy.get(`.leg${leg} > .fuel`).should(should, 'fuelBingo')
    }
    // Destination leg should be bingo
    cy.get('.destinationFuel > .fuelRecapAvailable').should('have.class','fuelRecapAvailableReserve')
    cy.get('.destinationFuel > .fuelRecapTime').should('have.class','fuelRecapAvailableReserve')
    // cy.get('.totalFuel').should('have.class', 'fuelBingo')

    // Test Footer
    testRecap('.page0', '53.0', '5:53:20', '31.9', '21.1', '2:20:40', '30.0', '3:20:00')
  })

  it( 'Continued Log', () => {
    visitSkipBanner()
    newTemplate()
    // set both pages to Navlog
    cy.get(`.page0 [aria-label="${pageNameNavlog}"]`).click()
    cy.get(`.page1 [aria-label="${pageNameNavlog}"]`).click()

    // configure page two as a continuer
    cy.get('.page1 .headerTitle').click()
    cy.get('.choiceInactive').click()
    cy.get('.continueHeader').contains('This page will show the overflow')
    cy.get('[aria-label="Apply"]').click()

    // Add entries to the first page
    cy.get('.page0 .headerTitle').click()
    cy.get('.createAirportFrom > .p-inputgroup > .p-inputtext').type('KRNT', {delay:0})
    cy.get('.createAirportTo > .p-inputgroup > .p-inputtext').type('KSFF', {delay:0})
    const altitudes = [...Array(4).fill(2500), ...Array(8).fill(4500), ...Array(7).fill(4500) , ...Array(4).fill(4500)]
    cy.get('.createAltitudes > .p-inputtext').type(altitudes.join(' '), {delay:0})
    cy.get('.createAirportFrom > .nameGroup').contains('Renton Muni')
    cy.get('.createAirportTo > .nameGroup').contains('Felts Fld')
    // Click create
    cy.get('.createButton > .p-button').click()
    // Enter variables
    cy.get('.varInitialFuel > .p-inputtext').type(51.6, {delay:0})
    cy.get('.varReserveFuel > .p-inputtext').type(13.5, {delay:0})
    cy.get('.varCruiseGph > .p-inputtext').type(9, {delay:0})
    // Every leg will consume 2 gallons
    for(let index = 2; index < altitudes.length + 3; index++) {
      cy.get(`:nth-child(${index}) > .legFuel`).click()
      cy.get('#ld').type('3', {delay:0})
      cy.get('#lf').type('2', {delay:0})
      cy.get('#lt').type('1', {delay:0})
      cy.get('.actionDialog > [aria-label="Apply"]').click()
    }

    // and create the log
    cy.wait(200)
    cy.get('[aria-label="Apply"]').click()

    // test totals
    cy.get('.legsFooterTruncated').contains('10 more legs')
    cy.get('.totalDistance').contains('72.0')
    cy.get('.totalTime').contains('24:00')
    cy.get('.totalFuel').contains('48.0')

    // check recaps
    testRecap( '.page0', '51.6', '5:44:00', '48', '3.6', '24:00', '13.5', '1:30:00')
    testRecap( '.page1', '51.6', '5:44:00', '48', '3.6', '24:00', '13.5', '1:30:00')

  })
})