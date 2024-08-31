import { visitAndCloseBanner, newPage } from './shared'

describe('Fuel Bug Tile', () => {
  it('Fuel Bug Tile', () => {
    visitAndCloseBanner()

    cy.get('.pageTwo > :nth-child(4) > .headerTitle > div').contains('Fuel Bug')
    // switch to edits mode
    cy.get('.pageTwo > :nth-child(4) > .headerTitle > div').click()
        // check it has hint
    cy.get('.actionBar > .p-button-icon-only')

  })

})