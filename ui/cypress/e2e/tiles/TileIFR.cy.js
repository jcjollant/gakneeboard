import { approachTitle, TileTypeLabel, loadTestTile, displayModesCheck, displaySelectionTestTile, loadTestTileWithData, checkImageContentTestTile, loadTestPage, PageTypeLabel, settingsOpen } from '../shared.js'


const titleCraftClearance = "IFR CRAFT Clearance"
const titleDisplayMode = "IFR Tile Mode"

const IfrTileDisplayModeLabels = {
    craft: 'CRAFT',
    departure: 'Departure',
    appraoch: 'Approach',
    alternate: 'Alternate',
    lostComms: 'Lost Comms',
}

const labelCraftClearance = IfrTileDisplayModeLabels.craft
const labelApproach = IfrTileDisplayModeLabels.appraoch
const labelDeparture = IfrTileDisplayModeLabels.departure
const labelAlternate = IfrTileDisplayModeLabels.alternate
const labelLostComms = IfrTileDisplayModeLabels.lostComms
// const labelHold = "Hold"

const expectedDepartureFields = [
    // {class:'.boxGround', label:'Ground'},
    { class: '.boxFiled', label: 'Filed' },
    { class: '.boxRoute', label: 'Cleared to' },
    { class: '.boxRoute .topRight', label: 'AF' },
    { class: '.boxRoute .bottomRight', label: 'D' },
    { class: '.boxAltitudes', label: 'Alt/Exp' },
    { class: '.boxAltitudes .topRight', label: 'SID' },
    { class: '.boxAltitudes .bottomRight', label: '+5/10' },
    { class: '.boxFrequency', label: 'Freq' },
    { class: '.boxTransponder', label: 'XPDR' },
    { class: '.boxTaxi', label: 'Taxi' },
]

const expectedDepartureManual = [
    { class: '.atis', label: 'Weather Freq' },
    { class: '.atc', label: 'Clear. Freq' },
    { class: '.gnd', label: 'Ground Freq' },
    { class: '.twr', label: 'Tower' },
]

describe('Tile IFR', () => {
    // all tests should call visitSkipBanner()

    let dataDepartureWithAirport
    let dataDepartureNoAirport
    let dataCraftClearance
    let dataApproach
    let dataAlternate
    let dataLostComms

    before(() => {
        cy.fixture('ifrTileDepartureKBFI').then(data => dataDepartureWithAirport = data)
        cy.fixture('ifrTileDepartureNoAirport').then(data => dataDepartureNoAirport = data)
        cy.fixture('ifrTileCraftClearance').then(data => dataCraftClearance = data)
        cy.fixture('ifrTileApproach').then(data => dataApproach = data)
        cy.fixture('ifrTileAlternate').then(data => dataAlternate = data)
        cy.fixture('ifrTileLostComms').then(data => dataLostComms = data)
    })

    it('Should Start with CRAFT Mode', () => {
        loadTestTile(TileTypeLabel.IFR)
        cy.get('.headerTitle').contains(titleCraftClearance)
    })

    it('Departure no airport', () => {
        loadTestTileWithData(dataDepartureNoAirport)
        cy.get('.headerTitle').contains('IFR Departure')

        // Pre-selected fields
        for (const field of expectedDepartureManual) {
            cy.get(`${field.class}`).contains(field.label)
        }

        // expected regular fields
        for (const field of expectedDepartureFields) {
            cy.get(`${field.class}`).contains(field.label)
        }

    })

    it('Depart w/ Airport', () => {
        loadTestTileWithData(dataDepartureWithAirport)
        cy.get('.headerTitle').contains('Depart KBFI IFR')

        const expectedPreselected = [
            { class: '.preWeather', label: 'ATIS' },
            { class: '.preAtc', label: 'Clearance' },
            { class: '.preGround', label: 'Ground' },
            { class: '.preTower', label: 'Tower' },
        ]
        // Pre-selected fields
        for (const field of expectedPreselected) {
            cy.get(`${field.class}`).contains(field.label)
        }

        // regular fields
        for (const field of expectedDepartureFields) {
            cy.get(`${field.class}`).contains(field.label)
        }

    })


    it('Has CRAFT Clearance content', () => {
        loadTestTileWithData(dataCraftClearance)
        // Header
        cy.get('.headerTitle').contains(titleCraftClearance)

        // check defaults to Craft mode
        cy.get('.clearance')

        // Check mode change via settings
        const expectedFields = [
            { class: '.boxCleared', label: 'To' },
            { class: '.boxCleared > .watermrk', label: 'C' },
            { class: '.boxRouteV', label: 'Route / Notes' },
            { class: '.boxRouteV > .watermrk', label: 'R' },
            { class: '.boxAltitudeV', label: 'Altitude' },
            { class: '.boxAltitudeV > .watermrk', label: 'A' },
            { class: '.boxFrequencyV', label: 'Freq.' },
            { class: '.boxFrequencyV > .watermrk', label: 'F' },
            { class: '.boxTransponder', label: 'Xpdr' },
            { class: '.boxTransponder > .watermrk', label: 'T' },
        ]

        for (const field of expectedFields) {
            cy.get(`${field.class}`).contains(field.label)
        }
    })

    it('Approach', () => {
        loadTestTileWithData(dataApproach)

        // test tile title updated
        cy.get('.headerTitle').contains(approachTitle)

        // check Fields
        const expectedILSFields = ['CRS', 'ILOC', 'CRS', 'IAF', 'Minimum', 'Missed']
        for (const field of expectedILSFields) {
            cy.get(`.tile`).contains(field)
        }
    })

    it('Has correct Alternate content', () => {
        loadTestTileWithData(dataAlternate)
        checkImageContentTestTile('/tiles/alternate.png')
    })

    it('Has correct Lost Comms content', () => {
        loadTestTileWithData(dataLostComms)
        checkImageContentTestTile('/tiles/lostcomms-ifr.png')
    })

    it('Settings - Conditional Airport Input', () => {
        const data = [{ name: 'clearance', data: { mode: 'craft' } }]
        loadTestPage(PageTypeLabel.tiles, data)

        settingsOpen(0)

        // CRAFT mode (default) - Airport Input should NOT exist
        cy.get('.airportCode').should('not.exist')

        // Switch to Departure - Airport Input SHOULD exist
        cy.get('.oneChoice').contains(labelDeparture).click()
        cy.get('.airportCode').should('exist')

        // Switch to Approach - Airport Input SHOULD exist
        cy.get('.oneChoice').contains(labelApproach).click()
        cy.get('.airportCode').should('exist')

        // Switch to Alternate - Airport Input should NOT exist
        cy.get('.oneChoice').contains(labelAlternate).click()
        cy.get('.airportCode').should('not.exist')

        // Switch to Lost Comms - Airport Input should NOT exist
        cy.get('.oneChoice').contains(labelLostComms).click()
        cy.get('.airportCode').should('not.exist')

        // Back to Departure to confirm it reappears
        cy.get('.oneChoice').contains(labelDeparture).click()
        cy.get('.airportCode').should('exist')
    })
})
