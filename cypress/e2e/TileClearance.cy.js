import { clearanceTitle, visitSkipBanner, loadDemo, holdTitle, approachTitle, departureTitle } from './shared'


const labelCraftClearance = "CRAFT Clearance"
const labelApproach = "Approach"
const labelDeparture = "Departure"
const labelHold = "Hold"

describe('Clearance Tile', () => {
  it('Clearance Tile', () => {
    visitSkipBanner()
    loadDemo('Tiles')
    // Header
    cy.get('.page0 .tile5 > .headerTitle').contains(clearanceTitle)

    // check defaults to CRAFT mode
    cy.get('.clearance')

    // Check settings has 4 modes
    cy.get('.page0 .tile5 > .headerTitle').click()
    const expectedDisplayModes = [ labelCraftClearance, labelApproach, labelDeparture, labelHold]
    for(const displayMode of expectedDisplayModes) {
      cy.get('.modesList').contains(displayMode)
    }

    // Display modes should cycle
    cy.get(`[aria-label="${labelCraftClearance}"]`).click()
    cy.get('.clearance').click()
    cy.get('.approach').click()
    cy.get('.departure').click()
    cy.get('.hold').click()
    cy.get('.clearance')

  })

  it('CRAFT Clearance', () => {
    visitSkipBanner()
    loadDemo()
    cy.get('.page0 > .tile5 > .headerTitle').click()

    // switch to CRAFT
    cy.get(`[aria-label="${labelCraftClearance}"]`).click()
    // test tile title updated
    cy.get('.page0 > .tile5 > .headerTitle').contains(clearanceTitle)

    // Check mode change via settings
    cy.get('.boxCleared').contains('To')
    cy.get('.boxCleared > .watermrk').contains('C')
    cy.get('.boxRouteV').contains('Route')
    cy.get('.boxRouteV > .watermrk').contains('R')
    cy.get('.boxAltitudeV').contains("Altitude")
    cy.get('.boxAltitudeV > .watermrk').contains('A')
    cy.get('.boxFrequencyV').contains('Freq.')
    cy.get('.boxFrequencyV > .watermrk').contains('F')
    cy.get('.boxTransponder').contains('Xpdr')
    cy.get('.boxTransponder > .watermrk').contains('T')


    // test localstore has the correct data
    cy.getLocalStorage('template')
      .then(t => {
        const template = JSON.parse(t)
        // console.log('>>>>', template)
        expect(template.data[0].data[5].data['mode']).to.equal('boxV')
      })
  })

  it('Approach', () => {
    visitSkipBanner()
    loadDemo()
    cy.get('.page0 > .tile5 > .headerTitle').click()

    // switch to Approach
    cy.get(`[aria-label="${labelApproach}"]`).click()
    // test tile title updated
    cy.get('.page0 > .tile5 > .headerTitle').contains(approachTitle)

    // check Fields
    const expectedILSFields = ['APCH/RWY', 'CRS', 'ILOC', 'ATIS', 'ATC', 'TWR/CTAF', 'Fixes', 'Min.', 'Missed']
    for(const field of expectedILSFields) {
      cy.get(`.page0 .tile5`).contains(field)
    }

    // test localstore has the correct data
    cy.getLocalStorage('template')
      .then(t => {
        const template = JSON.parse(t)
        // console.log('>>>>', template)
        expect(template.data[0].data[5].data['mode']).to.equal('apch')
      })
  })

  it('Departure', () => {
    visitSkipBanner()
    loadDemo()
    cy.get('.page0 > .tile5 > .headerTitle').click()

    // switch to ILS
    cy.get(`[aria-label="${labelDeparture}"]`).click()
    // test tile title updated
    cy.get('.page0 > .tile5 > .headerTitle').contains(departureTitle)

    // Check fields
    cy.get('.boxAtis').contains('Atis')
    cy.get('.boxClearance').contains('Clearance')
    cy.get('.boxTower').contains("Twr")
    cy.get('.boxInfo').contains('Info')
    cy.get('.boxWind').contains('Wind')
    cy.get('.boxAltimeterSetting').contains('Altimeter')
    cy.get('.boxRunway').contains('Rwy')
    cy.get('.boxClearedTo').contains('To')
    cy.get('.boxRoute').contains('Route')
    cy.get('.boxAltitudes').contains('Alt/Exp')
    cy.get('.boxFrequency').contains('Freq')
    cy.get('.boxTransponder').contains('XPDR')
    cy.get('.boxClearedTo > .watermrk').contains('C')
    cy.get('.boxRoute > .watermrk').contains('R')
    cy.get('.boxAltitudes > .watermrk').contains('A')
    cy.get('.boxFrequency > .watermrk').contains('F')
    cy.get('.boxTransponder > .watermrk').contains('T')


    // test localstore has the correct data
    cy.getLocalStorage('template')
      .then(t => {
        const template = JSON.parse(t)
        // console.log('>>>>', template)
        expect(template.data[0].data[5].data['mode']).to.equal('dep')
      })

  })

  it('Holding', () => {
    visitSkipBanner()
    loadDemo()
    cy.get('.page0 > .tile5 > .headerTitle').click()

    // switch to HOLDING
    cy.get(`[aria-label="${labelHold}"]`).click()
    // test tile title updated
    cy.get('.page0 > .tile5 > .headerTitle').contains(holdTitle)

    // check Fields
    const expectedHoldFields = ['Established', 'RAD/CRS', 'EFC', 'CRS', 'WCA', 'HDG']
    for(const field of expectedHoldFields) {
      cy.get(`.page0 .tile5`).contains(field)
    }

    // test localstore has the correct data
    cy.getLocalStorage('template')
      .then(t => {
        const template = JSON.parse(t)
        // console.log('>>>>', template)
        expect(template.data[0].data[5].data['mode']).to.equal('hold')
      })

  })


})