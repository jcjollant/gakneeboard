import { bellinghamTitle, boeingTitle, checkTestPageTileTitle, checkTileSpan, checkTileVisible, displaySelection, displaySelectionExpand, loadTestPage, PageTypeLabel, rentonTitle, viewport, waitForAirports, waitOneAirport, settingsOpen, mockUser } from '../shared'

const airportTilesData = [
  { name: 'airport', data: { code: "KRNT", rwy: "16-34", rwyOrientation: "vertical" } },
  { name: 'airport', data: { code: "KBFI", rwy: "14L-32R", rwyOrientation: "magnetic", corners: ["weather", "twr", "field", "tpa"] } },
  { name: 'airport', data: { code: "W39", rwy: "09-27" } },
  { name: 'airport', data: { code: "O26", rwy: "07-25" } },
  { name: 'atis', data: {} },
  { name: 'clearance', data: { mode: 'dep', airport: 'kbfi' } }
]

const kbliValues = { tile: bellinghamTitle, label0: 'ATIS', value0: '134.450', label1: 'TWR', value1: '124.900', label2: 'Elev', value2: '171', label3: 'GND', value3: '127.400', watermark: 'KBLI', dimensions: '6,700\'x150\'' }

function loadAirportTestPage() {
  loadTestPage(PageTypeLabel.tiles, airportTilesData)
}

function checkCorner(tile, corner, label, value) {
  cy.get(`.tile${tile} .tileContent ${corner} .label`).contains(label)
  cy.get(`.tile${tile} .tileContent ${corner} .value`).contains(value)
}

describe('Tiles', () => {
  it('Shows default fields in Sketch mode single runway', () => {
    const userMock = {
      sha256: "mock_sha256",
      name: "Test Pilot",
      accountType: "ld",
      eulaCurrent: true,
      templates: []
    }
    mockUser(userMock)

    cy.intercept('GET', '**/notams/**', [
      { id: '1', text: 'NOTAM 1' },
      { id: '2', text: 'NOTAM 2' }
    ]).as('getNotams')
    loadAirportTestPage()
    // maintenanceMode()

    waitForAirports()
    cy.wait('@getNotams')
    cy.get('.notam-badge').should('contain', '2')

    // Renton and Boeing fields
    const expectedValues = [
      { tile: rentonTitle, label0: 'ATIS', value0: '126.950', label1: 'TWR', 'value1': '124.700', label2: 'Elev', 'value2': '32', label3: 'GND', value3: '121.600', watermark: 'KRNT', dimensions: '5,382\'x200\'' },
      { tile: boeingTitle, label0: 'ATIS', value0: '127.750', label1: 'TWR', 'value1': '118.300', label2: 'Elev', 'value2': '22', label3: 'TPA', value3: '1022', watermark: 'KBFI', dimensions: '3,709\'x100\'' },
    ]
    expectedValues.forEach((value, index) => {
      checkTestPageTileTitle(index, value.tile)
      cy.get(`.tile${index} .tileContent .top.left > .clickable`)
      checkCorner(index, '.top.left', value.label0, value.value0)

      cy.get(`.tile${index} .tileContent .top.right > .clickable`)
      checkCorner(index, '.top.right', value.label1, value.value1)

      cy.get(`.tile${index} .tileContent .bottom.left > .clickable`)
      checkCorner(index, '.bottom.left', value.label2, value.value2)

      cy.get(`.tile${index} .tileContent .bottom.right > .clickable`)
      checkCorner(index, '.bottom.right', value.label3, value.value3)

      cy.get(`.tile${index} .tileContent .container .label`).contains(value.dimensions)
      cy.get(`.tile${index} .airportCode`).contains(value.watermark)

    })

    // Enter a new airport code and check it's data is loading
    settingsOpen(2)

    cy.intercept({
      method: 'GET',
      url: '**/airport/**',
    }).as('getOneAirport');

    cy.wait(200)
    cy.get('.p-inputtext').clear().type('KBLI')
    // wait for the reply
    cy.wait('@getOneAirport').then(interception => {
      expect(interception.response.statusCode == 200 || interception.response.statusCode == 304).to.be.true
    })

    cy.get('[aria-label="Apply"]').click()

    // Check for bellingham fields
    checkTestPageTileTitle(2, kbliValues.tile)
    checkCorner(2, '.top.left', kbliValues.label0, kbliValues.value0)
    checkCorner(2, '.top.right', kbliValues.label1, kbliValues.value1)
    checkCorner(2, '.bottom.left', kbliValues.label2, kbliValues.value2)
    checkCorner(2, '.bottom.right', kbliValues.label3, kbliValues.value3)
    cy.get(`.tile2 .tileContent .container .label`).contains(kbliValues.dimensions)

    // Replace tile with Notes
    cy.get('.tile2 .headerTitle > .replaceButton').click({ force: true })
    cy.get('[aria-label="Notes"]').click()
    cy.get('.tile2 .headerTitle > div').contains('Notes')

    // Change tile back to Airport
    cy.get('.tile2 .headerTitle > .replaceButton').click({ force: true })
    cy.get('[aria-label="Airport"]').click()
  })


})
