import { loadDemo, visitSkipBanner } from '../shared'

describe('Fuel Bug Tile', () => {
  it('Fuel Bug Tile', () => {
    visitSkipBanner()
    loadDemo('Tiles')

    cy.get('.page1 .tile3 > .headerTitle').contains('Fuel Bug')
    // switch to edits mode
    cy.get('.page1 .tile3 > .headerTitle').click()
        // check it has hint
    cy.get('.actionBarHelp')

  })

})