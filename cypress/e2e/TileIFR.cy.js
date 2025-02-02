import { clearanceTitle, departTitle, visitSkipBanner, loadDemo, holdTitle, approachTitle, departureTitle, displaySelection } from './shared'


const labelCraftClearance = "CRAFT Clearance"
const labelApproach = "Approach"
const labelDeparture = "Departure"
const labelHold = "Hold"

describe('IFR Tile', () => {
  it('IFR Tile', () => {
    visitSkipBanner()
    loadDemo('Tiles')
    // Header
    cy.get('.page0 .tile5 > .headerTitle').contains(departTitle)

    // check defaults to Departure mode
    cy.get('.departure')

    // Check display selection has 4 display modes
    displaySelection(0, 5)
    const expectedDisplayModes = [ labelCraftClearance, labelApproach, labelDeparture, labelHold]
    for(const displayMode of expectedDisplayModes) {
      cy.get('.modesList').contains(displayMode)
    }

  })

  it('CRAFT Clearance', () => {
    visitSkipBanner()
    loadDemo()

    // switch to CRAFT
    displaySelection(0,5,labelCraftClearance)
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
    displaySelection(0,5,labelApproach)
    // test tile title updated
    cy.get('.page0 > .tile5 > .headerTitle').contains(approachTitle)

    // check Fields
    const expectedILSFields = ['CRS', 'ILOC', 'CRS', 'IAF', 'Minimum', 'Missed']
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

    // switch to Departure
    displaySelection(0,5,labelDeparture)
    // test tile title updated
    cy.get('.page0 > .tile5 > .headerTitle').contains(departureTitle)

    // Pre-selected fields
    const expectedPreselected = [
      {class:'.preWeather', label:'Weather'},
      {class:'.preAtc', label:'Clearance'},
      {class:'.preGround', label:'Ground'},
      {class:'.preTower', label:'Tower'},
    ]
    for(const field of expectedPreselected) {
      cy.get(`${field.class}`).contains(field.label)
      cy.get(`${field.class}`).should('have.class','airportFreq')
    }

    // Check Other fields
    const expected = [
      // {class:'.boxGround', label:'Ground'},
      {class:'.boxRoute', label:'Route'},
      {class:'.boxAltitudes', label:'Alt/Exp'},
      {class:'.boxFrequency', label:'Freq'},
      {class:'.boxTransponder', label:'XPDR'},
      {class:'.boxTaxi', label:'Taxi'},
      {class:'.boxNotes', label:'Notes'},
    ]
    for(const field of expected) {
      cy.get(`${field.class}`).contains(field.label)
    }

    // Check watermarks
    const expectedWatermarks = [
      {class:'.boxRoute', label:'R'},
      {class:'.boxAltitudes', label:'A'},
      {class:'.boxFrequency', label:'F'},
      {class:'.boxTransponder', label:'T'},
    ]
    for(const field of expectedWatermarks) {
      cy.get(`${field.class} > .watermrk`).contains(field.label)
    }

    // click inside the tile should switch to editmode
    cy.get('.page0 > .tile5').click()
    cy.get('.editMode')
    cy.get('.page0 > .tile5').contains('Manual')
    cy.get('.page0 > .tile5').contains('Cancel')


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

    // switch to HOLDING
    displaySelection(0,5,labelHold)
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