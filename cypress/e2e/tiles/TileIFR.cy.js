import { visitSkipBanner, holdTitle, newTemplateWithTile, approachTitle, departureTitle, displaySelection, TileTypeLabel, checkImageContent } from '../shared'


const titleCraftClearance = "IFR Clearance"
const labelCraftClearance = "CRAFT Clearance"
const labelApproach = "Approach"
const labelDeparture = "Departure"
const labelAlternate = "Alternate"
const labelLostComms = "Lost Comms"
// const labelHold = "Hold"

describe('Tile IFR', () => {
  // all tests should call visitSkipBanner()
  beforeEach(() => {
    visitSkipBanner()
    newTemplateWithTile(TileTypeLabel.IFR)
  })


  it('Has 5 display mode', () => {
    // when you click the current mode, it comes back to clearance
    displaySelection(0, 0, labelCraftClearance)
    cy.get('.clearance')

    // Check display selection has 4 display modes
    displaySelection(0, 0)
    const expectedDisplayModes = [ labelCraftClearance, labelApproach, labelDeparture, labelAlternate, labelLostComms]
    for(const displayMode of expectedDisplayModes) {
      cy.get('.modesList').contains(displayMode)
    }

  })

  it('CRAFT Clearance', () => {
    // Header
    cy.get('.page0 .tile0 > .headerTitle').contains(titleCraftClearance)

    // check defaults to Craft mode
    cy.get('.clearance')

    // Check mode change via settings
    cy.get('.boxCleared').contains('To')
    cy.get('.boxCleared > .watermrk').contains('C')
    cy.get('.boxRouteV').contains('Route / Notes')
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
        // default to undefined because it's the default mode
        expect(template.data[0].data[0].data['mode']).to.equal(undefined)
      })
  })

  it.only('Departure no airport', () => {
    // switch to Departure
    displaySelection(0,0,labelDeparture)

    // test tile title updated
    cy.get('.page0 > .tile0 > .headerTitle').contains(departureTitle)

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

    // click inside the tile should switch to editmode
    cy.get('.page0 > .tile0').click()
    cy.get('.editMode')
    cy.get('.page0 > .tile0').contains('Manual')
    cy.get('.page0 > .tile0').contains('Cancel')

    // Select Airport
    cy.get('.p-inputtext').type('KBFI')
    cy.get('.page0 > .tile0 > .headerTitle').contains('KBFI')

    // Pre-selected fields
    const expectedPreselected = [
      {class:'.preWeather', label:'Weather'},
      {class:'.preAtc', label:'Clearance'},
      {class:'.preGround', label:'Ground'},
      {class:'.preTower', label:'Tower'},
    ]
    for(const field of expectedPreselected) {
      cy.get(`${field.class}`).contains(field.label)
    }

    // Edit mode then manual
    cy.get('.page0 > .tile0').click()
    cy.get('.editMode')
    cy.get('.page0 > .tile0 [aria-label="Manual"]').click()
    // preWeather shold be gone
    cy.get('.preWeather').should('not.exist')


    // test localstore has the correct data
    cy.getLocalStorage('template')
      .then(t => {
        const template = JSON.parse(t)
        // console.log('>>>>', template)
        expect(template.data[0].data[0].data['mode']).to.equal('dep')
      })

  })

  it('Approach', () => {
    // switch to Approach
    displaySelection(0,0,labelApproach)

    // test tile title updated
    cy.get('.page0 > .tile0 > .headerTitle').contains(approachTitle)

    // check Fields
    const expectedILSFields = ['CRS', 'ILOC', 'CRS', 'IAF', 'Minimum', 'Missed']
    for(const field of expectedILSFields) {
      cy.get(`.page0 .tile0`).contains(field)
    }

    // test localstore has the correct data
    cy.getLocalStorage('template')
      .then(t => {
        const template = JSON.parse(t)
        // console.log('>>>>', template)
        expect(template.data[0].data[0].data['mode']).to.equal('apch')
      })
  })

  it('Alternate', () => {
    // switch to Approach
    displaySelection(0,0,labelAlternate)
    checkImageContent('/tiles/altnernate.png')
  })

  it('Lost Comms', () => {
    // switch to Approach
    displaySelection(0,0,labelLostComms)
    checkImageContent('/tiles/lostcomms-ifr.png')
  })

  it.skip('Holding', () => {

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