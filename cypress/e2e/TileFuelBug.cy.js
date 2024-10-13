import { visitAndCloseBanner, newPage } from './shared'

describe('Fuel Bug Tile', () => {
  it('Fuel Bug Tile', () => {
    visitAndCloseBanner()

    cy.get('.page1 > :nth-child(4) > .headerTitle > div').contains('Fuel Bug')
    // switch to edits mode
    cy.get('.page1 > :nth-child(4) > .headerTitle > div').click()
        // check it has hint
    cy.get('.actionBarHelp')

  })

})