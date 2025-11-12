import { lostCommsTitle } from "../../shared"

describe('Radio Tile 15 Frequencies Test', () => {
  let tileData, frequencies

  before(() => {
    cy.fixture('radioTileVFRLostComms').then(data => tileData = data)
  })

  it('Lost Comms', () => {
    const radioTileDataString = JSON.stringify(tileData)
    // console.debug(radioTileDataString)
    cy.setLocalStorage('test-tile', radioTileDataString)
    cy.visit('/?test=tile')

    // test tile title updated
    cy.get('.headerTitle').contains(lostCommsTitle)

    // check Nordo Fields
    cy.get('[title="Unlawful Interference (aka Hijack)"]')
    cy.get('[title="Lost Communications"]')
    cy.get('[title="Declare Emergency"]')

    const expectedLostCommsFields = ['Signal', 'Ground', 'Air', 'T/O', 'Land', 'Taxi', 'STOP', 'Give Way', 'Taxi Off Rwy', 'Use Extreme Caution', 'Start', '7500', '7600', '7700']
    for(const field of expectedLostCommsFields) {
      cy.get(`.tile`).contains(field)
    }
  })
})