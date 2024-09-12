import { visitAndCloseBanner, newPage } from './shared'

describe('Cover Page', () => {
  it('Basic flow', () => {
    visitAndCloseBanner()
    newPage()
    // set left page to cover
    cy.get('.pageOne > .list > [aria-label="Tiles"]').click()

    const expectedTiles = ['Airport', 'ATIS', 'Checklist', 'Clearance', 'Fuel', 'Navlog', 'Notes', 'Radios', 'Sunlight']
    for(let tileIndex = 1; tileIndex <= 6; tileIndex++) {
      for(const tile of expectedTiles) {
        cy.get(`:nth-child(${tileIndex}) > .content > [aria-label="${tile}"]`)
      }
    }
  })
})